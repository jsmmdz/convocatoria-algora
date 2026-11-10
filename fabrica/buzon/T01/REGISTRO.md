# Registro — T01

| Corrida | Desde | Agentes | Tokens de subagentes | Tokens de salida | Minutos | Resultado |
|---|---|---|---|---|---|---|
| wf_3675803e-0f3 | construir | constructor r1, qa r1 | 224.799 | 57.911 | 18,1 | BLOQUEADA (servidor colgado de capturas, `F25`) |
| wf_b0cbcc80-e88 | qa r2 | qa r2 | 52.305 | 71.876 | 2,3 | BLOQUEADA (arreglos del orquestador sin commit) |
| wf_67c61a70-612 | qa r3 | qa r3, auditor-final | 191.499 | 118.070 | 11,3 | AUDITADA |
| **Total** | | 5 | **468.603** | **247.857** | **31,7** | |

- Rondas de QA: 3 (las dos primeras bloqueadas por la fábrica, no por el sitio). Rondas de corrección del constructor: 0.
- Escapados: E1–E7 (2 Mayores del proceso y de las pruebas, 5 Menores). Lecciones: `F23`, `F24`, `F25`.
- `/usage` antes y después: no disponible desde la sesión del orquestador.
