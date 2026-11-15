# Registro — T04

| Corrida | Desde | Agentes | Tokens de subagentes | Tokens de salida | Minutos | Resultado |
|---|---|---|---|---|---|---|
| wf_78b4c986-729 (2026-11-15) | construir | Gemini S1 y S2 (por relevo-gemini) | ~401.246 (Gemini: S1 162.802, S2 238.444) | — | ~8 | SIN_CUOTA (429 en las dos, sin entrega) |
| wf_1d3f27c4-835 (2026-11-15) | construir | Gemini S1, S2 e integración; qa r1 | 163.601 (Claude) + 1.073.048 (Gemini: S1 135.169, S2 520.288, integración 417.591) | 279.091 | 42,4 | BLOQUEADA (H1 Mayor y H2–H3 Menores, del orquestador) |
| wf_fe80c5ab-b0e (2026-11-15) | auditoría | auditor-final | 120.212 | 318.970 | 16,9 | AUDITADA (E1–E2 Mayores, E3–E4 Menores) |

- Modelos: S1 e integración `gemini-4-hydrogen-high`, S2 (shader) `gemini-4-hydrogen-xhigh`; QA en Sonnet; auditoría final en `claude-opus-5-5`.
- Primera construcción real con subtareas en paralelo: S1 206 s, S2 490 s a la vez, integración 904 s. Ninguna acción negada por el hook.
- La primera corrida se cortó por falta de créditos de `agy`; al relanzar, S1 y S2 volvieron a correr enteras (ninguna había entregado).
- Rondas de QA: 1. Sin hallazgos del constructor; los tres eran del orquestador (estado de captura de L1 inexistente, contradicción tinta/papel sobre tomate, falta de pruebas).
- Escapados de la auditoría: el respaldo del marco (pérdida de contexto e `import()` fallido), el foco hacia atrás y el ancla doble. Los arregló el orquestador en el pulido y quedaron verificados con las sondas del auditor.
- `/usage` antes y después: no disponible desde la sesión del orquestador.
