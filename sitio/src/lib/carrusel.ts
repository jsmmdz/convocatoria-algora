// Carrusel de proyectos para celular y tableta (R-2). Es scroll nativo con ajuste a cada tarjeta
// (scroll-snap en CSS): aquí solo se activa el modo, se lleva el contador, las flechas y el teclado.
// No secuestra el gesto: el scroll vertical de la página sigue siendo del navegador.
import { gsap, CONSULTA_TACTIL, movimientoReducido } from './movimiento';

const limitar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
const dos = (n: number): string => String(n).padStart(2, '0');

/** Activa el carrusel sobre las tarjetas que haya en el DOM en ese momento. Devuelve cómo deshacerlo. */
export function montarCarrusel(seccion: HTMLElement): () => void {
  const mm = gsap.matchMedia();

  mm.add(CONSULTA_TACTIL, () => {
    const lista = seccion.querySelector<HTMLElement>('[data-tarjetas]');
    const items = Array.from(seccion.querySelectorAll<HTMLElement>('[data-item]'));
    const tarjetas = items.map((it) => it.querySelector<HTMLElement>('[data-tarjeta]'));
    const posicion = seccion.querySelector<HTMLElement>('[data-posicion]');
    const anterior = seccion.querySelector<HTMLButtonElement>('[data-anterior]');
    const posterior = seccion.querySelector<HTMLButtonElement>('[data-posterior]');
    const n = items.length;
    if (!lista || n < 2) return;

    seccion.dataset.modo = 'carrusel';

    let actual = -1;
    let cuadro = 0;

    // Tarjeta más cercana al centro de la fila; en los extremos manda el borde (la primera y la última
    // no pueden quedar centradas).
    const indiceVisible = (): number => {
      const maximo = lista.scrollWidth - lista.clientWidth;
      if (lista.scrollLeft <= 1) return 0;
      if (lista.scrollLeft >= maximo - 1) return n - 1;
      const caja = lista.getBoundingClientRect();
      const centro = caja.left + caja.width / 2;
      let mejor = 0;
      let distancia = Infinity;
      items.forEach((it, i) => {
        const c = it.getBoundingClientRect();
        const d = Math.abs(c.left + c.width / 2 - centro);
        if (d < distancia) {
          distancia = d;
          mejor = i;
        }
      });
      return mejor;
    };

    const actualizar = (): void => {
      cuadro = 0;
      const i = indiceVisible();
      if (i === actual) return;
      actual = i;
      tarjetas.forEach((t, k) => {
        if (k === i) t?.setAttribute('aria-current', 'true');
        else t?.removeAttribute('aria-current');
      });
      if (posicion) posicion.textContent = `${dos(i + 1)} / ${dos(n)}`;
      if (anterior) anterior.disabled = i === 0;
      if (posterior) posterior.disabled = i === n - 1;
    };

    const alDeslizar = (): void => {
      if (cuadro === 0) cuadro = requestAnimationFrame(actualizar);
    };
    lista.addEventListener('scroll', alDeslizar, { passive: true });
    window.addEventListener('resize', alDeslizar);

    const irA = (i: number): void => {
      const item = items[limitar(i, 0, n - 1)];
      const caja = lista.getBoundingClientRect();
      const c = item.getBoundingClientRect();
      const destino = lista.scrollLeft + (c.left + c.width / 2 - (caja.left + caja.width / 2));
      lista.scrollTo({ left: destino, behavior: movimientoReducido ? 'auto' : 'smooth' });
    };

    // Con una tarjeta enfocada se cuenta desde ella; si no, desde la que se ve.
    const mover = (delta: number): void => {
      const enfocada = tarjetas.findIndex((t) => t !== null && t === document.activeElement);
      const destino = limitar((enfocada >= 0 ? enfocada : actual) + delta, 0, n - 1);
      irA(destino);
      if (enfocada >= 0) tarjetas[destino]?.focus({ preventScroll: true });
    };

    const alTeclear = (e: KeyboardEvent): void => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      mover(e.key === 'ArrowLeft' ? -1 : 1);
    };
    seccion.addEventListener('keydown', alTeclear);
    const alAnterior = (): void => mover(-1);
    const alPosterior = (): void => mover(1);
    anterior?.addEventListener('click', alAnterior);
    posterior?.addEventListener('click', alPosterior);

    actualizar();
    // Las fuentes cambian el alto y el ancho de las tarjetas: se vuelve a medir al cargar.
    void document.fonts.ready.then(alDeslizar);

    return () => {
      if (cuadro !== 0) cancelAnimationFrame(cuadro);
      lista.removeEventListener('scroll', alDeslizar);
      window.removeEventListener('resize', alDeslizar);
      seccion.removeEventListener('keydown', alTeclear);
      anterior?.removeEventListener('click', alAnterior);
      posterior?.removeEventListener('click', alPosterior);
      lista.scrollLeft = 0;
      tarjetas.forEach((t) => t?.removeAttribute('aria-current'));
      if (anterior) anterior.disabled = false;
      if (posterior) posterior.disabled = false;
      if (seccion.dataset.modo === 'carrusel') delete seccion.dataset.modo;
    };
  });

  return () => mm.revert();
}
