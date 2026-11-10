VEREDICTO: NO PASA

# QA r2 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r2
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 11:58
- **Fin:** 2026-11-10 12:05
- **Intervenciones del autor:** 0

## Estado de los hallazgos de r1

| Hallazgo | Estado | Evidencia |
|---|---|---|
| H1 (piezas sobre la pastilla y las etiquetas) | Corregido en reposo; queda un defecto nuevo en la misma función (H5 abajo) | Capturas de r2 en `matriz/inicio/` a 1440, 1180, 1024, 844, 667, 375, 320 y 1366 × 650: pastilla completa, etiquetas enteras, ninguna pieza sobre el titular. |
| H2 (hojas pisadas, del orquestador) | Resuelto | `ls capturas/comparacion` → `unseen-A1`, `unseen-A2`, `leadoff-A2`, `leadoff-A3`, `tabletales-A1`, `tabletales-A2`. Las seis existen. Quedan `A1.jpg`, `A2.jpg`, `A3.jpg` viejas de la r1 (H6). |
| H3 (espacios del titular, Menor) | Sigue abierto, no se pidió | — |
| H4 (literales de escena, Menor) | Corregido | Constantes nombradas en `capas3d.ts:59-86`. |

## Entregables

| Entregable de la tarea | Estado | Evidencia |
|---|---|---|
| 1 a 6 (mascota, precarga, portada, titular, `data-listo`, trama) | Cumple | Sin cambios desde r1 (la r2 solo toca `capas3d.ts`). Pruebas de `tests/T02` y `tests/T01` en verde en las compuertas de r2. |
| 7. Capas 3D con Three diferido, ≥ 2 `[data-capa]`, `pieza()`, parallax, sin WebGL | Cumple con reserva | Pruebas en verde; `pieza()` sigue siendo la única vía; JS inicial 68.002 B gzip. **Reserva: H5**, el apartado de las piezas falla si se mide con la página bajada. |
| 8. Dependencias solo `ogl`, `three`, `@types/three` | Cumple | Sin cambios desde r1. |
| «Cuándo terminaste»: a 1440, 1280 y 1024 nada encimado ni cortado | Cumple en reposo en la primera carga; No cumple tras un cambio de tamaño con scroll | Capturas `matriz/inicio/1440x900`, `1024x768` y `1180x820`. 1280 × 720 no está en la matriz y no lo medí. H5 para el otro caso. |
| «Cuándo terminaste»: hojas «referente \| nuestro» de cada estado | Cumple | Las seis hojas existen y las abrí. |

## Compuertas

`node fabrica/scripts/compuertas.mjs T02 --guardar` → **COMPUERTAS: VERDE**, Bloquean 0, Avisos 0 (guardado en `COMPUERTAS-r2.md`). Sin ⚠️ y sin «reintento»: nada que juzgar. `fuera-de-alcance`: ninguno; el único archivo de la r2 es `sitio/src/lib/capas3d.ts`, que está dentro de `sitio/src/**`.

## Pruebas y capturas

Las pruebas de `sitio/tests/T02/t02.spec.ts` no cambiaron desde r1 y cubren lo mismo. Lo que la tarea pide y ninguna prueba comprueba:

- Que las piezas 3D no tapen la pastilla ni las etiquetas a 1440, 1280 y 1024 (solo se ve en captura; la entrega lo pide como SOLICITUD y lo midió con un script que no está en el repo). Nota para el orquestador, no hallazgo del constructor.
- Que el apartado de las piezas sobreviva a un cambio de tamaño con la página bajada (H5). Ninguna prueba cambia el tamaño con scroll.

No encontré código acomodado a la prueba. El apartado se calcula de rectángulos reales del DOM (`zonasDelContenido`, `apartar`), no de valores fijos por tamaño.

Reproduje la medición que la entrega no dejó en el repo con un script propio (en el scratchpad) contra `astro preview` en el 4391, con el mismo Chromium de las pruebas:

1. 1440 × 900, sin scroll, 2,5 s después de `data-listo`: las seis piezas visibles y repartidas (captura `a-reposo.png`).
2. Control: igual, pero con `setViewportSize(1440 × 880)` sin haber bajado: las seis piezas siguen en su sitio (`c-control-sin-scroll.png`; octaedro magenta en x 190–305, y 135–265).
3. Bajar 400 px con la rueda, `setViewportSize(1440 × 880)` y volver arriba: **el octaedro magenta desaparece de la portada**, el cubo ácido queda pegado a la esquina superior derecha y cortado (x 1370–1440, y 62–215), y la ficha ácida sube (`b-tras-resize-scroll.png`). Consola sin errores.

La causa está en `capas3d.ts:118-119`: `bajoNav = leerNumero('--alto-nav', 64) - origen.top`. La nav es `position: fixed` (`Nav.astro`), así que solo tapa el borde superior de la portada cuando `origen.top` es 0. Con la página bajada 400 px, `origen.top` = −400, `bajoNav` = 464 y la «zona de la nav» pasa a cubrir los primeros 464 px de la portada: `apartar` empuja las piezas de arriba fuera de la pantalla. `medir()` se corre en cada cambio de tamaño de la portada (`ResizeObserver`), y la portada mide `min-height: 100svh`, así que pasa al girar el celular o al cambiar el tamaño de la ventana con la página bajada.

## Lo que veo

Descripción de nuestras capturas antes de comparar. Hojas de `capturas/comparacion/` (1440 × 900, lado derecho) y la matriz de tamaños.

- **`comparacion/unseen-A1` (estado precarga).** Fondo `rgb(13,13,13)` en todo el cuadro. Un unicornio blanco de perfil, x 1308–1388 y y 262–347 dentro de la hoja, al centro de la mitad derecha; debajo, `[75%]` en mono pequeño blanco (y ≈ 367). Nada más en pantalla.
- **`comparacion/unseen-A2` (estado trama-cursor).** Bloque cobalto a sangre bajo la nav papel. Glifos `. $ 0 1 + = A L G O R` en papel tenue por todo el bloque. Alrededor de x 960–1300, y 130–480 los glifos giran en un remolino de filas curvas más grandes y densas, donde pasó el barrido; detrás del titular. Titular en dos líneas en DM Serif, la pastilla ácida con el unicornio negro a la izquierda de la segunda línea, tres etiquetas en mono sobre el titular, y piezas 3D en los bordes superior e inferior, ninguna sobre las letras.
- **`comparacion/leadoff-A2` y `leadoff-A3` (estado portada).** Las dos muestran el mismo cuadro final: cobalto `rgb(44,8,255)` a sangre; etiquetas centradas arriba del titular; «¿Y si esta vez sí» y «lo haces *realidad?*» en dos líneas centradas, papel sobre cobalto; la pastilla ácida (x 1010–1140 en la hoja, a la izquierda de la segunda línea) con el unicornio negro, completa, redondeada, sin nada encima. En A3 la entrada ya terminó: no hay estado intermedio.
- **`comparacion/tabletales-A1` (estado portada).** Seis piezas 3D en las franjas de arriba y abajo: octaedro magenta arriba a la izquierda (x 1010–1100, y 125–210), cubo ácido arriba a la derecha (x 1680–1765, y 85–185), ficha ácida abajo a la izquierda cortada por el borde (x 905–980), cubo tinta abajo al centro (x 1203–1260, y 495–540), moneda tomate a la derecha (x 1630–1735, y 470–495), octaedro tomate abajo (x 1515–1600, y 530–595). Ninguna toca el titular, la pastilla ni las etiquetas.
- **`comparacion/tabletales-A2` (estado portada-scroll, 600 px).** Se ve el final de la portada: «lo haces *realidad?*» cortado arriba por la nav; la pastilla; la ficha ácida (x 910–970, y 238–357), el cubo tinta (x 1205–1255, y 327–357) y la moneda tomate (x 1630–1735, y 290–345) recortados por el borde inferior del bloque cobalto, que termina en y ≈ 357. Debajo, bloque negro con «Semillero Algora · Creación Digital · Universidad El Bosque».
- **`matriz/inicio/1024x768`.** Ficha ácida abajo a la izquierda (x 0–90, y 562–765), pastilla completa (x 80–248, y 432–508), etiquetas enteras en y ≈ 283, octaedro magenta (x 115–235, y 120–232), cubo ácido (x 885–995, y 72–205). Nada sobre las letras.
- **`matriz/inicio/667x375`.** Octaedro magenta pequeño pegado al borde inferior de la nav (x 100–128, y 62–85), cubo ácido (x 598–632, y 73–115), ficha ácida abajo a la izquierda (x 5–50, y 322–375), moneda tomate (x 556–613, y 329–339). Etiquetas enteras en y ≈ 104, pastilla completa. Las piezas son chicas.
- **`matriz/inicio/375x667`, `844x390`, `320x568`, `1366x650`, `1180x820`, `1440x900`.** Pastilla completa y etiquetas enteras en todas. A 320 × 568 la moneda tomate queda a unos 7 px de la «?» de «realidad?» sin tocarla. A 844 × 390 la pastilla está a x 40–188 y la ficha ácida abajo (x 15–57, y 322–378), sin contacto.

## Contra el referente

| id | Aspecto | Qué se ve en el referente | Qué se ve en lo nuestro | Cumple |
|---|---|---|---|---|
| unseen A1 | Precarga sobre negro, mascota al centro, `[93%]` debajo, pequeña y mono | Fondo casi negro, mascota con alas pequeña al centro, `[93%]` mono diminuto debajo | Fondo `rgb(13,13,13)`, unicornio blanco al centro, `[75%]` mono diminuto debajo | Cumple |
| unseen A2 | Trama que cubre la portada, más densa en una figura central, detrás del titular; el cursor la deforma | Glifos en todo el cuadro, más densos en una figura central, titular amarillo encima | Glifos en papel tenue por todo el bloque, remolino de glifos más grandes y densos donde pasó el cursor, detrás del titular | Cumple (la figura exacta y la opacidad son del pulido) |
| leadoff A2 | Bloque a sangre de un solo color saturado, titular enorme centrado en dos líneas, pieza redondeada entre las palabras | Azul plano, dos líneas centradas, foto redondeada al inicio de la segunda línea | Cobalto a sangre, dos líneas centradas, pastilla ácida completa al inicio de la segunda línea, sin nada encima | Cumple |
| leadoff A3 | Las líneas suben y la pieza crece desde cero | Cuadro azul sin contenido (mitad de la entrada) | Estado final de la portada, sin entrada intermedia | Cumple por las pruebas de serie (movimiento: no se juzga en un cuadro quieto) |
| tabletales A1 | Piezas delante y detrás de las letras del titular, repartidas alrededor | Figuras que se montan sobre las letras, salen por delante y por detrás | Seis piezas repartidas en las franjas de arriba y abajo, en dos capas (z 1 y 3 contra contenido en 2); ninguna toca el titular | Cumple en estructura. Nota para el orquestador: la r1 de esta corrección pidió que ninguna cubra el texto, así que ya no hay una pieza visiblemente delante o detrás de una letra; el solape deliberado con el titular se decide en el pulido (H7) |
| tabletales A2 | Al bajar, cada capa se mueve más lento que la página y a su propia velocidad | Capa que se queda atrás | A 600 px las piezas quedan más abajo que el texto, recortadas por el borde del bloque; prueba de parallax en verde con razones distintas | Cumple |

No aparece nada de `no_se_toma`.

## Hallazgos

### `H5` · El apartado de las piezas depende del scroll: tras cambiar el tamaño con la página bajada, una pieza desaparece y otras se pegan a la esquina
- **Severidad:** Mayor
- **Dueño:** constructor
- **Archivo:** `sitio/src/lib/capas3d.ts:118-119` (cálculo de la zona de la nav en `zonasDelContenido`)
- **Evidencia:** reproducción descrita arriba (scratchpad `b-tras-resize-scroll.png` contra `c-control-sin-scroll.png`): mismo tamaño final 1440 × 880, la única diferencia es haber bajado 400 px antes del cambio. Con scroll desaparece el octaedro magenta y el cubo ácido queda cortado en la esquina. `bajoNav` usa `origen.top`, que cambia con el scroll, y la nav es `position: fixed`.
- **Regla:** tarea, «Cuándo terminaste» («nada encimado ni cortado») y regla 4.2 (mide la función, no solo la cifra): el apartado se calcula en la letra y falla en la función cuando el contexto no es el de la captura. Es un defecto de la corrección de H1, no de pulido.

### `H6` · Hojas viejas `A1.jpg`, `A2.jpg`, `A3.jpg` quedaron en `comparacion/`
- **Severidad:** Menor
- **Dueño:** orquestador
- **Evidencia:** `ls fabrica/buzon/T02/capturas/comparacion` lista las seis hojas nuevas y además las tres de la r1 sin sitio en el nombre. Son de la corrida anterior del script y confunden: `A2.jpg` es de tabletales y no de unseen.
- **Regla:** evidencia del buzón limpia. No bloquea.

### `H7` · Contradicción entre el aspecto tabletales A1 y «nada encimado ni cortado»
- **Severidad:** Menor
- **Dueño:** orquestador
- **Evidencia:** `T02.json` pide «piezas delante y detrás de las letras del titular»; la tarea pide «nada encimado». En la hoja `tabletales-A1` las piezas ya no cruzan ninguna letra. Decidir si en el pulido se permite que una pieza pase por delante o detrás del titular, y si sí, cambiar el criterio de la tarea. No bloquea esta ronda: el constructor aplicó lo que le ordené en r1.

### `H8` · La entrega no incluye la tabla «Respuesta a CORRECCION-r1» y cita un script de medición que no está en el repo
- **Severidad:** Menor
- **Dueño:** constructor
- **Evidencia:** `ENTREGA-r2.md` no tiene la sección que pide `plantillas/buzon.md` para una ronda de corrección. La cifra «ok en 12 de 13 tamaños, 1 píxel en 844 × 390» viene de un script «en el scratchpad (no está en el repo)»: no la pude reproducir como está (regla 4.3). Mi medición propia de arriba la reemplaza y coincide en lo que cubre (reposo, sin scroll).

### `H3` (Menor, sigue abierto, constructor/pulido)
Espacios de «lo haces» y «si esta vez» muy cerrados en el titular (en `matriz/inicio/1440x900` «sí» y «esta» casi pegados). Del andamio, para el pulido.

## Qué debe mirar el orquestador

- Una prueba en `sitio/tests/T02/` que cambie el tamaño con la página bajada y compare las posiciones de las piezas con las de sin scroll; hoy ninguna prueba cubre H5 ni el solape.
- 1280 × 720 no está en la matriz de capturas aunque la tarea lo menciona.
