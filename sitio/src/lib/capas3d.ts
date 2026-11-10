// Objetos 3D en capas (tabletales A1–A2, K1) con Three. Este módulo se carga con import() dinámico después de
// `data-listo`: Three no viaja en el JS inicial. Las piezas salen todas de `pieza()`; cuando lleguen los .glb del
// autor (docs/2-TECNICO § 7) se cambia el cuerpo de esa función y la escena no se toca.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
} from 'three';
import type { WebGLRenderer } from 'three';
import { leerNumero, leerToken } from './tokens';

/** Posición en fracciones del semiancho y el semialto visibles (−1…1) y profundidad z en unidades de escena. */
export interface Posicion {
  x: number;
  y: number;
  z: number;
}

export interface Pieza {
  malla: Mesh<BufferGeometry, MeshStandardMaterial>;
  base: Posicion;
  /** Cuánto sigue al cursor: las piezas cercanas se mueven más que las lejanas. */
  profundidad: number;
  /** Giro lento por cuadro (radianes a 60 fps). */
  giro: number;
  /** Sitio de reposo en unidades de escena, ya apartado del contenido (lo calcula `resolver` al medir). */
  anclaje: { x: number; y: number };
  /** Si la pieza cruza el titular (decisión del autor, H7 de T02): su sitio sale de una línea del texto. */
  cruce?: Cruce;
}

/** Punto de una línea del titular: `linea` es el índice de [data-linea]; `fx`/`fy`, fracciones del texto (0…1). */
export interface Cruce {
  linea: number;
  fx: number;
  fy: number;
}

/** Rectángulo en píxeles, con el origen en la esquina de la portada. */
interface Zona {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Capa {
  contenedor: HTMLElement;
  canvas: HTMLCanvasElement;
  renderer: WebGLRenderer;
  escena: Scene;
  camara: PerspectiveCamera;
  piezas: Pieza[];
  perdida: boolean;
}

// Números de la escena, juntos para el pulido. Las posiciones van en fracciones del semiancho/semialto
// visibles (−1…1), la z en unidades de escena. Regla de las posiciones: el titular, la pastilla y las
// etiquetas ocupan la franja central, así que las piezas viven en las franjas de arriba y de abajo.
const DISTANCIA_CAMARA = 14;
const CAMPO_VISION = 35;
const ANCHO_REF = 1100; // por debajo de este ancho las piezas se achican, como en el prototipo
const ALTO_REF = 800;
const ESCALA_MINIMA = 0.4; // escala de una pieza cuando el viewport es muy chico
const ESCALA_VARIABLE = 1 - ESCALA_MINIMA; // lo que crece hasta llegar a la escala completa
const RUGOSIDAD = 0.55;
const UMBRAL_ARISTAS = 30; // grados: solo se dibujan las aristas más marcadas
const PARALLAX_CURSOR_X = 1.6; // unidades de escena que mueve el cursor a una pieza de profundidad 1
const PARALLAX_CURSOR_Y = 1.2;
// Una pieza que cruza el titular sigue al cursor solo a lo largo de la línea y a la mitad: si subiera o bajara
// con él se montaría en las etiquetas o en la pastilla (prueba de solape, 1280 × 720).
const PARALLAX_CRUCE_X = 0.5;
// Radio máximo de una pieza que cruza, en fracción del alto de la línea: su tamaño sale del texto que cruza, no
// de la pantalla (en tablet vertical el titular es chico y el octaedro tapaba «ta ve»).
const TAMANO_CRUCE = 0.3;
const PARALLAX_CRUCE_Y = 0;
const HOLGURA_CONTENIDO = 10; // px de aire entre una pieza y el texto, la pastilla o las etiquetas
const FACTOR_ESFERA = 0.9; // la pieza gira: se le da casi toda su esfera envolvente, no el peor caso exacto
const ENCOGER = [1, 0.75, 0.55] as const; // si no cabe en el sitio libre, la pieza se achica un poco
const SALIDA_BORDE = 0.3; // cuánto de su radio puede asomar una pieza fuera de la portada

const POS_DETRAS = {
  octaedroMagenta: { x: -0.8, y: 0.66, z: -3 },
  monedaTomate: { x: 0.86, y: -0.68, z: -2 },
  cuboTinta: { x: -0.3, y: -0.82, z: -2 },
} as const satisfies Record<string, Posicion>;
// Piezas que cruzan el titular (Table Tales A1, decisión del autor 2026-11-10): ancladas a un punto del texto, no
// de la pantalla, para que crucen las letras en cualquier tamaño. Siguen sin tocar la pastilla ni las etiquetas.
const CRUCE_DELANTE: Cruce = { linea: 0, fx: 0.6, fy: 0 }; // el octaedro en el borde de arriba, entre «esta» y «vez»: cruza la parte alta de las letras sin tapar una palabra
const CRUCE_DETRAS: Cruce = { linea: 1, fx: 0.56, fy: 0.5 }; // el cubo tinta detrás de «haces»
const POS_DELANTE = {
  cuboAcido: { x: 0.78, y: 0.66, z: 1 },
  fichaAcida: { x: -0.88, y: -0.7, z: 0.5 },
  octaedroTomate: { x: 0.42, y: -0.82, z: 1.5 },
} as const satisfies Record<string, Posicion>;

/** Una pieza con sombreado plano y aristas en tinta. `colorToken` es el nombre de un token de color. */
export function pieza(geometria: BufferGeometry, colorToken: string, posicion: Posicion, profundidad: number, cruce?: Cruce): Pieza {
  const malla = new Mesh(geometria, new MeshStandardMaterial({ color: new Color(leerToken(colorToken)), roughness: RUGOSIDAD, flatShading: true }));
  malla.add(new LineSegments(new EdgesGeometry(geometria, UMBRAL_ARISTAS), new LineBasicMaterial({ color: new Color(leerToken('--color-tinta')) })));
  // Giro y orientación inicial salen de la posición: la escena es la misma en cada visita.
  const semilla = Math.abs(Math.sin(posicion.x * 12.9898 + posicion.y * 78.233));
  malla.rotation.set(semilla * 3, (semilla * 7) % 3, 0);
  return { malla, base: posicion, profundidad, giro: (semilla - 0.3) * 0.006, anclaje: { x: 0, y: 0 }, cruce };
}

// Cubo, ficha, moneda y octaedro: el píxel, la ficha de un juego, el precio y la gema.
// Ninguna en cobalto: se perdería en el fondo de la portada.
const DETRAS = (): Pieza[] => [
  pieza(new OctahedronGeometry(0.95), '--color-magenta', POS_DETRAS.octaedroMagenta, 0.6),
  pieza(new CylinderGeometry(0.9, 0.9, 0.22, 28), '--color-tomate', POS_DETRAS.monedaTomate, 0.8),
  pieza(new BoxGeometry(0.7, 0.7, 0.7), '--color-tinta', POS_DETRAS.cuboTinta, 0.4, CRUCE_DETRAS),
];
const DELANTE = (): Pieza[] => [
  pieza(new BoxGeometry(1.3, 1.3, 1.3), '--color-acido', POS_DELANTE.cuboAcido, 1.2),
  pieza(new BoxGeometry(1.6, 1.6, 0.35), '--color-acido', POS_DELANTE.fichaAcida, 1.5),
  pieza(new OctahedronGeometry(0.6), '--color-tomate', POS_DELANTE.octaedroTomate, 1.8, CRUCE_DELANTE),
];

/** Zonas que las piezas no deben cubrir: la nav (que tapa el borde superior), las etiquetas, el texto y la pastilla. */
function zonasDelContenido(portada: HTMLElement): { todas: Zona[]; sinTitular: Zona[]; lineas: Zona[] } {
  const origen = portada.getBoundingClientRect();
  const zonas: Zona[] = [];
  const sumar = (r: DOMRect | DOMRectReadOnly, a: Zona[] = zonas): void => {
    if (r.width > 4 && r.height > 4) a.push({ x: r.left - origen.left, y: r.top - origen.top, w: r.width, h: r.height });
  };
  // La nav es fija: solo tapa el borde de la portada que está arriba del documento. Se mide con la posición
  // de la portada en la página (no en la ventana) para que el resultado no cambie con el scroll.
  const bajoNav = Math.max(0, leerNumero('--alto-nav', 64) - (origen.top + window.scrollY));
  if (bajoNav > 0) zonas.push({ x: 0, y: 0, w: origen.width, h: bajoNav });
  portada.querySelectorAll('[data-etiquetas] > span, [data-objeto]').forEach((el) => sumar(el.getBoundingClientRect()));
  const sinTitular = [...zonas];
  const lineas: Zona[] = [];
  portada.querySelectorAll('[data-linea] > span').forEach((linea) => {
    const rango = document.createRange();
    rango.selectNodeContents(linea);
    for (const r of rango.getClientRects()) sumar(r);
    // Lo que ocupa el texto de la línea, recortado a su máscara (la fuente sobresale por arriba).
    const caja = (linea.parentElement ?? linea).getBoundingClientRect();
    const r = rango.getBoundingClientRect();
    const arriba = Math.max(r.top, caja.top);
    const abajo = Math.min(r.bottom, caja.bottom);
    lineas.push({ x: r.left - origen.left, y: arriba - origen.top, w: r.width, h: Math.max(0, abajo - arriba) });
  });
  return { todas: zonas, sinTitular, lineas };
}

/** Aparta un círculo (centro y radio en px) de las zonas, empujándolo por el camino más corto. Devuelve si quedó libre. */
function apartar(c: { x: number; y: number }, radio: number, zonas: Zona[]): boolean {
  for (let vuelta = 0; vuelta < 12; vuelta++) {
    let movido = false;
    for (const z of zonas) {
      const x0 = z.x - HOLGURA_CONTENIDO;
      const x1 = z.x + z.w + HOLGURA_CONTENIDO;
      const y0 = z.y - HOLGURA_CONTENIDO;
      const y1 = z.y + z.h + HOLGURA_CONTENIDO;
      const qx = Math.min(Math.max(c.x, x0), x1);
      const qy = Math.min(Math.max(c.y, y0), y1);
      const dx = c.x - qx;
      const dy = c.y - qy;
      const d = Math.hypot(dx, dy);
      if (d >= radio) continue;
      movido = true;
      if (d > 0) {
        c.x += (dx / d) * (radio - d);
        c.y += (dy / d) * (radio - d);
      } else {
        // El centro cayó dentro de la zona: sale por el lado más cercano.
        const salidas = [
          { lado: 'izq', dist: c.x - x0 },
          { lado: 'der', dist: x1 - c.x },
          { lado: 'arr', dist: c.y - y0 },
          { lado: 'aba', dist: y1 - c.y },
        ].sort((a, b) => a.dist - b.dist);
        const lado = salidas[0].lado;
        if (lado === 'izq') c.x = x0 - radio;
        else if (lado === 'der') c.x = x1 + radio;
        else if (lado === 'arr') c.y = y0 - radio;
        else c.y = y1 + radio;
      }
    }
    if (!movido) return true;
  }
  return false;
}

function crearCapa(Renderer: typeof WebGLRenderer, contenedor: HTMLElement, hacerPiezas: () => Pieza[]): Capa | null {
  const canvas = contenedor.querySelector('canvas');
  if (!canvas) return null;
  const renderer = new Renderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearAlpha(0);
  const escena = new Scene();
  const camara = new PerspectiveCamera(CAMPO_VISION, 1, 0.1, 100);
  camara.position.z = DISTANCIA_CAMARA;
  // Luces en papel: el mismo blanco de la marca, sin literales
  const papel = new Color(leerToken('--color-papel'));
  const sol = new DirectionalLight(papel, 2.2);
  sol.position.set(4, 6, 8);
  escena.add(new AmbientLight(papel, 1.6), sol);
  const piezas = hacerPiezas();
  for (const p of piezas) escena.add(p.malla);
  return { contenedor, canvas, renderer, escena, camara, piezas, perdida: false };
}

function liberarCapa(capa: Capa): void {
  for (const p of capa.piezas) {
    p.malla.geometry.dispose();
    p.malla.material.dispose();
    for (const hijo of p.malla.children) {
      if (hijo instanceof LineSegments) {
        hijo.geometry.dispose();
        if (!Array.isArray(hijo.material)) hijo.material.dispose();
      }
    }
  }
  capa.renderer.dispose();
  capa.renderer.forceContextLoss();
}

/** Monta las capas `[data-capa]` de la portada. Devuelve la función que libera todo lo creado. */
export async function montarCapas(portada: HTMLElement, reducido: boolean): Promise<() => void> {
  const { WebGLRenderer: Renderer } = await import('./three-renderer');
  const hacedores = [DETRAS, DELANTE];
  const capas: Capa[] = [];
  portada.querySelectorAll<HTMLElement>('[data-capa]').forEach((contenedor, i) => {
    const hacer = hacedores[i % hacedores.length];
    try {
      const capa = crearCapa(Renderer, contenedor, hacer);
      if (capa) capas.push(capa);
    } catch {
      // Un renderer que no se pudo crear deja esa capa vacía: la portada sigue completa.
    }
  });
  if (capas.length === 0) return () => {};

  let cursorX = 0;
  let cursorY = 0;
  let raf = 0;
  let visible = true;
  let liberado = false;
  let anterior = 0;
  // El recorrido que da el cursor se achica con las piezas: en una ventana angosta, 1,6 unidades de escena
  // son casi media pantalla y las llevaban encima del titular (prueba de solape de T02, 375 × 667).
  let escalaCursor = 1;

  const medir = (): void => {
    const contenido = zonasDelContenido(portada);
    const mediaAlto = Math.tan((CAMPO_VISION / 2) * (Math.PI / 180)) * DISTANCIA_CAMARA;
    for (const capa of capas) {
      const ancho = Math.max(1, capa.contenedor.clientWidth);
      const alto = Math.max(1, capa.contenedor.clientHeight);
      capa.renderer.setSize(ancho, alto, false);
      capa.camara.aspect = ancho / alto;
      capa.camara.updateProjectionMatrix();
      // Se achican con el ancho y también con el alto: en celular acostado no deben tapar el titular
      const k = Math.min(1, ancho / ANCHO_REF, alto / ALTO_REF);
      const escala = ESCALA_MINIMA + ESCALA_VARIABLE * k;
      escalaCursor = escala;
      const mediaAncho = mediaAlto * capa.camara.aspect;
      for (const p of capa.piezas) {
        // Píxeles por unidad de escena a la profundidad de la pieza (la perspectiva agranda lo cercano)
        const pxPorUnidad = (alto / (2 * mediaAlto)) * (DISTANCIA_CAMARA / (DISTANCIA_CAMARA - p.base.z));
        if (!p.malla.geometry.boundingSphere) p.malla.geometry.computeBoundingSphere();
        const esfera = (p.malla.geometry.boundingSphere?.radius ?? 1) * FACTOR_ESFERA;
        const linea = p.cruce ? contenido.lineas[p.cruce.linea] : undefined;
        const pedido =
          p.cruce && linea && linea.w > 0
            ? { x: linea.x + p.cruce.fx * linea.w, y: linea.y + p.cruce.fy * linea.h }
            : { x: ancho / 2 + p.base.x * mediaAncho * pxPorUnidad, y: alto / 2 - p.base.y * mediaAlto * pxPorUnidad };
        const zonas = p.cruce ? contenido.sinTitular : contenido.todas;
        let centro = pedido;
        const tope = p.cruce && linea && linea.h > 0 ? (linea.h * TAMANO_CRUCE) / (esfera * escala * pxPorUnidad) : Infinity;
        let factor: number = Math.min(ENCOGER[0], tope);
        for (const e of ENCOGER) {
          const f = Math.min(e, tope);
          factor = f;
          centro = { ...pedido };
          if (apartar(centro, esfera * escala * f * pxPorUnidad, zonas)) break;
        }
        // Sin salir de la portada más de lo que se permite (la pieza puede asomar un poco por el borde)
        const margen = esfera * escala * factor * pxPorUnidad * SALIDA_BORDE;
        centro.x = Math.min(Math.max(centro.x, -margen), ancho + margen);
        centro.y = Math.min(Math.max(centro.y, -margen), alto + margen);
        p.anclaje.x = (centro.x - ancho / 2) / pxPorUnidad;
        p.anclaje.y = (alto / 2 - centro.y) / pxPorUnidad;
        p.malla.scale.setScalar(escala * factor);
      }
    }
  };

  // Posición objetivo de una pieza: su sitio en la pantalla más el desplazamiento que le da el cursor.
  const colocar = (capa: Capa, suavizado: number): void => {
    for (const p of capa.piezas) {
      const fx = p.cruce ? PARALLAX_CRUCE_X : 1;
      const fy = p.cruce ? PARALLAX_CRUCE_Y : 1;
      const x = p.anclaje.x + cursorX * p.profundidad * PARALLAX_CURSOR_X * escalaCursor * fx;
      const y = p.anclaje.y - cursorY * p.profundidad * PARALLAX_CURSOR_Y * escalaCursor * fy;
      p.malla.position.x += (x - p.malla.position.x) * suavizado;
      p.malla.position.y += (y - p.malla.position.y) * suavizado;
      p.malla.position.z = p.base.z;
    }
  };

  const dibujar = (): void => {
    for (const capa of capas) if (!capa.perdida) capa.renderer.render(capa.escena, capa.camara);
  };

  const cuadro = (ahora: number): void => {
    raf = 0;
    if (liberado || !visible) return;
    const paso = anterior ? Math.min((ahora - anterior) / 16.67, 4) : 1;
    anterior = ahora;
    for (const capa of capas) {
      colocar(capa, 1 - Math.pow(0.94, paso));
      for (const p of capa.piezas) {
        p.malla.rotation.x += (p.giro + 0.002) * paso;
        p.malla.rotation.y += (p.giro * 1.3 + 0.003) * paso;
      }
    }
    dibujar();
    raf = requestAnimationFrame(cuadro);
  };

  const alMover = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return; // con el dedo se hace scroll, no se apunta
    cursorX = e.clientX / window.innerWidth - 0.5;
    cursorY = e.clientY / window.innerHeight - 0.5;
  };

  const alPerder = (capa: Capa) => (e: Event): void => {
    e.preventDefault();
    capa.perdida = true;
    capa.canvas.style.display = 'none';
  };
  const escuchasPerdida = capas.map((capa) => ({ capa, fn: alPerder(capa) }));
  for (const { capa, fn } of escuchasPerdida) capa.canvas.addEventListener('webglcontextlost', fn);

  const observadorTam = new ResizeObserver(() => {
    medir();
    for (const capa of capas) colocar(capa, 1);
    if (reducido) dibujar();
  });
  observadorTam.observe(portada);
  const vigia = new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    // Las escenas no dibujan cuando la portada no está en pantalla.
    if (visible && !reducido && !raf && !liberado) {
      anterior = 0;
      raf = requestAnimationFrame(cuadro);
    }
  });
  vigia.observe(portada);

  medir();
  for (const capa of capas) colocar(capa, 1);
  dibujar();
  if (!reducido) {
    window.addEventListener('pointermove', alMover, { passive: true });
    raf = requestAnimationFrame(cuadro);
  }

  return () => {
    liberado = true;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', alMover);
    for (const { capa, fn } of escuchasPerdida) capa.canvas.removeEventListener('webglcontextlost', fn);
    observadorTam.disconnect();
    vigia.disconnect();
    for (const capa of capas) liberarCapa(capa);
  };
}
