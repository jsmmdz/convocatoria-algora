# ENTREGA R1-B: hitos en celular (línea vertical con unicornio)

## Qué construí
- `sitio/src/lib/hitos-vertical.ts` (nuevo): `activarVertical()`, modo vertical con `data-modo="vertical"`. Un
  `ScrollTrigger` con `scrub` (sin pin) de `top 60%` a `bottom 60%` de la sección mueve una variable de progreso; de ahí
  salen el alto de la copia sólida y la posición del unicornio (cascos en la unión sólida/punteada). Inclinación por
  velocidad con lerp y tope (`--inclinacion-*`); usa `lenis.velocity` si existe y, si no, el delta de `scrollY` por cuadro.
  Libera todo al salir (trigger, ticker, `refreshInit`, estilos en línea, `d` de los trazos, `data-modo`). Redibuja en `refreshInit` y al cargar las fuentes.
- `sitio/src/lib/hitos.ts`: un `mm.add(CONSULTA_TACTIL_ANIMADO, ...)` más. El bloque horizontal no se tocó.
- `sitio/src/components/Hitos.astro`: reglas `.hitos[data-modo='vertical']` (reutiliza `[data-linea-*]`, `[data-viajero]`,
  `[data-guia]`; mismas capas que escritorio: línea z1, guía z2, bloques y textos z3, mezcla `difference`). Propiedades locales
  `--linea-v-amplitud` (4), `--linea-v-onda` (280), `--linea-v-ancla` (0.6), `--viajero-tam-v` (2.75rem). `overflow-x: clip` de respaldo.
  Sin hex nuevos. `tokens.css` intacto.

## Lo que veo (capturas en `fabrica/buzon/R1/tmp/b-*.jpg`)
- 390 claro (`b-390-02`, `-04`): sobre el borde derecho baja una línea negra ondulada de poca amplitud; sólida arriba del
  unicornio y punteada debajo. El unicornio chico va apoyado en la unión, entero dentro de la pantalla, sobre el margen,
  y se ve pasar por detrás de los bloques de color. Los titulares quedan limpios.
- 390 oscuro (`b-390d-02`): sobre los fondos invertidos la línea y el unicornio salen claros (difference); en un cuadro con
  scroll rápido el unicornio va muy inclinado y su cola roza el borde derecho (recortado, sin scroll horizontal).
- 768 (`b-768-02`): igual de comportamiento; la línea queda en el borde derecho, el unicornio blanco sobre el hito de fondo tinta.
- 1440 sin táctil (`b-1440-02`): `data-modo="horizontal"`, línea horizontal sólida/punteada y bloques idénticos a antes.
- Movimiento reducido: `dataset.modo` = «sin modo», hitos apilados sin línea ni viajero (comando: `REDUCIDO=1 TACTIL=1 ver.mjs ... js=...`).

## Cifras (`node fabrica/buzon/R1/tmp/b-medir.mjs`, 390 x 844 táctil, alto de la sección 3527 px)
| avance | y del viajero en la sección | alto de la sólida | scrollWidth |
|---|---|---|---|
| 0 | 209 | 206 | 390 |
| 0.25 | 1091 | 1088 | 390 |
| 0.5 | 1973 | 1971 | 390 |
| 0.75 | 2855 | 2852 | 390 |
| 1 | 3530 | 3527 | 390 |

`cd sitio && npm run check`: 0 errores, 0 avisos, 0 sugerencias.

## Supuestos
- Línea por el **borde derecho**: en Unseen la línea baja pegada a un lado y el contenido va alineado a la izquierda, así que el
  derecho estorba menos. Las cajas de texto y los bloques quedan intactos; la línea cabe en el margen (24 px a 390). A 390 la
  ondulación invade como mucho unos 6 px de la columna, pero los textos van por encima.
- El unicornio es más chico que en escritorio (2.75 rem) para que quepa en el margen sin salirse de la pantalla.
- Ancla de la pantalla al 60 % de la altura: el unicornio acompaña ese punto; termina cerca del final de la sección.
- No pude levantar el servidor en el puerto 4392 («Another astro dev server is already running», puerto 4321), así que usé el 4321 ya activo; no lo apagué porque no es mío.

## PENDIENTES
- Con scroll muy rápido en celular el unicornio puede ir muy inclinado y rozar el borde (tope `--inclinacion-max` de 40°); si se ve exagerado,
  bajar el tope para el modo vertical (necesitaría un token o propiedad local; no lo cambié para no divergir del referente).
- No corrí `npx playwright test` ni `npm run build` (orden). El horizontal no cambió de selectores ni de lógica.

## SOLICITUDES
- Ninguna bloqueada por el hook (solo un `curl` con `%{http_code}` que el hook rechazó; lo evité).
