---
id: T08
agente: "@orquestador"
fase: 1
depende: [T07]
tipo: pagina
requiere:
  - docs/2-TECNICO.md
  - sitio/supabase/esquema.sql
  - sitio/tests/T08/t08.spec.ts
rutas: ["/", "/equipo/"]
archivos:
  - sitio/src/pages/equipo.astro
  - sitio/src/lib/equipo.ts
  - sitio/src/lib/rutas.ts
  - sitio/src/layouts/Base.astro
  - sitio/src/components/Pie.astro
regresion: [T01, T02, T03, T05, T06, T07]
bloqueantes:
  - "Supabase: además del proyecto, el autor crea los usuarios del equipo y los inscribe en la tabla «equipo» (instrucciones al final de sitio/supabase/esquema.sql)."
---

# `T08` · Panel del equipo

> Fase 1 · Buzón: `fabrica/buzon/T08/` · **Construida por el orquestador (Claude Fable 5.2) el 2026-11-16,
> por encargo directo del autor**, sin Gemini, QA ni auditoría aparte. Ver `fabrica/buzon/T05/REGISTRO.md`.

## Por qué existe

El equipo del semillero necesita revisar las postulaciones, decidir qué ideas salen en la hélice y sacar los
datos, sin entrar a Supabase.

## Qué se construyó

1. **`/equipo/`** (`equipo.astro`, con `noindex`), con los componentes del manual. Se llega desde el pie
   («Acceso del equipo»).
2. **Entrar** con Supabase Auth (correo y contraseña). La seguridad la ponen las reglas del esquema: quien no
   esté en la tabla `equipo` recibe una lista vacía.
3. **Postulaciones**: cinco cifras (total, con idea, para sumarse, ideas por revisar, áreas), filtros por tipo,
   área y estado, y la tabla dentro de una caja con scroll propio.
4. **Moderar**: «Aprobar» / «En la hélice» y «Busca equipo» / «Equipo completo» (botones con `aria-pressed`),
   solo en ideas que autorizaron publicar.
5. **Borrar con confirmación**: el primer clic arma el botón 4 s («¿Seguro? Borrar»); el segundo borra.
6. **Descargar CSV** de lo filtrado, con BOM para Excel, comillas dobladas y listas separadas por «; ».
7. **Sin Supabase**: lo dice y ofrece recorrer el panel con seis filas `[EJEMPLO]` en memoria, marcadas
   `[DEMOSTRACIÓN]`. Nada se guarda.

## Decisiones tomadas por el orquestador (el autor las confirma en la revisión del prototipo)

- El **recorrido con datos de ejemplo**: sin él, el autor no podría ver el panel hasta tener Supabase.
- El panel usa la misma nav y el mismo pie del sitio.

## Cuándo está terminada

- `sitio/tests/T08/` en verde (11 pruebas): aviso sin conexión y `noindex`, enlace del pie, cifras, filtros,
  aprobar y equipo completo, borrar en dos clics, contenido del CSV, cerrar, 390 px sin scroll de página y axe
  con el panel abierto en claro y oscuro.
- **Sin probar:** entrar, leer, cambiar y borrar contra Supabase real (bloqueante de arriba).
- `node fabrica/scripts/compuertas.mjs T08 --completas` en verde: cierra el prototipo de escritorio.

## Queda para el pulido

- Notas internas por postulación (el esquema ya tiene la columna `notas`).
- Ordenar la tabla por columna.
