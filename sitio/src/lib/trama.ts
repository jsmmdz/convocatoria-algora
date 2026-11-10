// Trama de caracteres (unseen A2) en OGL: una rejilla de celdas con glifos `. $ 0 1 + =` y las letras de ALGORA,
// más densa hacia el centro. Quieta sin cursor; el cursor la deforma (empuja la rejilla y cambia los caracteres)
// con una estela que vuelve al reposo. Solo se redibuja mientras hay movimiento que mostrar.
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';
import { leerColor, leerNumero, leerSegundos } from './tokens';

export interface Trama {
  liberar(): void;
}

// Del más ligero al más denso: la densidad de la figura elige hacia dónde de la rampa cae cada celda.
const GLIFOS = ['.', '+', '=', '1', '0', '$', 'A', 'L', 'G', 'O', 'R'];
const RANURAS = 16; // el atlas es potencia de dos para poder usar mipmaps
const TILE = 32;
const MAX_HUELLAS = 48;
// Zonas del contenido (cada línea del titular y cada etiqueta) donde el cursor no aviva la trama (E2 de T02):
// tocada subía hasta alfa 0,66 detrás del texto y bajaba el contraste del papel a 2,2:1.
const MAX_ZONAS = 8;
const HOLGURA_ZONA = 6; // px alrededor de cada zona
const ESPERA_FUENTE_MS = 1500;
// El ancho de referencia al que están medidos los tokens de la trama.
const ANCHO_REF = 1440;

const VERTICE = /* glsl */ `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENTO = /* glsl */ `
  precision highp float;
  #define MAX ${MAX_HUELLAS}
  #define MAX_ZONAS ${MAX_ZONAS}
  #define RANURAS ${RANURAS}.0
  #define GLIFOS ${GLIFOS.length}.0

  uniform vec2 uTam;
  uniform float uDpr;
  uniform float uCelda;
  uniform float uRadio;
  uniform float uEmpuje;
  uniform float uOpacidad;
  uniform vec3 uPapel;
  uniform sampler2D uAtlas;
  uniform int uN;
  uniform vec4 uHuella[MAX];
  uniform int uNZonas;
  uniform vec4 uZona[MAX_ZONAS];

  // 1 si el punto cae sobre el contenido (texto o etiquetas), 0 si no.
  float enContenido(vec2 p) {
    for (int i = 0; i < MAX_ZONAS; i++) {
      if (i >= uNZonas) break;
      vec4 z = uZona[i];
      if (p.x >= z.x && p.y >= z.y && p.x <= z.x + z.z && p.y <= z.y + z.w) return 1.0;
    }
    return 0.0;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Campo que deja el cursor: x = cuánto toca este punto, yz = hacia dónde empuja.
  vec3 campo(vec2 p) {
    float w = 0.0;
    vec2 dir = vec2(0.0);
    for (int i = 0; i < MAX; i++) {
      if (i >= uN) break;
      vec4 h = uHuella[i];
      vec2 d = p - h.xy;
      float k = h.z * exp(-dot(d, d) / (uRadio * uRadio));
      w += k;
      dir += d / (length(d) + 1.0) * k;
    }
    float l = length(dir);
    if (l > 1.0) dir /= l;
    return vec3(min(w, 1.0), dir);
  }

  void main() {
    // Píxeles CSS con el origen arriba a la izquierda
    vec2 p = vec2(gl_FragCoord.x, uTam.y * uDpr - gl_FragCoord.y) / uDpr;
    vec3 f = campo(p);
    // La rejilla se lee desplazada: el contenido parece empujado por el cursor
    vec2 q = p - f.yz * uEmpuje * f.x;
    vec2 celda = floor(q / uCelda);
    vec2 local = fract(q / uCelda);
    vec2 centro = (celda + 0.5) * uCelda;
    float toque = campo(centro).x;

    // Figura suave: más densa hacia el centro (el viñeteado de Unseen)
    vec2 uv = centro / uTam;
    float r = length((uv - 0.5) * vec2(1.25, 1.6));
    float densidad = clamp(1.0 - smoothstep(0.08, 0.85, r) + toque * 0.5, 0.0, 1.0);

    float presencia = step(hash(celda), mix(0.12, 0.95, densidad));
    float h2 = hash(celda + 31.7 * floor(toque * 8.0) + 7.3);
    float indice = floor(clamp(densidad * 0.55 + h2 * 0.5, 0.0, 0.999) * GLIFOS);
    float a = texture2D(uAtlas, vec2((indice + local.x) / RANURAS, local.y)).a;

    // El toque aviva la trama, salvo detrás del contenido: ahí se queda en el brillo de reposo.
    float realce = toque * 1.2 * (1.0 - enContenido(p));
    float alfa = a * presencia * uOpacidad * (1.0 + realce);
    gl_FragColor = vec4(uPapel, min(alfa, 1.0));
  }
`;

interface Huella {
  x: number;
  y: number;
  t: number;
}

function dibujarAtlas(canvas: HTMLCanvasElement, familia: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(TILE * 0.85)}px ${familia}`;
  GLIFOS.forEach((g, i) => ctx.fillText(g, i * TILE + TILE / 2, TILE / 2 + 1));
}

export function montarTrama(portada: HTMLElement, reducido: boolean): Trama | null {
  const canvas = portada.querySelector<HTMLCanvasElement>('canvas[data-trama]');
  if (!canvas) return null;

  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, alpha: true, premultipliedAlpha: false, antialias: false, depth: false, dpr: Math.min(window.devicePixelRatio || 1, 2) });
  } catch {
    return null;
  }
  const gl = renderer.gl;

  // Atlas de glifos: se dibuja ya con la tipografía de respaldo y se repinta cuando carga la de etiquetas.
  const atlas = document.createElement('canvas');
  atlas.width = RANURAS * TILE;
  atlas.height = TILE;
  const familia = getComputedStyle(document.documentElement).getPropertyValue('--fuente-etiqueta').trim() || 'monospace';
  dibujarAtlas(atlas, familia);
  const textura = new Texture(gl, { image: atlas, flipY: false, generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });

  // OGL solo reconoce un uniforme de arreglo si su valor es un Array común (no un Float32Array)
  const huellasGpu: number[] = new Array<number>(MAX_HUELLAS * 4).fill(0);
  const zonasGpu: number[] = new Array<number>(MAX_ZONAS * 4).fill(0);
  const programa = new Program(gl, {
    vertex: VERTICE,
    fragment: FRAGMENTO,
    // Sin mezcla: el shader ya entrega (papel, alfa) y el canvas se compone con la página
    transparent: false,
    depthTest: false,
    uniforms: {
      uTam: { value: [1, 1] },
      uDpr: { value: renderer.dpr },
      uCelda: { value: leerNumero('--trama-celda', 13) },
      uRadio: { value: leerNumero('--trama-radio', 160) },
      uEmpuje: { value: leerNumero('--trama-empuje', 22) },
      uOpacidad: { value: leerNumero('--trama-opacidad', 0.3) },
      uPapel: { value: leerColor('--color-papel') },
      uAtlas: { value: textura },
      uN: { value: 0 },
      uHuella: { value: huellasGpu },
      uNZonas: { value: 0 },
      uZona: { value: zonasGpu },
    },
  });
  const malla = new Mesh(gl, { geometry: new Triangle(gl), program: programa });
  malla.frustumCulled = false;

  const estelaMs = leerSegundos('--trama-estela', 1) * 1000;
  const huellas: Huella[] = [];
  let escala = 1;
  let raf = 0;
  let visible = true;
  let perdido = false;
  let liberado = false;

  const cuadro = (ahora: number): void => {
    raf = 0;
    if (liberado || perdido) return;
    // Se descartan las huellas que ya cumplieron su estela; el último cuadro las deja en reposo.
    for (let i = huellas.length - 1; i >= 0; i--) if (ahora - huellas[i].t >= estelaMs) huellas.splice(i, 1);
    huellasGpu.fill(0);
    huellas.forEach((h, i) => {
      const vida = Math.max(0, 1 - (ahora - h.t) / estelaMs);
      const k = i * 4;
      huellasGpu[k] = h.x;
      huellasGpu[k + 1] = h.y;
      huellasGpu[k + 2] = vida * vida;
    });
    programa.uniforms.uN.value = huellas.length;
    renderer.render({ scene: malla });
    if (huellas.length > 0) programar();
  };
  const programar = (): void => {
    if (!raf && visible && !liberado && !perdido) raf = requestAnimationFrame(cuadro);
  };

  // Las cajas del contenido, en píxeles de la portada. Se mide la caja de cada [data-linea] (no su texto, que
  // entra animado) y de cada etiqueta.
  const medirZonas = (): void => {
    const origen = portada.getBoundingClientRect();
    const elementos = [...portada.querySelectorAll('[data-linea], [data-etiquetas] > *')].slice(0, MAX_ZONAS);
    zonasGpu.fill(0);
    elementos.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      zonasGpu[i * 4] = r.left - origen.left - HOLGURA_ZONA;
      zonasGpu[i * 4 + 1] = r.top - origen.top - HOLGURA_ZONA;
      zonasGpu[i * 4 + 2] = r.width + 2 * HOLGURA_ZONA;
      zonasGpu[i * 4 + 3] = r.height + 2 * HOLGURA_ZONA;
    });
    programa.uniforms.uNZonas.value = elementos.length;
  };

  const medir = (): void => {
    const caja = portada.getBoundingClientRect();
    const ancho = Math.max(1, Math.round(caja.width));
    const alto = Math.max(1, Math.round(caja.height));
    escala = Math.min(1, Math.max(0.6, ancho / ANCHO_REF));
    renderer.setSize(ancho, alto);
    programa.uniforms.uTam.value = [ancho, alto];
    programa.uniforms.uCelda.value = leerNumero('--trama-celda', 13) * Math.max(0.8, escala);
    programa.uniforms.uRadio.value = leerNumero('--trama-radio', 160) * escala;
    medirZonas();
    programar();
  };

  const alMover = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    const caja = canvas.getBoundingClientRect();
    const x = e.clientX - caja.left;
    const y = e.clientY - caja.top;
    const radio = leerNumero('--trama-radio', 160) * escala;
    if (x < -radio || y < -radio || x > caja.width + radio || y > caja.height + radio) return;
    const ultima = huellas[huellas.length - 1];
    // Una huella cada pocos píxeles: bastan para dibujar la estela sin saturar el shader.
    if (ultima && Math.hypot(ultima.x - x, ultima.y - y) < 8) {
      ultima.t = performance.now();
    } else {
      if (huellas.length >= MAX_HUELLAS) huellas.shift();
      huellas.push({ x, y, t: performance.now() });
    }
    programar();
  };

  const observador = new ResizeObserver(medir);
  observador.observe(portada);
  // Las líneas cambian de tamaño cuando crece la pastilla de la entrada o llega la tipografía del titular.
  const observadorZonas = new ResizeObserver(() => {
    medirZonas();
    programar();
  });
  portada.querySelectorAll('[data-linea], [data-etiquetas] > *').forEach((el) => observadorZonas.observe(el));
  const vigia = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    if (visible) programar();
  });
  vigia.observe(portada);
  if (!reducido) window.addEventListener('pointermove', alMover, { passive: true });
  const alPerder = (e: Event): void => {
    e.preventDefault();
    perdido = true;
    canvas.style.display = 'none';
  };
  canvas.addEventListener('webglcontextlost', alPerder);

  medir();

  // La tipografía de las etiquetas puede tardar: se repinta el atlas cuando llegue, sin esperar más del tope.
  const tope = new Promise<void>((resolver) => window.setTimeout(resolver, ESPERA_FUENTE_MS));
  void Promise.race([document.fonts.load(`600 ${TILE}px ${familia}`).then(() => undefined), tope])
    .catch(() => undefined)
    .then(() => {
      if (liberado) return;
      dibujarAtlas(atlas, familia);
      textura.needsUpdate = true;
      medirZonas(); // con la tipografía final el titular pudo cambiar de tamaño
      programar();
    });

  return {
    liberar() {
      liberado = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', alMover);
      canvas.removeEventListener('webglcontextlost', alPerder);
      observador.disconnect();
      observadorZonas.disconnect();
      vigia.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
