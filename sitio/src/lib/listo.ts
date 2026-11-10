// Contrato `data-listo` (docs/2-TECNICO § 2): en la página con precarga lo pone el final de la entrada del
// titular (portada.ts); en las demás, el evento `load`. Siempre hay respaldo por tiempo.
const RESPALDO_MS = 3500;
export const EVENTO_LISTO = 'algora:listo';

export function estaListo(): boolean {
  return 'listo' in document.documentElement.dataset;
}

export function marcarListo(): void {
  if (estaListo()) return;
  document.documentElement.dataset.listo = '';
  document.dispatchEvent(new Event(EVENTO_LISTO));
}

/** Ejecuta `fn` cuando la página esté lista (de inmediato si ya lo está). */
export function alListo(fn: () => void): void {
  if (estaListo()) fn();
  else document.addEventListener(EVENTO_LISTO, fn, { once: true });
}

export function iniciarListo(): void {
  // Con precarga, `load` solo libera la cuenta: el final lo marca la entrada del titular.
  const conPrecarga = document.querySelector('[data-precarga]') !== null;
  if (!conPrecarga) {
    if (document.readyState === 'complete') marcarListo();
    else window.addEventListener('load', marcarListo, { once: true });
  }
  // Toda espera tiene salida: si `load` o la entrada no terminan, se marca igual (F8).
  // El tope se cuenta desde la navegación, no desde que corre este módulo.
  window.setTimeout(marcarListo, Math.max(0, RESPALDO_MS - performance.now()));
}
