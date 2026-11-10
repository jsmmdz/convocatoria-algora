# Entrega r3 — T02 · Precarga y portada

- **Tarea:** T02
- **Ronda:** r3
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** Tue Nov 10 12:03 2026
- **Fin:** Tue Nov 10 12:15 2026
- **Intervenciones del autor:** 0

## Respuesta a CORRECCION-r2
| Hallazgo | Qué hice | Cómo lo verifiqué |
|---|---|---|
| H5 | En `zonasDelContenido` (`sitio/src/lib/capas3d.ts:118-121`) la banda de la nav ya no usa `origen.top` sino la posición de la portada en el documento: `Math.max(0, leerNumero('--alto-nav', 64) - (origen.top + window.scrollY))`. Con la portada en 0 de la página sale siempre `--alto-nav`, se baje o no. Las demás zonas ya se miden contra el origen de la portada y no cambian. | `node fabrica/buzon/T02/medir-h5.mjs` (ver Verificación): con el arreglo, tras bajar 400 px, cambiar el tamaño y volver arriba, cada celda tiene entre 0,72 y 1,12 de las piezas del control; con la línea vieja, las celdas de arriba bajan a 0,21 y 0,28 (1440) y a 0,07 y 0,16 (375). |
| H8 | Esta entrega trae la sección de respuesta y la medición está en el repo, con comando: `fabrica/buzon/T02/medir-h5.mjs`. | `node fabrica/buzon/T02/medir-h5.mjs` desde la raíz, con `sitio/dist` construido. |
| H6, H7 | Del orquestador, no los toqué. | — |

## Resumen
Corrijo H5: el apartado de las piezas 3D ya no depende del scroll, así que tras cambiar el tamaño con la página bajada (girar el celular, redimensionar la ventana) las seis piezas se quedan en su sitio. Es un cambio de una línea de lógica en `capas3d.ts`. Dejo la medición como script repetible. Lo que ya estaba bien en r2 (posiciones, constantes, pastilla y etiquetas libres en reposo) no se tocó.

## Archivos
- Modificado (de `archivos`): `sitio/src/lib/capas3d.ts`.
- Creado en el buzón: `fabrica/buzon/T02/medir-h5.mjs` (script de medición, no es código del sitio).

## Compuertas
`node fabrica/scripts/compuertas.mjs T02` en primer plano, terminó 12:15: **COMPUERTAS: VERDE**, `Bloquean: 0 · Avisos: 0`. Check `0 errors · 0 warnings · 0 hints`, build `Complete!`, `npx playwright test tests/comunes tests/T02 tests/T01` `passed`, patrones sin coincidencias, fuentes 168.748 B, JS inicial 68.003 B gzip. Sin ⚠️.

## Verificación
**Medición de H5, repetible.** `node fabrica/buzon/T02/medir-h5.mjs` (desde la raíz, con `sitio/dist`; levanta `astro preview` en el 4392 y lo cierra). Para 1440 × 900 → 1440 × 880 y 375 × 667 → 375 × 640 toma, con solo las capas 3D visibles sobre gris plano, tres cuadros: `reposo` (carga normal), `control` (cambiar al tamaño final sin haber bajado) y `scroll` (rueda 400 px, cambiar el tamaño, rueda de vuelta a arriba; el script avisa si `scrollY` no queda en 0, no avisó). Cuenta píxeles de pieza en seis celdas (3 columnas × 2 filas). Salida con el arreglo:

```
1440x900 -> 1440x880
  control 12789 0 17920 15382 6283 28189
  scroll  10795 0 17680 13057 6728 20256
  scroll/control por celda: 0.84 1.00 0.99 0.85 1.07 0.72   IGUAL
375x667 -> 375x640
  control 2578 0 5965 1655 1108 4075
  scroll  2052 0 5389 1732 1246 3034
  scroll/control por celda: 0.80 1.00 0.90 1.05 1.12 0.74   IGUAL
H5: MISMO RESULTADO CON Y SIN SCROLL
```
La celda del centro de arriba queda en 0 en todos los casos: es el hueco de las etiquetas, donde no hay pieza por diseño. Piezas rotando explican que el conteo no sea idéntico (el script exige misma presencia por celda y proporción entre 0,55 y 1,8).

**La medición detecta el defecto.** Restauré a mano la línea vieja (`- origen.top`), reconstruí y corrí el mismo script: `scroll/control por celda: 0.21 1.00 0.28 0.85 1.07 0.72` a 1440 y `0.07 1.00 0.16 1.04 1.13 0.74` a 375, `H5: 2 tamaño(s) cambian con el scroll`, salida con código 1. Después volví al arreglo, reconstruí y repetí la corrida de arriba.

**`medir()` con la página arriba o bajada, y desde el `ResizeObserver`.** El cálculo cambió en un solo sitio, que usa `medir()` para todos los casos; el cuadro `scroll` pasa por el `ResizeObserver` (el cambio de tamaño ocurre con la página bajada) y el `control` por la carga inicial, y dan lo mismo.

**Capturas** (`node fabrica/scripts/capturas.mjs T02`, las abrí): `capturas/comparacion/tabletales-A1.jpg` (seis piezas: octaedro magenta arriba a la izquierda, cubo ácido arriba a la derecha entero, ficha ácida abajo a la izquierda, cubo tinta, moneda y octaedro tomate abajo) y `capturas/matriz/inicio/375x667.jpg` (las seis visibles, pastilla y etiquetas libres). No abrí las otras cinco hojas de comparación en esta ronda: la r3 no toca su contenido.

## Decisiones
- Seguí la orden tal cual (`origen.top + window.scrollY`): asume que la portada es la primera sección, en 0 de la página, como dice la orden. Si más adelante se pone algo encima de la portada, ese cálculo tendrá que cambiar (la banda de la nav seguiría siendo `--alto-nav` menos la posición real de la portada en el documento, que ya es lo que calcula).

## Supuestos
- `fabrica/proyecto/perfil.md` sigue sin existir; tomo `docs/2-TECNICO.md`, `compuertas.json` y la tarea como perfil (igual que en r1 y r2).
- El script de medición vive en el buzón (único lugar donde puedo escribir fuera de `archivos`); una prueba de `sitio/tests/T02/` sobre H5 sería del orquestador.

## PENDIENTES
- Pulido: posiciones y tamaños finales de las piezas y el `.glb` del autor dentro de `pieza()`; mascota final; figura y opacidad de la trama; espacios del titular (H3).

## SOLICITUDES
- Opcional: una prueba en `sitio/tests/T02/` que repita el cuadro `scroll` contra `control` de `medir-h5.mjs` (cambio de tamaño con la página bajada), y otra de solape entre las piezas y `[data-objeto]` y las etiquetas. Hoy ninguna prueba cubre H5.
