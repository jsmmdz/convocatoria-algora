/**
 * Turno de pruebas (fábrica v3.2, autor 2026-10-04; se quedó al cerrar los carriles, 2026-10-06).
 *
 * Dos procesos en el mismo computador (dos sesiones, o una sesión y un agente) no pueden correr
 * Playwright a la vez: el WebGL por software se atrasa y las pruebas de tiempos fallan (31 fallos
 * falsos con dos suites a la vez, falla F18). El turno es un archivo en la carpeta .git
 * común, que ven también los worktrees de la app de Claude.
 *
 * Lo toman `compuertas.mjs` (entera: check, build y e2e), `capturas.mjs` y cualquier
 * `npx playwright test`, completa o parcial (`sitio/tests/comunes/turno-global.mjs`). Los builds
 * sueltos no lo toman (autor, 2026-10-04). Un proceso hijo del dueño (compuertas → playwright) lo
 * hereda por `TURNO_PRUEBAS_PID` y no lo vuelve a pedir.
 *
 * Si lo tiene otro proceso, espera y lo dice. Si el dueño murió (Ctrl+C, apagón), se libera solo.
 * Las esperas se anotan en `fabrica/datos/turnos.jsonl`, para no contarlas como
 * tiempo de trabajo de los agentes.
 */
import { appendFileSync, closeSync, mkdirSync, openSync, readFileSync, rmSync, writeSync } from 'node:fs';
import { join } from 'node:path';
import { gitComun, raizPrincipal } from './repo.mjs';

const ESPERA_MAX_MIN = Number(process.env.TURNO_ESPERA_MAX_MIN ?? 60);
const CADA_MS = 10_000;

const archivoTurno = () => join(gitComun(), 'turno-pruebas.json');

function leer() {
  try {
    return JSON.parse(readFileSync(archivoTurno(), 'utf8'));
  } catch {
    return null;
  }
}

function vivo(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

function anotarEspera(comando, segundos, dueno) {
  try {
    const dir = join(raizPrincipal(), 'fabrica/datos');
    mkdirSync(dir, { recursive: true });
    appendFileSync(
      join(dir, 'turnos.jsonl'),
      JSON.stringify({ fecha: new Date().toISOString(), comando, espera_s: segundos, espero_a: dueno }) + '\n'
    );
  } catch {
    // Anotar la espera no puede tumbar las pruebas.
  }
}

/**
 * Toma el turno o espera a que se libere. Devuelve la función que lo suelta (no hace nada si el turno
 * ya era de un proceso padre).
 */
export async function tomarTurno(comando) {
  const heredado = process.env.TURNO_PRUEBAS_PID;
  const actual = leer();
  if (heredado && actual && String(actual.pid) === heredado) return () => {};

  const inicio = Date.now();
  let ultimoAviso = 0;
  let aQuien = null;
  for (;;) {
    try {
      const fd = openSync(archivoTurno(), 'wx');
      writeSync(fd, JSON.stringify({ pid: process.pid, comando, desde: new Date().toISOString() }));
      closeSync(fd);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const dueno = leer();
      // Dueño muerto o archivo a medio escribir: se libera. La carrera de dos que esperan al mismo
      // dueño muerto es improbable; si pasa, lo detecta la siguiente vuelta.
      if (!dueno || !vivo(dueno.pid)) {
        rmSync(archivoTurno(), { force: true });
        continue;
      }
      aQuien = `pid ${dueno.pid} · ${dueno.comando}`;
      const minutos = (Date.now() - inicio) / 60_000;
      if (minutos > ESPERA_MAX_MIN) {
        throw new Error(
          `Turno de pruebas: ${ESPERA_MAX_MIN} min esperando a otro proceso (pid ${dueno.pid}: ${dueno.comando}, desde ${dueno.desde}). ` +
            'No es un fallo de las pruebas: vuelve a intentarlo.'
        );
      }
      if (Date.now() - ultimoAviso > 60_000) {
        console.error(`⏳ Esperando el turno de pruebas: lo tiene otro proceso (pid ${dueno.pid}: ${dueno.comando}, desde ${dueno.desde}).`);
        ultimoAviso = Date.now();
      }
      await new Promise((r) => setTimeout(r, CADA_MS));
    }
  }

  const espera = Math.round((Date.now() - inicio) / 1000);
  if (espera >= 5) anotarEspera(comando, espera, aQuien);
  process.env.TURNO_PRUEBAS_PID = String(process.pid);

  let suelto = false;
  const soltar = () => {
    if (suelto) return;
    suelto = true;
    const d = leer();
    if (d && d.pid === process.pid) rmSync(archivoTurno(), { force: true });
  };
  process.once('exit', soltar);
  return soltar;
}
