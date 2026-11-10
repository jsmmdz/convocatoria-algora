VEREDICTO: NO PASA

# QA r1 — T01 · Andamio

- **Tarea:** T01
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 05:50
- **Fin:** 2026-11-10 05:57
- **Intervenciones del autor:** 0

## Resumen del auditor

El código del constructor pasa todo lo que pude reproducir: 17 de 17 pruebas en verde contra un servidor limpio, check y build en verde, capturas sin defectos a 1440, 1280 y 1024. La compuerta `e2e` sale en **❌ en las dos corridas** (`COMPUERTAS-r1.md` y `COMPUERTAS-r1-2.md`) por un proceso suelto que dejó `capturas.mjs`. El constructor no podía ni debía matarlo (regla 5: solo puertos 4390–4399). Es un hallazgo Crítico del orquestador, no del código.

## Entregables

| Entregable de la tarea | Estado | Evidencia |
|---|---|---|
| 1. Proyecto Astro, estático, TS estricto, scripts `dev/build/check/preview`, dependencias exactas | OK | `sitio/package.json`: scripts presentes; dependencias = las de la tarea (más `astro`); `@astrojs/check`, `typescript`, `@playwright/test`, `@axe-core/playwright` en dev. `npm run check`: 0 errors, 0 warnings, 0 hints |
| 2. `astro.config.mjs` con `site`, `base`, barra apagada | OK | Leído: `site: process.env.SITIO_URL`, `base: process.env.SITIO_BASE ?? '/'`, `devToolbar: { enabled: false }` |
| 3. `tokens.css` con nombres exactos, temas, espacios, sombra, capas | OK | Leído. La prueba de tokens de marca (hex exactos en claro, oscuro del sistema y forzado) pasa. `--sombra: 4px 4px 0 var(--borde)`, `--margen`, `--gutter` exactos. Compuerta `hex-suelto` ✅ |
| 4. Fuentes de Fontsource, sin CDN | OK | Pruebas de fuentes (4 familias `loaded`) y «ninguna petición sale del propio sitio» pasan. Tildes y ñ visibles en capturas («Creación», «POSTÚLATE») |
| 5. Layout base: lang, viewport, título, descripción, tema antes de pintar, `data-listo` con respaldo 3,5 s | OK | `Base.astro` y `lib/listo.ts` leídos; `RESPALDO_MS = 3500`; prueba `data-listo` pasa |
| 6. Movimiento: GSAP + ScrollTrigger + una instancia de Lenis, sin Lenis con movimiento reducido | OK | `movimiento.ts` leído (`on('scroll', ScrollTrigger.update)`, `gsap.ticker.add`, `null` si reducido); la prueba de Lenis pasa en ambos modos |
| 7. Nav fija con logo en `--fuente-acento`, `#tema`, «Postúlate» a `#postulate` | OK | Prueba de navegación pasa; captura 1440 muestra la barra pegada arriba |
| 8. Pie de tinta a sangre con los dos textos | OK | Prueba del pie pasa; captura 1440 |
| 9. `index.astro` con h1 `[CONTENIDO DE T02]` y etiqueta `[CONVOCATORIA_27]` | OK | Captura 1440; marcadores listados en PENDIENTES |
| 10. `404.astro` con enlace por `BASE_URL` | OK | Prueba 404 pasa (estado 404, enlace «inicio» termina en `/`) |
| Sin JS la página se ve completa | OK por lectura | El tema se resuelve en CSS con `prefers-color-scheme`; ningún contenido depende de JS |
| Compuertas T01 en VERDE | **NO** | Ver H1: ❌ por un proceso suelto, no por el código |
| Capturas y foto de breakpoints a 1440/1280/1024 | OK | Ver «Pruebas y capturas» |

## Compuertas

Corrí `node fabrica/scripts/compuertas.mjs T01 --guardar` dos veces (queda `COMPUERTAS-r1.md` y `COMPUERTAS-r1-2.md`). Resultado idéntico: **ROJO**, un bloqueo.

- ✅ alcance (15 archivos propios, ninguno fuera de alcance), `check`, `build`, patrones, presupuestos (fuentes 240.444 B de 250.000; JS inicial 49.524 B gzip de 220.000).
- ❌ `npx playwright test tests/comunes tests/T01`: `código 1 · falta: passed`. Corrido a mano:

```
[WebServer] Another astro preview server is already running.
[WebServer]   URL:  http://localhost:4331
[WebServer]   PID:  82384
Error: Process from config.webServer was not able to start. Exit code: 1
```

Causa: el PID 82384 (hijo de `cmd.exe` 37980, hijo de `npx` 69840; los tres nacieron a las 05:48:44–46) es el `astro preview --port 4331` que lanza `capturas.mjs` y no se cierra. Coincide con la hora de la corrida de capturas del constructor. Playwright no arranca mientras el candado de Astro nombre ese proceso. Tras mi propia corrida de `capturas.mjs` el puerto 4331 quedó en `CLOSED`, pero el 82384 sigue vivo y el candado le sigue apuntando: la limpieza del script (taskkill por puerto) no alcanza al `node` hijo. Cambiar `PUERTO_PRUEBAS` no ayuda: el candado es por proyecto, no por puerto.

No lo maté: está fuera del rango 4390–4399 (regla 5), y los rodeos (`--force`, `astro preview stop`) también serían tocar un proceso ajeno.

**Reproducción de la función sin ese proceso.** Serví `sitio/dist` con un servidor propio en el puerto 4392 (script en mi carpeta temporal, 404 para rutas ausentes) y corrí las mismas pruebas con una configuración equivalente (sin `webServer` ni turno): `npx playwright test tests/comunes tests/T01` → **17 passed (13.3 s)**. El primer intento dio 13 rojos por un fallo mío del servidor (403 por la comparación de rutas en Windows), que corregí; el resultado válido es el segundo. Esto prueba el código; no sustituye a la compuerta.

Aviso ⚠️ `mobiliario` (`Nav.astro:29, 53, 55, 60`): lo leí. Son el borde inferior de la barra, el borde de los botones y la sombra dura de `--sombra`, todos pedidos por el punto 7 de la tarea y salidos de tokens. Está bien, no es hallazgo.

## Pruebas y capturas

**Qué cubren las pruebas:** hex exactos de marca en tres modos de tema; fondo papel/tinta según el sistema; botón de tema y persistencia al recargar; contraste de cuerpo ≥ 7:1 en ambos temas; cuatro fuentes cargadas y usadas por h1 y cuerpo; ninguna petición externa; `data-listo` < 4 s; Lenis presente o ausente según movimiento reducido; nav (logo con Rubik Bubbles, `href` a `#postulate`, fija tras bajar); pie (texto, fondo tinta, ancho completo); 404. Más las comunes: consola limpia, 375 px, axe, movimiento reducido, foco ≥ 3:1.

**Lo que la tarea pide y ninguna prueba comprueba** (anotado para el orquestador, no es del constructor):

- El tope de 3,5 s de `data-listo` (la prueba solo exige < 4 s y `load` llega antes).
- El foco en tema oscuro: la prueba de foco mide solo el tema que resuelve el navegador (claro por defecto). Lo calculé por tokens: cobalto sobre papel y ácido sobre tinta superan 3:1 con holgura.
- Que la nav y el pie «se sientan del manual» es juicio del autor, como dice la tarea.

**Capturas** (`node fabrica/scripts/capturas.mjs T01`, 10 imágenes, rehechas por mí). No existe `fabrica/proyecto/referentes/T01.json`, así que no aplica la comparación contra referente (4b).

- `inicio-1440.jpg`: barra fija de y = 0 a 62 con borde inferior de tinta; logo «algora» en Rubik Bubbles a la izquierda, botón «TEMA» blanco con borde y sombra, y «POSTÚLATE» en ácido a la derecha. Etiqueta mono `[CONVOCATORIA_27]` en y ≈ 281 y h1 serif `[CONTENIDO DE T02]` de y ≈ 320 a 420 sobre papel. Pie de tinta a sangre desde y = 630 con la línea del semillero en serif grande, partida en «Universidad El / Bosque», y la línea de estado en sans.
- `inicio-breakpoints.jpg`: a 1440, 1366, 1180, 1024 y 1920 nada se encima ni se corta por el contenido (los recortes verticales de 1366 × 650 y 844 × 390 son el tamaño de la ventana). A 320 px el h1 parte «CONTENID / O DE T02»: es responsive, que la tarea deja para `R`; no es hallazgo.
- `inicio-1440-completa.jpg`: la nav aparece a y ≈ 115 en vez de 0. Es el artefacto de una foto de página completa con barra fija; la prueba de nav mide `y <= 1` tras bajar y pasa. Coincide con lo que explica el constructor.

## Código

Sin fugas: `liberarMovimiento()` quita el ticker y destruye Lenis; el listener de `load` es `once`. Sin `any` ni `@ts-ignore`. Sin estado escrito a mano en `data-*` ni ramas para la prueba: el tema sale de `localStorage` y `dataset.theme` reales, Lenis es una instancia real condicionada por `matchMedia`. Peso dentro del presupuesto.

## Hallazgos

### `H1` · La compuerta e2e no puede correr: `capturas.mjs` deja vivo un `astro preview` que bloquea todo `playwright test`
- **Severidad:** Crítico
- **Dueño:** orquestador
- **Archivo:** `fabrica/scripts/capturas.mjs:75` y `:231-233` (spawn con `shell: true` y limpieza por `netstat/taskkill` sobre el puerto) y `sitio/playwright.config.ts` (`reuseExistingServer: false`)
- **Evidencia:** dos corridas de compuertas en ❌ (`COMPUERTAS-r1.md`, `COMPUERTAS-r1-2.md`); `Get-CimInstance` muestra el 82384 (`astro.mjs preview --port 4331`, 05:48:46) vivo con el puerto 4331 en `CLOSED`; el mismo conjunto de pruebas pasa 17/17 sin ese proceso.
- **Regla:** reglas.md § 5 (compuertas en verde) y la regla de procesos propios en 4390–4399: el constructor no puede liberarlo.

### `H2` · Shim `tipos-node.d.ts` por una prueba que no compila bajo `astro check`
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/src/tipos-node.d.ts`, `sitio/tests/comunes/rutas.ts`, `sitio/tsconfig.json`
- **Evidencia:** la entrega documenta 3 errores de `astro check` en `tests/comunes/rutas.ts` (sin `@types/node`) y que `tsconfig.json` no es de su tarea. El shim es un arreglo local declarado y razonable; chocaría si más adelante se instala `@types/node`. El constructor lo pidió bien en SOLICITUDES.
- **Regla:** tarea T01 («Nada más» en dependencias); propiedad de archivos (reglas § 3).

### `H3` · Las pruebas no verifican el tope de 3,5 s de `data-listo` ni el foco en tema oscuro
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/T01/t01.spec.ts:133`, `sitio/tests/comunes/sitio.spec.ts:90`
- **Evidencia:** lectura de las pruebas (ver «Lo que la tarea pide y ninguna prueba comprueba»).
- **Regla:** reglas § 5 («toda espera tiene salida»); paso 4 del rol del auditor.

## Estado

No hay hallazgo Mayor ni Crítico del constructor. H1 es un Crítico del orquestador: se escribe `ESCALADO.md` en esta misma ronda.
