// Texto de una tarjeta de la hélice dibujado en un canvas 2D, para que WebGL lo curve con la tarjeta.
// Lee los textos y los estilos del botón real del DOM (que sigue ahí para el teclado y los lectores de
// pantalla) y repite su composición: fila de etiquetas, nombre con la facultad en superíndice, regla y pie.
// Se dibuja como máscara (blanco sobre transparente): el color lo pone el shader.

interface Estilo {
  fuente: string;
  tam: number;
  interlinea: number;
  espaciado: string;
  mayusculas: boolean;
}

function estiloDe(el: Element): Estilo {
  const cs = getComputedStyle(el);
  const tam = parseFloat(cs.fontSize) || 16;
  const interlinea = parseFloat(cs.lineHeight);
  return {
    fuente: `${cs.fontStyle} ${cs.fontWeight} ${tam}px ${cs.fontFamily}`,
    tam,
    interlinea: Number.isFinite(interlinea) ? interlinea : tam * 1.2,
    espaciado: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
    mayusculas: cs.textTransform === 'uppercase',
  };
}

function usar(ctx: CanvasRenderingContext2D, e: Estilo): void {
  ctx.font = e.fuente;
  if ('letterSpacing' in ctx) ctx.letterSpacing = e.espaciado;
}

const texto = (el: Element | null | undefined, e: Estilo): string => {
  const t = (el?.textContent ?? '').trim();
  return e.mayusculas ? t.toUpperCase() : t;
};

/** Texto propio del elemento, sin el de sus hijos (el nombre de la idea sin el superíndice). */
const textoPropio = (el: Element): string =>
  Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? '')
    .join('')
    .trim();

function partir(ctx: CanvasRenderingContext2D, frase: string, anchoMax: number): string[] {
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of frase.split(/\s+/).filter((p) => p.length > 0)) {
    const prueba = actual === '' ? palabra : `${actual} ${palabra}`;
    if (actual !== '' && ctx.measureText(prueba).width > anchoMax) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual !== '') lineas.push(actual);
  return lineas;
}

/** Potencia de dos: las texturas con mipmaps la necesitan en WebGL 1. */
const potencia = (n: number): number => 2 ** Math.ceil(Math.log2(Math.max(2, n)));

export function dibujarTexto(tarjeta: HTMLElement, ancho: number, alto: number, densidad: number): HTMLCanvasElement {
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.min(2048, potencia(ancho * densidad));
  lienzo.height = Math.min(2048, potencia(alto * densidad));
  const ctx = lienzo.getContext('2d');
  if (!ctx) return lienzo;

  ctx.scale(lienzo.width / ancho, lienzo.height / alto);
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';

  const cs = getComputedStyle(tarjeta);
  const margen = parseFloat(cs.paddingLeft) || ancho * 0.05;
  const hueco = parseFloat(cs.rowGap) || 10;
  const util = ancho - 2 * margen;

  const dosLados = (fila: Element | null, y: number, e: Estilo): void => {
    const [izquierda, derecha] = fila ? Array.from(fila.children) : [];
    if (izquierda) {
      const ei = estiloDe(izquierda);
      usar(ctx, ei);
      ctx.textAlign = 'left';
      ctx.fillText(texto(izquierda, ei), margen, y + e.interlinea / 2);
    }
    if (derecha) {
      const ed = estiloDe(derecha);
      usar(ctx, ed);
      ctx.textAlign = 'right';
      ctx.fillText(texto(derecha, ed), ancho - margen, y + e.interlinea / 2);
    }
    ctx.textAlign = 'left';
  };

  // Fila de arriba: [EJEMPLO] y el número.
  const meta = tarjeta.querySelector('.tarjeta__meta');
  let y = margen;
  if (meta) {
    const e = estiloDe(meta);
    dosLados(meta, y, e);
    y += e.interlinea + hueco;
  }

  // Nombre de la idea, con la facultad como superíndice al final de la última línea (ryan A6).
  const titulo = tarjeta.querySelector('.tarjeta__titulo');
  if (titulo) {
    const e = estiloDe(titulo);
    usar(ctx, e);
    const lineas = partir(ctx, textoPropio(titulo), util);
    lineas.forEach((linea, i) => ctx.fillText(linea, margen, y + i * e.interlinea + e.interlinea / 2));
    const ultima = lineas[lineas.length - 1] ?? '';
    const finUltima = margen + ctx.measureText(ultima).width;
    const sup = titulo.querySelector('.tarjeta__facultad');
    if (sup) {
      const es = estiloDe(sup);
      usar(ctx, es);
      const yUltima = y + (lineas.length - 1) * e.interlinea;
      ctx.fillText(texto(sup, es), finUltima + es.tam * 0.6, yUltima + es.tam * 0.9);
    }
    y += Math.max(1, lineas.length) * e.interlinea + hueco;
  }

  // La regla en una frase.
  const regla = tarjeta.querySelector('.tarjeta__regla');
  if (regla) {
    const e = estiloDe(regla);
    usar(ctx, e);
    partir(ctx, texto(regla, e), util).forEach((linea, i) => ctx.fillText(linea, margen, y + i * e.interlinea + e.interlinea / 2));
  }

  // Pie: qué busca y la acción, pegados abajo.
  const pie = tarjeta.querySelector('.tarjeta__pie');
  if (pie) {
    const e = estiloDe(pie);
    dosLados(pie, alto - margen - e.interlinea, e);
  }

  return lienzo;
}
