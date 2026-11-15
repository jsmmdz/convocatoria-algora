# Auditoría final — T03 · Hitos

- **Veredicto:** NO PASA todavía. La compuerta está en **ROJO** por archivos de planeación de T04 sin commit (del orquestador, no del constructor). Además, dos defectos visuales del viajero que ninguna prueba ve (E2, E3) piden una decisión del orquestador antes del pulido.
- **Fecha:** 2026-11-10 21:22–21:40 (hora local)
- **Modelo:** claude-opus-5-5 (auditor-final, primera pasada; el orquestador la revisa)
- **Fábrica:** v2.1 (preset v4.2 según `fabrica/LEEME.md`)
- **Commit:** `174da15` + árbol de trabajo de T03 (sin commit)
- **Intervenciones del autor:** 0

## Lo que reproduje

- **Compuertas, suite completa:** `node fabrica/scripts/compuertas.mjs T03 --completas --guardar`, en primer plano (4 min 55 s) → **COMPUERTAS: ROJO**, Bloquean 1, Avisos 0, guardado en `COMPUERTAS-r3-4.md`.
  - Playwright `tests/comunes tests/T03 tests/T01 tests/T02`: **passed**, sin ⚠️ de reintento. El aviso `CONTEXT_LOST_WEBGL` de `H1-r3` no salió en esta corrida.
  - check 0/0/0, build `Complete!`, patrones sin coincidencias, fuentes 168.748 B, JS inicial 69.367 B gzip.
  - ❌ `fuera-de-alcance`: `docs/1-PRODUCTO.md`, `docs/3-ESTADO.md`, `fabrica/proyecto/referentes/T04.json` y `fabrica/proyecto/tareas/T04-productos.md` (ver E1).
- **El `COMPUERTAS-r3-3.md` en VERDE era cierto cuando arrancó:** `compuertas.mjs` lee `git status` al empezar (línea 65) y escribe la fecha al terminar (línea 288). La r3-3 termina a las 02:21:45 UTC, así que arrancó hacia las 02:16:45. Los cuatro archivos se modificaron entre las 02:18:40 y las 02:21:33 UTC (`ls --time-style=full-iso`), con la corrida en marcha.
- **Alcance real (`git status`, `git diff --stat`):** del código de T03 hay 4 archivos (`Hitos.astro`, `hitos.ts`, `index.astro` +4, `tokens.css` +31). Lo demás son la planeación de T04 y `fabrica/datos/compuertas.jsonl`.
- **`H1-r3`, «arreglado»:** `sitio/tests/comunes/sitio.spec.ts`, `sitio/src/lib/webgl.ts` y `trama.ts` son idénticos a HEAD (sin diff; el último commit de la prueba es `694cc09`). La `r3-2` muestra que la prueba común se tocó y la `r3-3` que el cambio se deshizo. El verde llega porque el aviso es intermitente, no porque se haya corregido (ver E7).

## Función, probada en el navegador

Mis sondas están en `fabrica/buzon/T03/tmp/af.mjs`, `af2.mjs` y `af3.mjs`, con el build servido en el 4394 (cerrado al terminar) y la GPU de las pruebas (`--use-angle=d3d11`).

| Qué | Resultado |
|---|---|
| Recorrido a 1440 × 900, claro y oscuro, en 17 posiciones (`af.mjs viajero`) | Pin desde y = 900, recorrido de 5760 px (pista de 7200 = 5 × 1440). El viajero queda en x = 428–429 (centro ≈ 465, el 32 %) y mide 74 × 74. Sin avisos de consola |
| Cambio de tamaño dentro del pin: 1440 → 1100 → 800 → 1440 (`af2.mjs tam`) | 1100 sigue en horizontal con la pista de 5500 y el viajero de 65 px. A 800 pasa a apilado (`modo` "-", sin viajero, scrollWidth = 800). Al volver a 1440, horizontal otra vez con la pista de 7200. Bien |
| Consola en 12 cargas limpias a 1280 × 720 (`af2.mjs consola`) | 0 de 12 con avisos |
| Cascos del viajero sobre un bloque, en 61 posiciones del recorrido (`af2.mjs bloques`) | **1440: 14/61 · 1280: 16/61 · 1024: 14/61** (E2) |
| Inclinación con rueda real (`af3.mjs`) | Rueda de 60 px: 11,7° y el viajero se separa **86 px** de su punto de apoyo. De 120 px: 23,9° y **176 px**. De 240 px: 30,2° y **223 px** (E3) |
| Contraste del cuerpo del viajero contra el fondo que tiene debajo (`af.mjs viajero`) | Claro: **1,00** en los hitos 3 y 5 (tinta sobre tinta) y 2,39 sobre cobalto. Oscuro: **1,00** en los hitos 3 y 5 (papel sobre papel) y **1,09** sobre ácido (E4) |

## Lo que veo

- `tmp/af2-bloque-18.png` (claro, 1440): el unicornio negro, inclinado unos 30°, está posado en la **esquina superior del bloque magenta**, en x ≈ 245–315 e y ≈ 370–425. La línea no se ve debajo de él: sale por el borde derecho del bloque en y ≈ 500, sólida hasta x ≈ 465 y punteada desde ahí. El unicornio queda a unos 100 px por encima del trazo.
- `tmp/af2-bloque-36.png` (claro, 1440): el unicornio flota **dentro del bloque tomate «Usuarios»**, en x ≈ 240–320 e y ≈ 225–285. La línea blanca pasa por debajo del bloque y asoma en y ≈ 550: unos 270 px por debajo de los cascos.
- `tmp/af3-120.png` (rueda de 120 px): el unicornio está en el borde derecho del bloque tomate (x ≈ 280–355, y ≈ 440–500), inclinado. La línea sólida asoma en x ≈ 340–427 por debajo de él y se mete bajo el bloque cobalto. La unión sólida/punteada, en la x fija de 475, no queda donde está el unicornio.
- `tmp/af-light-08.png` (claro, hito 3 de tinta): fondo negro y línea blanca, sólida a la izquierda y punteada a la derecha. El unicornio se ve solo como un **contorno blanco hueco** de unos 2 px. El cuerpo, negro, desaparece en el fondo.
- `tmp/af-dark-02.png` (oscuro, sobre el bloque ácido): un unicornio blanco con contorno oscuro flota en medio del verde ácido, sin línea a la vista.
- `referentes/capturas/unseen-06-linea-3-1440.jpg` y `unseen-07-linea-4-1440.jpg`: en Unseen la línea **pasa entre** el texto y el panel, y el personaje siempre está sobre el trazo visible, en la unión sólida/punteada. Nunca queda encima de un panel.

## Hallazgos

### E1 · La compuerta de T03 está en ROJO por la planeación de T04 sin commit
- **Severidad:** Crítico (compuerta ❌). El dueño es el orquestador; el código de T03 no tiene la culpa.
- **Evidencia:** `COMPUERTAS-r3-4.md`: `fuera-de-alcance` con `docs/1-PRODUCTO.md`, `docs/3-ESTADO.md`, `fabrica/proyecto/referentes/T04.json` y `fabrica/proyecto/tareas/T04-productos.md`. Se escribieron entre las 21:18:40 y las 21:21:33 (hora local), con la `r3-3` corriendo.
- **Qué hacer:** hacer el commit de la planeación de T04 aparte (o apartarla) y repetir `compuertas.mjs T03 --completas`. No hay que cambiar código.
- **Por qué escapó:** la `r3-3` toma `git status` al arrancar y pone la fecha al terminar, así que un VERDE fechado *después* de las ediciones no las vio. Además se rompió la regla de `CLAUDE.md` «No toques el repo mientras corre un lanzamiento»: el orquestador escribió la T04 en el mismo árbol mientras corría la compuerta de T03. Hueco de la fábrica: el `.md` de compuertas debería registrar la hora de arranque y avisar si `git status` cambió durante la corrida.

### E2 · El unicornio flota encima de los bloques, donde la línea queda tapada
- **Severidad:** Mayor
- **Dueño:** el orquestador decide (es un calco: A5/K4). Lo corrige el constructor o se hace en el pulido.
- **Archivos:** `sitio/src/components/Hitos.astro` (`.hitos__guia` con `z-index: 3`, por encima de los bloques en `z-index: 2`, y la línea en 1) y `sitio/src/lib/hitos.ts` (`trazar()`: dos senos que no tienen en cuenta dónde van los bloques).
- **Evidencia:** los cascos del viajero quedan dentro de un bloque en 14/61, 16/61 y 14/61 posiciones a 1440, 1280 y 1024 (un 23–26 % del recorrido). Ahí la línea no se ve y el unicornio flota sobre el color, a 100–270 px del trazo que asoma por debajo (`af2-bloque-18.png`, `af2-bloque-36.png`). La tarea pide que la línea «pasa entre los textos y los bloques» y que el viajero «apoya los cascos sobre el trazo». El referente nunca pone al personaje encima de un panel.
- **Qué decidir:** que la onda esquive los bloques (pase por el hueco entre texto y bloque, como en Unseen) o que el viajero vaya debajo de los bloques como la línea. No es solo «la x exacta del viajero»: con cualquier x fija, los cinco bloques le pasan por encima.
- **Por qué escapó:** la prueba de la línea oculta los bloques (`[data-hito-bloque] { visibility: hidden }`) antes de medir dónde apoyan los cascos, así que mide el trazo que el visitante no ve. El QA vio el caso en la hoja A4b («pegado a la U») y lo archivó como `H3-r3` Menor de pulido, por la x. Nadie recorrió la sección entera mirando píxeles. Falta una prueba: en N posiciones del recorrido, el punto de apoyo del viajero no cae dentro de ningún `[data-hito-bloque]`, o la línea es visible en esa x con los bloques puestos.

### E3 · Con la inclinación K2, el unicornio se despega de la línea hasta 223 px al hacer scroll
- **Severidad:** Mayor
- **Dueño:** el orquestador. Es la especificación: el constructor aplicó literal `rotate(rot) translateX(−8·rot px)`.
- **Archivos:** `sitio/src/lib/hitos.ts` (`inclinar`), con las constantes de `fabrica/proyecto/referentes/T03.json` K2 (`desplazamiento_px_por_grado: 8`).
- **Evidencia (`af3.mjs`, rueda real):** con 60 px por paso, 11,7° y 86 px de separación. Con 120 px, 23,9° y 176 px. Con 240 px, 30,2° y 223 px. Al tope de 40° serían 320 px. Mientras se hace scroll, el unicornio deja de estar sobre el trazo y deja de marcar la unión sólida/punteada (A5, K4): `af3-120.png`. El 8 px/° viene del globo con alas de Unseen (`.js-balloon`), que vuela y no se apoya en nada. Con un unicornio de 74 px que «apoya los cascos», las dos técnicas chocan.
- **Qué decidir:** bajar el desplazamiento (o quitarlo y girar sobre los cascos), o aceptar el gesto con el autor en el pulido. «El gesto del unicornio al inclinarse» lo juzga él, pero hay que mostrárselo sabiendo que se despega.
- **Por qué escapó:** la prueba de inclinación mide solo el ángulo. Las de la línea y el apoyo esperan a que el viajero esté quieto (`esperarQuieto`) y las capturas esperan 1600 ms. Nunca se mide la posición en movimiento. Además, la ficha copió las constantes de un objeto que vuela para un personaje que camina, y nadie contrastó K2 con K4.

### E4 · El cuerpo del viajero tiene contraste 1:1 en los hitos invertidos y queda de contorno hueco
- **Severidad:** Menor
- **Dueño:** el constructor (en el pulido) y el orquestador (la prueba que falta).
- **Archivo:** `sitio/src/components/Hitos.astro` (`.hitos__viajero { color: var(--texto) }` y un halo de 2 px en `var(--fondo)`).
- **Evidencia:** cuerpo contra fondo de 1,00 en los hitos 3 y 5, en claro y en oscuro. En oscuro es 1,09 sobre el bloque ácido y en claro 2,39 sobre el cobalto. La tarea pide «contraste ≥ 3:1» sobre los dos fondos. Solo el halo de 2 px contrasta (18:1), y el unicornio se ve como un contorno hueco (`af-light-08.png`) en vez de una silueta llena, como en el resto del recorrido. Se lee, pero cambia de aspecto.
- **Por qué escapó:** no hay prueba del contraste del viajero (ya lo decía `H2-r3`). El QA lo describió («con halo claro») sin medirlo. El viajero está fuera de los `article`, así que no hereda el color invertido del hito que tiene debajo.

### E5 · El QA-r3 afirma algo falso sobre las negaciones del hook
- **Severidad:** Menor (`F7`)
- **Evidencia:** el `QA-r3.md` dice que `hook.jsonl` «solo tiene dos `negado`», del constructor y del auditor-final de T02. Pero el propio QA tuvo tres negaciones en T03 (líneas 415, 462 y 470: `qa2.mjs` a las 01:02, `r3a.mjs` a las 01:32 y `r3c.mjs` a las 01:34 UTC), todas antes de que cerrara su informe. Crucé cada una con su llamada siguiente: después escribió el mismo archivo en `fabrica/buzon/T03/tmp/` con `Write` o con una ruta absoluta. No hubo rodeo hacia un lugar prohibido.
- **Por qué escapó:** el QA buscó con `grep negado` y truncó con `cut`. La línea que niega lleva el `detalle` largo antes de `decision`, así que no la reconoció.

### E6 · El hook se equivoca en los dos sentidos con las rutas de `tmp/`
- **Severidad:** Menor (fábrica)
- **Evidencia:**
  1. **Falso positivo:** con `cd fabrica/buzon/T03/tmp && cat > qa2.mjs` (o `node -e` con `writeFileSync('af.mjs')`), el hook niega porque no resuelve la ruta relativa contra el `cd`. Pasó 3 veces al QA y 1 a mí.
  2. **Falso negativo, causado por mí:** mi sonda `af.mjs` armó la ruta de las capturas con `new URL(...).pathname`, el espacio de «PAGINA CONVOCATORIA» quedó como `%20` y Playwright escribió 34 PNG **fuera del repo**, en `c:\UNIVERSIDAD\UNIVERSIDAD\PAGINA%20CONVOCATORIA\fabrica\buzon\T03\tmp\`. El hook no lo vio porque solo juzga el texto del comando, no lo que escribe un script por dentro. No borré esa carpeta: queda fuera de lo que puedo escribir. **El orquestador debe borrarla.**
- **Qué hacer:** que el hook resuelva las rutas relativas contra el `cd` del comando y agregar ese caso a `probar-hook.mjs`. Dejar escrito en las reglas que un script temporal arma sus rutas con `fileURLToPath`, no con `.pathname`.

### E7 · `H1-r3` se cerró sin una causa ni una decisión escrita
- **Severidad:** Menor (proceso)
- **Evidencia:** el `ESCALADO.md` pedía decidir cómo tratar `CONTEXT_LOST_WEBGL: loseContext`. No hay cambio en la prueba, ni en `webgl.ts`/`trama.ts`, ni en `RUIDO_DEL_DRIVER`, ni nota en `docs/` o `fallas.md` (`grep CONTEXT_LOST` solo encuentra el código de T02). El aviso es intermitente: el QA lo midió en 1 de 6 cargas del build de HEAD; yo, en 0 de 12, y la suite completa pasó. Va a volver a tumbar la regresión de T04 cuando le toque.
- **Por qué escapó:** el bloqueo se «arregló» repitiendo la corrida hasta que salió en verde, y nadie dejó escrita la decisión. Es justo el patrón de las pruebas que solo pasan al reintentar, que `playwright.config.ts` rechaza (`retries: 0`).

## Lo que cumple (reproducido)

Los cinco hitos con sus textos, etiquetas mono, `h2` ligero y bloque con la palabra en cursiva `aria-hidden`. El modo horizontal a 1440, 1280 y 1024, con pin, pista 1:1 y el pie alcanzable. El apilado sin JS, con movimiento reducido y en angosto. El redibujo al cambiar de tamaño dentro del pin. La línea sólida hasta la x del viajero y punteada después, con `difference` sobre tinta y papel. La consola limpia en 12 cargas. Los 21 casos de T03 pasan en la suite completa.

## Siguiente paso

El orquestador hace el commit de la planeación de T04 aparte, borra la carpeta suelta de E6 y repite la compuerta completa. Después decide E2 y E3 (si el viajero va debajo de los bloques o la onda los esquiva, y cuánto desplazamiento tiene la inclinación) antes del pulido, y escribe la prueba de E2 y E4.

## Revisión del orquestador (2026-11-14)

Verifiqué cada hallazgo contra el código, las capturas y los referentes (`F7`).

- **E1:** cierto. Lo cerré con el commit de la planeación de T04 (`877575f`), aparte de los cuatro commits de la fábrica v5.
- **E2 y E3:** ciertos y reproducidos en `af2-bloque-36.png` y `af3-120.png`. Una corrección a la evidencia: en Unseen
  la línea **sí** pasa por detrás de los paneles (`unseen-05` y `unseen-07`), y en `unseen-05`, donde el panel tapa la x
  de la mascota, la mascota no se ve. No es que nunca esté encima de un panel: va por debajo. En `unseen-06`, además,
  el globo flota unos 130 px por debajo de la unión. Lo de «apoyar los cascos» es nuestra adaptación al unicornio.
  **Decisión del autor:** E2-A (el viajero va por debajo de los bloques, como la línea) y E3-B (desplazamiento
  bajo; el orquestador fijó 1,5 px por grado, que se afina en el pulido). Quedó escrito en `docs/1-PRODUCTO.md` § 6,
  en la tarea (puntos 4–6) y en la ficha (K2).
- **E2, E3 y E4: las pruebas que faltaban, escritas y validadas** en `sitio/tests/T03/t03.spec.ts`:
  - el bloque tapa al viajero cuando lo cruza, a 1440 y a 1024, medido en píxeles con el viajero y sin él;
  - en movimiento, los cascos quedan a ≤ 2 px por grado + 12 px de la unión sólida/punteada (rueda real);
  - la silueta del viajero contrasta ≥ 3:1 con el fondo del hito, en claro y en oscuro, medido con una máscara de la
    silueta y no con el halo.

  Contra el código actual fallan las cinco, con los números de la auditoría: 30 % y 32 % de píxeles encimados,
  282 px a 35° y contraste 1:1. Con una referencia corregida pasan, junto con las 13 de antes: 18 de 18. Esa
  referencia llevaba el viajero dentro de la pista con `z-index` 1, `difference` y 1,5 px por grado. La apliqué y
  la quité; los tres archivos quedaron idénticos (sha256).
- **Corrección:** `CORRECCION-r3.md` (E2, E3 y E4) para la ronda 4, con Gemini.
- **E5:** sin acción. Fue un error de lectura del QA y no hubo ningún intento de rodear el hook.
- **E6:** la carpeta `PAGINA%20CONVOCATORIA` ya no existía. Lo que sí arreglé fue el hook (`hook-agente.mjs`): ahora
  resuelve las rutas relativas contra los `cd`, `pushd` y `Set-Location` que vienen antes en el comando. Hay 7
  casos nuevos en `probar-hook.mjs` (44 en verde, y 22 en `probar-hook-gemini.mjs`). El hook anterior fallaba 5
  de ellos: los 2 falsos positivos de esta auditoría y 3 falsos negativos (`cd /c/otra && echo > x.txt` pasaba).
  La regla de `fileURLToPath` quedó en `fabrica/nucleo/reglas.md`.
- **E7:** no se reproduce: 0 avisos en 30 cargas de la prueba de consola. Chrome solo escribe
  `CONTEXT_LOST_WEBGL: loseContext` cuando se llama `loseContext()` sobre un contexto ya perdido. Los dos lugares
  que lo llaman (`webgl.ts` y `trama.ts`, de T02) ahora preguntan antes con `isContextLost()`. Pasan check, build y
  `comunes + T02` (30 de 30). Lo arreglé yo porque es código de una tarea cerrada que queda fuera de los archivos
  de T03.
