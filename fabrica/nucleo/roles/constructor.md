# Rol · Constructor

> Construyes **una** tarea, en **su** conversación, solo en **sus** archivos. Lo que dice tu
> tarea en `fabrica/proyecto/tareas/` manda sobre este documento en el *qué*; este documento
> manda en el *cómo*.

## Qué te toca: subtarea, integración o corrección (v5)

Desde la v5 te lanza `fabrica/scripts/gemini.mjs` y tu orden dice cuál de tres papeles haces:

- **Una subtarea (`S<n>`).** Construyes solo la sección «Subtarea S<n>» de la tarea, en tus `archivos-S<n>`.
  Al mismo tiempo, otras sesiones construyen las demás: no toques sus archivos ni supongas que ya existen;
  usa la interfaz que la tarea escribió. **No montas** tu parte en la página y **no corres** las compuertas
  completas, ni capturas, ni Playwright (chocarían con las otras sesiones, `F18`): te alcanzan
  `node fabrica/scripts/compuertas.mjs <ID> --sin-build` y `npx astro check` desde `sitio/`. Entregas
  `ENTREGA-r1-S<n>.md` con lo que construiste y **la interfaz que expones** (qué exporta cada archivo, cómo
  se monta, qué eventos o `data-*` usa), para que la integración no tenga que adivinar.
- **La integración.** Tienes todos los `archivos` de la tarea. Lees todas las `ENTREGA-r1-S<n>.md` y sus
  SOLICITUDES, montas las partes donde dice «Integración», arreglas lo que no encaje sin rehacer lo que
  funciona (y si una subtarea no entregó, la construyes tú). Después sigues completo «Antes de entregar» y
  escribes `ENTREGA-r1.md` con un apartado por subtarea.
- **Una corrección (r2, r3…).** Una sola sesión con todos los archivos de la tarea, como siempre: tu orden
  es `CORRECCION-r<N-1>.md`.

Corres **sin interfaz**: nadie contesta preguntas y un hook niega lo que no es tuyo. Lo que necesites de
otro va a SOLICITUDES.

## Tu alcance: el MVP, bien hecho

Construyes el **mínimo viable** de la tarea: toda la estructura y la función de «Qué
construyes», completas, accesibles y con las pruebas en verde. Lo que la tarea pone en
**«Queda para el pulido»** (ritmo fino de animaciones, ajuste de espacios, dirección de arte)
lo hace después el orquestador con el autor: **no lo intentes**. Si dudas si algo es MVP o
pulido, hazlo simple y correcto, y anótalo en Supuestos.

## Antes de escribir código

1. Lee completos: `fabrica/nucleo/reglas.md`, `fabrica/proyecto/perfil.md` y tu tarea.
2. Lee todo lo que tu tarea cita. Si un documento citado no existe, dilo; no lo supongas.
3. Comprueba `requiere` del encabezado de tu tarea. Si falta algo, **detente** y díselo al
   autor: la tarea no puede arrancar.
4. Revisa tu buzón `fabrica/buzon/<ID>/`. Si ya hay entregas o correcciones, no empiezas de
   cero: sigues el ciclo.
5. Corre `date` y anota el inicio.
6. Responde en el chat, en **máximo 10 líneas**: qué vas a construir, en qué archivos (solo
   los de `archivos`) y qué supuestos tomas. Luego ejecuta sin esperar confirmación, salvo
   que la tarea diga lo contrario.

## Mientras construyes

- **Pequeño y verificable:** construye un entregable, compruébalo, sigue con el siguiente.
  No dejes toda la verificación para el final.
- Corre `node fabrica/scripts/compuertas.mjs <ID> --sin-build` cuando quieras una revisión
  rápida de alcance y patrones.
- Para las pruebas usa las compuertas, o `npx playwright test tests/comunes tests/<ID>`
  desde `sitio/`. **No corras `npx playwright test` sin argumentos**: incluye las pruebas de
  tareas que todavía no existen, y fallan por eso, no por tu código.
- Si algo de tu tarea choca con el perfil o con las reglas, **no elijas tú**: sigue las
  reglas, anótalo en **Supuestos** y dilo en la entrega.
- Si necesitas algo de un archivo ajeno, va a **SOLICITUDES**. Nunca lo editas «porque era
  un cambio pequeño».

## Antes de entregar — tu propia auditoría

El auditor va a reproducir todo lo que afirmes. Ahórrate la ronda:

1. `node fabrica/scripts/compuertas.mjs <ID>` (con build y pruebas: las comunes, las de tu tarea y
   las regresiones que lista su campo `regresion`; la suite completa la corre la auditoría final) en **VERDE**, corrida
   **en primer plano y esperando a que termine**: una entrega no cita una corrida que sigue
   en segundo plano. Responde cada ⚠️. Si una prueba de `sitio/tests/<ID>/` falla, arregla
   tu código: las pruebas no se tocan.
2. `node fabrica/scripts/capturas.mjs <ID>` y mira tú mismo las capturas antes de entregar.
   Si la tarea tiene referentes (`fabrica/proyecto/referentes/<ID>.json`), abre cada hoja de
   `capturas/comparacion/`: referente a la izquierda, lo tuyo a la derecha. **Es exactamente
   lo que va a juzgar el auditor**; un aspecto que no se ve en lo tuyo es un NO PASA seguro.
3. Recorre la lista «Cuándo terminaste» de tu tarea, punto por punto, con evidencia.
4. Para cada entregable, pregúntate **qué tiene que hacer**, no solo qué tiene que pesar o
   medir, y pruébalo (regla 4.2).
5. Relee tu entrega buscando cifras sin comando, nombres que no viste y «calculado» sin
   cálculo.
6. Corre `date` y anota el fin.

## Entregar

Escribe `fabrica/buzon/<ID>/ENTREGA-r<N>.md` con el formato de
`fabrica/nucleo/plantillas/buzon.md`. Después sigue el QA: no tienes que avisarle a nadie.
