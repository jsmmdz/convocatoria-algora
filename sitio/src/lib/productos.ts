// Orquestación de la sección Productos (T04): pin en dos tramos, vuelo de fichas K1,
// entrada letra por letra K3 y carga diferida del marco de tinta WebGL K2.
import { gsap, ScrollTrigger, lenis } from './movimiento';
import { prepararFichas } from './productos-fichas';
import { leerNumero } from './tokens';
import { hayWebGL } from './webgl';
import type { Marco } from './marco-tinta';

const CONSULTA_HORIZONTAL = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export function iniciarProductos(): void {
  const seccion = document.querySelector<HTMLElement>('section[data-productos]');
  const canvas = seccion?.querySelector<HTMLCanvasElement>('[data-marco]');
  if (!seccion || !canvas) return;

  // Punto 6: sin WebGL la sección se queda en su respaldo quieto, sin pin ni canvas.
  if (!hayWebGL()) return;

  const etiqueta = seccion.querySelector<HTMLElement>('[data-productos-etiqueta]');
  const titular = seccion.querySelector<HTMLElement>('[data-productos-titular]');
  const postular = seccion.querySelector<HTMLElement>('[data-postular]');
  const fichasEls = Array.from(seccion.querySelectorAll<HTMLElement>('[data-ficha]'));
  const contenidoParaApagar = [etiqueta, titular, postular, ...fichasEls].filter(
    (el): el is HTMLElement => el !== null,
  );

  const mm = gsap.matchMedia();
  mm.add(CONSULTA_HORIZONTAL, () => {
    seccion.dataset.modo = 'horizontal';
    const fichas = prepararFichas(seccion);

    const distanciaPin = (): number =>
      seccion.clientHeight * Math.max(0.5, leerNumero('--productos-pin', 2));
    const scrub = Math.min(0.55, Math.max(0, leerNumero('--productos-scrub', 0.55)));

    let marco: Marco | null = null;
    let cerca = false;
    let cargaId = 0;
    let cancelado = false;
    const estadoMarco = { t: 0 };
    // Si el marco no se puede montar o pierde el contexto, la sección sigue sin él (E1 y E2 de la auditoría final)
    let fallo = false;
    const APAGADO = 1.12;

    // El apagado solo baja la opacidad: el titular sigue en el árbol accesible y el botón en el orden de
    // tabulación (E3). Mientras está apagado no recibe clics; sin marco, el bloque se desvanece en su lugar.
    const actualizarEstado = (): void => {
      seccion.toggleAttribute('data-productos-apagado', tlPin.time() >= APAGADO);
      if (fallo) seccion.toggleAttribute('data-marco-abierto', estadoMarco.t >= 0.5);
    };

    // Timeline de 2 unidades: 0..1 primera mitad (llegada del vuelo), 1..2 segunda mitad (apagado y marco).
    const tlPin = gsap.timeline({
      onUpdate: () => {
        marco?.progreso(estadoMarco.t);
        actualizarEstado();
      },
    });
    tlPin.to({}, { duration: 1 }, 0);
    if (contenidoParaApagar.length > 0) {
      tlPin.to(contenidoParaApagar, { opacity: 0, ease: 'none', duration: 0.14 }, APAGADO);
    }
    tlPin.to(estadoMarco, { t: 1, ease: 'power2.in', duration: 0.64 }, 1.26);
    tlPin.to({}, { duration: 0.1 }, 1.9);

    const pinTrigger = ScrollTrigger.create({
      animation: tlPin,
      trigger: seccion,
      start: 'top top',
      end: () => `+=${distanciaPin()}`,
      pin: true,
      scrub,
      invalidateOnRefresh: true,
    });

    // El vuelo corre desde top 55% hasta exactamente la mitad del pin.
    const vueloTrigger = ScrollTrigger.create({
      animation: fichas.vuelo,
      trigger: seccion,
      start: 'top 55%',
      end: () => `+=${window.innerHeight * 0.45 + distanciaPin() * 0.5}`,
      scrub,
      invalidateOnRefresh: true,
      onEnter: () => fichas.letras(),
      onEnterBack: () => fichas.letras(),
      onUpdate: (self) => {
        if (self.progress > 0) fichas.letras();
      },
    });

    // Respaldo del marco: sin canvas, el bloque cobalto se desvanece a mitad del marco y deja ver
    // «Cómo funciona»; al volver hacia arriba reaparece con su contenido.
    const caerARespaldo = (): void => {
      fallo = true;
      if (marco) {
        try {
          marco.destruir();
        } catch {
          // el contexto ya se perdió: no hay nada más que soltar
        }
        marco = null;
      }
      canvas.style.display = 'none';
      seccion.setAttribute('data-marco-fallo', '');
      actualizarEstado();
      seccion.removeAttribute('data-marco-listo');
    };

    const alPerderContexto = (): void => {
      if (!cancelado) caerARespaldo();
    };
    canvas.addEventListener('webglcontextlost', alPerderContexto);

    const montarSiCerca = async (): Promise<void> => {
      const id = ++cargaId;
      let modulo: typeof import('./marco-tinta');
      try {
        modulo = await import('./marco-tinta');
      } catch {
        // Red caída o despliegue con otro hash: la sección sigue en su respaldo
        if (!cancelado && cerca && id === cargaId) caerARespaldo();
        return;
      }
      if (cancelado || !cerca || id !== cargaId || marco) return;
      const instancia = modulo.montarMarco(canvas);
      if (!instancia) {
        caerARespaldo();
        return;
      }
      marco = instancia;
      fallo = false;
      seccion.removeAttribute('data-marco-fallo');
      seccion.removeAttribute('data-marco-abierto');
      canvas.style.display = '';
      seccion.setAttribute('data-marco-listo', '');
      marco.redimensionar();
      marco.progreso(estadoMarco.t);
    };

    const desmontarMarco = (): void => {
      cargaId++;
      if (marco) {
        marco.destruir();
        marco = null;
      }
      seccion.removeAttribute('data-marco-listo');
    };

    // Con Shift+Tab desde abajo el foco llega al botón con el contenido apagado: se vuelve a la mitad del
    // pin, donde el titular, el botón y las fichas están a la vista (E3).
    const alEnfocar = (): void => {
      requestAnimationFrame(() => {
        if (cancelado || tlPin.time() < APAGADO) return;
        const destino = pinTrigger.start + distanciaPin() * 0.5;
        if (lenis) lenis.scrollTo(destino, { immediate: true });
        else window.scrollTo(0, destino);
      });
    };
    seccion.addEventListener('focusin', alEnfocar);

    // Carga y monta el marco solo cuando la sección está a <= 1 pantalla de distancia.
    const proximidad = ScrollTrigger.create({
      trigger: seccion,
      start: () => `top bottom+=${window.innerHeight}`,
      end: () => `+=${distanciaPin() + 3 * window.innerHeight}`,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        cerca = self.isActive;
        if (cerca) {
          void montarSiCerca();
        } else {
          desmontarMarco();
        }
      },
    });
    if (proximidad.isActive) {
      cerca = true;
      void montarSiCerca();
    }

    const alRefrescar = (): void => {
      marco?.redimensionar();
    };
    ScrollTrigger.addEventListener('refresh', alRefrescar);
    void document.fonts.ready.then(() => {
      if (!cancelado) ScrollTrigger.refresh();
    });

    return () => {
      cancelado = true;
      cerca = false;
      ScrollTrigger.removeEventListener('refresh', alRefrescar);
      canvas.removeEventListener('webglcontextlost', alPerderContexto);
      seccion.removeEventListener('focusin', alEnfocar);
      proximidad.kill();
      vueloTrigger.kill();
      pinTrigger.kill();
      tlPin.kill();
      desmontarMarco();
      fichas.restaurar();
      seccion.removeAttribute('data-productos-apagado');
      seccion.removeAttribute('data-marco-fallo');
      seccion.removeAttribute('data-marco-abierto');
      delete seccion.dataset.modo;
    };
  });
}
