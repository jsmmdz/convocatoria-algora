---
id: R1
agente: "@orquestador"
fase: 2
depende: [T08]
tipo: responsive
requiere:
  - fabrica/nucleo/roles/responsive.md
  - docs/1-PRODUCTO.md
  - docs/2-TECNICO.md
  - fabrica/proyecto/referentes/unseen.json
rutas: ["/", "/equipo/"]
archivos:
  - sitio/src/**
  - sitio/tests/R1/**
regresion: [T01, T02, T03, T05, T06, T07, T08]
bloqueantes: []
---

# `R1` · Responsive de todo el sitio

> Fase 2 · Buzón: `fabrica/buzon/R1/` · **La construye el orquestador (Claude Fable) en la última sesión**, por
> decisión del autor del 2026-11-16 («deja todo listo para acabar el MVP en una última sesión con Fable»).
> Una sola tarea para todas las secciones: lo que falta es afinar, no reconstruir (ver «Lo medido»).
> Estándar: `fabrica/nucleo/roles/responsive.md` (a 1440 nada cambia; toques ≥ 44 px; párrafos ≥ 16 px; sin
> secuestrar el gesto vertical; sin scroll horizontal en ningún ancho).

## Lo medido (R0, 2026-11-16, 390 × 844 táctil, sobre el commit `9f0168d`)

Recorrido completo de `/` y `/equipo/` con `fabrica/buzon/R1/tmp/completa.mjs` (temporal; se puede repetir).

- **Ya funciona:** sin scroll horizontal; todo apilado y legible; consola limpia. Alto total de `/`: 14.167 px
  (portada 844 · hitos 3.527 · productos 1.581 · pasos 1.100 · carreras 2.154 · proyectos 2.131 ·
  postulación 2.512 · pie 319).
- **Toques < 44 px:** logo de la nav (95 × 28), botón Tema (70 × 36), Postúlate de la nav (112 × 39), radios y
  casillas del formulario (18–20 px; su `label` sí mide ≥ 44 en los caminos y las opciones, pero no en
  «Publicar…» ni en la autorización).
- **Texto < 16 px en párrafos:** `tarjeta__regla` (15 px) y `campo__ayuda` (14 px). Las etiquetas mono de 12 px
  (`[IDEA]`, `[SALE]`, botones) son rótulos del manual, no párrafos: se quedan (R-6).
- **Se ve mal a 390:** los dos caminos del formulario quedan en dos columnas con el texto partido en cinco
  líneas; las opciones (`DESARROLLO`…) tocan el borde de su pastilla; en la portada una pieza 3D cae sobre
  «realidad?».
- **Sin mirar todavía:** 320, 360, 430, los acostados (667 × 375, 844 × 390) y las tabletas (768 × 1024,
  1024 × 1366, 1180 × 820). Es el primer paso de la tarea.

## Decisiones del autor (2026-11-16; en `docs/1-PRODUCTO.md` § Responsive)

- **R-1 · Hitos en celular: línea vertical con unicornio.** Una línea punteada baja por un borde y se vuelve
  sólida al recorrerla; el unicornio baja por ella inclinándose con la velocidad. Es lo que hace Unseen en
  celular (`referentes/capturas/unseen-03…07-…-390.jpg`).
- **R-2 · Proyectos en celular: carrusel horizontal deslizable**, con ajuste a cada tarjeta, contador
  `01 / 08` y flechas. Ocupa una pantalla.

## Decisiones del orquestador (conservadoras, se anotan aquí para no parar la sesión)

- **R-3 · Productos:** rejilla quieta de dos columnas, como está; sin vuelo ni marco de tinta en táctil (el
  marco necesita el pin, que secuestra el gesto). La entrada de «Cómo funciona» va debajo.
- **R-4 · Portada:** las piezas 3D se quedan, más pequeñas y sin cruzar ninguna palabra del titular.
- **R-5 · Formulario:** los dos caminos, uno debajo del otro por debajo de 480 px.
- **R-6 · Etiquetas mono de 12 px:** se quedan (rótulos del manual). Los párrafos suben a 16 px.
- **R-7 · Corte:** el modo de escritorio (pin, hélice, vuelo) sigue empezando en 1024 px **y sin táctil
  primario**: una tableta de 1024 × 1366 o 1180 × 820 usa el modo de celular (carrusel, línea vertical), porque
  ahí el pin secuestra el gesto. Se decide con `(pointer: coarse)`, no por el ancho solo.

## Qué construyes

1. **Mira primero.** `node fabrica/scripts/capturas.mjs R1` da la matriz de 20 pantallas
   (`fabrica/scripts/matriz/vistas.mjs`). Escribe «lo que veo» de cada grupo en `fabrica/buzon/R1/NOTAS.md`
   antes de tocar código (`F14`).
2. **Corte táctil (R-7):** una sola consulta compartida en `lib/movimiento.ts`
   (`CONSULTA_ESCRITORIO = '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'`)
   que usan `hitos.ts`, `productos.ts` y `helice.ts`. Hoy cada uno repite la suya. **A 1440 con ratón nada cambia.**
3. **Nav:** logo, Tema y Postúlate con área táctil ≥ 44 × 44 a cualquier ancho; a 320 px caben en una fila.
4. **Portada (R-4):** a < 768 px las piezas no tapan ninguna palabra (la prueba de T02 «solape y cruce» mide
   escritorio; aquí se mide a 390 y 320).
5. **Hitos (R-1):** en modo celular, `[data-hitos]` gana una línea vertical (SVG punteado + copia sólida
   recortada, la misma técnica K1 de `hitos.ts` girada 90°) y el viajero baja por ella. Va ligada al scroll
   **nativo** (sin pin, sin Lenis en táctil si estorba): `ScrollTrigger` con `scrub` sobre el alto de la
   sección. El unicornio pasa por debajo de los bloques y los textos por encima, como en escritorio
   (decisiones del 2026-11-14 y 2026-11-15). Con movimiento reducido: sin línea ni viajero, como hoy.
6. **Productos (R-3):** solo espacios; la ficha `[IA]` no se parte en tres líneas a 320.
7. **Cómo funciona y carreras:** solo espacios y tamaños; a 768 los pasos van en 2 × 2.
8. **Proyectos (R-2):** en modo celular la lista es una fila con `overflow-x: auto`,
   `scroll-snap-type: x mandatory` y cada tarjeta a ~84 % del ancho (asoma la siguiente). El contador y las
   flechas de `[data-control]` se muestran y mueven el carrusel (`scrollTo` suave; con movimiento reducido,
   directo). El contador sale de un `IntersectionObserver` sobre las tarjetas. Tocar una tarjeta = sumarse.
   Teclado: Tab recorre las tarjetas y el navegador las trae a la vista. Sin WebGL en este modo.
9. **Postulación (R-5, R-6):** caminos apilados < 480 px; opciones sin texto tocando el borde; las casillas
   «Publicar…» y la autorización con su fila de ≥ 44 px de alto; ayuda a 16 px.
10. **Panel `/equipo/`:** filtros a lo ancho en una columna < 640 px; la tabla sigue con scroll propio.
11. **Pie:** el enlace del equipo ya mide 44 px; se revisa con el pie nuevo de `T09`.

## Pruebas (`sitio/tests/R1/`, las escribe el orquestador antes de construir)

Recorren 320, 375, 390, 430, 768, 1024 táctil y 844 × 390 acostado, con `hasTouch` e `isMobile`:

- Sin scroll horizontal de página en ninguno (las comunes solo miden 375).
- Todo lo tocable visible mide ≥ 44 × 44 (o su `label`), salvo enlaces dentro de un párrafo.
- Ningún párrafo por debajo de 16 px.
- Nada tapado: `elementFromPoint` en el centro de cada titular, botón y campo devuelve ese elemento.
- Hitos: al bajar, la parte sólida de la línea crece y el viajero baja (serie de posiciones, `F21`); con
  movimiento reducido no existen.
- Proyectos: deslizar cambia el contador; las flechas mueven una tarjeta; tocar una tarjeta llena el
  formulario; la sección mide menos de 1,2 pantallas.
- **El escritorio no se movió:** a 1440 × 900 con ratón, las cajas de titulares, tarjeta del frente, columnas
  y formulario son las mismas que en `9f0168d` (se guardan antes de empezar en `tests/R1/escritorio.json`).
- Toda la regresión: `node fabrica/scripts/compuertas.mjs R1 --completas`.

## Cuándo terminaste

- Compuertas completas en verde y la matriz de 20 pantallas mirada, con «lo que veo» escrito.
- `docs/3-ESTADO.md` al día. Commit local.

## Queda para el visto bueno del autor

- Cómo se siente el unicornio bajando y el carrusel en un celular de verdad (el emulador no da la inercia).
