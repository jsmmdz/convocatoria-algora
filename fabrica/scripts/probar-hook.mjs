#!/usr/bin/env node
/**
 * Casos del hook de agentes: cada uno dice qué agente llama, con qué herramienta y qué se espera
 * (permitido o negado). Sale con 1 si alguno no da lo esperado. Se corre después de tocar el hook:
 *   node fabrica/scripts/probar-hook.mjs
 * No deja rastro en fabrica/datos/hook.jsonl (usa una copia temporal de la raíz para el registro).
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOOK = path.join(RAIZ, 'fabrica/scripts/hook-agente.mjs');
const ABS = RAIZ.split(path.sep).join('/');
const SCRATCH = 'C:/Users/x/AppData/Local/Temp/claude/abc/scratchpad';

// Raíz falsa con la configuración real, para que el registro no ensucie el hook.jsonl de verdad.
const falsa = mkdtempSync(path.join(tmpdir(), 'hook-'));
mkdirSync(path.join(falsa, 'fabrica/proyecto'), { recursive: true });
cpSync(path.join(RAIZ, 'fabrica/proyecto/compuertas.json'), path.join(falsa, 'fabrica/proyecto/compuertas.json'));
const FALSA = falsa.split(path.sep).join('/');

const bash = (command) => ({ tool_name: 'Bash', tool_input: { command } });
const ps = (command) => ({ tool_name: 'PowerShell', tool_input: { command } });
const write = (file_path) => ({ tool_name: 'Write', tool_input: { file_path, content: 'x' } });

const casos = [
  // [agente, llamada, esperado, nota]
  [null, bash(`cat > ${SCRATCH}/x.mjs <<'EOF'\nhola\nEOF`), 'permitido', 'el orquestador no pasa por el hook'],
  // E1 de T02: escrituras fuera del repo desde la terminal
  ['constructor', bash(`cat > ${SCRATCH}/solape.mjs <<'EOF'\nconst a = b > c;\nEOF`), 'negado', 'heredoc al scratchpad'],
  ['constructor', bash(`node ${SCRATCH}/solape.mjs`), 'negado', 'correr algo del scratchpad'],
  ['constructor', bash('echo hola > /tmp/x.txt'), 'negado', 'redirección a /tmp'],
  ['constructor', bash('echo hola > C:/otra/carpeta/x.txt'), 'negado', 'redirección a una ruta absoluta fuera'],
  ['constructor', bash('echo hola > ../../fuera.txt'), 'negado', 'relativa que sale del repo desde la raíz y desde sitio/'],
  ['constructor', ps('"hola" | Out-File -FilePath C:\\otra\\x.txt'), 'negado', 'Out-File fuera'],
  ['constructor', ps('Set-Content -Path $env:TEMP\\x.txt -Value 1'), 'negado', 'Set-Content al TEMP'],
  ['constructor', bash('node -e "require(\'fs\').writeFileSync(\'C:/otra/x.js\', \'1\')"'), 'negado', 'writeFileSync fuera'],
  ['constructor', bash('cp sitio/src/x.ts /c/otra/x.ts'), 'negado', 'cp con destino fuera (Git Bash)'],
  ['constructor', write(`${SCRATCH}/ver.mjs`), 'negado', 'Write fuera'],
  ['constructor', write('C:/otra/x.mjs'), 'negado', 'Write fuera'],
  // Lo que el constructor sí puede
  ['constructor', bash('mkdir -p fabrica/buzon/T02/tmp && cat > fabrica/buzon/T02/tmp/solape.mjs <<\'EOF\'\nconst f = (a) => a > 2;\nEOF'), 'permitido', 'scripts temporales en el buzón'],
  ['constructor', bash('cd sitio && npx astro build 2>&1 | tail -5'), 'permitido', 'build con 2>&1'],
  ['constructor', bash('cd sitio && npx playwright test tests/T02 > ../fabrica/buzon/T02/tmp/salida.txt 2>/dev/null'), 'permitido', 'redirección relativa desde sitio/'],
  ['constructor', bash(`node -e "const a = [1,2].filter(x => x > 1); console.log(a)"`), 'permitido', 'flecha y > entre comillas'],
  ['constructor', bash(`cat > sitio/src/lib/x.ts <<'EOF'\nexport const f = (a: number) => a > 2 ? 'x' : "y";\nEOF`), 'permitido', 'heredoc dentro del repo'],
  ['constructor', bash('grep -rn "x" sitio/src | head'), 'permitido', 'lectura'],
  ['constructor', bash(`ls "${ABS}/sitio/src" > "${ABS}/fabrica/buzon/T02/tmp/l.txt"`), 'permitido', 'ruta absoluta dentro del repo'],
  ['constructor', write('sitio/src/lib/x.ts'), 'permitido', 'Write dentro'],
  // Git (F23)
  ['constructor', bash('git -C sitio checkout -- .'), 'negado', 'git checkout con -C'],
  ['constructor', bash('git show HEAD:sitio/x.ts > sitio/x.ts'), 'negado', 'git show redirigido'],
  ['constructor', bash('git status && git diff --stat'), 'permitido', 'git de lectura'],
  // Auditores: solo el buzón, también desde la terminal
  ['qa', bash(`cat > ${SCRATCH}/m.cjs <<'EOF'\n1\nEOF`), 'negado', 'QA al scratchpad'],
  ['qa', bash('echo 1 > sitio/src/x.ts'), 'negado', 'QA escribe en el sitio'],
  ['qa', bash('cat fabrica/buzon/T02/QA-r1.md README.md'), 'permitido', '«.md» no es el comando md'],
  ['qa', bash('rm sitio/src/x.ts'), 'negado', 'QA borra del sitio'],
  ['qa', bash('cp sitio/src/lib/trama.ts fabrica/buzon/T02/tmp/'), 'permitido', 'QA copia al buzón'],
  ['qa', bash('node fabrica/scripts/capturas.mjs T02'), 'permitido', 'capturas'],
  ['qa', bash('cd sitio && npx playwright test tests/T02 --reporter=line 2>&1 | tail -20'), 'permitido', 'pruebas'],
  ['qa', bash('node -e "require(\'fs\').writeFileSync(\'sitio/x.txt\', \'1\')"'), 'negado', 'writeFileSync fuera del buzón'],
  ['qa', write('fabrica/buzon/T02/QA-r4.md'), 'permitido', 'Write en el buzón'],
  ['qa', write('sitio/src/x.ts'), 'negado', 'Write fuera del buzón'],
  ['analista-referente', bash('curl -sL -o fabrica/buzon/T03/tmp/app.js https://ejemplo.com/assets/app.js'), 'permitido', 'bundle al buzón'],
  ['analista-referente', bash('curl -sL https://ejemplo.com/app.js > fabrica/buzon/T03/tmp/app.js'), 'permitido', 'bundle redirigido al buzón'],
  ['analista-referente', bash(`curl -sL -o ${SCRATCH}/app.js https://ejemplo.com/app.js`), 'negado', 'bundle al scratchpad'],
  // E6 de T03: las rutas relativas se resuelven contra el `cd` del comando
  ['qa', bash("cd fabrica/buzon/T03/tmp && cat > qa2.mjs <<'EOF'\nconst a = 1 > 0;\nEOF"), 'permitido', 'cd al tmp del buzón y escribe relativo'],
  ['qa', bash(`cd fabrica/buzon/T03/tmp && node -e "require('fs').writeFileSync('af.mjs', '1')"`), 'permitido', 'writeFileSync relativo tras cd al buzón'],
  ['qa', bash('cd sitio && echo 1 > src/x.ts'), 'negado', 'cd sitio y escribe en el sitio'],
  ['constructor', bash('cd /c/otra && echo hola > x.txt'), 'negado', 'cd fuera del repo (Git Bash) y escribe relativo'],
  ['constructor', bash('cd ~ && echo hola > x.txt'), 'negado', 'cd al home y escribe relativo'],
  ['constructor', ps('Set-Location C:\\otra; "hola" | Out-File x\\y.txt'), 'negado', 'Set-Location fuera y Out-File relativo'],
  ['constructor', bash('echo 1 > fabrica/buzon/T03/tmp/a.txt && cd /c/otra && ls'), 'permitido', 'el cd que va después no cuenta'],
  // Varios
  ['constructor', { tool_name: 'mcp__x__y', tool_input: {} }, 'negado', 'MCP'],
];

let fallas = 0;
for (const [agente, llamada, esperado, nota] of casos) {
  const entrada = { ...llamada, ...(agente ? { agent_type: agente } : {}) };
  // El hook juzga contra la raíz real (rutas absolutas del repo) pero registra en la falsa: se le pasa
  // la real como CLAUDE_PROJECT_DIR y se redirige solo el registro con HOOK_REGISTRO.
  const r = spawnSync(process.execPath, [HOOK, '--desde-settings'], {
    input: JSON.stringify(entrada),
    env: { ...process.env, CLAUDE_PROJECT_DIR: RAIZ, HOOK_REGISTRO: path.join(FALSA, 'hook.jsonl') },
    encoding: 'utf8',
  });
  const obtenido = r.status === 0 ? 'permitido' : r.status === 2 ? 'negado' : `salida ${r.status}`;
  const ok = obtenido === esperado;
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${(agente ?? 'orquestador').padEnd(18)} ${esperado.padEnd(9)} ${nota}${ok ? '' : `  → ${obtenido}: ${r.stderr.trim()}`}`);
}
rmSync(falsa, { recursive: true, force: true });
console.log(fallas ? `\n${fallas} caso(s) no dan lo esperado` : `\n${casos.length} casos en verde`);
process.exit(fallas ? 1 : 0);
