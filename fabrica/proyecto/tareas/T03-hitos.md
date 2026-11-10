---
id: T03
agente: "@constructor"
fase: 1
depende: [T02]
tipo: componente
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - fabrica/proyecto/referentes/T03.json
  - sitio/tests/T03/t03.spec.ts
rutas: ["/"]
archivos:
  - sitio/src/**
  - "!sitio/src/components/Portada.astro"
  - "!sitio/src/components/Precarga.astro"
  - "!sitio/src/components/Mascota.astro"
  - "!sitio/src/components/Nav.astro"
  - "!sitio/src/components/Pie.astro"
  - "!sitio/src/lib/portada.ts"
  - "!sitio/src/lib/capas3d.ts"
  - "!sitio/src/lib/trama.ts"
  - "!sitio/src/lib/three-renderer.ts"
  - "!sitio/src/lib/listo.ts"
  - "!sitio/src/layouts/**"
regresion: [T01, T02]
bloqueantes: []
---

# `T03` · `@constructor` — Hitos

> Fase 1 · corre sola · Buzón: `fabrica/buzon/T03/` · Se lanza sin `high` (no hay shaders).

## Por qué existe

Es el segundo paso del arco persuasivo: después de «¿Y si esta vez sí lo haces realidad?», el visitante
recorre en horizontal lo que le pasa a un buen proyecto: idea, equipo, usuarios, valor y nombre. Es la
línea de tiempo de Unseen, con el unicornio viajando por la línea. Va justo debajo de la portada.

## Lee antes de empezar

- `fabrica/proyecto/referentes/T03.json`: lo que se calca (unseen A3, A4, A4b, A5) y la técnica (K1–K4)
  con sus constantes. Mira las capturas que cita (`referentes/capturas/unseen-05..07-1440.jpg`).
- `docs/1-PRODUCTO.md` § 2 (recorrido), § 3 (mapa: unseen A3–A6), § 4 (dirección de arte) y § 6
  (D-4, D-5 y las dos decisiones del 2026-11-10 sobre los hitos).
- `docs/2-TECNICO.md` § 1 (GSAP, Lenis) y § 2 (tokens, tema, movimiento reducido).
- El código existente: `src/lib/movimiento.ts` (Lenis + ScrollTrigger; exporta `lenis`, `gsap`,
  `ScrollTrigger`, `movimientoReducido`), `src/components/Mascota.astro`, `src/styles/tokens.css`,
  `src/pages/index.astro`.

## Decisiones que aplica esta tarea

- D-4: horizontal en escritorio. **El vertical de celular no se construye aquí** (orden del autor del
  2026-11-10: el responsive va en las tareas `R`). En angosto, solo apilado, sin pin y sin scroll
  horizontal de página.
- D-5: viaja el **unicornio** (`Mascota.astro`, sin modificarlo).
- Autor, 2026-11-10: el panel de cada hito es un **bloque de color a sangre con la palabra del hito en
  serif cursiva gigante** (calca el mes en cursiva de unseen A6, en lugar de la imagen del proyecto).
- Autor, 2026-11-10: la sección va sobre el **fondo del tema**, y dos hitos **pasan a tinta** como en
  unseen A4b.
- Del orquestador (2026-11-10, reversibles por token o texto):
  - Bloques, en orden: ácido · magenta · tomate · cobalto · ácido. La palabra va en tinta sobre ácido,
    magenta y tomate, y en papel sobre cobalto.
  - Pasan a tinta los hitos 3 (`[USUARIOS]`) y 5 (`[NOMBRE]`). En tema oscuro, donde el fondo ya es
    tinta, esos dos pasan a papel. Es el mismo gesto de invertir el fondo.
  - La segunda etiqueta es el contador `[01/05]` … `[05/05]`. No se ponen fechas: serían datos
    inventados (`F1`).
  - Sin «OPEN [+]» (no hay nada que abrir) ni título de sección: arranca directo en el primer hito.

## Qué construyes

Selectores de contrato (las pruebas los leen; no los cambies):
- `section[data-hitos]`: la sección.
- `[data-hitos-pista]`: lo que corre en horizontal.
- `[data-hito]`: cinco, en orden.
- Dentro de cada hito: `[data-hito-etiquetas]`, `[data-hito-titular]` y `[data-hito-bloque]`.
- `[data-linea-punteada]` y `[data-linea-solida]`: el SVG punteado y el contenedor recortado con la
  copia sólida.
- `[data-viajero]`: el elemento que lleva la mascota y que rota.

1. **Contenido** (`src/components/Hitos.astro`, debajo de la portada en `index.astro`). Cinco
   `<article data-hito>` en orden, con los textos de `ENCARGO.md` § 2 tal cual:

   | # | Etiquetas | Titular (`<h2>`) | Palabra del bloque |
   |---|---|---|---|
   | 1 | `[IDEA] [01/05]` | Deja de vivir en tu libreta. | Idea |
   | 2 | `[EQUIPO] [02/05]` | Alguien de otra carrera la entiende mejor que tú. | Equipo |
   | 3 | `[USUARIOS] [03/05]` | Gente que no conoces la usa sin que se lo pidas. | Usuarios |
   | 4 | `[VALOR] [04/05]` | Alguien paga por algo que tú hiciste. | Valor |
   | 5 | `[NOMBRE] [05/05]` | Te buscan por lo que construiste. | Nombre |

   - Las etiquetas van en `--fuente-etiqueta` (mono), pequeñas, como `[MOTION] [JAN_25]` de unseen A4.
   - El titular va en `--fuente-texto` (Zalando Sans) **ligera (peso 300)**, grande: unos 56–64 px a
     1440 con una medida fluida por token. Ocupa de dos a cuatro líneas, como unseen A4.
   - El bloque es grande (al menos el 30 % del ancho y el 45 % del alto de la pantalla a 1440 × 900),
     de un solo color a sangre, con esquinas apenas redondeadas como los paneles de Unseen. La palabra va
     en `--fuente-titular` cursiva, enorme (del orden de un tercio del alto del bloque) y es
     `aria-hidden`, porque repite la etiqueta.
   - Texto y bloque se alternan de lado y de altura de un hito al siguiente, como unseen-05 y unseen-06.
2. **Modo horizontal** (unseen A3, K3), a partir de `min-width: 1024px` y sin movimiento reducido:
   - La sección se fija (pin) en lo alto de la pantalla y `[data-hitos-pista]` corre en horizontal
     con el scroll (ScrollTrigger con `scrub` sin retraso grande, ≤ 0,3 s).
   - La distancia de scroll del pin es lo que corre la pista (1:1).
   - En algún momento del recorrido, cada hito queda **entero** a la vista (titular y bloque).
   - Al terminar la pista, la página sigue hacia abajo con normalidad (el pie se alcanza).
   - El modo lo pone el JS (por ejemplo, un atributo en la sección). **El CSS por defecto es el
     apilado**: sin JS no hay contenido inalcanzable ni scroll horizontal de página.
3. **Fondos** (unseen A4b): cada hito es una banda del alto de la pantalla con el fondo del tema;
   los hitos 3 y 5 llevan el fondo invertido (tinta en claro, papel en oscuro). Las etiquetas, el
   titular y la línea cambian de color para leerse sobre cada fondo: titular con contraste ≥ 4,5:1 y
   línea con ≥ 3:1. Pueden ir por token, o con `mix-blend-mode: difference` para la línea.
4. **Línea recorrida** (K1): una línea ondulada fina a lo largo de toda la pista, que pasa entre los
   textos y los bloques. Va en dos copias del mismo trazado:
   - `[data-linea-punteada]`, punteada (≈ 6 px de trazo y 6 de hueco).
   - `[data-linea-solida]`, sólida, en un contenedor recortado que solo deja ver lo recorrido, es decir,
     hasta la x del viajero.

   Los bloques van por encima de la línea.
5. **El viajero** (K4 y A5; `[data-viajero]` con `<Mascota />` dentro):
   - Queda en una x fija de la pantalla, en torno al 30–35 % del ancho, mientras corre la pista.
   - Su y es la de la línea en esa x: muestrea el trazado y apoya los cascos sobre el trazo.
   - Mide unos 64–80 px a 1440.
   - Se lee sobre los dos fondos (contraste ≥ 3:1).
6. **Inclinación por velocidad** (K2), sobre `[data-viajero]` en el ticker de GSAP:
   - Cada cuadro: `rot = lerp(rot, clamp(−40, 40, velocidad), 0,04)`, y se aplica
     `rotate(rot deg) translateX(−8·rot px)`. La velocidad es la de `lenis` (`lenis.velocity`).
   - Hacia adelante se inclina para un lado y hacia atrás para el otro; quieto vuelve a 0.
   - Nunca pasa de 40°.
7. **Apilado** (menos de 1024 px, movimiento reducido o sin JS): los cinco hitos uno debajo de otro en
   el orden del documento, cada uno con su texto y su bloque, sin pin. La línea y el viajero se ocultan;
   su diseño en celular lo decide la tarea de responsive. Sin scroll horizontal de página.
8. **Refresco:** `ScrollTrigger.refresh()` cuando cargan las fuentes y al cambiar de tamaño, para que
   el pin y el muestreo de la línea no queden con medidas viejas.

## Queda para el pulido — no es del agente

- La forma exacta de la onda, su amplitud y el ritmo del punteado.
- Los tamaños finales del titular, del bloque y de la palabra, y el aire entre hitos.
- La x exacta del viajero y su tamaño.
- Si la línea entra o sale con alguna animación propia.

## Accesibilidad, respaldo y rendimiento

- Las pruebas comunes pasan: consola limpia, axe, 375 px sin scroll horizontal, movimiento reducido y
  foco visible.
- Los hitos se leen en el orden del documento con un `<h2>` cada uno. La línea, el viajero y la palabra
  del bloque son `aria-hidden`. No hay nada enfocable nuevo.
- Sin JS y con movimiento reducido: apilado y completo, sin pin ni inclinación.
- El ticker de la inclinación no hace trabajo cuando la sección no está en pantalla.
- No hay librerías nuevas: solo GSAP y Lenis, que ya están.

## Notas sobre tus archivos

- `src/styles/tokens.css`: agrega los tokens que necesites (tamaño del titular de hito, del bloque y del
  viajero, colores de los fondos invertidos, punteado). Ningún hex fuera de ese archivo.
- `src/pages/index.astro`: solo agregas `<Hitos />` debajo de `<Portada />` y su script.
- No toques la portada, la precarga, la mascota, la nav, el pie, el layout ni `listo.ts` (están
  excluidos en `archivos`). Si necesitas algo de ellos, va a SOLICITUDES.
- Tus scripts temporales van en `fabrica/buzon/T03/tmp/` (regla 3).

## Cuándo terminaste

- `node fabrica/scripts/compuertas.mjs T03` en **VERDE**: check, build, comunes, `tests/T01/` y
  `tests/T02/` (regresión), y `tests/T03/`, que no editas.
- `node fabrica/scripts/capturas.mjs T03` corrido. Mira las hojas «referente | nuestro» de
  `hitos-1`, `hitos-2` y `hitos-tinta`, y la foto de breakpoints: a 1440, 1280 y 1024 nada encimado ni
  cortado; en angosto, apilado y sin cortes.
- Lo que ninguna prueba comprueba y juzga el autor: que se sienta la línea de Unseen, el ritmo del
  recorrido y el gesto del unicornio al inclinarse.
- Entrega en `fabrica/buzon/T03/ENTREGA-r1.md`.
