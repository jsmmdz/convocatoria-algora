# Entrega r2 — T03 · Hitos

- **Tarea:** T03
- **Ronda:** r2
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 19:46 (salida de `date`)
- **Fin:** 2026-11-10 19:53 (salida de `date`)
- **Intervenciones del autor:** 0

## Resumen
Corrección de `CORRECCION-r1.md`: H1 hecho (etiquetas de los hitos invertidos en color de acento), H3 hecho (valores de la onda a tokens), H2 no tomado (queda para el pulido), H4 hecho (lectura propia abajo).

## Archivos
- Modificados: `sitio/src/styles/tokens.css`, `sitio/src/components/Hitos.astro`, `sitio/src/lib/hitos.ts`.

## Correcciones
- **H1.** Token `--etiqueta-invertida` en `tokens.css`: `--color-acido` en tema claro (el hito invertido es tinta) y `--color-cobalto` en oscuro (el hito invertido es papel), definido en los cuatro bloques de tema (claro por defecto, sistema oscuro, forzado oscuro, forzado claro). `.hito[data-invertido]` en `Hitos.astro` usa `--hito-suave: var(--etiqueta-invertida)`. Los hitos 1, 2 y 4 no cambian. Lectura de `getComputedStyle` en mi barrido: en claro, hitos 3 y 5 `rgb(209, 255, 34)` y los demás `rgb(90, 85, 80)`; en oscuro, hitos 3 y 5 `rgb(44, 8, 255)` y los demás `rgb(168, 163, 156)`. El contraste ≥ 4,5:1 contra el fondo real lo mide la prueba «fondos» de T03, en verde en los dos temas.
- **H3.** Nuevos tokens `--linea-onda-peso-larga` (0.65), `--linea-onda-peso-corta` (0.35), `--linea-onda-fase-larga` (0.6), `--linea-onda-fase-corta` (2.1) y `--linea-paso` (8), con los mismos valores que eran literales. En `hitos.ts`, `trazar` los lee, y todos los respaldos de `leerNumero` son una sola constante `SIN_TOKEN` (antes había cifras sueltas, `0.33` repetida dos veces). El trazo es el mismo porque los valores de los tokens son los de antes; en mis capturas la onda coincide con la de la r1.
- **H2.** No tomado: no encontré una salida barata que no toque la x del viajero ni su tamaño (lo que la tarea deja al pulido). Sigue en Supuestos.

## Compuertas
`node fabrica/scripts/compuertas.mjs T03` en primer plano → **COMPUERTAS: VERDE** (check, build, comunes, T01, T02, T03). La primera corrida falló en Playwright solo porque quedaba un servidor `astro preview` de la ronda anterior ocupando el puerto 4391; lo detuve y la segunda corrida pasó, sin cambiar código.

## Verificación
- `node fabrica/scripts/capturas.mjs T03` corrida de nuevo. En `capturas/estado-hitos-tinta.jpg` el hito 3 queda en tinta con el viajero junto a la palabra.
- **Barrido propio del horizontal (H4):** `fabrica/buzon/T03/tmp/r2.mjs` (servidor en el 4392), repetible con `node fabrica/buzon/T03/tmp/r2.mjs`. Para 1440×900 (claro y oscuro), 1280×720 y 1024×768 (claro), con la sección pinada, se detiene en cada uno de los cinco hitos (scroll = inicio de la sección + recorrido × i/4), se mide la caja del viajero contra las cajas de etiquetas y titulares, y se mide si alguna cae cortada por el borde de la pantalla. Resultado en los 20 pasos: cero choques y cero cortes. Ese número solo prueba lo de las cajas; lo que sigue es lo que vi en las imágenes (`fabrica/buzon/T03/tmp/r2-<ancho>-<tema>-h<N>.png`):
  - `r2-1440-light-h3.png`: fondo tinta, etiqueta `[USUARIOS] [03/05]` en verde ácido legible, titular claro completo en tres líneas, bloque tomate con «Usuarios» entero, línea sólida a la izquierda del unicornio y punteada a la derecha. El unicornio queda sobre la línea, lejos del texto.
  - `r2-1440-dark-h5.png`: fondo papel, etiqueta `[NOMBRE] [05/05]` en cobalto legible, titular completo, bloque ácido con «Nombre» entero. Nada encimado.
  - `r2-1280-light-h2.png`: hito 2 con el bloque magenta a la izquierda y el titular arriba a la derecha, completo. El unicornio queda sobre el borde superior del bloque magenta, sin tocar «Equipo» ni el titular. Se ve la línea punteada por detrás del titular sin cruzar letras.
  - `r2-1024-light-h5.png`: a 1024 el hito 5 cabe entero (etiqueta, titular de dos líneas, bloque y palabra), sin corte por los bordes, unicornio sobre la línea.
  - No abrí una por una las otras 16; de esas solo tengo la medición de cajas.
- Lo que sí se ve: en `estado-hitos-tinta.jpg` el unicornio queda pegado a la «U» de «Usuarios» (el bloque va encima de la línea, no del viajero). Es lo de H2.

## Supuestos
- `fabrica/proyecto/perfil.md` no existe en el repo; seguí `docs/2-TECNICO.md` y las reglas.
- H2: en algunos pasos el viajero pisa o se pega a la palabra del bloque (p. ej. «Usuarios» a ~4150 de scroll a 1440×900). Solucionarlo toca la x del viajero y su tamaño, que son del pulido; no lo toqué.
- `SIN_TOKEN = 1` es un respaldo neutro (evita divisiones por cero); los valores reales viven en `tokens.css`.
- `aria-label="Hitos de un proyecto"` en la sección es texto mío, sin dato del autor.

## PENDIENTES
Ninguno (el dibujo final de la mascota sigue siendo el provisional de D-5).

## SOLICITUDES
Ninguna.
