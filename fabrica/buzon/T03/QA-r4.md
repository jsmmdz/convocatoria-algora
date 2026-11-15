VEREDICTO: PASA

# QA r4 — T03 · Hitos

- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v5.0
- **Inicio:** 2026-11-15 10:14 (salida de `date`, aprox.)
- **Fin:** 2026-11-15 10:21 (salida de `date`)
- **Intervenciones del autor:** 0

## Resumen

La ronda 4 corrige los tres defectos de `CORRECCION-r3.md` (`E2`, `E3`, `E4`). Compuertas en VERDE (0 bloqueos, 0 avisos), reproducidas por mí. Repetí aparte las cinco pruebas de los tres defectos (`cruza un bloque` a 1440 y 1024, `inclinación en movimiento`, `silueta` en claro y oscuro): 5 de 5 pasan. Las capturas muestran el viajero tapado por el bloque, apoyado en la unión sólida/punteada y con la silueta llena sobre los hitos invertidos en los dos temas. Sin Críticos ni Mayores. Dos Menores de pulido.

## Compuertas

`node fabrica/scripts/compuertas.mjs T03 --guardar` → **VERDE**, guardado en `COMPUERTAS-r4.md`: archivos-propios (4), fuera-de-alcance (ninguno), check 0/0/0, build, Playwright (`tests/comunes`, `tests/T03`, `tests/T01`, `tests/T02`) sin reintento, patrones sin coincidencias, fuentes 168.748 B de 250.000, JS inicial 69.387 B gzip de 220.000. Sin ⚠️ que juzgar.

## Entregables (contra la tarea y `CORRECCION-r3`)

| Entregable | Estado | Evidencia |
|---|---|---|
| `E2` viajero por debajo de los bloques y por encima de la línea | Cumple | `[data-guia]` está dentro de `[data-hitos-pista]` (`Hitos.astro`), capas 1/2/3 y `xPista - lado/2` en `hitos.ts`. Pruebas `viajero a 1440×900` y `a 1024×768` verdes, medidas en píxeles con y sin viajero. Captura `estado-hitos-tinta.jpg`: el bloque tomate lo tapa; solo asoma una franja de unos 4 px a la izquierda del borde del bloque (x ≈ 439–443) |
| `E3` desplazamiento 1,5 px por grado | Cumple | `--inclinacion-desp: 1.5` en `tokens.css`, leído por `hitos.ts` con `leerNumero` (no fijo en el código). Prueba con rueda real verde |
| `E4` silueta ≥ 3:1 en hitos invertidos, claro y oscuro | Cumple | Pruebas `viajero (claro)` y `viajero (oscuro)` verdes (píxel a píxel contra la captura sin viajero). A ojo: `tmp/tinta-light.png` unicornio en papel sobre tinta; `tmp/tinta-dark.png` en tinta sobre papel |
| Sin hex fuera de `tokens.css`; tema normal «como hoy» | Cumple | Patrón `hex-suelto` sin coincidencias. En hitos normales el unicornio sigue negro sobre papel (`estado-hitos-1/2.jpg`) |
| Rondas 1–3 sin regresiones (contenido, pin, línea, apilado, sin JS) | Cumple | Todas las pruebas de `tests/T03` más T01 y T02 en verde en la compuerta |

## Reproducción de afirmaciones

- «Compuertas VERDE»: reproducido (arriba).
- «Pasan `viajero a 1440×900`…, inclinación en movimiento y viajero claro/oscuro»: repetidas con `npx playwright test tests/T03 -g "cruza un bloque|inclinación en movimiento|silueta se lee"` → 5 passed.
- «Servidor 4395 cerrado»: `netstat | grep :439` sin salida.
- «Sin tocar pruebas, onda ni x del viajero»: solo cambian `Hitos.astro`, `hitos.ts` y `tokens.css`; `--viajero-x: 0.33` y los tokens de la onda siguen igual.
- La entrega cita la compuerta como `COMPUERTAS-r3-5.md`; es el numerado del script de la corrida del constructor y existe. Mi corrida queda en `COMPUERTAS-r4.md`.

## Pruebas: ¿cubren lo que pide la tarea?

Leí las pruebas de `E2`, `E3` y `E4`: miden resultado (píxeles con y sin viajero, posición de los cascos en movimiento con rueda real, contraste de la silueta con una máscara), no mecanismo. No encontré código acomodado a la prueba: no hay estado escrito a mano en `data-*`, ni ramas solo para la prueba; la silueta sale de `mix-blend-mode: difference` por CSS y la inclinación de `lenis.velocity` en el ticker. Todo lo de «Cuándo terminaste» tiene prueba, salvo lo que la tarea deja al autor (sensación de la línea, ritmo, gesto al inclinarse).

## Código

- Fugas: el ticker se agrega y se quita en par (`encender`/`apagar`) y solo corre con la sección visible; `refreshInit` se retira en la limpieza; `document.fonts.ready` queda protegido con `cancelada`; los `ScrollTrigger` y el tween se matan en el retorno de `matchMedia`.
- Sin `any` ni `as` para callar al compilador. Valores de diseño por token (`SIN_TOKEN = 1` es un respaldo declarado).
- Paralelo con otras tareas: clases con alcance de Astro, un solo `[data-guia]`, sin listeners nuevos sobre `window`, un solo pin.
- Hook (F17): busqué en `fabrica/datos/hook.jsonl` las líneas `negado` del constructor. No hay ninguna de la ronda 4: el agente de la ronda es `relevo-gemini`, con líneas solo `permitido`, y `denied_actions` está vacío en `REGISTRO-gemini-r4.json`. Las `negado` que existen son del `auditor-final` del 2026-11-11. No hay rodeo que cruzar.

## Lo que veo

- **`unseen-A3.jpg` / `unseen-A5.jpg` (hitos-2, 1440 × 900):** fondo papel casi blanco. A la izquierda un bloque magenta de x = 0 a 417 y de y = 389 a 857, con «…ipo» en cursiva tinta abajo. Sobre su borde superior, hacia x ≈ 300, asoma un arco negro de 1–2 px (la cresta de la línea que pasa por debajo del bloque). Desde el borde del bloque (x = 417, y ≈ 497) arranca la línea sólida negra y baja hasta y ≈ 550. El unicornio negro, de unos 65 px de alto, está entre x = 442 y 506 con los cascos sobre la línea en y ≈ 550. Desde x ≈ 490 la línea es punteada y ondula hasta x = 1180, donde entra en un hito de fondo tinta con la etiqueta `[USUARIOS] [03/05]` en verde ácido (y = 640) y el titular «Gente q…» en papel. Arriba al centro, `[EQUIPO] [02/05]` en gris mono y el titular «Alguien de otra carrera la entiende mejor que tú.» en sans ligera, tres líneas, de y = 120 a 300.
- **`unseen-A4.jpg` (hitos-1):** fondo papel. Un bloque ácido de x ≈ 443 a 1077 y de y = 80 a 548, con «Idea» en cursiva negra gigante abajo a la izquierda. Una línea sólida negra viene desde la izquierda con una onda alta (cresta en y ≈ 365) y llega al unicornio, pegado al borde izquierdo del bloque; la línea punteada baja y sigue por debajo del bloque. A la derecha asoma el bloque magenta del hito 2 con «Eq…». Abajo a la izquierda, cortado por el borde, el titular «…de vivir / …libreta.».
- **`unseen-A4b.jpg` / `estado-hitos-tinta.jpg` (hitos-tinta):** el hito 3 es una banda tinta de x = 0 a 1120. Un bloque tomate de x = 443 a 1077 y de y = 80 a 548 con «Usuarios» en cursiva tinta. La línea sólida es blanca, entra por la izquierda, llega al borde del bloque en x ≈ 443, y ≈ 495 y desaparece detrás de él; el unicornio no se ve, salvo una franja de unos 4 px. Debajo del bloque asoma un trozo punteado blanco (x 560–610, y ≈ 550). Pasado x = 1120 empieza la banda papel del hito 4, con un bloque cobalto con «Valor» en cursiva papel y la línea punteada negra que entra desde x = 1077. El titular «…e no / …a usa sin / …bidas.» en papel, abajo a la izquierda. La etiqueta del hito 3 no cae en este cuadro (queda fuera por la izquierda).
- **`tmp/tinta-light.png` (tema claro, hito 3):** el hito 3 es tinta desde x = 360; el unicornio blanco, lleno, en x = 437–503, y = 510–575, sobre la línea; la sólida blanca llega hasta él y la punteada blanca sigue. Etiqueta verde ácido y titular en papel de tres líneas.
- **`tmp/tinta-dark.png` (tema oscuro, hito 3):** el hito 3 es papel; el unicornio negro y lleno en el mismo lugar; etiqueta cobalto y titular en tinta.
- **`inicio-breakpoints.jpg`:** muestra la portada azul de 320 a 5120 px; a 1440, 1280 y 1024 nada se corta ni se encima en el primer pantallazo.
- **`inicio-390-completa.jpg`:** cinco hitos apilados, cada uno con etiqueta mono, titular y un bloque de color a todo el ancho con la palabra en cursiva; los hitos 3 y 5 con fondo tinta; sin línea ni unicornio; sin scroll horizontal. La barra de navegación aparece cortando el hito 5 en la foto de página completa por ser un elemento fijo de la captura.

## Contra el referente

| id | Aspecto | Referente | Lo nuestro (de «Lo que veo») | Cumple |
|---|---|---|---|---|
| A3 | Hitos en fila unidos por una línea ondulada fina; lo recorrido sólido y lo pendiente punteado | Línea ondulada fina gris, sólida hasta el personaje y punteada después | Línea negra ondulada de 2 px, sólida hasta la x del unicornio (≈ 490) y punteada de ahí en adelante, por debajo de los bloques | Cumple |
| A4 | Etiquetas mono entre corchetes, titular de dos a cuatro líneas en sans ligera, panel grande al lado; algunos hitos en fondo oscuro | Etiqueta mono, titular de 3 líneas, panel grande, otro hito oscuro | `[EQUIPO] [02/05]` mono, titular de 3 líneas en sans ligera, bloque ácido de 634 × 468 px (la tarea pide bloque de color con cursiva, no imagen), hito 3 en tinta | Cumple |
| A4b | Hito oscuro: etiquetas en color y titular en papel | Fondo oscuro, etiqueta roja, titular blanco | Banda tinta con etiqueta verde ácido (claro) o cobalto (oscuro) y titular en papel; en el cuadro hitos-tinta la etiqueta queda fuera, pero se ve completa en hitos-2 y en `tinta-light.png` | Cumple |
| A5 | El personaje va donde la sólida se vuelve punteada y se inclina con la velocidad | Personaje en la unión sólida/punteada | Unicornio con los cascos sobre la línea (y ≈ 550) en la unión sólida/punteada, centro en x ≈ 474 (33 %); la inclinación la mide la prueba con rueda real (el movimiento no lo juzgo) | Cumple |

`no_se_toma`: no aparece la imagen del proyecto (hay bloque de color), ni «OPEN [+]», ni la mascota de ojos con alas, ni el modo vertical A6; el titular es Zalando Sans ligera.

## Hallazgos

Ningún Crítico ni Mayor.

| # | Severidad | Dueño | Hallazgo |
|---|---|---|---|
| M1 | Menor | orquestador (pulido) | En `hitos-2` la cresta de la línea asoma 1–2 px sobre el borde superior del bloque magenta (x ≈ 300, y ≈ 388), y en `hitos-tinta` un trozo punteado asoma bajo el bloque (x 560–610, y ≈ 550). Es consecuencia correcta de «la línea pasa por debajo de los bloques»; la forma de la onda es del pulido |
| M2 | Menor | orquestador (pulido) | El cuadro `hitos-tinta` no muestra la etiqueta del hito 3 (cae fuera por la izquierda). A4b «etiquetas en color» se comprueba con `hitos-2` y la sonda `tinta-light.png`. Si el pulido ajusta los pasos de rueda del estado, conviene que la etiqueta quede en el cuadro |

## Paso siguiente

APROBADO: sigue la auditoría final del orquestador.
