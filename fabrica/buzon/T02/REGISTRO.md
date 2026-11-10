# Registro — T02

| Corrida | Desde | Agentes | Tokens de subagentes | Tokens de salida | Minutos | Resultado |
|---|---|---|---|---|---|---|
| wf_41f72a11-102 | construir | constructor r1, qa r1 | sin dato | 259.467 | 29,2 | BLOQUEADA (H1: piezas sobre la pastilla y las etiquetas; H2: hojas de comparación sobrescritas, de la fábrica) |
| wf_0697da69-bcd | corrección r2 | constructor r2, qa r2, constructor r3, qa r3, auditor-final | 558.431 | 303.920 | 67,5 | AUDITADA |
| **Total** | | 7 | **≥ 558.431** | **563.387** | **96,7** | |

- Modelos (comprobados en los mensajes de cada agente): constructor y QA en `claude-sonnet-5-5`; la auditoría final en `claude-opus-5-5`.
- Rondas de QA: 3. Rondas de corrección del constructor: 2 (r2 por H1; r3 por H5, cambio de tamaño con scroll).
- Escapados:
  - E1, Mayor del proceso: rodeo del hook por la terminal (`F26`).
  - E2, Menor: el contraste contra la trama tocada; H3 estaba mal diagnosticado.
  - E3, Menor: la prueba de la precarga no retrasaba `load`.
  - E4, Menor del MVP: el parallax del cursor en ventanas angostas. Lo encontró la prueba de solape que escribió el orquestador.
- Pulido con el autor: 2 decisiones (las piezas cruzan el titular; el titular crece con la pantalla), unas 60 líneas del sitio y 4 pruebas nuevas, cada una validada sembrando el defecto.
- `/usage` antes y después: no disponible desde la sesión del orquestador.
