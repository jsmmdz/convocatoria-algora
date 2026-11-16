# ENTREGA R1-A · afinado responsive

## Cambios por archivo
- `lib/capas3d.ts`: por debajo de 768 px las piezas no cruzan el titular (usan su posición de franja, no el anclaje al texto) y se escalan x0,72. Desde 768 nada cambia.
- `Nav.astro`: con `(max-width:1023px), (pointer:coarse)` logo y botones miden >= 44 x 44; a <= 400 px menos margen y relleno para caber en una fila a 320. A 1440 con ratón: 95x28, 70x36, 112x39 (igual que antes; medido con ver.mjs).
- `Productos.astro`: < 480 px ficha con menos relleno, etiqueta con menos tracking y nombre a 1,125rem (a 320 «herramienta» y «PLATAFORMA» ya no se parten a media palabra; «Una herramienta con IA» queda en 3 líneas). En 1024+ sin modo horizontal (tableta táctil) la columna del bloque pasa a `minmax(0,1fr)`: arregla el scroll horizontal de 1113 px.
- `ComoFunciona.astro`: 640–1023 px pasos en 2 x 2 con hilos.
- `Postulacion.astro`: caminos apilados < 480; casillas con fila >= 44 px, ayuda a 16 px y relleno de `.opcion` devuelto (en angosto/táctil; `.campo label` lo anulaba y el texto tocaba el borde).
- `equipo.astro`: < 640 filtros y botones en columna a lo ancho; en angosto/táctil selects, inputs y `.boton--mini` >= 44 px y tabla a 1rem.
- `Carreras.astro`, `global.css`: sin cambios (no hicieron falta).

## Lo que veo
- 320: portada con piezas pequeñas en los bordes, ninguna sobre el titular ni las etiquetas; nav en una fila (algora, Tema, Postúlate) sin tocarse; fichas 2 columnas con texto completo; caminos apilados; opciones con aire a ambos lados; autorización con fila alta.
- 390: igual de limpio; las piezas ya no tapan «realidad?».
- 768: pasos 2 x 2 con hilo vertical; formulario a dos columnas; opciones y casillas bien; panel/tabla con scroll propio. En la portada a 768 exactos sigue habiendo cruce (cubo oscuro sobre «lo haces», octaedro sobre «vez») porque la regla es < 768.
- Panel 390: filtros en columna a lo ancho, botones de ancho completo, tabla con su scroll.

## Cifras
- `completa.mjs` 320/390/768: toques < 44 solo quedan checkbox/radio (cuentan por su label); nav y ayuda corregidos. Texto < 16 solo mono 12 px.
- scrollWidth == innerWidth en 768, 1024 y 1180 táctil (`ver.mjs ... js=`).
- `npm run check`: 0 errores, 0 avisos, 0 sugerencias.

## Supuestos / PENDIENTES
- Usé el servidor ya levantado en 4321 (astro dev no admite dos en el mismo proyecto); no lo apagué porque no es mío.
- Defecto de escritorio no tocado (regla "1440 igual"): `.campo label` anula el padding de las pastillas `.opcion` también a 1440. Decide si se corrige.
- Si la prueba de «nada tapado» exige portada limpia a 768 exactos, subir `ANCHO_ANGOSTO` en capas3d.ts.
- No corrí playwright ni build; capturas 1440 solo verificadas por medidas de nav.
