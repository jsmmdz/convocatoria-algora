# Entrega r4 — T03 · Hitos

- **Tarea:** T03
- **Ronda:** r4
- **Modelo:** gemini-4-hydrogen-high
- **Fábrica:** v5.0
- **Inicio:** Sun Nov 15 09:56:14 HPS 2026
- **Fin:** Sun Nov 15 10:08:04 HPS 2026
- **Intervenciones del autor:** 0

## Respuesta a CORRECCION-r3

| Hallazgo | Qué hice | Cómo lo verifiqué |
|---|---|---|
| `E2` · El viajero se pinta encima de los bloques | Moví `[data-guia]` dentro de `[data-hitos-pista]` en `sitio/src/components/Hitos.astro`, con capas explícitas (`z-index: 1` en `.hitos__linea`, `z-index: 2` en `.hitos__guia`, `z-index: 3` en `.hito__bloque`), y cambié su coordenada horizontal en `sitio/src/lib/hitos.ts` (`colocar()`) de `xPantalla - lado / 2` a `xPista - lado / 2`. | `node fabrica/scripts/compuertas.mjs T03 --guardar` → `COMPUERTAS: VERDE` (pasan `viajero a 1440×900` y `viajero a 1024×768`); confirmado en `capturas/estado-hitos-tinta.jpg` y `capturas/comparacion/unseen-A4b.jpg`, donde el bloque tomate tapa por completo al unicornio al cruzarlo. |
| `E3` · Al inclinarse, el viajero se despega de la línea hasta 282 px | Bajé `--inclinacion-desp` de `8` a `1.5` en `sitio/src/styles/tokens.css`, manteniendo `transform-origin: 50% 100%`, `lerp` `0.04` y tope `40`. | `node fabrica/scripts/compuertas.mjs T03 --guardar` → `COMPUERTAS: VERDE` (pasan `inclinación en movimiento: los cascos se quedan en la unión sólida/punteada, como mucho 2 px por grado de inclinación` e `inclinación: se inclina con la velocidad...`). |
| `E4` · La silueta del viajero no se ve en los hitos invertidos | En `sitio/src/components/Hitos.astro`, apliqué `mix-blend-mode: difference` a `.hitos__guia`, `color: var(--color-papel)` a `.hitos__viajero` y su halo `drop-shadow` con `var(--color-tinta)`. | `node fabrica/scripts/compuertas.mjs T03 --guardar` → `COMPUERTAS: VERDE` (pasan `viajero (claro)` y `viajero (oscuro)` con contraste ≥ 3:1 en hitos 1, 3 y 5); verificado visualmente en `fabrica/buzon/T03/tmp/tinta-light.png` y `tinta-dark.png`. |

## Resumen
Corregidos los tres defectos del viajero de `CORRECCION-r3.md` (`E2`, `E3`, `E4`): el viajero queda dentro de la pista entre la línea y los bloques, su desplazamiento al inclinarse baja a 1,5 px por grado y su silueta se mezcla con `difference` para leerse llena sobre fondos normales e invertidos en ambos temas. Quedaron sin tocar las pruebas, la onda y la x del viajero; las compuertas pasaron en `VERDE` sin bloqueos ni avisos.

## Archivos
- Modificados:
  - `sitio/src/components/Hitos.astro`
  - `sitio/src/lib/hitos.ts`
  - `sitio/src/styles/tokens.css`
- Generados en buzón:
  - `fabrica/buzon/T03/COMPUERTAS-r3-5.md`
  - `fabrica/buzon/T03/capturas/**` (regeneradas con `capturas.mjs T03`)
  - `fabrica/buzon/T03/tmp/ver-tinta.mjs`, `fabrica/buzon/T03/tmp/tinta-light.png`, `fabrica/buzon/T03/tmp/tinta-dark.png`

## Compuertas
`node fabrica/scripts/compuertas.mjs T03 --guardar` en primer plano → **`COMPUERTAS: VERDE`** (Bloquean: 0 · Avisos: 0), guardado en `fabrica/buzon/T03/COMPUERTAS-r3-5.md`:
- `Alcance`: 4 archivos propios dentro de `archivos`, 0 fuera de alcance, pruebas `tests/comunes`, `tests/T03`, `tests/T01`, `tests/T02`.
- `npm run check`: `0 errors · 0 warnings · 0 hints`.
- `npm run build`: `Complete!`.
- `npx playwright test tests/comunes tests/T03 tests/T01 tests/T02 --reporter=line`: `passed` (sin reintentos ni avisos).
- `Patrones`: todos sin coincidencias (cero hex sueltos, cero voseo, cero `any`).
- `Presupuestos`: fuentes `168.748` bytes / máx `250.000`; JS inicial `69.387` bytes gzip en 3 archivo(s) + inline / máx `220.000`.

## Verificación
- `node fabrica/scripts/capturas.mjs T03` → 17 capturas en `fabrica/buzon/T03/capturas/` más las 20 vistas de `capturas/matriz/inicio/`.
- Revisión visual de las hojas y estados:
  - `fabrica/buzon/T03/capturas/estado-hitos-1.jpg`: unicornio en tinta apoyado en la unión sólida/punteada con halo claro, a la izquierda del bloque ácido.
  - `fabrica/buzon/T03/capturas/estado-hitos-2.jpg` y `fabrica/buzon/T03/capturas/comparacion/unseen-A3.jpg`: unicornio en tinta sobre la unión sólida/punteada a la derecha del bloque magenta, sin quedar encima del bloque.
  - `fabrica/buzon/T03/capturas/estado-hitos-tinta.jpg` y `fabrica/buzon/T03/capturas/comparacion/unseen-A4b.jpg`: en el estado `hitos-tinta`, la x del viajero cae detrás del bloque tomate («Usuarios») y el bloque lo tapa por completo; la línea blanca entra sólida por la izquierda del bloque y sale punteada por la derecha.
  - `fabrica/buzon/T03/capturas/inicio-breakpoints.jpg` y `inicio-390-completa.jpg`: sin cortes ni encimados en la portada ni en el apilado móvil.
- Sonda visual puntual en `fabrica/buzon/T03/tmp/ver-tinta.mjs` (puerto `4395`, servidor cerrado en `finally`; `netstat -ano | findstr ":439"` sin puertos en `LISTENING`):
  - `fabrica/buzon/T03/tmp/tinta-light.png` (tema claro, hito 3 en tinta): el cuerpo del unicornio se ve lleno en papel sobre el fondo tinta, apoyado sobre la unión sólida/punteada.
  - `fabrica/buzon/T03/tmp/tinta-dark.png` (tema oscuro, hito 3 invertido en papel): el cuerpo del unicornio se ve lleno en tinta sobre el fondo papel, apoyado sobre la unión sólida/punteada.

## Decisiones
- **E4 con `mix-blend-mode: difference` sobre `.hitos__guia`:** elegí mezclar `.hitos__guia` con `difference` usando `color: var(--color-papel)` para la silueta y `var(--color-tinta)` para el halo `drop-shadow`, en lugar de alternar un atributo por hito desde JS. Así el unicornio invierte su tono automáticamente sobre fondos normales e invertidos en ambos temas (y también al cruzar la frontera entre un hito y el siguiente), sin hex fuera de `tokens.css` y compatible con el selector de máscara de `t03.spec.ts`.
- **Capas explícitas (`1 / 2 / 3`):** dentro de `.hitos__pista` puse `.hitos__linea` en `z-index: 1`, `.hitos__guia` en `z-index: 2` y `.hito__bloque` en `z-index: 3` para que el orden de apilamiento (`línea < viajero < bloque`) no dependa del orden en el DOM.

## Supuestos
- `SIN_TOKEN = 1` en `sitio/src/lib/hitos.ts` sigue como respaldo neutro si faltara un token en tiempo de ejecución.

## PENDIENTES
- Reemplazo de la silueta provisional de `Mascota.astro` cuando llegue el asset definitivo del autor (D-5).

## SOLICITUDES
- Ninguna.
