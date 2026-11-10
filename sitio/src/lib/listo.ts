// Contrato `data-listo` (docs/2-TECNICO § 2): T02 lo moverá al final de la precarga.
const RESPALDO_MS = 3500;

export function marcarListo(): void {
  document.documentElement.dataset.listo = '';
}

export function iniciarListo(): void {
  if (document.readyState === 'complete') marcarListo();
  else window.addEventListener('load', marcarListo, { once: true });
  // Toda espera tiene salida: si `load` no llega, se marca igual (F8).
  // El tope se cuenta desde la navegación, no desde que corre este módulo.
  window.setTimeout(marcarListo, Math.max(0, RESPALDO_MS - performance.now()));
}
