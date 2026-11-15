
## Sin cuota de Gemini — r1 (15/11/2026, 12:10:22 p. m.)

- Sesiones cortadas por el 429: S1, S2.
- Decisión del autor (2026-11-14): la tarea **para y se avisa**; no se pasa a otro modelo ni se reintenta solo.
- Se retoma cuando vuelva la cuota con el mismo comando del workflow; lo que ya entregó no se repite (las subtareas con su ENTREGA-r1-S<n>.md se saltan).

## Auditoría QA r1 — hallazgo del orquestador (15/11/2026, 3:20 p. m.)

# T04 escalada al orquestador

- **Tarea:** T04
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v5.0
- **Inicio:** Sun Nov 15 15:02 HPS 2026
- **Fin:** Sun Nov 15 15:20 HPS 2026
- **Intervenciones del autor:** 0

Esta sección es de la auditoría de la ronda 1 de la entrega ya completa (la sección anterior es del corte por cuota de Gemini, que ya se resolvió: la entrega r1 existe). Detalle en `QA-r1.md`.

## Qué no se resolvió y por qué el constructor no lo resuelve

- **`H1` · Mayor · orquestador.** Falta la hoja de comparación `L1` (leadoff, bloque a sangre). `fabrica/proyecto/referentes/T04.json` declara para `L1` el estado `"bloque"` (línea 30) y `estados` (líneas 42-45) solo define `piezas` y `marco`. `capturas.mjs T04` avisa `⚠ L1: ningún estado se llama «bloque»` y no genera la hoja. Es un archivo del orquestador fuera de los `archivos` de la tarea. El constructor ya lo había pasado en su entrega. Opciones del orquestador: definir un estado `bloque` (por ejemplo, a 1440×900 con la rueda en 7560, donde empieza el pin; las distancias miden 1:1 según el propio `dudas` del archivo) o apuntar `L1` a `piezas`. Después hay que volver a correr `capturas.mjs T04` para tener la hoja.

## Menores del orquestador (no bloquean)

- **`H2`:** la tarea se contradice en el texto sobre el tomate (papel por decisión; ≥ 4,5:1 por requisito; papel sobre tomate da 3,66:1). El constructor usó tinta (4,99:1). Confirmar y corregir el texto de la tarea, o decidir otra cosa con el autor.
- **`H3`:** T04 no tiene pruebas propias (decisión del autor, 2026-11-10). Lo medido en esta ronda queda en `fabrica/buzon/T04/tmp/qa-r1.mjs` y `qa-r1b.mjs`, por si se quiere convertir en prueba de regresión.

## Qué debe mirar el orquestador con más cuidado

- El resto de la entrega pasó mi reproducción: compuertas VERDE (`COMPUERTAS-r1.md`), pin único en dos tramos medido con rueda real (7560 a 9360), siete fichas a la vista en la mitad del pin sin tapar el titular a 1440, 1280, 1024 y 1920, marco que abre, llega a los cuatro bordes y deja el canvas transparente, desmontaje y remontaje del marco sin avisos de consola, respaldo (reducido y angosto) sin scroll horizontal. No hay hallazgos del constructor, por eso no hay `CORRECCION-r1.md`. Resuelto `H1`, la tarea está lista para pasar a aprobación sin otra ronda de construcción.

## Resolución del orquestador (2026-11-15, 3:35 p. m.)

- **H1:** `L1` se compara en el estado «piezas» (`fabrica/proyecto/referentes/T04.json`, con la razón en `dudas`): no hay cuadro de bloque sin fichas, porque el vuelo arranca antes del pin. `capturas.mjs T04` corrido otra vez: sale `comparacion/leadoff-L1.jpg` (bloque cobalto a sangre, titular centrado, aire alrededor). Hubo que cerrar un `astro preview` del QA que quedó vivo en el 4396 y no dejaba arrancar el de las capturas.
- **H2:** se confirma tinta sobre el tomate (4,99:1; papel da 3,66:1 y no cumple el punto 2), como en los hitos. Corregido el texto de la tarea (decisión del orquestador y tabla de tokens).
- **H3:** sigue la decisión del autor (2026-11-10): sin pruebas propias. Se le ofrece convertir `tmp/qa-r1.mjs` y `qa-r1b.mjs` en prueba de regresión.
- Compuertas: todo en verde salvo `fuera-de-alcance` por las dos rutas protegidas sin commit (las de H1 y H2). Con el commit del autor, sigue `/construir-tarea T04 auditoria`.
