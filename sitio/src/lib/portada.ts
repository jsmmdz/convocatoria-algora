// Precarga y portada: orquesta la cuenta, la entrada del titular, la trama, el parallax y las piezas 3D.
// El estado inicial de la entrada lo pone este módulo (gsap.from): sin JS o con movimiento reducido el
// titular se ve completo desde el primer momento.
import { gsap, ScrollTrigger, movimientoReducido } from './movimiento';
import { alListo, marcarListo } from './listo';
import { leerNumero, leerSegundos } from './tokens';
import { hayWebGL } from './webgl';
import { montarTrama } from './trama';

/**
 * Precarga (unseen A1): la cuenta [NN%] sube a ~90 y solo llega a 100 con `load`; nunca baja ni salta.
 * Al llegar a 100 la capa se funde y se va; entonces llama a `alIrse`. Devuelve cómo cortarla en seco.
 */
function iniciarPrecarga(precarga: HTMLElement, alIrse: () => void): () => void {
  const salida = precarga.querySelector<HTMLElement>('[data-precarga-cuenta]');
  const estado = { valor: 0 };
  let mostrado = -1;
  const pintar = (): void => {
    const n = Math.min(100, Math.floor(estado.valor));
    if (n <= mostrado) return;
    mostrado = n;
    if (salida) salida.textContent = `[${n}%]`;
  };
  const tweens: gsap.core.Tween[] = [];
  const irse = (): void => {
    tweens.push(
      gsap.to(precarga, {
        opacity: 0,
        duration: leerSegundos('--precarga-fundido', 0.35),
        ease: 'power2.out',
        onComplete: () => {
          precarga.remove();
          alIrse();
        },
      }),
    );
  };
  let cargada = document.readyState === 'complete';
  let rematando = false;
  let llegoA90 = false;
  const rematar = (): void => {
    if (rematando || !cargada || !llegoA90) return;
    rematando = true;
    tweens.push(gsap.to(estado, { valor: 100, duration: leerSegundos('--precarga-subida', 0.3), ease: 'none', onUpdate: pintar, onComplete: irse }));
  };
  tweens.push(
    gsap.to(estado, {
      valor: 90,
      duration: leerSegundos('--precarga-cuenta', 1.5),
      ease: 'power2.out',
      onUpdate: pintar,
      onComplete: () => {
        llegoA90 = true;
        rematar();
      },
    }),
  );
  if (!cargada) {
    window.addEventListener(
      'load',
      () => {
        cargada = true;
        rematar();
      },
      { once: true },
    );
  }
  return () => {
    for (const t of tweens) t.kill();
    precarga.remove();
  };
}

/** Entrada del titular (leadoff K1/A3): líneas desde abajo, objeto que crece y etiquetas con fundido. */
function crearEntrada(portada: HTMLElement): gsap.core.Timeline {
  const hijos = gsap.utils.toArray<HTMLElement>('[data-linea] > *', portada);
  const objeto = portada.querySelector<HTMLElement>('[data-objeto]');
  const etiquetas = portada.querySelector<HTMLElement>('[data-etiquetas]');
  const dur = leerSegundos('--entrada-linea', 0.6);
  const escalon = leerSegundos('--entrada-escalon', 0.05);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: marcarListo });
  tl.from(hijos, { yPercent: 110, duration: dur, stagger: escalon }, 0);
  if (objeto) tl.from(objeto, { width: 0, scale: 0, duration: dur }, escalon);
  if (etiquetas) tl.from(etiquetas, { opacity: 0, duration: leerSegundos('--entrada-etiquetas', 0.8), ease: 'none' }, 0);
  return tl;
}

/** Parallax de las capas (tabletales K1): cada una baja con la página pero más lento, a su propio factor. */
function crearParallax(portada: HTMLElement): void {
  for (const capa of portada.querySelectorAll<HTMLElement>('[data-capa]')) {
    const factor = leerNumero('--parallax', 0, capa);
    if (factor <= 0) continue;
    gsap.to(capa, {
      yPercent: factor * 100,
      ease: 'none',
      scrollTrigger: { trigger: portada, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/** Three y las piezas llegan con `import()` dinámico después de `data-listo`: no pesan en la primera pintura. */
function cargarCapas3D(portada: HTMLElement): void {
  if (!hayWebGL()) return;
  alListo(() => {
    void import('./capas3d')
      .then(({ montarCapas }) => montarCapas(portada, movimientoReducido))
      .then((liberar) => {
        window.addEventListener('pagehide', (e) => { if (!e.persisted) liberar(); }, { once: true });
      })
      .catch(() => {
        // Sin las piezas la portada sigue completa (respaldo en el DOM).
      });
  });
}

export function iniciarPortada(): void {
  const portada = document.querySelector<HTMLElement>('section[data-portada]');
  if (!portada) return;
  const precarga = document.querySelector<HTMLElement>('[data-precarga]');

  const trama = hayWebGL() ? montarTrama(portada, movimientoReducido) : null;
  if (trama) window.addEventListener('pagehide', (e) => { if (!e.persisted) trama.liberar(); }, { once: true });
  cargarCapas3D(portada);

  if (movimientoReducido) {
    // Sin precarga, sin entrada y sin parallax: el contenido completo desde el principio.
    precarga?.remove();
    marcarListo();
    return;
  }

  crearParallax(portada);
  const entrada = crearEntrada(portada);
  const cortarPrecarga = precarga ? iniciarPrecarga(precarga, () => entrada.play()) : null;
  if (!precarga) entrada.play();

  // Si el respaldo por tiempo marca `data-listo` antes de terminar, la entrada salta a su estado final.
  alListo(() => {
    cortarPrecarga?.();
    entrada.progress(1);
    ScrollTrigger.refresh();
  });
}
