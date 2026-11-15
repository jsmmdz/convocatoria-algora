# Registro — T03

| Corrida | Desde | Agentes | Tokens de subagentes | Tokens de salida | Minutos | Resultado |
|---|---|---|---|---|---|---|
| r1–r3 (2026-11-10, fábrica v4) | construir | constructor r1–r3, qa r1–r3, auditor-final | sin registrar en esta sesión | sin registrar en esta sesión | sin registrar | NO PASA (E1–E7, `AUDITORIA-FINAL-r3.md`) |
| wf_0e44e361-f80 (2026-11-15, fábrica v5) | corrección r4 | Gemini r4 (por relevo-gemini), qa r4, auditor-final | 272.939 (Claude) + 418.532 (Gemini) | 167.869 | 45,7 | AUDITADA (E1 Mayor, E2–E4 Menores) |

- Modelos: r4 de constructor `gemini-4-hydrogen-high` (una sesión, 764 s, `REGISTRO-gemini-r4.json`); QA en Sonnet; auditoría final en `claude-opus-5-5`.
- Rondas de QA: 4. La r4 fue la primera sesión real de Gemini: 191 llamadas al hook como `gemini:T03`, ninguna negada.
- Escapados de la auditoría r4: E1 Mayor (viajero sobre el titular a 1280/1024, ya estaba en r3); E2 Menor (la línea se ve a través del viajero); E3 y E4 Menores de la fábrica (nombre del constructor en el hook para el QA; ronda de las compuertas de Gemini), arreglados en `qa.md`, `compuertas.mjs` y `gemini.mjs`.
- Pulido con el autor: 1 arreglo del MVP (E1), 1 token (onda), 1 prueba nueva validada en los dos sentidos.
- `/usage` antes y después: no disponible desde la sesión del orquestador.
