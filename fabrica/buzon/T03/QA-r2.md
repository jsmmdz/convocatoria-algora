VEREDICTO: NO PASA

# QA r2 — T03 · Hitos

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 19:57 (salida de `date`)
- **Fin:** 2026-11-10 20:08 (salida de `date`)
- **Intervenciones del autor:** 0

## Resumen

La función quedó bien: `H1` (etiquetas de color en el hito invertido) y `H3` (onda a tokens) están resueltos y los reproduje. Pero la compuerta de Playwright sale en ❌ y bloquea: el constructor dejó vivo un `astro preview --port 4392` (su barrido `tmp/r2.mjs`) y `astro preview` no deja arrancar un segundo servidor. Es un Crítico por regla (compuerta en ❌), con arreglo de un minuto, y el dueño es el constructor.

## Compuertas

`node fabrica/scripts/compuertas.mjs T03 --guardar` → **COMPUERTAS: ROJO**, 1 bloqueo, 0 avisos. Queda en `COMPUERTAS-r2.md`. Pasan: `archivos-propios` (4 cambiados), `fuera-de-alcance` (ninguno), `npm run check` (0 errores), `npm run build`, patrones (sin coincidencias), presupuestos (fuentes 168.748 B de 250.000; JS inicial 69.367 B gzip de 220.000). Falla `npx playwright test tests/comunes tests/T03 tests/T01 tests/T02 --reporter=line` con «código 1 · falta: passed».

**Causa, medida:** corrí `npx playwright test tests/T03` a mano y sale
`[WebServer] Another astro preview server is already running. URL: http://localhost:4392 PID: 57692` y `Error: Process from config.webServer was not able to start`. El PID 57692 es `astro.mjs preview --port 4392` (padre 60644, `cmd /c astro preview --port 4392`), exactamente el servidor que la entrega dice haber usado para `tmp/r2.mjs` («servidor en el 4392»). No es mío ni de las pruebas. La entrega r1 → r2 ya había tenido el mismo problema con el 4391 y lo había detenido; esta vez dejó el del 4392. `PUERTO_PRUEBAS=4393` no lo sortea: el bloqueo es de `astro preview` por proyecto, no por puerto. `capturas.mjs T03` tampoco arranca por lo mismo («astro preview no respondió en 30 s»).

Intenté detener ese proceso (está en el rango 4390–4399 de la regla 5) y el permiso me lo negó; no busqué otro camino. Lo dejo en `H1-r2` para que el constructor lo detenga (o el orquestador antes de lanzar la ronda).

**Reproducción de la suite sin el servidor propio.** Para no dejar la función sin medir, corrí las pruebas contra el servidor que ya estaba arriba (sirve `sitio/dist`, reconstruido por las compuertas hace minutos), con una configuración mía en `fabrica/buzon/T03/tmp/pw-qa.config.mjs` (mismas pruebas, mismos flags de GPU, sin `webServer`):

- `tests/T03`: 13 de 13 pasan (1,5 min).
- `tests/comunes tests/T01 tests/T02`: 44 de 44 pasan (3,0 min).

Esto **no sustituye** la compuerta (otra configuración, sin turno de pruebas); solo dice que el código está sano y que lo único que impide el verde es el servidor suelto. Sin avisos «reintento» que juzgar.

**Negaciones del hook (F17):** las líneas `negado` de `fabrica/datos/hook.jsonl` del constructor son una sola, del 2026-11-10 16:18 (T02, un `Write` en el scratchpad). Ninguna es de la r2 de T03 y la entrega no consiguió nada por otro camino. Las demás son del auditor-final (T02, 17:28) y mías de esta sesión (esta misma no cuenta). Sin rodeo que cruzar.

## Entregables

| Entregable | Estado | Evidencia |
|---|---|---|
| Contenido: cinco `<article data-hito>`, etiquetas mono, `<h2>` peso 300, bloque con palabra cursiva `aria-hidden` | Cumple | Prueba «contenido» en verde (mi corrida); `Hitos.astro`; capturas |
| Horizontal ≥ 1024: pin, pista 1:1, cada hito entero, la página sigue, CSS por defecto apilado | Cumple | Pruebas «horizontal a 1440/1280/1024» en verde; `tmp/r2-1280-light-h2.png`, `tmp/r2-1024-light-h5.png` (los abrí) |
| Fondos: 3 y 5 invertidos, titular ≥ 4,5:1, línea ≥ 3:1 | Cumple | Pruebas «fondos (claro/oscuro)» y «línea sobre fondo invertido» en verde |
| Línea punteada/sólida hasta la x del viajero, bloques por encima | Cumple | Prueba de píxeles en verde; `qa2-light-h3.png` (sólida a la izquierda del unicornio, punteada a la derecha, la línea pasa por detrás del bloque tomate) |
| Viajero en x fija, apoyado, 64–80 px | Cumple | Prueba de x fija en verde; las capturas muestran los cascos sobre el trazo |
| Inclinación K2 | Cumple | Prueba de ángulo en el tiempo en verde |
| Apilado (< 1024, reducido, sin JS) | Cumple | Pruebas de apilado y «sin JS» en verde |
| `ScrollTrigger.refresh()` al cargar fuentes y al cambiar tamaño | Cumple en el código, sin prueba | `hitos.ts` (`document.fonts.ready` y `refreshInit`); ya era `H5` del orquestador |
| Etiquetas «en color» en el hito invertido (A4b) | **Cumple (r1 `H1` resuelto)** | Medición abajo |
| Solo archivos propios | Cumple | `archivos-propios`: 4 cambiados; `fuera-de-alcance`: ninguno |
| Compuertas en verde | **No cumple** | `H1-r2` |

## Reproducción de las afirmaciones de la entrega

- **`H1`.** Medí con mi propio script (`tmp/qa2.mjs`, servidor 4392, 1440×900, scroll a cada uno de los cinco hitos) el color real de `[data-hito-etiquetas]` contra el fondo real del hito y su razón de contraste:
  - Claro: hitos 1, 2 y 4 `rgb(90, 85, 80)` sobre `rgb(246, 248, 251)` = 6,93:1; hitos 3 y 5 `rgb(209, 255, 34)` sobre `rgb(13, 13, 13)` = 16,69:1.
  - Oscuro: hitos 1, 2 y 4 `rgb(168, 163, 156)` sobre `rgb(13, 13, 13)` = 7,76:1; hitos 3 y 5 `rgb(44, 8, 255)` sobre `rgb(246, 248, 251)` = 7,63:1.
  - Coincide con lo que dice la entrega, todo ≥ 4,5:1. Consola sin errores en las dos corridas. Los hitos 1, 2 y 4 no cambiaron.
- **`H3`.** `tokens.css` trae `--linea-onda-peso-larga 0.65`, `--linea-onda-peso-corta 0.35`, `--linea-onda-fase-larga 0.6`, `--linea-onda-fase-corta 2.1`, `--linea-paso 8`: los literales de r1. `hitos.ts` los lee con `leerNumero` y todos los respaldos son `SIN_TOKEN = 1`. La onda de `qa2-light-h3.png` y la de `estado-hitos-2.jpg` son la misma de la r1 (valle a la izquierda, cima junto al unicornio, punteada que baja y sube hasta el bloque).
- **`H4`.** La entrega trae lectura propia de cuatro capturas y declara que no abrió las otras 16. Abrí `r2-1280-light-h2.png` y `r2-1024-light-h5.png`: lo que dice coincide (a 1280 el unicornio queda sobre el borde superior del bloque magenta, sin tocar «Equipo» ni el titular; a 1024 el hito 5 cabe entero, etiqueta, titular de dos líneas, bloque y palabra). Cumple lo pedido.
- **`H2`.** No tomado y declarado en Supuestos, con la razón. Sigue siendo un detalle del pulido (ver `H2-r2`).
- **Compuertas «VERDE» de la entrega.** Cierto en su corrida (yo reproduje 57 de 57 pruebas en verde), pero la entrega no dice que después dejó un servidor vivo en el 4392; con él abierto, la compuerta oficial no corre.

## Capturas

Las hojas de `capturas/comparacion/` y las capturas de `capturas/` son de las 19:52, posteriores a la última edición de `Hitos.astro`, `hitos.ts` y `tokens.css` (19:44), así que reflejan el código actual. **No pude correr `capturas.mjs` yo** (mismo servidor suelto); por eso abrí las hojas existentes y tomé yo capturas de los hitos 3 y 5 en los dos temas con mi script (`tmp/qa2-light-h3.png`, `tmp/qa2-dark-h5.png`). Si el constructor vuelve a correr `capturas.mjs` en la r3, las hojas se regeneran y quedan como evidencia propia.

## Lo que veo

Descripción de cada hoja de `capturas/comparacion/` (panel derecho, empieza en x = 904 de la hoja; 1440 px de pantalla ≈ 888 px de hoja).

**`unseen-A3.jpg` (hitos-2, 1440×900):** fondo papel casi blanco bajo la barra de navegación (y 40–78). A la izquierda un bloque magenta de x 904 a 1160 (recortado por el borde), con «ipo» en cursiva negra abajo (y ≈ 530). Un unicornio negro de unos 40 px de alto con los cascos en x ≈ 1185–1200, y ≈ 380, sobre la línea. A su izquierda, un tramo continuo negro que llega hasta el unicornio; a su derecha, la misma línea punteada, que sube a una cima en x ≈ 1450 (y ≈ 265) y baja hasta x ≈ 1630, donde empieza una banda negra que cubre hasta el borde derecho. En la banda, la línea punteada sigue en blanco. Arriba a la derecha, en x 1215, `[EQUIPO] [02/05]` en mono gris pequeño y el titular «Alguien de otra carrera la entiende mejor que tú.» en tres líneas de sans ligera negra (y ≈ 115–225). Abajo, dentro de la banda negra, `[USUARIOS] [03/05]` en **verde ácido** (x 1658, y ≈ 434) y «Gente q… conoces… que se l…» en blanco, cortado por el borde derecho.

**`unseen-A4.jpg` (hitos-1):** fondo papel. Un bloque ácido (verde amarillo) de x 1250 a 1642 y de y 90 a 378, con esquinas apenas redondeadas y «Idea» en serif cursiva negra gigante abajo a la izquierda (x 1272–1400, y ≈ 310–365). Un bloque magenta entra por la derecha desde x 1695, con «Eq» cortado. Línea negra continua que sube a una cima en x ≈ 1030, baja y llega al unicornio en x ≈ 1190 (y ≈ 295); desde ahí punteada, que baja hasta y ≈ 392 bajo el bloque ácido. Abajo a la izquierda, «de vivir» y «libreta.» en sans ligera negra, cortados por el borde izquierdo (x 904–1010); las etiquetas y el inicio del titular del hito 1 quedan fuera del cuadro.

**`unseen-A4b.jpg` (hitos-tinta):** a la izquierda, de x 904 a 1595, fondo tinta; a la derecha, banda papel. En la tinta, un bloque tomate (rojo) de x 1177 a 1568, y 90 a 378, con «Usuarios» en cursiva negra (x 1200–1460, y ≈ 310–365). El unicornio, con halo claro, pegado a la «U» (x ≈ 1170–1212, y ≈ 305–348). Línea blanca continua a su izquierda, ondulada, y punteada blanca que asoma a la derecha del bloque. Abajo a la izquierda, titular blanco cortado («e no / a usa sin / bidas.»). Un bloque cobalto con «Valor» cortado entra por la derecha sobre papel. Las etiquetas del hito 3 quedan fuera del cuadro; en mi captura `qa2-light-h3.png` (1440×900, mismo hito) se ven en x 44–202, y 639: `[USUARIOS] [03/05]` en verde ácido sobre tinta, y debajo el titular blanco en tres líneas (x 44–536, y 670–850).

**`unseen-A5.jpg` (hitos-2):** es el mismo cuadro que A3. El unicornio negro, de cascos sobre el trazo en x ≈ 1185–1200, tiene a su izquierda la línea continua y a su derecha la punteada. No hay mascota con ojos ni alas.

**Mis capturas a 1440×900, para el color del hito invertido.** `qa2-light-h3.png`: fondo tinta desde y 62 hasta el borde inferior; bloque tomate de x 763 a 1397, y 80 a 548, con «Usuarios» en negro (x 800–1222, y 430–525); unicornio con halo blanco en x 420–490, y 308–378, sobre una línea blanca continua a su izquierda y punteada a su derecha; titular blanco completo. `qa2-dark-h5.png`: fondo papel; bloque ácido de x 763 a 1397 con «Nombre» en negro; `[NOMBRE] [05/05]` en **cobalto** (x 44–184, y 702), titular negro en dos líneas completo, unicornio con halo oscuro sobre línea negra continua. Nada encimado ni cortado en ninguna de las dos.

## Contra el referente

| id | Aspecto | Qué se ve en el referente | Qué se ve en lo nuestro (de «Lo que veo») | Cumple |
|---|---|---|---|---|
| A3 | Sección en horizontal; hitos en fila unidos por línea ondulada fina; recorrido sólido, lo que falta punteado | Línea gris continua que pasa a punteada en el personaje; paneles grandes en fila | Línea negra continua hasta el unicornio y punteada después, que cruza hasta la banda tinta y sigue en blanco; bloques de color en fila | Sí |
| A4 | Etiquetas mono entre corchetes, titular de 2–4 líneas en sans ligera, panel grande al lado; algunos hitos oscuros | `[MOTION] [JAN_25]` en mono, titular de 4 líneas, panel con imagen | `[EQUIPO] [02/05]` en mono, titular de tres líneas en sans ligera, bloque ácido/magenta/tomate a sangre con esquinas apenas redondeadas; el hito 3 en tinta (y el 5 en tinta en claro). En hitos-1 las etiquetas quedan fuera del cuadro, pero se ven en hitos-2 y en mis capturas | Sí |
| A4b | Hito oscuro: etiquetas en color, titular en papel | Etiquetas rojas sobre fondo oscuro, titular blanco | `[USUARIOS] [03/05]` en verde ácido sobre tinta y titular blanco (hoja A3 y `qa2-light-h3.png`); en oscuro `[NOMBRE] [05/05]` en cobalto sobre papel | **Sí** (r1 `H1` resuelto) |
| A5 | El personaje va donde la sólida se vuelve punteada y se inclina con la velocidad | Personaje en la unión continua/punteada | Unicornio en la unión, cascos sobre el trazo; la inclinación la cubre la prueba de ángulo (el movimiento no se juzga en cuadro quieto) | Sí |

`no_se_toma`: no hay imagen o video en los paneles, ni «OPEN [+]», ni mascota con ojos y alas, ni mes gigante de celular; el titular va en Zalando Sans ligera. Ninguno aparece.

## Código

Sin fugas nuevas: el ticker se quita en `apagar` y en la limpieza del `matchMedia`; `refreshInit` y `document.fonts.ready` (con bandera `cancelada`) se liberan. Los valores de la onda salen de tokens; ningún literal de color fuera de `tokens.css` (el patrón `hex-suelto` sin coincidencias). `--etiqueta-invertida` está en los cuatro bloques de tema (claro, sistema oscuro, forzado oscuro, forzado claro), con el acento contrario al fondo invertido. Voseo: ninguno.

## Hallazgos

### `H1-r2` · La compuerta de Playwright sale en ❌ por un servidor suelto del constructor
- **Severidad:** Crítico
- **Dueño:** constructor
- **Archivo:** ninguno del repo; el proceso `astro preview --port 4392` (PID 57692, padre 60644) que dejó su barrido `fabrica/buzon/T03/tmp/r2.mjs`.
- **Evidencia:** `COMPUERTAS-r2.md`: ❌ `npx playwright test tests/comunes tests/T03 tests/T01 tests/T02` «código 1 · falta: passed». Corrida a mano: «Another astro preview server is already running … PID: 57692». La entrega lo dice de otro modo: «segunda corrida pasó» y no menciona que lo dejó vivo. Con el servidor sirviendo el build actual, las 57 pruebas pasan, así que el código está sano.
- **Regla:** reglas.md § 5 (compuertas en verde; un servidor suelto solo en 4390–4399 y se libera) y auditor.md (compuerta ❌ = Crítico).

### `H2-r2` · El viajero se pega a la palabra del bloque en algunos pasos
- **Severidad:** Menor
- **Dueño:** constructor
- **Archivo:** `sitio/src/components/Hitos.astro`
- **Evidencia:** `unseen-A4b.jpg`: el unicornio queda pegado a la «U» de «Usuarios». Declarado en Supuestos con razón válida: lo arregla la x o el tamaño del viajero, que la tarea deja al pulido. No bloquea y no hay nada que hacer en la ronda; pasa al pulido con el autor.
- **Regla:** informativo.

### `H3-r2` · Pruebas que no cubren requisitos de la tarea (arrastrado de r1 `H5`)
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/T03/t03.spec.ts`
- **Evidencia:** sigue sin haber prueba del contraste ≥ 3:1 del viajero sobre los dos fondos y los bloques, de que el ticker de la inclinación no trabaja fuera de pantalla, ni del refresco de ScrollTrigger al cargar fuentes y al cambiar el tamaño. En la imagen el halo hace que se lea en las capturas, pero no hay medición.
- **Regla:** auditor.md § 4. Es Menor: no frena la ronda.

## Escalado

No hay Crítico ni Mayor del orquestador: no se escribe `ESCALADO.md`. El Crítico lo arregla el constructor en `CORRECCION-r2.md`. Si el orquestador detiene antes el PID 57692, la r3 es solo volver a correr las compuertas.
