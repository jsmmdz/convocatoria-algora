VEREDICTO: PASA

# QA r3 — T01 · Andamio

- **Tarea:** T01
- **Ronda:** r3 (sin entrega nueva: audita el árbol de hoy tras el commit `b1c66cb` del orquestador)
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 07:45
- **Fin:** 2026-11-10 08:05
- **Intervenciones del autor:** 0

## Resumen del auditor

El Crítico H4 de la r2 quedó resuelto: el orquestador versionó `fabrica/scripts/capturas.mjs` y `sitio/tsconfig.json` en `b1c66cb`, y `node fabrica/scripts/compuertas.mjs T01 --guardar` sale en **VERDE** (0 bloqueos, 1 aviso). El código del sitio no cambió desde la r1. Pasa; queda un Menor del orquestador (H3).

## Compuertas

Guardado como `COMPUERTAS-r1-4.md` (el script no distingue la ronda porque no hay entrega nueva). Commit base `b1c66cb`.

- ✅ `archivos-propios` (14), `fuera-de-alcance` (ninguno), `requiere`, `check` (0/0/0), `build`, `npx playwright test tests/comunes tests/T01`, patrones (`any`, `ts-ignore`, `hex-suelto`, `degradado`, `console-log`, `ruta-sin-base`, `voseo`: sin coincidencias), presupuestos (fuentes 240.444 B de 250.000; JS inicial 49.524 B gzip de 220.000).
- ⚠️ `mobiliario` (`Nav.astro:29, 53, 55, 60`): borde inferior de la barra, borde de los botones y sombra dura `--sombra`, pedidos por el punto 7 de la tarea y salidos de tokens. Lo vi en `inicio-1440.jpg`: son el borde de tinta de la barra y de los botones «TEMA» y «POSTÚLATE». No es hallazgo.

## Reproducción

- **Pruebas:** `npx playwright test tests/comunes tests/T01 --reporter=line` desde `sitio/`: **17 passed (21.6 s)**.
- **Servidor suelto:** corrí `node fabrica/scripts/capturas.mjs T01` y después listé los procesos con `Get-CimInstance` filtrando `astro` y `preview`: no queda ninguno (solo salieron los de mi propia consulta). El arreglo del orquestador funciona por segunda vez consecutiva.
- **`@types/node`:** `package.json` lo trae en desarrollo; `tsconfig.json` agrega `"node"` a `types` (diff de `b1c66cb`); `check` en 0/0/0 sin shim.
- **Dependencias de la tarea:** `package.json` trae `gsap`, `lenis`, las cuatro fuentes de Fontsource y `astro`; dev: `@astrojs/check`, `@axe-core/playwright`, `@playwright/test` (más `typescript` y `@types/node`). Nada ajeno.
- **Respaldo de `data-listo`:** leí `src/lib/listo.ts`: `RESPALDO_MS = 3500` con `setTimeout(marcarListo)`. Real, no escrito a mano.
- **Código acomodado a la prueba:** no encontré. El tema sale de `localStorage` y `dataset.theme`; Lenis es una instancia real condicionada por `matchMedia`; las fuentes se miden por `document.fonts`.

## Entregables

Sin cambios respecto de la tabla de `QA-r1.md`: los 10 puntos de «Qué construyes» están OK, con la evidencia allí citada y las pruebas de hoy. Lo que en la r1 y la r2 estaba pendiente (compuertas T01 en verde) ahora está **OK**: `COMPUERTAS-r1-4.md`.

## Lo que veo

No existe `fabrica/proyecto/referentes/T01.json`: no aplica la comparación contra referente (4b). Lo que veo en las capturas de hoy:

- `inicio-1440.jpg` (1440 × 900): barra fija de y = 0 a 62 con línea inferior de tinta; logo «algora» en Rubik Bubbles a la izquierda (x ≈ 44 a 137); a la derecha el botón «TEMA» blanco con borde y sombra dura (x ≈ 1187 a 1255) y «POSTÚLATE» en ácido con texto tinta (x ≈ 1285 a 1397). Etiqueta mono `[CONVOCATORIA_27]` en y ≈ 281; h1 serif `[CONTENIDO DE T02]` de y ≈ 320 a 425 sobre papel. Pie de tinta a sangre desde y = 630 con «Semillero Algora · Creación Digital · Universidad El / Bosque» en serif blanco y «Convocatoria abierta · fechas por confirmar» en sans. Tildes correctas. Nada encimado ni cortado.
- `inicio-breakpoints.jpg`: a 1440, 1366, 1180, 1024 y 1920 el h1, la etiqueta, la barra y el pie no se encimán ni se cortan por contenido (el pie se ve recortado en 1366 × 650 y en 844 × 390 por el alto de la ventana). A 320 px el h1 parte «CONTENID / O DE T02»: es responsive, que la tarea deja para `R`; no es hallazgo.

## Hallazgos

### `H4` (r2) · `fuera-de-alcance` en ❌ — **RESUELTO**
Commit `b1c66cb`; compuerta en ✅ «ninguno».

### `H1` y `H2` (r1) — **RESUELTOS** (ver QA-r2).

### `H3` · Las pruebas no verifican el tope de 3,5 s de `data-listo` ni el foco en tema oscuro
- **Severidad:** Menor
- **Dueño:** orquestador
- **Archivo:** `sitio/tests/T01/t01.spec.ts:133` (exige menos de 4 s; con `load` llega antes del respaldo), `sitio/tests/comunes/sitio.spec.ts`
- **Evidencia:** el respaldo existe en código (leído arriba), pero ninguna prueba lo ejercita; el foco se mide solo en el tema que resuelve el navegador. Por tokens, cobalto sobre papel y ácido sobre tinta superan 3:1. No bloquea.
- **Regla:** reglas § 5 («toda espera tiene salida»); rol del auditor, paso 4.

## Estado

Sin Críticos ni Mayores. PASA: sigue la auditoría final del orquestador. Como no hay Crítico ni Mayor del orquestador, no se escribe sección nueva en `ESCALADO.md`.
