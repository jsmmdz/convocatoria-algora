# Pulido — T03

- **Tarea:** T03
- **Ronda:** pulido (después de la auditoría final r4)
- **Modelo:** claude-opus-5-5 (orquestador)
- **Fábrica:** v5.0
- **Inicio:** 2026-11-15 11:05
- **Fin:** 2026-11-15 11:59
- **Intervenciones del autor:** 2 (decisiones E1 y E2 de la auditoría r4; visto bueno de la onda)
- **Commit del MVP aprobado:** sin commit propio: el autor aprobó subir MVP y pulido en el mismo commit («T03 cerrada»)
- **Commit del pulido:** el de «T03 cerrada»
- **Líneas cambiadas:** `Hitos.astro` +6 −1 (orden de capas y comentario del halo) · `tokens.css` 1 línea · `t03.spec.ts` +114 (prueba de E1)

| Cambio | Archivo | Por qué | ¿Era MVP o pulido? |
|---|---|---|---|
| `.hito__texto` con `position: relative; z-index: 3`: los textos van por encima de la línea y del viajero | `sitio/src/components/Hitos.astro` | E1 de la auditoría r4: el viajero se pintaba sobre el titular del hito 2 a 1280 y 1024 (decisión del autor: A) | MVP (escapó a QA y auditoría r3) |
| El comentario del halo ya no dice que despega al viajero de la línea | `sitio/src/components/Hitos.astro` | E2 de la auditoría r4: con `difference` el halo no tapa la línea | pulido |
| `--linea-amplitud` de 0.12 a 0.08 | `sitio/src/styles/tokens.css` | Onda más suave, como la de Unseen; la cresta ya no asoma sobre el bloque magenta y el viajero casi no sube a los titulares | pulido (estaba en «Queda para el pulido») |
| Prueba «cuando cruza un titular, las letras lo tapan» a 1440, 1280 y 1024 | `sitio/tests/T03/t03.spec.ts` | Validada en los dos sentidos: sin el arreglo falla a 1280 (558 de 1365 px de letra tapados); con él pasan las tres | MVP (prueba del escapado) |

Verificación: `npx playwright test tests/T03` con la onda a 0.08: 21 de 21. Compuertas completas con el arreglo: todas las
pruebas pasan (comunes, T01, T02, T03); la única marca era la prueba sin commit, ruta protegida.

Hallazgo de la prueba: el titular (peso 300) no cubre del todo ningún píxel (el centro del trazo es ~88 % opaco), así que
una comparación píxel a píxel siempre ve algo de lo de atrás. La prueba engruesa las letras con `-webkit-text-stroke`
solo mientras mide, igual en las tres capturas.

## Decisiones del autor en el pulido

- E1 → A: los textos van por encima del viajero (`docs/1-PRODUCTO.md` § 6, 2026-11-15).
- E2 → A: la raya de la línea a través del viajero se acepta; se ve en el pulido con la onda (`docs/1-PRODUCTO.md` § 6, 2026-11-15). En el pulido se aceptó como está.
- Onda a 0.08; el resto de «Queda para el pulido» (tamaños, x y tamaño del viajero, sin animación propia de la línea) queda como está.
