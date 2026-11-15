# Entrega r1 — T04 (S1) · Fichas y bloque

- **Tarea:** T04 (S1)
- **Ronda:** r1
- **Modelo:** gemini-4-hydrogen-high
- **Fábrica:** v5.0
- **Inicio:** 2026-11-15 14:39:24 -05:00
- **Fin:** 2026-11-15 14:42:14 -05:00
- **Intervenciones del autor:** 0

## Resumen
Construí la subtarea S1 de T04: el componente `Productos.astro` (bloque cobalto a sangre, etiqueta `[PRODUCTOS]`, titular `¿Cuál es el tuyo?`, botón `Postúlate`, lista de las siete fichas tipográficas, `<canvas data-marco>` y panel provisional `[data-siguiente]`, con CSS por defecto de rejilla quieta y CSS de modo horizontal bajo `data-modo='horizontal'`) y el módulo `productos-fichas.ts` (timeline `vuelo` en pausa K1, entrada letra por letra `letras()` K3 con texto accesible completo y limpieza `restaurar()`). Quedaron fuera el montaje en `index.astro`, el `ScrollTrigger` con pin, la carga diferida del marco y los tokens de `tokens.css` (son de la integración) y el shader de `marco-tinta.ts` (subtarea S2).

## Archivos
- Modificado / verificado: `sitio/src/components/Productos.astro`
- Modificado / verificado: `sitio/src/lib/productos-fichas.ts`

## Interfaz que expones

### `sitio/src/components/Productos.astro`
- **Montaje:** componente Astro sin props obligatorias (`<Productos />`). Se monta debajo de `<Hitos />` en `sitio/src/pages/index.astro` (por la integración).
- **Selectores de contrato:**
  - `section[data-productos]`: contenedor raíz de la sección.
  - `[data-productos-bloque]`: bloque cobalto a sangre con etiqueta, titular, botón y fichas.
  - `[data-productos-etiqueta]`: párrafo `[PRODUCTOS]`.
  - `[data-productos-titular]`: `<h2>` con `¿Cuál es el tuyo?`.
  - `[data-postular]`: enlace `<a href="#postulacion">Postúlate</a>`.
  - `[data-ficha]`: siete `<li>` en una `<ul>`, cada uno con `[data-ficha-etiqueta]` y `[data-ficha-nombre]`.
  - `[data-marco]`: `<canvas aria-hidden="true">` vacío para S2/integración.
  - `[data-siguiente]`: panel provisional «Cómo funciona» con fondo del tema (`var(--fondo)` y `var(--texto)`).
- **Atributos `data-*` que consume el CSS:**
  - `data-modo="horizontal"` en `section[data-productos]`: activa la vista de una pantalla fija (`100svh`, `overflow: hidden`), posiciona las 7 fichas alrededor del titular y muestra `[data-marco]` (`z-index: 2`) encima de `[data-siguiente]` (`z-index: 1`) y debajo de `[data-productos-bloque]` (`z-index: 3`).
  - `data-marco-listo` en `section[data-productos]` (junto con `data-modo="horizontal"`): vuelve transparente el fondo de `[data-productos-bloque]` para que el `<canvas data-marco>` (z-index 2) y el hueco hacia `[data-siguiente]` (z-index 1) queden visibles. **La integración debe poner `data-marco-listo` al montar `marco-tinta.ts` y quitarlo al destruirlo o al perder el contexto WebGL.**
- **Tokens CSS que lee con `var()` (con valores de respaldo locales):**
  - `--productos-bloque` (respaldo `var(--color-cobalto)`)
  - `--ficha-ancho` (respaldo `clamp(10rem, 15.27vw, 13.75rem)`), `--ficha-alto` (respaldo `clamp(7rem, 10.4vw, 9.375rem)`)
  - `--ficha-color-1` … `--ficha-color-7`
  - `--ficha-texto-1` … `--ficha-texto-7`
  - `--ficha-giro-1` … `--ficha-giro-7`

### `sitio/src/lib/productos-fichas.ts`
- **Exporta:**
  - `export interface Fichas`: `{ vuelo: gsap.core.Timeline; letras(): void; restaurar(): void; }`
  - `export function prepararFichas(seccion: HTMLElement): Fichas`
- **Comportamiento:**
  - `prepararFichas(seccion)` lee `--ficha-giro-1`..`--ficha-giro-7` desde `seccion` con `leerNumero` y crea `vuelo` en pausa (`fromTo` desde `origen_x = 1.12 * seccion.clientWidth`, `origen_y = 0.52 * seccion.clientHeight`, `scale = 0.94` y rotación inicial hasta `x: 0, y: 0, scale: 1, rotation: giroFinal`, duración `1.3`, stagger `0.09`, `ease: 'expo.out'`). No crea `ScrollTrigger` ni pin.
  - `letras()` parte `[data-productos-etiqueta]` (con texto `.productos__solo-lector` accesible) y `[data-productos-titular]` (con `aria-label` completo en el `<h2>` y letras en `aria-hidden="true"`) y los sube desde `yPercent: 120` a `0` (`duration: 0.9`, `stagger: 0.03`, `ease: 'power4.out'`). Llamarla más de una vez no tiene efecto.
  - `restaurar()` mata `vuelo` y el tween de `letras`, limpia propiedades en línea (`transform`, `opacity`, `visibility`) de fichas, botón, titular y etiqueta, y devuelve los textos planos originales sin `aria-label`.

## Compuertas
`COMPUERTAS: VERDE` con `node fabrica/scripts/compuertas.mjs T04 --sin-build` (0 bloquean, 4 avisos):
- ⚠️ `check/build`: saltados con `--sin-build` según la orden de subtarea (la integración corre la suite completa); `npx astro check` se corrió por aparte con 0 errores.
- ⚠️ `mobiliario` (`Productos.astro:101, 102, 115, 147, 148`): corresponde al borde `--borde-ancho` y la sombra dura `--sombra` / `--sombra-hover` del manual de marca para el botón `Postúlate` y las fichas tipográficas (pedido explícitamente en el punto 2 de la tarea).
- ⚠️ `fuentes` y `js-inicial`: sin `dist/` por `--sin-build` (los mide la integración).

## Verificación
- `node fabrica/scripts/compuertas.mjs T04 --sin-build`: `COMPUERTAS: VERDE · Bloquean: 0 · Avisos: 4`.
- `npx astro check` (desde `sitio/`): `Result (31 files): 0 errors, 0 warnings, 0 hints`.
- Cálculo de contraste WCAG AA (Node, fórmula luminancia relativa sRGB sobre hex de `sitio/src/styles/tokens.css`):
  - `#D1FF22` (`--color-acido`) + `#0D0D0D` (`--color-tinta`): `16.69:1`
  - `#FF3D8A` (`--color-magenta`) + `#0D0D0D` (`--color-tinta`): `5.82:1`
  - `#F6F8FB` (`--color-papel`) + `#0D0D0D` (`--color-tinta`): `18.27:1`
  - `#FF103E` (`--color-tomate`) + `#0D0D0D` (`--color-tinta`): `4.99:1`
  - `#FF103E` (`--color-tomate`) + `#F6F8FB` (`--color-papel`): `3.66:1` (< 4.5:1)
  - `#2C08FF` (`--color-cobalto`) + `#F6F8FB` (`--color-papel`): `7.63:1`
  - `#2C08FF` (`--color-cobalto`) + `#D1FF22` (`--color-acido`): `6.98:1`

## Decisiones
- Dentro de `.productos` fijé `--borde: var(--color-tinta)` y `--foco: var(--color-acido)` porque el bloque de marca es cobalto en ambos temas (como `Portada.astro`): así el foco sobre el botón `Postúlate` mantiene contraste `6.98:1` y las fichas conservan la sombra dura en tinta también en tema oscuro (especialmente la ficha 4 en papel).
- En `letras()` inicié la subida en `yPercent: 120` (en lugar de `100`) para compensar el `padding-block-end: 0.18em` de `.productos__mascara` (necesario para no recortar descendentes) y evitar que la parte superior de letras altas quede asomada antes de animar.
- Agregué ajuste de `@media (max-height: 780px)` en modo horizontal para desplazar la ficha 2 a `inset-inline-start: 23%` y compactar el `gap` del centro, evitando que roce `[PRODUCTOS]` en laptops de poca altura (p. ej. `1280×720` o `1024×640`).

## Supuestos
- **Conflicto de contraste en fichas 3 y 7 (tomate):** la tarea dice en «Decisiones del orquestador» y en la tabla de tokens que el texto sobre el tomate va en `papel` (`--ficha-texto-3` y `--ficha-texto-7`), pero en «Qué construyes» punto 2 exige «Texto con contraste ≥ 4,5:1 sobre su color» y las pruebas comunes corren `axe` (WCAG 2.2 AA). Medí que `papel` (`#F6F8FB`) sobre `tomate` (`#FF103E`) da `3.66:1` (< 4,5:1), mientras que `tinta` (`#0D0D0D`) sobre `tomate` da `4.99:1` (como ya usa `Hitos.astro` en `.hito[data-color='tomate']`). Seguí la regla de contraste de la tarea dejando `var(--color-tinta)` como respaldo en `Productos.astro` y lo paso a SOLICITUDES para la integración en `tokens.css`.
- **Respaldo sin marco WebGL:** asumí que la integración pondrá `data-marco-listo` en `section[data-productos]` mientras el canvas de `marco-tinta.ts` esté montado (para transparentar `.productos__bloque`) y lo quitará al destruirlo o al perder el contexto.

## PENDIENTES
- Ninguno en S1 (todos los textos salen de `T04-productos.md` y `ENCARGO.md` § 2).

## SOLICITUDES
- **Para la integración (`sitio/src/styles/tokens.css`):** usar `var(--color-tinta)` en `--ficha-texto-3` y `--ficha-texto-7` (o consultar con el orquestador/autor antes de usar `var(--color-papel)`), porque papel sobre tomate da `3.66:1` y fallaría `axe` (`color-contrast`, WCAG AA ≥ 4,5:1), mientras tinta sobre tomate da `4.99:1`.
- **Para la integración (`sitio/src/lib/productos.ts`):** poner `seccion.setAttribute('data-marco-listo', '')` cuando `montarMarco(canvas)` devuelva una instancia válida y quitarlo al destruirlo o perder contexto WebGL, para que `[data-productos-bloque]` deje ver el `<canvas data-marco>` y `[data-siguiente]` debajo.
