# La fábrica — construir webs con agentes

> **Preset v4.1** · 2026-11-10 (v4.0 del 2026-10-29 + F23–F25: hook también desde `settings.json`, limpieza del servidor de capturas y prueba de foco que no se deja engañar). Es la fábrica v3.6 hecha genérica: la misma maquinaria (agentes, workflow,
> hooks, compuertas, pruebas comunes, capturas) sin nada de la web en la que nació. Se copia entera a
> cada web nueva (`node fabrica/scripts/nueva-web.mjs <carpeta>`) y arranca desde `ENCARGO.md`.
> **Qué se construye y cómo** está en `docs/`: `1-PRODUCTO.md`, `2-TECNICO.md` y `3-ESTADO.md`. Es la
> única fuente de verdad del sitio.

## La idea en cuatro líneas

**Tú** llenas `ENCARGO.md`: instrucciones claras y referentes. **Opus** (el orquestador, la sesión
principal) captura los referentes, arma el mapa de adaptación, te trae las decisiones en un solo bloque,
escribe el plan y, con tu visto bueno, las tareas **y sus pruebas**. **Sonnet** construye cada tarea y
otra instancia de Sonnet, con contexto limpio, la audita; un **Opus** aparte hace la auditoría final.
Tú das el visto bueno de lo que se ve.

## El recorrido de una web

```
 tú: ENCARGO.md (instrucciones + referentes)
        │
 orquestador § 0: captura ─► fichas ─► mapa de adaptación ─► decisiones contigo ─► docs 1-2 ─► plan
        │                                                                                   │
        │                                                        tú: visto bueno al plan ◄──┘
        ▼
 por cada tarea (T01 andamio, T02…):  orquestador: tarea + pruebas validadas + commit
                                                  │
                         tú escribes:  /construir-tarea <ID>     (workflow en segundo plano)
                                                  │
        constructor ─► QA (compuertas + píxeles) ─┬─ NO PASA ─► constructor corrige ─► QA … (máx. 3 rondas)
                                                  ├─ 3.ª ronda sin pasar ─► ESCALADO ─► orquestador
                                                  └─ PASA ─► auditor final (Opus) ─► AUDITORIA-FINAL
                                                                         │
                                         orquestador + tú: PULIDO  ─►  tú: VISTO BUENO  ─►  DONE
```

Mientras corre un lanzamiento, `/workflows` muestra cada agente con sus tokens y deja pausar o detener.
**No se toca el repo mientras corre.**

## Qué hay en cada carpeta

```
ENCARGO.md                   ← lo único que llenas tú
CLAUDE.md                    ← lo que lee cada sesión al abrir
docs/                        ← 1-PRODUCTO · 2-TECNICO · 3-ESTADO (plantillas hasta el arranque)
referentes/
├── _sitios.json             ← pasos para capturar cada referente
├── capturas/  videos/       ← material de otros sitios: NO se sube (.gitignore)
.claude/
├── agents/                  ← analista-referente · constructor · qa · auditor-final
├── workflows/construir-tarea.js  ← el ciclo de una tarea: /construir-tarea <ID>
├── settings.json            ← tamaño de workflow «small», caché 1 h, permisos
└── launch.json              ← el servidor de desarrollo (puerto 4321)
.github/workflows/deploy.yml ← publica sitio/ en GitHub Pages (corre cuando exista sitio/package.json)
fabrica/
├── LEEME.md                 ← este manual
├── nucleo/                  ← GENÉRICO: reglas, fallas F1–F22, roles, plantillas (tarea, T01, ficha, mapa, buzón)
├── proyecto/                ← ESTA WEB: compuertas.json; en el arranque, perfil.md, fichas y tareas
├── buzon/<ID>/              ← la evidencia: entregas, QA, auditoría, pulido, visto bueno
├── datos/                   ← métricas: compuertas.jsonl y turnos.jsonl
└── scripts/
    ├── nueva-web.mjs        ← copia el preset a una carpeta nueva
    ├── referentes.mjs       ← capturas de los referentes (1440 y 390, primera visita, WebGL en GPU)
    ├── compuertas.mjs       ← alcance, check, build, pruebas, patrones, presupuestos
    ├── capturas.mjs         ← la matriz de 19 pantallas en hojas, con y sin movimiento reducido
    ├── hook-agente.mjs      ← lo que un agente no puede hacer, bloqueado en el momento
    ├── monitor/             ← tablero local de las corridas (node fabrica/scripts/monitor/server.mjs)
    └── lib/                 ← globs, frontmatter, puertos, turno de pruebas, veredictos
sitio/                       ← lo crea T01; trae ya las pruebas comunes y playwright.config.ts
```

## Los papeles

| Papel | Dónde | Modelo · esfuerzo | Hace |
|---|---|---|---|
| **Autor** (tú) | `ENCARGO.md` | — | Da instrucciones y referentes; decide la dirección; da el **visto bueno** al plan y a lo que se ve |
| **Orquestador** | sesión principal | Opus · `high` al escribir tareas | Arranca desde el encargo, decide contigo, escribe tareas y pruebas, revisa la auditoría final, **pule** contigo, versiona |
| **Analista de referentes** | `.claude/agents/analista-referente.md` | Sonnet · `high` | Mide la grabación, captura el sitio en vivo y lee su código; deja el borrador de la ficha en el buzón |
| **Constructor** | `.claude/agents/constructor.md` | Sonnet · `medium` (`high` en shaders) | Construye el **MVP** y sus correcciones |
| **QA** | `.claude/agents/qa.md` | Sonnet · `high`, contexto limpio | Corre las compuertas, reproduce, mide en píxeles, aprueba u ordena corregir |
| **Auditor final** | `.claude/agents/auditor-final.md` | Opus · `high` | Busca lo que se le escapó al QA; un modelo distinto no comparte sus puntos ciegos |

## Tu parte

1. **Llenar `ENCARGO.md`.** Lo marcado con ★ es obligatorio; lo demás se te pregunta si falta.
2. **Decidir** el bloque de decisiones que te trae el orquestador (opciones, reversibilidad, evidencia y
   la recomendación al final). Una tarea con decisiones abiertas no se lanza.
3. **Aprobar el plan** de tareas.
4. **Lanzar** cada tarea con `/construir-tarea <ID>` cuando el orquestador te diga que está lista.
5. **Dar el visto bueno** sobre las capturas del resultado pulido.

## Gasto

- Ultracode **apagado** en la sesión: el workflow se lanza a propósito, tarea por tarea.
- `workflowSizeGuideline: small` y caché de subagentes a 1 h (`.claude/settings.json`).
- Tope opcional al lanzar: `/construir-tarea T02 +300k` (tokens de salida, tope duro).
- Se mide con `/usage` (vista de 7 días) antes y después de cada tarea; queda en el buzón (`REGISTRO.md`).

## Seguridad: lo que ningún agente puede hacer

El hook `fabrica/scripts/hook-agente.mjs` (declarado en cada agente) **niega en el momento**: nombrar o
leer las `rutasPersonales`; los comandos de git que cambian el historial o el árbol; escribir en las
`rutasProtegidas` de `fabrica/proyecto/compuertas.json` o fuera del repo; los servidores MCP; y, a los
auditores, escribir fuera de `fabrica/buzon/`. Si el hook falla, bloquea (falla cerrado). **Límite
conocido:** un comando de terminal puede escribir un archivo sin pasar por el hook; eso lo detectan las
compuertas después (alcance).

## Mejorar el preset

Una lección que sirve para cualquier web (una falla nueva, una compuerta, una prueba común) se lleva
también a `C:\UNIVERSIDAD\UNIVERSIDAD\PRESET-FABRICA-WEB`, se anota en `fabrica/nucleo/fallas.md` y se
sube la versión del preset aquí arriba. Lo que solo sirve a una web se queda en su `fabrica/proyecto/`.
