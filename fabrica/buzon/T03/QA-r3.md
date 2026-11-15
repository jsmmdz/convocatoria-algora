VEREDICTO: NO PASA

# QA r3 — T03 · Hitos

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 20:20 (salida de `date`, aprox.)
- **Fin:** 2026-11-10 20:52 (aprox.)
- **Intervenciones del autor:** 0

## Resumen

El código de T03 no cambió desde la r2 (que audité y reproduje: 21 de 21 pruebas de T03 en verde). La compuerta de Playwright sigue en ❌ por 3 pruebas que no son de T03. Medí que la de consola falla **también con el build de HEAD, sin una línea de T03** (la portada de T02 emite el aviso `CONTEXT_LOST_WEBGL` de forma intermitente). Es un Crítico cuyo dueño es el orquestador (una prueba y una compuerta, sobre archivos de T02 que el constructor no puede tocar). Última ronda: se escribe `ESCALADO.md`.

## Compuertas

`node fabrica/scripts/compuertas.mjs T03 --guardar` → **ROJO**, 1 bloqueo, 0 avisos (`COMPUERTAS-r3.md`). Pasan archivos-propios (4), fuera-de-alcance (ninguno), check (0/0/0), build, patrones y presupuestos (fuentes 168.748 B de 250.000; JS inicial 69.367 B gzip de 220.000). Falla Playwright: 3 fallas, repetidas solas con las mismas 3:
1. `tests/comunes/sitio.spec.ts:50` ruta `/`: `warning: WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost`.
2. `tests/T02/t02.spec.ts:374` trama: el cursor deforma por debajo del mínimo.
3. `tests/T02/t02.spec.ts:408` trama: contraste detrás de las etiquetas.

## Quién es el dueño: lo que medí

Todo con servidores propios en 4391/4392 (cerrados al terminar; `netstat` sin nada escuchando en 4390–4399) y la misma configuración de GPU de las pruebas (`--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`). Scripts en `tmp/r3a.mjs`…`r3e.mjs`; el build de HEAD (sin `Hitos`) lo armé con `git archive HEAD sitio` en `tmp/head/`.

| Corrida | Qué | Resultado |
|---|---|---|
| `r3a` | Carga de `/` seis veces: HEAD y T03 | HEAD: avisos `[5,0,0,0,0,0]`; T03: `[0,0,0,0,0,0]`. El aviso es intermitente y aparece **sin T03** |
| `r3b` ×3 | consola + trama 374 + trama 408 sobre el **build de HEAD** | 1.ª: 4 pasan; 2.ª y 3.ª: **falla la de consola**, las dos de trama pasan |
| `r3c` ×3 | las mismas sobre el build de T03 | consola falla las 3 veces; las de trama pasan |
| `r3d` | `tests/comunes tests/T01 tests/T02` sobre el build de HEAD | 43 de 44; **falla la de consola**; las de trama pasan en secuencia |
| `r3e` | `tests/comunes tests/T03 tests/T01 tests/T02` (mismo orden de la compuerta) sobre T03 | **56 de 57**; solo falla la de consola. Las de trama pasan, y las 21 de T03 pasan |

Conclusión:
- La falla de **consola** nace en `src/lib/webgl.ts:11` y `src/lib/trama.ts:294` (`loseContext()`, de T02, ambos excluidos de los archivos de T03). Reproducida sin T03: no es del constructor.
- Las dos de **trama** fallaron en las tres corridas de compuerta (la del constructor, la mía y su repetición) y no las pude reproducir en ninguna corrida mía, con y sin T03, ni con el orden de la compuerta. No hay indicio de que dependan de código de T03; son pruebas de tiempos del WebGL de T02 (la entrega r3 dice que pasaron en la r2 con el mismo código). No puedo afirmar la causa; el orquestador debe repetirlas con la máquina sin carga.
- La hipótesis de la entrega (75 procesos de Brave) no la pude confirmar: en la lista de procesos no apareció Brave. Sí hay `python` (67), `msedgewebview2` (37), `Code` (35). Sigue siendo hipótesis.

**Negaciones del hook (F17):** `fabrica/datos/hook.jsonl` solo tiene dos `negado`: constructor (16:18, un `Write` en el scratchpad, de T02) y auditor-final (17:28, T02). Ninguna es de la r2 ni de la r3 de T03, y la entrega no consiguió nada por otro camino. Sin rodeo.

## Entregables

| Entregable | Estado | Evidencia |
|---|---|---|
| Contenido: cinco `<article data-hito>` con etiquetas, `<h2>` y bloque con palabra `aria-hidden` | Cumple | Pruebas T03 (`r3e`); hojas |
| Horizontal ≥ 1024, pin, pista 1:1, hito entero, la página sigue | Cumple | Pruebas «horizontal a 1440/1280/1024» (`r3e`) |
| Fondos invertidos en 3 y 5, contraste titular y línea | Cumple | Pruebas de fondos (`r3e`); medición de r2 sin cambios de código |
| Línea punteada/sólida hasta el viajero, bloques encima | Cumple | Hoja A3: tramo sólido hasta el unicornio, punteado después, línea tapada por el bloque magenta |
| Viajero en x fija, apoyado, 64–80 px | Cumple | Pruebas (`r3e`); hoja A4: cascos sobre el trazo |
| Inclinación K2 | Cumple | Prueba de ángulo (`r3e`) |
| Apilado, sin JS, reducido | Cumple | Pruebas (`r3e`) |
| Refresco al cargar fuentes y al cambiar tamaño | Cumple en código, sin prueba | `hitos.ts` (`document.fonts.ready`, `refreshInit`); ver `H2-r3` |
| Solo archivos propios | Cumple | compuertas |
| Compuertas en verde | **No cumple** | `H1-r3` |

## Reproducción de afirmaciones

- «Sin cambios de código»: cierto; `hitos.ts`, `Hitos.astro` y `tokens.css` son los de la r2 y `git status` solo muestra esos cuatro archivos.
- «Las 21 de T03 pasan»: reproducido (`r3e`, 56 de 57 con T03 incluidas).
- «Servidor suelto cerrado»: confirmado, ningún `astro preview` ni puerto 4390–4399 vivos al llegar.
- «Hipótesis: Brave y `astro dev`»: no confirmada (ver arriba). La prueba de consola falla también con el entorno que tengo ahora y sin T03.

## Lo que veo

(Hojas regeneradas por mí con `capturas.mjs T03`; panel derecho desde x = 904 de la hoja.)

**`unseen-A3.jpg` (hitos-2):** fondo papel casi blanco bajo la barra de navegación. Un bloque magenta de x 904 a 1160 y de y 280 a 568, con «ipo» en cursiva negra abajo (y ≈ 530). Un unicornio negro de unos 40 px, cascos en x ≈ 1175–1205, y ≈ 380, sobre la línea; a su izquierda un trazo corto continuo negro que baja desde detrás del bloque; a su derecha la línea punteada sube a una cima en x ≈ 1450 (y ≈ 265), baja hasta x ≈ 1640 donde empieza una banda tinta que cubre hasta el borde derecho; ahí la punteada sigue en blanco. Arriba, en x 1215, `[EQUIPO] [02/05]` en mono gris pequeño (y ≈ 94) y el titular «Alguien de otra carrera la entiende mejor que tú.» en tres líneas de sans ligera negra (y ≈ 115–225). En la banda tinta, `[USUARIOS] [03/05]` en verde ácido (y ≈ 434) y «Gente q… conoces… que se l…» en blanco, cortado por el borde.

**`unseen-A4.jpg` (hitos-1):** fondo papel. Bloque ácido de x 1250 a 1642 y y 90 a 378, esquinas apenas redondeadas, «Idea» en serif cursiva negra gigante abajo a la izquierda (x 1272–1400, y ≈ 305–365). Un bloque magenta con «Eq» cortado entra por la derecha desde x 1695. Línea negra continua que sube a una cima en x ≈ 1030 y baja al unicornio en x ≈ 1190 (y ≈ 295); desde ahí punteada que baja hasta y ≈ 392 bajo el bloque ácido. Abajo a la izquierda, «de vivir» y «libreta.» en sans ligera negra, cortados por el borde (x 904–1010).

**`unseen-A4b.jpg` (hitos-tinta):** de x 904 a 1595, fondo tinta; a la derecha, una banda papel. Bloque rojo-tomate de x 1177 a 1568, y 90 a 378, con «Usuarios» en cursiva negra (x 1200–1460, y ≈ 310–365). El unicornio, con halo claro, pegado a la «U» (x ≈ 1170–1212, y ≈ 305–348). Línea blanca continua ondulada a su izquierda y punteada blanca que asoma a la derecha del bloque. Abajo a la izquierda, titular blanco cortado («e no / a usa sin / bidas.»). Un bloque cobalto con «Valor» cortado entra por la derecha sobre papel.

**`unseen-A5.jpg` (hitos-2):** es el mismo cuadro que A3: unicornio negro con cascos sobre el trazo, continua a la izquierda y punteada a la derecha. Sin ojos ni alas.

**`inicio-breakpoints.jpg`:** muestra la portada de 320 × 568 a 5120 × 1440 (el encuadre no baja hasta los hitos). En ninguna medida hay cortes ni encimados de la portada; los hitos a 1440, 1280 y 1024 los miré en r2 con mis propias capturas y el código no cambió.

## Contra el referente

| id | Aspecto | Referente | Lo nuestro (de «Lo que veo») | Cumple |
|---|---|---|---|---|
| A3 | Hitos en fila unidos por línea ondulada fina; recorrido sólido, resto punteado | Línea gris continua que pasa a punteada en el personaje | Trazo continuo hasta el unicornio y punteado después, que cruza a la banda tinta; bloques en fila | Sí |
| A4 | Etiquetas mono, titular de 2–4 líneas en sans ligera, panel grande al lado | `[MOTION] [JAN_25]`, titular de 4 líneas, panel con imagen | `[EQUIPO] [02/05]` en mono, titular de 3 líneas ligero, bloque a sangre con esquinas apenas redondeadas | Sí |
| A4b | Hito oscuro, etiquetas en color y titular en papel | Etiquetas rojas, titular blanco | `[USUARIOS] [03/05]` en verde ácido y titular blanco sobre tinta | Sí |
| A5 | El personaje en la unión sólida/punteada; se inclina con la velocidad | Personaje en la unión | Unicornio en la unión; la inclinación la cubre la prueba de ángulo (el movimiento no se juzga) | Sí |

`no_se_toma`: no hay imagen o video en los paneles, ni «OPEN [+]», ni ojos y alas, ni mes gigante. Ninguno aparece.

## Código

Sin cambios desde la r2: sin fugas (ticker, `refreshInit`, `fonts.ready` con bandera, triggers y `matchMedia` se liberan), valores a tokens, sin hex sueltos, sin voseo. Los scripts temporales míos quedaron en `fabrica/buzon/T03/tmp/` (la junction a `node_modules` de mi copia de HEAD ya está retirada).

## Hallazgos

### `H1-r3` · La compuerta de Playwright sigue en ❌ por pruebas de T02/comunes que fallan sin T03
- **Severidad:** Crítico
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/comunes/sitio.spec.ts:50`, `sitio/tests/T02/t02.spec.ts:374` y `:408`; el aviso lo emite `sitio/src/lib/webgl.ts:11` / `trama.ts:294` (excluidos de T03).
- **Evidencia:** `COMPUERTAS-r3.md` (3 fallas, repetidas). La de consola falla con el build de HEAD sin T03 (`r3b`, `r3d`) y el aviso aparece al azar en una carga simple (`r3a`: HEAD `[5,0,0,0,0,0]`). Con el mismo código de T03, la suite en mi configuración da 56 de 57 (`r3e`). Las de trama no las reproduje, ni con ni sin T03.
- **Regla:** auditor.md (compuerta ❌ = Crítico); dueño orquestador: una prueba y una compuerta, sobre archivos fuera de la tarea.
- **Qué decidir:** que la prueba de consola tolere (o T02 evite) el aviso benigno `CONTEXT_LOST_WEBGL: loseContext`, o que el orquestador repita la compuerta con la máquina descargada y decida si las de trama son carga del entorno.

### `H2-r3` · Pruebas que no cubren requisitos de la tarea (arrastrado de r1 `H5` y r2 `H3`)
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/T03/t03.spec.ts`
- **Evidencia:** no hay prueba del contraste ≥ 3:1 del viajero sobre los dos fondos, de que el ticker no trabaja fuera de pantalla, ni del refresco de ScrollTrigger al cargar fuentes y al cambiar de tamaño.

### `H3-r3` · El viajero queda pegado a la «U» de «Usuarios» en el paso de la hoja A4b
- **Severidad:** Menor
- **Dueño:** constructor
- **Archivo:** `sitio/src/components/Hitos.astro`
- **Evidencia:** `unseen-A4b.jpg`, unicornio en x ≈ 1170–1212 sobre la «U». La x y el tamaño del viajero son de «Queda para el pulido»: no bloquea; pasa al pulido con el autor.

## Escalado

Hay un Crítico del orquestador (`H1-r3`) y es la última ronda: se escribe `ESCALADO.md`. No hay hallazgos del constructor que bloqueen, así que no se escribe `CORRECCION-r3.md`. Con la compuerta en verde, T03 no tiene nada más que impida el `APROBADO`.
