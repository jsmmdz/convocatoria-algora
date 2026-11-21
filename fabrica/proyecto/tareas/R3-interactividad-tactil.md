---
id: R3
agente: "@constructor"
fase: 3
depende: [R2]
tipo: responsive
requiere:
  - fabrica/nucleo/roles/responsive.md
  - docs/1-PRODUCTO.md
  - docs/2-TECNICO.md
  - fabrica/proyecto/referentes/unseen.json
  - fabrica/proyecto/referentes/tabletales.json
  - fabrica/proyecto/referentes/ryan.json
rutas: ["/"]
archivos:
  - sitio/src/lib/trama.ts
  - sitio/src/lib/capas3d.ts
  - sitio/src/lib/hitos.ts
  - sitio/src/lib/productos.ts
  - sitio/src/lib/productos-fichas.ts
  - sitio/src/lib/marco-tinta.ts
  - sitio/src/lib/helice.ts
  - sitio/src/lib/helice-gl.ts
  - sitio/src/lib/carrusel.ts
  - sitio/src/components/Hitos.astro
  - sitio/src/components/Carreras.astro
  - sitio/tests/R3/**
regresion: [T01, T02, T03, T04, T05, T06, T07, T08, T09, R1, R2]
bloqueantes: []
---

# `R3` · Interactividad táctil

> Fase 3 · Buzón: `fabrica/buzon/R3/` · Decisiones X-7…X-11 en `docs/1-PRODUCTO.md` § 9 (autor, 2026-11-21).
> Regla: **corto no es quieto**. Nada fija secciones ni alarga la página en táctil: el alto total sigue dentro de
> la meta de R2 (≤ 12,5 pantallas a 390). A 1440 con ratón nada cambia. Divisible en subtareas por sección (los
> archivos de cada punto son disjuntos, salvo `carrusel.ts`, que comparten 1 y 4: va en la integración).

## Qué se entrega (modo táctil = `CONSULTA_TACTIL_ANIMADO`, R-7)

1. **Hitos (X-7):** bajo el carrusel de R2, una línea ondulada horizontal punteada con su copia sólida recortada
   que avanza con el desplazamiento del carrusel. El unicornio la recorre con `rotación = lerp(rotación,
   clamp(−40, 40, velocidad del dedo), 0,04)` y 1,5 px por grado (T03, E3). Pasa por debajo de las tarjetas y de
   los textos.
2. **Portada (X-8):** `trama.ts` acepta `pointerType === 'touch'` en `pointerdown`/`pointermove` sin
   `preventDefault` (el scroll vertical sigue siendo del dedo); la deformación se apaga sola al soltar. En
   `capas3d.ts`, en táctil, parallax ligado al scroll de la portada en lugar del cursor. Sin giroscopio.
3. **Productos (X-9):** en táctil, las fichas vuelan con giro a su celda de la rejilla al entrar en pantalla
   (ScrollTrigger sin pin, una sola vez, ≤ 0,9 s) y el marco de tinta se abre en un recorrido corto (≤ 1 pantalla,
   sin pin) hacia «Cómo funciona». Sin WebGL o con `import()` fallido, el panel queda visible (T04, E1–E2).
4. **Proyectos (X-10):** en táctil, la hélice curva en WebGL movida por arrastre horizontal (inercia, ajuste a la
   tarjeta más cercana, contador y flechas ≥ 44 px), sin secuestrar el gesto vertical (`touch-action: pan-y`). Las
   tarjetas reales siguen en el DOM. **Presupuesto:** ≥ 50 fps en 4× CPU throttling de Chromium a 390 × 844. Si no
   lo cumple o no hay WebGL, cae al carrusel plano de R-2. La caída se prueba.
5. **Carreras (X-11):** cada bloque de la rejilla es un botón (`aria-expanded`); al tocarlo crece en su color y
   muestra lo que aporta; uno abierto a la vez; Enter/Espacio y Escape. El cambio de alto no mueve el scroll de
   forma brusca (el bloque abierto queda a la vista).
6. **Movimiento reducido:** sin vuelo, sin unicornio en movimiento, sin hélice; todo visible. Los bloques de
   carreras se abren sin animación.

## Pruebas (`tests/R3/`)

Alto total en táctil dentro de la meta; el unicornio y la línea avanzan con el carrusel; la trama responde a un
toque simulado y la página sigue haciendo scroll; las fichas llegan a su celda; el marco no fija la sección; la
hélice táctil (arrastre, ajuste, flechas, caída sin WebGL, fps con throttling); carreras abre/cierra con toque y
teclado; axe en las 20 pantallas; regresión completa.

## Visto bueno

El autor, en un celular de verdad y publicado: inercia del unicornio, sensación de la hélice y del vuelo.
