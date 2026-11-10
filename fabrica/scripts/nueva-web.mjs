#!/usr/bin/env node
/**
 * Crea una web nueva desde el preset de la fábrica.
 *
 *   node fabrica/scripts/nueva-web.mjs <carpeta-destino>
 *
 * Copia la fábrica, las plantillas de docs/, ENCARGO.md, CLAUDE.md, .claude/, .github/ y las pruebas
 * comunes de sitio/. No copia nada que sea de una web en particular: el buzón, las métricas, las
 * capturas y videos de referentes, las tareas, las fichas, el código del sitio ni sus dependencias.
 * Después hace `git init` en la carpeta nueva. No crea el repo en GitHub ni publica nada.
 *
 * El destino tiene que no existir o estar vacío: nunca se mezcla con una web que ya existe.
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGEN = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const destino = process.argv[2] && resolve(process.argv[2]);
if (!destino) {
  console.error('Uso: node fabrica/scripts/nueva-web.mjs <carpeta-destino>');
  process.exit(2);
}
if (existsSync(destino) && readdirSync(destino).length) {
  console.error(`${destino} ya existe y no está vacía: elige otra carpeta.`);
  process.exit(2);
}

// Lo que se copia, relativo a la raíz del preset.
const COPIAR = [
  'ENCARGO.md', 'CLAUDE.md', '.gitignore', '.gitattributes',
  '.claude/agents', '.claude/workflows', '.claude/settings.json', '.claude/launch.json',
  '.github', 'docs', 'fabrica/LEEME.md', 'fabrica/nucleo', 'fabrica/scripts',
  'fabrica/proyecto/compuertas.json', 'referentes/_sitios.json',
  'sitio/tests/comunes', 'sitio/playwright.config.ts', 'sitio/tsconfig.json', 'sitio/.gitignore',
];
// Carpetas que nacen vacías en la web nueva (con .gitkeep para que git las guarde).
const VACIAS = ['fabrica/buzon', 'fabrica/proyecto/tareas', 'fabrica/proyecto/referentes', 'referentes/capturas', 'referentes/videos'];
// Nunca se copia, aunque viva dentro de algo de COPIAR.
const nunca = (ruta) => /(^|[\\/])(node_modules|dist|\.astro|test-results|playwright-report|worktrees)([\\/]|$)/.test(ruta);

for (const r of COPIAR) {
  const de = join(ORIGEN, r);
  if (!existsSync(de)) { console.log(`  ⚠ falta en el preset: ${r}`); continue; }
  cpSync(de, join(destino, r), { recursive: true, filter: (f) => !nunca(relative(ORIGEN, f)) });
}
for (const v of VACIAS) {
  mkdirSync(join(destino, v), { recursive: true });
  writeFileSync(join(destino, v, '.gitkeep'), '');
}

execSync('git init -b main', { cwd: destino, stdio: 'ignore' });
const nombre = destino.split(sep).pop();
console.log(`Web nueva en ${destino}

Siguiente:
  1. Llena ${nombre}/ENCARGO.md: instrucciones claras y referentes (lo marcado con ★).
  2. Abre una sesión de Claude Code en esa carpeta: el orquestador arranca desde el encargo
     (fabrica/nucleo/roles/orquestador.md § 0) y no construye nada sin tu visto bueno al plan.`);
