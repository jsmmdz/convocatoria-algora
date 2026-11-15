# Entrega r3 — T03 · Hitos

- **Tarea:** T03
- **Ronda:** r3
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 20:04 (salida de `date`)
- **Fin:** 2026-11-10 20:25 (salida de `date`)
- **Intervenciones del autor:** 0

## Resumen
H1-r2 (servidor suelto): hecho. Las compuertas NO quedaron en verde: fallan 3 pruebas que no son de T03 y que no dependen de ningún archivo de esta tarea (ver Compuertas). No toqué código.

## Servidor suelto
Era el `astro preview --port 4392` que dejó `fabrica/buzon/T03/tmp/r2.mjs` (PID 57692 y su cadena: `cmd` 60644, `npx` 56944, `bash` 53624 y 35112). Los cerré todos. Confirmado después: ningún `astro preview` vivo y ningún puerto 4390–4399 en escucha. Queda un `astro dev --port 4321` (PID 72632) que no es mío (otro rango), no lo toqué.

## Archivos
Sin cambios de código en esta ronda.

## Compuertas
`node fabrica/scripts/compuertas.mjs T03 --guardar` en primer plano, dos veces (`COMPUERTAS-r2-2.md`, `COMPUERTAS-r2-3.md`): **ROJO**. Alcance, check, build, patrones y presupuestos en ✅; Playwright en ❌ con las mismas 3 fallas de 57 (54 pasan; las 21 de T03 pasan):
1. `tests/comunes/sitio.spec.ts:50` ruta `/` «sin advertencias en consola»: aparece `warning: WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost`.
2. `tests/T02/t02.spec.ts:374` trama: el cursor deforma 0,009 (mínimo 0,03).
3. `tests/T02/t02.spec.ts:408` trama: contraste detrás de las etiquetas.

Las tres son del WebGL de la portada (T02: `webgl.ts`/`trama.ts`, que llaman `loseContext()` a propósito). Pasaron en la r2 (57/57 contra servidor suelto) con el mismo código de T03; la diferencia es el entorno: la suite corre WebGL en la tarjeta de video (`--use-angle=d3d11`) y ahora hay 75 procesos de Brave abiertos y un `astro dev` en el 4321. Es una hipótesis, no la probé (no puedo tocar `playwright.config.ts` ni las pruebas, y sin git no pude comparar contra HEAD). Se repiten iguales también corridas solas con `-g "consola|trama"`. Sugiero al orquestador repetir la compuerta con el navegador de Brave y el dev server cerrados.

## Verificación
`node fabrica/scripts/capturas.mjs T03` corrió completa y escribió las capturas nuevas en `fabrica/buzon/T03/capturas/` (inicio, estado-hitos-1, -2, -tinta, comparación). Su lectura visual es la de la r2; no cambió código.

## Supuestos
- Atribuyo las 3 fallas al entorno, no a T03, por lo anterior; si resultan ser de mi código, no lo encontré.
- Mis scripts temporales (`tmp/gl.mjs`) quedan en el buzón.

## PENDIENTES
Compuerta en verde de T03 (depende de repetirla con el entorno limpio).

## SOLICITUDES
Cerrar Brave/`astro dev` 4321 y repetir `node fabrica/scripts/compuertas.mjs T03 --guardar`, o decidir cómo tratar las 3 pruebas de T02/comunes con WebGL.
