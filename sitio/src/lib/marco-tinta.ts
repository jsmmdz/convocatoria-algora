// Marco de tinta (tabletales A3, técnica K2) en OGL: abre un hueco redondeado con borde ácido
// irregular (lóbulos fbm según la dirección desde el borde) sobre el color del bloque de productos.
// Se carga diferido desde la integración y libera su contexto al alejarse de la sección.
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { leerColor, leerNumero, leerToken } from './tokens';
import { hayWebGL } from './webgl';

export interface Marco {
  /** p de 0 a 1, ya con la curva aplicada por la integración. 0 = todo el canvas en --productos-bloque
   *  (hueco cerrado); 1 = el hueco pasó los cuatro bordes y el canvas no pinta nada (transparente). */
  progreso(p: number): void;
  /** Ajusta el tamaño al de la ventana, con DPR tope --marco-dpr-max. */
  redimensionar(): void;
  /** Para el bucle, quita los oyentes y libera el contexto (si no se perdió ya: mira isContextLost, E7 de T03). */
  destruir(): void;
}

const PINCEL_RESPALDO = 120;
const RUIDO_ESCALA_RESPALDO = 1.6;
const RUIDO_TIEMPO_RESPALDO = 0.03;
const DPR_MAX_RESPALDO = 2;
const PASO_TIEMPO_MAX_S = 0.1;

const VERTICE = /* glsl */ `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENTO = /* glsl */ `
  precision highp float;

  uniform vec2 uTam;
  uniform vec2 uResolucion;
  uniform float uProgreso;
  uniform float uPincel;
  uniform float uRuidoEscala;
  uniform float uRuidoTiempo;
  uniform float uTiempo;
  uniform vec3 uBloque;
  uniform vec3 uAcido;

  // Hash sin funciones trigonométricas para evitar pérdida de precisión en GPUs móviles.
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float ruido(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Rotación pitagórica entre octavas para eliminar artefactos de rejilla.
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * ruido(p);
      p = rot * p * 2.02 + vec2(17.1, 31.7);
      a *= 0.5;
    }
    return v;
  }

  float sdRectRedondeado(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float p = clamp(uProgreso, 0.0, 1.0);
    if (p <= 0.0) {
      gl_FragColor = vec4(uBloque, 1.0);
      return;
    }
    if (p >= 1.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 uv = gl_FragCoord.xy / max(uResolucion, vec2(1.0));
    vec2 pos = vec2(uv.x, 1.0 - uv.y) * uTam;
    vec2 q = pos - uTam * 0.5;

    float minLado = max(min(uTam.x, uTam.y), 1.0);
    float radioBase = clamp(minLado * 0.045, 16.0, 40.0);
    // El margen garantiza que en p = 1 incluso los lóbulos hacia adentro rebasen las cuatro esquinas.
    float margen = radioBase + uPincel * 1.25 + 16.0;
    float escala = pow(p, 1.15);
    vec2 halfSize = (uTam * 0.5 + margen) * escala;
    float radio = min(radioBase, min(halfSize.x, halfSize.y));

    float sd = sdRectRedondeado(q, halfSize, radio);

    float distCentro = length(q);
    vec2 dir = distCentro > 0.0001 ? q / distCentro : vec2(1.0, 0.0);
    float t = uTiempo * uRuidoTiempo;

    float macro = fbm(dir * uRuidoEscala + vec2(t, -t * 0.65));
    float anchoVar = fbm(dir * (uRuidoEscala * 2.15) + vec2(7.3, -11.9) - vec2(t * 0.7));
    float detalle = fbm(pos * 0.016 + vec2(13.7, -7.4) + vec2(-t * 0.4, t * 0.5));

    // Se estira el contraste del fbm para que el grosor recorra todo el rango hasta uPincel.
    float tLobo = smoothstep(0.22, 0.74, macro) * 2.0 - 1.0;
    float tDetalle = smoothstep(0.24, 0.74, detalle) * 2.0 - 1.0;
    float tGrosor = smoothstep(0.22, 0.74, anchoVar);

    float aperturaPincel = smoothstep(0.0, 0.22, p);
    float pincelMax = min(uPincel * aperturaPincel, min(halfSize.x, halfSize.y) * 0.72);

    float grosor = pincelMax * mix(0.18, 1.0, clamp(0.75 * tGrosor + 0.25 * (tDetalle * 0.5 + 0.5), 0.0, 1.0));
    float centroBorde = (tLobo * 0.28 + tDetalle * 0.08 - 0.14) * pincelMax;
    float bordeInterior = centroBorde - 0.65 * grosor;
    float bordeExterior = centroBorde + 0.35 * grosor;

    float aa = 1.5;
    float alfa = smoothstep(bordeInterior - aa, bordeInterior + aa, sd);
    float mezclaBloque = smoothstep(bordeExterior - aa, bordeExterior + aa, sd);
    vec3 color = mix(uAcido, uBloque, mezclaBloque);

    gl_FragColor = vec4(color, alfa);
  }
`;

interface EstadoContextoPropio {
  ext: WEBGL_lose_context;
  eventoPendiente: boolean;
  restaurarAlPerder: boolean;
}

// Guarda el estado de contextos liberados a propósito para poder restaurarlos si la sección vuelve a entrar en vista.
const contextosLiberados = new WeakMap<HTMLCanvasElement, EstadoContextoPropio>();

interface UniformesMarco {
  uTam: { value: [number, number] };
  uResolucion: { value: [number, number] };
  uProgreso: { value: number };
  uPincel: { value: number };
  uRuidoEscala: { value: number };
  uRuidoTiempo: { value: number };
  uTiempo: { value: number };
  uBloque: { value: [number, number, number] };
  uAcido: { value: [number, number, number] };
}

/** Resuelve cadenas `var(--otro)` si el navegador las devuelve sin expandir en getComputedStyle. */
function leerColorToken(nombre: string, respaldo: string): [number, number, number] {
  let actual = nombre;
  for (let i = 0; i < 4; i++) {
    const valor = leerToken(actual);
    if (!valor) return actual === respaldo ? [1, 1, 1] : leerColor(respaldo);
    const ref = valor.match(/^var\(\s*(--[\w-]+)(?:\s*,[^)]*)?\)$/);
    if (!ref) return leerColor(actual);
    actual = ref[1];
  }
  return leerColor(respaldo);
}

function medirVentana(): { ancho: number; alto: number } {
  return {
    ancho: Math.max(1, Math.round(document.documentElement.clientWidth || window.innerWidth)),
    alto: Math.max(1, Math.round(window.innerHeight)),
  };
}

function dprLimitado(): number {
  const maxDpr = Math.max(1, leerNumero('--marco-dpr-max', DPR_MAX_RESPALDO));
  return Math.min(window.devicePixelRatio || 1, maxDpr);
}

function crearRenderer(canvas: HTMLCanvasElement, ancho: number, alto: number): Renderer {
  return new Renderer({
    canvas,
    width: ancho,
    height: alto,
    dpr: dprLimitado(),
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
  });
}

export function montarMarco(canvas: HTMLCanvasElement): Marco | null {
  if (!hayWebGL()) return null;

  const { ancho: anchoInicial, alto: altoInicial } = medirVentana();
  let renderer: Renderer;
  try {
    renderer = crearRenderer(canvas, anchoInicial, altoInicial);
  } catch {
    return null;
  }

  let geometria: Triangle | null = null;
  let programa: Program | null = null;
  let malla: Mesh | null = null;
  let uniformes: UniformesMarco | null = null;

  let progresoActual = 0;
  let tiempoActual = 0;
  let destruido = false;
  let perdido = false;
  let visible = true;
  let raf = 0;
  let anterior = 0;
  let esperandoRestauracion = false;

  const crearEscena = (): boolean => {
    const gl = renderer.gl;
    if (gl.isContextLost()) return false;
    uniformes = {
      uTam: { value: [renderer.width, renderer.height] },
      uResolucion: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight] },
      uProgreso: { value: progresoActual },
      uPincel: { value: Math.max(0, leerNumero('--marco-pincel', PINCEL_RESPALDO)) },
      uRuidoEscala: { value: leerNumero('--marco-ruido-escala', RUIDO_ESCALA_RESPALDO) },
      uRuidoTiempo: { value: leerNumero('--marco-ruido-tiempo', RUIDO_TIEMPO_RESPALDO) },
      uTiempo: { value: tiempoActual },
      uBloque: { value: leerColorToken('--productos-bloque', '--color-cobalto') },
      uAcido: { value: leerColorToken('--color-acido', '--color-acido') },
    };
    geometria = new Triangle(gl);
    programa = new Program(gl, {
      vertex: VERTICE,
      fragment: FRAGMENTO,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      cullFace: false,
      uniforms: uniformes,
    });
    malla = new Mesh(gl, { geometry: geometria, program: programa });
    malla.frustumCulled = false;
    return true;
  };

  const detenerBucle = (): void => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    anterior = 0;
  };

  const dibujar = (): void => {
    if (destruido || perdido || !malla || renderer.gl.isContextLost()) return;
    renderer.render({ scene: malla });
  };

  const cuadro = (ahora: number): void => {
    raf = 0;
    if (destruido || perdido || !visible || !uniformes) return;
    if (progresoActual <= 0 || progresoActual >= 1) return;
    const dt = anterior ? Math.min(Math.max(0, (ahora - anterior) / 1000), PASO_TIEMPO_MAX_S) : 0;
    anterior = ahora;
    tiempoActual += dt;
    uniformes.uTiempo.value = tiempoActual;
    dibujar();
    programar();
  };

  const programar = (): void => {
    if (raf || destruido || perdido || !visible || !malla) return;
    if (progresoActual <= 0 || progresoActual >= 1) return;
    raf = requestAnimationFrame(cuadro);
  };

  const aplicarMedidas = (): void => {
    const { ancho, alto } = medirVentana();
    const dpr = dprLimitado();
    if (renderer.dpr !== dpr || renderer.width !== ancho || renderer.height !== alto) {
      renderer.dpr = dpr;
      renderer.setSize(ancho, alto);
    }
    if (!uniformes) return;
    uniformes.uTam.value = [ancho, alto];
    uniformes.uResolucion.value = [renderer.gl.drawingBufferWidth, renderer.gl.drawingBufferHeight];
    uniformes.uPincel.value = Math.max(0, leerNumero('--marco-pincel', PINCEL_RESPALDO));
    uniformes.uRuidoEscala.value = leerNumero('--marco-ruido-escala', RUIDO_ESCALA_RESPALDO);
    uniformes.uRuidoTiempo.value = leerNumero('--marco-ruido-tiempo', RUIDO_TIEMPO_RESPALDO);
    uniformes.uBloque.value = leerColorToken('--productos-bloque', '--color-cobalto');
    uniformes.uAcido.value = leerColorToken('--color-acido', '--color-acido');
  };

  const alPerder = (e: Event): void => {
    e.preventDefault();
    perdido = true;
    detenerBucle();
    canvas.style.display = 'none';
  };

  const alRestaurar = (): void => {
    esperandoRestauracion = false;
    if (destruido || perdido) return;
    contextosLiberados.delete(canvas);
    const { ancho, alto } = medirVentana();
    try {
      renderer = crearRenderer(canvas, ancho, alto);
    } catch {
      perdido = true;
      canvas.style.display = 'none';
      return;
    }
    if (!crearEscena()) {
      perdido = true;
      canvas.style.display = 'none';
      return;
    }
    canvas.addEventListener('webglcontextlost', alPerder);
    aplicarMedidas();
    dibujar();
    programar();
  };

  const alRedimensionar = (): void => {
    if (destruido || perdido) return;
    aplicarMedidas();
    dibujar();
  };

  const vigia =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entrada]) => {
          visible = entrada.isIntersecting;
          if (visible) {
            anterior = 0;
            programar();
          } else {
            detenerBucle();
          }
        })
      : null;

  window.addEventListener('resize', alRedimensionar, { passive: true });
  vigia?.observe(canvas);

  if (renderer.gl.isContextLost()) {
    const estadoPrevio = contextosLiberados.get(canvas);
    if (!estadoPrevio) {
      window.removeEventListener('resize', alRedimensionar);
      vigia?.disconnect();
      canvas.style.display = 'none';
      return null;
    }
    esperandoRestauracion = true;
    canvas.addEventListener('webglcontextrestored', alRestaurar, { once: true });
    if (estadoPrevio.eventoPendiente) {
      estadoPrevio.restaurarAlPerder = true;
    } else {
      estadoPrevio.ext.restoreContext();
    }
  } else {
    canvas.addEventListener('webglcontextlost', alPerder);
    crearEscena();
    aplicarMedidas();
    dibujar();
  }

  return {
    progreso(p: number): void {
      if (destruido || perdido) return;
      progresoActual = Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0;
      if (uniformes) uniformes.uProgreso.value = progresoActual;
      dibujar();
      if (progresoActual > 0 && progresoActual < 1) programar();
      else detenerBucle();
    },
    redimensionar(): void {
      if (destruido || perdido) return;
      aplicarMedidas();
      dibujar();
    },
    destruir(): void {
      if (destruido) return;
      destruido = true;
      detenerBucle();
      window.removeEventListener('resize', alRedimensionar);
      canvas.removeEventListener('webglcontextlost', alPerder);
      if (esperandoRestauracion) {
        canvas.removeEventListener('webglcontextrestored', alRestaurar);
        const estadoPrevio = contextosLiberados.get(canvas);
        if (estadoPrevio) estadoPrevio.restaurarAlPerder = false;
      }
      vigia?.disconnect();

      geometria?.remove();
      programa?.remove();
      geometria = null;
      programa = null;
      malla = null;
      uniformes = null;

      canvas.style.width = '';
      canvas.style.height = '';

      // Un contexto ya perdido no se vuelve a soltar: Chrome avisa en consola (E7 de T03).
      const gl = renderer.gl;
      if (!gl.isContextLost()) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) {
          const estado: EstadoContextoPropio = {
            ext,
            eventoPendiente: true,
            restaurarAlPerder: false,
          };
          contextosLiberados.set(canvas, estado);
          canvas.addEventListener(
            'webglcontextlost',
            (e: Event) => {
              e.preventDefault();
              estado.eventoPendiente = false;
              if (estado.restaurarAlPerder) {
                estado.restaurarAlPerder = false;
                ext.restoreContext();
              }
            },
            { once: true },
          );
          ext.loseContext();
        }
      }
    },
  };
}
