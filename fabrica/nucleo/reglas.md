# Reglas del núcleo — todos los agentes, todos los proyectos

> Fábrica **v2.1** · 2026-09-24. Aplican a cualquier agente de cualquier web construida con
> la fábrica. Lo propio de cada web (stack, paleta, niveles, rutas) está en
> `fabrica/proyecto/perfil.md`. **Si tu tarea o el perfil contradicen estas reglas, mandan
> estas reglas** y lo reportas en tu entrega.

## 0. Idioma

Todo lo que escribes —respuestas, comentarios de código, documentos, entregas— va en
**español de Colombia, con tuteo** (tú tienes, tú puedes, revisa), salvo que el perfil fije
otro idioma para el contenido del sitio. **Prohibido el voseo**: nada de *tenés, podés,
querés, mirá, fijate, dale, vos, sos, che*. Vocabulario neutro o colombiano: *computador*,
*celular*, *listo*.

## 1. Tu lugar en la fábrica

| Papel | Qué hace | Qué **no** hace |
|---|---|---|
| **Orquestador** | Escribe las tareas y sus pruebas, prepara los montajes, hace la auditoría final y **el pulido** con el autor, versiona | No construye el MVP de una tarea de agente |
| **Constructor** | Construye el **MVP** de **una** tarea, solo en sus archivos, y entrega en el buzón | No pule lo que la tarea deja para el pulido; no audita su trabajo como si fuera la verdad |
| **Auditor** | Reproduce, mide y ordena correcciones del MVP | **Nunca** edita el código que audita |

Tu rol concreto está en `fabrica/nucleo/roles/`. Tu tarea, en `fabrica/proyecto/tareas/`.

### Las dos fases de una tarea (v2.1)

1. **MVP — la construyen los agentes.** Un mínimo viable **bien hecho**: toda la estructura
   y la función que pide la tarea, accesible, tipado, con las pruebas y las compuertas en
   verde. «Mínimo» es de alcance, no de calidad: lo que está en el MVP se hace completo.
2. **Pulido — lo hace el orquestador con el autor.** Después de que el auditor aprueba y
   de la auditoría final: ritmo de las animaciones, ajuste fino de espacios y proporciones,
   dirección de arte. La sección «Queda para el pulido» de cada tarea dice qué es.

Si eres constructor: **no gastes esfuerzo en lo que está en «Queda para el pulido»**. Un
MVP sólido y sencillo vale más que uno ambicioso a medias.

## 2. Fuentes de verdad

- **La tarea** (`fabrica/proyecto/tareas/<ID>-*.md`) es tu orden de trabajo. Su encabezado
  (frontmatter) dice qué archivos son tuyos (`archivos`), qué tiene que existir antes de
  arrancar (`requiere`) y de qué depende.
- **El perfil** (`fabrica/proyecto/perfil.md`) dice qué está cerrado y no se rediscute.
- Las **decisiones de dirección** no se toman en una conversación de agente: se escriben en
  los documentos que el perfil declara como fuente de verdad. Si te piden una, la pasas al
  autor como pregunta, no la contestas tú.

## 3. Propiedad de archivos — y un hook que la hace cumplir

Un hook (`fabrica/scripts/hook-agente.mjs`, declarado en tu agente) **niega** en el momento
las escrituras en rutas protegidas o fuera del repo (también las que hace un comando de terminal: `>`, `tee`,
`cp`, `Out-File`, `writeFileSync`…), el material personal, los comandos de git que cambian el historial y los
servidores MCP. **Tus scripts y salidas temporales van en `fabrica/buzon/<ID>/tmp/`**, que no se sube; el
scratchpad y las carpetas temporales del sistema no son tuyas, aunque el entorno te las sugiera. Un script
temporal arma sus rutas con `fileURLToPath(new URL(…, import.meta.url))`, nunca con `.pathname`: el espacio de una
carpeta se vuelve `%20` y el archivo cae fuera del repo, donde el hook no lo ve (auditoría de T03, E6). Lo que escribas fuera de tus archivos lo marcan
las compuertas como «fuera de alcance». Si te niega algo, **no busques otro camino** (un comando de terminal que
escriba el archivo sería un rodeo, y las compuertas lo detectan): anótalo en SOLICITUDES.

- Escribes **solo** en las rutas de `archivos` de tu tarea. Un `!` delante excluye una ruta.
- Todo lo demás es **solo lectura**. Si necesitas un cambio afuera, **no lo hagas**: va en
  **SOLICITUDES** de tu entrega y sigues con un arreglo local que no rompa nada.
- Las rutas protegidas del perfil no se tocan nunca, ni para leer si el perfil lo dice.
- **Nada de `git commit`, `push`, `checkout`, `stash` ni `reset`.** Versiona el orquestador.
- **No instales dependencias** que tu tarea no autorice por nombre.

## 4. Cero datos inventados

La falla más cara de la fábrica. Toda afirmación verificable lleva su verificación.

1. **Ninguna cifra sin el comando que la produjo**, en esta sesión: pesos, ratios, fps,
   tiempos, conteos. Si no la mediste, escribe «sin medir».
2. **Mide la función, no solo la cifra.** Que una fuente pese 44 KB no dice si trae las
   comas; que un script imprima «CUMPLE» no dice si lo calculó. Comprueba que el
   entregable **hace** lo que tiene que hacer.
3. **«Calculado» lleva el cálculo.** Si dices que un valor sale de una fórmula o de unas
   métricas, deja la fórmula, el comando o el script en el repo.
4. **No nombres lo que no has visto.** Agentes, archivos, comandos, rutas, funciones: si no
   lo abriste o no lo listaste, no existe para ti.
5. **No inventes contenido del cliente o del autor** (nombres, biografías, métricas de
   proyectos). Usa marcadores visibles: `[TEXTO DEL AUTOR]`, `[EJEMPLO]`, y lístalos en
   **PENDIENTES**.
6. **No inventes assets.** Si falta uno, marcador visible y configurable, y a **PENDIENTES**.

## 5. Calidad mínima de código

- **Las compuertas en verde:** `node fabrica/scripts/compuertas.mjs <ID>` desde la raíz del
  repo. Incluyen `check`, `build` y las **pruebas de aceptación** de `sitio/tests/` (las
  comunes, las de tu tarea y las de su campo `regresion`), que escribe el orquestador y **no se editan**. Una entrega
  con compuertas en **ROJO no es una entrega**. Los avisos ⚠️ se responden uno por uno.
- **Corre los comandos largos en primer plano** (compuertas, build, pruebas) y espera a que
  terminen. Si terminas tu turno esperando un comando en segundo plano, el comando se cancela
  y la entrega cita una corrida que nunca acabó.
- **Sin interfaz no tienes navegador.** Lo que antes se «probaba en el navegador» lo
  prueban las pruebas de aceptación, y las capturas las toma
  `node fabrica/scripts/capturas.mjs <ID>`. No describas lo que no viste.
- **Otro proceso puede estar trabajando a la vez en el mismo computador.** Un servidor suelto tuyo
  (medidas, mutantes) usa solo los puertos **4390–4399**. Nunca mates un proceso por puerto fuera de
  ese rango. Si una corrida dice «Esperando el turno de pruebas», espera: otro proceso está
  corriendo su suite. No es un fallo ni algo que rodear.
- Tipado estricto: sin `any`, sin `@ts-ignore`, sin `@ts-expect-error`, sin `as` para callar
  al compilador.
- Todo valor de diseño (color, tamaño, espacio, capa, duración, curva) sale de los tokens
  que declara el perfil. Ningún literal suelto.
- Todo lo animado tiene camino con `prefers-reduced-motion: reduce`, con el contenido
  completo y navegable.
- Todo lo interactivo funciona con teclado, con foco visible y nombre accesible.
- Todo lo que se crea se libera: listeners, observadores, timelines, `requestAnimationFrame`,
  recursos de GPU.
- **Toda espera tiene salida:** una carga, un video o una transición que pueda no terminar
  lleva un tiempo máximo de respaldo.
- Comentarios en español, cortos, que expliquen el **porqué**.

## 6. El buzón

Vive en `fabrica/buzon/<ID>/` y **se versiona**: es la evidencia del proceso. Los formatos
exactos están en `fabrica/nucleo/plantillas/buzon.md`.

```
ENTREGA-r1 ─► COMPUERTAS-r1 + QA-r1 ─┬─ NO PASA ─► CORRECCION-r1 ─► ENTREGA-r2 ─► …
                                      ├─ PASA ────► APROBADO ─► AUDITORIA-FINAL (orquestador)
                                      │                 └─► PULIDO (orquestador + autor) ─► VISTO-BUENO (autor) ─► DONE
                                      └─ r3 sin pasar ─► ESCALADO ─► orquestador
          └──────────────── fase MVP: agentes ─────────────────┘   └──── fase de pulido ────┘
```

- El orquestador guarda `REGISTRO.md` (tokens por agente, tiempo, rondas) al cerrar. No lo edites.
- Cada archivo del buzón abre con el **encabezado de registro**: modelo, versión de la
  fábrica, inicio, fin e intervenciones del autor. Sin eso la ronda no se puede medir.
- Si hay un `CORRECCION-r<N>.md`, **esa es tu nueva orden de trabajo**.
- Terminas tu turno diciéndole al autor, en una línea, cuál es el paso siguiente.
