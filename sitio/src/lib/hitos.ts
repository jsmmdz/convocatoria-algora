// Hitos (unseen A3-A5, técnicas K1-K4): pista horizontal con pin, línea ondulada que se vuelve sólida al
// recorrerla y unicornio viajero que se apoya en ella y se inclina con la velocidad del scroll.
// El CSS por defecto es el apilado: este módulo solo activa el modo horizontal (data-modo) cuando aplica.
import { gsap, ScrollTrigger, lenis } from './movimiento';
import { leerNumero } from './tokens';

type Punto = { x: number; y: number };

// Respaldo único si un token no se lee (los valores reales viven en tokens.css; 1 evita divisiones por cero).
const SIN_TOKEN = 1;

// Corte de K3: horizontal solo en escritorio y sin movimiento reducido.
const CONSULTA_HORIZONTAL = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

/** Ondulación de la línea: dos senos de largo distinto, a lo ancho de toda la pista. */
function trazar(ancho: number, alto: number): Punto[] {
  const centro = alto * leerNumero('--linea-centro', SIN_TOKEN);
  const amplitud = alto * leerNumero('--linea-amplitud', SIN_TOKEN);
  const largaA = innerWidth * leerNumero('--linea-onda-larga', SIN_TOKEN);
  const largaB = innerWidth * leerNumero('--linea-onda-corta', SIN_TOKEN);
  const pesoA = leerNumero('--linea-onda-peso-larga', SIN_TOKEN);
  const pesoB = leerNumero('--linea-onda-peso-corta', SIN_TOKEN);
  const faseA = leerNumero('--linea-onda-fase-larga', SIN_TOKEN);
  const faseB = leerNumero('--linea-onda-fase-corta', SIN_TOKEN);
  const paso = leerNumero('--linea-paso', SIN_TOKEN);
  const puntos: Punto[] = [];
  for (let x = 0; x <= ancho + paso; x += paso) {
    const onda = pesoA * Math.sin((2 * Math.PI * x) / largaA + faseA) + pesoB * Math.sin((2 * Math.PI * x) / largaB + faseB);
    puntos.push({ x, y: centro + amplitud * onda });
  }
  return puntos;
}

/** Altura de la línea en una x: interpola entre los mismos puntos que dibujan el trazo. */
function alturaEn(puntos: Punto[], x: number): number {
  if (puntos.length === 0) return 0;
  const paso = puntos.length > 1 ? puntos[1].x - puntos[0].x : 1;
  const i = Math.min(puntos.length - 2, Math.max(0, Math.floor(x / paso)));
  const a = puntos[i];
  const b = puntos[i + 1] ?? a;
  const t = b.x === a.x ? 0 : Math.min(1, Math.max(0, (x - a.x) / (b.x - a.x)));
  return a.y + (b.y - a.y) * t;
}

export function iniciarHitos(): void {
  const seccion = document.querySelector<HTMLElement>('section[data-hitos]');
  const pista = seccion?.querySelector<HTMLElement>('[data-hitos-pista]');
  const guia = seccion?.querySelector<HTMLElement>('[data-guia]');
  const viajero = seccion?.querySelector<HTMLElement>('[data-viajero]');
  const solida = seccion?.querySelector<HTMLElement>('[data-linea-solida]');
  const trazoPunteado = seccion?.querySelector<SVGPathElement>('[data-linea-punteada] path');
  const trazoSolido = solida?.querySelector<SVGPathElement>('path');
  if (!seccion || !pista || !guia || !viajero || !solida || !trazoPunteado || !trazoSolido) return;

  const mm = gsap.matchMedia();
  mm.add(CONSULTA_HORIZONTAL, () => {
    seccion.dataset.modo = 'horizontal';

    let puntos: Punto[] = [];
    let fraccionX = leerNumero('--viajero-x', SIN_TOKEN);
    const recorrido = (): number => Math.max(0, pista.offsetWidth - seccion.clientWidth);

    // Dibuja la línea con las medidas actuales (al crear y en cada refresco).
    const dibujar = (): void => {
      fraccionX = leerNumero('--viajero-x', SIN_TOKEN);
      const ancho = pista.offsetWidth;
      const alto = seccion.clientHeight;
      puntos = trazar(ancho, alto);
      const d = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      trazoPunteado.setAttribute('d', d);
      trazoSolido.setAttribute('d', d);
      solida.style.setProperty('--pista-ancho', `${ancho}px`);
    };

    // Coloca el viajero en su x fija de pantalla (coordenada dentro de la pista) y a la altura de la línea; recorta la copia sólida hasta ahí.
    const colocar = (): void => {
      const pistaX = Number(gsap.getProperty(pista, 'x'));
      const xPantalla = seccion.clientWidth * fraccionX;
      const xPista = xPantalla - pistaX;
      const lado = viajero.offsetHeight;
      const y = alturaEn(puntos, xPista);
      // Los cascos de la mascota apoyan al 96 % de su cuadro (Mascota.astro)
      guia.style.transform = `translate(${(xPista - lado / 2).toFixed(2)}px, ${(y - lado * 0.96).toFixed(2)}px)`;
      solida.style.inlineSize = `${Math.max(0, xPista).toFixed(1)}px`;
    };

    dibujar();
    const avance = gsap.to(pista, {
      x: () => -recorrido(),
      ease: 'none',
      onUpdate: colocar,
    });
    const disparador = ScrollTrigger.create({
      animation: avance,
      trigger: seccion,
      start: 'top top',
      end: () => `+=${recorrido()}`,
      pin: true,
      scrub: leerNumero('--hitos-scrub', SIN_TOKEN),
      invalidateOnRefresh: true,
      onRefresh: colocar,
    });

    // K2: inclinación por velocidad, solo mientras la sección está en pantalla.
    const tope = leerNumero('--inclinacion-max', SIN_TOKEN);
    const suavizado = leerNumero('--inclinacion-lerp', SIN_TOKEN);
    const desplazamiento = leerNumero('--inclinacion-desp', SIN_TOKEN);
    let rot = 0;
    const inclinar = (): void => {
      const objetivo = Math.min(tope, Math.max(-tope, lenis?.velocity ?? 0));
      rot += (objetivo - rot) * suavizado;
      viajero.style.transform = `rotate(${rot.toFixed(3)}deg) translateX(${(-desplazamiento * rot).toFixed(3)}px)`;
    };
    let activo = false;
    const encender = (): void => {
      if (activo) return;
      activo = true;
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
      // Desde que entra la sección hasta que sale, contando el pin (la sección pinada ocupa el recorrido extra)
      end: () => `+=${recorrido() + 2 * seccion.clientHeight}`,
      invalidateOnRefresh: true,
      onToggle: (self) => (self.isActive ? encender() : apagar()),
    });

    // Las medidas cambian con las fuentes y el tamaño: se redibuja antes de que el pin vuelva a medir.
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
      gsap.set(pista, { clearProps: 'transform' });
      guia.style.transform = '';
      solida.style.inlineSize = '';
      delete seccion.dataset.modo;
    };
  });
}
