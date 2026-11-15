---
id: TX
agente: "@nombre-del-agente"
fase: 1
depende: [TA, TB]
tipo: componente            # sistema-de-diseno | arquitectura | componente | escena-3d | contenido | auditoria
requiere:                   # tiene que existir antes de arrancar; si falta, el constructor se detiene
  - sitio/src/styles/tokens.css
  - sitio/tests/TX/tx.spec.ts   # las pruebas de aceptación que escribe el orquestador
rutas: ["/"]               # las que fotografía capturas.mjs para el visto bueno
archivos:                   # lo único que puede escribir; "!" excluye
  - sitio/src/components/nx/**
  - "!sitio/src/components/nx/de-otra-tarea/**"
regresion: [TA]             # tareas cerradas cuyas pruebas corren el constructor y el QA (la suite completa, solo la auditoría final)
bloqueantes: []             # presupuestos de compuertas.json que en esta tarea bloquean aunque en general solo avisen
esfuerzo: high              # de Gemini: low | medium | high | xhigh (opcional; sin él, el de fabrica/proyecto/modelos.json)
# Subtareas (opcional, v5): cada una la construye una sesión de Gemini, en paralelo con las demás. Archivos
# disjuntos; lo compartido (la página, tokens, package.json) es de la integración, que tiene todos los `archivos`.
subtareas: [S1, S2]
archivos-S1:
  - sitio/src/components/nx/Pieza.astro
archivos-S2:
  - sitio/src/lib/nx-efecto.ts
  - sitio/src/shaders/nx/**
esfuerzo-S2: xhigh          # opcional, por subtarea (la del shader)
---

# `TX` · `@nombre-del-agente` — Título corto

> Fase N · corre sola | en paralelo con … · Buzón: `fabrica/buzon/TX/`

## Por qué existe

Dos o tres líneas: qué problema resuelve esta tarea en el sitio. El agente decide mejor
cuando sabe para qué es.

## Lee antes de empezar

- Documentos de verdad que aplican, **con la sección**: `docs/1-PRODUCTO.md` § 3…
- Código existente que va a usar o extender.

## Decisiones del autor que aplica esta tarea

Todo lo de dirección que la tarea necesita, **ya decidido** y con dónde quedó escrito. Si
algo falta, la tarea no se lanza: el agente corre sin nadie que le conteste y lo decidiría
solo.

## Qué construyes

1. **Entregable concreto**, con el criterio que lo hace correcto.
2. …

Lo que **no** está decidido se dice explícitamente: «el look de X no está decidido: deja un
punto de entrada tipado `aplicarX()` que hoy no haga nada visual».

## Subtarea S1 · Nombre corto

Solo si la tarea declara `subtareas`. Qué entregables de «Qué construyes» son de esta sesión (por número), en
qué archivos y **qué interfaz expone** a las demás: lo que exporta cada archivo, con su firma, eventos y `data-*`.
Esta sesión no monta su parte en la página ni corre compuertas completas ni capturas: eso es de la integración.

## Subtarea S2 · Nombre corto

Igual. Si usa algo de S1, lo nombra con la interfaz que S1 expone, sin esperar a que exista.

## Integración

Dónde se monta cada parte, qué toca en los archivos compartidos y qué se prueba al juntar (el orden de los pin,
que dos efectos no peleen por el mismo scroll…). Es la sesión que corre las compuertas y las capturas y escribe
`ENTREGA-r1.md`.

## Queda para el pulido — no es del agente

Lo que se afina después, con el autor, en la fase de pulido: ritmo exacto de animaciones,
ajuste fino de espacios y proporciones, detalles de dirección de arte. El constructor deja
aquí una versión **simple y correcta**, sin invertir en ello. Lista concreta, por ejemplo:
«la curva y duración finales de la entrada del título», «el tamaño exacto de la figura».

## Accesibilidad, respaldo y rendimiento

Lo específico de esta tarea: qué pasa sin JS/WebGL, con reduced-motion, con teclado; qué se
mide y con qué.

## Notas sobre tus archivos

Solo lo que el encabezado no puede decir: «en `package.json` solo agregas X».
**No toques:** lo que otras tareas en paralelo están construyendo.

## Cuándo terminaste

- `node fabrica/scripts/compuertas.mjs TX` en **VERDE**: incluye las pruebas de
  `sitio/tests/TX/`, que el agente no edita.
- `node fabrica/scripts/capturas.mjs TX` corrido, y mirada la foto con todos los breakpoints de cada ruta
  (`capturas/<ruta>-breakpoints.jpg`, las 20 pantallas en una imagen): nada encimado, cortado ni diminuto.
- Lo que **ninguna prueba** puede comprobar, dicho explícitamente: eso lo juzga el autor en
  el visto bueno. Nada de «probaste en el navegador»: sin interfaz no hay navegador.
- Entrega en `fabrica/buzon/TX/ENTREGA-r1.md` (con subtareas: cada una deja `ENTREGA-r1-S<n>.md` y la
  integración escribe `ENTREGA-r1.md`, con un apartado por subtarea).
