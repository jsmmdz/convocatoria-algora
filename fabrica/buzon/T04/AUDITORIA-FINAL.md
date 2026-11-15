# Auditoría final — T04 · Productos y marco de tinta (ronda 1)

- **Veredicto:** PASA con hallazgos. La suite completa está en **VERDE** (sin ❌ y sin ⚠️ de reintento) y el
  camino feliz funciona como dijo el QA: siete fichas en su sitio a mitad del pin, hueco de borde ácido
  irregular que pasa los cuatro bordes y deja el canvas transparente, respaldo quieto sin scroll horizontal.
  El defecto que se escapó está en el respaldo del marco: si el WebGL se pierde o el módulo diferido no
  carga, el visitante queda frente a una pantalla cobalto vacía y «Cómo funciona» no aparece nunca (E1, E2).
- **Fecha:** 2026-11-15 17:15–17:35 (hora local)
- **Modelo:** claude-opus-5-5 (auditor-final, primera pasada; el orquestador la revisa)
- **Fábrica:** v5.0
- **Commit:** `44ed5c2` + árbol de trabajo de T04 (sin commit: `Productos.astro`, `productos.ts`,
  `productos-fichas.ts`, `marco-tinta.ts`, `index.astro`, `tokens.css`)
- **Intervenciones del autor:** 0 (el commit `44ed5c2` del orquestador con H1 y H2 lo autorizó el autor antes de lanzar)

## Compuertas (suite completa)

`node fabrica/scripts/compuertas.mjs T04 --completas --guardar` → **VERDE**, guardado en `COMPUERTAS-r1-2.md`.
Bloquean 0 · Avisos 1. check 0/0/0, build, Playwright `tests/comunes`, `T01`, `T02`, `T03` «passed» sin reintento,
fuentes 168.748 B, JS inicial 70.638 B gzip. Alcance: 6 archivos dentro de `archivos`, fuera de alcance ninguno
(H1 y H2 ya tienen commit).

- ⚠️ `mobiliario` (`Productos.astro:101, 102, 115, 147, 148`): bien. Son `border: var(--borde-ancho)` y
  `box-shadow: var(--sombra)` / `--sombra-hover` que el punto 2 de la tarea pide (borde y sombra dura del manual).

## Hook (F17, F23, F26)

`fabrica/datos/hook.jsonl` tiene líneas de `gemini:T04/S1` (83), `S2` (140), `integracion` (130), `qa` (80) y
`relevo-gemini` (8), todas `permitido`. Ninguna negación que cruzar. El hook sí corre: mis dos intentos de usar
`/dev/null` quedaron negados y registrados.

## Lo que probé en el navegador (función, no cifra)

Sondas: `fabrica/buzon/T04/tmp/auditoria-a.mjs` y `auditoria-b.mjs` (Chromium con GPU, `astro preview` en 4391,
cerrado al final). Capturas `tmp/aud-*.png`.

| Prueba | Resultado |
|---|---|
| Píxeles del marco a 1440×900 (rueda real): y = 8460, 8900, 9135, 9300, 9500 | 8460: bloque cobalto, siete fichas, titular y botón (`aud-px-8460.png`). 9135: centro `246,248,251` (papel del tema), borde ácido irregular de grosor variable, cobalto afuera (`aud-px-9135.png`); no es un óvalo ni está invertido. 9300: todo papel con «Cómo funciona», sin ácido ni cobalto en las esquinas. 9500: papel arriba y el pie (`13,13,13`) abajo |
| DPR 3 | canvas 2880 × 1800 a 1440 × 900: el tope `--marco-dpr-max` = 2 funciona |
| Redimensionar en pleno marco (1440 → 1920×1080 → 1280×720) | canvas 1920×1080 y luego 1280×720, sin avisos |
| Apagado completo (y = 9135) y paso a 800 px y a movimiento reducido | `modo` null, siete fichas `visible/1`, titular y botón visibles; al volver a 1440 se rearma igual |
| Salto directo con `scrollTo` a 9200 y al final | el marco monta y pinta; el pie se alcanza (y = 9744) |
| Sin WebGL (`--disable-webgl`) | `modo` null, canvas `display:none`, sin scroll horizontal, 0 mensajes de consola |
| **Pérdida del contexto a mitad del marco** (y = 9000, `WEBGL_lose_context`) | **Falla, ver E1** |
| **El `import()` de `marco-tinta` falla** (petición abortada) | **Falla, ver E2** |
| Teclado: Shift+Tab desde el final de la página | **el enlace Postúlate de la sección no se alcanza, ver E3** |

## Hallazgos

### `E1` · Si se pierde el contexto WebGL, «Cómo funciona» queda tapado por un bloque cobalto vacío para siempre
- **Severidad:** Mayor
- **Dueño:** constructor (integración, `sitio/src/lib/productos.ts`; CSS en `Productos.astro:258`)
- **Evidencia:** a 1440×900 con rueda hasta y = 9000 (hueco abierto) forcé `loseContext()`. El canvas se oculta
  (`display:none`, correcto), pero `alPerderContexto` quita `data-marco-listo` y el `.productos__bloque` vuelve a
  pintar `rgb(44, 8, 255)` por encima de `[data-siguiente]` (z-index 3 contra 1), mientras el titular, el botón y
  las fichas siguen apagados por `tlPin` (`visibility: hidden`). Resultado: en y = 9000 y en y = 9500 la pantalla es
  cobalto liso de borde a borde, sin texto (`tmp/aud-perdido-9500.png`). Tampoco se recupera: al subir a y = 0 y
  volver a 9300 sigue cobalto vacío (`tmp/aud-perdido-vuelta-9300.png`), porque `montarMarco` sobre un canvas
  perdido que no se soltó a propósito devuelve `null` y `data-marco-listo` no vuelve.
- **Regla:** tarea, punto 5 («Si se pierde el contexto, el canvas se oculta y la página sigue (como `trama.ts`)») y
  punto 6 (sin WebGL: bloque, titular, botón y fichas legibles con `[data-siguiente]` debajo); `reglas.md` 5 («Toda
  espera tiene salida»). La página «sigue» en el scroll, pero lo que la tarea quiere que siga (el panel
  siguiente o el bloque con su contenido) no se ve.
- **Por qué escapó:** el QA probó el ciclo de vida feliz (desmontar y volver a montar con el contexto soltado a
  propósito) y no el evento `webglcontextlost` real, aunque la tarea lo pide por escrito. T04 no tiene pruebas
  propias (decisión del autor), y la regresión T01–T03 y las comunes corren con GPU, donde el contexto nunca se
  pierde. El defecto vive en el acople de dos piezas de subtareas distintas: la transparencia del bloque depende de
  `data-marco-listo` (S1/integración), pero el apagado del contenido no (integración); cada pieza por separado se
  ve bien.

### `E2` · Si el módulo diferido del marco no carga, mismo callejón cobalto y un error sin capturar
- **Severidad:** Mayor
- **Dueño:** constructor (integración, `productos.ts:85-96`)
- **Evidencia:** con la petición de `marco-tinta.*.js` abortada (red caída, despliegue nuevo con otro hash),
  `montarSiCerca` hace `await import('./marco-tinta')` sin `try/catch`: consola con
  `pageerror Failed to fetch dynamically imported module …/marco-tinta.BPzSi_oo.js` y, en y = 9300, la misma
  pantalla cobalto vacía (`tmp/aud-import-fallido-9300.png`; `listo: false`, contenido `hidden/0`). Lo mismo pasa
  si `montarMarco` devuelve `null` con `hayWebGL()` verdadero (por ejemplo, si `new Renderer` lanza).
- **Regla:** `reglas.md` 5 («Toda espera tiene salida»: una carga que puede no terminar lleva respaldo) y la prueba
  común de consola limpia en el caso de fallo; tarea punto 6.
- **Por qué escapó:** igual que E1, nadie ejercitó el camino de fallo de la carga diferida; el QA solo verificó que
  el `import()` ocurre y cuándo (`data-marco-listo`). El arreglo de E1 (que el apagado del contenido o la
  transparencia del bloque no dependan solo de que el marco exista) cubre también este caso; el `catch` es aparte.

### `E3` · Pasado el pin, el titular y el botón Postúlate quedan con `visibility: hidden`: fuera del orden de tabulación hacia atrás y del árbol accesible
- **Severidad:** Menor
- **Dueño:** constructor (integración, `productos.ts:50`, `autoAlpha` en `tlPin`)
- **Evidencia:** con la página al final (y = 9744), Shift+Tab recorre `Postúlate` (nav) → `Tema` → `algora` → `body`
  y vuelve a empezar: el enlace `[data-postular]` de la sección nunca recibe foco (`postVis: hidden`). El `<h2>`
  «¿Cuál es el tuyo?» también queda `hidden` (fuera del árbol de accesibilidad) desde 1,12 del pin hasta el final de
  la página. Hacia adelante desde arriba sí se alcanza (Tab lo enfoca y la página baja a y = 7730, con el botón
  visible).
- **Regla:** `reglas.md` 5 («Todo lo interactivo funciona con teclado»). El apagado lo pide la tarea, pero cuando la
  sección ya salió de la pantalla el contenido podría volver a `visible` (o apagarse solo con opacidad mientras el
  pin está activo).
- **Por qué escapó:** la prueba común de foco visible enfoca desde arriba de la página, en el orden normal, y el QA
  midió el apagado (`opacity 0`, `visibility hidden`) como un acierto sin preguntarse qué pasa con el enlace después.

### `E4` · Dos anclas distintas para «Postúlate»: `#postulate` en la nav y `#postulacion` en la sección
- **Severidad:** Menor
- **Dueño:** orquestador
- **Evidencia:** `Nav.astro:8` y `tests/T01/t01.spec.ts:173,193` fijan `#postulate` (tarea T01, línea 89);
  `Productos.astro:18`, la tarea T04 (líneas 70 y 90) y `docs/1-PRODUCTO.md:98` fijan `#postulacion`. Cuando T07
  construya el formulario con un solo `id`, uno de los dos botones no bajará a ningún lado.
- **Por qué escapó:** el constructor cumplió el contrato de su tarea al pie de la letra; la contradicción está entre
  dos tareas del orquestador y ninguna compuerta compara anclas entre secciones. Hay que decidir un nombre antes
  de T07 y corregir la tarea (y la prueba) que quede del otro lado.

## Notas sin hallazgo

- Sin código acomodado a la prueba: no hay ramas por `navigator.webdriver` ni `data-*` escritos a mano;
  `data-modo` y `data-marco-listo` los pone `productos.ts` según medios y montaje real. Giros, pincel, ruido, DPR,
  scrub y pin salen de tokens; el ácido y el cobalto llegan al shader por uniform desde `tokens.css`.
- El QA tiene razón en sus cifras reproducibles (pin de 7560 a 9360, pie en 9744, DPR, respaldo). Su `H3` (sin
  pruebas propias) sigue en pie: E1–E3 son justo el tipo de cosa que una prueba de T04 atraparía; si el autor
  acepta convertir `qa-r1.mjs`/`qa-r1b.mjs` en regresión, conviene sumarle la pérdida de contexto y el `import()`
  abortado de `tmp/auditoria-a.mjs` y `auditoria-b.mjs` (esta vez sí se vieron fallar).
- E1 y E2 son del MVP y vuelven al constructor como `CORRECCION-r2.md` (§ 4.7), salvo que el orquestador juzgue que
  arreglarlos él cuesta menos que relanzar y lo anote en `PULIDO.md`.
