# Formatos del buzón

> Todos los archivos de `fabrica/buzon/<ID>/` siguen estos formatos. El orquestador y la investigación los leen:
> **no cambies los nombres de los campos** del encabezado ni la forma `Severidad: X`.

## Encabezado de registro — va arriba en TODOS los archivos

```markdown
- **Tarea:** T3
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5                         ← el id exacto del modelo que corre tu papel
- **Fábrica:** v2.0                                     ← la de fabrica/nucleo/reglas.md
- **Inicio:** 2026-09-23 10:02                          ← salida de `date` al empezar
- **Fin:** 2026-09-23 11:40                             ← salida de `date` al entregar
- **Intervenciones del autor:** 0                       ← veces que el autor tuvo que corregirte o decidir
```

Si un dato no lo sabes, escribe `sin registrar`. **No lo estimes.**

---

## `ENTREGA-r<N>.md` — lo escribe el constructor

```markdown
# Entrega r<N> — <ID> · <nombre de la tarea>

<encabezado de registro>

## Resumen
Tres líneas: qué construiste, qué quedó fuera y por qué.

## Archivos
Creados / modificados / borrados, con ruta. Solo rutas de `archivos` de tu tarea.

## Compuertas
`COMPUERTAS: VERDE` o `ROJO` de `node fabrica/scripts/compuertas.mjs <ID>`, y la respuesta a
cada aviso ⚠️: por qué está bien, o qué hiciste.

## Verificación
Cada comando y su salida real, recortada a lo relevante. Capturas de `capturas.mjs` con la ruta
del archivo. Lo que la tarea pide medir, medido.

## Decisiones
Qué elegiste cuando había más de una opción, y por qué.

## Supuestos
Lo que diste por hecho sin confirmarlo.

## PENDIENTES
Assets o textos que faltan, con el marcador que dejaste. Es la lista de tareas del autor.

## SOLICITUDES
Cambios que necesitas en archivos que no son tuyos. Los resuelve el orquestador.
```

Si es respuesta a una corrección, agrega antes de **Resumen**:

```markdown
## Respuesta a CORRECCION-r<N-1>
| Hallazgo | Qué hice | Cómo lo verifiqué |
|---|---|---|
| H1 | … | comando y salida |
```

---

## `QA-r<N>.md` — lo escribe el auditor

La **primera línea** es exactamente `VEREDICTO: PASA` o `VEREDICTO: NO PASA`.

```markdown
VEREDICTO: NO PASA

# QA r<N> — <ID>

<encabezado de registro>

## Entregables
| Entregable de la tarea | Estado | Evidencia |

## Compuertas
Salida de `node fabrica/scripts/compuertas.mjs <ID> --guardar` (queda en COMPUERTAS-r<N>.md)
y tu juicio sobre cada aviso ⚠️.

## Pruebas y capturas
Qué cubren las pruebas de `sitio/tests/<ID>/` y **qué pide la tarea que ninguna prueba
comprueba**. Tu lectura de las capturas de `capturas.mjs` contra la guía visual.

## Lo que veo
Solo si existe `fabrica/proyecto/referentes/<ID>.json`. **Se escribe antes de leer los
aspectos** (v2.3): por cada hoja de `capturas/comparacion/`, qué hay en nuestra captura, con
posiciones y colores concretos. Sin mencionar el aspecto ni la entrega.

## Contra el referente
Una fila por aspecto de `se_toma`, mirando `capturas/comparacion/<id>.jpg`. La columna «lo
nuestro» sale de «Lo que veo», no del texto del aspecto:
| id | Aspecto | Qué se ve en el referente | Qué se ve en lo nuestro | Cumple |

## Hallazgos

### `H1` · <título corto>
- **Severidad:** Crítico | Mayor | Menor
- **Dueño:** constructor | orquestador        ← orquestador: el constructor no lo puede arreglar
- **Archivo:** ruta:línea
- **Evidencia:** comando y salida, o captura
- **Regla:** la regla del núcleo, del perfil o de la tarea que incumple
```

## `CORRECCION-r<N>.md` — orden de trabajo del auditor al constructor

```markdown
# Corrección r<N> — <ID>

<encabezado de registro>

### `H1` · <mismo título que en QA>
- **Qué cambiar:** instrucción ejecutable, sin «mejora esto»
- **Dónde:** ruta
- **Cómo lo voy a verificar:** el comando o la prueba exacta de la ronda siguiente
```

## `APROBADO.md` / `ESCALADO.md` — cierre del auditor

```markdown
# <ID> aprobada por QA   |   # <ID> escalada al orquestador

<encabezado de registro>

- **Ronda:** r<N>
## Menores pendientes
## Qué debe mirar el orquestador con más cuidado      ← solo cosas que viste; no nombres agentes ni archivos que no existan
## (ESCALADO) Qué no se resolvió y por qué crees que el constructor no lo resuelve
```

## `AUDITORIA-FINAL.md` — lo escribe el orquestador

```markdown
# Auditoría final — <ID>

- **Veredicto:** DONE | DONE con correcciones del orquestador | VUELVE A CORRECCIÓN
- **Fecha:** …
- **Modelo:** …
- **Fábrica:** …
- **Commit:** …

### `E1` · <defecto que escapó al QA>
- **Severidad:** Crítico | Mayor | Menor
- **Evidencia:** …
- **Por qué escapó:** …       ← esto alimenta la mejora del rol del auditor
- **Corrección:** …
```

`E1`, `E2`… cuentan **defectos que escaparon al QA**: es la métrica principal de la
investigación. Una falla del propio auditor (una entidad inventada, una instrucción falsa)
también va aquí.

## `PULIDO.md` — lo escribe el orquestador en la fase de pulido

Qué afinó el modelo caro sobre el MVP aprobado. Es la medida de cuánto trabajo le deja el
MVP de los agentes al orquestador.

```markdown
# Pulido — <ID>

- **Fecha:** …
- **Modelo:** …
- **Commit del MVP aprobado:** …
- **Commit del pulido:** …
- **Líneas cambiadas:** `git diff --stat <mvp>..<pulido> -- <archivos de la tarea>`

| Cambio | Archivo | Por qué | ¿Era MVP o pulido? |
|---|---|---|---|
| … | … | … | pulido (estaba en «Queda para el pulido») · MVP (escapó a QA y auditoría) |

## Decisiones del autor en el pulido
```

La última columna separa el pulido legítimo de los defectos del MVP que se colaron: los
segundos cuentan también como escapados.

## `VISTO-BUENO.md` — lo escribe el orquestador con lo que dice el autor

El autor mira las capturas (y, si hace falta, el sitio) y aprueba o pide ajustes de
**dirección**. Es el único punto del ciclo donde se juzga el gusto.

```markdown
# Visto bueno — <ID>

- **Decisión:** APROBADO | AJUSTES
- **Fecha:** …
- **Miró:** capturas de `capturas/` · el sitio en `npm run dev` · otro
- **Ajustes pedidos:** lista, o «ninguno»      ← cada ajuste vuelve como tarea o corrección
- **Decisiones de dirección que salieron:** lista, con dónde quedaron escritas en `docs/`
```

## Archivos que escriben los scripts (no se editan a mano)

| Archivo | Lo escribe | Qué guarda |
|---|---|---|
| `COMPUERTAS-r<N>.md` | `compuertas.mjs --guardar` | la tabla de compuertas de la ronda |
| `REGISTRO.md` | el orquestador | tokens por agente, minutos, rondas y escapados de la tarea |
| `capturas/*.jpg` | `capturas.mjs` | La matriz de 20 pantallas en tres hojas por ruta (`<ruta>-telefonos`, `-acostado-tablet`, `-escritorio-ancho`) y en una sola foto (`<ruta>-breakpoints`); 1440 y 390, con y sin movimiento reducido |
