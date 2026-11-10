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
function registrar(entrada, decision) {
  try {
    mkdirSync(path.join(RAIZ, 'fabrica/datos'), { recursive: true });
    const linea = {
      fecha: new Date().toISOString(),
      origen: DESDE_SETTINGS ? 'settings' : 'agente',
      agente: entrada?.agent_type ?? null,
      herramienta: entrada?.tool_name ?? null,
      decision,
    };
    appendFileSync(path.join(RAIZ, 'fabrica/datos/hook.jsonl'), `${JSON.stringify(linea)}
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
    if (base && texto.includes(base)) negar(`${p} es material personal del autor`);
  }

  const rutas = [datos.file_path, datos.notebook_path, datos.path].filter(Boolean).map(relativa);
  for (const r of rutas) {
    if (coincide(r, personales, 'i')) negar(`${r} es material personal del autor`);
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
  }

  const escribe = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(herramienta);
  if (escribe) {
    for (const r of rutas) {
      if (r.startsWith('..')) negar(`${r} está fuera del repo`);
      if (SOLO_BUZON && !coincide(r, ['fabrica/buzon/**'], 'i')) negar(`un auditor solo escribe en fabrica/buzon/ (intentó ${r})`);
      if (coincide(r, protegidas, 'i') && !coincide(r, libres, 'i')) negar(`${r} es una ruta protegida`);
    }
  }

  if (entrada.agent_type || !DESDE_SETTINGS) registrar(entrada, 'permitido');
  process.exit(0);
} catch (error) {
  negar(`el hook falló (${error instanceof Error ? error.message : String(error)})`);
}
