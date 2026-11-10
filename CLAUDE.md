# Web hecha con la fábrica

Esta web se construye con la fábrica de webs desde referentes (preset `PRESET-FABRICA-WEB`). El autor
entrega **instrucciones y referentes** en `ENCARGO.md`; la fábrica hace el resto.

## Al empezar una sesión

1. Lee **`docs/3-ESTADO.md`**: en qué fase va y cuál es el siguiente paso.
2. Si la fase es **arranque**, sigue `fabrica/nucleo/roles/orquestador.md` § 0 desde `ENCARGO.md`. Si al
   encargo le falta algo de lo marcado con ★, pregúntalo antes de cualquier otra cosa.
3. Lo que se construye está en **`docs/1-PRODUCTO.md`** y cómo, en **`docs/2-TECNICO.md`**. **Son la única
   fuente de verdad**: si algo no está ahí, no está decidido; pregúntalo.
4. Cómo corre la construcción con agentes: **`fabrica/LEEME.md`**. Tu papel: `fabrica/nucleo/roles/orquestador.md`.

Resume al autor dónde va la web y cuál es el siguiente paso antes de tocar nada.

## Reglas

- **No te adelantes.** Sin encargo completo no hay captura; sin decisiones del autor no hay plan; sin plan
  aprobado no hay tareas; sin tarea no hay código del sitio.
- **No se crean documentos nuevos de planeación.** Una decisión se escribe en `docs/`; una tarea, en
  `fabrica/proyecto/tareas/`.
- **Aquí se calca, no se inspira:** cada recurso de un referente entra por el mapa de adaptación con su
  función en esta web (`docs/1-PRODUCTO.md` § 3).
- Opus orquesta; Sonnet construye y hace el QA; un Opus aparte audita (`/construir-tarea <ID>`). **No toques
  el repo mientras corre un lanzamiento**, y ninguna decisión de dirección se le deja a un agente.
- Las fallas ya pagadas están en `fabrica/nucleo/fallas.md`: léelas antes de escribir pruebas.
- Estados de tarea: `PENDING` · `IN_PROGRESS` · `REVIEW` · `PULIDO` · `VISTO BUENO` · `DONE` · `BLOCKED`.
- Español de Colombia con tuteo, en todo (regla 0 de `fabrica/nucleo/reglas.md`).

## Qué no se sube

- `referentes/capturas/` y `referentes/videos/`: material de otros sitios; se queda en el computador.
- Lo que `ENCARGO.md` § 6 marque como personal (va a `rutasPersonales` de `fabrica/proyecto/compuertas.json`).
