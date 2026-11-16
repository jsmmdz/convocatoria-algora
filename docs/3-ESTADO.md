# 3 · Estado — qué hay y qué sigue

> Lo actualiza el orquestador al cerrar cada paso. Es lo primero que se lee al abrir una sesión.

## Dónde va

**Prototipo de escritorio completo (2026-11-16): `T01`–`T08` construidas. Faltan `R1` (responsive) y `T09` (cierre y
publicación), ya escritas: ver «Última sesión: cómo arrancarla».** `T05`–`T08` las hizo el orquestador
(Claude Fable 5.2) en una sola sesión, por encargo directo del autor; sus decisiones están aceptadas y les falta el pulido. Detalle más abajo, en
«`T05`–`T08`». Lo anterior, en orden:

**Fase:** arranque, retomado el 2026-11-09. Encargo reescrito, referentes capturados y su código leído,
fichas y mapa hechos, decisiones D-1…D-8 cerradas, plan aprobado con el orden del autor (2026-11-10).
**`T01` DONE (2026-11-10).** Pasó la auditoría final tras 3 rondas de QA (las dos primeras bloqueadas por la
fábrica: `F25` y arreglos sin commit). La revisión del orquestador confirmó E1–E7 y dejó `F23`–`F25`
(hook también desde `.claude/settings.json`, prueba de foco reescrita, limpieza del servidor de capturas).
Visto bueno firmado por el orquestador: **el autor pidió no revisar tareas sin contenido visible**
(`orquestador.md` § 6).
**`T02` DONE (2026-11-10), con visto bueno del autor.** Precarga y portada: dos corridas, 3 rondas de QA y
2 correcciones del constructor. La auditoría y la revisión del orquestador dejaron:
- `F26`: el hook juzga lo que escriben los comandos de terminal y hay un lugar legal para lo temporal en
  `fabrica/buzon/<ID>/tmp/`. Se prueba con `probar-hook.mjs`.
- La matriz de capturas pasa a 20 pantallas (con 1280 × 720).
- Cuatro pruebas nuevas: `load` tardío, contraste contra la trama tocada, solape y cruce de las piezas, y
  cambio de tamaño con scroll.

El hook sí registró al constructor (`F23` cerrada). En el pulido, el autor decidió que las piezas cruzan el
titular y que el titular crece con la pantalla. La fábrica queda en v4.2.

**`T03` lista para lanzar (2026-11-10):**
- Tarea en `fabrica/proyecto/tareas/T03-hitos.md` y ficha en `fabrica/proyecto/referentes/T03.json` (unseen
  A3, A4, A4b y A5; K1–K4).
- 13 pruebas en `sitio/tests/T03/`, validadas en un worktree desechable: pasan con una referencia correcta
  (57/57 junto con T01, T02 y las comunes) y atrapan los 23 defectos sembrados.
- Dos decisiones del autor (el bloque de color con la palabra en cursiva; el fondo del tema con pasos a
  tinta) y las del orquestador, anotadas en la tarea.

**`T03` corrió (2026-11-10, 3 rondas de QA):** la auditoría final quedó en **NO PASA todavía**.
**Revisión del orquestador (2026-11-14)**, escrita al final de `fabrica/buzon/T03/AUDITORIA-FINAL.md`:
- **E1** (compuerta en rojo por la planeación de T04 sin commit): cerrado con los commits.
- **E2 y E3:** decidió el autor. E2-A: el viajero pasa **por debajo de los bloques**, como la línea. E3-B:
  desplazamiento bajo al inclinarse, **1,5 px por grado**. Quedó en `docs/1-PRODUCTO.md` § 6, en la tarea y en la
  ficha (K2).
- **E4** (silueta con contraste 1:1 en los hitos invertidos): va al constructor.
- **Cinco pruebas nuevas** (E2 a 1440 y 1024, E3 en movimiento, E4 en claro y oscuro). Fallan contra el código
  actual y pasan con una referencia corregida: 18 de 18 en `tests/T03`.
- **E6:** el hook ahora resuelve las rutas relativas contra los `cd` del comando (44 casos; el anterior fallaba 5).
- **E7:** `loseContext()` solo se llama si el contexto sigue vivo (`webgl.ts`, `trama.ts`).

**`T03` DONE (2026-11-15).** La corrección r4 fue la **primera sesión real de Gemini**: una sesión de 764 s, 191
llamadas al hook y ninguna negada. QA de Sonnet: PASA. Auditoría de Opus: suite completa en verde, con E1 Mayor (el
viajero sobre el titular a 1280/1024) y E2–E4 Menores.
- Autor: E1-A (los textos van por encima del viajero) y E2-A (la raya de la línea a través del viajero se acepta).
- Pulido: el arreglo de E1 con su prueba (validada en los dos sentidos) y la onda a 0.08. 21/21 en `tests/T03`.
- E3 y E4, de la fábrica: el QA busca al constructor como `gemini:<ID>` y las compuertas guardan la ronda real
  (`--ronda=N` o `FABRICA_RONDA`, que pone `gemini.mjs`).
- Visto bueno del autor. Cierre en `fabrica/buzon/T03/`: `PULIDO.md`, `VISTO-BUENO.md` y `REGISTRO.md`.

**`T04` (escrita el 2026-11-14):** decididas con el autor las tres cosas de dirección (fichas
tipográficas, borde ácido con relleno del tema, titular + botón Postúlate; `docs/1-PRODUCTO.md` § 6). Ficha
`fabrica/proyecto/referentes/T04.json` y tarea `fabrica/proyecto/tareas/T04-productos.md`. **Sin pruebas propias**
(autor, 2026-11-10): solo la regresión de T01–T03, las capturas y el visto bueno.
- **Dividida (aprobada por el autor, 2026-11-14):**
  - **S1, fichas y bloque:** `Productos.astro` y `productos-fichas.ts`.
  - **S2, marco de tinta:** `marco-tinta.ts`, con `xhigh`.
  - **Integración:** `productos.ts`, `index.astro` y `tokens.css`.
- La interfaz (`prepararFichas`, `montarMarco`) y los nombres de los tokens están escritos en la tarea.
- Resuelto en la tarea: **un solo pin en dos tramos**, el vuelo hasta la mitad del pin y el marco en la segunda
  mitad (los puntos 3 y 5 se contradecían).
- Distancias de rueda de sus capturas medidas con T03 cerrada (2026-11-15): `piezas` 8460 y `marco` 9135 (antes
  4200 y 5600, que caían dentro de los hitos). La medida está en la ficha.

**`T04` DONE (2026-11-15).** Primera construcción real con subtareas en paralelo: S1 (206 s) y S2 (490 s, `xhigh`) a
la vez, después la integración (904 s); ninguna acción negada. La primera corrida se cortó por falta de créditos de
`agy` (~401 k tokens sin entrega) y se relanzó tras la recarga.
- QA r1 de Sonnet: sin hallazgos del constructor; tres del orquestador. H1: `L1` pedía un estado «bloque» que no
  existía, ahora se compara en «piezas». H2: tinta sobre el tomate (papel daba 3,66:1). H3: sin pruebas, se mantiene.
  Commit `44ed5c2`.
- Auditoría de Opus: E1–E2 Mayores (sin marco, por pérdida de contexto o `import()` fallido, quedaba una pantalla
  cobalto vacía), E3 Menor (Shift+Tab no llegaba al Postúlate de la sección) y E4 (anclas `#postulate` y
  `#postulacion`).
- Autor: E1–E3 los arregla el orquestador; el ancla única es `#postulacion` (nav, prueba y tarea de T01 corregidas).
  Pulido verificado con las sondas del auditor; compuertas en verde.
- Visto bueno del autor. Cierre en `fabrica/buzon/T04/`: `PULIDO.md`, `VISTO-BUENO.md` y `REGISTRO.md`.
- Para T05: el panel provisional `[data-siguiente]` («Cómo funciona») de `Productos.astro` es lo que el marco deja
  ver; T05 lo reemplaza o lo continúa. El formulario de T07 lleva `id="postulacion"`.

**Fábrica v5.0 (2026-11-14, decisión del autor): Gemini construye, Claude planea, orquesta y revisa.**
- Construye **Gemini 4 Hydrogen** por `agy`. La ronda 1 se reparte en subtareas en paralelo con archivos
  disjuntos, más una integración; las correcciones las hace una sola sesión.
- El QA sigue en Sonnet y la auditoría final en Opus.
- Esfuerzo `high`, y `xhigh` en shaders.
- Sin cuota (429), la tarea para y avisa.
- Piezas: `fabrica/scripts/gemini.mjs`, `hook-gemini.mjs` (+ `probar-hook-gemini.mjs`, 22 casos),
  `.agents/`, `.claude/agents/relevo-gemini.md`, `fabrica/proyecto/modelos.json` y el workflow.
- Probada con la tarea desechable `T99`, ya borrada:
  - dos subtareas reales en paralelo + integración, ~25 s y 25–40 k tokens por sesión en `low`;
  - el hook negó la escritura cruzada (la primera corrida la dejó pasar porque `agy` 1.2 renombró
    `write_to_file` → `write_file`; quedó corregido y cubierto en los casos);
  - el supervisor sobrevive entre llamadas;
  - SIN_CUOTA simulado para y retoma sin repetir lo entregado.
- Probado con tareas reales: el QA de Sonnet sobre una entrega de Gemini (corrección r4 de T03) y la construcción
  en paralelo con integración, compuertas y capturas (T04, 2026-11-15).
- Con commit desde el 2026-11-14, en cinco commits: hook, lanzador, workflow, manual y planeación de T04. Además,
  el workflow y el lanzador aceptan IDs `R<n>` para las tareas de responsive (autor, 2026-11-14).

**`T05`–`T08` construidas (2026-11-16), en `PULIDO` hasta la revisión del autor.** El autor pidió: «usa Fable para
continuar… déjame un prototipo con todas las tareas hechas como entregable final». El orquestador (Claude Fable 5.2)
construyó las cuatro seguidas, **sin Gemini, sin QA de Sonnet y sin auditoría de Opus**
(`fabrica/buzon/T05/REGISTRO.md`).
- **`T05`:** la entrada de «Cómo funciona» en el panel del marco de tinta, 4 columnas con hilos (leadoff A4) y 8
  bandas de color a sangre, una por facultad.
- **`T06`:** hélice de proyectos (ryan K1–K4): sección fija, 0,6 pantallas por tarjeta, flechas y teclado sobre el
  mismo scroll, tarjetas curvas en WebGL con el texto dentro de la textura y botones reales encima; sin WebGL quedan
  las del DOM. «Sumarme» → `algora:sumarse`.
- **`T07`:** formulario de dos caminos en `#postulacion`, validación, trampa, Ley 1581, Supabase con carga diferida y
  modo demostración. `sitio/supabase/esquema.sql`.
- **`T08`:** `/equipo/`: entrar, cifras, filtros, aprobar, equipo completo, borrar en dos clics y CSV; sin Supabase
  se recorre con filas `[EJEMPLO]`.
- **Pruebas:** 37 nuevas (`sitio/tests/T05`–`T08`) y `tests/comunes/ayudas.ts`. Compuertas completas en `fabrica/buzon/T08/COMPUERTAS-r1.md`.
- **Decisiones de dirección tomadas por el orquestador**, por confirmar: `docs/1-PRODUCTO.md` § 6, «Por confirmar en
  la revisión del prototipo» (ocho filas).
- **Sin probar:** todo lo que toca Supabase real (envío, `proyectos_publicos()`, entrar al panel): falta el proyecto.

**Preparación de la última sesión (2026-11-16).** El autor pidió: «deja todo listo para acabar el MVP en una última
sesión con Fable». Quedó:
- **Decisiones:** aceptó en bloque las ocho de `T05`–`T08`; R-1 (hitos en celular con línea vertical y unicornio),
  R-2 (proyectos en celular como carrusel deslizable) y publicar en **modo demostración**. Las R-3 a R-7 las fijó el
  orquestador. Todo en `docs/1-PRODUCTO.md` § 6, § 7 y § 8.
- **`R0` hecha** (medición a 390 × 844 táctil): el sitio ya se sostiene apilado y sin scroll horizontal; falta
  afinar toques, dos tamaños de texto, los caminos del formulario y las dos mecánicas de R-1 y R-2. Cifras en la tarea.
- **Tareas escritas:** `fabrica/proyecto/tareas/R1-responsive.md` (una sola para todo el sitio) y
  `T09-cierre.md` (pulido de `T05`–`T08`, pie, metadatos, rendimiento, axe en 20 pantallas, `LEEME.md` y publicación).
- **Comprobado para publicar:** el repo `jsmmdz/convocatoria-algora` **no existe todavía en GitHub** y el repo local
  **no tiene remoto**; `gh` está autenticado como `jsmmdz`; `previo/` y las capturas de referentes no están versionados.

## Última sesión: cómo arrancarla

Mensaje para abrirla: **«Última sesión: construye R1 y T09 y publica el MVP»**. El orquestador sigue este orden y
no para salvo en lo marcado con ✋:

1. Leer este archivo, `R1-responsive.md` y `T09-cierre.md`. `git status` limpio, compuertas de `T08` en verde.
2. **`R1`:** matriz de 20 pantallas y «lo que veo» → pruebas de `tests/R1/` (con la foto del escritorio antes de
   tocar) → construir en el orden de la tarea → compuertas completas → commit.
3. **`T09`:** pulido de `T05`–`T08` → pie → metadatos → rendimiento → axe en las 20 pantallas → `LEEME.md` →
   compuertas completas → commit.
4. **Publicar** (autorizado por el autor el 2026-11-16, en modo demostración): revisar que no suba nada que no
   deba, crear el repo público, primer push, activar Pages y **probar el sitio publicado**.
5. Cerrar: buzones, este archivo («MVP publicado») y lo que queda fuera del MVP.

✋ **Lo único que puede parar la sesión** (si el autor lo deja antes, no para):
- La **frase de cierre del pie**. Sin ella sale `[FRASE DE CIERRE DEL AUTOR]`.
- Los **textos definitivos**, si los quiere distintos del borrador del prototipo v2.
- El **unicornio** de Antigravity. Sin él sale la silueta provisional.

**Fuera del MVP** (después de publicar): Supabase real (el autor crea el proyecto, corre
`sitio/supabase/esquema.sql`, pone los secrets e inscribe al equipo; entonces se prueban el envío y el panel),
objetos 3D de Antigravity y el visto bueno en un celular de verdad.

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
   - **`R0` (orquestador):** los referentes y nuestro sitio en la matriz de 20 pantallas
     (`fabrica/scripts/matriz/vistas.mjs`, de 320 × 568 a 5120 × 1440, táctil con UA de iOS), los cortes
     reales leídos en el código de cada referente y **maquetas de las opciones en imágenes** (390, 768,
     1024, 1440) de cada mecánica que no cabe igual en celular, como `PORTAFOLIO/fabrica/buzon/T41/maquetas/`.
     El autor decide **una por una** (R-1…R-n) y van a `docs/1-PRODUCTO.md` § Responsive.
   - **`R1`–`Rn`:** tareas de responsive por sección con el rol `@responsive`
     (`fabrica/nucleo/roles/responsive.md`): a 1440 nada cambia; toques ≥ 44 px, texto ≥ 16 px, sin
     secuestrar el gesto nativo; visto bueno sobre `capturas/<ruta>-breakpoints.jpg`.
3. **`T09`:** cierre, rendimiento, axe en las 20 pantallas y publicación.

Ya decidido y que se respeta desde las primeras tareas para no rehacer: D-4 (hitos verticales en celular)
se construye en `R`, no en `T03`; los componentes usan medidas fluidas (`max(min, vw)`) y tokens, para que el
responsive sea ajuste y no reconstrucción.

## Plan de tareas

En serie. Cada tarea calca una sección completa con su ficha; las de shaders se lanzan con `high`.

| ID | Qué entrega | Calca | Depende de | Estado |
|---|---|---|---|---|
| T01 | Andamio: Astro + TS estricto, tokens del manual (paleta, fuentes, espacios fluidos max(min, vw)), tema claro/oscuro con botón, `data-listo` con respaldo, GSAP + Lenis base con movimiento reducido, navegación y pie, despliegue a Pages con los secrets de Supabase | manual · leadoff K2 | — | DONE |
| T02 | Precarga y portada: contador con el unicornio provisional al centro; «¿Y si esta vez sí lo haces realidad?» por líneas con un objeto que crece dentro de la frase; trama de caracteres (OGL) que se deforma con el cursor; objetos 3D en capas con parallax (Three diferido) | unseen A1–A2 · leadoff A2–A3, K1 · tabletales A1–A2, K1 | T01 | DONE |
| T03 | Hitos: línea ondulada que se vuelve sólida, hitos `[IDEA]`…`[NOMBRE]` en horizontal con scrub, unicornio que viaja inclinándose con la velocidad | unseen A3–A5, K1–K4 | T02 | DONE |
| T04 | Productos y marco de tinta: bloque a sangre con los productos que llegan volando a su sitio, «¿Cuál es el tuyo?»; el marco que se abre como tinta (shader) hacia «Cómo funciona» | leadoff A2 · tabletales A3–A5, K2, K4 | T03 | DONE |
| T05 | Cómo funciona y carreras: 4 columnas fijas con hilos y mucho aire; carreras en bloques de color a sangre con lo que aporta cada una | leadoff A4, A6 | T04 | PULIDO |
| T06 | Hélice de proyectos: tarjetas curvas en WebGL (OGL) que giran con el scroll de una sección fija, más flechas y teclado; tarjetas reales en el DOM; color por facultad; zoom y deriva con la velocidad; `[EJEMPLO]`; «Sumarme» → evento al formulario | ryan A1–A6, K1–K4 | T05 | PULIDO |
| T07 | Postulación y datos: formulario de dos caminos con validación, trampa y Ley 1581; Supabase (esquema, envío, `proyectos_publicos` en la hélice) y modo demostración; recibe `algora:sumarse` | manual (componentes) | T06 | PULIDO |
| T08 | Panel del equipo `/equipo/`: entrar, filtrar, aprobar ideas para la hélice, marcar equipo completo, borrar con confirmación, descargar CSV | — (utilitario, manual) | T07 | PULIDO |
| — | **Prototipo al 80 %: revisión del autor sobre el sitio completo en escritorio** | — | T08 | — |
| R0 | Auditoría responsive: matriz de 20 pantallas, cortes de los referentes, maquetas de opciones y decisiones R-1…R-n (orquestador) | unseen A6 y lo que midan los referentes en celular | revisión | DONE |
| R1 | Responsive de todo el sitio en una sola tarea, según R-1…R-7 (`R1-responsive.md`; la construye el orquestador) | unseen a 390 (hitos) | R0 | PENDING |
| T09 | Cierre: pulido de T05–T08, pie en bloque negro, metadatos, rendimiento, axe en las 20 pantallas, `LEEME.md` y publicación en modo demostración (repo público, Pages) | leadoff A6 | R1 | PENDING |

**Del autor, en paralelo:** el unicornio (Antigravity; `.glb` o PNG/WebP con transparencia) y, cuando
quiera, los objetos 3D de la portada. Supabase: crear el proyecto y pasar URL y clave anon (`T07` y `T08` ya están
construidas y corren en modo demostración hasta entonces).

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
