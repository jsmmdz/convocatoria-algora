# T01 aprobada

- **Tarea:** T01
- **Ronda:** r3
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 07:45
- **Fin:** 2026-11-10 08:05
- **Intervenciones del autor:** 0

## Por qué pasa

`node fabrica/scripts/compuertas.mjs T01 --guardar` sale en VERDE (`COMPUERTAS-r1-4.md`); `npx playwright test tests/comunes tests/T01` da 17 passed; las capturas de 1440, 1280 y 1024 no muestran nada encimado ni cortado; `capturas.mjs` ya no deja un servidor vivo. Detalle en `QA-r3.md`.

## Para el orquestador

- **H3 (Menor, orquestador):** ninguna prueba exige el tope de 3,5 s de `data-listo` ni el foco en tema oscuro forzado. Escribirlas antes de T02, que mueve `data-listo` al final de la precarga.
- Marcadores de contenido que reemplazan las tareas siguientes: `[CONTENIDO DE T02]` y `[CONVOCATORIA_27]`; la sección `#postulate` llega en T07.
- Pendiente de pulido: el h1 parte «CONTENIDO» a 320 px (responsive, tarea `R`).
