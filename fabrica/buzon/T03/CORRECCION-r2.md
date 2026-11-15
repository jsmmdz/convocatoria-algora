# Corrección r2 — T03 · Hitos

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 20:08 (salida de `date`)
- **Fin:** 2026-11-10 20:09 (salida de `date`)
- **Intervenciones del autor:** 0

El código de la r2 está bien: `H1` y `H3` de la r1 quedaron resueltos y reproducidos (57 de 57 pruebas en verde contra el servidor suelto). Falta solo la compuerta.

### `H1-r2` · La compuerta de Playwright falla por tu servidor del 4392
- **Qué cambiar:** no hay código que tocar. Detén el servidor que dejó tu barrido `fabrica/buzon/T03/tmp/r2.mjs`: es el proceso `node … astro.mjs preview --port 4392` (PID 57692, y su `cmd /c astro preview --port 4392`, PID 60644). Está en tu rango 4390–4399. Después corre `node fabrica/scripts/compuertas.mjs T03` en primer plano hasta **COMPUERTAS: VERDE**, y vuelve a correr `node fabrica/scripts/capturas.mjs T03` (a mí no me arrancó por el mismo servidor). Si vuelves a medir con un servidor propio, ciérralo al terminar el script (por ejemplo, en un `finally`) y confirma que no queda ninguno antes de entregar. En la entrega, di cuál era el servidor suelto y que lo cerraste.
- **Dónde:** el proceso del 4392; nada del repo.
- **Cómo lo voy a verificar:** `node fabrica/scripts/compuertas.mjs T03 --guardar` en VERDE, con la línea de Playwright en ✅.

`H2-r2` (el viajero se pega a la «U» en un paso) pasa al pulido con el autor: no hay nada que hacer aquí. `H3-r2` es del orquestador (pruebas que no cubren requisitos): tampoco.
