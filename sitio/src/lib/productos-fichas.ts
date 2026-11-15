// Fichas tipográficas y entrada letra por letra de la sección Productos (T04 · S1).
// Este módulo no crea ScrollTriggers ni activa el pin: la integración orquesta el timeline `vuelo`
// y llama a `letras()` y `restaurar()` según el modo horizontal.
import { gsap } from './movimiento';
import { leerNumero } from './tokens';

// Constantes K1 y K3 de fabrica/proyecto/referentes/T04.json.
const ORIGEN_X = 1.12;
const ORIGEN_Y = 0.52;
const ESCALA_INICIAL = 0.94;
const DURACION_VUELO = 1.3;
const ESCALON_VUELO = 0.09;
const DURACION_LETRAS = 0.9;
const ESCALON_LETRAS = 0.03;

// Respaldos si los tokens --ficha-giro-1..7 aún no están en tokens.css (7 ángulos distintos entre -10 y 10).
const GIROS_RESPALDO: readonly number[] = [-7, 5, -4, 8, -9, 3, -2];
const DELTA_GIRO_ORIGEN: readonly number[] = [-18, 16, -20, 18, -16, 20, -14];

export interface Fichas {
  /** En pausa. 0 = las siete en el origen común (origen_x/origen_y de la ficha, con rotación y scale 0,94);
   *  1 = en su sitio y con su giro. Stagger 0,09 y expo.out dentro del timeline. */
  vuelo: gsap.core.Timeline;
  /** K3: parte el <h2> y [data-productos-etiqueta] en letras dentro de una máscara y las sube una vez
   *  (0,9 s, stagger 0,03, power4.out). El texto accesible queda entero. Llamarla otra vez no hace nada. */
  letras(): void;
  /** Quita lo que puso (estilos en línea, letras partidas): al salir del modo horizontal. */
  restaurar(): void;
}

/** Parte un elemento de texto en palabras y letras envueltas en máscaras, conservando el texto accesible. */
function partirEnLetras(elemento: HTMLElement, usarAriaLabel: boolean): HTMLElement[] {
  const texto = (elemento.textContent ?? '').trim();
  const letras: HTMLElement[] = [];
  elemento.textContent = '';

  if (usarAriaLabel) {
    elemento.setAttribute('aria-label', texto);
  } else {
    const oculto = document.createElement('span');
    oculto.className = 'productos__solo-lector';
    oculto.textContent = texto;
    elemento.appendChild(oculto);
  }

  const contenedor = document.createElement('span');
  contenedor.className = 'productos__letras';
  contenedor.setAttribute('aria-hidden', 'true');

  const palabras = texto.split(/\s+/).filter((p) => p.length > 0);
  palabras.forEach((palabra, indicePalabra) => {
    if (indicePalabra > 0) {
      contenedor.appendChild(document.createTextNode(' '));
    }
    const spanPalabra = document.createElement('span');
    spanPalabra.className = 'productos__palabra';

    for (const caracter of Array.from(palabra)) {
      const mascara = document.createElement('span');
      mascara.className = 'productos__mascara';
      const letra = document.createElement('span');
      letra.className = 'productos__letra';
      letra.textContent = caracter;
      mascara.appendChild(letra);
      spanPalabra.appendChild(mascara);
      letras.push(letra);
    }

    contenedor.appendChild(spanPalabra);
  });

  elemento.appendChild(contenedor);
  return letras;
}

export function prepararFichas(seccion: HTMLElement): Fichas {
  const fichas = Array.from(seccion.querySelectorAll<HTMLElement>('[data-ficha]'));
  const titular = seccion.querySelector<HTMLElement>('[data-productos-titular]');
  const etiqueta = seccion.querySelector<HTMLElement>('[data-productos-etiqueta]');
  const postular = seccion.querySelector<HTMLElement>('[data-postular]');

  const textoTitular = titular?.textContent ?? '';
  const textoEtiqueta = etiqueta?.textContent ?? '';

  const giroFinal = (indice: number): number =>
    leerNumero(`--ficha-giro-${indice + 1}`, GIROS_RESPALDO[indice] ?? 0, seccion);

  const desplazamientoX = (_indice: number, ficha: HTMLElement): number =>
    ORIGEN_X * seccion.clientWidth - (ficha.offsetLeft + ficha.offsetWidth / 2);

  const desplazamientoY = (_indice: number, ficha: HTMLElement): number =>
    ORIGEN_Y * seccion.clientHeight - (ficha.offsetTop + ficha.offsetHeight / 2);

  const vuelo = gsap.timeline({ paused: true });
  if (fichas.length > 0) {
    vuelo.fromTo(
      fichas,
      {
        x: desplazamientoX,
        y: desplazamientoY,
        rotation: (i: number) => giroFinal(i) + (DELTA_GIRO_ORIGEN[i] ?? -15),
        scale: ESCALA_INICIAL,
      },
      {
        x: 0,
        y: 0,
        rotation: (i: number) => giroFinal(i),
        scale: 1,
        duration: DURACION_VUELO,
        stagger: ESCALON_VUELO,
        ease: 'expo.out',
      },
      0,
    );
  }

  let letrasLanzadas = false;
  let tweenLetras: gsap.core.Tween | null = null;

  const letras = (): void => {
    if (letrasLanzadas) return;
    letrasLanzadas = true;

    const spans: HTMLElement[] = [];
    if (etiqueta) spans.push(...partirEnLetras(etiqueta, false));
    if (titular) spans.push(...partirEnLetras(titular, true));
    if (spans.length === 0) return;

    // 120 % compensa el padding-block-end de la máscara para ocultar del todo las letras antes de subir.
    tweenLetras = gsap.fromTo(
      spans,
      { yPercent: 120 },
      { yPercent: 0, duration: DURACION_LETRAS, stagger: ESCALON_LETRAS, ease: 'power4.out' },
    );
  };

  const restaurar = (): void => {
    vuelo.kill();
    tweenLetras?.kill();
    tweenLetras = null;

    if (fichas.length > 0) {
      gsap.set(fichas, { clearProps: 'transform,opacity' });
    }
    if (titular) {
      titular.textContent = textoTitular;
      titular.removeAttribute('aria-label');
      gsap.set(titular, { clearProps: 'opacity,visibility' });
    }
    if (etiqueta) {
      etiqueta.textContent = textoEtiqueta;
      gsap.set(etiqueta, { clearProps: 'opacity,visibility' });
    }
    if (postular) {
      gsap.set(postular, { clearProps: 'opacity,visibility' });
    }
    letrasLanzadas = false;
  };

  return { vuelo, letras, restaurar };
}
