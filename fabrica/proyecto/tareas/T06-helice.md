---
id: T06
agente: "@orquestador"
fase: 1
depende: [T05]
tipo: componente
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - fabrica/proyecto/referentes/ryan.json
  - sitio/tests/T06/t06.spec.ts
rutas: ["/"]
archivos:
  - sitio/src/components/Proyectos.astro
  - sitio/src/lib/helice.ts
  - sitio/src/lib/helice-gl.ts
  - sitio/src/lib/helice-texto.ts
  - sitio/src/lib/tarjeta-proyecto.ts
  - sitio/src/datos/ejemplos.ts
  - sitio/src/pages/index.astro
  - sitio/src/styles/tokens.css
regresion: [T01, T02, T03, T05]
bloqueantes: []
---

# `T06` · Hélice de proyectos

> Fase 1 · Buzón: `fabrica/buzon/T06/` · **Construida por el orquestador (Claude Fable 5.2) el 2026-11-16,
> por encargo directo del autor**, sin Gemini, QA ni auditoría aparte. Ver `fabrica/buzon/T05/REGISTRO.md`.

## Por qué existe

Es la **prueba** del arco persuasivo: ideas de otros estudiantes que buscan equipo. Desde una tarjeta se
llega al formulario con el proyecto ya elegido (`ENCARGO.md` § 3, referente 5).

## Qué se construyó (ryan A1–A6, K1–K4; D-2 y D-8)

1. **`Proyectos.astro`**: sección `#proyectos` con las tarjetas como **botones reales** en una lista. El CSS
   por defecto es el respaldo: rejilla de tarjetas quietas (sin JS, < 1024 px o movimiento reducido).
2. **`helice.ts`**, modo hélice (≥ 1024 px y sin movimiento reducido, `data-modo="helice"`):
   - K1: `dθ = 2π / 6,5`, `R = ancho · 1,36 / dθ`, `dy = 0,52 · alto`. Tokens `--helice-*`.
   - K2: la etapa queda fija (`position: sticky`, 100svh) y la sección mide `100svh + (n − 1) · 0,6 · 100svh`:
     cada tarjeta ocupa 0,6 pantallas de scroll. El giro va pegado al scroll.
   - D-2: las flechas, ← → del teclado y el clic en una tarjeta de los lados mueven **el mismo scroll**
     (una sola fuente de verdad). Al llegar con Tab a una tarjeta, la hélice gira hasta ella.
   - K3: `v += 0,2 · (clamp(10 · Δs) − v)` por actualización y `v *= 0,85` por cuadro.
   - Clic o Enter en la tarjeta del frente → `algora:sumarse` (`detail: { idea, faltan }`).
3. **`helice-gl.ts`** (OGL, carga diferida): un plano subdividido por tarjeta que el vértice dobla sobre el
   cilindro y proyecta **con la misma perspectiva del CSS 3D**, así cae justo debajo de su botón. El fragmento
   pinta el color de la facultad, una trama de cruces que se acerca y se desliza con la velocidad (D-8, K3),
   el borde de tinta y las esquinas redondeadas; el dorso se funde 75 % con el fondo (K4).
4. **`helice-texto.ts`**: el texto de cada tarjeta se dibuja en un canvas 2D (leyendo textos y estilos del
   botón real) y entra al shader como máscara, para que **se curve con la tarjeta**. El del DOM queda
   transparente encima: sigue ahí para el teclado, el foco y los lectores de pantalla.
5. **Respaldo** (contrato de `docs/2-TECNICO.md` § 2): sin WebGL, o si el contexto se pierde, quedan las
   tarjetas del DOM con su color, planas, en la misma hélice de CSS 3D.
6. **Datos**: `[EJEMPLO]` de `datos/ejemplos.ts`. Con Supabase conectado, `proyectos_publicos()` trae las
   ideas aprobadas, que reemplazan a los ejemplos (o se completan con ellos hasta tener 6 reales);
   `tarjeta-proyecto.ts` arma las tarjetas sin `innerHTML`.

## Decisiones tomadas por el orquestador (el autor las confirma en la revisión del prototipo)

- **El texto va dentro de la textura.** Con el texto en el DOM (como el título de Ryan), al girar se despegaba
  hasta 25 px de la tarjeta curva: nuestras tarjetas llevan mucho más texto que un título.
- **Las tarjetas que vienen quedan un escalón más abajo** y suben al girar, como en `ryan-03.jpg`.
- **El centro de la hélice va un 6 % a la derecha** y la cabecera («Gira y *súmate*.») abajo a la izquierda,
  para que el titular no se monte sobre las tarjetas.
- **La tarjeta del frente es el botón de sumarse** («Sumarme →» escrito en ella); no hay un panel de detalle
  aparte como en el prototipo v2.
- Sin ajuste a la tarjeta más cercana al soltar el scroll: el referente tampoco lo tiene.

## Cuándo está terminada

- `sitio/tests/T06/` en verde (9 pruebas): botones reales, giro por scroll con la etapa fija, **píxeles** de
  la tarjeta del frente (color de su facultad y texto pintado), flechas, teclado, sumarse, clic en un lado,
  lista con movimiento reducido y a 390 px.
- Compuertas completas en verde (se corren con T08).

## Queda para el pulido

- La fuerza de la trama y del zoom/deriva; el tamaño de la tarjeta y cuánto texto lleva.
- Si al soltar el scroll la hélice debe asentarse en la tarjeta más cercana.
- A 1024 px la cabecera roza los dorsos de la esquina inferior izquierda.
- El anillo de foco es un rectángulo plano sobre una tarjeta curva.
