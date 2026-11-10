VEREDICTO: NO PASA

# QA r2 — T01 · Andamio

- **Tarea:** T01
- **Ronda:** r2 (sin entrega nueva: audita el árbol de hoy tras los arreglos del orquestador)
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 05:58
- **Fin:** 2026-11-10 06:15
- **Intervenciones del autor:** 0

## Resumen del auditor

H1 de la r1 quedó resuelto: la compuerta e2e ahora pasa y `capturas.mjs` ya no deja vivo el servidor. Pero `node fabrica/scripts/compuertas.mjs T01 --guardar` sigue en **ROJO** por otra compuerta: `fuera-de-alcance` marca los dos archivos que el orquestador editó para el arreglo (`fabrica/scripts/capturas.mjs` y `sitio/tsconfig.json`), porque siguen sin versionar. No es del constructor ni del código del sitio, que no cambió. Por regla, un ❌ es Crítico: NO PASA, dueño orquestador.

## Compuertas

`COMPUERTAS-r2` quedó guardado por el script como `COMPUERTAS-r1-3.md` (el script no distingue la ronda: no hubo entrega nueva).

- ✅ `archivos-propios` (14 cambiados dentro de «archivos», incluido `package.json` con `@types/node`), `check` (0 errors, 0 warnings, 0 hints), `build`, **`npx playwright test tests/comunes tests/T01`**, patrones, presupuestos (fuentes 240.444 B de 250.000; JS inicial 49.524 B gzip de 220.000).
- ❌ `fuera-de-alcance`: `fabrica/scripts/capturas.mjs — ruta protegida` y `sitio/tsconfig.json`.
- ⚠️ `mobiliario` (`Nav.astro:29, 53, 55, 60`): igual que en la r1. Borde inferior de la barra, borde de los botones y sombra dura de `--sombra`, pedidos por el punto 7 de la tarea y salidos de tokens. Está bien, no es hallazgo.

## Reproducción de lo que el orquestador afirma

- **Pruebas:** corrí `npx playwright test tests/comunes tests/T01 --reporter=line` desde `sitio/` después de mi propia corrida de capturas: **17 passed (13.2 s)**. Antes de la r1 daba «Another astro preview server is already running».
- **Cierre del servidor de capturas:** corrí `node fabrica/scripts/capturas.mjs T01` (10 capturas, sin errores) y luego listé los procesos con `Get-CimInstance`: no queda ningún `astro preview` ni `npx` de astro; el puerto 4331 solo muestra conexiones `TIME_WAIT`, sin `LISTENING`. La función del arreglo (`taskkill /PID <pid> /T /F` síncrono sobre el hijo de `shell: true`, leído en el diff) se comprueba: la compuerta e2e corrió en verde justo antes de esa captura y las pruebas volvieron a pasar justo después.
- **`@types/node`:** `package.json` trae `@types/node ^24.19.2` en dev y `tsconfig.json` agrega `"node"` a `types`; `sitio/src/tipos-node.d.ts` ya no existe (listado de `sitio/src`). `astro check` = 0/0/0 en la compuerta. Dentro de alcance para `package.json`.
- **Código acomodado a la prueba:** no encontré. El diff de `capturas.mjs` solo toca el cierre del servidor; el del `tsconfig.json`, solo `types`.

## Entregables

Sin cambios respecto de la tabla de `QA-r1.md`: los 10 puntos de «Qué construyes» siguen OK (el árbol del sitio no cambió salvo `package.json`/`package-lock.json` por `@types/node`). Lo que antes estaba «NO» (compuertas T01 en verde) ahora **solo falla por `fuera-de-alcance`**, no por la e2e.

## Pruebas y capturas

- No existe `fabrica/proyecto/referentes/T01.json`: no aplica 4b.
- `inicio-1440.jpg` (rehecha hoy): barra fija de y = 0 a 62 con borde inferior de tinta; logo «algora» en Rubik Bubbles a la izquierda; botón «TEMA» blanco con borde y sombra dura y «POSTÚLATE» en ácido a la derecha; etiqueta mono `[CONVOCATORIA_27]` en y ≈ 281; h1 serif `[CONTENIDO DE T02]` de y ≈ 320 a 420 sobre papel; pie de tinta a sangre desde y = 630 con «Semillero Algora · Creación Digital · Universidad El / Bosque» en serif y «Convocatoria abierta · fechas por confirmar» en sans. Tildes y ñ correctas. Nada encimado.
- Lo que la tarea pide y ninguna prueba comprueba (sigue sin resolverse, Menor del orquestador): el tope de 3,5 s de `data-listo` (la prueba, `t01.spec.ts:133`, exige menos de 4 s) y el foco en el tema oscuro forzado.

## Hallazgos

### `H1` (r1) · `capturas.mjs` dejaba vivo un `astro preview` — **RESUELTO**
Reproducido arriba. Sin proceso suelto y con e2e en verde.

### `H2` (r1) · Shim `tipos-node.d.ts` — **RESUELTO**
Archivo borrado, `@types/node` instalado, `astro check` limpio.

### `H4` · La compuerta `fuera-de-alcance` sale en ❌ por los arreglos sin versionar del orquestador
- **Severidad:** Crítico
- **Dueño:** orquestador
- **Archivo:** `fabrica/scripts/capturas.mjs` (ruta protegida), `sitio/tsconfig.json` (no está en `archivos` de T01)
- **Evidencia:** `COMPUERTAS-r1-3.md`: `❌ fuera-de-alcance · fabrica/scripts/capturas.mjs — ruta protegida<br>sitio/tsconfig.json`; `git status` los muestra como `M`; `git diff` confirma que son los cambios del cierre del servidor y de `types`, no del constructor.
- **Regla:** `fabrica/nucleo/roles/auditor.md` § 1 («Cualquier ❌ es un hallazgo crítico»); reglas § 5 (compuertas en verde).
- **Qué hacer:** que el orquestador versione esos dos archivos (commit) para que dejen de contar como cambiados contra el commit base, y vuelva a correr `node fabrica/scripts/compuertas.mjs T01 --guardar`. Alternativa: agregar `sitio/tsconfig.json` a `archivos` de T01, pero `capturas.mjs` es ruta protegida y solo el commit lo limpia. Con eso el árbol no tendría más ❌ y T01 pasaría sin otra ronda de construcción.

### `H3` · Las pruebas no verifican el tope de 3,5 s de `data-listo` ni el foco en tema oscuro
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/T01/t01.spec.ts:133`, `sitio/tests/comunes/sitio.spec.ts:90`
- **Evidencia:** igual que la r1; el orquestador ya declaró que las escribe antes de T02. No bloquea.
- **Regla:** reglas § 5 («toda espera tiene salida»); paso 4 del rol del auditor.

## Estado

Ningún hallazgo del constructor. H4 es un Crítico del orquestador: se agrega la sección de la r2 en `ESCALADO.md` y el ciclo se detiene ahí.
