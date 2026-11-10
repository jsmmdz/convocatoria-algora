# T02 aprobada por QA

- **Tarea:** T02
- **Ronda:** r3
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 12:17
- **Fin:** 2026-11-10 12:40
- **Intervenciones del autor:** 0

## Menores pendientes

- `H3` (constructor, pulido): espacios de «sí esta» y «lo haces» muy cerrados en el titular.
- `H6` (orquestador): borrar `A1.jpg`, `A2.jpg` y `A3.jpg` viejas de `capturas/comparacion/`.
- `H7` (orquestador): decidir en el pulido si una pieza puede pasar delante o detrás del titular; el aspecto de tabletales A1 lo pide y la tarea dice «nada encimado».

## Qué debe mirar el orquestador con más cuidado

- Ninguna prueba de `sitio/tests/T02/` cubre H5 (cambio de tamaño con la página bajada) ni el solape entre las piezas y `[data-objeto]` o las etiquetas. Hoy solo lo cubre `fabrica/buzon/T02/medir-h5.mjs` y las capturas.
- 1280 × 720 no está en la matriz de capturas aunque la tarea lo menciona.
- El apartado de las piezas supone que la portada es la primera sección, en 0 de la página (lo dice la entrega); si se pone algo encima de la portada, revisarlo.
