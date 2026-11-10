# Corrección r2 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r2
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 12:05
- **Fin:** 2026-11-10 12:07
- **Intervenciones del autor:** 0

Solo hay un hallazgo del constructor con efecto en el veredicto (H5). H6 y H7 son del orquestador y no bloquean: no los toques. Lo que ya quedó bien en r2 (posiciones, constantes, pastilla y etiquetas libres en reposo) no se cambia.

### `H5` · El apartado de las piezas depende del scroll
- **Qué cambiar:** en `zonasDelContenido`, la banda que representa la nav fija no puede depender de `origen.top` (que cambia al bajar). La nav es `position: fixed`, así que solo tapa el borde superior de la portada cuando la portada está arriba del todo. Calcula el alto de la banda con la posición de la portada en el documento, no en la ventana: `origen.top + window.scrollY` (la portada empieza en 0 de la página, así que sale `--alto-nav`), y usa `Math.max(0, …)`. El resto de las zonas (etiquetas, pastilla, líneas del titular) ya están bien porque se miden contra el origen de la portada. Comprueba también que `medir()` da el mismo resultado se corra con la página arriba o bajada, y que sigue siendo cierto para el tamaño que cambia desde el `ResizeObserver`.
- **Dónde:** `sitio/src/lib/capas3d.ts`, función `zonasDelContenido` (líneas 118-119).
- **Cómo lo voy a verificar:** cargo `/` a 1440 × 900, bajo 400 px con la rueda, cambio el tamaño a 1440 × 880, vuelvo arriba y tomo captura: las seis piezas visibles y en el mismo sitio que sin haber bajado (octaedro magenta arriba a la izquierda, cubo ácido arriba a la derecha sin cortar). Repito a 375 × 667 con scroll. Después `node fabrica/scripts/capturas.mjs T02` y `node fabrica/scripts/compuertas.mjs T02` en VERDE.

Sobre H8 (Menor): en la entrega de la r3 agrega la sección «Respuesta a CORRECCION-r2» que pide `fabrica/nucleo/plantillas/buzon.md`, y describe la medición con comandos que se puedan repetir.
