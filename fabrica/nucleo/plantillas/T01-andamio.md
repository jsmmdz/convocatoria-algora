---
id: T01
agente: "@constructor"
fase: 1
depende: []
tipo: arquitectura
requiere:
  - docs/2-TECNICO.md
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

> Plantilla del preset: la primera tarea de toda web. El orquestador la copia a
> `fabrica/proyecto/tareas/T01-andamio.md` cuando el plan está aprobado, la ajusta a `docs/2-TECNICO.md`
> y escribe `sitio/tests/T01/` antes de lanzarla.

## Por qué existe

Que todas las tareas siguientes construyan sobre lo mismo: el stack, los tokens, la señal `data-listo`
y una página que ya se publica. Sin contenido del sitio todavía.

## Lee antes de empezar

- `docs/2-TECNICO.md` completo (stack, contratos, publicación) y `docs/1-PRODUCTO.md` § 4 (paleta y tipografía).
- `fabrica/nucleo/reglas.md` § 5.

## Qué construyes

1. **Proyecto Astro** en `sitio/` con salida estática, TypeScript estricto y los scripts `dev`, `build`,
   `check` (`astro check`) y `preview`. Dependencias de desarrollo: `@astrojs/check`, `typescript`,
   `@playwright/test`, `@axe-core/playwright`. Nada más que no autorice `docs/2-TECNICO.md`.
2. **`astro.config.mjs`** con `site: process.env.SITIO_URL` y `base: process.env.SITIO_BASE ?? '/'`, y la
   barra de herramientas de Astro apagada.
3. **`src/styles/tokens.css`** con la paleta, tipografía, espacios, capas, duraciones y curvas de
   `docs/1-PRODUCTO.md` § 4, con modo claro y oscuro si el producto lo pide. Es el único archivo con hex.
4. **Layout base** (`src/layouts/Base.astro`): `<html lang="es">`, `meta viewport`, título y descripción,
   `body{margin:0}`, foco visible con contraste ≥ 3:1, y el script que pone **`data-listo` en `<html>`**
   cuando termina la entrada (hoy, al cargar), con respaldo por tiempo.
5. **`src/pages/index.astro`** con el layout y un marcador visible `[CONTENIDO DE T02]`. Sin contenido inventado.
6. **`404.astro`** mínima con enlace al inicio pasando por `import.meta.env.BASE_URL`.

## Queda para el pulido — no es del agente

Todo lo visual: el andamio solo tiene que estar bien armado.

## Accesibilidad, respaldo y rendimiento

Las pruebas comunes (`sitio/tests/comunes/`) tienen que pasar: consola limpia, sin scroll horizontal a
375 px, axe sin violaciones graves, movimiento reducido, foco visible.

## Cuándo terminaste

- `node fabrica/scripts/compuertas.mjs T01` en **VERDE** (check, build, comunes y `tests/T01/`).
- `node fabrica/scripts/capturas.mjs T01` corrido y mirada la foto de breakpoints.
- Entrega en `fabrica/buzon/T01/ENTREGA-r1.md`.
