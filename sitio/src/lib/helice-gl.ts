// Tarjetas curvas de la hélice (ryan A4-A5, técnicas K3-K4) en OGL. Cada tarjeta es un plano subdividido que
// el vértice dobla sobre el cilindro y proyecta con la misma perspectiva del CSS 3D, para que caiga justo
// debajo de su botón del DOM. El fragmento pinta el color de la facultad, una trama que se acerca y se
// desliza con la velocidad del giro (D-8) y el borde de tinta. Se carga diferido y libera su contexto.
import { Mesh, Plane, Program, Renderer, Texture } from 'ogl';
import { leerColor, leerNumero } from './tokens';
import { hayWebGL } from './webgl';

export type Color = [number, number, number];

export interface TarjetaGL {
  /** Ángulo sobre el cilindro en radianes: 0 es el frente. */
  angulo: number;
  /** Desplazamiento vertical del centro en px (positivo hacia abajo, como en CSS). */
  y: number;
  color: Color;
  /** Color del texto y posición de su máscara en la lista que recibió ponerTextos (-1 = sin texto). */
  colorTexto: Color;
  texto: number;
}

export interface EscenaGL {
  /** Corrimiento horizontal del centro de la hélice en px, respecto al centro del canvas. */
  centroX: number;
  radio: number;
  perspectiva: number;
  ancho: number;
  alto: number;
  /** Velocidad del giro ya suavizada, de -1 a 1. */
  velocidad: number;
}

export interface HeliceGL {
  dibujar(tarjetas: readonly TarjetaGL[], escena: EscenaGL): void;
  /** Sube las máscaras de texto de las tarjetas (una por tarjeta, en su orden). */
  ponerTextos(lienzos: readonly HTMLCanvasElement[]): void;
  /** Ajusta el canvas a su caja y vuelve a leer los colores del tema. */
  redimensionar(): void;
  destruir(): void;
}

const SEGMENTOS = 28;

const VERTICE = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;

  uniform vec2 uTarjeta;
  uniform vec2 uEtapa;
  uniform float uRadio;
  uniform float uPerspectiva;
  uniform float uAngulo;
  uniform float uY;
  uniform float uCentroX;

  varying vec2 vUv;
  varying float vFrente;

  void main() {
    // Coordenadas de CSS: x a la derecha, y hacia abajo, z hacia quien mira.
    float x = position.x * uTarjeta.x;
    float y = -position.y * uTarjeta.y;
    float psi = x / uRadio + uAngulo;
    vec3 p = vec3(uRadio * sin(psi), y + uY, uRadio * cos(psi) - uRadio);
    float w = uPerspectiva - p.z;
    vec2 pantalla = p.xy * uPerspectiva;
    vUv = uv;
    vFrente = cos(psi);
    gl_Position = vec4((pantalla.x + uCentroX * w) * 2.0 / uEtapa.x, -pantalla.y * 2.0 / uEtapa.y, 0.0, w);
  }
`;

const FRAGMENTO = /* glsl */ `
  precision highp float;

  uniform vec2 uTarjeta;
  uniform vec3 uColor;
  uniform vec3 uTinta;
  uniform vec3 uFondo;
  uniform float uZoom;
  uniform float uDeriva;
  uniform float uBorde;
  uniform float uEsquina;
  uniform float uDorso;
  uniform float uCelda;
  uniform float uTramaFuerza;
  uniform sampler2D uTexto;
  uniform vec3 uColorTexto;
  uniform float uConTexto;

  varying vec2 vUv;
  varying float vFrente;

  float sdCaja(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uTarjeta;
    float d = sdCaja(p, uTarjeta * 0.5, uEsquina);
    float alfa = 1.0 - smoothstep(-1.25, 0.0, d);
    if (alfa <= 0.0) discard;

    // Trama de cruces: se acerca y se desliza dentro del marco, que no se mueve (ryan A5).
    vec2 q = (vUv - 0.5) * (1.0 - uZoom);
    q.y += uDeriva;
    vec2 celda = fract(q * uTarjeta / uCelda) - 0.5;
    float fino = min(abs(celda.x), abs(celda.y));
    float brazo = max(abs(celda.x), abs(celda.y));
    float cruz = (1.0 - smoothstep(0.035, 0.07, fino)) * (1.0 - smoothstep(0.17, 0.21, brazo));

    vec3 c = mix(uColor, uTinta, cruz * uTramaFuerza);
    // El texto va curvado con la tarjeta; de espaldas no se pinta (se leería al revés).
    if (vFrente > 0.0) c = mix(c, uColorTexto, texture2D(uTexto, vUv).a * uConTexto);
    c = mix(c, uTinta, smoothstep(-uBorde - 1.25, -uBorde, d));
    // El dorso se funde con el fondo (ryan K4).
    if (vFrente < 0.0) c = mix(c, uFondo, uDorso);
    gl_FragColor = vec4(c * alfa, alfa);
  }
`;

export function montarHelice(canvas: HTMLCanvasElement): HeliceGL | null {
  if (!hayWebGL()) return null;

  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: true, depth: false, dpr: 1 });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (gl.isContextLost()) return null;
  // El constructor deja el canvas en 300 × 150 con estilos en línea: el tamaño visible lo pone el CSS.
  canvas.style.width = '';
  canvas.style.height = '';

  const vacia = new Texture(gl);
  let texturas: Texture[] = [];
  const uniformes = {
    uTexto: { value: vacia },
    uColorTexto: { value: [0, 0, 0] },
    uConTexto: { value: 0 },
    uCentroX: { value: 0 },
    uTarjeta: { value: [1, 1] },
    uEtapa: { value: [1, 1] },
    uRadio: { value: 1 },
    uPerspectiva: { value: 1 },
    uAngulo: { value: 0 },
    uY: { value: 0 },
    uColor: { value: [1, 1, 1] },
    uTinta: { value: [0, 0, 0] },
    uFondo: { value: [1, 1, 1] },
    uZoom: { value: 0 },
    uDeriva: { value: 0 },
    uBorde: { value: 2 },
    uEsquina: { value: 8 },
    uDorso: { value: 0.75 },
    uCelda: { value: 26 },
    uTramaFuerza: { value: 0.14 },
  };

  let malla: Mesh;
  try {
    const geometria = new Plane(gl, { width: 1, height: 1, widthSegments: SEGMENTOS, heightSegments: 1 });
    const programa = new Program(gl, {
      vertex: VERTICE,
      fragment: FRAGMENTO,
      uniforms: uniformes,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: false,
    });
    malla = new Mesh(gl, { geometry: geometria, program: programa });
  } catch {
    return null;
  }

  let destruido = false;
  let zoomMax = 0.05;
  let derivaMax = 0.02;

  const leerTema = (): void => {
    uniformes.uTinta.value = leerColor('--color-tinta');
    uniformes.uFondo.value = leerColor('--fondo');
    uniformes.uBorde.value = leerNumero('--borde-ancho', 2);
    uniformes.uEsquina.value = leerNumero('--radio', 8);
    uniformes.uDorso.value = leerNumero('--helice-dorso', 0.75);
    uniformes.uCelda.value = Math.max(4, leerNumero('--helice-trama-celda', 26));
    uniformes.uTramaFuerza.value = leerNumero('--helice-trama-fuerza', 0.14);
    zoomMax = leerNumero('--helice-zoom', 0.05);
    derivaMax = leerNumero('--helice-deriva', 0.02);
  };

  const redimensionar = (): void => {
    if (destruido || gl.isContextLost()) return;
    const ancho = Math.max(1, canvas.clientWidth);
    const alto = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, Math.max(1, leerNumero('--helice-dpr-max', 2)));
    if (renderer.dpr !== dpr || renderer.width !== ancho || renderer.height !== alto) {
      renderer.dpr = dpr;
      // El tamaño visible lo pone el CSS: setSize solo fija el búfer.
      renderer.setSize(ancho, alto);
      canvas.style.width = '';
      canvas.style.height = '';
    }
    uniformes.uEtapa.value = [ancho, alto];
    leerTema();
  };

  const dibujar = (tarjetas: readonly TarjetaGL[], escena: EscenaGL): void => {
    if (destruido || gl.isContextLost()) return;
    renderer.bindFramebuffer();
    renderer.setViewport(renderer.width * renderer.dpr, renderer.height * renderer.dpr);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    uniformes.uTarjeta.value = [escena.ancho, escena.alto];
    uniformes.uRadio.value = escena.radio;
    uniformes.uPerspectiva.value = escena.perspectiva;
    uniformes.uCentroX.value = escena.centroX;
    uniformes.uZoom.value = zoomMax * Math.abs(escena.velocidad);
    uniformes.uDeriva.value = derivaMax * escena.velocidad;

    // Sin búfer de profundidad: se pinta de atrás hacia adelante.
    const orden = [...tarjetas].sort((a, b) => Math.cos(a.angulo) - Math.cos(b.angulo));
    const medioAlto = renderer.height / 2;
    for (const t of orden) {
      const z = escena.radio * Math.cos(t.angulo) - escena.radio;
      const escala = escena.perspectiva / (escena.perspectiva - z);
      // Fuera de la pantalla por arriba o por abajo: no se dibuja.
      if ((Math.abs(t.y) - escena.alto / 2) * escala > medioAlto) continue;
      uniformes.uAngulo.value = t.angulo;
      uniformes.uY.value = t.y;
      uniformes.uColor.value = t.color;
      const textura = texturas[t.texto];
      uniformes.uTexto.value = textura ?? vacia;
      uniformes.uConTexto.value = textura ? 1 : 0;
      uniformes.uColorTexto.value = t.colorTexto;
      malla.draw();
    }
  };

  const soltarTexturas = (): void => {
    for (const t of texturas) gl.deleteTexture(t.texture);
    texturas = [];
  };

  const ponerTextos = (lienzos: readonly HTMLCanvasElement[]): void => {
    if (destruido || gl.isContextLost()) return;
    soltarTexturas();
    texturas = lienzos.map((image) => new Texture(gl, { image, generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR, anisotropy: 8 }));
  };

  const destruir = (): void => {
    if (destruido) return;
    destruido = true;
    if (!gl.isContextLost()) {
      soltarTexturas();
      gl.deleteTexture(vacia.texture);
    }
    malla.geometry.remove();
    malla.program.remove();
    // Si el navegador ya perdió el contexto no se suelta otra vez: Chrome avisa en consola (E7 de T03).
    if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

  redimensionar();
  return { dibujar, ponerTextos, redimensionar, destruir };
}
