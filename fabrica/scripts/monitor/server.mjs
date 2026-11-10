// Monitor local de la fábrica: refleja lo que muestra /workflows leyendo los transcripts
// de los subagentes (~/.claude/projects/<proyecto>/<sesión>/subagents/workflows/wf_*).
// Solo lee: no escribe en el repo ni en los transcripts. Uso: node server.mjs  →  http://localhost:4747
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { StringDecoder } from 'node:string_decoder'
import { puertos } from '../lib/repo.mjs'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
// Mira las corridas de la copia del repo desde la que se arranca (o REPO): los transcripts de esa
// carpeta en la configuración de la cuenta (CLAUDE_CONFIG_DIR si la cambia).
const REPO = process.env.REPO || path.resolve(AQUI, '..', '..', '..')
const PUERTO = Number(process.env.PUERTO) || puertos().monitor
const CONFIG_CLAUDE = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude')
const PROYECTO = path.join(CONFIG_CLAUDE, 'projects', REPO.replace(/[^A-Za-z0-9]/g, '-'))
const MAX_CORRIDAS = 12

// ---------- corridas ----------

function listarCorridas(limite = MAX_CORRIDAS) {
  const corridas = []
  let sesiones = []
  try { sesiones = fs.readdirSync(PROYECTO, { withFileTypes: true }).filter((d) => d.isDirectory()) } catch { return [] }
  for (const s of sesiones) {
    const base = path.join(PROYECTO, s.name, 'subagents', 'workflows')
    let wfs = []
    try { wfs = fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name.startsWith('wf_')) } catch { continue }
    for (const w of wfs) {
      const dir = path.join(base, w.name)
      let mtime = 0
      try { for (const f of fs.readdirSync(dir)) mtime = Math.max(mtime, fs.statSync(path.join(dir, f)).mtimeMs) } catch {}
      corridas.push({ id: w.name, sesion: s.name, dir, mtime })
    }
  }
  return corridas.sort((a, b) => b.mtime - a.mtime).slice(0, limite)
}

// ---------- lectura incremental de jsonl ----------

const cache = new Map() // archivo → { pos, resto, decoder, datos }

function leerNuevo(archivo, crear, alLinea) {
  let st
  try { st = fs.statSync(archivo) } catch { return null }
  let c = cache.get(archivo)
  if (!c || st.size < c.pos) {
    c = { pos: 0, resto: '', decoder: new StringDecoder('utf8'), datos: crear() }
    cache.set(archivo, c)
  }
  if (st.size > c.pos) {
    const fd = fs.openSync(archivo, 'r')
    const buf = Buffer.alloc(st.size - c.pos)
    fs.readSync(fd, buf, 0, buf.length, c.pos)
    fs.closeSync(fd)
    c.pos = st.size
    const lineas = (c.resto + c.decoder.write(buf)).split('\n')
    c.resto = lineas.pop()
    for (const l of lineas) {
      if (!l.trim()) continue
      try { alLinea(JSON.parse(l), c.datos) } catch {}
    }
  }
  return c.datos
}

// ---------- transcript de un agente ----------

// Las rutas se muestran relativas a la raíz del repo (o de un worktree suyo).
const RAIZ_REPO = REPO.replace(/\\/g, '/').toLowerCase().replace(/\/?$/, '/')
const relativo = (p) => {
  const s = String(p ?? '').replace(/\\/g, '/')
  const i = s.toLowerCase().indexOf(RAIZ_REPO)
  return i >= 0 ? s.slice(i + RAIZ_REPO.length).replace(/^\.claude\/worktrees\/[^/]+\//, '') : s
}

function resumirEntrada(nombre, e = {}) {
  if (nombre === 'Bash' || nombre === 'PowerShell') return e.description || String(e.command ?? '').slice(0, 160)
  if (['Read', 'Write', 'Edit', 'NotebookEdit'].includes(nombre)) return relativo(e.file_path || e.notebook_path)
  if (nombre === 'Grep') return `${e.pattern ?? ''}${e.path ? ' · ' + relativo(e.path) : ''}`
  if (nombre === 'Glob') return e.pattern ?? ''
  if (nombre === 'Skill') return e.skill ?? ''
  if (nombre === 'Monitor') return e.description || e.until || ''
  if (nombre.startsWith('mcp__')) return JSON.stringify(e).slice(0, 160)
  return JSON.stringify(e).slice(0, 160)
}

const textoDe = (contenido) =>
  typeof contenido === 'string' ? contenido
    : Array.isArray(contenido) ? contenido.map((c) => c.text ?? '').join(' ')
      : JSON.stringify(contenido ?? '')

const agenteVacio = () => ({
  inicio: null, ultima: null, modelo: null, esfuerzo: null,
  mensajes: new Map(), herramientas: 0, errores: 0,
  actividad: [], usos: new Map(), bloqueos: [], texto: null, tarea: null,
  porMinuto: new Map(), // 'YYYY-MM-DDTHH:MM' (UTC) → usos de herramientas en ese minuto
})

function alLineaAgente(l, a) {
  if (l.timestamp) { a.inicio ??= l.timestamp; a.ultima = l.timestamp }
  const m = l.message
  if (!a.tarea && l.type === 'user' && typeof m?.content === 'string') {
    const t = m.content.match(/proyecto\/tareas\/(T\d+[A-Z]?)/) || m.content.match(/buzon\/(T\d+[A-Z]?)/)
    if (t) a.tarea = t[1]
  }
  if (l.type === 'assistant' && m) {
    a.modelo = m.model ?? a.modelo
    a.esfuerzo = l.effort ?? a.esfuerzo
    if (m.usage && m.id) {
      const u = m.usage, prev = a.mensajes.get(m.id) ?? {}
      a.mensajes.set(m.id, {
        entrada: Math.max(prev.entrada ?? 0, u.input_tokens ?? 0),
        cacheCreacion: Math.max(prev.cacheCreacion ?? 0, u.cache_creation_input_tokens ?? 0),
        cacheLectura: Math.max(prev.cacheLectura ?? 0, u.cache_read_input_tokens ?? 0),
        salida: Math.max(prev.salida ?? 0, u.output_tokens ?? 0),
      })
    }
    for (const c of m.content ?? []) {
      if (c.type === 'tool_use') {
        a.herramientas++
        const minuto = l.timestamp?.slice(0, 16)
        if (minuto) a.porMinuto.set(minuto, (a.porMinuto.get(minuto) ?? 0) + 1)
        const uso ={ t: l.timestamp, herramienta: c.name, detalle: resumirEntrada(c.name, c.input), estado: 'corriendo', tope: c.input?.timeout ?? null }
        a.usos.set(c.id, uso)
        a.actividad.push(uso)
        if (a.actividad.length > 60) a.actividad.shift()
      } else if (c.type === 'text' && c.text?.trim()) {
        a.texto = { t: l.timestamp, texto: c.text.trim() }
      }
    }
  }
  if (l.type === 'user' && Array.isArray(m?.content)) {
    for (const c of m.content) {
      if (c.type !== 'tool_result') continue
      const uso = a.usos.get(c.tool_use_id)
      if (uso) uso.estado = c.is_error ? 'error' : 'ok'
      if (!c.is_error) continue
      a.errores++
      const texto = textoDe(c.content)
      if (/hook|Bloqueado por la f[aá]brica|tool_use_error>Blocked/i.test(texto)) {
        if (uso) uso.estado = 'bloqueo'
        a.bloqueos.push({ t: l.timestamp, herramienta: uso?.herramienta, detalle: uso?.detalle, motivo: texto.slice(0, 500) })
        if (a.bloqueos.length > 40) a.bloqueos.shift()
      }
    }
  }
}

function fotoAgente(a) {
  const tokens = { entrada: 0, cacheCreacion: 0, cacheLectura: 0, salida: 0 }
  for (const u of a.mensajes.values()) for (const k in tokens) tokens[k] += u[k]
  return {
    inicio: a.inicio, ultima: a.ultima, modelo: a.modelo, esfuerzo: a.esfuerzo,
    turnos: a.mensajes.size, herramientas: a.herramientas, errores: a.errores,
    tokens, bloqueos: a.bloqueos, texto: a.texto, tarea: a.tarea,
    actividad: a.actividad.slice(-25).reverse(),
    porMinuto: [...a.porMinuto],
  }
}

// ---------- journal de la corrida ----------

const journalVacio = () => ({ lanzada: false, agentes: [], porId: new Map(), eventos: [] })

function alLineaJournal(l, j) {
  if (l.type === 'launched') j.lanzada = true
  else if (l.type === 'started') {
    const ag = { agentId: l.agentId, etiqueta: l.label, fase: l.phase, resultado: null, terminado: false }
    j.agentes.push(ag)
    j.porId.set(l.agentId, ag)
  } else if (l.type === 'result') {
    let ag = j.porId.get(l.agentId)
    if (!ag) { ag = { agentId: l.agentId, etiqueta: '(en caché)', fase: '', resultado: null }; j.agentes.push(ag); j.porId.set(l.agentId, ag) }
    ag.resultado = l.result
    ag.terminado = true
  } else {
    j.eventos.push(l)
  }
}

const INACTIVA_MS = 6 * 60 * 1000

function estadoCorrida(c) {
  const j = leerNuevo(path.join(c.dir, 'journal.jsonl'), journalVacio, alLineaJournal) ?? journalVacio()
  const agentes = j.agentes.map((ag) => {
    const datos = leerNuevo(path.join(c.dir, `agent-${ag.agentId}.jsonl`), agenteVacio, alLineaAgente)
    const foto = datos ? fotoAgente(datos) : null
    const quieto = foto?.ultima ? Date.now() - Date.parse(foto.ultima) : Infinity
    // Una herramienta sin resultado (p. ej. las compuertas, que tardan) no escribe nada en el transcript
    // mientras corre: eso es esperar, no estar quieto, hasta que pase su tope (o 30 min si no tiene).
    const ultimo = datos?.actividad.at(-1)
    const espera = ultimo?.estado === 'corriendo' ? Date.now() - Date.parse(ultimo.t) : null
    const esperando = espera != null && espera < (ultimo.tope ?? 30 * 60 * 1000) + 60 * 1000
    const estado = ag.terminado ? 'terminó' : esperando ? 'esperando herramienta' : quieto < INACTIVA_MS ? 'trabajando' : 'sin actividad'
    return {
      agentId: ag.agentId, etiqueta: ag.etiqueta, fase: ag.fase, estado, resultado: ag.resultado, ...foto,
      espera: esperando ? { herramienta: ultimo.herramienta, detalle: ultimo.detalle, desde: ultimo.t, tope: ultimo.tope } : null,
    }
  })
  // Una corrida retomada (resumeFromRunId) relanza el paso que no terminó con la misma etiqueta: el viejo quedó cortado.
  agentes.forEach((a, i) => {
    if (a.estado !== 'terminó' && agentes.slice(i + 1).some((b) => b.etiqueta === a.etiqueta)) { a.estado = 'cortado'; a.espera = null }
  })
  const totales = { entrada: 0, cacheCreacion: 0, cacheLectura: 0, salida: 0, herramientas: 0, bloqueos: 0, errores: 0 }
  for (const a of agentes) {
    for (const k of ['entrada', 'cacheCreacion', 'cacheLectura', 'salida']) totales[k] += a.tokens?.[k] ?? 0
    totales.herramientas += a.herramientas ?? 0
    totales.bloqueos += a.bloqueos?.length ?? 0
    totales.errores += a.errores ?? 0
  }
  const auditoria = agentes.find((a) => /auditor/i.test(a.etiqueta ?? '') && a.estado === 'terminó')
  const activo = (a) => a.estado === 'trabajando' || a.estado === 'esperando herramienta'
  const estado = auditoria ? 'terminada' : agentes.some(activo) ? 'corriendo' : 'detenida o en pausa'
  const tarea = agentes.find((a) => a.tarea)?.tarea ?? null
  const inicio = agentes.find((a) => a.inicio)?.inicio ?? null
  const ultima = agentes.map((a) => a.ultima).filter(Boolean).sort().pop() ?? null
  return { id: c.id, sesion: c.sesion, tarea, estado, inicio, ultima, agentes, totales, eventos: j.eventos }
}

// La tarea de cada corrida para el selector: basta con el comienzo del primer transcript.
const tareas = new Map()

function tareaDe(c) {
  if (tareas.get(c.dir)) return tareas.get(c.dir)
  let tarea = null
  try {
    const primero = fs.readFileSync(path.join(c.dir, 'journal.jsonl'), 'utf8').match(/"agentId":"(\w+)"/)?.[1]
    if (primero) {
      const fd = fs.openSync(path.join(c.dir, `agent-${primero}.jsonl`), 'r')
      const buf = Buffer.alloc(256 * 1024)
      const n = fs.readSync(fd, buf, 0, buf.length, 0)
      fs.closeSync(fd)
      const texto = buf.toString('utf8', 0, n)
      tarea = (texto.match(/proyecto\/tareas\/(T\d+[A-Z]?)/) || texto.match(/buzon\/(T\d+[A-Z]?)/))?.[1] ?? null
    }
  } catch {}
  tareas.set(c.dir, tarea)
  return tarea
}

// ---------- historial: cuánto tardó cada paso en las corridas anteriores (para estimar el cierre) ----------

const PASO = /^(constructor r\d|qa r\d|auditoría final)$/
const historialCache = new Map() // dir → { firma, datos }

// Primer y último timestamp sin leer todo el transcript (pueden pasar de 20 MB).
function extremos(archivo) {
  const fd = fs.openSync(archivo, 'r')
  try {
    const { size } = fs.fstatSync(fd)
    const leer = (pos, n) => { const b = Buffer.alloc(n); return b.toString('utf8', 0, fs.readSync(fd, b, 0, n, pos)) }
    const cabeza = leer(0, Math.min(size, 256 * 1024))
    const cola = leer(Math.max(0, size - 128 * 1024), Math.min(size, 128 * 1024))
    return {
      inicio: cabeza.match(/"timestamp":"([^"]+)"/)?.[1] ?? null,
      fin: [...cola.matchAll(/"timestamp":"([^"]+)"/g)].at(-1)?.[1] ?? null,
    }
  } finally {
    fs.closeSync(fd)
  }
}

function historial(excluir) {
  const salida = []
  for (const c of listarCorridas(Infinity)) {
    if (c.id === excluir) continue
    let h = historialCache.get(c.dir)
    if (!h || h.firma !== c.mtime) {
      h = { firma: c.mtime, datos: null }
      try {
        const eventos = fs.readFileSync(path.join(c.dir, 'journal.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l))
        const porId = new Map()
        for (const e of eventos) {
          if (e.type === 'started') porId.set(e.agentId, { etiqueta: e.label, fase: e.phase })
          if (e.type === 'result' && porId.has(e.agentId)) Object.assign(porId.get(e.agentId), { terminado: true, resultado: e.result })
        }
        const pasos = []
        for (const [id, p] of porId) {
          if (!PASO.test(p.etiqueta ?? '') || !p.terminado || p.resultado == null) continue
          const ext = extremos(path.join(c.dir, `agent-${id}.jsonl`))
          if (!ext.inicio || !ext.fin) continue
          pasos.push({
            etiqueta: p.etiqueta, fase: p.fase, inicio: ext.inicio, fin: ext.fin,
            min: (Date.parse(ext.fin) - Date.parse(ext.inicio)) / 60000,
            veredicto: p.resultado?.veredicto ?? null,
          })
        }
        if (pasos.some((p) => p.etiqueta === 'constructor r1')) h.datos = { id: c.id, tarea: tareaDe(c), inicio: pasos[0].inicio, pasos }
      } catch {}
      historialCache.set(c.dir, h)
    }
    if (h.datos) salida.push(h.datos)
  }
  return salida.sort((a, b) => a.inicio.localeCompare(b.inicio))
}

// Lo que lleva gastado la tarea en todas sus corridas (una ronda puede quedar partida por un apagón).
function totalDeLaTarea(elegida, actual) {
  if (!actual?.tarea) return null
  const corridas = []
  for (const c of listarCorridas(Infinity)) {
    if (tareaDe(c) !== actual.tarea) continue
    const e = c.id === elegida.id ? actual : estadoCorrida(c)
    const t = e.totales
    corridas.push({ id: c.id, inicio: e.inicio, estado: e.estado, sinCache: t.entrada + t.cacheCreacion + t.salida, cacheLectura: t.cacheLectura })
  }
  return {
    tarea: actual.tarea,
    sinCache: corridas.reduce((s, c) => s + c.sinCache, 0),
    cacheLectura: corridas.reduce((s, c) => s + c.cacheLectura, 0),
    corridas: corridas.sort((a, b) => String(a.inicio).localeCompare(String(b.inicio))),
  }
}

// ---------- git (solo lectura y sin tomar el lock del índice) ----------

let gitCache = { t: 0, datos: null }

const git = (args) => new Promise((ok) =>
  execFile('git', ['--no-optional-locks', '-C', REPO, ...args], { timeout: 8000, windowsHide: true },
    (err, out) => ok(err ? null : out.trimEnd())))

async function estadoGit() {
  if (Date.now() - gitCache.t < 8000 && gitCache.datos) return gitCache.datos
  const [status, commit] = await Promise.all([git(['status', '--porcelain']), git(['log', '-1', '--format=%h %s'])])
  const cambios = (status ?? '').split('\n').filter(Boolean).map((l) => ({ marca: l.slice(0, 2).trim(), ruta: l.slice(3) }))
  gitCache = { t: Date.now(), datos: { commit, cambios, error: status === null } }
  return gitCache.datos
}

// ---------- servidor ----------

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  try {
    if (url.pathname === '/api/estado') {
      const corridas = listarCorridas()
      const elegida = corridas.find((c) => c.id === url.searchParams.get('corrida')) ?? corridas[0]
      const corrida = elegida ? estadoCorrida(elegida) : null
      const cuerpo = {
        ahora: new Date().toISOString(),
        corridas: corridas.map((c) => ({ id: c.id, mtime: c.mtime, tarea: tareaDe(c) })),
        corrida,
        tarea: elegida ? totalDeLaTarea(elegida, corrida) : null,
        historial: historial(elegida?.id),
        git: await estadoGit(),
      }
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end(JSON.stringify(cuerpo))
      return
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      res.end(fs.readFileSync(path.join(AQUI, 'index.html')))
      return
    }
    res.writeHead(404).end()
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end(String(e?.stack ?? e))
  }
})

servidor.listen(PUERTO, '127.0.0.1', () => console.log(`Monitor de la fábrica en http://localhost:${PUERTO}`))
