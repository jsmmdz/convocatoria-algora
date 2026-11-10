/**
 * Puertos y rutas del repo (fábrica v3.4, 2026-10-06).
 *
 * Los puertos de la fábrica son fijos, para que un servidor suelto nunca atienda (ni mate) a otro.
 * `PUERTO_PRUEBAS` en el entorno manda sobre el de Playwright.
 *
 * Las rutas resuelven igual desde el checkout principal o desde un worktree de la app de Claude
 * (`.claude/worktrees/`): el turno de pruebas vive en la carpeta `.git` común y las métricas
 * (`fabrica/datos/`) se escriben en el checkout principal.
 */
import { execSync } from 'node:child_process';
import { dirname, isAbsolute, resolve } from 'node:path';

export const PUERTOS = { dev: 4321, pruebas: 4329, capturas: 4331, sueltos: [4390, 4399], monitor: 4747 };

const git = (args, cwd) =>
  execSync(`git ${args}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** Los puertos. Con `PUERTO_PRUEBAS`, las capturas van en ese más 2. */
export function puertos() {
  const p = { ...PUERTOS };
  if (process.env.PUERTO_PRUEBAS) {
    p.pruebas = Number(process.env.PUERTO_PRUEBAS);
    p.capturas = p.pruebas + 2;
  }
  return p;
}

/** La carpeta .git común a todos los worktrees: ahí vive el turno de pruebas. */
export function gitComun(cwd = process.cwd()) {
  const d = git('rev-parse --git-common-dir', cwd);
  return isAbsolute(d) ? d : resolve(cwd, d);
}

/**
 * La raíz del checkout principal, aunque se corra desde un worktree. Las métricas (`fabrica/datos/`)
 * se escriben aquí: desde un worktree dentro de `.claude/worktrees/` caerían en otra carpeta sin avisar.
 */
export const raizPrincipal = (cwd = process.cwd()) => dirname(gitComun(cwd));
