VEREDICTO: NO PASA

# QA r1 — T04 · Productos y marco de tinta

- **Tarea:** T04
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v5.0
- **Inicio:** Sun Nov 15 15:02 HPS 2026 (salida de `date`, antes de las compuertas)
- **Fin:** Sun Nov 15 15:20 HPS 2026 (salida de `date`)
- **Intervenciones del autor:** 0

## Resumen

La entrega funciona y lo que afirma se reproduce: compuertas en VERDE, las siete fichas llegan, el marco abre un hueco de borde ácido irregular y la página sigue hacia «Cómo funciona» y el pie. No encontré hallazgos del constructor. El veredicto es NO PASA por un solo motivo que el constructor no puede arreglar: la hoja de comparación de `L1` (leadoff, bloque a sangre) no existe porque `fabrica/proyecto/referentes/T04.json` pide un estado `bloque` que el mismo archivo no define. Por la regla 4b.4 de mi rol, una hoja que falta es Mayor, y es del orquestador. Se escribe `ESCALADO.md`.

## Compuertas

`node fabrica/scripts/compuertas.mjs T04 --guardar` → **VERDE**, guardado en `COMPUERTAS-r1.md` (Bloquean 0, Avisos 1). check 0/0/0, build, Playwright (`tests/comunes`, `T01`, `T02`, `T03`) sin reintento, fuentes 168.748 B de 250.000, JS inicial 70.638 B gzip de 220.000 (reproducen las cifras de la entrega).

- ⚠️ `mobiliario` (`Productos.astro:101, 102, 115, 147, 148`): lo juzgo bien. Son el `border: var(--borde-ancho)` y el `box-shadow: var(--sombra)` / `--sombra-hover` del manual de marca, por token, en la pastilla Postúlate y en las fichas; la tarea (punto 2) pide expresamente borde y sombra dura. No hay hex, degradados ni valores sueltos.
- Alcance: 6 archivos dentro de «archivos», fuera-de-alcance ninguno. El `git status` solo muestra rutas de T04 y `fabrica/datos/compuertas.jsonl` (lo escribe el script).

## Hook (F17)

`fabrica/datos/hook.jsonl`: 353 líneas de `gemini:T04/S1`, `/S2` y `/integracion` (de 2026-11-15T17:03Z a 20:02Z, incluida la ronda cortada por el 429 y la reanudada). **Cero líneas con decisión distinta de `permitido`** para esos agentes: ninguna negación que cruzar. Las escrituras de Gemini son las rutas de la tarea y `fabrica/buzon/T04/` (`tmp/probar-shader.mjs`, `tmp/verificar-t04.mjs`, entregas); los comandos de terminal son `compuertas`, `capturas`, `astro check`, sus propios scripts, `Get-Process` de solo lectura y esperas. Sin rodeos.

## Entregables (contra la tarea)

| Entregable | Estado | Evidencia |
|---|---|---|
| Selectores de contrato (`section[data-productos]`, bloque, etiqueta, titular `h2`, 7 `[data-ficha]` con etiqueta y nombre, `[data-postular]`, `[data-marco]`, `[data-siguiente]`) | Cumple | `Productos.astro` líneas 13-36; medidos con mi script `tmp/qa-r1.mjs` (7 fichas, `href="#postulacion"`) |
| 1. Bloque cobalto a sangre, `[PRODUCTOS]`, titular «¿Cuál es el tuyo?» en serif y papel, botón Postúlate (pastilla ácida, ≥ 44 px) | Cumple | `estado-piezas.jpg`; botón medido 146 × 47 px en 1440 y en 375 |
| 2. Siete fichas con color, giro propio, texto ≥ 4,5:1, lista con `aria-label` | Cumple con una desviación documentada | Giros −7, 5, −4, 8, −9, 3, −2 (siete distintos, dentro de ±10, desde `--ficha-giro-n`). Texto en tinta también sobre tomate (4,99:1) en vez de papel (3,66:1): la tarea se contradice (ver `H2`) |
| 3. Pin único en dos tramos; vuelo desde `top 55%` hasta la mitad del pin; a mitad, siete fichas a la vista y sin tapar titular, etiqueta ni botón | Cumple | Recorrido con rueda a 1440×900: a y = 8460 las siete fichas con `opacity` 1; sin choques entre caja de ficha y titular/etiqueta/botón. A 1280×720, 1024×768 y 1920×1080 en el punto medio: sin choques entre fichas ni con el centro, ninguna fuera del encuadre. El trigger del vuelo termina en `+= 0,45·innerHeight + 0,5·pin` = la mitad del pin (`productos.ts:70`), no es un valor fijo |
| 4. Letra por letra con texto accesible entero | Cumple | `h2` con `aria-label` «¿Cuál es el tuyo?» y letras en `aria-hidden`; la etiqueta lleva `.productos__solo-lector` más las letras ocultas. 0,9 s, stagger 0,03, `power4.out` |
| 5. Marco de tinta diferido, OGL, borde ácido variable, fbm, hueco que sobrepasa los cuatro bordes, `p` en la segunda mitad, queda sin pintar | Cumple | Ver «Reproducción». Capturas propias en y = 8800, 9000, 9135, 9230, 9290 y 9500; el hueco crece centrado, sin forma de óvalo, y a 9500 el canvas no pinta nada |
| 5. Apagado 0,12–0,26 y marco 0,26–0,90 con `power2.in` | Cumple | `tlPin` (`productos.ts:48-53`): 1,12 / 1,26 / 1,90 sobre 2 unidades; en y = 8700 las siete fichas y el botón están en `opacity 0` y `visibility hidden` |
| 5. Carga diferida; destrucción al alejarse | Cumple | `import('./marco-tinta')` solo al entrar en proximidad (`start: top bottom+=innerHeight`); `data-marco-listo` pasa a false en y = 0, vuelve a true en 7000 y el marco se repinta igual en 9135 |
| 6. Respaldo y movimiento reducido: sin pin ni canvas, fichas quietas | Cumple | `reducedMotion: 'reduce'` a 1440: `modo: null`, canvas `display:none`, 7 fichas visibles en rejilla de 4 columnas, 0 mensajes de consola |
| 7. Angosto: rejilla de 2 columnas, sin canvas, sin scroll horizontal | Cumple | 320, 375, 390, 768 y 1023 px: `modo: null`, canvas oculto, fichas en dos columnas dentro del ancho, `scrollWidth − clientWidth = 0` |
| 8. Panel `[data-siguiente]` con «Cómo funciona» y nada más | Cumple | `Productos.astro:33-35`; en tema oscuro el relleno del hueco es tinta con texto papel (`qb-dark-9135.png`) |
| 9. Refresco, pines que no se pisan, el pie se alcanza | Cumple | Hitos termina en 7560 y el pin de productos va de 7560 a 9360 (secTop 0 en todo el tramo); fin de página y = 9744 = máximo, pie visible. Reversa: al subir a 0 las fichas vuelven a `opacity 1`. Tras redimensionar a 800 px estando a mitad de apagado, las fichas quedan `opacity 1` / `visible` y el `aria-label` del `h2` se retira |
| Compuertas VERDE con regresión T01–T03 | Cumple | Reproducido (arriba) |
| `capturas.mjs T04` corrido; hojas `piezas` y `marco`; foto de breakpoints | Cumple, con una hoja ausente | 15 capturas; el script avisó `⚠ L1: ningún estado se llama «bloque»` (ver `H1`) |
| Entrega en `ENTREGA-r1.md` | Cumple | Reproducí cada comando y cifra |

## Reproducción de afirmaciones

- «COMPUERTAS VERDE, 1 aviso, 70.638 B, 168.748 B»: reproducido con `--guardar`.
- «15 capturas»: reproducido con `node fabrica/scripts/capturas.mjs T04`; mismo aviso de `L1`.
- «`jsInicialEnCarga: 0` para marco-tinta/ogl»: coherente con el JS inicial de 70.638 B (T03 cerró con 69.387 B); la carga diferida la verifiqué por el cambio de `data-marco-listo` según la posición.
- «Consola limpia, sin errores»: 0 mensajes de consola o `pageerror` en mis recorridos (1440 en claro y oscuro, redimensionado, 1280/1024/1366/1920, angostos, reducido).
- «La función, no solo la cifra» (regla 4.2): comprobé con rueda real que el hueco crece de verdad (`tmp/qb-light-9000.png`, `qb-light-9230.png`, `qb-light-9290.png`), que se destruye y se vuelve a montar sobre el mismo canvas sin avisos de contexto, y que el estado final deja el canvas transparente. No hay estado escrito a mano en `data-*` (`data-modo` y `data-marco-listo` los pone `productos.ts` según medios y montaje real), ni ramas solo para la prueba, ni valores fijos donde la tarea pide cálculo (giros, pincel, ruido, DPR y scrub se leen de tokens).
- Contraste: tinta (`#0D0D0D`) sobre tomate (`#FF103E`) 4,99:1 y papel sobre tomate 3,66:1, como dice la entrega; las pruebas comunes (axe) pasan en la compuerta.

## Pruebas y capturas

- **Pruebas:** T04 no tiene pruebas propias por decisión del autor (2026-11-10); no hay `sitio/tests/T04/`. Pasan las comunes y la regresión T01–T03, que no miran esta sección salvo axe, consola, 375 px, reducido y foco. Lo que la tarea pide y ninguna prueba comprueba (pin en dos tramos, fichas sin tapar el texto, hueco que sobrepasa los bordes, el pie al final) lo medí yo en esta ronda con `fabrica/buzon/T04/tmp/qa-r1.mjs` y `qa-r1b.mjs`. Va como `H3` (Menor, orquestador) para que se tenga presente.
- **Capturas:** ver «Lo que veo».

## Lo que veo

Descripción de lo nuestro por hoja, antes de mirar los aspectos.

- **`estado-piezas.jpg` / hojas `A4` y `A5`** (1440×900, y = 8460): fondo cobalto uniforme de y = 63 a 900 bajo la nav blanca. Centrado en x = 720: `[PRODUCTOS]` en mono papel (y ≈ 296), «¿Cuál es el tuyo?» en serif papel en dos líneas (y ≈ 345–575, de x ≈ 520 a 920) y la pastilla ácida «POSTÚLATE» (x 648–792, y 597–644). Siete fichas rectangulares de esquinas redondeadas con sombra dura negra, cada una con su giro: «[APP] Una app» ácido (x 65–300, y 105–278); «[JUEGO] Un juego» magenta (x 572–802, y 68–234); «[TIENDA] Una tienda» tomate (x 1130–1358, y 120–282); «[IA] Una herramienta con IA» papel (x 42–278, y 383–560); «[PLATAFORMA] Una plataforma» ácido (x 1153–1392, y 408–588); «[SERVICIO] Un servicio» magenta (x 84–309, y 700–860); «[MEDIO] Un medio» tomate (x 1118–1340, y 693–850). Ninguna toca el titular, la etiqueta ni el botón. Texto de las fichas en tinta, también sobre el tomate. Las letras del titular están asentadas (el cuadro es posterior a la entrada).
- **`estado-marco.jpg` / hoja `A3`** (1440×900, y = 9135): fondo cobalto a sangre con un hueco de contorno irregular centrado (x ≈ 305–1120, y ≈ 140–730). El hueco tiene un borde ácido de grosor variable (de unos 35 a 110 px) con salientes y entrantes de ruido, no un óvalo ni un rectángulo limpio; por dentro es papel (`#F6F8FB`) con «Cómo funciona» en serif tinta, centrado. No quedan fichas, titular ni botón.
- **Mis capturas propias (`tmp/qb-*.png`)**: en y = 9000 un hueco pequeño de unos 250 × 170 px con borde ácido; en y = 9230 el hueco ocupa casi todo, con el ácido y un poco de cobalto en los bordes laterales; en y = 9500 pantalla papel con «Cómo funciona» y la sección siguiente (negra, «Semillero Algora · Creación…») abajo, sin ácido ni cobalto. En tema oscuro, y = 9135: mismo contorno, interior tinta con «Cómo funciona» en papel.
- **`inicio-390-completa.jpg` y mis capturas a 375 (`qa-ang-375.png`)**: bajo el bloque de hitos aparece el bloque cobalto con `[PRODUCTOS]`, titular en dos líneas, botón y las fichas en dos columnas (x 24–182 y 194–351 a 375 px), la séptima sola en la última fila; debajo, «Cómo funciona» sobre papel. Sin texto cortado. **`qa-reducido.png`** (1440, reducido): mismo bloque sin giro, fichas en cuatro columnas más tres, sin canvas.
- **`inicio-breakpoints.jpg` y `inicio-1440*.jpg`**: muestran la portada (primer bloque de la página), no esta sección; lo de T04 a 1280, 1024 y 1366 lo medí y capturé yo (`qa-piezas-*.png`): en `qa-piezas-1366x650.png` las siete fichas rodean el titular sin tapar nada (la ficha 2 queda a 107 px de `[PRODUCTOS]`).
- **Hoja `L1`:** **no existe** (el script no la generó).

## Contra el referente

| id | Aspecto | Qué se ve en el referente | Qué se ve en lo nuestro (de «Lo que veo») | Cumple |
|---|---|---|---|---|
| A3 | Un marco de borde irregular crece hasta ocupar la pantalla y dentro aparece la sección siguiente | Dos franjas ocre verticales (x ≈ 120–145 y 760–785) con interior blanco; el borde es irregular y el marco casi llena el cuadro | Hueco de contorno irregular centrado, borde ácido de grosor variable, interior con la sección siguiente; en y = 9230–9290 llega a los cuatro bordes y en 9500 desaparece | Cumple (movimiento, no se juzga). Identidad correcta: ácido y fondo del tema, no dorado |
| A4 | Piezas que llegan volando a su sitio con un giro, ligadas al scroll | Titular enorme con piezas de juego (ficha, cartas, dados) repartidas y giradas alrededor de una figura central | Siete fichas tipográficas con giros distintos alrededor del titular, repartidas en los cuatro lados y sin tapar el texto | Cumple (fichas del DOM por decisión del autor; el vuelo en sí es movimiento) |
| A5 | Titulares letra por letra desde abajo | Titular serif en dos tamaños, a la izquierda, con subtítulo | Titular en serif partido en letras dentro de máscaras, asentado en la captura; el texto accesible está entero (`aria-label` y letras en `aria-hidden`) | Cumple en lo visible; la subida letra por letra es movimiento y no se juzga en cuadro quieto |
| L1 | Bloque a sangre de un solo color saturado, titular centrado, mucho aire | Sin hoja de comparación. Revisé `referentes/capturas/leadoff-scroll-00.jpg`: azul saturado a sangre, titular centrado en dos líneas de y ≈ 330 a 570 y mucho aire alrededor | Cobalto uniforme a sangre, titular centrado en papel y mucho aire en los costados y entre el titular y las fichas | Cumple en mi lectura, pero **sin hoja de capturas**: es `H1` |

`no_se_toma`: ni el ilustrado dorado, ni el azul marino, ni el borde dorado, ni tinta de cursor aparecen. La tipografía condensada en mayúsculas tampoco (titular en DM Serif Text).

## Hallazgos

### `H1` · Falta la hoja de comparación `L1`
- **Severidad:** Mayor
- **Dueño:** orquestador
- **Archivo:** `fabrica/proyecto/referentes/T04.json` (líneas 30 y 42-45)
- **Evidencia:** `node fabrica/scripts/capturas.mjs T04` → `⚠ L1: ningún estado se llama «bloque»`; en `fabrica/buzon/T04/capturas/comparacion/` solo están `tabletales-A3.jpg`, `A4` y `A5`. El aspecto `L1` declara `"estado": "bloque"` y `estados` solo define `piezas` y `marco`. El constructor lo anotó en su entrega (Supuestos y SOLICITUDES) y lo dejó en manos del orquestador, que es lo correcto: el archivo no es suyo.
- **Regla:** `auditor.md` 4b.4: «Una hoja que falta (el script avisó ⚠) es Mayor: sin la imagen no hay evidencia». Mi lectura de `L1` (tabla de arriba) se hizo contra la captura original del referente, no contra una hoja.

### `H2` · La tarea se contradice en el color del texto sobre el tomate
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `fabrica/proyecto/tareas/T04-productos.md` (decisión del orquestador, línea 74, y tabla de tokens, línea 155) frente al punto 2, línea 103
- **Evidencia:** la tarea fija «texto en tinta sobre todas, menos sobre el tomate (papel)» y a la vez «contraste ≥ 4,5:1 sobre su color». Papel sobre tomate da 3,66:1 y tinta sobre tomate 4,99:1 (cálculo de S1, coherente con `Hitos.astro:61`, que ya usa tinta sobre tomate). El constructor resolvió con tinta y lo documentó (`tokens.css`, `--ficha-texto-3` y `--ficha-texto-7`), y axe pasa. Es una decisión de color que le toca al orquestador o al autor: confirmar la tinta y corregir el texto de la tarea, o pedir otra cosa.
- **Regla:** `reglas.md` 2: las decisiones de dirección no las toma el constructor; aquí no hubo buena salida sin decidir.

### `H3` · T04 no tiene pruebas propias; lo medido queda solo en el buzón
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/` (no existe `T04/`)
- **Evidencia:** por decisión del autor (2026-11-10) no se escribieron. Lo que ninguna prueba protege hoy: que el pin se reparta en dos tramos, que ninguna ficha tape el titular, la etiqueta o el botón entre 1024 y 1920 px, que el hueco sobrepase los cuatro bordes y que el pie se alcance al final. Mis scripts `fabrica/buzon/T04/tmp/qa-r1.mjs` y `qa-r1b.mjs` lo miden y se pueden convertir en una prueba de regresión si el orquestador quiere que T05 no las rompa.
- **Regla:** `auditor.md` 4: «Lo que la tarea pide y ninguna prueba comprueba es un hallazgo para el orquestador».

## Notas sin hallazgo

- No hay hallazgos del constructor, por eso no se escribe `CORRECCION-r1.md`: no hay nada que el constructor pueda arreglar en una segunda ronda.
- Para cuando se pula, no para esta ronda: en 1366×650 la ficha «Un juego» queda a 107 px de `[PRODUCTOS]` y su caja cruza la del titular por la inclinación, sin tocar el texto; si el autor quiere más aire arriba, es posición de fichas (pulido).
- Procesos: mis servidores de medición usaron el puerto 4396 y los cerré; `netstat` solo muestra conexiones en `TIME_WAIT`.
