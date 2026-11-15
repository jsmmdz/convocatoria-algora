# Pulido — T04

- **Tarea:** T04
- **Ronda:** pulido (después de la auditoría final)
- **Modelo:** claude-opus-5-5 (orquestador)
- **Fábrica:** v5.0
- **Inicio:** 2026-11-15 17:25
- **Fin:** 2026-11-15 17:51
- **Intervenciones del autor:** 1 (E1–E3 los arregla el orquestador en vez de otra ronda de Gemini; el ancla queda `#postulacion`)
- **Commit del MVP aprobado:** pendiente (el MVP de Gemini sigue sin commit)
- **Líneas cambiadas:** `productos.ts` ~+60 −8 (respaldo del marco, apagado por opacidad, foco) · `Productos.astro` +14 (CSS del respaldo y del apagado) · `Nav.astro` 1 · `t01.spec.ts` 3 · `T01-andamio.md` 1

| Cambio | Archivo | Por qué | ¿Era MVP o pulido? |
|---|---|---|---|
| `caerARespaldo()`: si se pierde el contexto WebGL o `montarMarco` devuelve `null`, se suelta el marco, se oculta el canvas y la sección pasa a `data-marco-fallo`; el bloque cobalto se desvanece cuando el marco pasa de la mitad (`data-marco-abierto`) y deja ver «Cómo funciona»; al subir, vuelve. Si al volver a entrar el marco sí monta, se quita el respaldo | `sitio/src/lib/productos.ts`, `Productos.astro` | E1 de la auditoría final (Mayor): pantalla cobalto vacía para siempre | MVP (escapó al QA) |
| `await import('./marco-tinta')` dentro de `try/catch`; si falla, el mismo respaldo | `sitio/src/lib/productos.ts` | E2 de la auditoría final (Mayor): `pageerror` sin capturar y el mismo callejón cobalto | MVP (escapó al QA) |
| El apagado del contenido es solo `opacity` (antes `autoAlpha`): el titular sigue en el árbol accesible y el botón en el orden de tabulación; mientras está apagado, `data-productos-apagado` le quita los clics al centro. Si el foco entra a la sección con el contenido apagado, la página vuelve a la mitad del pin | `sitio/src/lib/productos.ts`, `Productos.astro` | E3 de la auditoría final (Menor): Shift+Tab desde abajo no llegaba al Postúlate de la sección | MVP (escapó al QA) |
| Ancla única `#postulacion`: la nav pasa de `#postulate` a `#postulacion`; la prueba y la tarea de T01 se corrigen | `Nav.astro`, `tests/T01/t01.spec.ts`, `fabrica/proyecto/tareas/T01-andamio.md` | E4 de la auditoría final (orquestador); decisión del autor | MVP (contradicción entre tareas) |

Verificación (con las sondas del auditor, `tmp/auditoria-a.mjs` y `auditoria-b.mjs`; las imágenes de antes quedaron en `tmp/antes-pulido/`):
- Pérdida de contexto en y = 9000: el bloque se desvanece; en 9500 y al volver a 9300 se ve «Cómo funciona» (`tmp/aud-perdido-9500.png`); consola limpia.
- `import()` abortado: en 9300 se ve «Cómo funciona» (`tmp/aud-import-fallido-9300.png`); ya no hay `pageerror`, solo el aviso de red del navegador por el archivo bloqueado.
- Shift+Tab desde el final: llega al Postúlate de la sección y la página vuelve a y = 8460 con todo a la vista y el foco ácido (`tmp/aud-tab-atras.png`); Tab hacia adelante igual que antes.
- Lo demás de las sondas igual que en la auditoría: DPR tope, salir y volver al modo horizontal, sin WebGL, redimensionado.
- Compuertas: `npm run check` 0/0/0, build, Playwright comunes + T01–T03 en verde. La única marca es `fuera-de-alcance` por `T01-andamio.md` y `t01.spec.ts` sin commit (rutas protegidas).

Sin pruebas propias de T04 (autor, 2026-11-10; confirmado el 2026-11-15).

## Decisiones del autor en el pulido

- E1–E3: los arregla el orquestador (más barato que otra ronda de Gemini).
- E4: el ancla de «Postúlate» es `#postulacion` (`docs/1-PRODUCTO.md` § 6, 2026-11-15).
