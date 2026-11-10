---
id: T02
agente: "@constructor"
fase: 1
depende: [T01]
tipo: escena-3d
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - fabrica/proyecto/referentes/T02.json
  - sitio/tests/T02/t02.spec.ts
rutas: ["/"]
archivos:
  - sitio/package.json
  - sitio/package-lock.json
  - sitio/src/**
  - sitio/public/**
regresion: [T01]
bloqueantes: []
---

# `T02` · `@constructor` — Precarga y portada

> Fase 1 · corre sola · Buzón: `fabrica/buzon/T02/` · Se lanza con `high` (shaders).

## Por qué existe

Es lo primero que ve el visitante y la primera sección que se tiene que ver **como la web**, no como un
andamio. Cuenta la posibilidad del arco persuasivo: «¿Y si esta vez sí lo haces realidad?», con la
precarga de Unseen, el bloque de color con el objeto dentro de la frase de Leadoff, la trama de
caracteres de Unseen y la profundidad en capas de Table Tales. Reemplaza el marcador
`[CONTENIDO DE T02]` de T01.

## Lee antes de empezar

- `fabrica/proyecto/referentes/T02.json`: lo que se calca, con la técnica y las constantes medidas en el
  código de cada referente. Mira las capturas que cita (`referentes/capturas/…`).
- `docs/1-PRODUCTO.md` § 2 (recorrido), § 3 (mapa de adaptación: unseen A1–A2, leadoff A2–A3 y K1,
  tabletales A1–A2 y K1), § 4 (dirección de arte) y § 6 (decisiones D-1, D-3, D-5).
- `docs/2-TECNICO.md` § 1 (librerías), § 2 (contratos: `data-listo`, tokens, movimiento reducido, WebGL
  con respaldo), § 6 (presupuestos) y § 7 (assets del autor: mascota y objetos 3D).
- El código de T01: `src/layouts/Base.astro`, `src/lib/listo.ts`, `src/lib/movimiento.ts`,
  `src/styles/tokens.css`.
- `previo/prototipo-v2-2026-11-09.html` (precarga, `entrada()` y `escena()` con `pieza()`): borrador
  de referencia. **Se lee; no se copia.** Sus textos de historia no van.

## Decisiones que aplica esta tarea

- D-1: la entrada es la precarga de Unseen; el titular entra **después**, por líneas, como Leadoff.
- D-3: titulares en DM Serif Text; de Leadoff se calcan tamaño, aire y el objeto dentro de la frase.
- D-5: la mascota es un **unicornio**. El asset lo hace el autor; aquí va una silueta provisional por
  código con el tamaño y el punto de apoyo definitivos, para que el reemplazo no mueva nada.
- Del orquestador (2026-11-10, reversibles por token):
  - La portada es un bloque **cobalto** a sangre (el azul eléctrico de Leadoff, en la paleta del manual),
    con texto en papel. Igual en los dos temas.
  - El objeto dentro de la frase es una **pastilla ácida con la mascota**, entre «sí» y «lo».
  - Etiquetas sobre el titular: `[SEMILLERO ALGORA]` `[CREACIÓN DIGITAL]` `[CONVOCATORIA_27]` (del
    prototipo v2). No hay más texto: no se inventa una bajada (`F1`).

## Qué construyes

Selectores de contrato (las pruebas los leen; no los cambies): `[data-precarga]`,
`[data-precarga-cuenta]`, `[data-mascota]`, `section[data-portada]`, `[data-linea]`, `[data-objeto]`,
`canvas[data-trama]`, `[data-capa]`.

1. **Mascota provisional** (`src/components/Mascota.astro`): silueta de unicornio en SVG con
   `data-mascota`, `aria-hidden="true"` y `fill: currentColor`, de tamaño por token. Un solo componente
   que usan la precarga y el objeto de la frase; cuando llegue el asset se cambia aquí y en nada más.
2. **Precarga** (unseen A1, K de la ficha): capa fija de pantalla completa (`--capa-precarga`) en
   `--color-tinta` en los dos temas, con la mascota al centro y debajo la cuenta `[NN%]` en
   `--fuente-etiqueta` (`data-precarga-cuenta`), como «[93%]» de Unseen.
   - La cuenta anima de 0 a 100: llega a ~90 en 1,5 s y **solo pasa a 100 cuando la página cargó**
     (`load`). Nunca baja ni salta.
   - Al llegar a 100 la precarga se va (fundido corto, ≤ 0,4 s) y **después** empieza la entrada del
     titular. Dura en total al menos 1,2 s y se va antes de los 3,5 s.
   - Respaldo en **CSS** (`2-TECNICO` § 2): la precarga solo existe si hay JS (clase `js` que pone el
     script en línea del `<head>` de `Base.astro`) y una animación CSS la oculta sola a los 3,5 s si el JS
     no llega. Si el respaldo de JS marca `data-listo` antes de terminar, la entrada salta a su estado final.
   - Con movimiento reducido no se muestra nunca.
3. **Portada** (`section[data-portada]`, dentro de `<main>`, reemplaza el marcador de T01): bloque cobalto
   a sangre de al menos una pantalla de alto, con el contenido centrado como Leadoff (leadoff A2): las
   etiquetas y el `<h1>`.
4. **Titular** (`h1`, el único de la página): «¿Y si esta vez sí [objeto] lo haces *realidad?*», en
   `--fuente-titular` y `--titular-xl`, papel sobre cobalto; «realidad?» en la cursiva de acento.
   - Dos líneas, cada una un `[data-linea]` con `overflow: hidden` y **un solo hijo** que se mueve:
     «¿Y si esta vez sí» y «[objeto] lo haces realidad?».
   - Entrada (leadoff K1): cada línea sube de `yPercent 110` a 0 en 0,6 s `power2.out`, con 0,05 s entre
     líneas; el objeto crece de ancho 0 y `scale 0` a su tamaño en 0,6 s (leadoff A3); las etiquetas
     aparecen con un fundido de 0,8 s. Al terminar se llama `marcarListo()`.
   - El nombre accesible del `h1` es la pregunta completa; el objeto es `aria-hidden`.
   - Sin JS o con movimiento reducido el titular se ve completo desde el principio (el estado inicial
     de la animación lo pone el JS, nunca el CSS).
5. **`data-listo`** (`src/lib/listo.ts`): en la página con precarga ya no se marca en `load`, sino al
   terminar la entrada del titular. En las demás páginas (la 404) sigue como en T01. El respaldo por
   tiempo de 3,5 s desde la navegación se queda igual.
6. **Trama de caracteres** (unseen A2; `canvas[data-trama]`, `aria-hidden`, detrás del titular y del
   tamaño de la portada), en **OGL** con un shader propio:
   - Rejilla de celdas de ~12–14 px a 1440 con los caracteres `. $ 0 1 + =` y las letras de `ALGORA`
     (atlas de glifos dibujado en un canvas 2D al montar), en papel con poca opacidad sobre el cobalto.
     La densidad dibuja una figura suave (más densa hacia el centro, como el viñeteado de Unseen).
   - **Quieta sin cursor.** El cursor la deforma donde pasa (desplaza y cambia los caracteres en un
     radio de ~160 px a 1440, con una estela que vuelve al reposo en ~1 s), como el pase ASCII con fluido
     de Unseen. Solo se redibuja mientras hay movimiento que mostrar.
   - Colores leídos de los tokens con `getComputedStyle`, nunca literales.
7. **Objetos 3D en capas** (tabletales A1–A2, K1) con **Three**, cargado con `import()` dinámico después
   de `data-listo` (no viaja en el JS inicial):
   - Al menos **dos capas** `[data-capa]` (una detrás del titular y otra delante, con
     `pointer-events: none` y `aria-hidden`), cada una con su canvas.
   - Piezas por código con una sola función `pieza(geometría, colorToken, posición, profundidad)` para
     que después se reemplacen por `.glb` sin tocar la escena (`2-TECNICO` § 7): cubo, ficha, moneda,
     octaedro…, en ácido, tomate, magenta y tinta, sombreado plano y aristas en tinta como el prototipo.
     Ninguna en cobalto: se perdería en el fondo.
   - Las piezas siguen un poco al cursor (cada una según su profundidad) y giran despacio.
   - **Parallax** (tabletales K1): al bajar, cada capa se mueve con la página pero más lento, a su propia
     velocidad (factores distintos, en `scrub` desde que la portada toca arriba hasta que sale).
   - Antes de crear el renderer se comprueba que haya WebGL; sin WebGL no se crea nada y no sale ningún
     error en consola.
8. **Dependencias:** agrega `ogl` y `three` (y `@types/three` en desarrollo). Nada más.

## Queda para el pulido — no es del agente

- El dibujo final de la mascota (llega el asset del autor) y el tamaño exacto de la pastilla.
- La figura exacta de la trama, su opacidad y el radio y la fuerza del cursor.
- Las posiciones, tamaños y factores de parallax de las piezas.
- La curva y duración finales de la cuenta y del fundido de la precarga.

## Accesibilidad, respaldo y rendimiento

- Las pruebas comunes pasan en el inicio y en la 404 (consola limpia, 375 px sin scroll horizontal,
  axe, movimiento reducido, foco visible en los tres modos del tema).
- Sin JS: no hay precarga y la portada se lee completa. Sin WebGL: la portada y el titular completos, sin
  errores. Con movimiento reducido: sin precarga, sin entrada, sin parallax ni deformación de la trama.
- Three y los modelos fuera del JS inicial (compuerta `js-inicial` < 220 KB gzip).
- Las escenas no dibujan cuando la portada no está en pantalla (`IntersectionObserver`).

## Notas sobre tus archivos

- `src/styles/tokens.css`: agrega los tokens que necesites (tamaño de la mascota, factores de parallax,
  duraciones). Ningún hex fuera de ese archivo.
- `src/layouts/Base.astro`: solo agregas la clase `js` en el script en línea del `<head>`.
- No toques `Nav.astro` ni `Pie.astro`.

## Cuándo terminaste

- `node fabrica/scripts/compuertas.mjs T02` en **VERDE**: check, build, comunes, `tests/T01/` (regresión)
  y `tests/T02/`, que no editas.
- `node fabrica/scripts/capturas.mjs T02` corrido: mira la foto de breakpoints (a 1440, 1280 y 1024 nada
  encimado ni cortado) y las hojas «referente | nuestro» de cada estado de la ficha.
- Lo que ninguna prueba comprueba y juzga el autor: que la portada se sienta Leadoff + Unseen + Table
  Tales con la marca de Algora, el ritmo de la entrada y el tacto de la trama con el cursor.
- Entrega en `fabrica/buzon/T02/ENTREGA-r1.md`.
