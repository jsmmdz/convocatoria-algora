// Fábrica v3.2 (autor, 2026-10-04): toda corrida de Playwright, completa o parcial, toma el turno de
// pruebas antes de empezar, para que dos corridas nunca se crucen. Lo que devuelve es el
// teardown: suelta el turno al terminar. Detalle en fabrica/scripts/lib/turno.mjs.
import { tomarTurno } from '../../../fabrica/scripts/lib/turno.mjs';

export default async function turnoGlobal() {
  return tomarTurno(`playwright ${process.argv.slice(2).join(' ')}`.trim());
}
