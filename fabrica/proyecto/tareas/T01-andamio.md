---
id: T01
agente: "@constructor"
fase: 1
depende: []
tipo: arquitectura
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - sitio/tests/T01/t01.spec.ts
rutas: ["/"]
archivos:
  - sitio/package.json
  - sitio/package-lock.json
  - sitio/astro.config.mjs
  - sitio/src/**
  - sitio/public/**
regresion: []
bloqueantes: []
---

# `T01` · `@constructor` — Andamio

> Fase 1 · corre sola · Buzón: `fabrica/buzon/T01/`

## Por qué existe

Que todas las tareas siguientes construyan sobre lo mismo: Astro, los tokens del manual de Creación
Digital, las fuentes servidas desde el sitio, el tema claro/oscuro, el motor de movimiento (GSAP +
Lenis) y una página que ya se publica. Sin contenido de secciones todavía.

## Lee antes de empezar

- `docs/2-TECNICO.md` completo (stack, contratos, publicación, presupuestos).
- `docs/1-PRODUCTO.md` § 4 (paleta y tipografía) y § 6 (decisiones).
- `previo/manual-marca-v0.1.html`: el manual. Mira sus tokens (`:root`) y componentes (botones, etiquetas
  entre corchetes, bordes de tinta, sombra dura). **Se lee como referencia; no se copia el archivo.**
- `fabrica/nucleo/reglas.md` § 5.

## Decisiones del autor que aplica esta tarea

- Stack: Astro adaptado, con `gsap`, `lenis`, `ogl`, `three`, `@supabase/supabase-js` (`2-TECNICO` § 1).
  En esta tarea solo se instalan y se conectan **gsap y lenis**; las demás las instala la tarea que las use.
- Identidad: el manual de Creación Digital (`1-PRODUCTO` § 4).
- Tema claro y oscuro intercambiables con botón; los bloques de marca iguales en ambos (`1-PRODUCTO` § 6).
- Desktop primero: el responsive va casi al final (`3-ESTADO` § Orden del autor). Aquí solo se exige que
  a 375 px no haya scroll horizontal (prueba común).

## Qué construyes

1. **Proyecto Astro** en `sitio/` con salida estática, TypeScript estricto y los scripts `dev`, `build`,
   `check` (`astro check`) y `preview`. Dependencias de desarrollo: `@astrojs/check`, `typescript`,
   `@playwright/test`, `@axe-core/playwright`. Dependencias: `gsap`, `lenis` y las fuentes de Fontsource
   `@fontsource/dm-serif-text` (400 normal e itálica), `@fontsource-variable/zalando-sans`,
   `@fontsource-variable/jetbrains-mono` y `@fontsource/rubik-bubbles`. Nada más.
2. **`astro.config.mjs`** con `site: process.env.SITIO_URL` y `base: process.env.SITIO_BASE ?? '/'`, y la
   barra de herramientas de Astro apagada.
3. **`src/styles/tokens.css`**, el único archivo con hex. Nombres exactos (las pruebas los leen):
   - Marca, iguales en ambos temas: `--color-papel: #F6F8FB`, `--color-tinta: #0D0D0D`,
     `--color-acido: #D1FF22`, `--color-cobalto: #2C08FF`, `--color-tomate: #FF103E`,
     `--color-magenta: #FF3D8A`.
   - Del tema (cambian entre claro y oscuro): `--fondo`, `--superficie`, `--texto`, `--texto-suave`,
     `--borde`, `--linea`, `--acento`, `--foco`. En claro `--fondo` es el papel y `--texto` la tinta; en
     oscuro, al revés. `--foco` con contraste ≥ 3:1 contra `--fondo` en los dos temas.
   - Tipografía: `--fuente-titular` (DM Serif Text), `--fuente-texto` (Zalando Sans Variable),
     `--fuente-etiqueta` (JetBrains Mono Variable), `--fuente-acento` (Rubik Bubbles), cada una con su
     respaldo de sistema.
   - Espacios fluidos al estilo Leadoff (`leadoff` K2): `--margen: max(24px, 3vw)`,
     `--gutter: max(12px, min(2vw, 48px))` y una escala de titulares con `clamp()`.
   - Sombra dura del manual (`--sombra: 4px 4px 0 var(--borde)`), radios, capas (`--capa-nav`,
     `--capa-precarga`), duraciones y curvas.
   - El tema se resuelve así: sin atributo manda `prefers-color-scheme`; `html[data-theme="light"]` y
     `html[data-theme="dark"]` lo fuerzan en los dos sentidos.
4. **Fuentes desde el sitio**: se importan de Fontsource (sin Google Fonts ni ningún otro CDN). Solo los
   pesos y estilos que se usan.
5. **Layout base** (`src/layouts/Base.astro`): `<html lang="es-CO">`, `meta viewport`, título
   «Convocatoria Algora», descripción, `body{margin:0}` con `background: var(--fondo)` y
   `color: var(--texto)`, foco visible con `--foco`, y:
   - Un script en línea en el `<head>` que aplica el tema guardado (`localStorage` clave `algora-tema`,
     con `try/catch`) antes de pintar.
   - **`data-listo` en `<html>`** con `src/lib/listo.ts` (`marcarListo()`): hoy se marca al cargar; T02 lo
     moverá al final de la precarga. Respaldo por tiempo de 3,5 s.
6. **Movimiento** (`src/lib/movimiento.ts`): registra `ScrollTrigger` en GSAP y crea **una** instancia de
   Lenis conectada a GSAP (`lenis.on('scroll', ScrollTrigger.update)` y `gsap.ticker` llama
   `lenis.raf`). Con `prefers-reduced-motion: reduce` no se crea Lenis. Exporta `gsap`, `ScrollTrigger`,
   `lenis` (o `null`) y `movimientoReducido`.
7. **Navegación** (`src/components/Nav.astro`): barra fija arriba con el logo «algora» en
   `--fuente-acento` enlazado al inicio, el botón de tema (`id="tema"`, nombre accesible «Cambiar tema»)
   y el enlace «Postúlate» a `#postulate` (la sección llega en T07). Botón y enlace con borde de tinta y
   sombra dura del manual.
8. **Pie** (`src/components/Pie.astro`): bloque de `--color-tinta` a sangre con «Semillero Algora ·
   Creación Digital · Universidad El Bosque» y «Convocatoria abierta · fechas por confirmar».
9. **`src/pages/index.astro`** con el layout, la nav, un `<main>` con un `<h1>` en `--fuente-titular`
   que dice `[CONTENIDO DE T02]`, una etiqueta `[CONVOCATORIA_27]` en `--fuente-etiqueta`, y el pie. Sin
   contenido inventado.
10. **`404.astro`** mínima con el layout y un enlace al inicio que pasa por `import.meta.env.BASE_URL`.

## Queda para el pulido — no es del agente

Todo lo visual fino: proporciones de la nav, la escala exacta de titulares, el ritmo de Lenis. El andamio
solo tiene que estar bien armado y fiel a los tokens del manual.

## Accesibilidad, respaldo y rendimiento

- Las pruebas comunes (`sitio/tests/comunes/`) pasan: consola limpia, sin scroll horizontal a 375 px,
  axe sin violaciones graves, movimiento reducido, foco visible.
- Sin JS la página se ve completa (el tema sigue `prefers-color-scheme`).
- Ninguna petición sale del propio sitio al cargar la página.

## Notas sobre tus archivos

- El despliegue (`.github/workflows/deploy.yml`) ya lo dejó listo el orquestador con las variables de
  Supabase: **no lo toques**.
- `sitio/tsconfig.json` y `sitio/playwright.config.ts` ya existen: el primero lo puedes ajustar a lo que
  pida Astro; el segundo no se toca.

## Cuándo terminaste

- `node fabrica/scripts/compuertas.mjs T01` en **VERDE** (check, build, comunes y `tests/T01/`).
- `node fabrica/scripts/capturas.mjs T01` corrido y mirada la foto de breakpoints: a 1440, 1280 y 1024
  nada encimado ni cortado (el resto de anchos se trabaja en `R`).
- Lo que ninguna prueba comprueba y juzga el autor: que la nav y el pie se sientan del manual.
- Entrega en `fabrica/buzon/T01/ENTREGA-r1.md`.
