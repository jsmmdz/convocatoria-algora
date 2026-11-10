#!/usr/bin/env node
/**
 * Compuertas deterministas de la fábrica.
 *
 * Lo que se puede comprobar con un comando no se le pide a un modelo: este script
 * corre alcance y propiedad de archivos, check/build, búsquedas prohibidas y
 * presupuestos de peso, y devuelve un reporte en Markdown. Constructor y auditor
 * lo corren igual, así que las dos partes discuten sobre la misma salida.
 *
 * Uso (desde la raíz del repo):
 *   node fabrica/scripts/compuertas.mjs <TAREA> [--completas] [--todos] [--sin-build] [--guardar]
 *
 *   --completas  corre como regresión las pruebas de todas las tareas cerradas (la auditoría final y el
 *                orquestador). Sin ella (constructor y QA, v3.6) corren las comunes, las de la tarea y las
 *                de las tareas que lista su campo `regresion`
 *   --todos      busca patrones en todos los archivos de la tarea, no solo en los cambiados
 *   --sin-build  salta check y build (para iterar rápido; nunca en una entrega)
 *   --guardar    escribe COMPUERTAS-r<N>.md en el buzón y una línea en
 *                compuertas.jsonl de las métricas de la fábrica (`datos` en compuertas.json)
 *
 * Sale con código 1 si falla alguna compuerta que bloquea. Sin dependencias.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { coincide, leerFrontmatter } from './lib/globs.mjs';
import { raizPrincipal } from './lib/repo.mjs';
import { tomarTurno } from './lib/turno.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONFIG = JSON.parse(readFileSync(join(RAIZ, 'fabrica/proyecto/compuertas.json'), 'utf8'));
const args = process.argv.slice(2);
const TAREA = args.find((a) => !a.startsWith('--'));
const OPC = new Set(args.filter((a) => a.startsWith('--')));
const COMPLETAS = OPC.has('--completas');

if (!TAREA) {
  console.error('Uso: node fabrica/scripts/compuertas.mjs <TAREA> [--completas] [--todos] [--sin-build] [--guardar]');
  process.exit(2);
}

const aPosix = (p) => p.split(sep).join('/');

// ---------- Tareas ----------
const dirTareas = join(RAIZ, CONFIG.tareas);
const tareas = readdirSync(dirTareas)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ archivo: f, ...leerFrontmatter(readFileSync(join(dirTareas, f), 'utf8')) }))
  .filter((t) => t.id);
const tarea = tareas.find((t) => t.id === TAREA);
if (!tarea) {
  console.error(`No hay especificación con id: ${TAREA} en ${CONFIG.tareas}/`);
  process.exit(2);
}
const propios = tarea.archivos ?? [];

// ---------- Resultado ----------
const filas = []; // { grupo, id, ok, bloquea, detalle }
const anotar = (grupo, id, ok, bloquea, detalle) => filas.push({ grupo, id, ok, bloquea, detalle });

// ---------- 1. Alcance y propiedad ----------
function archivosCambiados() {
  const salida = execSync('git status --porcelain=v1 -uall', { cwd: RAIZ, encoding: 'utf8' });
  return salida
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      let ruta = l.slice(3);
      if (ruta.includes(' -> ')) ruta = ruta.split(' -> ')[1];
      return ruta.replace(/^"|"$/g, '');
    });
}
const cambiados = archivosCambiados();
const propiosCambiados = [];
const deOtras = [];
const invasiones = [];
for (const ruta of cambiados) {
  if (coincide(ruta, CONFIG.rutasLibres)) continue;
  if (coincide(ruta, propios)) {
    propiosCambiados.push(ruta);
    continue;
  }
  const otra = tareas.find((t) => t.id !== TAREA && coincide(ruta, t.archivos));
  if (otra) deOtras.push(`${ruta} (${otra.id})`);
  else invasiones.push(`${ruta}${coincide(ruta, CONFIG.rutasProtegidas) ? ' — ruta protegida' : ''}`);
}
anotar('Alcance', 'archivos-propios', true, false, `${propiosCambiados.length} cambiados dentro de «archivos»`);
anotar('Alcance', 'fuera-de-alcance', invasiones.length === 0, true, invasiones.length ? invasiones.join('<br>') : 'ninguno');
if (deOtras.length) anotar('Alcance', 'de-otras-tareas', true, false, `no se le cuentan a ${TAREA}: ${deOtras.join(', ')}`);

for (const req of tarea.requiere ?? []) {
  anotar('Alcance', `requiere ${req}`, existsSync(join(RAIZ, req)), true, existsSync(join(RAIZ, req)) ? 'existe' : 'NO existe: la tarea no puede arrancar');
}

// ---------- 2. Comandos ----------
const salidas = {};
if (!OPC.has('--sin-build')) {
  // v3.2: check, build y pruebas corren con el turno de pruebas tomado, para que otro proceso no
  // corra su suite al mismo tiempo. Playwright lo hereda (TURNO_PRUEBAS_PID) y no lo vuelve a pedir.
  const soltarTurno = await tomarTurno(`compuertas ${TAREA}`);
  try {
    // {pruebas}: las comunes, las de esta tarea y, como regresión, las de las tareas ya
    // aprobadas (con APROBADO.md), cerradas por el orquestador (con AUDITORIA-FINAL.md, aunque haya
    // quedado escalada) o con visto bueno (VISTO-BUENO.md). Nunca las de tareas por hacer: fallarían y dejarían esta tarea en rojo.
    const dirPruebas = join(RAIZ, CONFIG.raizSitio, 'tests');
    const cerrada = (t) => ['APROBADO.md', 'AUDITORIA-FINAL.md', 'VISTO-BUENO.md'].some((f) => existsSync(join(RAIZ, CONFIG.buzon, t, f)));
    const aprobadas = existsSync(join(RAIZ, CONFIG.buzon))
      ? readdirSync(join(RAIZ, CONFIG.buzon)).filter((t) => t !== TAREA && cerrada(t))
      : [];
    // Más las tareas cerradas cuyo buzón ya se archivó (campo `regresion` de compuertas.json).
    const fijas = (CONFIG.regresion ?? []).filter((t) => t !== TAREA && !aprobadas.includes(t));
    // v3.6 (autor, 2026-10-05 y 2026-10-15): la suite completa solo con --completas; si no, las regresiones directas
    // que lista la tarea. El constructor y el QA corrían cada uno la suite entera en cada ronda.
    const regresion = COMPLETAS ? [...aprobadas, ...fijas] : (tarea.regresion ?? []).filter((t) => t !== TAREA);
    const pruebas = ['comunes', TAREA, ...regresion].filter((d) => existsSync(join(dirPruebas, d))).map((d) => `tests/${d}`);
    // Una tarea aprobada sin carpeta de pruebas (sus pruebas viven en las de otra) no es aviso en la suite completa;
    // solo lo es una que la tarea lista en `regresion`.
    const listadas = tarea.regresion ?? [];
    for (const t of regresion.filter((d) => !existsSync(join(dirPruebas, d)) && (!COMPLETAS || listadas.includes(d) || !aprobadas.includes(d))))
      anotar('Alcance', `regresion ${t}`, false, false, `no hay sitio/tests/${t}/`);
    anotar('Alcance', 'pruebas', true, false, `${COMPLETAS ? 'completas' : 'de la tarea y sus regresiones'}: ${pruebas.join(', ')}`);
    const correr = (c, cmd) => {
      let salida = '';
      let codigo = 0;
      try {
        salida = execSync(cmd, { cwd: join(RAIZ, CONFIG.raizSitio), encoding: 'utf8', stdio: 'pipe' });
      } catch (e) {
        codigo = e.status ?? 1;
        salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
      }
      salida = salida.replace(/\x1b\[[0-9;]*m/g, '');
      const faltan = (c.exigirTexto ?? []).filter((t) => !salida.includes(t));
      const prohibido = c.prohibirRegex ? salida.match(new RegExp(c.prohibirRegex, 'i')) : null;
      const ok = codigo === 0 && faltan.length === 0 && !prohibido;
      // Si falla una suite de pruebas, el reporte nombra qué pruebas fallaron: «código 1» solo
      // no le dice nada al auditor.
      const fallidas = [...new Set(salida.split('\n').filter((l) => /^\s*\d+\) .+›/.test(l)).map((l) => l.trim().replace(/^\d+\)\s*/, '').replace(/[\s─]+$/, '')))];
      const detalle = ok
        ? (c.exigirTexto ?? []).join(' · ') || 'código 0'
        : [
            codigo ? `código ${codigo}` : '',
            faltan.length ? `falta: ${faltan.join(', ')}` : '',
            prohibido ? `aparece: «${prohibido[0]}»` : '',
            fallidas.length ? `fallan:<br>${fallidas.slice(0, 8).join('<br>')}${fallidas.length > 8 ? `<br>… y ${fallidas.length - 8} más` : ''}` : '',
          ]
            .filter(Boolean)
            .join(' · ');
      return { salida, ok, fallidas, detalle };
    };
    for (const c of CONFIG.comandos) {
      const cmd = c.cmd.replace('{pruebas}', pruebas.join(' '));
      const r = correr(c, cmd);
      salidas[c.id] = r.salida;
      // v3.6: si fallan pocas pruebas, se repiten una vez solas. Si pasan, el comando
      // queda en verde con un aviso ⚠️ que el QA o el auditor juzga: una prueba que solo pasa sola es frágil o
      // depende del entorno, no está verde sin más. Si vuelven a fallar, o fallaron más del tope, sigue en rojo.
      if (!r.ok && c.reintentar && r.fallidas.length > 0 && r.fallidas.length <= (c.reintentarHasta ?? 3)) {
        const r2 = correr(c, c.reintentar);
        salidas[`${c.id}-reintento`] = r2.salida;
        if (r2.ok) {
          anotar('Comandos', cmd, true, true, `${r2.detalle} (al repetir las que fallaron)`);
          anotar('Comandos', 'reintento', false, false, `fallaron en la suite y pasaron al repetirlas solas:<br>${r.fallidas.join('<br>')}`);
        } else {
          anotar('Comandos', cmd, false, true, `${r.detalle}<br>y al repetirlas solas: ${r2.detalle}`);
        }
        continue;
      }
      anotar('Comandos', cmd, r.ok, true, r.detalle);
    }
  } finally {
    soltarTurno();
  }
} else {
  anotar('Comandos', 'check/build', false, false, 'saltados con --sin-build: esta corrida no vale para entregar');
}

// ---------- 3. Patrones ----------
function prefijoFijo(glob) {
  const partes = glob.split('/');
  const fijas = [];
  for (const p of partes) {
    if (/[*?]/.test(p)) break;
    fijas.push(p);
  }
  return fijas.join('/');
}
function recorrer(dir, acumulado) {
  if (!existsSync(dir)) return;
  if (statSync(dir).isFile()) return acumulado.push(aPosix(relative(RAIZ, dir)));
  for (const n of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', '.astro'].includes(n)) continue;
    recorrer(join(dir, n), acumulado);
  }
}
let aRevisar = propiosCambiados;
if (OPC.has('--todos')) {
  const encontrados = [];
  for (const g of propios.filter((g) => !g.startsWith('!'))) recorrer(join(RAIZ, prefijoFijo(g)), encontrados);
  aRevisar = [...new Set(encontrados)].filter((r) => coincide(r, propios));
}
aRevisar = aRevisar.filter((r) => existsSync(join(RAIZ, r)) && statSync(join(RAIZ, r)).isFile());

// Borra comentarios de bloque y de línea conservando los saltos, para que los números
// de línea del reporte sigan apuntando al archivo real.
const vaciar = (bloque) => bloque.replace(/[^\n]/g, ' ');
const sinComentarios = (texto) =>
  texto
    .replace(/\/\*[\s\S]*?\*\//g, vaciar)
    .replace(/<!--[\s\S]*?-->/g, vaciar)
    .replace(/(^|[^:"'])\/\/.*$/gm, (m, previo) => previo + vaciar(m.slice(previo.length)));
for (const p of CONFIG.patrones) {
  const re = new RegExp(p.regex, p.flags ?? '');
  const hallazgos = [];
  for (const ruta of aRevisar) {
    if (!p.extensiones.some((e) => ruta.endsWith(e))) continue;
    if ((p.permitidos ?? []).includes(ruta)) continue;
    let texto = readFileSync(join(RAIZ, ruta), 'utf8').replace(/\r\n/g, '\n');
    if (p.ignorarComentarios) texto = sinComentarios(texto);
    // Con «repetido», el grupo 1 es un nombre y solo cuenta si aparece 2 o más veces en el
    // archivo (un callback que se vuelve a programar a sí mismo es un loop)
    const porNombre = {};
    texto.split('\n').forEach((linea, i) => {
      const m = linea.match(re);
      if (!m) return;
      if (p.repetido && m[1]) (porNombre[m[1]] ??= []).push(`${ruta}:${i + 1}`);
      else hallazgos.push(`${ruta}:${i + 1}`);
    });
    for (const lineas of Object.values(porNombre)) if (lineas.length >= 2) hallazgos.push(...lineas);
  }
  const detalle = hallazgos.length ? hallazgos.slice(0, 12).join('<br>') + (hallazgos.length > 12 ? `<br>… y ${hallazgos.length - 12} más` : '') : 'sin coincidencias';
  anotar('Patrones', `${p.id} — ${p.descripcion}`, hallazgos.length === 0, p.bloquea, detalle);
}

// ---------- 4. Presupuestos ----------
function scriptsIniciales(htmlRuta) {
  const html = readFileSync(htmlRuta, 'utf8');
  const base = join(RAIZ, CONFIG.raizSitio, 'dist');
  const vistos = new Set();
  const cola = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => join(base, m[1]));
  let inline = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
  // Los imports estáticos también se descargan antes del primer fotograma
  for (const m of inline.matchAll(/(?:import|from)\s*["']([^"']+\.js)["']/g)) cola.push(join(base, m[1]));
  while (cola.length) {
    const f = cola.pop();
    if (vistos.has(f) || !existsSync(f)) continue;
    vistos.add(f);
    const codigo = readFileSync(f, 'utf8');
    for (const m of codigo.matchAll(/(?:import|from)\s*["'](\.{1,2}\/[^"']+\.js)["']/g)) cola.push(join(dirname(f), m[1]));
  }
  return { archivos: [...vistos], inline };
}
const promovidas = new Set(tarea.bloqueantes ?? []);
for (const p of CONFIG.presupuestos) {
  const bloquea = p.bloquea || promovidas.has(p.id);
  if (OPC.has('--sin-build')) {
    anotar('Presupuestos', p.id, false, false, 'sin build no hay dist/ que medir');
    continue;
  }
  if (p.medida === 'bytes') {
    const dir = join(RAIZ, prefijoFijo(p.glob));
    const archivos = [];
    recorrer(dir, archivos);
    const total = archivos.filter((r) => coincide(r, [p.glob])).reduce((s, r) => s + statSync(join(RAIZ, r)).size, 0);
    anotar('Presupuestos', `${p.id} — ${p.descripcion}`, total <= p.maximo, bloquea, `${total.toLocaleString('es-CO')} bytes / máx ${p.maximo.toLocaleString('es-CO')}`);
  } else if (p.medida === 'gzip-scripts-del-html' || p.medida === 'no-contiene') {
    const html = join(RAIZ, p.html);
    if (!existsSync(html)) {
      anotar('Presupuestos', p.id, false, bloquea, `no existe ${p.html}`);
      continue;
    }
    const { archivos, inline } = scriptsIniciales(html);
    if (p.medida === 'gzip-scripts-del-html') {
      const total = archivos.reduce((s, f) => s + gzipSync(readFileSync(f)).length, 0) + gzipSync(inline).length;
      anotar('Presupuestos', `${p.id} — ${p.descripcion}`, total <= p.maximo, bloquea, `${total.toLocaleString('es-CO')} bytes gzip en ${archivos.length} archivo(s) + inline / máx ${p.maximo.toLocaleString('es-CO')}`);
    } else {
      const culpables = archivos.filter((f) => readFileSync(f, 'utf8').includes(p.texto)).map((f) => aPosix(relative(RAIZ, f)));
      anotar('Presupuestos', `${p.id} — ${p.descripcion}`, culpables.length === 0, bloquea, culpables.length ? `«${p.texto}» en ${culpables.join(', ')}` : 'no aparece');
    }
  }
}

// ---------- Reporte ----------
const fallasQueBloquean = filas.filter((f) => !f.ok && f.bloquea);
const avisos = filas.filter((f) => !f.ok && !f.bloquea);
const veredicto = fallasQueBloquean.length === 0 ? 'VERDE' : 'ROJO';
const fecha = new Date().toISOString();
const commit = execSync('git rev-parse --short HEAD', { cwd: RAIZ, encoding: 'utf8' }).trim();

const icono = (f) => (f.ok ? '✅' : f.bloquea ? '❌' : '⚠️');
let md = `COMPUERTAS: ${veredicto}\n\n# Compuertas · ${TAREA}\n\n`;
md += `- Fecha: ${fecha}\n- Commit base: \`${commit}\`\n- Modo: ${OPC.has('--todos') ? 'todos los archivos de la tarea' : 'archivos cambiados'}${OPC.has('--sin-build') ? ' · SIN BUILD' : ''}\n`;
md += `- Bloquean: ${fallasQueBloquean.length} · Avisos: ${avisos.length}\n\n`;
md += '| | Grupo | Compuerta | Detalle |\n|---|---|---|---|\n';
for (const f of filas) md += `| ${icono(f)} | ${f.grupo} | ${f.id} | ${f.detalle} |\n`;
md += '\n✅ pasa · ❌ falla y bloquea · ⚠️ aviso: lo revisa el auditor a mano\n';
console.log(md);

if (OPC.has('--guardar')) {
  const dirBuzon = join(RAIZ, CONFIG.buzon, TAREA);
  mkdirSync(dirBuzon, { recursive: true });
  const rondas = existsSync(dirBuzon)
    ? readdirSync(dirBuzon).map((f) => f.match(/^ENTREGA-r(\d+)\.md$/)).filter(Boolean).map((m) => Number(m[1]))
    : [];
  const ronda = rondas.length ? Math.max(...rondas) : 0;
  // v3.2: una segunda corrida de la misma ronda ya no pisa la primera: va con sufijo.
  let nombre = `COMPUERTAS-r${ronda}.md`;
  for (let i = 2; existsSync(join(dirBuzon, nombre)); i++) nombre = `COMPUERTAS-r${ronda}-${i}.md`;
  writeFileSync(join(dirBuzon, nombre), md);
  // Las métricas viven en el checkout principal, no en el worktree.
  const datos = join(raizPrincipal(RAIZ), CONFIG.datos ?? 'fabrica/datos');
  mkdirSync(datos, { recursive: true });
  appendFileSync(
    join(datos, 'compuertas.jsonl'),
    JSON.stringify({ fecha, tarea: TAREA, ronda, commit, veredicto, bloquean: fallasQueBloquean.map((f) => f.id), avisos: avisos.map((f) => f.id) }) + '\n'
  );
  console.error(`Guardado en ${CONFIG.buzon}/${TAREA}/${nombre}`);
}

process.exit(fallasQueBloquean.length ? 1 : 0);
