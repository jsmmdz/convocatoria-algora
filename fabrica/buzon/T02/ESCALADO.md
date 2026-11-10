# Escalado — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 11:37
- **Fin:** 2026-11-10 11:38
- **Intervenciones del autor:** 0

## Sección r1

Hay un Mayor del orquestador. El constructor no lo puede arreglar, así que el ciclo se para aquí (rol del auditor, «Dueño de cada hallazgo»). Si el orquestador lo resuelve, la ronda 2 tiene que traer también `CORRECCION-r1.md` (H1, del constructor).

### `H2` · Las hojas de comparación se pisan: faltan 3 de 6 aspectos de `se_toma`
- **Severidad:** Mayor
- **Dueño:** orquestador
- **Qué pasa:** `fabrica/scripts/capturas.mjs:228` guarda cada hoja como `comparacion/<id>.jpg`, sin el sitio. `fabrica/proyecto/referentes/T02.json` repite ids entre sitios (`A1`, `A2` en unseen y en tabletales; `A2`, `A3` en leadoff). Resultado, comprobado con `ls fabrica/buzon/T02/capturas/comparacion`: solo `A1.jpg` (tabletales A1), `A2.jpg` (tabletales A2) y `A3.jpg` (leadoff A3). Las hojas de unseen A1, unseen A2 y leadoff A2 se sobrescribieron y el script no avisó con ⚠.
- **Qué hacer:** que el nombre de la hoja incluya el sitio (por ejemplo `unseen-A1.jpg`), o renumerar los ids de `T02.json` para que sean únicos, y volver a correr `node fabrica/scripts/capturas.mjs T02`. Revisar si `T01` u otras fichas con ids repetidos sufren lo mismo.
- **Cómo lo cubrí mientras tanto:** comparé los estados `estado-precarga.jpg`, `estado-trama-cursor.jpg` y `inicio-1440-reducido.jpg` con las capturas originales de `referentes/capturas/` (unseen-01, unseen-02, leadoff-scroll-00). Cumplen, pero la hoja «referente | nuestro» que exige el rol no existe, y por regla (§ 4b.4) eso es Mayor.

### Otras notas para el orquestador (no bloquean)
- Las pruebas de T02 no comprueban que las piezas 3D no tapen la pastilla ni las etiquetas (H1 del constructor). Si quieres que la regresión lo cubra, hace falta una prueba que mida el solape entre `[data-objeto]` y las piezas; hoy solo se ve en captura.
- `fabrica/proyecto/perfil.md` no existe (solo la plantilla); el constructor tomó `docs/2-TECNICO.md` como perfil y lo anotó en Supuestos. Conviene confirmarlo.
- La nota de `T01/AUDITORIA-FINAL.md` («por verificar en T02: que `hook.jsonl` tenga las llamadas del constructor») queda cumplida: 72 llamadas del constructor, 1 `Write` negado fuera del repo.
