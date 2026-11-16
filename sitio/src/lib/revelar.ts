// Entradas al hacer scroll (leadoff K1): lo marcado con [data-revelar] sube y aparece una sola vez al entrar
// en pantalla. El estado oculto solo existe cuando este módulo corrió (data-revelar-listo en <html>): sin JS
// o con movimiento reducido el contenido está siempre a la vista.
import { movimientoReducido } from './movimiento';

export function iniciarRevelar(): void {
  if (movimientoReducido || !('IntersectionObserver' in window)) return;
  const elementos = Array.from(document.querySelectorAll<HTMLElement>('[data-revelar]'));
  if (elementos.length === 0) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.setAttribute('data-visto', '');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );

  document.documentElement.setAttribute('data-revelar-listo', '');
  for (const el of elementos) observador.observe(el);
}
