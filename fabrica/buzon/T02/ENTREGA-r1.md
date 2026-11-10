# Entrega r1 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1 (la de `fabrica/nucleo/reglas.md`)
- **Inicio:** Tue Nov 10 11:07 2026
- **Fin:** Tue Nov 10 11:30 2026
- **Intervenciones del autor:** 0

## Resumen
Construí la precarga (cuenta `[NN%]` con la mascota), la portada cobalto con el titular «¿Y si esta vez sí [objeto] lo haces *realidad?*» y su entrada por líneas, la trama de caracteres en OGL que reacciona al cursor, y dos capas de piezas 3D en Three con parallax. `data-listo` ahora lo marca el final de la entrada. No toqué nada de «Queda para el pulido» (dibujo final de la mascota, figura/opacidad de la trama, posiciones de piezas, curvas finales); solo dejé valores razonables y todos en tokens.

## Archivos
Creados (todos en `archivos`):
- `sitio/src/components/Mascota.astro`, `Precarga.astro`, `Portada.astro`
- `sitio/src/lib/portada.ts` (orquesta cuenta, entrada, parallax y carga diferida), `trama.ts` (OGL), `capas3d.ts` (Three, piezas con `pieza()`), `three-renderer.ts`, `tokens.ts`, `webgl.ts`

Modificados:
- `sitio/src/pages/index.astro` (precarga + portada + script), `sitio/src/lib/listo.ts`, `sitio/src/styles/tokens.css` (tokens nuevos), `sitio/src/layouts/Base.astro` (solo la clase `js` en el script en línea del `<head>`)
- `sitio/package.json`, `sitio/package-lock.json`: `ogl@1.0.11`, `three@0.187.0`, y `@types/three@0.187.0` en desarrollo. Nada más.

## Compuertas
`node fabrica/scripts/compuertas.mjs T02` en primer plano, última corrida (11:28): **COMPUERTAS: VERDE**, `Bloquean: 0 · Avisos: 0`. check `0 errors · 0 warnings · 0 hints`; build `Complete!` sin `[WARN]`; `npx playwright test tests/comunes tests/T02 tests/T01` ` passed`; todos los patrones sin coincidencias; presupuestos: fuentes 168.748 B (máx 250.000), JS inicial 67.998 B gzip (máx 220.000).
No hay avisos ⚠️ que responder. Antes de esta corrida, `npx playwright test tests/T02` solo dio 12 passed (55 s).

## Verificación
- **Primer rojo y arreglos:** (1) las líneas del titular partían 0,05 de alto de línea por el relleno superior que les puse: lo quité (el hijo queda pegado al borde de la línea, que es lo que mide la prueba). (2) La trama salía vacía y oscura: OGL con `transparent: true` mezclaba y dejaba rgb×alfa con alfa²; con `transparent: false` el shader entrega (papel, alfa) y se compone bien. (3) Un `Float32Array` como uniforme `uHuella[48]` da el aviso «Active uniform uHuella[0] has not been supplied» (OGL solo reconoce `Array` comunes): lo cambié a `number[]`; la consola quedó limpia (comprobado con un script en línea de Playwright que imprimió «consola limpia»).
- **Trama medida:** con la portada sola y el cursor en la esquina, la zona `x200 y300 320×320` tiene 15,7 % de píxeles fuera del cobalto con opacidad 0,3 (mínimo de la prueba 3 %), medida con el mismo criterio de la prueba (script en línea). Es mi lectura antes del último ajuste de densidad; la prueba oficial pasó después.
- **Pesos del build** (`ls -la sitio/dist/_astro`): trozos diferidos `capas3d` 191.031 B (51.309 gzip) y `three-renderer` 352.608 B (83.421 gzip); el JS inicial no contiene `WebGLRenderer` (lo comprueba la prueba 3D).
- **Capturas** (`node fabrica/scripts/capturas.mjs T02`, en `fabrica/buzon/T02/capturas/`), que abrí: `inicio-breakpoints.jpg`, `inicio-acostado-tablet.jpg`, `estado-portada-scroll.jpg`, `comparacion/A1.jpg`, `A2.jpg`, y vi la precarga (`[84%]` con la mascota en papel sobre tinta) y el barrido del cursor (la trama se arremolina y cambia de caracteres). Lo que veo: bloque cobalto a sangre, titular en dos líneas en papel, pastilla ácida con el unicornio a la izquierda de «lo haces realidad?», etiquetas mono arriba, piezas ácido/tomate/magenta/tinta alrededor y trama de glifos más densa al centro. A 1440, 1280/1366 y 1024 no hay nada encimado ni cortado en el titular. En celular acostado (667×375 y 844×390) una pieza del frente roza la pastilla o el final de «realidad?»; para eso agregué un escalado por alto (ver Decisiones), pero la posición de las piezas es pulido y queda anotada.
- **Función, no solo cifra:** las pruebas de `tests/T02` miden la serie de la cuenta (nunca baja, ≥ 6 valores, pasa por la mitad baja), el desfase de las líneas, el crecimiento del objeto, el color cobalto en los tres modos del tema, la trama quieta/deformada por píxeles, Three diferido y las piezas visibles, el parallax por razones de movimiento, movimiento reducido, sin WebGL y sin JS; todo en verde.

## Decisiones
- **Three partido en dos trozos.** Three con `WebGLRenderer` pesa 528 kB minificado incluso con un solo símbolo (medido con rolldown), y el build tenía el `[WARN]` «chunks larger than 500 kB», que la compuerta `build` prohíbe. Sin tocar `astro.config.mjs` (no es mío), el renderer va en `three-renderer.ts` con otro `import()` dinámico: el build lo parte en 191 kB + 353 kB, ambos bajo 500 kB. Si el orquestador prefiere, la alternativa limpia es `build.chunkSizeWarningLimit` en la config (ver SOLICITUDES) y fusionar `three-renderer.ts` dentro de `capas3d.ts`.
- **La cuenta** usa `gsap.to` sobre un objeto: sube a 90 en `--precarga-cuenta` (1,5 s, `power2.out`) contada desde que corre el script, espera `load` y pasa a 100 en 0,3 s, y la capa se funde en 0,35 s. Nunca baja (se pinta solo si el entero aumenta).
- **Estados iniciales por JS:** `gsap.from` en una línea de tiempo en pausa (el estado inicial lo pone el JS, no el CSS); si el respaldo por tiempo de `listo.ts` marca `data-listo` antes de terminar, la entrada hace `progress(1)` y se quita la precarga.
- **Tokens para todo lo ajustable:** duraciones de la precarga y la entrada, medidas del objeto y la mascota, celda, radio, empuje, estela y opacidad de la trama, y factores de parallax (`--parallax-atras: 0.32`, `--parallax-delante: 0.12`; razón de movimiento ≈ 0,68 y 0,88). Los shaders leen los colores con `getComputedStyle` (`tokens.ts`); las luces de Three usan el token papel.
- **Trama sin dibujar en reposo:** se redibuja con `requestAnimationFrame` solo mientras hay huellas del cursor (≤ 48, estela de 1 s); sin `IntersectionObserver` visible tampoco dibuja.
- **Parallax:** `ScrollTrigger` con `yPercent = factor × 100`, `scrub: true`, `start: top top`, `end: bottom top` sobre cada `[data-capa]`.
- **Piezas 3D por `pieza(geometría, colorToken, posición, profundidad)`:** la posición va en fracciones del semiancho/semialto visibles, así que se adapta al formato. Cubo, ficha, moneda y octaedros en ácido, tomate, magenta y tinta; ninguna cobalto.
- **Escalado por alto en las piezas** (`k = min(1, ancho/1100, alto/800)`): evita que tapen el titular en celular acostado; agregado tras ver `inicio-acostado-tablet.jpg`.
- **Mascota:** silueta de unicornio de un solo `<svg>` en caja 100×100 con los cascos en y = 96; el tamaño sale de `--mascota-tam` (el contexto lo cambia con la misma variable en la pastilla).
- **Con movimiento reducido** se quitan la precarga, la entrada y el parallax; la trama y las piezas se dibujan una sola vez, quietas.
- Libero listeners, observadores, rAF, texturas y contextos (`liberar()` de la trama y de las capas, llamado en `pagehide` si la página no va a bfcache).

## Supuestos
- `fabrica/proyecto/perfil.md` no existe en el repo (solo `fabrica/nucleo/plantillas/perfil.md`); tomé como perfil `docs/2-TECNICO.md`, `fabrica/proyecto/compuertas.json` y la tarea.
- El unicornio es una silueta provisional que hice a ojo; no es el dibujo final.
- Las etiquetas son un solo `<p class="etiqueta">` con tres `<span>`; no hay lista ni bajada (F1).
- El respaldo CSS oculta la precarga con una animación `precarga-respaldo` (0,35 s) que arranca a los 3,5 s; a los 3,85 s ya no tapa nada (la prueba mira a los 4,2 s).
- Cuando falla la carga de `load` (fuentes colgadas), la cuenta se queda en `[90%]` hasta el respaldo de 3,5 s, que quita la capa y deja el titular completo.

## PENDIENTES
- Mascota final (llega el asset del autor): se cambia solo en `sitio/src/components/Mascota.astro`.
- Piezas finales: `.glb` del autor en lugar de las formas por código, dentro de `pieza()`.
- Pulido: tamaño de la pastilla; figura, opacidad, radio y fuerza de la trama; posición/tamaño/factores de las piezas (en celular acostado una pieza del frente roza el titular); curva y duración finales de la cuenta y el fundido.

## SOLICITUDES
- `sitio/astro.config.mjs` (orquestador, opcional): `vite: { build: { chunkSizeWarningLimit: 600 } }` quitaría la necesidad de partir Three en dos trozos; si se agrega, se puede fusionar `three-renderer.ts` en `capas3d.ts`.
- `sitio/tests/T02/t02.spec.ts`: ninguna; las pruebas no chocaron con la tarea.
