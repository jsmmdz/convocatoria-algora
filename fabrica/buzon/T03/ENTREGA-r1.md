# Entrega r1 — T03 · Hitos

- **Tarea:** T03
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 19:06 (salida de `date`)
- **Fin:** 2026-11-10 19:32 (salida de `date`)
- **Intervenciones del autor:** 0

## Resumen
Cinco hitos en pista horizontal con pin, línea ondulada punteada/sólida, unicornio viajero apoyado en la línea e inclinado por la velocidad de Lenis, fondos invertidos en los hitos 3 y 5, y apilado por defecto (sin JS, angosto, movimiento reducido). Nada de lo del pulido (onda exacta, tamaños finales, x del viajero).

## Archivos
- Creados: `sitio/src/components/Hitos.astro`, `sitio/src/lib/hitos.ts`.
- Modificados: `sitio/src/pages/index.astro` (`<Hitos />` y `iniciarHitos()`), `sitio/src/styles/tokens.css` (tokens de hitos, línea, viajero, inclinación y `--fondo-invertido`/`--texto-invertido`).

## Compuertas
`node fabrica/scripts/compuertas.mjs T03` → **COMPUERTAS: VERDE** (0 bloqueos, 0 avisos): check, build, pruebas comunes, T01, T02 y T03.
Hallazgos propios durante la construcción: (1) las pruebas corren contra `dist`, hay que reconstruir antes; (2) mi atributo `data-linea` chocaba con el de la portada (T02 contaba líneas del titular); lo quité del contenedor de la línea.

## Verificación
- Capturas: `node fabrica/scripts/capturas.mjs T03`; vistas `fabrica/buzon/T03/capturas/comparacion/unseen-A3.jpg`, `unseen-A4.jpg`, `unseen-A4b.jpg` e `inicio-390-completa.jpg` (apilado correcto en 390). La palabra en cursiva salía diminuta por una colisión de nombres de variable; corregida y vuelta a mirar. La hoja `inicio-breakpoints.jpg` solo muestra la portada (primer viewport); el horizontal a 1280 y 1024 lo comprueban las pruebas T03, no lo miré en imagen.
- Pruebas T03: hitos en orden, fondos claro/oscuro, horizontal a 1440, 1280 y 1024, línea (píxeles) y viajero apoyado, inclinación ±40°, apilado a 1000 y 390, movimiento reducido y sin JS: todas pasan en la corrida de compuertas.

## Decisiones
- Línea con `mix-blend-mode: difference` en un contenedor que agrupa las dos copias (negra sobre papel, clara sobre tinta, sin que la sólida cancele la punteada). Los fondos de los hitos son opacos para que la mezcla funcione.
- Viajero con halo en color de fondo (`drop-shadow`) para leerse sobre claro, tinta y bloques.
- Trazado generado en JS (dos senos) y la altura en la x del viajero se interpola entre los mismos puntos que dibujan el trazo.
- Inclinación activa solo mientras la sección (con su pin) está en pantalla; el ticker se retira al salir.

## Supuestos
- `fabrica/proyecto/perfil.md` no existe en el repo; seguí `docs/2-TECNICO.md` y las reglas.
- Con bloques de ≥ 45 % del alto, la línea queda tapada por ellos en parte del recorrido (los bloques van encima, como dice la tarea); el unicornio a veces pisa el bloque. Para el pulido.
- Etiquetas en el hito invertido van en papel/tinta, sin color de acento (posible pulido).
- `aria-label="Hitos de un proyecto"` en la sección es texto mío, sin dato del autor.

## PENDIENTES
Ninguno (el dibujo final de la mascota sigue siendo el provisional de D-5).

## SOLICITUDES
Ninguna.
