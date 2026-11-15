#!/usr/bin/env node
/**
 * Hook PreToolUse de Antigravity (agy) para los constructores Gemini de la fábrica (2026-11-14).
 * Lo registra `.agents/hooks.json`; Antigravity lo corre con la carpeta `.agents/` como cwd.
 *
 * Entra por stdin { toolCall: { name, args }, conversationId, cwd, … } y sale por stdout
 * { decision: 'allow' | 'deny', reason }.
 *
 * No repite reglas: traduce la llamada al formato de Claude Code y le pregunta a `hook-agente.mjs`,
 * el mismo hook de los agentes de Claude (material personal, git, rutas protegidas, MCP, escrituras
 * fuera del repo, también desde la terminal). Encima agrega la **propiedad por subtarea**: el lanzador
 * (`gemini.mjs`) le pasa a cada sesión, por el entorno, sus `archivos` (FABRICA_ARCHIVOS) y su buzón;
 * una escritura con una herramienta de archivos fuera de eso se niega. Las escrituras desde la terminal
 * las juzga hook-agente (fuera del repo, protegidas); la propiedad fina de esas la atrapan las compuertas.
 *
 * Los nombres de las herramientas cambian entre versiones y agentes de agy: la v2.4 veía write_to_file /
 * view_file (TargetFile, AbsolutePath); el agente constructor de agy 1.2 con Gemini 4 usa write_file /
 * read_file (Path, Content), y con la lista vieja una subtarea escribió en la de otra (prueba T99,
 * 2026-11-14). Por eso no se confía en una lista: una escritura se reconoce por el nombre y la ruta por
 * la clave. Una herramienta que parece escritura y no trae una ruta juzgable se niega.
 *
 * Falla cerrado: si algo de este hook falla, niega.
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { coincide } from './lib/globs.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const responder = (decision, reason = '') => {
  process.stdout.write(JSON.stringify(reason ? { decision, reason } : { decision }));
  process.exit(0);
};

const PARECE_ESCRITURA = /write|edit|replace|create|delete|remove|move|rename|patch|insert|append|mkdir|copy/i;
const PARECE_COMANDO = /^(run_command|run_shell|shell|bash|terminal|exec)/i;
const PARECE_MCP = /mcp/i;
const CLAVE_RUTA = /(^|_)(path|paths|file|files|filepath|targetfile|absolutepath|directorypath|searchpath|searchdirectory|source|destination|dest|target)$/i;
// En algunos registros de agy los valores llegan como texto JSON («"C:/…"»): se les quitan las comillas.
const sinComillas = (v) => (typeof v === 'string' ? v.replace(/^"([\s\S]*)"$/, '$1') : v);

function rutasDe(a) {
  const rutas = [];
  for (const [k, v] of Object.entries(a)) {
    if (!CLAVE_RUTA.test(k)) continue;
    for (const x of Array.isArray(v) ? v : [v]) {
      const t = sinComillas(x);
      if (typeof t === 'string' && t && t.length < 500 && !t.includes('\n')) rutas.push(t);
    }
  }
  return rutas;
}

/** La llamada de agy como una o varias llamadas de Claude Code (una por ruta). */
function traducir(nombre, a) {
  if (PARECE_MCP.test(nombre)) return [{ tool_name: `mcp__${nombre}`, tool_input: a }];
  if (PARECE_COMANDO.test(nombre)) {
    return [{ tool_name: 'Bash', tool_input: { command: String(sinComillas(a.CommandLine ?? a.Command ?? a.command ?? '')) } }];
  }
  const rutas = rutasDe(a);
  if (PARECE_ESCRITURA.test(nombre)) return rutas.map((r) => ({ tool_name: 'Write', tool_input: { file_path: r } }));
  // Lecturas, listados, búsquedas y lo demás (manage_task, search_web…): hook-agente las deja pasar salvo
  // que nombren material personal; para eso recibe todos los argumentos.
  return rutas.length
    ? rutas.map((r) => ({ tool_name: 'Read', tool_input: { ...a, file_path: r } }))
    : [{ tool_name: nombre, tool_input: a }];
}

const relativa = (ruta) => path.relative(RAIZ, path.resolve(RAIZ, ruta)).split(path.sep).join('/');

try {
  const entrada = JSON.parse(readFileSync(0, 'utf8'));
  const nombre = String(entrada.toolCall?.name ?? '');
  const args = entrada.toolCall?.args ?? {};
  if (!nombre) responder('deny', 'Bloqueado por la fábrica: llamada sin nombre de herramienta.');

  // Los subagentes y las preguntas no sirven sin interfaz: nadie contesta y se saltarían la propiedad.
  if (/subagent|ask_question|ask_user/i.test(nombre)) {
    responder('deny', 'Bloqueado por la fábrica: corres sin interfaz; no lanzas subagentes ni preguntas. Anótalo en SOLICITUDES de tu entrega.');
  }

  const tarea = process.env.FABRICA_TAREA ?? '';
  const sub = process.env.FABRICA_SUBTAREA ?? '';
  const escribeArchivos = PARECE_ESCRITURA.test(nombre) && !PARECE_COMANDO.test(nombre) && !PARECE_MCP.test(nombre);
  const llamadas = traducir(nombre, args);
  if (escribeArchivos && llamadas.length === 0) {
    responder('deny', `Bloqueado por la fábrica: ${nombre} escribe y no trae una ruta que el hook pueda juzgar. Usa una herramienta de archivos con su ruta.`);
  }

  const agente = `gemini${tarea ? `:${tarea}${sub ? `/${sub}` : ''}` : ''}`;
  for (const claude of llamadas) {
    const r = spawnSync(process.execPath, [path.join(RAIZ, 'fabrica/scripts/hook-agente.mjs')], {
      input: JSON.stringify({ ...claude, agent_type: agente }),
      env: { ...process.env, CLAUDE_PROJECT_DIR: RAIZ },
      encoding: 'utf8',
      timeout: 8000,
    });
    if (r.status === 2) responder('deny', (r.stderr || 'Bloqueado por la fábrica.').trim());
    if (r.status !== 0) responder('deny', `Bloqueado por la fábrica: el hook falló (código ${r.status}${r.error ? `, ${r.error.message}` : ''}).`);
  }

  // Propiedad por subtarea: solo en una sesión lanzada por gemini.mjs.
  if (escribeArchivos && process.env.FABRICA_ARCHIVOS) {
    const propios = JSON.parse(process.env.FABRICA_ARCHIVOS);
    const buzon = tarea ? [`fabrica/buzon/${tarea}/**`] : [];
    for (const claude of llamadas) {
      const destino = relativa(String(claude.tool_input.file_path ?? ''));
      if (!coincide(destino, [...propios, ...buzon], 'i')) {
        const quien = sub && sub !== 'integracion' ? `la subtarea ${sub} de ${tarea}` : tarea;
        try {
          // hook-agente ya anotó «permitido» (sus reglas pasaron); la negación por propiedad va aparte.
          const linea = { fecha: new Date().toISOString(), origen: 'gemini', agente, herramienta: nombre, detalle: destino, decision: `negado: no es de ${quien}` };
          appendFileSync(process.env.HOOK_REGISTRO || path.join(RAIZ, 'fabrica/datos/hook.jsonl'), `${JSON.stringify(linea)}\n`);
        } catch {
          // el registro nunca decide
        }
        responder('deny', `Bloqueado por la fábrica: ${destino} no es de ${quien}. Si lo necesitas, va en SOLICITUDES de tu entrega.`);
      }
    }
  }
  responder('allow');
} catch (error) {
  responder('deny', `Bloqueado por la fábrica: el hook falló (${error instanceof Error ? error.message : String(error)}).`);
}
