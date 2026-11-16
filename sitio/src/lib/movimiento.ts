import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

// Corte único del sitio (R-7, docs/1-PRODUCTO § 7). El modo de escritorio (pin de hitos y productos, hélice)
// pide ancho, puntero fino y movimiento: una tableta o un celular usan el modo táctil, que no secuestra el gesto.
export const CONSULTA_ESCRITORIO = '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
/** Angosto o táctil, con o sin movimiento reducido (para lo que es scroll nativo, como el carrusel). */
export const CONSULTA_TACTIL = '(max-width: 1023.98px), (pointer: coarse)';
/** Angosto o táctil y con movimiento (para lo animado del modo táctil, como la línea vertical de los hitos). */
export const CONSULTA_TACTIL_ANIMADO = '(prefers-reduced-motion: no-preference) and (max-width: 1023.98px), (prefers-reduced-motion: no-preference) and (pointer: coarse)';

export const movimientoReducido: boolean =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let alTick: ((tiempo: number) => void) | null = null;

// Una sola instancia de Lenis, conectada al ticker de GSAP. Con movimiento reducido no se crea.
function crearLenis(): Lenis | null {
  if (typeof window === 'undefined' || movimientoReducido) return null;
  const instancia = new Lenis({ autoRaf: false });
  instancia.on('scroll', ScrollTrigger.update);
  alTick = (tiempo: number) => instancia.raf(tiempo * 1000);
  gsap.ticker.add(alTick);
  gsap.ticker.lagSmoothing(0);
  return instancia;
}

export const lenis: Lenis | null = crearLenis();

// Libera el ticker y Lenis (las tareas que monten escenas pesadas pueden llamarlo).
export function liberarMovimiento(): void {
  if (alTick) gsap.ticker.remove(alTick);
  alTick = null;
  lenis?.destroy();
}

export { gsap, ScrollTrigger };
