// Hélice de proyectos (ryan A1-A6, técnicas K1-K4; D-2 y D-8). La sección queda fija y cada tarjeta ocupa
// 0,6 pantallas de scroll; el giro va pegado al scroll y además responde a las flechas y al teclado, que
// mueven el mismo scroll (una sola fuente de verdad). Las tarjetas son botones reales del DOM colocados con
// CSS 3D; un canvas WebGL dibuja debajo las mismas tarjetas curvadas y, si falla, quedan las del DOM.
// El CSS por defecto es la lista: este módulo solo activa la hélice (data-modo) cuando aplica.
import { gsap, ScrollTrigger, lenis, CONSULTA_ESCRITORIO } from './movimiento';
import { leerColor, leerNumero } from './tokens';
import { hayWebGL } from './webgl';
import { conectado, cargarProyectos } from './datos';
import { mezclarConEjemplos } from '../datos/ejemplos';
import { pintarTarjetas } from './tarjeta-proyecto';
import { dibujarTexto } from './helice-texto';
import type { Color, HeliceGL, TarjetaGL } from './helice-gl';

const CONSULTA_HELICE = CONSULTA_ESCRITORIO;

export const EVENTO_SUMARSE = 'algora:sumarse';
export interface DetalleSumarse {
  idea: string;
  faltan: string[];
}

const limitar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
const dos = (n: number): string => String(n).padStart(2, '0');

function emitirSumarse(tarjeta: HTMLElement): void {
  const detalle: DetalleSumarse = {
    idea: tarjeta.dataset.idea ?? '',
    faltan: (tarjeta.dataset.faltan ?? '').split('|').filter((x) => x.length > 0),
  };
  document.dispatchEvent(new CustomEvent<DetalleSumarse>(EVENTO_SUMARSE, { detail: detalle }));
}

/** Activa la hélice sobre las tarjetas que haya en el DOM en ese momento. Devuelve cómo deshacerla. */
function montar(seccion: HTMLElement): () => void {
  const mm = gsap.matchMedia();

  mm.add(CONSULTA_HELICE, () => {
    const etapa = seccion.querySelector<HTMLElement>('[data-etapa]');
    const lista = seccion.querySelector<HTMLElement>('[data-tarjetas]');
    const items = Array.from(seccion.querySelectorAll<HTMLElement>('[data-item]'));
    const tarjetas = items.map((it) => it.querySelector<HTMLElement>('[data-tarjeta]'));
    const posicion = seccion.querySelector<HTMLElement>('[data-posicion]');
    const anterior = seccion.querySelector<HTMLButtonElement>('[data-anterior]');
    const posterior = seccion.querySelector<HTMLButtonElement>('[data-posterior]');
    const n = items.length;
    if (!etapa || !lista || n < 2) return;

    seccion.dataset.modo = 'helice';

    // Geometría (K1), medida del DOM y de los tokens.
    let radio = 1;
    let paso = 1; // dθ
    let subida = 0; // dy en px
    let ancho = 1;
    let alto = 1;
    let perspectiva = 1000;
    let centroY = 0;
    let centroX = 0;
    let coloresTexto: Color[] = [];
    let medidaDeTextos = '';
    const suavizado = leerNumero('--helice-suavizado', 0.2);
    const decaimiento = leerNumero('--helice-decaimiento', 0.85);
    let colores: Color[] = [];

    const medir = (): void => {
      ancho = Math.max(1, items[0].offsetWidth);
      alto = Math.max(1, items[0].offsetHeight);
      paso = (2 * Math.PI) / Math.max(3, leerNumero('--helice-vuelta', 6.5));
      radio = Math.max(1, (ancho * (1 + leerNumero('--helice-hueco', 0.36))) / paso);
      subida = leerNumero('--helice-subida', 0.52) * alto;
      const p = parseFloat(getComputedStyle(lista).perspective);
      perspectiva = Number.isFinite(p) && p > 0 ? p : 1400;
      centroY = etapa.clientHeight * leerNumero('--helice-centro-y', 0);
      centroX = etapa.clientWidth * leerNumero('--helice-centro-x', 0);
      colores = tarjetas.map((t) => leerColor(`--facultad-${t?.dataset.facultad ?? '9'}`));
      coloresTexto = tarjetas.map((t) => leerColor(`--facultad-texto-${t?.dataset.facultad ?? '9'}`));
    };

    // El texto se pinta dentro de la textura para que se curve con la tarjeta; el del DOM queda transparente.
    const pintarTextos = (): void => {
      if (!gl) return;
      const densidad = Math.min(2, window.devicePixelRatio || 1) * 1.5;
      const medida = `${ancho}x${alto}@${densidad}`;
      if (medida === medidaDeTextos) return;
      medidaDeTextos = medida;
      gl.ponerTextos(tarjetas.map((t) => (t ? dibujarTexto(t, ancho, alto, densidad) : document.createElement('canvas'))));
      seccion.setAttribute('data-gl-texto', '');
    };

    let s = 0; // tarjeta al frente, con decimales
    let objetivo = 0;
    let velocidad = 0;
    let sucio = true;
    let frente = -1;
    let gl: HeliceGL | null = null;
    let cancelado = false;
    let activo = false;

    const pintar = (): void => {
      const paraGL: TarjetaGL[] = [];
      for (let i = 0; i < n; i++) {
        const angulo = (i - s) * paso;
        // Hélice (A3): cada tarjeta va un escalón más abajo que la anterior; al girar, las que vienen suben.
        const y = centroY + (i - s) * subida;
        const coseno = Math.cos(angulo);
        const item = items[i];
        item.style.transform = `translate(-50%, -50%) translate3d(0, ${y.toFixed(2)}px, ${(-radio).toFixed(2)}px) rotateY(${angulo.toFixed(5)}rad) translateZ(${radio.toFixed(2)}px)`;
        // De espaldas el texto se leería al revés: se apaga y deja de recibir clics; el dorso lo pinta WebGL.
        // Todo o nada: a medio apagar el texto quedaría con un contraste que nadie puede leer.
        item.style.opacity = coseno > 0.2 ? '1' : '0';
        item.style.pointerEvents = coseno > 0.2 ? '' : 'none';
        paraGL.push({ angulo, y, color: colores[i] ?? [1, 1, 1], colorTexto: coloresTexto[i] ?? [0, 0, 0], texto: i });
      }
      gl?.dibujar(paraGL, { radio, perspectiva, ancho, alto, velocidad, centroX });

      const nuevoFrente = limitar(Math.round(s), 0, n - 1);
      if (nuevoFrente !== frente) {
        frente = nuevoFrente;
        tarjetas.forEach((t, i) => {
          if (i === frente) t?.setAttribute('aria-current', 'true');
          else t?.removeAttribute('aria-current');
        });
        if (posicion) posicion.textContent = `${dos(frente + 1)} / ${dos(n)}`;
        if (anterior) anterior.disabled = frente === 0;
        if (posterior) posterior.disabled = frente === n - 1;
      }
    };

    // K2 y K3: el giro sigue al scroll; la velocidad se suaviza y decae en cada cuadro.
    const alCuadro = (): void => {
      const ds = objetivo - s;
      if (ds !== 0) {
        s = objetivo;
        velocidad += suavizado * (limitar(10 * ds, -1, 1) - velocidad);
        sucio = true;
      }
      if (velocidad !== 0) {
        velocidad *= decaimiento;
        if (Math.abs(velocidad) < 0.002) velocidad = 0;
        sucio = true;
      }
      if (!sucio) return;
      sucio = false;
      pintar();
    };

    const giro = ScrollTrigger.create({
      trigger: seccion,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        objetivo = self.progress * (n - 1);
      },
    });

    const destinoDe = (i: number): number => giro.start + (limitar(i, 0, n - 1) / (n - 1)) * (giro.end - giro.start);
    const irA = (i: number, inmediato: boolean): void => {
      const destino = destinoDe(i);
      if (lenis) lenis.scrollTo(destino, inmediato ? { immediate: true } : { duration: 0.9 });
      else window.scrollTo(0, destino);
    };

    // El bucle solo corre con la sección en pantalla.
    const presencia = ScrollTrigger.create({
      trigger: seccion,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive === activo) return;
        activo = self.isActive;
        if (activo) {
          sucio = true;
          gsap.ticker.add(alCuadro);
        } else {
          gsap.ticker.remove(alCuadro);
        }
      },
    });

    // WebGL: se carga cuando la sección está a una pantalla y se queda montado (un contexto, sin vaivén).
    const caerARespaldo = (): void => {
      gl = null;
      medidaDeTextos = '';
      seccion.removeAttribute('data-gl');
      seccion.removeAttribute('data-gl-texto');
      sucio = true;
    };
    const alPerderContexto = (): void => {
      if (!cancelado) caerARespaldo();
    };
    let canvas = seccion.querySelector<HTMLCanvasElement>('[data-helice-gl]');
    const montarGL = async (): Promise<void> => {
      if (gl || cancelado || !canvas || !hayWebGL()) return;
      let modulo: typeof import('./helice-gl');
      try {
        modulo = await import('./helice-gl');
      } catch {
        return; // red caída o despliegue con otro hash: quedan las tarjetas del DOM
      }
      if (gl || cancelado || !canvas) return;
      // El canvas tiene que tener caja antes de medirlo.
      seccion.setAttribute('data-gl', '');
      const instancia = modulo.montarHelice(canvas);
      if (!instancia) {
        caerARespaldo();
        return;
      }
      canvas.addEventListener('webglcontextlost', alPerderContexto);
      gl = instancia;
      // Las fuentes tienen que estar cargadas antes de dibujar el texto en la textura.
      void document.fonts.ready.then(() => {
        if (cancelado || gl !== instancia) return;
        pintarTextos();
        sucio = true;
        if (!activo) pintar();
      });
      sucio = true;
      if (!activo) pintar();
    };
    const proximidad = ScrollTrigger.create({
      trigger: seccion,
      start: () => `top bottom+=${window.innerHeight}`,
      end: 'bottom top',
      onEnter: () => void montarGL(),
      onEnterBack: () => void montarGL(),
    });
    if (proximidad.isActive) void montarGL();

    // El tema cambia el fondo con el que se funden los dorsos.
    const observadorTema = new MutationObserver(() => {
      gl?.redimensionar();
      sucio = true;
      if (!activo) pintar();
    });
    observadorTema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const alRefrescar = (): void => {
      medir();
      gl?.redimensionar();
      if (seccion.hasAttribute('data-gl-texto')) pintarTextos();
      objetivo = giro.progress * (n - 1);
      s = objetivo;
      sucio = true;
      pintar();
    };
    ScrollTrigger.addEventListener('refresh', alRefrescar);

    // Clic: la tarjeta del frente lleva al formulario; una de los lados gira hasta el frente.
    const indiceDe = (el: EventTarget | null): number => {
      if (!(el instanceof Element)) return -1;
      const t = el.closest<HTMLElement>('[data-tarjeta]');
      return t ? tarjetas.indexOf(t) : -1;
    };
    const alClic = (e: MouseEvent): void => {
      const i = indiceDe(e.target);
      if (i < 0) return;
      // Se detiene aquí: el oyente general de la lista no debe mandar al formulario una tarjeta de los lados.
      e.stopPropagation();
      const t = tarjetas[i];
      if (Math.abs(i - s) < 0.5) {
        if (t) emitirSumarse(t);
      } else {
        irA(i, false);
      }
    };
    lista.addEventListener('click', alClic);

    // Teclado: al llegar con Tab a una tarjeta, la hélice gira hasta ella (solo foco de teclado, no de clic).
    const alEnfocar = (e: FocusEvent): void => {
      const i = indiceDe(e.target);
      const t = i >= 0 ? tarjetas[i] : null;
      if (!t || !t.matches(':focus-visible')) return;
      requestAnimationFrame(() => {
        // Si entre tanto el foco pasó a otra tarjeta (flechas seguidas), manda la última, no esta.
        if (!cancelado && document.activeElement === t && Math.abs(i - objetivo) >= 0.5) irA(i, true);
      });
    };
    lista.addEventListener('focusin', alEnfocar);

    const mover = (delta: number): void => {
      // Con una tarjeta enfocada se cuenta desde ella; si no, desde donde va el scroll.
      const enfocada = indiceDe(document.activeElement);
      const destino = limitar((enfocada >= 0 ? enfocada : Math.round(objetivo)) + delta, 0, n - 1);
      irA(destino, enfocada >= 0);
      if (enfocada >= 0) tarjetas[destino]?.focus({ preventScroll: true });
    };
    const alTeclear = (e: KeyboardEvent): void => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      mover(e.key === 'ArrowLeft' ? -1 : 1);
    };
    etapa.addEventListener('keydown', alTeclear);
    const alAnterior = (): void => mover(-1);
    const alPosterior = (): void => mover(1);
    anterior?.addEventListener('click', alAnterior);
    posterior?.addEventListener('click', alPosterior);

    medir();
    pintar();
    void document.fonts.ready.then(() => {
      if (!cancelado) ScrollTrigger.refresh();
    });

    return () => {
      cancelado = true;
      ScrollTrigger.removeEventListener('refresh', alRefrescar);
      observadorTema.disconnect();
      gsap.ticker.remove(alCuadro);
      proximidad.kill();
      presencia.kill();
      giro.kill();
      lista.removeEventListener('click', alClic);
      lista.removeEventListener('focusin', alEnfocar);
      etapa.removeEventListener('keydown', alTeclear);
      anterior?.removeEventListener('click', alAnterior);
      posterior?.removeEventListener('click', alPosterior);
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', alPerderContexto);
        if (gl) {
          gl.destruir();
          // Un canvas con el contexto soltado no sirve para volver a montar: se deja uno nuevo en su lugar.
          const limpio = document.createElement('canvas');
          limpio.className = canvas.className;
          for (const atributo of canvas.getAttributeNames()) {
            if (atributo !== 'width' && atributo !== 'height' && atributo !== 'style') limpio.setAttribute(atributo, canvas.getAttribute(atributo) ?? '');
          }
          canvas.replaceWith(limpio);
          canvas = limpio;
        }
      }
      gl = null;
      for (const item of items) {
        item.style.transform = '';
        item.style.opacity = '';
        item.style.pointerEvents = '';
      }
      tarjetas.forEach((t) => t?.removeAttribute('aria-current'));
      seccion.removeAttribute('data-gl');
      seccion.removeAttribute('data-gl-texto');
      delete seccion.dataset.modo;
    };
  });

  return () => mm.revert();
}

export function iniciarProyectos(): void {
  const seccion = document.querySelector<HTMLElement>('section[data-proyectos]');
  const lista = seccion?.querySelector<HTMLElement>('[data-tarjetas]');
  if (!seccion || !lista) return;

  // En lista (sin hélice) cualquier tarjeta lleva al formulario. En hélice, el oyente del modo corta antes.
  seccion.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    const tarjeta = e.target.closest<HTMLElement>('[data-tarjeta]');
    if (tarjeta) emitirSumarse(tarjeta);
  });

  let desmontar = montar(seccion);

  // Con Supabase conectado, las ideas aprobadas reemplazan a los ejemplos (o se completan con ellos).
  if (conectado) {
    void cargarProyectos().then((reales) => {
      if (reales.length === 0) return;
      desmontar();
      pintarTarjetas(seccion, mezclarConEjemplos(reales));
      desmontar = montar(seccion);
      ScrollTrigger.refresh();
    });
  }
}
