# Corrección r2 — T01

- **Tarea:** T01
- **Ronda:** r2
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 05:58
- **Fin:** 2026-11-10 06:15
- **Intervenciones del autor:** 0

## Para el constructor

**No hay trabajo para el constructor en esta ronda.** El código de T01 no cambió y reproduce sus 17 pruebas en verde. No cambies nada. Los hallazgos abiertos (H4 Crítico, H3 Menor) son del orquestador; el ciclo se detiene en `ESCALADO.md`.

### `H4` · La compuerta `fuera-de-alcance` sale en ❌ por los arreglos sin versionar del orquestador
- **Qué cambiar:** nada en `sitio/`. El orquestador versiona `fabrica/scripts/capturas.mjs` y `sitio/tsconfig.json`.
- **Dónde:** `fabrica/scripts/capturas.mjs`, `sitio/tsconfig.json`
- **Cómo lo voy a verificar:** `node fabrica/scripts/compuertas.mjs T01 --guardar` debe salir `COMPUERTAS: VERDE`, sin `fuera-de-alcance` en ❌.
