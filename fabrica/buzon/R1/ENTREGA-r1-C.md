# ENTREGA R1-C: proyectos en celular, carrusel horizontal

## Qué construí
- `sitio/src/lib/carrusel.ts` (nuevo): `montarCarrusel(seccion)` con `gsap.matchMedia(CONSULTA_TACTIL)`. Pone `data-modo="carrusel"`,
  lleva el contador `[data-posicion]` (tarjeta más cercana al centro de la fila, con los bordes manejados para la primera y la última),
  `aria-current="true"` en la visible, flechas con `scrollTo` (suave; directo con `movimientoReducido`) que se deshabilitan en los extremos,
  y ← → en toda la sección (con una tarjeta enfocada se cuenta desde ella y el foco la sigue). Todo se libera al desmontar.
- `sitio/src/lib/helice.ts`: `montar()` ahora también monta/desmonta el carrusel (mismo patrón, así el repintado con Supabase lo reengancha).
  Los `delete dataset.modo` son condicionales para que un modo no borre el del otro al cruzar el corte. El oyente general de clic no se tocó (no duplico `algora:sumarse`).
- `sitio/src/components/Proyectos.astro`: CSS de `[data-modo='carrusel']`: fila con `overflow-x:auto`, `scroll-snap-type:x mandatory`,
  tarjetas a `min(84 %, 32rem)` con `snap-align:center`, fila que sangra a los bordes de la ventana, sin barra visible, `overscroll-behavior-x: contain`,
  sin `touch-action` (la página sigue scrolleando vertical). Control visible solo en este modo (≥ 44 × 44), `.tarjeta__regla` mínimo 1rem (16 px).
  Sin JS queda la lista vertical. El canvas GL sigue oculto (solo se muestra con `data-gl`, que únicamente pone la hélice).

## Lo que veo (capturas en `fabrica/buzon/R1/tmp/c-*.jpg`)
- `c-390-01/03` (390 × 844, claro): cabecera arriba, una tarjeta amarilla casi a todo el ancho con la siguiente (rosa) asomando a la derecha; debajo flechas redondas y «01 / 08» (flecha izquierda apagada). Tras dos pulsos: tarjeta roja «Racha de Estudio» centrada, vecinas asomando a ambos lados, «03 / 08».
- `c-390d-02` (oscuro): igual, tarjeta rosa centrada, sombras y flechas legibles.
- `c-320-01` (320 × 568): tarjeta ancha con título que parte en dos líneas, siguiente asomando; sin desborde.
- `c-768-03` y `c-1024-03`: tarjetas topadas a 32rem, tres visibles a 768, contador «02 / 08».
- `c-1440-01` sin TACTIL: `data-modo="helice"` (no la miré en imagen, solo verifiqué el modo).

## Cifras
- Alto de `#proyectos` / alto de ventana a 390 × 844: **0,70** (`js=offsetHeight/innerHeight`); a 320 × 568: 1,16.
- `[data-posicion]`: `01 / 08` → `02 / 08` al pulsar `[data-posterior]` (768 y 1024; en 390 dos pulsos dieron `03 / 08`).
- Tocar la tarjeta con `aria-current` (768): `#p-proyecto` = «Pixel Bosque».
- `npm run check`: mi parte limpia. Hoy da 1 error ajeno: `tests/T09/t09.spec.ts:14` (tipo de `VISTAS`), no es mío.

## Supuestos y pendientes
- **Prueba de T06 por ajustar (orquestador):** «a 390 ninguna tarjeta se sale por la derecha» ya no vale en táctil/angosto; las tarjetas fuera de la vista quedan a la derecha dentro de `[data-tarjetas]`. Ojo: sin TACTIL a 390 el `matchMedia` angosto sí activa el carrusel.
- `document.documentElement.scrollWidth <= innerWidth` a 1024 × 1366 da **falso por otra sección** (`.productos__fichas`, 1113 px), no por el carrusel; hay que mirarlo con quien lleve productos.
- No pude levantar mi servidor en el puerto 4393 (Astro avisó que ya hay uno en 4321); usé ese, que sirve los mismos archivos. Lo dejé encendido porque no es mío.
- Sin probar: ← → por teclado y el arrastre real con el dedo (el emulador no da inercia); el snap nativo debería evitar toques falsos. Recomiendo que la prueba del orquestador cubra Tab + flechas.
- No probé el repintado con Supabase conectado.
