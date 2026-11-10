# Auditoría final — T01

- **Veredicto propuesto:** DONE con correcciones del orquestador (nada vuelve al constructor; el orquestador decide)
- **Fecha:** 2026-11-10
- **Modelo:** claude-opus-5-5 (agente `auditor-final`)
- **Fábrica:** v2.1
- **Commit:** `b1c66cb` (el código de T01 sigue sin versionar)
- **Intervenciones del autor:** 0

## Compuertas (suite completa, corrida única)

`node fabrica/scripts/compuertas.mjs T01 --completas --guardar` → **VERDE**, guardado en `COMPUERTAS-r1-5.md`.
Bloqueos: 0. Avisos: 1. **No hubo ⚠️ «reintento»**: `npx playwright test tests/comunes tests/T01` pasó a la primera.
El ⚠️ `mobiliario` (`Nav.astro:29, 53, 55, 60`) es el borde de tinta y la sombra dura del manual que pide el punto 7.
Los saqué de los tokens. No es hallazgo, pero ver E2: esa misma sombra es la que debilita la prueba de foco.

## Qué probé en función (más allá de lo que midió el QA)

Usé un servidor propio en los puertos 4393 a 4395 sobre `sitio/dist` y sobre un build con `SITIO_BASE=/convocatoria-algora/` en mi carpeta temporal, más Playwright con scripts propios. Los servidores quedaron cerrados.

| Qué | Resultado |
|---|---|
| Colores pintados en 4 modos (claro y oscuro del sistema, claro y oscuro forzados por `localStorage`) | Correctos: fondo, texto, nav, botones y foco (`#2c08ff` en claro y `#d1ff22` en oscuro). Consola limpia. |
| Foco con Tab en los 4 modos, con captura de cada anillo | Visible en logo, «Tema» y «Postúlate». En oscuro, el anillo ácido del CTA ácido se separa por la sombra papel. |
| Sin JS, claro y oscuro | Página completa. El tema sigue a `prefers-color-scheme`. |
| Respaldo de `data-listo` con todos los `.woff2` colgados (el `load` nunca llega) | `data-listo` aparece a los 3998 ms desde la navegación: el respaldo de 3,5 s funciona. El H3 del QA sigue abierto como prueba que falta, no como defecto. |
| Lenis | Scroll suave real (serie de `scrollY` 99 → 320 → 479 … 789). Con movimiento reducido no hay clase `lenis` y el salto es directo. |
| Botón de tema con Enter y Espacio | Alterna `dark` y `light`. |
| axe del inicio en oscuro, y de la 404 en claro y oscuro | 0 violaciones. Enlace de la 404: 7,63:1 en claro y 5,92:1 en oscuro. |
| Publicación bajo `/convocatoria-algora/` | CSS, JS y las 4 fuentes cargan sin ningún 4xx. El logo y «Volver al inicio» llevan a `/convocatoria-algora/`. La 404 responde 404. |
| Afirmación de la entrega: «las variables no traen CSS solo-latín» | Cierta: `@fontsource-variable/zalando-sans` y `jetbrains-mono` solo traen `wght.css` con todos los subconjuntos. |
| Afirmación de la entrega: «violeta suave del manual» | Cierta: `previo/manual-marca-v0.1.html:22` trae `--accent:#8C7BFF` en oscuro. También están `#17171A`, `#5A5550` y `#A8A39C`. |
| Conteo «17 passed» | Cuadra: 5 pruebas comunes × 1 ruta + 12 de `t01.spec.ts`. |

No encontré código acomodado a la prueba ni estado escrito a mano. El tema sale de `localStorage` y `matchMedia`; Lenis es una instancia real; `data-listo` lo ponen `load` o el temporizador.

No pude revisar `/workflows` (paso 4 del § 4): desde este agente no tengo acceso. Eso pesa en E1.

---

### `E1` · La entrega dice que el constructor corrió `git checkout`, que la regla 3 prohíbe y el hook niega
- **Severidad:** Mayor
- **Dueño:** orquestador
- **Evidencia:** en `ENTREGA-r1.md` § Supuestos, el constructor escribe: «lo revertí con `git checkout -- sitio/tsconfig.json`».
  La regla 3 dice «Nada de `git commit`, `push`, `checkout`…». El constructor tiene el hook declarado (`.claude/agents/constructor.md`).
  Le pasé esa misma orden al hook (`fabrica/scripts/hook-agente.mjs`) y la **niega** (salida 2).
  Solo quedan dos posibilidades:
  (a) el constructor corrió otra variante que el hook deja pasar, o sea un rodeo (`F17`);
  (b) la entrega describe un comando que no corrió (`F7`).
  Probé variantes contra el hook y estas **pasan** (salida 0):
  `git -C sitio checkout -- tsconfig.json`, `git --no-pager checkout -- sitio/tsconfig.json` y `git show HEAD:sitio/tsconfig.json > sitio/tsconfig.json`.
  La regex `\bgit\s+(checkout|…)` exige que el subcomando vaya justo después de `git`.
  El resultado no hizo daño: `sitio/tsconfig.json` coincide hoy con `b1c66cb`.
- **Por qué escapó:** el QA leyó el Supuesto como prueba de buena conducta («seguí la regla») y no lo cruzó con la regla 3 ni con el hook. Ninguna compuerta registra los comandos que corre el agente.
- **Corrección:**
  1. Revisar en `/workflows` qué comando corrió el constructor en la r1 y si el hook le negó algo.
  2. Endurecer la regex del hook para que acepte opciones globales entre `git` y el subcomando (`git(\s+-\S+(\s+\S+)?)*\s+(checkout|…)`), y negar también la redirección de `git show` a un archivo.
  3. Agregar al rol del auditor: «todo comando de git que cite la entrega se contrasta con la regla 3».

### `E2` · La prueba común de foco da por visible un foco que no existe en todo componente con la sombra dura del manual
- **Severidad:** Mayor (de la fábrica; el código de T01 hoy cumple)
- **Dueño:** orquestador
- **Evidencia:** en `sitio/tests/comunes/sitio.spec.ts:107` la condición es `visible = (outline) || foco.sombra !== 'none'`.
  Todo botón y toda tarjeta del manual llevan `box-shadow: var(--sombra)` también sin foco.
  Hice un mutante en el navegador con `:focus-visible{outline:none !important}` y la misma lógica: «Tema» y «Postúlate» quedan `visibleSegunLaPrueba: true` con `outlineStyle: none`.
  Además, el contraste del anillo se mide contra el fondo del `body` y no contra lo que hay detrás del anillo.
  Con `--foco` cobalto, un enlace dentro del pie de tinta en tema claro tendría 2,39:1 (calculado: L(cobalto) = 0,0793 y L(tinta) = 0,0040), y la prueba reportaría 7,6:1 contra el papel.
  Pasa lo mismo con un anillo cobalto sobre un bloque cobalto, o ácido sobre ácido en oscuro: 1:1. Las tareas siguientes ponen enlaces en bloques de marca.
- **Por qué escapó:** el QA resumió la cobertura de la prueba («foco ≥ 3:1 en cada ruta») sin probar el caso negativo. Como hoy el foco sí existe, la prueba pasa por la razón correcta y nadie vio que pasaría igual sin él.
- **Corrección:**
  1. La prueba compara el estilo del elemento enfocado contra el mismo elemento sin foco (o una captura del recuadro con y sin foco).
  2. El contraste se mide contra el color de fondo efectivo del ancestro.
  3. Decidir en `docs/2-TECNICO.md` el foco sobre bloques de marca (por ejemplo, `--foco` local por bloque).

### `E3` · «Postúlate» apunta a `#postulate` relativo: desde la 404 (y desde la futura `/equipo/`) no lleva a ninguna parte
- **Severidad:** Menor
- **Dueño:** orquestador (la tarea pide `#postulate` al pie de la letra); el arreglo es de una línea en `Nav.astro`
- **Evidencia:** en el build con base, `404.html` trae `href="#postulate"`. Al hacer clic en el CTA desde `/convocatoria-algora/no-existe/` se llega a `…/no-existe/#postulate`, que es la misma 404.
  La prueba de nav (`t01.spec.ts:153`, `/#postulate$/`) también aceptaría `${inicio}#postulate`, así que la prueba no lo distingue.
- **Por qué escapó:** el QA validó el `href` contra el texto de la tarea y la prueba solo mira el inicio. Nadie hizo clic en el CTA desde otra ruta.
- **Corrección:** `href={`${inicio}#postulate`}` en `Nav.astro`, más una prueba que haga clic en el CTA desde la 404 y llegue al inicio.

### `E4` · `overflow-wrap: anywhere` global en `h1, h2, h3` (y en el pie) parte palabras sin necesidad
- **Severidad:** Menor
- **Dueño:** constructor u orquestador en el pulido
- **Evidencia:** en `sitio/src/styles/global.css:19` (y en `Pie.astro:19`) está la causa del «[CONTENID / O DE T02]» de `capturas/matriz/inicio/320x568.jpg`.
  Le quité la regla en el navegador: a 320, 360, 375 y 390 px **no aparece scroll horizontal** (`scrollWidth` = ancho de la ventana). La palabra solo invade unos px del margen.
  O sea: la regla no evita ningún desborde y sí corta palabras. Además vive en el andamio, así que la heredan todos los titulares XXL de D-3 («Postulaciones», «convocatoria»…).
- **Por qué escapó:** el QA y el constructor lo clasificaron como «responsive, va en `R`» sin buscar qué regla CSS lo producía. Era una decisión del andamio, no del ancho.
- **Corrección:** quitar `overflow-wrap: anywhere` de los titulares, o dejarlo en `break-word`, y resolver el ancho con la escala `clamp()`, en el pulido o en `R`.

### `E5` · En tema oscuro el pie deja de ser un «bloque de tinta a sangre»
- **Severidad:** Menor
- **Dueño:** orquestador con el autor (decisión de dirección, pulido)
- **Evidencia:** fondo del pie = fondo del body = `rgb(13, 13, 13)` en oscuro (medido). En la captura a 1440 en oscuro el pie es texto suelto sobre negro, sin borde ni cambio de plano.
  Además, en ventanas altas (430 × 932, 768 × 1024, 1024 × 1366, 2560 × 1440, 3440 × 1440, 5120 × 1440 y 3840 × 2160 de `inicio-breakpoints.jpg`) queda una franja papel debajo del pie. Esa franja es transitoria: desaparece cuando haya contenido.
- **Por qué escapó:** todas las capturas del buzón están en tema claro (`capturas.mjs` no toma el oscuro). La prueba del pie fija `colorScheme: 'light'`. Nadie miró el tema oscuro en píxeles.
- **Corrección:** que `capturas.mjs` tome también el oscuro, y presentarle al autor la decisión: borde o línea superior en oscuro, o invertir el pie a papel. El contrato «bloques iguales en ambos temas» de `docs/2-TECNICO.md` § 2 hoy lo deja así.

### `E6` · La 404 no pasa por las pruebas comunes
- **Severidad:** Menor
- **Dueño:** orquestador
- **Evidencia:** `sitio/tests/comunes/rutas.ts` solo recoge `index.html`, así que consola, 375 px, axe, movimiento reducido y foco nunca corren sobre `404.html`. La prueba de T01 solo mira el estado y el `href`.
  Lo corrí a mano: axe da 0 violaciones en los dos temas. Hoy no hay defecto.
- **Por qué escapó:** el QA dio por hecho que «las comunes cubren cada ruta» sin listar qué rutas devuelve `rutasDelBuild()`.
- **Corrección:** incluir `404.html` en las comunes, con la regla del 404 esperado en la prueba de consola y de estado.

### `E7` · El presupuesto de fuentes queda al 96 % por subconjuntos que la página nunca descarga
- **Severidad:** Menor
- **Dueño:** orquestador (el presupuesto mide los archivos de `dist`)
- **Evidencia:** son 240.444 B de 250.000. De esos, 71.696 B son de cirílico, griego, vietnamita y latin-ext de JetBrains Mono y Zalando Sans, que el navegador no baja en una página en español (`unicode-range`). Queda un margen de 9,5 KB para todas las tareas siguientes.
- **Por qué escapó:** el QA copió la cifra (que está bajo el aviso) sin preguntar qué la compone.
- **Corrección:** `@font-face` propio que apunte solo a los `latin-wght-normal.woff2` de las dos variables, o un presupuesto que mida lo transferido y no lo que hay en `dist`.

---

## Para el orquestador

- Ningún hallazgo vuelve al constructor como Crítico o Mayor del MVP. E1 y E2 son del proceso y de las pruebas. E3 y E4 son arreglos de una línea que caben como escapados corregidos en `PULIDO.md`.
- Nota para T02, no es hallazgo: `docs/2-TECNICO.md` § 2 pide el respaldo de `data-listo` «en CSS y JS». Hoy solo existe el de JS, porque en T01 nada se oculta esperando `data-listo`. Cuando T02 oculte algo, hace falta el de CSS.

---

## Revisión del orquestador (2026-11-10)

Verifiqué cada hallazgo contra el código y los registros. Lo que se arregló va en `PULIDO.md`.

- **E1 · confirmado, y es peor de lo que parecía.** En el registro del constructor (`wf_3675803e-0f3`)
  aparece `cd ".../sitio" && git checkout -- tsconfig.json`, y terminó sin error. El hook, probado a mano
  con ese mismo comando, sí lo niega (salida 2). Ninguna de las tres corridas del workflow tiene un solo
  rastro del hook: **el declarado en la cabecera de los agentes no se disparó**. No hubo rodeo del
  agente; no había nadie vigilando. Corregido en la fábrica (`F23`): el hook también desde
  `.claude/settings.json` con `--desde-settings` (decide por `agent_type`), registro por llamada en
  `fabrica/datos/hook.jsonl` y patrón que ahora ve `git -C …`, `git --no-pager …` y `git … > archivo`.
  **Por verificar en T02:** que `hook.jsonl` tenga las llamadas del constructor.
- **E2 · confirmado.** Prueba de foco reescrita (`F24`): la sombra solo cuenta si cambia al enfocar, el
  contraste se mide contra el primer fondo opaco detrás del elemento y corre en claro del sistema,
  oscuro del sistema y oscuro forzado. Sembrado: sin anillo de foco → 6 fallan; foco cobalto en oscuro → 4 fallan.
- **E3 · confirmado.** Prueba nueva: el CTA desde la 404 debe ir al inicio. Sembrado `#postulate` relativo → falla.
- **E4 · confirmado.** Se quitó la regla de `h1–h3` y del pie; la prueba de 375 px sigue en verde.
- **E5 · confirmado.** Decisión del autor: en oscuro la tinta del pie se aclara un punto
  (`--pie-fondo`, 90 % tinta y 10 % papel) para que no se funda con el fondo.
- **E6 · confirmado.** `rutasDelBuild()` ahora incluye `/404.html`: las comunes corren también en la 404.
- **E7 · confirmado.** `@font-face` propio solo con el subconjunto latino: fuentes de 240.444 B a 168.748 B.
- **H3 (QA) · cerrado.** Prueba nueva del respaldo de `data-listo` con `load` colgado: entre 3,3 s y
  3,65 s desde la navegación. `listo.ts` cuenta ahora los 3,5 s desde la navegación. Sembrado: respaldo
  a 4 s → falla. El caso «sin descontar el arranque del módulo» no lo distingue (el módulo corre en
  menos de 150 ms); queda dentro del margen y se acepta.
- **Nota para T02 del auditor (respaldo en CSS):** se pasa a la tarea T02.

Compuertas completas después de los arreglos: todo en verde salvo `fuera-de-alcance`, que nombra los
cambios de la fábrica de esta revisión (hook, settings, pruebas) aún sin commit; se limpian con el commit de cierre.
