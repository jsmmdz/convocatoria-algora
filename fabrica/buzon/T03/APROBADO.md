# T03 aprobada por QA

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v5.0
- **Inicio:** 2026-11-15 10:14
- **Fin:** 2026-11-15 10:21
- **Intervenciones del autor:** 0

- **Ronda:** r4

## Menores pendientes

- `M1` · La cresta de la línea asoma 1–2 px sobre el borde superior del bloque magenta en `hitos-2` y un trozo punteado asoma bajo el bloque tomate en `hitos-tinta`. Es la línea pasando por debajo; la forma de la onda es del pulido.
- `M2` · El cuadro `hitos-tinta` deja la etiqueta del hito 3 fuera por la izquierda; se ve en `hitos-2` y en `tmp/tinta-light.png`.

## Qué debe mirar el orquestador con más cuidado

- Con `mix-blend-mode: difference` sobre la línea y el viajero, los colores resultantes son la diferencia contra el fondo (casi negro sobre papel, casi papel sobre tinta), no los tokens exactos. Las pruebas miden el contraste (≥ 3:1) y pasan; el matiz exacto es del pulido.
- El viajero asoma unos 4 px a la izquierda del bloque tomate en `hitos-tinta` (x 439–443): es correcto con la x de 33 %, pero se nota en una captura quieta.
- En la ronda 3 la consola de WebGL fue intermitente; en esta ronda las compuertas salieron en verde sin reintentos, pero conviene vigilarlo en la auditoría final.
