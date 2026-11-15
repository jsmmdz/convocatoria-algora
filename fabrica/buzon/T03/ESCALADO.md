# Escalado — T03 · Hitos

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 20:50
- **Fin:** 2026-11-10 20:52
- **Intervenciones del autor:** 0

## Sección ronda 3

La tarea vuelve al orquestador. El código de T03 está sano (21 de 21 pruebas de la tarea en verde; 56 de 57 en toda la suite de la compuerta con mi configuración), pero la compuerta de Playwright sale en ❌ por pruebas que el constructor no puede tocar.

### Hallazgo que escala: `H1-r3` (Crítico, dueño orquestador)
- `tests/comunes/sitio.spec.ts:50` (ruta `/`, «sin advertencias en consola») falla con `warning: WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost`.
- **Reproducida sin T03:** con `git archive HEAD sitio` y su build (sin `Hitos`), la misma prueba falla 2 de 3 veces, y la suite `comunes + T01 + T02` da 43 de 44 con esa única falla. El aviso sale de `src/lib/webgl.ts:11` y `src/lib/trama.ts:294` (`loseContext()`), que son de T02 y están excluidos de los archivos de T03. Es intermitente: en una carga simple del build de HEAD salió en 1 de 6.
- `tests/T02/t02.spec.ts:374` y `:408` (trama) fallaron en las tres corridas de compuerta (constructor, mía y la repetición). No las reproduje en ninguna corrida mía, con y sin T03, ni con el orden de la compuerta. Causa no establecida; parecen sensibles a la carga del computador.
- Evidencia y scripts: `fabrica/buzon/T03/QA-r3.md` (sección «Quién es el dueño») y `fabrica/buzon/T03/tmp/r3a.mjs` … `r3e.mjs`.

### Qué tiene que decidir el orquestador
1. Cómo tratar el aviso `CONTEXT_LOST_WEBGL: loseContext` (prueba común, ajuste a T02 o lista de ruido del driver).
2. Repetir `node fabrica/scripts/compuertas.mjs T03 --guardar` con el computador descargado y juzgar las dos de trama.
3. Con eso en verde, T03 pasa a `APROBADO` sin más cambios de código: los hallazgos restantes son `H2-r3` (pruebas que no cubren requisitos, del orquestador) y `H3-r3` (viajero pegado a la «U», del pulido), ambos Menores.
