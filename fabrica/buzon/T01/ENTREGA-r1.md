# Entrega r1 — T01 · Andamio

- **Tarea:** T01
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1 (la de `fabrica/nucleo/reglas.md`)
- **Inicio:** Tue Nov 10 05:40 2026
- **Fin:** Tue Nov 10 05:50 2026
- **Intervenciones del autor:** 0

## Resumen
Proyecto Astro en `sitio/` con tokens del manual (claro/oscuro), fuentes de Fontsource servidas desde el sitio, layout base, motor de movimiento (GSAP + ScrollTrigger + una instancia de Lenis), nav, pie, `index` y `404`. Sin contenido de secciones, como pide la tarea. No hice nada de lo que queda para el pulido.

## Archivos
Creados (todos dentro de `archivos`):
- `sitio/package.json`, `sitio/package-lock.json`, `sitio/astro.config.mjs`
- `sitio/src/styles/tokens.css`, `sitio/src/styles/global.css`
- `sitio/src/layouts/Base.astro`
- `sitio/src/components/Nav.astro`, `sitio/src/components/Pie.astro`
- `sitio/src/lib/listo.ts`, `movimiento.ts`, `tema.ts`, `rutas.ts`
- `sitio/src/pages/index.astro`, `sitio/src/pages/404.astro`
- `sitio/src/tipos-node.d.ts` (ver Decisiones y SOLICITUDES)

## Compuertas
`node fabrica/scripts/compuertas.mjs T01` en primer plano, última corrida (05:48): **COMPUERTAS: VERDE**. check `0 errors · 0 warnings · 0 hints`, build `Complete!`, `npx playwright test tests/comunes tests/T01` ` passed`. Presupuestos: fuentes 240.444 B (máx 250.000), JS inicial 49.524 B gzip (máx 220.000).

Aviso ⚠️ `mobiliario` (Nav.astro:29, 53, 55, 60): son el borde de tinta de la barra y de los botones y la sombra dura de los botones, que la tarea y el manual piden de forma expresa (punto 7 de «Qué construyes»). No son bordes decorativos añadidos. Los valores salen de tokens (`--borde-ancho`, `--sombra`).

## Verificación
- `npm install ...` desde `sitio/`: 0 vulnerabilidades. Versiones fijadas en `package-lock.json`. Dependencias: solo las de la tarea.
- Primer rojo: la prueba de fuentes no veía Zalando Sans porque ningún texto de la página lo usaba (el pie estaba en titular y etiqueta). Arreglo: la línea «Convocatoria abierta · fechas por confirmar» del pie va en `--fuente-texto`. No toqué pruebas ni escribí estado a mano.
- Capturas: `node fabrica/scripts/capturas.mjs T01` produjo 10 imágenes en `fabrica/buzon/T01/capturas/`. Las miré: `inicio-breakpoints.jpg` y `inicio-1440-completa.jpg`. A 1440, 1280 y 1024 no hay nada encimado ni cortado: nav con logo, «Tema» y «Postúlate»; h1 en DM Serif; etiqueta mono; pie de tinta a sangre con texto papel. En `inicio-1440-completa.jpg` la nav aparece a mitad de la imagen: es un artefacto de la foto de página completa con una barra fija (la prueba de nav mide `y <= 1` tras bajar y pasa). Los anchos de celular y tablet no los trabajé (van en `R`); en las hojas se ve que a 320 px el h1 parte «CONTENID / O», anotado como pulido de responsive.
- Función de lo medido: la prueba de fuentes comprueba `document.fonts` cargadas (DM Serif Text, Zalando Sans, JetBrains Mono, Rubik Bubbles) y que h1 y cuerpo las usan; pasa. Ninguna petición sale del sitio (prueba `ninguna petición sale del propio sitio`, pasa).

## Decisiones
- Fuentes: `latin-400` y `latin-400-italic` de DM Serif Text, `latin-400` de Rubik Bubbles y `wght.css` de las variables (Zalando Sans y JetBrains Mono). Las variables no traen CSS solo-latín; el navegador baja solo los subconjuntos que usa, pero `dist/_astro` incluye todos (240 KB, bajo el aviso de 250 KB).
- Tema: tokens del tema definidos tres veces (por defecto, `prefers-color-scheme` sin atributo, y forzado por atributo) porque CSS no permite compartir un bloque entre selectores y media query sin duplicar. `--foco`: cobalto en claro y ácido en oscuro; `--acento` en oscuro usa el violeta suave del manual (`#8C7BFF`, token propio).
- «Postúlate» en ácido con texto tinta, igual en los dos temas (bloque de marca).
- `rutas.ts` exporta `inicio` (BASE_URL sin barra final + `/`) para que el enlace al inicio siempre termine en `/`.
- `sitio/src/tipos-node.d.ts`: tipos mínimos de `node:fs`, `node:path` y `process` porque `astro check` falla con 3 errores en `sitio/tests/comunes/rutas.ts` (no hay `@types/node` y la tarea dice «Nada más» en dependencias). Es un arreglo local; la solución limpia está en SOLICITUDES.

## Supuestos
- La tarea dice que `sitio/tsconfig.json` se puede ajustar, pero no está en `archivos` y la compuerta `fuera-de-alcance` lo marcó en rojo cuando excluí `tests`. Seguí la regla (alcance manda), lo revertí con `git checkout -- sitio/tsconfig.json` y usé el shim.
- Nombre accesible del logo: «algora, ir al inicio» (contiene el texto visible y hace que la 404 encuentre «inicio»). Botón de tema: texto visible «Tema», nombre accesible «Cambiar tema».
- `data-listo` se pone como atributo vacío (`data-listo=""`).

## PENDIENTES
- `<h1>[CONTENIDO DE T02]</h1>` y la etiqueta `[CONVOCATORIA_27]`: marcadores que pide la tarea; los reemplaza T02.
- Fechas de la convocatoria: «fechas por confirmar» (texto de la tarea).
- La sección `#postulate` no existe todavía (llega en T07); el enlace de la nav apunta a ese ancla.

## SOLICITUDES
- `sitio/tsconfig.json` (orquestador): excluir `"tests"` de `exclude`, o agregar `@types/node` como dependencia de desarrollo; con cualquiera de las dos se puede borrar `sitio/src/tipos-node.d.ts`.
- Pulido: ancho de 320 px donde el h1 parte la palabra «CONTENIDO»; escala de titulares y proporciones de la nav.
