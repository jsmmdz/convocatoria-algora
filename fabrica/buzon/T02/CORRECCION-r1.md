# Corrección r1 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 11:36
- **Fin:** 2026-11-10 11:38
- **Intervenciones del autor:** 0

Solo hay un hallazgo del constructor con efecto en el veredicto (H1). H2 es del orquestador y está en `ESCALADO.md`: no lo toques.

### `H1` · Las piezas del frente se montan sobre la pastilla y las etiquetas
- **Qué cambiar:** reubica las piezas de `DELANTE` y `DETRAS` (y, si hace falta, la escala por ancho/alto) para que ninguna cubra la pastilla `[data-objeto]`, las etiquetas ni las letras del titular a 1440 × 900, 1280 × 720, 1024 × 768 y 1180 × 820. Hoy la ficha ácida `{ x: -0.86, y: -0.3 }` cae sobre el extremo izquierdo de la pastilla (del mismo color, así que se funde con ella). Las posiciones están en fracciones del semiancho/semialto: sube la ficha o llévala más al borde, y verifica que la pastilla se vea completa. Haz la misma comprobación a 375 × 667 y 667 × 375, donde el cubo ácido tapa «[CONVOCATORIA_27]» y el octaedro magenta se mete sobre «[SEMILLERO». No cambies los factores de parallax ni dejes las capas sin piezas. Al terminar, agrupa los números de escena (cámara, posiciones, escala) en constantes nombradas al principio de `capas3d.ts`.
- **Dónde:** `sitio/src/lib/capas3d.ts` (`DETRAS`, `DELANTE`, `medir`)
- **Cómo lo voy a verificar:** `node fabrica/scripts/capturas.mjs T02` y abrir `capturas/matriz/inicio/1024x768.jpg`, `1180x820.jpg`, `1440x900.jpg`, `667x375.jpg`, `375x667.jpg` y `844x390.jpg`: pastilla completa y etiquetas sin tapar en todas. Después `node fabrica/scripts/compuertas.mjs T02` en VERDE.

Sobre H3 y H4 (Menores): no hace falta que las corrijas en esta ronda; H4 se resuelve de paso con lo que pide H1.
