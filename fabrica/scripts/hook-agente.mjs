#!/usr/bin/env node
/**
 * Hook PreToolUse de los agentes de la fábrica (Claude Code). Lo declaran los subagentes de
 * .claude/agents/ en su frontmatter; al orquestador no le aplica.
 *
 * Niega en el momento:
 *   - leer, listar o nombrar las rutas personales de compuertas.json (material del autor que no se toca);
 *   - comandos de git que cambian el historial o el árbol (versiona el orquestador);
 *   - escribir en las rutas protegidas de fabrica/proyecto/compuertas.json;
 *   - servidores MCP;
 *   - con --solo-buzon (auditores): escribir en cualquier ruta fuera de fabrica/buzon/.
 *
 * Protocolo de Claude Code: la llamada llega por stdin como JSON ({ tool_name, tool_input });
 * salir con código 2 bloquea y el texto de stderr le llega al agente. Falla cerrado: cualquier
 * error propio también sale con 2.
 */
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { coincide } from './lib/globs.mjs';

const RAIZ = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
let SOLO_BUZON = process.argv.includes('--solo-buzon');
// --desde-settings: el mismo hook enganchado en .claude/settings.json, que corre para todas las llamadas.
// El de la cabecera de cada agente no se disparó dentro del workflow (E1 de T01), así que este es el que
// manda: sin `agent_type` es el orquestador y pasa; con él, el modo sale del tipo de agente.
const DESDE_SETTINGS = process.argv.includes('--desde-settings');
const AUDITORES = new Set(['qa', 'auditor-final', 'analista-referente']);

// Cada llamada de un agente queda en fabrica/datos/hook.jsonl: así se comprueba que el hook corre.
// Lleva el comando (recortado) o la ruta, para poder cruzar una negación con lo que el agente hizo después
// (E1 de T02). Si la negación es por material personal, el detalle no se guarda.
let OCULTAR_DETALLE = false;
function detalle(entrada) {
  if (OCULTAR_DETALLE) return '[personal]';
  const d = entrada?.tool_input ?? {};
  const t = d.command ?? d.file_path ?? d.notebook_path ?? d.path ?? d.pattern ?? null;
  return t == null ? null : String(t).slice(0, 300);
}
function registrar(entrada, decision) {
  try {
    mkdirSync(path.join(RAIZ, 'fabrica/datos'), { recursive: true });
    const linea = {
      fecha: new Date().toISOString(),
      origen: DESDE_SETTINGS ? 'settings' : 'agente',
      agente: entrada?.agent_type ?? null,
      herramienta: entrada?.tool_name ?? null,
      detalle: detalle(entrada),
      decision,
    };
    // HOOK_REGISTRO solo lo usa probar-hook.mjs, para no ensuciar el registro real con sus casos.
    appendFileSync(process.env.HOOK_REGISTRO || path.join(RAIZ, 'fabrica/datos/hook.jsonl'), `${JSON.stringify(linea)}
`);
  } catch {
    // el registro nunca decide
  }
}
let ENTRADA = null;

function negar(motivo) {
  registrar(ENTRADA, `negado: ${motivo}`);
  process.stderr.write(`Bloqueado por la fábrica: ${motivo}. No busques otro camino; anótalo en SOLICITUDES de tu entrega.\n`);
  process.exit(2);
}

// Ruta relativa a la raíz del repo, con / y en minúsculas (Windows no distingue mayúsculas).
function relativa(ruta) {
  if (!ruta || typeof ruta !== 'string') return '';
  const abs = path.resolve(RAIZ, ruta);
  return path.relative(RAIZ, abs).split(path.sep).join('/');
}

// ---- Escrituras desde la terminal (E1 de T02) ----
// El hook antes solo miraba git en los comandos: un `cat > C:/…/scratchpad/x.mjs` o un `Out-File` escribían
// fuera del repo (o un auditor fuera del buzón) sin que nadie lo negara. Aquí se sacan los destinos de
// escritura de un comando y se juzgan igual que los de Write/Edit.
const LUGAR_TEMPORAL = 'fabrica/buzon/<ID>/tmp/ (no se sube)';
// Carpetas temporales del sistema y el scratchpad del orquestador: un agente no tiene nada que hacer ahí.
const TEMPORALES = /appdata[\\/]+local[\\/]+temp|[\\/]scratchpad([\\/]|\b)|(^|[\s"'=(])\/tmp\/|\$env:te?mp\b|\$\{?te?mpdir\b|\$\{?te?mp\}?[\\/]|%te?mp%|\bgettemppath\b|\bos\.tmpdir\b|\btmpdir\(\)/i;

// Tapa (con espacios, sin mover posiciones) el cuerpo de los heredocs y lo que va entre comillas, para que
// un `>` dentro de código o de texto no cuente como redirección.
function enmascarar(cmd) {
  let m = cmd.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n([\s\S]*?)\n(\2)(?=\s|$)/g, (todo, _q, _d, cuerpo, fin) => {
    const inicio = todo.length - cuerpo.length - fin.length - 1;
    return todo.slice(0, inicio) + cuerpo.replace(/[^\n]/g, ' ') + '\n' + fin;
  });
  m = m.replace(/"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/g, (s) => s[0] + ' '.repeat(s.length - 2) + s[s.length - 1]);
  return m;
}

const TOKEN = String.raw`("[^"]*"|'[^']*'|[^\s;&|<>()]+)`;
function destinosDeEscritura(cmd) {
  const m = enmascarar(cmd);
  const salida = [];
  const tomar = (re, grupo = 1) => {
    for (const x of m.matchAll(re)) {
      const [i, f] = x.indices[grupo];
      salida.push({ ruta: cmd.slice(i, f), pos: i });
    }
  };
  // Redirecciones: `>`, `>>`, `2>`, `&>` (no `2>&1`, no `=>`, no `->`).
  tomar(new RegExp(String.raw`(?<![<>=\-])\d*>{1,2}(?![&>])\s*${TOKEN}`, 'dg'));
  // tee / Tee-Object
  tomar(new RegExp(String.raw`\b(?:tee|tee-object)\b(?:\s+-[\w-]+)*\s+${TOKEN}`, 'dgi'));
  // Comandos que crean, mueven o borran: todo argumento con pinta de ruta en ese tramo. Los que copian o
  // bajan algo: solo el destino (el último), porque leer de una fuente no es escribir en ella. El verbo
  // cuenta solo al principio de un comando (si no, «QA.md» sería un `md`).
  const verbos = /(?<=^|[;&|(\n{]\s*|\bxargs\s+(?:-\S+\s+)*|\bsudo\s+)(cp|mv|rm|mkdir|md|touch|install|rsync|curl|wget|out-file|set-content|add-content|new-item|copy-item|move-item|remove-item|rename-item|invoke-webrequest|iwr)\b([^;&|\n]*)/dgi;
  const soloDestino = /^(cp|install|rsync|curl|wget|copy-item|invoke-webrequest|iwr)$/i;
  for (const x of m.matchAll(verbos)) {
    const [i, f] = x.indices[2];
    const tramo = cmd.slice(i, f).split(/(?<![\w"'])\d*[<>]/)[0]; // las redirecciones ya se juzgaron arriba
    const rutas = [];
    for (const t of tramo.match(/"[^"]*"|'[^']*'|[^\s"']+/g) ?? []) {
      const limpio = t.replace(/^["']|["']$/g, '');
      if (/^-/.test(limpio) || /^[a-z][\w+.-]*:\/\//i.test(limpio)) continue; // opciones y URL
      if (/[\\/]|^[a-z]:|^~|^\$|^%/i.test(limpio)) rutas.push(limpio);
    }
    salida.push(...(soloDestino.test(x[1]) ? rutas.slice(-1) : rutas).map((ruta) => ({ ruta, pos: i })));
  }
  // Escrituras desde node -e / python -c: writeFileSync('ruta'), open('ruta', 'w')…
  for (const x of cmd.matchAll(/\b(?:writeFile(?:Sync)?|appendFile(?:Sync)?|createWriteStream|copyFile(?:Sync)?|mkdirSync|cpSync|renameSync)\(\s*(['"`])([^'"`]+)\1/g)) salida.push({ ruta: x[2], pos: x.index });
  return salida.map((d) => ({ ruta: d.ruta.replace(/^["']|["']$/g, '').trim(), pos: d.pos })).filter((d) => d.ruta);
}

// /c/… de Git Bash → c:/…
const deGitBash = (d) => (/^\/[a-z](\/|$)/i.test(d) ? `${d[1]}:${d.slice(2) || '/'}` : d);
// Una carpeta que no se sabe dónde queda (cd a ~, $HOME, %USERPROFILE%…): se juzga como fuera del repo.
const FUERA = path.resolve(RAIZ, '..', '__fuera-del-repo__');

// Carpetas desde las que se resuelve un destino relativo que está en la posición `pos` del comando: las dos
// de siempre (raíz y sitio/), movidas por cada `cd` / `pushd` / `Set-Location` anterior (E6 de T03: un
// `cd fabrica/buzon/T03/tmp && cat > x.mjs` se negaba, y un `cd /c/otra && echo > x.txt` pasaba).
function carpetasEn(cmd, pos) {
  let bases = [RAIZ, path.resolve(RAIZ, 'sitio')];
  const m = enmascarar(cmd);
  const re = new RegExp(String.raw`(?<=^|[;&|(\n{]\s*)(?:cd|pushd|set-location|sl)\b(?:\s+${TOKEN})?`, 'dgi');
  for (const x of m.matchAll(re)) {
    if (x.index >= pos) break;
    const crudo = x.indices[1] ? cmd.slice(...x.indices[1]).replace(/^["']|["']$/g, '').trim() : '~';
    if (crudo === '-') continue;
    if (/^(~|\$home|\$\{?home|\$env:|%)/i.test(crudo) || TEMPORALES.test(crudo)) {
      bases = [FUERA];
      continue;
    }
    const d = deGitBash(crudo);
    bases = path.isAbsolute(d) ? [path.resolve(d)] : [...new Set(bases.map((b) => path.resolve(b, d)))];
  }
  return bases;
}

// ¿Dónde cae un destino? Los relativos se prueban contra las carpetas en que puede estar el comando ahí.
function juzgarDestino(destino, bases = [RAIZ, path.resolve(RAIZ, 'sitio')]) {
  if (/^(\/dev\/(null|stdout|stderr)|\$null|nul)$/i.test(destino)) return { fuera: false, rels: [] };
  if (TEMPORALES.test(destino) || /^(~|\$home|\$env:|\$\{?home|%)/i.test(destino)) return { fuera: true, rels: [] };
  const d = deGitBash(destino);
  const absolutos = path.isAbsolute(d) ? [path.resolve(d)] : bases.map((b) => path.resolve(b, d));
  const rels = absolutos.map((a) => path.relative(RAIZ, a).split(path.sep).join('/')).filter((r) => !r.startsWith('..') && !path.isAbsolute(r));
  return { fuera: rels.length === 0, rels };
}

try {
  const entrada = JSON.parse(readFileSync(0, 'utf8'));
  ENTRADA = entrada;
  if (DESDE_SETTINGS) {
    const tipo = entrada.agent_type;
    if (!tipo) process.exit(0); // el orquestador
    if (AUDITORES.has(tipo)) SOLO_BUZON = true;
  }
  const herramienta = String(entrada.tool_name ?? '');
  const datos = entrada.tool_input ?? {};
  const config = JSON.parse(readFileSync(path.join(RAIZ, 'fabrica/proyecto/compuertas.json'), 'utf8'));
  const personales = config.rutasPersonales ?? [];
  const protegidas = config.rutasProtegidas ?? [];
  const libres = config.rutasLibres ?? [];

  if (!herramienta) negar('llamada sin nombre de herramienta');
  if (herramienta.startsWith('mcp__')) negar('los agentes no usan servidores MCP');

  // Todo texto de la llamada que pueda nombrar una ruta: el material personal no se nombra.
  const texto = JSON.stringify(datos).replace(/\\\\/g, '/').toLowerCase();
  for (const p of personales) {
    const base = p.replace(/\/?\*.*$/, '').toLowerCase();
    if (base && texto.includes(base)) { OCULTAR_DETALLE = true; negar(`${p} es material personal del autor`); }
  }

  const rutas = [datos.file_path, datos.notebook_path, datos.path].filter(Boolean).map(relativa);
  for (const r of rutas) {
    if (coincide(r, personales, 'i')) { OCULTAR_DETALLE = true; negar(`${r} es material personal del autor`); }
  }

  if (herramienta === 'Bash' || herramienta === 'PowerShell') {
    const cmd = String(datos.command ?? '');
    // Las opciones globales van antes del subcomando: `git -C sitio checkout`, `git --no-pager checkout`,
    // `git -c x=y reset` (E1 de T01: la versión anterior solo miraba `git <subcomando>`).
    const opcionesGlobales = String.raw`(?:\s+(?:-[Cc]\s+(?:"[^"]*"|'[^']*'|\S+)|--?[\w-]+(?:=\S+)?))*`;
    const cambia = String.raw`(commit|push|reset|checkout|switch|restore|stash|rebase|merge|tag|clean|revert|cherry-pick|am|apply|rm|mv|worktree|update-ref|update-index|read-tree|checkout-index|branch\s+-[dDmMfc])\b`;
    if (new RegExp(String.raw`\bgit\b${opcionesGlobales}\s+${cambia}`, 'i').test(cmd)) {
      negar('los comandos de git que cambian el historial o el árbol son del orquestador');
    }
    // `git show HEAD:archivo > archivo` reescribe el árbol sin nombrar checkout.
    if (/\bgit\b[^\n;&|]*?(?<![0-9&])>(?!\s*&|\s*\/dev\/null|\s*\$null)/i.test(cmd)) {
      negar('la salida de git no se redirige a archivos: reescribiría el árbol');
    }
    if (TEMPORALES.test(cmd)) {
      negar(`las carpetas temporales del sistema y el scratchpad no son tuyas; tus scripts y salidas temporales van en ${LUGAR_TEMPORAL}`);
    }
    for (const { ruta: destino, pos } of destinosDeEscritura(cmd)) {
      const { fuera, rels } = juzgarDestino(destino, carpetasEn(cmd, pos));
      if (fuera) negar(`${destino} está fuera del repo; lo temporal va en ${LUGAR_TEMPORAL}`);
      if (SOLO_BUZON && !rels.some((r) => coincide(r, ['fabrica/buzon/**'], 'i'))) {
        negar(`un auditor solo escribe en fabrica/buzon/, también desde la terminal (intentó ${destino})`);
      }
      for (const r of rels) if (coincide(r, personales, 'i')) { OCULTAR_DETALLE = true; negar('material personal del autor'); }
    }
  }

  const escribe = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(herramienta);
  if (escribe) {
    for (const r of rutas) {
      if (r.startsWith('..')) negar(`${r} está fuera del repo; lo temporal va en ${LUGAR_TEMPORAL}`);
      if (SOLO_BUZON && !coincide(r, ['fabrica/buzon/**'], 'i')) negar(`un auditor solo escribe en fabrica/buzon/ (intentó ${r})`);
      if (coincide(r, protegidas, 'i') && !coincide(r, libres, 'i')) negar(`${r} es una ruta protegida`);
    }
  }

  if (entrada.agent_type || !DESDE_SETTINGS) registrar(entrada, 'permitido');
  process.exit(0);
} catch (error) {
  negar(`el hook falló (${error instanceof Error ? error.message : String(error)})`);
}
