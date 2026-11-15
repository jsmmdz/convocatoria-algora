---
id: T04
agente: "@constructor"
fase: 1
depende: [T03]
tipo: componente
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - fabrica/proyecto/referentes/T04.json
rutas: ["/"]
archivos:
  - sitio/src/**
  - "!sitio/src/components/Portada.astro"
  - "!sitio/src/components/Precarga.astro"
  - "!sitio/src/components/Mascota.astro"
  - "!sitio/src/components/Hitos.astro"
  - "!sitio/src/components/Nav.astro"
  - "!sitio/src/components/Pie.astro"
  - "!sitio/src/lib/portada.ts"
  - "!sitio/src/lib/hitos.ts"
  - "!sitio/src/lib/capas3d.ts"
  - "!sitio/src/lib/trama.ts"
  - "!sitio/src/lib/three-renderer.ts"
  - "!sitio/src/lib/listo.ts"
  - "!sitio/src/layouts/**"
regresion: [T01, T02, T03]
bloqueantes: []
---

# `T04` · `@constructor` — Productos y marco de tinta

> Fase 1 · corre sola · Buzón: `fabrica/buzon/T04/` · Se lanza con `high` (hay un shader).

## Por qué existe

Es el tercer paso del arco persuasivo: después de imaginar las consecuencias (hitos), el visitante ve
**lo concreto** (qué se puede construir) y se encuentra con la pregunta «¿Cuál es el tuyo?», que lo lleva a
postularse. Al terminar, un marco de tinta se abre hacia «Cómo funciona» (T05).

## Lee antes de empezar

- `fabrica/proyecto/referentes/T04.json`: lo que se calca (tabletales A3, A4, A5; leadoff L1) y la técnica
  (K1 piezas, K2 tinta, K3 letras) con sus constantes. Capturas: `referentes/capturas/tabletales-01..04.jpg`
  y `leadoff-scroll-00.jpg`.
- `docs/1-PRODUCTO.md` § 2 (recorrido), § 3 (mapa: tabletales A3–A5, leadoff A2), § 4 y § 6 (las tres
  decisiones del 2026-11-10 sobre productos).
- `docs/2-TECNICO.md` § 1 (GSAP, OGL, Lenis) y § 2 (tokens, tema, movimiento reducido).
- El código existente: `src/lib/movimiento.ts`, `src/lib/webgl.ts` (`hayWebGL`), `src/lib/trama.ts` (cómo se
  carga OGL diferido y se limpia el contexto), `src/components/Hitos.astro` y `src/lib/hitos.ts` (el pin
  anterior: este va justo debajo y no debe pelear con él), `src/styles/tokens.css`.

## Decisiones que aplica esta tarea

- Autor, 2026-11-10: las piezas son **fichas tipográficas** del DOM (color del manual, nombre en serif
  cursiva, etiqueta mono entre corchetes). Sin objetos 3D ni ilustraciones.
- Autor, 2026-11-10: el marco de tinta tiene **borde ácido** y **relleno del tema** (papel en claro, tinta
  en oscuro), que es donde vive «Cómo funciona».
- Autor, 2026-11-10: «¿Cuál es el tuyo?» es el titular y lleva un botón **Postúlate** que baja a
  `#postulacion`. Ese ancla lo construye T07; mientras tanto el enlace se queda en el href y no rompe nada.
- D-3: los titulares van en DM Serif Text. D-6: sin tinta de cursor.
- Del orquestador (2026-11-10, reversibles por token o texto):
  - El bloque es **cobalto**; el titular va en papel. Las fichas van, en orden: ácido · magenta · tomate ·
    papel · ácido · magenta · tomate. Texto en tinta sobre todas, menos sobre el tomate (papel).
  - Las siete fichas, con su etiqueta: `[APP]` Una app · `[JUEGO]` Un juego · `[TIENDA]` Una tienda ·
    `[IA]` Una herramienta con IA · `[PLATAFORMA]` Una plataforma · `[SERVICIO]` Un servicio ·
    `[MEDIO]` Un medio. (Textos de `ENCARGO.md` § 2.)
  - Encima del titular, una etiqueta mono: `[PRODUCTOS]`. Sin cifras ni nombres de proyectos reales
    (`F1`): nada inventado.
  - El marco **abre un hueco** en el bloque cobalto (el cobalto es lo de fuera y el hueco crece como tinta
    hasta llenar la pantalla); dentro del hueco se ve el fondo del tema y, debajo, la sección siguiente.

## Qué construyes

Selectores de contrato (las pruebas los leen; no los cambies):
- `section[data-productos]`: la sección completa (bloque + marco).
- `[data-productos-bloque]`: el bloque a sangre.
- `[data-productos-etiqueta]` y `[data-productos-titular]` (el `<h2>`).
- `[data-ficha]`: siete, en orden, cada una con `[data-ficha-etiqueta]` y `[data-ficha-nombre]`.
- `[data-postular]`: el enlace Postúlate (`<a href="#postulacion">`).
- `[data-marco]`: el `<canvas>` del marco de tinta.
- `[data-siguiente]`: un panel provisional con el fondo del tema y el texto «Cómo funciona», que T05
  reemplaza. Va debajo del marco.

1. **Bloque** (leadoff L1): `<section data-productos>` con un bloque de un solo color a sangre del alto de la
   pantalla, esquinas rectas, mucho aire. Etiqueta `[PRODUCTOS]` arriba; titular **«¿Cuál es el tuyo?»**
   en `--fuente-titular`, enorme (`--titular-xl` o mayor), centrado, en papel; botón **Postúlate** debajo
   (pastilla ácida con texto en tinta, foco visible, objetivo táctil ≥ 44 px).
2. **Fichas** (decisión del autor): siete `<li data-ficha>` en una `<ul>`. Cada una es un rectángulo con
   esquinas redondeadas (`--radio`), color de fondo y sombra dura del manual (`--sombra`), con la etiqueta
   en `--fuente-etiqueta` y el nombre en `--fuente-titular` cursiva. Tamaño unos 220 × 150 px a 1440, por
   token. Quedan repartidas alrededor del titular, cada una con una **inclinación propia** (de −10° a
   +10°, sin dos iguales) y **ninguna tapa el titular, la etiqueta ni el botón**. Texto con contraste
   ≥ 4,5:1 sobre su color. La lista tiene `aria-label`; las fichas no se enfocan (no hacen nada).
3. **Llegada en vuelo** (K1), a partir de `min-width: 1024px` y sin movimiento reducido:
   - La sección se fija (pin) en lo alto de la pantalla. Las fichas arrancan en el punto común fuera del
     encuadre (`origen_x`, `origen_y` de la ficha) con rotación y `scale 0,94`, y llegan a su sitio y su
     inclinación con un timeline ligado al scroll (`scrub` ≤ 0,55 s).
   - Cuando la sección toca el 55 % de la pantalla ocurre la entrada: duración 1,3 s, stagger 0,09 s,
     `expo.out`.
   - A mitad del pin, las siete fichas quedan **a la vista y en su sitio**, con el titular legible.
4. **Titulares letra por letra** (K3): el `<h2>` y la etiqueta `[PRODUCTOS]` se parten por letras, cada una
   sube desde abajo dentro de una máscara (0,9 s, stagger 0,03 s, `power4.out`). **El texto accesible se
   conserva entero**: el `<h2>` mantiene su texto completo (por ejemplo, con `aria-label` en el padre y
   las letras en `aria-hidden`).
5. **Marco de tinta** (K2): un `<canvas data-marco>` de pantalla completa, **diferido** (se crea al acercarse
   la sección, no en la carga) con OGL y un shader propio:
   - Pinta el cobalto del bloque en todo lo que queda **fuera** del hueco, y deja el hueco transparente.
   - El borde del hueco es **ácido**, de grosor variable (hasta 120 px de pincel), con ruido fbm que lo
     hace irregular como tinta; el hueco es un rectángulo redondeado que crece desde el centro hasta
     **sobrepasar los cuatro bordes** de la pantalla.
   - El progreso lo lleva el scroll de 0 a 1 (`scrub`): el titular y las fichas se apagan primero
     (0,12–0,26), el hueco crece de 0,26 a 0,90 (`power2.in`).
   - Al final del progreso el canvas queda sin pintar nada (todo transparente) y la página sigue hacia
     «Cómo funciona».
   - El color del relleno no lo pinta el shader: se ve el fondo del tema de `[data-siguiente]`. El ácido sí
     lo lee del token (`--color-acido`), sin hex en el shader más allá del que se pasa por uniform.
   - DPR tope 2; el canvas se redimensiona con la ventana y el contexto se libera cuando la sección sale
     (igual que `trama.ts`).
6. **Respaldo y movimiento reducido** (sin WebGL, sin JS o `prefers-reduced-motion`): sin pin ni canvas.
   El bloque con titular, botón y siete fichas **quietas en su sitio** (apiladas en rejilla, sin giro) y
   debajo `[data-siguiente]`. Todo legible y alcanzable.
7. **Angosto** (menos de 1024 px): lo mismo que el respaldo (sin pin, fichas en rejilla de 2 columnas, sin
   canvas). Su diseño de celular lo decide la tarea de responsive. **Sin scroll horizontal de página.**
8. **Panel provisional** `[data-siguiente]`: fondo del tema, texto «Cómo funciona» en `--fuente-titular`
   y nada más. T05 lo reemplaza; no le pongas contenido.
9. **Refresco**: `ScrollTrigger.refresh()` cuando cargan las fuentes y al cambiar de tamaño. Los dos pines
   (hitos y productos) no se pisan: tras el de hitos, la página llega a este bloque y el pie se alcanza al
   final.

## Queda para el pulido — no es del agente

- La composición exacta de las siete fichas alrededor del titular, sus tamaños e inclinaciones.
- El ritmo del vuelo y de la apertura de la tinta, y cuánto aire hay en el bloque.
- El color del bloque y el orden de colores de las fichas.
- Si el hueco crece centrado o desde la posición del botón.

## Accesibilidad, respaldo y rendimiento

- Las pruebas comunes pasan: consola limpia, axe, 375 px sin scroll horizontal, movimiento reducido y
  foco visible.
- Un `<h2>` por sección. La lista de fichas es una lista real; el canvas es `aria-hidden`.
- Sin JS y con movimiento reducido: bloque completo, fichas visibles y el panel siguiente debajo.
- El canvas existe solo mientras la sección está cerca; el ticker no trabaja fuera de pantalla.
- OGL ya está en el sitio: sin librerías nuevas. Three no se carga en esta sección.

## Notas sobre tus archivos

- `src/styles/tokens.css`: agrega los tokens (tamaño de ficha, inclinaciones, colores del bloque y de las
  fichas, pincel de la tinta). Ningún hex fuera de ese archivo.
- `src/pages/index.astro`: solo agregas `<Productos />` debajo de `<Hitos />` y su script.
- No toques la portada, la precarga, la mascota, los hitos, la nav, el pie, el layout ni `listo.ts`.
  Si necesitas algo de ellos, va a SOLICITUDES.
- Tus scripts temporales van en `fabrica/buzon/T04/tmp/` (regla 3).

## Cuándo terminaste

- `node fabrica/scripts/compuertas.mjs T04` en **VERDE**: check, build, comunes, `tests/T01/`, `T02/` y
  `T03/` (regresión). **T04 no tiene pruebas propias** (decisión del autor, 2026-11-10): lo de esta tarea se
  juzga con las capturas y en el visto bueno.
- `node fabrica/scripts/capturas.mjs T04` corrido. Mira las hojas «referente | nuestro» de `piezas` y
  `marco` y la foto de breakpoints: a 1440, 1280 y 1024 nada encimado ni cortado; en angosto, rejilla sin
  cortes.
- Lo que ninguna prueba comprueba y juzga el autor: que el vuelo de las fichas se sienta como Table Tales
  y que el borde de tinta se vea orgánico, no un óvalo.
- Entrega en `fabrica/buzon/T04/ENTREGA-r1.md`.
