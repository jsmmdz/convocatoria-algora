# Corrección r1 — T01

- **Tarea:** T01
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 05:50
- **Fin:** 2026-11-10 05:57
- **Intervenciones del autor:** 0

## Para el constructor

**No hay trabajo para el constructor en esta ronda.** Los tres hallazgos de `QA-r1.md` (H1 Crítico, H2 y H3 Menores) son del orquestador. El código de T01 reprodujo en verde sus 17 pruebas contra un servidor limpio; no cambies nada. El ciclo se detiene en `ESCALADO.md` hasta que el orquestador libere el proceso suelto y vuelva a correr las compuertas.

### `H1` · La compuerta e2e no puede correr: `capturas.mjs` deja vivo un `astro preview` que bloquea todo `playwright test`
- **Qué cambiar:** nada en `sitio/`. Lo resuelve el orquestador (cerrar el proceso 82384 y sus padres 37980 y 69840, y corregir la limpieza de `capturas.mjs`).
- **Dónde:** `fabrica/scripts/capturas.mjs`
- **Cómo lo voy a verificar:** `node fabrica/scripts/compuertas.mjs T01 --guardar` debe salir `COMPUERTAS: VERDE`, con `npx playwright test tests/comunes tests/T01` mostrando `17 passed`.
