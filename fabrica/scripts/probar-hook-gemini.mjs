#!/usr/bin/env node
/**
 * Casos del hook de los constructores Gemini (hook-gemini.mjs), como los llama Antigravity: con
 * `.agents/` como cwd y la llamada por stdin. Simula la sesión de la subtarea S1 de una tarea T99 que
 * solo es dueña de sitio/src/components/Prueba1.astro. No escribe nada: el hook solo decide.
 *
 *   node fabrica/scripts/probar-hook-gemini.mjs
 *
 * Sale con 1 si algún caso no da lo esperado. Córrelo después de tocar el hook o al cambiar de versión
 * de agy (los nombres de las herramientas cambian: ver la cabecera de hook-gemini.mjs).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..').split(path.sep).join('/');
const propio = `${RAIZ}/sitio/src/components/Prueba1.astro`;
const ajeno = `${RAIZ}/sitio/src/lib/prueba2.ts`;

const casos = [
  // Gemini 4 con el agente constructor (agy 1.2)
  ['write_file propio', 'write_file', { Path: propio, Content: 'x' }, 'allow'],
  ['write_file ajeno (el de otra subtarea)', 'write_file', { Path: ajeno, Content: 'x' }, 'deny'],
  ['write_file ajeno con la ruta entre comillas', 'write_file', { Path: `"${ajeno}"`, Content: 'x' }, 'deny'],
  ['write_file en su buzón', 'write_file', { Path: `${RAIZ}/fabrica/buzon/T99/ENTREGA-r1-S1.md`, Content: 'x' }, 'allow'],
  ['write_file en otro buzón', 'write_file', { Path: `${RAIZ}/fabrica/buzon/T03/QA-r9.md`, Content: 'x' }, 'deny'],
  ['edit_file ajeno', 'edit_file', { Path: ajeno, OldString: 'a', NewString: 'b' }, 'deny'],
  ['delete_file ajeno', 'delete_file', { Path: ajeno }, 'deny'],
  ['escritura sin ruta juzgable', 'write_file', { Content: 'x' }, 'deny'],
  ['read_file', 'read_file', { Path: `${RAIZ}/docs/1-PRODUCTO.md` }, 'allow'],
  // Herramientas de la v2.4
  ['write_to_file propio', 'write_to_file', { TargetFile: propio }, 'allow'],
  ['replace_file_content ajeno', 'replace_file_content', { TargetFile: ajeno }, 'deny'],
  ['view_file', 'view_file', { AbsolutePath: `${RAIZ}/docs/1-PRODUCTO.md` }, 'allow'],
  // Reglas de siempre (hook-agente)
  ['ruta protegida (pruebas)', 'write_file', { Path: `${RAIZ}/sitio/tests/T99/x.spec.ts`, Content: 'x' }, 'deny'],
  ['su propio hook', 'write_file', { Path: `${RAIZ}/.agents/hooks.json`, Content: '{}' }, 'deny'],
  ['git stash', 'run_command', { CommandLine: 'git stash list' }, 'deny'],
  ['git -C sitio checkout', 'run_command', { CommandLine: 'git -C sitio checkout -- .' }, 'deny'],
  ['git status', 'run_command', { CommandLine: 'git status --short' }, 'allow'],
  ['escribir fuera del repo por terminal', 'run_command', { CommandLine: 'echo x > C:/Users/otro/Desktop/x.txt' }, 'deny'],
  ['compuertas', 'run_command', { CommandLine: 'node fabrica/scripts/compuertas.mjs T99 --sin-build' }, 'allow'],
  ['MCP', 'call_mcp_tool', { ServerName: 'github', ToolName: 'push' }, 'deny'],
  ['subagente', 'invoke_subagent', {}, 'deny'],
  ['pregunta al usuario', 'ask_question', {}, 'deny'],
];

const dir = mkdtempSync(path.join(tmpdir(), 'hook-gemini-'));
const env = {
  ...process.env,
  FABRICA_TAREA: 'T99',
  FABRICA_SUBTAREA: 'S1',
  FABRICA_ARCHIVOS: JSON.stringify(['sitio/src/components/Prueba1.astro']),
  HOOK_REGISTRO: path.join(dir, 'hook.jsonl'), // no ensucia fabrica/datos/hook.jsonl
};
let malos = 0;
for (const [nombre, herramienta, args, esperado] of casos) {
  const r = spawnSync(process.execPath, ['../fabrica/scripts/hook-gemini.mjs'], {
    cwd: path.join(RAIZ, '.agents'), input: JSON.stringify({ toolCall: { name: herramienta, args } }), env, encoding: 'utf8',
  });
  let d = {};
  try {
    d = JSON.parse(r.stdout || '{}');
  } catch {
    d = { decision: `salida rara: ${r.stdout}` };
  }
  const ok = d.decision === esperado;
  if (!ok) malos++;
  console.log(`${ok ? '✔' : '✘'} ${nombre}: ${d.decision}${!ok && d.reason ? ` — ${d.reason}` : ''}`);
}
rmSync(dir, { recursive: true, force: true });
console.log(malos ? `\n${malos} caso(s) no dan lo esperado.` : `\nLos ${casos.length} casos dan lo esperado.`);
process.exit(malos ? 1 : 0);
