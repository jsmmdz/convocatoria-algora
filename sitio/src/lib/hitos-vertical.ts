// Hitos en celular y tableta (R1-B, decisión R-1): los hitos siguen apilados con el scroll nativo; por el borde
// derecho baja una línea ondulada (punteada a todo el alto, sólida hasta donde vas) y el unicornio viaja apoyado
// en la unión, inclinándose con la velocidad. Sin pin y sin secuestrar el gesto.
import { gsap, ScrollTrigger, lenis } from './movimiento';
import { leerNumero } from './tokens';

// Respaldo único si un token no se lee (los valores reales viven en tokens.css; 1 evita divisiones por cero).
const SIN_TOKEN = 1;

export type ElementosVertical = {
  seccion: HTMLElement;
  pista: HTMLElement;
  guia: HTMLElement;
  viajero: HTMLElement;
  solida: HTMLElement;
  trazoPunteado: SVGPathElement;
  trazoSolido: SVGPathElement;
};

/** Activa el modo vertical y devuelve la función que lo libera todo. */
export function activarVertical(el: ElementosVertical): () => void {
  const { seccion, pista, guia, viajero, solida, trazoPunteado, trazoSolido } = el;
  seccion.dataset.modo = 'vertical';

  let ancho = 0;
  let alto = 0;
  let amplitud = 0;
  let centroX = 0;
  let largo = SIN_TOKEN;
  let fase = 0;
  let progreso = 0;

  /** x de la línea en una altura y: dos senos de largo distinto alrededor de un eje fijo junto al borde derecho. */
  const xEn = (y: number): number => {
    const pesoA = leerNumero('--linea-onda-peso-larga', SIN_TOKEN);
    const pesoB = leerNumero('--linea-onda-peso-corta', SIN_TOKEN);
    const onda = pesoA * Math.sin((2 * Math.PI * y) / largo + fase) + pesoB * Math.sin((2 * Math.PI * y) / (largo * 0.37) + fase * 3);
    return centroX + amplitud * onda;
  };

  const medir = (): void => {
    ancho = pista.offsetWidth;
    alto = pista.offsetHeight;
    const lado = viajero.offsetHeight;
    amplitud = leerNumero('--linea-v-amplitud', SIN_TOKEN, seccion);
    largo = leerNumero('--linea-v-onda', SIN_TOKEN, seccion);
    fase = leerNumero('--linea-onda-fase-larga', 0);
    // El unicornio queda entero dentro de la pantalla: su centro nunca pasa de (ancho - lado / 2).
    centroX = ancho - lado / 2 - amplitud;
  };

  const dibujar = (): void => {
    medir();
    const paso = leerNumero('--linea-paso', SIN_TOKEN);
    const partes: string[] = [];
    for (let y = 0; y <= alto + paso; y += paso) partes.push(`${partes.length === 0 ? 'M' : 'L'}${xEn(y).toFixed(1)} ${y.toFixed(1)}`);
    const d = partes.join(' ');
    trazoPunteado.setAttribute('d', d);
    trazoSolido.setAttribute('d', d);
    solida.style.setProperty('--pista-alto', `${alto}px`);
  };

  // Pone el viajero en la unión sólida/punteada: sus cascos (96 % del cuadro) apoyan en la altura recorrida.
  const colocar = (): void => {
    const lado = viajero.offsetHeight;
    const y = Math.min(alto, Math.max(0, progreso * alto));
    guia.style.transform = `translate(${(xEn(y) - lado / 2).toFixed(2)}px, ${(y - lado * 0.96).toFixed(2)}px)`;
    solida.style.blockSize = `${y.toFixed(1)}px`;
  };

  dibujar();
  const ancla = leerNumero('--linea-v-ancla', SIN_TOKEN, seccion);
  const estado = { p: 0 };
  const avance = gsap.to(estado, {
    p: 1,
    ease: 'none',
    onUpdate: () => {
      progreso = estado.p;
      colocar();
    },
  });
  const disparador = ScrollTrigger.create({
    animation: avance,
    trigger: seccion,
    // El unicornio acompaña un punto fijo de la pantalla: empieza arriba de la sección y termina abajo.
    start: `top ${(ancla * 100).toFixed(0)}%`,
    end: `bottom ${(ancla * 100).toFixed(0)}%`,
    scrub: leerNumero('--hitos-scrub', SIN_TOKEN),
    invalidateOnRefresh: true,
    onRefresh: (self) => {
      progreso = self.progress;
      colocar();
    },
  });

  // Inclinación por velocidad (misma idea que en escritorio). Sin lenis se deriva del avance del scroll por cuadro.
  const tope = leerNumero('--inclinacion-max', SIN_TOKEN);
  const suavizado = leerNumero('--inclinacion-lerp', SIN_TOKEN);
  const desplazamiento = leerNumero('--inclinacion-desp', SIN_TOKEN);
  let rot = 0;
  let anterior = window.scrollY;
  const inclinar = (): void => {
    const actual = window.scrollY;
    const velocidad = lenis ? lenis.velocity : actual - anterior;
    anterior = actual;
    const objetivo = Math.min(tope, Math.max(-tope, velocidad));
    rot += (objetivo - rot) * suavizado;
    viajero.style.transform = `rotate(${rot.toFixed(3)}deg) translateX(${(-desplazamiento * rot).toFixed(3)}px)`;
  };
  let activo = false;
  const encender = (): void => {
    if (activo) return;
    activo = true;
    anterior = window.scrollY;
    gsap.ticker.add(inclinar);
  };
  const apagar = (): void => {
    if (!activo) return;
    activo = false;
    gsap.ticker.remove(inclinar);
    rot = 0;
    viajero.style.transform = '';
  };
  const visibilidad = ScrollTrigger.create({
    trigger: seccion,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? encender() : apagar()),
  });

  // Las medidas cambian con las fuentes y el tamaño: se redibuja antes de que ScrollTrigger vuelva a medir.
  ScrollTrigger.addEventListener('refreshInit', dibujar);
  let cancelada = false;
  void document.fonts.ready.then(() => {
    if (!cancelada) ScrollTrigger.refresh();
  });
  colocar();

  return () => {
    cancelada = true;
    ScrollTrigger.removeEventListener('refreshInit', dibujar);
    apagar();
    visibilidad.kill();
    disparador.kill();
    avance.kill();
    guia.style.transform = '';
    solida.style.blockSize = '';
    solida.style.removeProperty('--pista-alto');
    trazoPunteado.removeAttribute('d');
    trazoSolido.removeAttribute('d');
    delete seccion.dataset.modo;
  };
}
