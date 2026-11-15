VEREDICTO: NO PASA

# QA r1 — T03 · Hitos

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 19:36 (salida de `date`)
- **Fin:** 2026-11-10 19:43 (salida de `date`)
- **Intervenciones del autor:** 0

## Entregables

| Entregable de la tarea | Estado | Evidencia |
|---|---|---|
| 1. Cinco `<article data-hito>` con textos de ENCARGO, etiquetas mono, `<h2>` peso 300, bloque de color con palabra cursiva `aria-hidden` | Cumple | Pruebas «contenido» en verde (corrida de compuertas); `Hitos.astro`; capturas |
| 1. Texto y bloque alternados de lado y altura | Cumple | `f-1440-2980.png` (hito 2 texto arriba, hito 3 texto abajo) y `estado-hitos-2.jpg` |
| 2. Horizontal ≥ 1024 px: pin, pista 1:1, cada hito entero, la página sigue, CSS por defecto apilado | Cumple | Pruebas «horizontal a 1440/1280/1024» en verde; barrido propio a 1440×900, 1280×720 y 1024×768 con capturas (nada cortado ni encimado en texto real) |
| 3. Fondos: hitos 3 y 5 invertidos, contraste titular ≥ 4,5:1, línea ≥ 3:1 | Cumple | Pruebas «fondos (claro/oscuro)» y «línea sobre fondo invertido»; `g-light-3700.png`, `g-dark-3800.png` |
| 4. Línea punteada/sólida, sólida hasta la x del viajero, bloques por encima | Cumple | Prueba de píxeles de la línea en verde; `f-1440-2980.png` (sólida a la izquierda del unicornio, punteada a la derecha) |
| 5. Viajero en x fija (30–35 %), apoyado en la línea, 64–80 px, se lee sobre los dos fondos | Cumple (contraste ≥ 3:1 sin medir) | Prueba de x fija y cascos sobre la línea; en `g-light-3700.png` y `g-dark-3800.png` se lee gracias al halo. Ninguna prueba mide el 3:1 del viajero (ver H5) |
| 6. Inclinación K2 con `lenis.velocity`, ±40°, quieto vuelve a 0 | Cumple | Prueba de ángulo en el tiempo en verde; `hitos.ts` aplica la fórmula con los tokens |
| 7. Apilado (<1024, reducido, sin JS) | Cumple | Pruebas de apilado a 1440 reducido, 1000 y 390, y «sin JS» en verde |
| 8. `ScrollTrigger.refresh()` al cargar fuentes y al cambiar de tamaño | Cumple en el código | `document.fonts.ready` → `refresh`, `refreshInit` redibuja; ninguna prueba lo comprueba (H5) |
| Selectores de contrato | Cumple | Las pruebas T03 los leen |
| Solo archivos propios | Cumple | Compuerta `archivos-propios`: 4 cambiados; `fuera-de-alcance`: ninguno |
| Etiquetas «en color» en el hito invertido (A4b, `se_toma`) | **No cumple** | H1 |

## Compuertas

`node fabrica/scripts/compuertas.mjs T03 --guardar` → **COMPUERTAS: VERDE**, 0 bloqueos, 0 avisos (check 0 errores, build, comunes + T03 + T01 + T02, patrones, presupuestos: fuentes 168.748 B de 250.000; JS inicial 69.356 B gzip de 220.000). Queda en `COMPUERTAS-r1.md`. No hay ⚠️ que juzgar ni aviso de «reintento». Coincide con la entrega.

Negaciones del hook (F17): en `fabrica/datos/hook.jsonl` la única línea `negado` es de `auditor-final` (T02, escritura fuera del repo); ninguna del constructor de T03. No hay rodeo que cruzar.

## Pruebas y capturas

Las pruebas T03 (`sitio/tests/T03/t03.spec.ts`, 520 líneas) miden resultado y no mecanismo: series de posiciones al recorrer, píxeles de la línea con textos y bloques ocultos, contraste contra el fondo real, ángulo del viajero en el tiempo, apilado en el borde 1000/1024 y sin JS. Cubren casi todo «Cuándo terminaste».

**Lo que la tarea pide y ninguna prueba comprueba** (para el orquestador, ver H5): el contraste ≥ 3:1 del viajero sobre los dos fondos; que el ticker de la inclinación no trabaje fuera de pantalla; el refresco de ScrollTrigger al cargar fuentes y al cambiar de tamaño.

Barrido propio (scripts en `fabrica/buzon/T03/tmp/`, servidor en el 4391): a 1440×900, 1280×720 y 1024×768 se recorrió la sección en pasos de 80 px y se midió el choque entre la caja del viajero y las cajas de etiquetas/titulares. Hay solapes de cajas en los hitos 2 y 4, y se miraron las capturas de esos pasos (`f-1440-2980.png`, `f-1280-2640.png`, `f-1024-2288.png`, `f-1024-4368.png`): el unicornio queda cerca del final del titular pero no tapa letras (a 1280 queda a unos 15 px de la «.» de «tú.»). Sin hallazgo. La línea nunca cruzó cajas de texto en ninguno de los pasos medidos.

El viajero sí pisa el bloque de color en pasos concretos (`g-light-4150.png`: tapa la «U» de «Usuarios»; `estado-hitos-tinta.jpg`: queda pegado a la «U»). La tarea pone los bloques por encima de la línea, no del viajero, y la entrega lo declara en Supuestos: queda como Menor (H2).

## Lo que veo

Descripción de cada hoja de `capturas/comparacion/` (columna derecha), antes de leer los aspectos.

**`unseen-A3.jpg` (estado hitos-2, 1440×900):** fondo papel (casi blanco) de la nav (y 0–62) hacia abajo. Un bloque magenta cuyo borde derecho está en x ≈ 420 de 1440 (la hoja lo muestra recortado por la izquierda, con «ipo» en cursiva negra abajo). Un unicornio negro de unos 70 px con los cascos en x ≈ 475, y ≈ 380. A su izquierda, línea negra continua y ondulada (baja a y ≈ 495 en x ≈ 100 y sube hasta el unicornio). A su derecha, la misma línea punteada que baja y sube hasta x ≈ 800 donde cambia a una banda tinta (fondo negro) que cubre de x ≈ 800 al borde derecho. En la banda negra la línea punteada sigue en blanco. Arriba a la izquierda, `[EQUIPO] [02/05]` en mono gris y el titular «Alguien de otra carrera la entiende mejor que tú.» en tres líneas, sans ligera, negro, de y ≈ 115 a y ≈ 300. Abajo a la derecha, en la banda negra, `[USUARIOS] [03/05]` en blanco y «Gente que no conoces la usa sin que se lo pidas.» en blanco, cortado en el borde derecho.

**`unseen-A4.jpg` (hitos-1):** fondo papel. Un bloque ácido (verde amarillo) a sangre, esquinas apenas redondeadas, de x ≈ 565 a 1195 y de y ≈ 80 a 548, con «Idea» en serif cursiva negra gigante abajo a la izquierda (x ≈ 600–805, y ≈ 435–520). Un bloque magenta asoma por el borde derecho desde x ≈ 1283 con «Eq» cortado. Línea negra continua con unicornio en x ≈ 465 (cascos y ≈ 445) y línea punteada que sigue hasta detrás del bloque ácido. Abajo a la izquierda solo se leen «de vivir» y «libreta.» en sans ligera, cortados por el borde izquierdo (x < 175); las etiquetas del hito 1 y el comienzo del titular quedan fuera de pantalla en este cuadro.

**`unseen-A4b.jpg` (hitos-tinta):** a la izquierda, banda tinta de x 0 a 1120; a la derecha, banda papel. En la banda tinta un bloque tomate (rojo) de x ≈ 443 a 1077, y ≈ 80 a 548 con «Usuarios» en cursiva negra, y el unicornio con halo claro pegado a la «U» (x ≈ 430–497, y ≈ 430–497). La línea es blanca y continua a su izquierda. Abajo a la izquierda, titular blanco cortado («e no / a usa sin / bidas.»). Un bloque cobalto con «Valor» cortado entra por la derecha sobre papel. Las etiquetas del hito 3 no se ven en este cuadro (quedan fuera de pantalla a la izquierda). En la captura donde sí se ven (`g-light-3700.png`) `[USUARIOS] [03/05]` va en blanco/gris claro, sin color de acento.

**`unseen-A5.jpg` (hitos-2):** el mismo cuadro de A3: unicornio negro sobre la línea en x ≈ 475, con la continua a la izquierda y la punteada a la derecha; cascos apoyados sobre el trazo; sin ninguna mascota de ojos.

## Contra el referente

| id | Aspecto | Qué se ve en el referente | Qué se ve en lo nuestro | Cumple |
|---|---|---|---|---|
| A3 | Sección en horizontal; hitos en fila unidos por línea ondulada fina; lo recorrido sólido, lo que falta punteado | Línea gris que pasa de continua a punteada en el personaje, hitos en fila, paneles grandes | Línea negra continua hasta el unicornio y punteada después, pasando entre textos y bloques y hasta la banda tinta (en blanco); hitos en fila con la pista corriendo | Sí |
| A4 | Etiquetas mono entre corchetes, titular grande de 2–4 líneas en sans ligera, panel grande al lado; algunos hitos en fondo oscuro | `[MOTION] [JAN_25]` mono, titular de 4 líneas, panel con imagen; otros hitos oscuros | `[EQUIPO] [02/05]` en mono, titular de 3 líneas en sans ligera, bloque grande de color a sangre; hitos 3 y 5 en tinta. En el cuadro hitos-1 las etiquetas y el inicio del titular quedan fuera de pantalla, pero se ven en hitos-2 y en las capturas propias | Sí |
| A4b | Hito oscuro: panel de texto en tinta, **etiquetas en color**, titular en papel | Etiquetas en rojo sobre fondo oscuro, titular blanco | Fondo tinta y titular blanco; etiquetas blancas/gris claro, sin color de acento | **No** (etiquetas sin color) |
| A5 | El personaje va donde la sólida se vuelve punteada y se inclina con la velocidad | Personaje en la unión continua/punteada | Unicornio en la unión, cascos sobre el trazo; la inclinación la cubre la prueba de ángulo (el movimiento no se juzga en cuadro quieto) | Sí |

`no_se_toma`: no hay imagen/video del proyecto en los paneles, ni «OPEN [+]», ni mascota de ojos con alas, ni modo vertical de celular con mes gigante; el titular va en Zalando Sans ligera. Ninguno aparece.

## Hallazgos

### `H1` · Etiquetas del hito invertido sin color (aspecto A4b no se ve)
- **Severidad:** Mayor
- **Dueño:** constructor
- **Archivo:** `sitio/src/components/Hitos.astro:50-53` (`--hito-suave` del hito invertido) y `sitio/src/styles/tokens.css` (tokens de hitos)
- **Evidencia:** `fabrica/proyecto/referentes/T03.json` A4b dice «el panel de texto en tinta con las etiquetas en color y el titular en papel». En `g-light-3700.png` y `g-dark-3800.png` (captura propia) `[USUARIOS] [03/05]` y `[NOMBRE] [05/05]` salen en el color del texto invertido (blanco/tinta), igual que el titular. La entrega lo reconoce en Supuestos («sin color de acento, posible pulido»), pero ni la tarea ni «Queda para el pulido» lo difieren.
- **Regla:** auditor.md § 4b.4 (un aspecto de `se_toma` que no se ve es Mayor).

### `H2` · El viajero tapa la palabra del bloque en algunos pasos
- **Severidad:** Menor
- **Dueño:** constructor
- **Archivo:** `sitio/src/components/Hitos.astro` (`.hitos__guia`, z-index 3 sobre `.hito__bloque`)
- **Evidencia:** `g-light-4150.png` (scroll 4150 a 1440×900): el unicornio cubre la «U» de «Usuarios». La entrega lo declara. La tarea pone los bloques sobre la línea, no sobre el viajero, y deja la x del viajero para el pulido.
- **Regla:** informativo; no bloquea. Si el constructor ve una salida barata (por ejemplo, que la palabra quede a la derecha del x del viajero), puede tomarla; si no, queda para el pulido.

### `H3` · Valores de diseño de la onda como literales en TypeScript
- **Severidad:** Menor
- **Dueño:** constructor
- **Archivo:** `sitio/src/lib/hitos.ts:17-20` (pesos 0.65 y 0.35, fases 0.6 y 2.1, paso 8) y los respaldos de `leerNumero` repetidos
- **Evidencia:** lectura del código; la forma de la onda es del pulido, y el pulido la cambiará más fácil si sale de tokens.
- **Regla:** reglas.md § 5 («todo valor de diseño sale de los tokens»).

### `H4` · La entrega afirma lo que no vio
- **Severidad:** Menor
- **Dueño:** constructor
- **Archivo:** `fabrica/buzon/T03/ENTREGA-r1.md` § Verificación
- **Evidencia:** dice que el horizontal a 1280 y 1024 «no lo miré en imagen». La tarea pide mirarlo («a 1440, 1280 y 1024 nada encimado ni cortado»). En esta ronda se miró y está bien (`f-1280-2640.png`, `f-1024-2288.png`, `f-1024-4368.png`); la próxima entrega debe traer esa mirada propia.
- **Regla:** T03 «Cuándo terminaste», segundo punto.

### `H5` · Pruebas que no cubren requisitos de la tarea
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/T03/t03.spec.ts`
- **Evidencia:** ninguna prueba mide (a) el contraste ≥ 3:1 del viajero sobre papel, tinta y los bloques (el halo parece cumplirlo en las capturas, sin medir); (b) que el ticker de la inclinación no trabaje con la sección fuera de pantalla; (c) el refresco de ScrollTrigger tras `document.fonts.ready` y al cambiar el tamaño de la ventana. Solo la lectura de `hitos.ts` respalda los tres.
- **Regla:** auditor.md § 4 (lo que la tarea pide y ninguna prueba comprueba va al orquestador). Es Menor: no frena la ronda.

## Escalado

No hay Crítico ni Mayor del orquestador: no se escribe `ESCALADO.md`. El único Mayor (H1) lo arregla el constructor en `CORRECCION-r1.md`.
