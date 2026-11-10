VEREDICTO: NO PASA

# QA r1 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 11:31
- **Fin:** 2026-11-10 11:36
- **Intervenciones del autor:** 0

## Entregables

| Entregable de la tarea | Estado | Evidencia |
|---|---|---|
| 1. Mascota provisional (`Mascota.astro`, `data-mascota`, `aria-hidden`, `fill: currentColor`, tamaño por token) | Cumple | Leído el componente; usado en `Precarga.astro` y en el objeto de `Portada.astro`; `--mascota-tam` en `tokens.css`. Se ve en `estado-precarga.jpg` y en la pastilla. |
| 2. Precarga: tinta, mascota al centro, `[NN%]`, 0→~90 en 1,5 s, 100 solo con `load`, fundido ≤ 0,4 s, respaldo CSS, nunca con movimiento reducido | Cumple | `estado-precarga.jpg`: fondo `rgb(13,13,13)`, unicornio centrado (x 657–783, y 360–497), `[75%]` en y = 530. Pruebas de la serie (cuenta, duración, respaldo CSS, reducido, sin JS) en verde en mi corrida. Código en `portada.ts:14-72` y `Precarga.astro`. |
| 3. Portada `section[data-portada]` cobalto a sangre, ≥ 1 pantalla | Cumple | Prueba en los tres modos del tema en verde; captura 1440 × 900. |
| 4. Titular: un `h1`, dos `[data-linea]` con un solo hijo, entrada leadoff K1, objeto, etiquetas, `marcarListo()` al final | Cumple | Pruebas de entrada y titular en verde. Constantes 0,6 s / 0,05 s / 0,8 s leídas de tokens (`portada.ts:75-86`). |
| 5. `data-listo` al terminar la entrada; respaldo de 3,5 s intacto | Cumple | `listo.ts`: `conPrecarga` + `setTimeout(marcarListo, 3500 − performance.now())`. Prueba de que `data-listo` llega con la portada ya entrada, en verde. |
| 6. Trama OGL: rejilla, atlas de glifos, quieta sin cursor, el cursor la deforma, solo redibuja con movimiento, colores por `getComputedStyle` | Cumple | `trama.ts` leído (rAF solo con huellas, `liberar()` completo). `estado-trama-cursor.jpg` muestra el remolino de glifos. Prueba de trama en verde. |
| 7. Capas 3D con Three diferido, ≥ 2 `[data-capa]` con canvas, `pieza()`, parallax, sin WebGL sin error | Cumple con reserva | Pruebas 3D, parallax y sin WebGL en verde. `pieza()` es la única vía. **Reserva: H1** (las piezas del frente se montan sobre la pastilla y las etiquetas). |
| 8. Dependencias solo `ogl`, `three`, `@types/three` | Cumple | `git diff sitio/package.json`: solo esas tres. |
| «Cuándo terminaste»: a 1440, 1280 y 1024 nada encimado ni cortado | **No cumple** | `matriz/inicio/1024x768.jpg`: ver H1. |
| «Cuándo terminaste»: hojas «referente \| nuestro» de cada estado de la ficha | **No cumple** | Faltan 3 de 6 hojas: ver H2. |

## Compuertas

`node fabrica/scripts/compuertas.mjs T02 --guardar` → **COMPUERTAS: VERDE**, Bloquean 0, Avisos 0 (guardado en `COMPUERTAS-r1.md`). Sin ⚠️ y sin «reintento»: nada que juzgar. La corrida de las pruebas de `comunes`, `T02` y `T01` pasó entera, igual que dice la entrega.

Verificación del hook (nota del orquestador en `T01/AUDITORIA-FINAL.md`, «por verificar en T02»): `fabrica/datos/hook.jsonl` tiene 72 llamadas del agente `constructor` (44 Bash, 21 Read, 3 Write permitidos, 1 Edit, 1 Glob) y 1 `Write` negado (un archivo fuera del repo, en el scratchpad). El hook sí se disparó. No vi comandos de git porque el registro no guarda el comando; la entrega no cita ninguno.

## Pruebas y capturas

Las pruebas de `sitio/tests/T02/t02.spec.ts` cubren: precarga (centrado, serie de la cuenta, duración, fin antes de 3,5 s), entrada por líneas y crecimiento del objeto, cobalto en tres modos, titular accesible, trama quieta/deformada por píxeles, Three diferido y piezas visibles, parallax por razón de movimiento, movimiento reducido, sin WebGL, respaldo CSS y sin JS. Cubren todo «Qué construyes» salvo lo siguiente, que **ninguna prueba comprueba**:

- Que las piezas 3D no tapen la pastilla ni las etiquetas (lo pide «Cuándo terminaste» a 1440, 1280 y 1024; solo se ve en la captura). Va en H1.
- Que `[data-capa]` de atrás quede realmente detrás del `h1` y la de delante delante (la prueba solo cuenta capas). Por CSS sí: `--capa-atras: 1`, contenido 2, `--capa-delante: 3`. No es hallazgo.

No encontré código acomodado a la prueba: `data-listo` lo ponen el final de la timeline o el respaldo por tiempo; la cuenta sale de un `gsap.to` sobre un objeto; no hay estado escrito en `data-*`.

Capturas vistas (`node fabrica/scripts/capturas.mjs T02`): `estado-precarga`, `estado-trama-cursor`, `inicio-1440-reducido`, `inicio-breakpoints`, `inicio-telefonos`, `inicio-acostado-tablet`, `matriz/inicio/1024x768`, y las hojas `comparacion/A1`, `A2`, `A3`.

## Lo que veo

Descripción de lo nuestro antes de comparar. Las hojas que existen son A1 (tabletales), A2 (tabletales con scroll) y A3 (leadoff); las demás no se generaron (H2), así que describo directamente los estados `estado-*.jpg`.

- **`comparacion/A1` (estado portada, 1440 × 900).** Bloque cobalto (`rgb(44,8,255)`) a sangre bajo la nav papel. Etiquetas mono en papel en y ≈ 308, centradas. Titular en dos líneas en DM Serif: «¿Y si esta vez sí» (y 360–450, x 360–1085) y «lo haces *realidad?*» (y 470–570, x 415–1280). Pastilla ácida con el unicornio negro a la izquierda de la segunda línea (x 172–385, y 484–580). Piezas 3D alrededor, ninguna sobre las letras: cubo ácido arriba a la derecha (x 1140–1380, y 70–315), octaedro magenta arriba a la izquierda (x 160–320, y 195–335), ficha ácida a la izquierda (x 0–135, y 500–705) casi tocando la pastilla, moneda tomate a la derecha (x 1157–1328, y 655–740), cubo tinta (x 358–430, y 698–778) y octaedro rojo abajo (x 925–1040, y 800–900). Trama de glifos `. $ 0 1 + = A L G O R` en papel tenue, de densidad casi pareja en todo el bloque.
- **`comparacion/A2` (portada tras bajar 600 px).** Se ve el final de la portada: «lo haces *realidad?*» cortado arriba por la nav, la pastilla, la ficha ácida a la izquierda, el cubo tinta y la moneda tomate un poco más abajo respecto al texto que en la primera foto; el bloque cobalto termina en y ≈ 357 y debajo hay un bloque negro con «Semillero Algora · Creación Digital · Universidad El Bosque».
- **`comparacion/A3` (estado portada).** Es el mismo cuadro de A1: titular completo, pastilla en su tamaño, ya sin movimiento de entrada (la captura se toma con la entrada terminada).
- **`estado-precarga.jpg` (1440 × 900).** Fondo `rgb(13,13,13)` en toda la pantalla; unicornio en papel centrado (x 657–783, y 360–497), debajo `[75%]` en mono pequeño en y = 530. Nada más en pantalla.
- **`estado-trama-cursor.jpg` (barrido de (200,300) a (520,620)).** Alrededor de x 120–700, y 140–840 los glifos se arremolinan: filas curvas de letras `ALGORA` más grandes y densas que en el resto, que sigue en el reposo tenue. El resto de la portada (titular, piezas, pastilla) igual que en reposo.
- **`matriz/inicio/1024x768.jpg`.** La ficha ácida (x 0–135, y 420–590) **tapa el extremo izquierdo de la pastilla** (la pastilla va de x ≈ 100 a 248; se ve el unicornio y el lado derecho redondeado). Ficha y pastilla son del mismo ácido y se funden en una sola mancha.
- **`inicio-breakpoints` y `inicio-acostado-tablet`.** A 1180 × 820 y 1024 × 768 el mismo cruce ficha/pastilla. A 844 × 390 la ficha también tapa el extremo izquierdo de la pastilla. A 667 × 375 el cubo ácido (arriba a la derecha) cubre el final de «[CONVOCATORIA_27]» y el octaedro magenta se mete sobre «[SEMILLERO». A 360 × 780 y 375 × 667 la ficha toca el lado izquierdo de la pastilla. A 320 × 568 el cubo tinta queda detrás de las letras «re» de «realidad?».

## Contra el referente

Una hoja por aspecto debería existir; solo existen 3 de 6 (H2). Para los demás comparé el estado nuestro con la captura original del referente (`referentes/capturas/…`), que sí abrí.

| id | Aspecto | Qué se ve en el referente | Qué se ve en lo nuestro | Cumple |
|---|---|---|---|---|
| unseen A1 (sin hoja, H2) | Precarga sobre negro, mascota al centro, `[93%]` debajo, pequeña, monoespaciada | `unseen-01-entrada-1440.jpg`: fondo casi negro, mascota con alas al centro (x 657–782, y 390–442), `[93%]` en y = 508, mono pequeño | `estado-precarga.jpg`: fondo tinta, unicornio al centro (x 657–783, y 360–497), `[75%]` en y = 530, mono pequeño | Cumple |
| unseen A2 (sin hoja, H2) | Trama que cubre la portada, más densa en una figura central, detrás del titular; el cursor la deforma | `unseen-02-titular-1440.jpg`: glifos en todo el cuadro con una figura central más densa y brillante, titular amarillo encima | `inicio-1440-reducido.jpg` y `estado-trama-cursor.jpg`: glifos en todo el bloque, detrás del titular; el cursor produce un remolino con letras más densas. En reposo la figura central casi no se nota (densidad pareja) | Cumple (la figura exacta es del pulido) |
| leadoff A2 (sin hoja, H2) | Bloque a sangre de un solo color saturado, titular enorme centrado en dos líneas, pieza redondeada entre las palabras | `leadoff-scroll-00.jpg`: azul plano, dos líneas centradas, foto redondeada al inicio de la segunda línea | `comparacion/A1` / `A3`: cobalto a sangre, dos líneas centradas, pastilla ácida redondeada al inicio de la segunda línea | Cumple |
| leadoff A3 | Las líneas suben y la pieza crece desde cero | `leadoff-02.jpg`: cuadro azul sin contenido (fotograma de mitad de entrada) | `comparacion/A3`: estado final. La entrada se juzga por las pruebas de serie, que pasan (líneas desde ≥ 0,5 de alto, objeto desde ≤ 15 % de su ancho) | Cumple (movimiento: no se juzga en cuadro quieto) |
| tabletales A1 | Piezas delante y detrás de las letras del titular, repartidas alrededor | `comparacion/A1`: figuras que se montan sobre las letras y salen por delante y por detrás | `comparacion/A1`: seis piezas repartidas alrededor en dos capas (z de 1 y 3 contra contenido en 2); ninguna toca las letras. Sí se montan sobre la pastilla y, a 667 × 375, sobre las etiquetas | Cumple en estructura; el solape con letras es de posición (pulido); el solape con la pastilla y las etiquetas es H1 |
| tabletales A2 | Al bajar, cada capa va más lento que la página y a su ritmo | `tabletales-02.jpg` (capa que se queda atrás) | `comparacion/A2`: las piezas quedan más abajo que el texto tras bajar 600 px. Prueba de parallax en verde con razones distintas (0,68 y 0,88 según la entrega; la prueba exige ≥ 0,05 de diferencia) | Cumple |

No aparece nada de `no_se_toma`: mascota sin alas ni UNSEEN en la trama, fondo cobalto (no negro), titular en DM Serif (no condensada), sin foto, sin intro palabra por palabra.

## Hallazgos

### `H1` · Las piezas del frente se montan sobre la pastilla y las etiquetas
- **Severidad:** Mayor
- **Dueño:** constructor
- **Archivo:** `sitio/src/lib/capas3d.ts:71-75` (posiciones de `DELANTE`) y `:142-143` (escala)
- **Evidencia:** `fabrica/buzon/T02/capturas/matriz/inicio/1024x768.jpg`: la ficha ácida (x 0–135, y 420–590) tapa el extremo izquierdo de la pastilla ácida (x ≈ 100–248, y 430–510); al ser del mismo color se funden y la pastilla deja de leerse como pieza redondeada. Igual en 1180 × 820, 844 × 390 y, rozando, a 1440 (ficha hasta x = 135, pastilla desde x = 172) y a 360/375 px. A 667 × 375 el cubo ácido cubre el final de «[CONVOCATORIA_27]» y el octaedro magenta se mete sobre «[SEMILLERO».
- **Regla:** tarea, «Cuándo terminaste»: «a 1440, 1280 y 1024 nada encimado ni cortado». Mover piezas de sitio no es «pulido» cuando están tapando contenido: el pulido es el ajuste fino de posición, no que no se tape el texto. La entrega lo reconoce solo para celular acostado y dice que a 1024 no hay nada encimado: la captura lo desmiente.

### `H2` · Las hojas de comparación se pisan: faltan 3 de 6 aspectos de `se_toma`
- **Severidad:** Mayor
- **Dueño:** orquestador
- **Archivo:** `fabrica/scripts/capturas.mjs:228` (`join(dirComp, `${a.id}.jpg`)`) y `fabrica/proyecto/referentes/T02.json` (ids repetidos entre sitios)
- **Evidencia:** `T02.json` tiene seis aspectos con ids `A1, A2` (unseen), `A2, A3` (leadoff) y `A1, A2` (tabletales). El script escribe `comparacion/<id>.jpg` sin el sitio, así que cada hoja pisa a la anterior. `ls fabrica/buzon/T02/capturas/comparacion` → `A1.jpg A2.jpg A3.jpg`, y la salida de `capturas.mjs` repite «A1», «A2» y «A2». Las hojas de unseen A1, unseen A2 y leadoff A2 no existen. El script no avisó con ⚠.
- **Regla:** rol del auditor § 4b.4: «una hoja que falta es Mayor: sin la imagen no hay evidencia». El constructor no puede arreglarlo (el script y la ficha no son de su tarea; no puede cambiar los ids sin romper la numeración del mapa). Cubrí el hueco con las capturas de los estados y las originales del referente, pero la evidencia que la fábrica exige queda incompleta.

### `H3` · Un detalle del titular: espacios entre palabras muy cerrados
- **Severidad:** Menor
- **Dueño:** constructor (pulido)
- **Evidencia:** en `estado-trama-cursor.jpg`, «lo haces» y «si esta vez» quedan con el espacio casi cerrado («lohaces», «siesta»). Viene del interlineado y espaciado del `h1` en `global.css`/`tokens.css`, que son del andamio. Anotado para el pulido, no bloquea.

### `H4` · Valores de la escena 3D como literales en el módulo
- **Severidad:** Menor
- **Dueño:** constructor
- **Archivo:** `sitio/src/lib/capas3d.ts:49-52, 66-75, 143, 152-153`
- **Evidencia:** distancia de cámara, campo de visión, posiciones, tamaños de geometría, rugosidad y la escala `0.4 + 0.6 * k` están escritos en el código. Los colores y la intensidad de movimiento sí salen de tokens. La regla 5 pide tokens para «todo valor de diseño»; aquí son parámetros de escena y la tarea los deja en pulido, así que no bloquea. Conviene agruparlos en una constante nombrada al principio del módulo al corregir H1.
