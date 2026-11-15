# Auditoría final — T03 · Hitos (ronda 4)

- **Veredicto:** PASA con hallazgos. La compuerta completa está en **VERDE** y las tres correcciones de
  `CORRECCION-r3` (E2, E3, E4) funcionan. Queda un defecto visible que ninguna prueba ve: el viajero se pinta
  encima del titular del hito 2 a 1280 × 720 y a 1024 × 768 (E1, Mayor). El orquestador lo decide antes del
  pulido o dentro de él.
- **Fecha:** 2026-11-15 10:20–10:42 (hora local)
- **Modelo:** claude-opus-5-5 (auditor-final, primera pasada; el orquestador la revisa)
- **Fábrica:** v5.0
- **Commit:** `f843cf6` + árbol de trabajo de T03 (sin commit)
- **Intervenciones del autor:** 0
- La auditoría de la ronda 3 (E1–E7 con la revisión del orquestador) quedó en `AUDITORIA-FINAL-r3.md`. Los
  IDs de aquí son nuevos.

## Lo que reproduje

- **Compuertas, suite completa:** `node fabrica/scripts/compuertas.mjs T03 --completas --guardar`, en primer
  plano (10:21:21 → 10:27:35) → **COMPUERTAS: VERDE**, Bloquean 0, Avisos 0, guardado en `COMPUERTAS-r4-2.md`.
  Playwright `tests/comunes tests/T03 tests/T01 tests/T02`: **passed**, sin ⚠️ de reintento. check 0/0/0,
  build `Complete!`, patrones sin coincidencias, fuentes 168.748 B, JS inicial 69.387 B gzip.
- **Alcance (`git status`, `git diff --stat`):** `Hitos.astro`, `hitos.ts`, `index.astro` (+4) y
  `tokens.css` (+31), más `fabrica/datos/compuertas.jsonl` y el buzón. Nada fuera de alcance. Tampoco existe la
  carpeta `PAGINA%20CONVOCATORIA` (listé `c:/UNIVERSIDAD/UNIVERSIDAD/`).
- **Hook (`fabrica/datos/hook.jsonl`):** las llamadas del constructor quedaron como `gemini:T03`: 191 líneas,
  todas `permitido`, entre 14:56:13 y 15:08:22 UTC. `denied_actions` está vacío en `REGISTRO-gemini-r4.json`.
  El `relevo-gemini` llamó dos veces a `gemini.mjs T03 r4`. La segunda llamada solo esperó, como dice el
  log (`sigue corriendo (supervisor 46748); espero`): hubo una sola sesión de Gemini. No hubo ningún rodeo.
- **Consola:** 0 avisos en 10 cargas limpias a 1280 × 720 (`tmp/a4.mjs consola`). El
  `CONTEXT_LOST_WEBGL` de la ronda 3 no salió.

## Función, probada en el navegador

Mis sondas están en `tmp/a4.mjs` (modos `textos`, `cascos`, `mov` y `consola`) y en `tmp/a4b.mjs`. Usé el build
servido en los puertos 4396 y 4397, ya cerrados (`netstat` sin `LISTEN` en 439x), y la GPU de las pruebas.

| Qué | Resultado |
|---|---|
| E2: el bloque tapa al viajero cuando lo cruza | Sí. En `a4-mov.png` el unicornio va detrás del bloque tomate «Usuarios» y no se ve |
| E3: inclinación con rueda real | 32,7° en pleno movimiento. Los cascos siguen cerca de la unión (lo mide la prueba nueva, en verde) |
| E4: silueta en los hitos invertidos | Llena en claro (`a4-vista-light-h3.png`, unicornio claro sobre tinta) y en oscuro (`a4-vista-dark-h3.png`, unicornio oscuro sobre papel) |
| Viajero sobre etiquetas o titulares, con la pista quieta, cada 40 px de scroll (`a4.mjs textos 40`) | **1440 × 900: 2/145 · 1280 × 720: 8/129 · 1024 × 768: 3/103** posiciones, todas sobre el titular del hito 2. 1920 × 1080: 0/193 (E1) |
| Línea detrás del viajero, ampliada 6–7× (`a4-z-light-h1.png`, `a4-z-light-h3.png`) | La línea **atraviesa** el cuerpo y las patas del unicornio, invertida, y el halo no lo separa de ella (E2) |
| Pin con rueda real, cuadro a cuadro con rAF (`a4b.mjs`) | La nav y la sección quedan en `top` = 0 en los 157 cuadros (ver «Observación») |

## Lo que veo

- `tmp/a4-texto-1280.png` (1280 × 720, claro, pista quieta): fondo papel a la izquierda y tinta desde x = 720.
  Arriba a la izquierda están `[EQUIPO] [02/05]` y el titular «Alguien de otra carrera la entiende mejor que tú.»
  en tres líneas, de y ≈ 115 a 290. La línea sólida negra sube desde la izquierda hasta una cresta en x ≈ 430,
  y ≈ 300, y de ahí sigue punteada. El unicornio negro, de unos 55 px, está **parado sobre «tú.»**, en
  x ≈ 400–455 e y ≈ 245–310. Ampliado (`a4-texto-1280-zoom.png`): la «u» y el punto se ven en claro a través
  del cuerpo del unicornio, invertidos por `difference`, y el cuerpo se funde con las letras.
- `tmp/a4-texto-1024-zoom.png` (1024 × 768): el unicornio, inclinado, tapa la parte baja de «que tú», con los
  trazos de la «e» y la «t» invertidos en claro sobre su lomo.
- `tmp/a4-texto-1440-zoom.png` (1440 × 900): solo toca el punto de «tú.» con el lomo. Casi no se nota.
- `tmp/a4-z-light-h1.png` (claro, hito 1, ampliado 7×): unicornio negro de perfil con un halo gris claro
  de 1–2 px. La línea sólida negra baja en diagonal desde arriba a la izquierda, entra por la grupa, cruza las
  dos patas traseras como una **raya blanca** y sale por debajo de los cascos. Donde toca el halo, la línea
  sigue negra: el halo no la corta.
- `tmp/a4-z-light-h3.png` (claro, hito 3 de tinta, 6×): unicornio claro y lleno sobre negro. La punteada blanca
  sube a la derecha y **pasa por las patas delanteras como guiones oscuros**.
- `tmp/a4-mov.png` (rueda, 32,7°): banda tinta a la izquierda y papel a la derecha. El bloque tomate «Usuarios»
  va en x ≈ 254–888 e y ≈ 126–594, y el unicornio no se ve: queda debajo. La línea sólida blanca entra desde la
  izquierda y se mete bajo el bloque.

## Hallazgos

### E1 · El viajero se pinta encima del titular del hito 2 a 1280 y a 1024
- **Severidad:** Mayor
- **Dueño:** el orquestador decide. La forma de la onda es del pulido, pero «nada encimado a 1440, 1280 y
  1024» es un criterio de «Cuándo terminaste».
- **Archivos:** `sitio/src/components/Hitos.astro` (`.hitos__guia` en `z-index: 2` dentro de la pista, por
  encima de los textos, que no tienen posición) y los tokens de la onda (`--linea-centro: 0.52`,
  `--linea-amplitud: 0.12`).
- **Evidencia:** la cresta de la onda llega a y ≈ 0,40 del alto. El unicornio queda unos 64–74 px por encima,
  dentro de la franja del titular del hito 2, que va arriba (impar/par alternado). Con la pista quieta, el
  viajero cae sobre ese titular en 8 de 129 posiciones a 1280 × 720 (unos 320 px de scroll), 3 de 103 a
  1024 × 768 y 2 de 145 a 1440 × 900. A 1920 × 1080 no pasa. Con `difference`, las letras que tapa se ven
  invertidas a través del cuerpo (`a4-texto-1280-zoom.png`). El 1280 × 720 es un portátil común.
- **Qué decidir:** que la onda no suba hasta la franja de los titulares (bajar la amplitud o el centro según
  el alto), que el titular vaya por encima del viajero, o aceptarlo en el pulido sabiendo que pasa.
- **Por qué escapó:** ninguna prueba compara el viajero con los textos. La prueba de E2 solo mira los bloques
  y la de la línea oculta los textos antes de medir. Las capturas de `capturas.mjs` son a 1440 en estados
  fijos (`hitos-1`, `hitos-2`, `hitos-tinta`), donde no pasa. El QA y el constructor revisaron esos tres
  cuadros. La auditoría de la ronda 3 recorrió la sección buscando bloques, no textos. Este choque ya existía
  en la ronda 3 (el viajero iba en `z-index: 3`), así que no es una regresión.
- **Prueba que falta:** a 1440 × 900, 1280 × 720 y 1024 × 768, con la pista quieta cada ≤ 80 px de scroll,
  ningún rectángulo de línea de `[data-hito-titular]` o `[data-hito-etiquetas]` (con `Range.getClientRects()`)
  se cruza con el cuadro de `[data-viajero]` menos 4 px por lado. Contra el código actual falla a 1280 y a
  1024. La sonda está en `tmp/a4.mjs`, modo `textos`.

### E2 · La línea se ve a través del unicornio, y el halo ya no lo separa de ella
- **Severidad:** Menor
- **Dueño:** el constructor (o el pulido) y el orquestador (la prueba que falta).
- **Archivo:** `sitio/src/components/Hitos.astro`: `mix-blend-mode: difference` en `.hitos__guia`, con el
  cuerpo en `--color-papel` y el halo `drop-shadow` en `--color-tinta`.
- **Evidencia:** la tarea pone al viajero «por encima de la línea». Con `difference`, el viajero no tapa la
  línea: la invierte. Donde la línea pasa detrás de las patas o la grupa se ve una raya clara sobre el unicornio
  negro, o guiones oscuros sobre el unicornio claro (`a4-z-light-h1.png`, `a4-z-light-h3.png`). En pendiente
  pasa casi siempre, porque las patas abarcan unos 50 px de ancho. Además, el comentario del CSS dice que el
  halo sirve «para despegarlo de la línea», y no lo hace: sobre la línea negra el halo da tinta
  (|0 − tinta|). Con halo y sin halo, los píxeles de la línea pasan de 0 a 16–27 (`a4-cascos-light-h1.png` y
  `-sinhalo.png`). Sobre el papel el halo queda gris claro (221 contra 246). En la ronda 3 el halo iba en el
  color del fondo y sin mezcla, y sí cortaba la línea.
- **Por qué escapó:** la prueba de E4 mide la mediana del contraste de la silueta (y pasa con margen). Que una
  raya de 2 px atraviese la silueta no mueve esa mediana. Ninguna prueba compara el viajero con la línea. El
  QA describió «unicornio blanco, lleno» desde la captura a 1×, donde la raya mide 2 px. Nadie amplió.
- **Prueba que falta:** dentro de la máscara de la silueta (la misma de la prueba de E4), la fracción de
  píxeles cuyo color se aparta más de 60 del color mayoritario de la silueta es ≤ 1 %, en una x donde la línea
  tenga pendiente.

### E3 · El QA-r4 nombra mal al agente que construyó y fecha mal su inicio
- **Severidad:** Menor (`F7`)
- **Evidencia:** 1) El `QA-r4.md` dice que «el agente de la ronda es `relevo-gemini`, con líneas solo
  `permitido`». El relevo solo lanzó `gemini.mjs` (6 líneas). Las llamadas del constructor están como
  `gemini:T03` (191 líneas), y el QA solo buscó `grep 'relevo-gemini'`, a las 15:19:36 UTC. La conclusión es
  cierta (las 191 son `permitido`), pero la revisó sobre el agente equivocado. 2) Dice que empezó a las
  «10:14 (aprox.)», pero su primera llamada en el hook es de las 15:08:45 UTC (10:08:45 local) y lanzó la
  compuerta a las 10:08:48. Son 6 minutos que faltan en la medida de la ronda.
- **Por qué escapó:** con Gemini (v5.0), el hook registra al constructor con otro nombre (`gemini:<ID>`) y
  el rol del QA no lo dice. La hora de inicio la escribió de memoria («aprox.») y no del hook ni de `date`
  al empezar.
- **Qué hacer:** que `fabrica/nucleo/roles/auditor.md` diga que en v5 se cruza `gemini:<ID>` (y
  `gemini:<ID>/S<n>`), no `relevo-gemini`.

### E4 · La compuerta del constructor quedó numerada como ronda 3
- **Severidad:** Menor (fábrica)
- **Evidencia:** la corrida del constructor de la ronda 4 se guardó como `COMPUERTAS-r3-5.md` y en
  `fabrica/datos/compuertas.jsonl` con `"ronda":3` (15:04:44 UTC). `compuertas.mjs` deduce la ronda de las
  `ENTREGA-r<N>.md` que existen, y la `ENTREGA-r4.md` se escribe después. El QA lo notó y lo dejó pasar.
- **Por qué escapó:** con agentes Claude pasaba igual, pero nadie usaba `compuertas.jsonl` por ronda. En
  `REGISTRO.md` va a contar una ronda 3 de más y una ronda 4 sin la compuerta del constructor.
- **Qué hacer:** que el lanzador (`gemini.mjs`) pase la ronda a la compuerta (por ejemplo `--ronda 4`) o que
  `compuertas.mjs` la tome de la `CORRECCION-r<N-1>.md` más reciente.

## Observación (sin hallazgo)

Las capturas tomadas con Playwright mientras gira la rueda (`a4-mov.png`, `a4b-mov-5.png` y también el
`af3-120.png` de la ronda 3) muestran toda la vista corrida hacia abajo 35–46 px, con la nav fija incluida y
una franja de papel arriba. El DOM no lo confirma: en `a4b.mjs`, la nav y la sección quedan en `top` = 0 en los
157 cuadros medidos con `requestAnimationFrame`. Parece que la captura toma un cuadro del compositor a mitad
del scroll suave. Toca la nav (T01/T02), no T03. Si en el pulido alguien lo ve con la rueda real en
`npm run dev`, es otra historia. Yo no lo pude confirmar.

## Lo que cumple (reproducido)

- E2-A: el bloque tapa al viajero cuando lo cruza (`a4-mov.png` y las pruebas a 1440 y a 1024, en verde en la
  suite completa).
- E3-B: `--inclinacion-desp: 1.5`, leído del token. Con rueda real llega a 32,7° y la prueba en movimiento pasa.
- E4: la silueta se ve llena en los hitos invertidos, en los dos temas, y en los normales sigue como antes.
- Los cinco hitos, el pin, la pista 1:1, el apilado, el modo sin JS y la consola limpia (0 de 10).
- No encontré código acomodado a la prueba: no hay `data-*` escritos a mano ni ramas para la prueba. La
  silueta sale de CSS y la inclinación, de `lenis.velocity`.

## Siguiente paso

El orquestador revisa E1 y decide (onda más baja, titular encima o aceptarlo en el pulido) y escribe las
pruebas de E1 y E2 en `sitio/tests/T03/t03.spec.ts`. E2 se puede arreglar en el pulido (por ejemplo, el
viajero sin `difference` y con un color por hito, o un halo que se pinte sin mezcla). E3 y E4 son de la
fábrica.
