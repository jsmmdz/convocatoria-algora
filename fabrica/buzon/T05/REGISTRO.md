# Registro — T05, T06, T07 y T08 (una sola sesión)

- **Modelo:** Claude Fable 5.2, como orquestador **y** constructor.
- **Fábrica:** v5.0, **sin su ciclo**: no hubo Gemini, QA de Sonnet ni auditoría de Opus.
- **Fecha:** 2026-11-16, una sesión.
- **Intervenciones del autor:** una, al empezar: «usa Fable para continuar con el desarrollo de la página,
  continuemos donde lo dejamos y déjame un prototipo con todas las tareas hechas como entregable final».

## Por qué se salió del ciclo

El autor pidió el prototipo completo de una vez y con Fable. El ciclo de la fábrica pide una decisión del autor
antes de cada tarea, un `/construir-tarea` por tarea y un visto bueno entre una y otra; con eso no hay prototipo
«de una». Se construyeron las cuatro tareas seguidas y las decisiones de dirección quedaron escritas como
**por confirmar** (`docs/1-PRODUCTO.md` § 6).

## Qué la respalda, a falta de QA y auditoría

- **37 pruebas de aceptación nuevas** (`sitio/tests/T05` a `T08`), más las comunes sobre las tres rutas y la
  regresión de T01–T03. Resultado en `fabrica/buzon/T08/COMPUERTAS-r1.md`.
- **Capturas miradas por el orquestador** en esta sesión a 1440 × 900, 1280 × 720, 1024 × 768 y 390 × 844, en
  claro y oscuro, y la hélice sin WebGL. Son temporales (`fabrica/buzon/T05/tmp/`, no se suben).
- Lo que **no** tiene: una segunda mirada con contexto limpio. Quien construyó escribió las pruebas, así que
  comparten puntos ciegos (`fabrica/nucleo/fallas.md`, «Al revisar»). Si el autor quiere, la auditoría final
  se puede lanzar sola: `/construir-tarea T06 auditoria` (la hélice es la pieza con más riesgo).

## Defectos que aparecieron y se corrigieron en la sesión

| Dónde | Qué pasó | Cómo se vio |
|---|---|---|
| T06 | El canvas quedaba en 300 × 150 en la esquina: OGL deja estilos en línea al crear el renderer | captura |
| T06 | El texto del DOM se despegaba hasta 25 px de la tarjeta curva al girar | captura; se pasó a textura |
| T07 | `aria-errormessage` apuntando a un `role="status"`: axe lo rechaza | prueba de axe con error a la vista |
| T08 | «¿Seguro? Borrar» se montaba sobre el botón de la columna de al lado | captura |
| T08 | A 390 px la página medía 1003 px: el texto solo para lectores de la tabla (absoluto) se salía de la caja con scroll | prueba de 390 px |
| T08 | El nombre accesible de «Borrar» no contenía el texto visible al armarse | prueba de axe |

## Sin probar (no se puede sin el autor)

- Envío real a Supabase, lectura de `proyectos_publicos()` y todo el panel contra datos reales: falta el
  proyecto de Supabase (URL y clave anon) y los usuarios del equipo.
- Lo que solo juzga el ojo del autor: el ritmo de la hélice, los colores de las carreras, los textos.

## Tokens y tiempo

Sin medir: la sesión no corrió por el workflow, que es el que deja los tokens por agente.
