# Entrega r2 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r2
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** Tue Nov 10 11:37 2026
- **Fin:** Tue Nov 10 11:55 2026
- **Intervenciones del autor:** 0

## Resumen
Corrijo H1 de `CORRECCION-r1.md` (H2 es del orquestador; no lo toqué). Las piezas 3D ya no cubren la pastilla, las etiquetas ni el texto del titular. Dos cambios en `sitio/src/lib/capas3d.ts`: (1) nuevas posiciones base en las franjas de arriba y de abajo, y (2) un paso de `medir` que aparta cada pieza de las zonas del contenido en cada tamaño. Además agrupé los números de escena en constantes nombradas al principio del módulo (H4). No cambié los factores de parallax ni dejé capas sin piezas (siguen 3 + 3).

## Archivos
Modificado (de `archivos`): `sitio/src/lib/capas3d.ts`. Nada más en esta ronda.

## Cambios en `capas3d.ts`
- **Posiciones (H1):** `POS_DETRAS` y `POS_DELANTE`. La ficha ácida pasó de `{ x: -0.86, y: -0.3 }` (justo sobre la pastilla) a `{ x: -0.88, y: -0.7 }`; el cubo ácido y el octaedro magenta subieron a `y: 0.66`; la moneda y el octaedro tomate y el cubo tinta bajaron (`-0.68`, `-0.82`, `-0.82`). Las piezas viven en las franjas de arriba y abajo, la franja central es del texto.
- **Apartado dinámico:** `zonasDelContenido()` lee (con `getBoundingClientRect` y `Range.getClientRects`) la banda que tapa la nav, cada etiqueta, la pastilla y cada fragmento de texto del titular. `apartar()` empuja cada pieza, representada por su esfera envolvente, por el camino más corto fuera de esas zonas (con `HOLGURA_CONTENIDO` de aire). Si no cabe, la pieza se achica en `ENCOGER` (1, 0.75, 0.55). Lo corre `medir`, que ya corría al cambiar el tamaño, así que se adapta a cada formato. Las posiciones configuradas siguen siendo el sitio preferido: si ya están libres, no se mueven.
- **Posición de reposo:** cada `Pieza` tiene `anclaje` (unidades de escena, ya apartado); `colocar` suma el cursor a ese anclaje. El movimiento con el cursor y el parallax por scroll no cambian (`PARALLAX_CURSOR_X/Y` conservan 1,6 y 1,2).
- **Constantes (H4):** `DISTANCIA_CAMARA`, `CAMPO_VISION`, `ANCHO_REF`, `ALTO_REF`, `ESCALA_MINIMA`, `ESCALA_VARIABLE`, `RUGOSIDAD`, `UMBRAL_ARISTAS`, `PARALLAX_CURSOR_X/Y`, las posiciones y los de apartado, todos al principio del módulo.

## Compuertas
`node fabrica/scripts/compuertas.mjs T02` en primer plano (11:52–11:54): **COMPUERTAS: VERDE**, `Bloquean: 0 · Avisos: 0`. check `0 errors · 0 warnings · 0 hints`; build `Complete!`; `npx playwright test tests/comunes tests/T02 tests/T01` ` passed`; patrones sin coincidencias; fuentes 168.748 B, JS inicial 68.002 B gzip. Sin ⚠️.

## Verificación
- **Capturas** (`node fabrica/scripts/capturas.mjs T02`, que abrí): `capturas/matriz/inicio/1440x900.jpg`, `1024x768.jpg`, `1180x820.jpg`, `667x375.jpg`, `375x667.jpg` y `844x390.jpg`. En todas la pastilla ácida se ve completa (redondeada, sin fundirse con la ficha), las tres etiquetas se leen enteras y ninguna pieza toca el titular. La ficha ácida queda abajo a la izquierda, el cubo ácido arriba a la derecha. A 667 × 375 las piezas se ven más pequeñas; el octaedro magenta queda pegado a la nav. Las hojas de comparación ya salen con el sitio en el nombre (`comparacion/unseen-A1.jpg`, etc.); no abrí esas hojas en esta ronda.
- **Medición del solape**, con un script mío en el scratchpad (no está en el repo): para cada tamaño oculta el contenido y la trama, toma 5 capturas con las piezas girando durante 2 s y cuenta píxeles de pieza a menos de 6 px de la pastilla, de cada etiqueta y de cada fragmento de texto del titular. Resultado en 13 tamaños: `ok` en 1440 × 900, 1280 × 720, 1024 × 768, 1180 × 820, 1920 × 1080, 1366 × 650, 375 × 667, 667 × 375, 390 × 844, 360 × 780, 320 × 568 y 768 × 1024; en 844 × 390 quedó 1 píxel dentro del margen de 6 px de la pastilla, es decir, sin contacto real. Antes del cambio el mismo script daba solape en 11 de los 13 tamaños. Medido sin mover el cursor; si el cursor mueve las piezas pueden cruzar el contenido un momento (parallax intencional).
- **Función, no solo cifra:** el apartado se calcula de lo que hay en pantalla (rectángulos reales del DOM), no está acomodado a los tamaños de las capturas; las pruebas de T02 (piezas visibles, parallax por razones, reducido, sin WebGL) siguen en verde.

## Decisiones
- Apartar en tiempo de ejecución en vez de solo mover números: con un titular que cambia de ancho entre 320 y 2560 px, una tabla fija de fracciones no cubre los formatos acostados pequeños. Las posiciones base siguen siendo las que el pulido puede ajustar.
- `FACTOR_ESFERA` 0,9: la pieza gira, así que se le da casi toda su esfera envolvente; es conservador con la ficha plana.

## Supuestos
- `fabrica/proyecto/perfil.md` no existe; sigo tomando `docs/2-TECNICO.md`, `compuertas.json` y la tarea como perfil (igual que en r1).
- H3 (espacios del titular) y la prueba de solape pedida en las notas del QA no están en esta ronda: no eran parte de la orden.

## PENDIENTES
- Pulido: posiciones y tamaños finales de las piezas, y el `.glb` del autor dentro de `pieza()`. Mascota final. Figura y opacidad de la trama.

## SOLICITUDES
- Opcional para el orquestador: una prueba en `sitio/tests/T02/` que mida el solape entre `[data-objeto]`, las etiquetas y las piezas (hoy lo cubre solo mi script de medición, que no está en el repo).
