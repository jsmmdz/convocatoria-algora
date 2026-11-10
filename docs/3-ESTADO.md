# 3 · Estado — qué hay y qué sigue

> Lo actualiza el orquestador al cerrar cada paso. Es lo primero que se lee al abrir una sesión.

## Dónde va

**Fase:** arranque, retomado el 2026-11-09. Encargo reescrito, referentes capturados y su código leído,
fichas y mapa hechos, decisiones D-1…D-8 cerradas, plan aprobado con el orden del autor (2026-11-10).
**`T01` DONE (2026-11-10).** Pasó la auditoría final tras 3 rondas de QA (las dos primeras bloqueadas por la
fábrica: `F25` y arreglos sin commit). La revisión del orquestador confirmó E1–E7 y dejó `F23`–`F25`
(hook también desde `.claude/settings.json`, prueba de foco reescrita, limpieza del servidor de capturas).
Visto bueno firmado por el orquestador: **el autor pidió no revisar tareas sin contenido visible**
(`orquestador.md` § 6). Fábrica v4.1. **`T02` lista para lanzar (2026-11-10):** tarea en `fabrica/proyecto/tareas/T02-portada.md`, ficha
`fabrica/proyecto/referentes/T02.json` y 13 pruebas en `sitio/tests/T02/`, validadas en un worktree
desechable: pasan con una portada correcta (40/40 con T01 y comunes) y atrapan los 18 defectos sembrados.
Las comunes y la nav de T01 ahora esperan `data-listo` (hay precarga encima). `capturas.mjs` admite
`asentar: false` para fotografiar la precarga. Decisiones del orquestador (reversibles por token): portada
cobalto, pastilla ácida con la mascota en la frase. **Sigue:** `/construir-tarea T02 high`.

**Al auditar T02:** comprobar que `fabrica/datos/hook.jsonl` registra las llamadas del constructor (`F23`).

## Decisiones cerradas (no se rediscuten)

Las del 2026-10-30 al 2026-11-01 que siguen vigentes están en `ENCARGO.md`; lo que salió, en `ENCARGO.md` § 7.
Las del 2026-11-09 (proyecto, inicio, stack, repo, datos, tema, D-1…D-8) están en `docs/1-PRODUCTO.md` § 6.

## Arranque (`fabrica/nucleo/roles/orquestador.md` § 0)

- [x] Encargo completo, reescrito el 2026-11-09
- [x] Referentes elegidos: Creación Digital (manual), unseen, tabletales, leadoff, ryan
- [x] Referentes capturados (`referentes/capturas/`) y su código leído en el scratchpad (2026-11-09)
- [x] Fichas en `fabrica/proyecto/referentes/` (unseen, tabletales, leadoff, ryan)
- [x] Mapa de adaptación en `docs/1-PRODUCTO.md` § 3
- [x] Decisiones del autor D-1…D-8 (2026-11-09)
- [x] `docs/1-PRODUCTO.md` y `docs/2-TECNICO.md` escritos
- [x] Plan de tareas aprobado por el autor (2026-11-10, con el responsive casi al final)

## Orden del autor (2026-11-10)

«Primero hay que armar y copiar todo hasta tener un prototipo 80 % terminado; no miramos el responsive,
así que va casi último.» Por eso:

1. **`T01`–`T08` construyen el sitio completo en escritorio** (1440 × 900 manda; se prueba también en
   1280 y 1024 para que nada se rompa). Lo único que se exige en angosto mientras tanto es que no haya
   scroll horizontal de página ni contenido inalcanzable: nada de diseño de celular todavía.
2. **Con el prototipo al 80 %, el responsive**, como se resolvió en el portafolio (`T39`–`T43`):
   - **`R0` (orquestador):** los referentes y nuestro sitio en la matriz de 19 pantallas
     (`fabrica/scripts/matriz/vistas.mjs`, de 320 × 568 a 5120 × 1440, táctil con UA de iOS), los cortes
     reales leídos en el código de cada referente y **maquetas de las opciones en imágenes** (390, 768,
     1024, 1440) de cada mecánica que no cabe igual en celular, como `PORTAFOLIO/fabrica/buzon/T41/maquetas/`.
     El autor decide **una por una** (R-1…R-n) y van a `docs/1-PRODUCTO.md` § Responsive.
   - **`R1`–`Rn`:** tareas de responsive por sección con el rol `@responsive`
     (`fabrica/nucleo/roles/responsive.md`): a 1440 nada cambia; toques ≥ 44 px, texto ≥ 16 px, sin
     secuestrar el gesto nativo; visto bueno sobre `capturas/<ruta>-breakpoints.jpg`.
3. **`T09`:** cierre, rendimiento, axe en las 19 pantallas y publicación.

Ya decidido y que se respeta desde las primeras tareas para no rehacer: D-4 (hitos verticales en celular)
se construye en `R`, no en `T03`; los componentes usan medidas fluidas (`max(min, vw)`) y tokens, para que el
responsive sea ajuste y no reconstrucción.

## Plan de tareas

En serie. Cada tarea calca una sección completa con su ficha; las de shaders se lanzan con `high`.

| ID | Qué entrega | Calca | Depende de | Estado |
|---|---|---|---|---|
| T01 | Andamio: Astro + TS estricto, tokens del manual (paleta, fuentes, espacios fluidos max(min, vw)), tema claro/oscuro con botón, `data-listo` con respaldo, GSAP + Lenis base con movimiento reducido, navegación y pie, despliegue a Pages con los secrets de Supabase | manual · leadoff K2 | — | DONE |
| T02 | Precarga y portada: contador con el unicornio provisional al centro; «¿Y si esta vez sí lo haces realidad?» por líneas con un objeto que crece dentro de la frase; trama de caracteres (OGL) que se deforma con el cursor; objetos 3D en capas con parallax (Three diferido) | unseen A1–A2 · leadoff A2–A3, K1 · tabletales A1–A2, K1 | T01 | LISTA |
| T03 | Hitos: línea ondulada que se vuelve sólida, hitos `[IDEA]`…`[NOMBRE]` en horizontal con scrub, unicornio que viaja inclinándose con la velocidad | unseen A3–A5, K1–K2 | T02 | PENDING |
| T04 | Productos y marco de tinta: bloque a sangre con los productos que llegan volando a su sitio, «¿Cuál es el tuyo?»; el marco que se abre como tinta (shader) hacia «Cómo funciona» | leadoff A2 · tabletales A3–A5, K2, K4 | T03 | PENDING |
| T05 | Cómo funciona y carreras: 4 columnas fijas con hilos y mucho aire; carreras en bloques de color a sangre con lo que aporta cada una | leadoff A4, A6 | T04 | PENDING |
| T06 | Hélice de proyectos: tarjetas curvas en WebGL (OGL) que giran con el scroll de una sección fija, más flechas y teclado; tarjetas reales en el DOM; color por facultad; zoom y deriva con la velocidad; `[EJEMPLO]`; «Sumarme» → evento al formulario | ryan A1–A6, K1–K4 | T05 | PENDING |
| T07 | Postulación y datos: formulario de dos caminos con validación, trampa y Ley 1581; Supabase (esquema, envío, `proyectos_publicos` en la hélice) y modo demostración; recibe `algora:sumarse` | manual (componentes) | T06 | PENDING |
| T08 | Panel del equipo `/equipo/`: entrar, filtrar, aprobar ideas para la hélice, marcar equipo completo, borrar con confirmación, descargar CSV | — (utilitario, manual) | T07 | PENDING |
| — | **Prototipo al 80 %: revisión del autor sobre el sitio completo en escritorio** | — | T08 | — |
| R0 | Auditoría responsive: matriz de 19 pantallas, cortes de los referentes, maquetas de opciones y decisiones R-1…R-n (orquestador) | unseen A6 y lo que midan los referentes en celular | revisión | PENDING |
| R1–Rn | Responsive por sección, según R-1…R-n (`@responsive`) | según R0 | R0 | PENDING |
| T09 | Cierre: pie en bloque negro, rendimiento (presupuestos, Three y modelos diferidos), axe en las 19 pantallas, publicación real (repo público, secrets, Pages) | leadoff A6 | R1–Rn | PENDING |

**Del autor, en paralelo:** el unicornio (Antigravity; `.glb` o PNG/WebP con transparencia) y, cuando
quiera, los objetos 3D de la portada. Supabase: crear el proyecto y pasar URL y clave anon antes de `T07`.

Estados: `PENDING` · `IN_PROGRESS` (MVP con agentes) · `REVIEW` · `PULIDO` (orquestador + autor) ·
`VISTO BUENO` · `DONE` · `BLOCKED`.

## Lo medido de los referentes

Lo que ya se midió, para no repetirlo (lo lee el analista de referentes).

### unseen (se queda: inicio)

**Capturas del 2026-10-30** (`node fabrica/scripts/referentes.mjs unseen`, en `referentes/capturas/`, que
no se sube). Lo que se ve:

- Precarga `[93%]` con la mascota (ojos con alas) al centro; «TWENTY / TWENTY FIVE» en amarillo condensado
  sobre una trama de caracteres que dibuja un **ojo**; «YEAR IN REVIEW» en serif cursiva arriba.
- La **línea de tiempo** es otra sección, sobre gris claro: a 1440, tarjetas de proyecto en horizontal unidas
  por una **línea ondulada punteada** por la que viaja la mascota; cada hito lleva etiqueta
  `[MOTION] [JAN_25]`, titular grande y `OPEN [+]`; algunos hitos cambian a fondo oscuro. A 390 se apila en
  vertical y cada mes aparece en serif cursiva gigante («FEBRUARY», «APRIL», «MAY»).

**Código leído el 2026-10-31** (bundle `wp-content/themes/yiw/public/build/js-265ae611.js`, bajado al
scratchpad, no al repo; la técnica se reimplementa, no se copia):

- Librerías: GSAP 3.14.2 (cabecera de SplitText 3.14.2) con ScrollTrigger, SplitText y Flip; Lenis
  (`smoothWheel`, `orientation`); Three.js (`WebGLRenderer`) para la portada; transiciones de página con Taxi.
- **La línea:** un SVG de 32.000 × 300 px (`.js-line`, punteado) y una copia sólida (`.js-line:alt`) dentro
  de un contenedor recortado. En modo horizontal, un ScrollTrigger con `horizontal: true` y `scrub: true`
  traslada la copia sólida `-progreso × 100 %`: lo recorrido se ve sólido y lo que falta, punteado.
- **La mascota (`.js-balloon`):** en cada cuadro, `rotación = lerp(rotación, clamp(−40, 40, velocidad de
  Lenis), 0,04)`; se aplica `rotate(rotación deg) translateX(−8 × rotación px)`. Se inclina con la
  velocidad del scroll.
- **Videos:** solo se reproducen mientras están en pantalla (un ScrollTrigger por video).
- **Modo horizontal / vertical:** un `matchMedia` («horizontal») decide; a 1440 es horizontal y a 390
  vertical. El punto de corte exacto **no está medido**.
- **La trama de la portada:** pase de posproceso ASCII en Three.js con los caracteres « .,-+=*UNSEEN2025»
  (textura de 56), que lee la velocidad de una simulación de fluido (`tFluid`): el cursor la deforma.

### Formulario (candidatos sin elegir)

- **vitra:** portada con sillas dispersas y «Start»; la primera pregunta es un control deslizante
  («Sitting time») sobre una cuadrícula de sillas que **filtra en vivo** con la respuesta.
- **nocode:** ventana encima de la página con una pregunta por pantalla («Wat is je voornaam?») y contador
  **01 / 07**.
- **notie:** «STEP 1 OF 5» con puntos de progreso; cada paso es una elección visual sobre una vista previa de
  la nota («ANONYMOUS»); Back / Next.

### Descartados (por si vuelven a salir)

- **banner:** hangar sci-fi, 5 personajes con carrera, panel SKILLS de 7 habilidades × 10 puntos, cortina
  de 0,6 s `cubic-bezier(0, 0.55, 0.45, 1)`. Salió por la estética de videojuego, los personajes y el carrusel.
- **outbid**, **mdh**, y los candidatos de la segunda ronda: ver `ENCARGO.md` § 3. Sus capturas siguen en
  `referentes/capturas/` y las hojas de la segunda ronda, en el scratchpad de la sesión del 2026-11-01.

## Problemas abiertos

- Infinite Craft muestra una verificación anti-bots de Cloudflare al navegador automático: si vuelve a
  entrar, se captura en el navegador integrado (nunca se resuelve el captcha).
