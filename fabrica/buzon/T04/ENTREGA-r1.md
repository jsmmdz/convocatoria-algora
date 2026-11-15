# Entrega r1 — T04 · Productos y marco de tinta

- **Tarea:** T04
- **Ronda:** r1
- **Modelo:** gemini-4-hydrogen-high
- **Fábrica:** v5.0
- **Inicio:** Sun Nov 15 14:47:31 HPS 2026
- **Fin:** Sun Nov 15 15:01:48 HPS 2026
- **Intervenciones del autor:** 0

## Resumen
Integré la tarea T04 uniendo las subtareas paralelas S1 (`Productos.astro`, `productos-fichas.ts`) y S2 (`marco-tinta.ts`) mediante `sitio/src/lib/productos.ts`, los tokens en `sitio/src/styles/tokens.css` y el montaje en `sitio/src/pages/index.astro`. El pin único en dos tramos, la llegada en vuelo de las 7 fichas, la entrada letra por letra y la apertura diferida del marco de tinta WebGL corren en verde con las compuertas completas y las capturas verificadas visualmente.

## Subtareas integradas

### Subtarea S1 · Fichas y bloque (`ENTREGA-r1-S1.md`)
- **Qué entregó S1:** `sitio/src/components/Productos.astro` (marcado del contrato, CSS de respaldo en rejilla de 2 columnas en angosto y CSS del modo horizontal bajo `data-modo='horizontal'` + `data-marco-listo`) y `sitio/src/lib/productos-fichas.ts` (`prepararFichas` con `vuelo`, `letras()` idempotente K3 y `restaurar()`).
- **Qué se integró:** en `productos.ts` se activa `data-modo="horizontal"` dentro de `gsap.matchMedia()` para `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`, se liga `fichas.vuelo` desde `top 55%` hasta exactamente la mitad del pin (`pinTrigger` de `--productos-pin` pantallas con `scrub: --productos-scrub`), se dispara `fichas.letras()` al entrar y se llama `fichas.restaurar()` al desmontar el modo horizontal. Se atendió la solicitud de S1 sobre `data-marco-listo` y se definió `--ficha-texto-3` y `--ficha-texto-7` en `tokens.css` como `var(--color-tinta)` (ver Decisiones y Supuestos).

### Subtarea S2 · Marco de tinta (`ENTREGA-r1-S2.md`)
- **Qué entregó S2:** `sitio/src/lib/marco-tinta.ts` con `montarMarco(canvas)` (shader OGL K2 con `fbm` direccional, `sdRectRedondeado`, borde ácido variable hasta `--marco-pincel` px, ciclo de vida seguro con `isContextLost`, `IntersectionObserver` y DPR tope `--marco-dpr-max`).
- **Qué se integró:** se cargó `./marco-tinta` de forma diferida con `import()` solo cuando `section[data-productos]` está a una pantalla de distancia (`ScrollTrigger` de proximidad), se condujo `marco.progreso(power2.in(t))` en `0.26–0.90` de la segunda mitad del pin (después de apagar titular, etiqueta, botón y fichas en `0.12–0.26` con `autoAlpha: 0`), se conectó `marco.redimensionar()` al evento `refresh` de `ScrollTrigger` y se destruyó al alejarse, al perder el contexto WebGL o al salir del modo horizontal.

## Archivos
- Creado: `sitio/src/lib/productos.ts`
- Modificado: `sitio/src/styles/tokens.css`
- Modificado: `sitio/src/pages/index.astro`
- Integrados de S1 y S2 (sin reescribir): `sitio/src/components/Productos.astro`, `sitio/src/lib/productos-fichas.ts`, `sitio/src/lib/marco-tinta.ts`

## Compuertas
`COMPUERTAS: VERDE` con `node fabrica/scripts/compuertas.mjs T04` (`Bloquean: 0 · Avisos: 1`):
- ⚠️ `Patrones / mobiliario` (`sitio/src/components/Productos.astro:101, 102, 115, 147, 148`): corresponde al borde `--borde-ancho` y a la sombra dura `--sombra` / `--sombra-hover` del manual de marca para la pastilla `Postúlate` y las fichas tipográficas (solicitado en el punto 2 de `T04-productos.md`).

## Verificación
1. `node fabrica/scripts/compuertas.mjs T04` (después de la última edición de código):
   - `COMPUERTAS: VERDE · Bloquean: 0 · Avisos: 1`
   - `npm run check`: `0 errors · 0 warnings · 0 hints`
   - `npm run build`: `Complete!`
   - `npx playwright test tests/comunes tests/T01 tests/T02 tests/T03 --reporter=line`: `passed`
   - `fuentes`: `168.748 bytes / máx 250.000`
   - `js-inicial`: `70.638 bytes gzip en 3 archivo(s) + inline / máx 220.000` (OGL y `marco-tinta` quedaron fuera del JS inicial).
2. `node fabrica/scripts/capturas.mjs T04`:
   - 15 capturas generadas en `fabrica/buzon/T04/capturas/`:
     - `fabrica/buzon/T04/capturas/inicio-telefonos.jpg`
     - `fabrica/buzon/T04/capturas/inicio-acostado-tablet.jpg`
     - `fabrica/buzon/T04/capturas/inicio-escritorio-ancho.jpg`
     - `fabrica/buzon/T04/capturas/inicio-breakpoints.jpg`
     - `fabrica/buzon/T04/capturas/inicio-1440.jpg`
     - `fabrica/buzon/T04/capturas/inicio-1440-completa.jpg`
     - `fabrica/buzon/T04/capturas/inicio-1440-reducido.jpg`
     - `fabrica/buzon/T04/capturas/inicio-390.jpg`
     - `fabrica/buzon/T04/capturas/inicio-390-completa.jpg`
     - `fabrica/buzon/T04/capturas/inicio-390-reducido.jpg`
     - `fabrica/buzon/T04/capturas/estado-piezas.jpg`
     - `fabrica/buzon/T04/capturas/estado-marco.jpg`
     - `fabrica/buzon/T04/capturas/comparacion/tabletales-A3.jpg`
     - `fabrica/buzon/T04/capturas/comparacion/tabletales-A4.jpg`
     - `fabrica/buzon/T04/capturas/comparacion/tabletales-A5.jpg`
   - Revisión visual directa: en `estado-piezas.jpg` y `tabletales-A4.jpg` / `tabletales-A5.jpg` se ven el bloque cobalto a sangre, `[PRODUCTOS]`, `¿Cuál es el tuyo?`, el botón `POSTÚLATE` (146×47 px) y las 7 fichas alrededor sin superposición; en `estado-marco.jpg` y `tabletales-A3.jpg` el borde ácido orgánico con ruido `fbm` abre el hueco transparente sobre «Cómo funciona»; en `inicio-390-completa.jpg` la rejilla de 2 columnas y `[data-siguiente]` debajo salen sin cortes ni scroll horizontal.
   - Nota de script: `capturas.mjs` imprimió `⚠ L1: ningún estado se llama «bloque»` porque `fabrica/proyecto/referentes/T04.json` referencia `estado: "bloque"` en `L1` pero solo define `estados` `piezas` y `marco`.
3. Script de verificación funcional `node fabrica/buzon/T04/tmp/verificar-t04.mjs` sobre `astro preview`:
   - `1440x900`, `1280x720` y `1024x768`: consola `errores: []`, `jsInicialEnCarga: 0` para `marco-tinta|ogl`, `jsAlLlegar: 1` al entrar en proximidad, `choquesCentro: []`, `fueraViewport: []`, `titularTexto: "¿Cuál es el tuyo?"`, `botonTam: "146x47"`; en estado `marco` (`y=9135` a 1440×900) `titularOpacity: "0"`, `botonVisibility: "hidden"`, todas las fichas con `opacity: "0"`, y `pieVisible: true` al final del scroll.
   - Movimiento reducido (`1440x900`) y sin WebGL (`1440x900`): `modo: null`, `canvasDisplay: "none"`, las 7 fichas visibles con `opacity: "1"`, `[data-siguiente]` visible debajo y 0 errores de consola.

## Decisiones
- **Contraste en fichas 3 y 7 (tomate):** en `sitio/src/styles/tokens.css` fijé `--ficha-texto-3` y `--ficha-texto-7` en `var(--color-tinta)` (`4.99:1` sobre tomate según medición de S1, igual que `.hito[data-color='tomate']` en `Hitos.astro`), porque `var(--color-papel)` sobre tomate da `3.66:1` y viola el punto 2 de `T04-productos.md` («Texto con contraste ≥ 4,5:1 sobre su color») y las pruebas comunes de `axe` (WCAG 2.2 AA).
- **Respaldo sin WebGL:** en `sitio/src/lib/productos.ts` comprobé `hayWebGL()` antes de activar el modo horizontal con `gsap.matchMedia()`, cumpliendo el punto 6 de la tarea («Respaldo y movimiento reducido (sin WebGL, sin JS o prefers-reduced-motion): sin pin ni canvas»).
- **Apagado con `autoAlpha`:** en la segunda mitad del pin usé `autoAlpha: 0` (`opacity: 0` + `visibility: hidden`) en lugar de solo `opacity: 0` para evitar que el enlace `#postulacion` invisible quede recibiendo foco o clics encima de `[data-siguiente]`.

## Supuestos
- `fabrica/proyecto/perfil.md` no existe en el repositorio; se aplicaron los contratos de `docs/1-PRODUCTO.md`, `docs/2-TECNICO.md` y `fabrica/proyecto/tareas/T04-productos.md`.
- Se asume la prioridad del requisito de accesibilidad (`≥ 4,5:1` / `axe` WCAG 2.2 AA) sobre la nota inicial «papel sobre el tomate» de `T04-productos.md`; si en pulido se prefiere texto en papel, habría que ajustar el tono de `--color-tomate` o tratarlo como decisión de dirección.
- `fabrica/proyecto/referentes/T04.json` (fuera de alcance) omite un estado `"bloque"` para `L1`; se asume que el orquestador lo ajusta si quiere esa hoja de comparación.

## PENDIENTES
Ninguno (la sección provisional `[data-siguiente]` la reemplaza `T05`).

## SOLICITUDES
Ninguna para cerrar T04 (nota informativa: si se desea comparar `L1` en `capturas.mjs`, falta definir el estado `"bloque"` en `fabrica/proyecto/referentes/T04.json`).
