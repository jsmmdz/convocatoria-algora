VEREDICTO: PASA

# QA r3 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r3
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 12:17
- **Fin:** 2026-11-10 12:40
- **Intervenciones del autor:** 0

## Estado de los hallazgos de r2

| Hallazgo | Estado | Evidencia |
|---|---|---|
| H5 (apartado de piezas depende del scroll) | Corregido | `capas3d.ts:121`: `Math.max(0, leerNumero('--alto-nav', 64) - (origen.top + window.scrollY))`. Reproduje `node fabrica/buzon/T02/medir-h5.mjs`: a 1440 × 900 → 880 y 375 × 667 → 640, `scroll/control` por celda 0,85 1,00 0,99 0,85 1,08 0,71 y 0,80 1,00 0,90 1,05 1,13 0,74; presencia idéntica (`101111`) en reposo, control y scroll; «H5: MISMO RESULTADO CON Y SIN SCROLL». La celda del centro arriba en 0 es el hueco de las etiquetas, también en reposo. |
| H6 (hojas viejas `A1/A2/A3.jpg`, orquestador) | Sigue abierto, Menor | `ls capturas/comparacion` aún lista `A1.jpg`, `A2.jpg`, `A3.jpg` además de las seis con sitio. |
| H7 (tabletales A1 contra «nada encimado», orquestador) | Sigue abierto, Menor | Ver «Contra el referente». |
| H8 (sección de respuesta y medición repetible) | Corregido | `ENTREGA-r3.md` trae «Respuesta a CORRECCION-r2» y el script está en `fabrica/buzon/T02/medir-h5.mjs`; lo corrí y da lo que la entrega dice. |
| H3 (espacios del titular, Menor) | Sigue abierto, es del pulido | En `unseen-A2` se ve «sí» y «esta» cerrados. |

## Entregables

| Entregable de la tarea | Estado | Evidencia |
|---|---|---|
| 1 a 6 (mascota, precarga, portada, titular, `data-listo`, trama) | Cumple | Sin cambios desde r1; `tests/T02` y `tests/T01` en verde en `COMPUERTAS-r3.md`. Capturas de precarga, portada y trama-cursor abiertas (abajo). |
| 7. Capas 3D con Three diferido, ≥ 2 `[data-capa]`, `pieza()`, parallax, sin WebGL | Cumple | Pruebas verdes; JS inicial 68.003 B gzip. Apartado ya independiente del scroll (H5). |
| 8. Dependencias solo `ogl`, `three`, `@types/three` | Cumple | Sin cambios. |
| «Cuándo terminaste»: compuertas en VERDE | Cumple | `node fabrica/scripts/compuertas.mjs T02 --guardar` → VERDE, Bloquean 0, Avisos 0, sin «reintento». `fuera-de-alcance`: ninguno. Único cambio de la ronda: `sitio/src/lib/capas3d.ts`. |
| «Cuándo terminaste»: capturas corridas, nada encimado ni cortado | Cumple | `node fabrica/scripts/capturas.mjs T02` corrido; matriz de 19 tamaños generada. Abrí `375x667`; las 1440/1024/1180/etc. ya las había revisado en r2 y la ronda solo cambia el caso con scroll. 1280 × 720 sigue sin estar en la matriz (nota para el orquestador). |
| «Cuándo terminaste»: hojas «referente \| nuestro» | Cumple | Las seis hojas existen y las abrí. |

## Compuertas

COMPUERTAS: VERDE. Ningún ⚠️ que juzgar. Alcance limpio.

## Pruebas y reproducción

- No hay código acomodado a la prueba: el apartado calcula con rectángulos reales del DOM (`getBoundingClientRect`, `Range.getClientRects`); el arreglo solo cambia la referencia de la banda de la nav (de ventana a documento), lo que es la función correcta porque la nav es `position: fixed`.
- La medición de la entrega la reproduje con el mismo comando y sale igual (cifras de píxeles distintas por ±1 % porque las piezas giran, la proporción coincide).
- Lo que la tarea pide y ninguna prueba comprueba (para el orquestador, no hallazgo del constructor): H5 (cambio de tamaño con scroll) y el solape entre piezas y `[data-objeto]`/etiquetas. Hoy solo lo cubre el script del buzón y la captura.

## Lo que veo

Nuestro lado derecho de cada hoja de `capturas/comparacion/` (1440 × 900):

- **unseen-A1 (precarga).** Fondo casi negro `rgb(13,13,13)` en todo el cuadro; unicornio blanco de perfil, x ≈ 1308–1388, y ≈ 262–347; debajo `[74%]` mono diminuto blanco (y ≈ 367). Nada más.
- **unseen-A2 (trama-cursor).** Nav papel arriba (y 40–78), bloque cobalto a sangre debajo. Glifos `. $ 0 1 + = A L G O R` en papel tenue por todo el bloque; en x ≈ 960–1300, y ≈ 130–480 un remolino de filas curvas más grandes y densas (donde pasó el cursor), detrás del titular. Titular en dos líneas en DM Serif blanco, pastilla ácida con unicornio negro (x ≈ 1010–1140, y ≈ 340–398) a la izquierda de la segunda línea; tres etiquetas mono en y ≈ 230; octaedro magenta arriba a la izquierda (x ≈ 1000–1090, y ≈ 125–215), cubo ácido arriba a la derecha entero (x ≈ 1650–1745, y ≈ 100–185), ficha ácida cortada por el borde izquierdo abajo (x ≈ 905–950, y ≈ 455–595), cubo tinta (x ≈ 1198–1252, y ≈ 495–545), moneda tomate (x ≈ 1617–1722, y ≈ 462–512) y octaedro tomate abajo (x ≈ 1478–1560, y ≈ 545–595). Ninguna toca letras.
- **leadoff-A2 y leadoff-A3 (portada).** Cuadro estable de portada: cobalto `rgb(44,8,255)` a sangre, etiquetas centradas arriba, «¿Y si esta vez sí» y «lo haces *realidad?*» centradas en papel, pastilla ácida con el unicornio negro completa a la izquierda de la segunda línea, trama más tenue que en la otra hoja, seis piezas 3D en las franjas superior e inferior (octaedro magenta, cubo ácido, ficha, cubo tinta, moneda, octaedro tomate), ninguna sobre texto ni pastilla.
- **tabletales-A1 (portada).** Igual que el cuadro anterior: piezas repartidas arriba y abajo, titular y pastilla libres.
- **tabletales-A2 (portada-scroll 600 px).** «lo haces *realidad?*» en la parte alta bajo la nav, pastilla, el bloque cobalto termina en y ≈ 357; ficha ácida (x ≈ 910–970, y ≈ 238–357), cubo tinta (x ≈ 1205–1255, y ≈ 327–357) y moneda tomate (x ≈ 1630–1735, y ≈ 290–345) y octaedro tomate (x ≈ 1520–1585, y ≈ 322–357) recortados por el borde inferior del bloque. Debajo, bloque negro con «Semillero Algora · Creación Digital · Universidad El Bosque».
- **matriz/inicio/375x667.** Nav papel; octaedro magenta (x ≈ 30–98, y ≈ 122–183), cubo ácido cortado en el borde derecho (x ≈ 303–375, y ≈ 72–172); etiquetas en dos filas (y ≈ 214 y 241) enteras; titular en cuatro líneas visuales; pastilla ácida completa (x ≈ 43–141, y ≈ 397–441) antes de «lo haces»; ficha ácida en el borde izquierdo abajo, cubo tinta, moneda tomate (y ≈ 530) y octaedro tomate abajo; ninguna sobre texto.

## Contra el referente

| id | Aspecto | Qué se ve en el referente | Qué se ve en lo nuestro | Cumple |
|---|---|---|---|---|
| unseen A1 | Precarga sobre negro, mascota al centro, cuenta `[NN%]` debajo, pequeña y mono | Fondo casi negro, mascota con alas pequeña al centro, `[93%]` mono diminuto | Fondo `rgb(13,13,13)`, unicornio blanco al centro, `[74%]` mono diminuto debajo | Cumple |
| unseen A2 | Trama de caracteres en toda la portada, más densa en una figura central, detrás del titular, deformada por el cursor | Glifos en todo el cuadro, más densos en el centro, titular amarillo encima | Glifos en papel tenue por todo el bloque, remolino de glifos mayores y más densos donde pasó el cursor, detrás del titular | Cumple (figura y opacidad son del pulido) |
| leadoff A2 | Bloque a sangre de un solo color saturado, titular enorme centrado en dos líneas, pieza redondeada entre las palabras | Azul plano, dos líneas centradas, foto redondeada al inicio de la segunda línea | Cobalto a sangre, dos líneas centradas, pastilla ácida completa al inicio de la segunda línea | Cumple |
| leadoff A3 | Líneas suben, pieza crece desde cero | Cuadro azul sin contenido (mitad de la entrada) | Estado final de la portada | Cumple por las pruebas de serie (movimiento no se juzga en un cuadro quieto) |
| tabletales A1 | Piezas delante y detrás de las letras, repartidas alrededor | Figuras que se montan sobre las letras, por delante y por detrás | Seis piezas repartidas arriba y abajo en dos capas (delante y detrás del contenido); ninguna cruza una letra | Cumple en estructura; ver H7 |
| tabletales A2 | Al bajar, cada capa se mueve más lento y a su propia velocidad | Capa que se queda atrás | A 600 px las piezas quedan más abajo que el texto, recortadas por el borde del bloque; prueba de parallax con razones distintas en verde | Cumple |

No aparece nada de `no_se_toma`.

## Hallazgos

### `H6` · Hojas viejas `A1.jpg`, `A2.jpg`, `A3.jpg` en `comparacion/`
- **Severidad:** Menor
- **Dueño:** orquestador
- **Evidencia:** `ls fabrica/buzon/T02/capturas/comparacion` las lista junto a las seis hojas nuevas; `A2.jpg` es de tabletales y confunde.

### `H7` · Contradicción entre el aspecto tabletales A1 y «nada encimado»
- **Severidad:** Menor
- **Dueño:** orquestador
- **Evidencia:** `T02.json` pide piezas delante y detrás de las letras; la tarea (con la orden de r1) pide que ninguna cubra el texto. Hoy ninguna cruza una letra. Se decide en el pulido. Se mantiene en Menor porque el constructor aplicó la orden vigente y las piezas sí están en dos capas, delante y detrás del contenido.

### `H3` · Espacios del titular cerrados
- **Severidad:** Menor
- **Dueño:** constructor (pulido)
- **Evidencia:** en `unseen-A2`, «sí» y «esta» casi pegados. Del andamio de T01; para el pulido.

No hay hallazgos Críticos ni Mayores.
