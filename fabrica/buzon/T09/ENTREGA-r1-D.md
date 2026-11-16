# ENTREGA T09-D (r1): pie, metadatos, LEEME y peso

## Qué construí
- `sitio/src/components/Pie.astro`: bloque de tinta a sangre con frase XXL (constante `FRASE_CIERRE` al inicio, hoy `[FRASE DE CIERRE DEL AUTOR]`), botón «Postúlate» (`.boton boton--principal`, href `inicio` + `#postulacion`, funciona desde `/equipo/` y 404) y fila de datos (semillero, estado, «Acceso del equipo» de 44 px). Sigue siendo `<footer>`, fondo `--pie-fondo`, ancho completo; texto 16 px. Valores nuevos solo como propiedades locales de `.pie` (`--borde` papel para que el botón se lea sobre tinta, `--pie-linea` con color-mix). Sin hex.
- `sitio/src/layouts/Base.astro`: `<link rel="icon">`, `canonical` (solo si hay `Astro.site`), `og:type/locale/title/description/image`, `twitter:card/title/description/image`. La imagen usa `Astro.site` + `BASE_URL`; en local cae a la ruta relativa y no rompe. Script del tema e imports intactos.
- `sitio/public/favicon.svg` (gema ácido/magenta sobre tinta, colores literales de la marca) y `sitio/public/og.jpg` (1200 × 630, 120 KB) generada con `fabrica/buzon/T09/tmp/d-og.mjs` (portada en claro).
- `LEEME.md` en la raíz.

## Lo que veo (capturas en `fabrica/buzon/T09/tmp/d-*.jpg`)
- 1440 claro: bloque negro desde el borde, titular «[FRASE DE CIERRE DEL AUTOR]» en tres líneas en serif blanco, grande, a la izquierda y mucho aire a la derecha; debajo el botón ácido «Postúlate» con borde papel; una línea fina y abajo, en tres columnas, semillero, estado y «Acceso del equipo» a la derecha.
- 1440 oscuro: igual, con la tinta aclarada (gris casi negro), se distingue del fondo; el botón conserva borde y sombra claros.
- 390: bloque negro, frase en 3 líneas, botón, línea, y los tres datos apilados; sin scroll horizontal.
- 320 (oscuro): frase en 3 líneas, todo cabe, datos apilados. La nav fija se monta sobre el borde superior de la captura (es de la nav, no del pie).
- Miré el pie con el servidor que ya corría en 4321 (no pude abrir uno propio: Astro avisa que ya hay uno; no lo apagué). No tomé 2560 ni `/equipo/`.

## Peso (`sitio/dist` VIEJO: index.html del 2026-11-16 04:35, anterior a R1 y a mis cambios; no construí)
- Fuentes WOFF2: 168 748 B (164,8 KB, 5 archivos). `find dist/_astro -name '*.woff2' | xargs ls -l | awk '{s+=$5} END{print s}'`
- JS inicial de `/` en gzip: 78 108 B (76,3 KB), contando los 3 scripts del HTML y sus import estáticos. `cd sitio && node ../fabrica/buzon/T09/tmp/d-peso.mjs`
- `three` y `@supabase/supabase-js` NO están en el JS inicial: el mismo script busca `supabase`, `three`, `THREE`, `WebGLRenderer` en el HTML y esos JS: todo false. `three-renderer.*.js` (352 KB) y `capas3d.*.js` existen en `dist/_astro` pero ningún script del HTML los carga de forma estática.
- Hay que repetir con un build nuevo antes de cerrar.

## SOLICITUDES
- `theme-color` por tema: necesita valor literal (hex) y yo no puedo ponerlo; lo anoto para el orquestador (dos `<meta name="theme-color" media="(prefers-color-scheme: ...)">` con papel `#F6F8FB` y tinta `#0D0D0D` de tokens.css, en Base.astro).
- `npm run check` da 1 error que no es mío: `tests/T09/t09.spec.ts:14` (`VISTAS` como `Array<[string, number, number, string]>`).
- Reconstruir `dist` y volver a medir; correr pruebas (T01 mide el pie).

## PENDIENTES
- Frase de cierre del autor: cambiar `FRASE_CIERRE` en `Pie.astro`.
- Favicon provisional (gema); si llega el unicornio, se cambia.
