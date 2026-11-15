# Corrección r1 — T03 · Hitos

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 19:43 (salida de `date`)
- **Fin:** 2026-11-10 19:44 (salida de `date`)
- **Intervenciones del autor:** 0

### `H1` · Etiquetas del hito invertido sin color (aspecto A4b no se ve)
- **Qué cambiar:** en los hitos con `data-invertido`, las etiquetas (`[data-hito-etiquetas]`) van en un color de acento en lugar del color del texto invertido, como las etiquetas rojas de unseen A4b. Define un token (por ejemplo `--etiqueta-invertida`) en `tokens.css`, por tema: el acento del tema contrario, es decir `--color-acido` donde el hito invertido es tinta (tema claro) y `--color-cobalto` donde es papel (tema oscuro), para que el contraste siga ≥ 4,5:1 contra el fondo real (la prueba «fondos» lo exige en los dos temas). Los hitos 1, 2 y 4 no cambian. Si usas otro color, el contraste de la etiqueta debe seguir ≥ 4,5:1 en claro y en oscuro.
- **Dónde:** `sitio/src/styles/tokens.css` (token nuevo y su valor en cada tema) y `sitio/src/components/Hitos.astro` (la regla `.hito[data-invertido]`, hoy `--hito-suave: var(--texto-invertido)`, y `.hito__etiquetas`).
- **Cómo lo voy a verificar:** `node fabrica/scripts/compuertas.mjs T03` en verde (en especial «fondos (claro)» y «fondos (oscuro)»); `node fabrica/scripts/capturas.mjs T03` y, en `capturas/`, una captura donde `[USUARIOS] [03/05]` o `[NOMBRE] [05/05]` se vean en color sobre el fondo invertido, en tema claro.

### `H2` · El viajero tapa la palabra del bloque en algunos pasos
- **Qué cambiar:** opcional. Si hay una salida barata que no toque lo que queda para el pulido (la x del viajero y su tamaño), tómala; si no, déjalo y repítelo en Supuestos.
- **Dónde:** `sitio/src/components/Hitos.astro`
- **Cómo lo voy a verificar:** captura propia en el paso donde el viajero cruza el bloque 3 (scroll ≈ 4150 a 1440×900).

### `H3` · Valores de diseño de la onda como literales en TypeScript
- **Qué cambiar:** pasa a tokens de `tokens.css` los pesos y fases de los dos senos y el paso de muestreo (hoy `0.65`, `0.35`, `0.6`, `2.1`, `8` en `trazar`), y lee los respaldos de `leerNumero` de una sola constante, no repetidos. El trazo debe quedar idéntico.
- **Dónde:** `sitio/src/lib/hitos.ts`, `sitio/src/styles/tokens.css`
- **Cómo lo voy a verificar:** compuertas en verde y misma onda en `capturas/estado-hitos-2.jpg` (comparación visual con la r1).

### `H4` · La entrega afirma lo que no vio
- **Qué cambiar:** en `ENTREGA-r2.md`, escribe tu propia lectura de las capturas del horizontal a 1280 y 1024 (por ejemplo con tu propio barrido en `fabrica/buzon/T03/tmp/`): qué viste, dónde, y que no hay nada encimado ni cortado.
- **Dónde:** `fabrica/buzon/T03/ENTREGA-r2.md`
- **Cómo lo voy a verificar:** leer la sección Verificación de la entrega y abrir las capturas que cite.

`H5` es del orquestador (pruebas que no cubren requisitos): no hay nada que hacer aquí.
