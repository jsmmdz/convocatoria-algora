---
id: T07
agente: "@orquestador"
fase: 1
depende: [T06]
tipo: componente
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - previo/sitio-vite-2026-11-09/supabase/esquema.sql
  - sitio/tests/T07/t07.spec.ts
rutas: ["/"]
archivos:
  - sitio/src/components/Postulacion.astro
  - sitio/src/lib/postulacion.ts
  - sitio/src/lib/datos.ts
  - sitio/supabase/esquema.sql
  - sitio/package.json
  - sitio/package-lock.json
  - sitio/src/pages/index.astro
  - sitio/src/styles/tokens.css
  - sitio/src/styles/global.css
regresion: [T01, T02, T03, T05, T06]
bloqueantes:
  - "Supabase: el autor crea el proyecto, corre sitio/supabase/esquema.sql y pasa URL y clave anon. Hasta entonces todo corre en modo demostración."
---

# `T07` · Postulación y datos

> Fase 1 · Buzón: `fabrica/buzon/T07/` · **Construida por el orquestador (Claude Fable 5.2) el 2026-11-16,
> por encargo directo del autor**, sin Gemini, QA ni auditoría aparte. Ver `fabrica/buzon/T05/REGISTRO.md`.

## Por qué existe

Es la única tarea del visitante: **postularse**, con su idea o para sumarse a un proyecto.

## Qué se construyó

1. **`Postulacion.astro`**: sección `#postulacion` (el ancla única de los dos «Postúlate») con un texto al
   lado y el formulario en una superficie del manual (borde de tinta, sombra dura).
   - Dos caminos con radios: «Tengo una idea» (nombre, regla en una frase, cómo genera dinero, quién pagaría,
     perfiles que faltan, publicar en la hélice) o «Quiero sumarme» (proyecto, habilidades, horas, portafolio,
     motivación). Datos comunes: nombre, correo institucional, facultad y programa con semestre.
   - Autorización expresa de la **Ley 1581 de 2012**, obligatoria.
   - Trampa para bots: campo oculto fuera del orden de tabulación; si llega lleno, se responde como si hubiera
     funcionado y no se guarda nada.
2. **`postulacion.ts`**: validación en orden con un solo mensaje (`role="status"`), el campo marcado
   (`aria-invalid` + `aria-describedby`) y el foco en él. Recibe `algora:sumarse` (pasa a «Quiero sumarme»,
   llena el proyecto y marca las habilidades que le faltan) y `algora:reclamar` (lleva una regla al camino de idea).
3. **`datos.ts`**: Supabase con `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`. La librería se carga
   **diferida** y solo si hay conexión, para no pesar en el JS inicial. `enviarPostulacion()` inserta en
   `postulaciones`; `cargarProyectos()` llama a `proyectos_publicos()`.
4. **Modo demostración** (sin variables): aviso `[DEMOSTRACIÓN]` visible en el formulario y, al enviar, un
   mensaje que dice que no se guardó. Nunca finge un envío.
5. **`sitio/supabase/esquema.sql`**: el del prototipo, ya probado, con los nombres de esta web.

## Decisiones tomadas por el orquestador (el autor las confirma en la revisión del prototipo)

- Formulario de **una sola pantalla con dos caminos**, como el prototipo v2 (`ENCARGO.md` § 7: los candidatos
  por pasos nunca se eligieron).
- El modo demostración se muestra con otro tono que un error: no es culpa de quien llena el formulario.
- «cómo se sostendría» en el texto lateral, en lugar de «cómo generaría dinero».

## Cuándo está terminada

- `sitio/tests/T07/` en verde (10 pruebas): ancla, dos caminos, validación de cada camino, Ley 1581, modo
  demostración, trampa, eventos y axe con un error a la vista en claro y oscuro.
- **Sin probar:** el envío real y la lectura de `proyectos_publicos()`. Necesitan el proyecto de Supabase del
  autor (bloqueante de arriba).
- Compuertas completas en verde (se corren con T08).

## Queda para el pulido

- Los textos (borrador del prototipo v2) y los ejemplos de los campos.
- Si el correo debe exigir el dominio institucional (hoy acepta cualquier correo bien formado, como el esquema).
