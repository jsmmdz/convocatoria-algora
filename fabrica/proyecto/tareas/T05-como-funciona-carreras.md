---
id: T05
agente: "@orquestador"
fase: 1
depende: [T04]
tipo: componente
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - fabrica/proyecto/referentes/leadoff.json
  - sitio/tests/T05/t05.spec.ts
rutas: ["/"]
archivos:
  - sitio/src/components/ComoFunciona.astro
  - sitio/src/components/Carreras.astro
  - sitio/src/components/Productos.astro
  - sitio/src/datos/facultades.ts
  - sitio/src/lib/revelar.ts
  - sitio/src/pages/index.astro
  - sitio/src/styles/tokens.css
  - sitio/src/styles/global.css
regresion: [T01, T02, T03]
bloqueantes: []
---

# `T05` · Cómo funciona y carreras

> Fase 1 · Buzón: `fabrica/buzon/T05/` · **Construida por el orquestador (Claude Fable 5.2) en una sola
> sesión, el 2026-11-16, por encargo directo del autor** («usa Fable para continuar… déjame un prototipo con
> todas las tareas hechas»). No pasó por Gemini, ni por el QA de Sonnet, ni por la auditoría de Opus: lo que
> la respalda son sus pruebas, las compuertas y las capturas. Ver `fabrica/buzon/T05/REGISTRO.md`.

## Por qué existe

Cuarto y quinto paso del arco persuasivo: después de lo concreto (productos), el **cómo** (4 pasos) y el
**permiso** (cualquier carrera aporta).

## Qué se construyó

1. **Entrada de «Cómo funciona»** en el panel que deja ver el marco de tinta (`[data-siguiente]` de
   `Productos.astro`, `id="como-funciona"`): etiqueta `[CÓMO FUNCIONA]`, titular XXL «De la idea al mercado,
   *con método*.» y una frase. El panel provisional de T04 se continúa, no se reemplaza.
2. **`ComoFunciona.astro`** (leadoff A4, D-7): `<ol>` de 4 pasos. Desde 1024 px son 4 columnas fijas a toda la
   altura (`--pasos-alto`), separadas por hilos verticales finos (`--hilo`, `--linea`); cada una lleva arriba
   el número y la flecha ↗ en mono gris, y abajo el título, el texto y `[SALE] …`. El aire queda en medio.
   En angosto se apilan con hilos horizontales. Sin scroll horizontal.
3. **`Carreras.astro`** (leadoff A2/A6): cabecera sobre el fondo del tema («No hace falta *saber programar*.»)
   y 8 bandas de color a sangre, una por facultad, con `[01]`, el nombre en serif y lo que aporta.
4. **`datos/facultades.ts`**: una sola lista de facultades para las bandas, el color de las tarjetas de la
   hélice (D-8) y el desplegable del formulario. Tokens `--facultad-<n>` y `--facultad-texto-<n>`.
5. **`lib/revelar.ts`** (leadoff K1): lo marcado con `[data-revelar]` sube y aparece una vez al entrar en
   pantalla. El estado oculto solo existe si el módulo corrió (`data-revelar-listo`): sin JS o con movimiento
   reducido todo está a la vista.

## Decisiones tomadas por el orquestador (el autor las confirma en la revisión del prototipo)

- «De la idea **al mercado**, con método» en lugar de «al primer peso» del prototipo v2: `ENCARGO.md` § 6 pide
  no prometer ingresos.
- El orden de colores de las facultades (cobalto, ácido, magenta, tomate y se repite): dos bandas seguidas
  nunca comparten color y los cuatro colores de la marca pesan lo mismo.
- La entrada de la sección va dentro del panel del marco, para que la tinta se abra hacia un titular y no
  hacia unas columnas a medio ver.

## Cuándo está terminada

- `sitio/tests/T05/` en verde (7 pruebas): columnas a 1440 y 1024, apilado a 390, textos, entradas con y sin
  movimiento reducido, bandas a sangre con su color y contraste ≥ 4,5:1, bloques iguales en claro y oscuro.
- Compuertas completas en verde (se corren con T08, que cierra el prototipo).

## Queda para el pulido

- Los textos (borrador del prototipo v2) y el titular de la sección.
- El alto de las columnas y de las bandas, y el ritmo de las entradas.
- Si las bandas de carreras llevan además algo que crezca dentro del nombre (leadoff A3).
