# 1 · Producto — qué se construye

> Fuente de verdad. La escribe el orquestador en el arranque **desde `ENCARGO.md` y las decisiones del
> autor**, y solo cambia con una decisión del autor. Si algo no está aquí, no está decidido.
> Escrito el 2026-11-09. Bloque de decisiones del arranque cerrado el mismo día (§ 6).

## 1. La web en una frase

La convocatoria del semillero Algora (Creación Digital, Universidad El Bosque) para que estudiantes de
cualquier carrera **se postulen**, con su idea o para sumarse a un proyecto que ya existe.

## 2. Recorrido

| # | Sección | Qué hace el visitante aquí | Referente que se calca |
|---|---|---|---|
| 1 | Precarga | Espera un instante; el contador anticipa el tono | unseen A1 |
| 2 | Portada | Lee «¿Y si esta vez sí lo haces realidad?» con profundidad y la trama que reacciona al cursor | leadoff A2–A3 (titular con objeto dentro) · tabletales A1–A2 (capas en parallax) · unseen A2 (trama) |
| 3 | Hitos | Recorre en horizontal las consecuencias de un buen proyecto: idea, equipo, usuarios, valor, nombre | unseen A3–A6 |
| 4 | Productos | Ve qué se puede construir y se pregunta «¿Cuál es el tuyo?» | leadoff A2 (bloque a sangre) · tabletales A4 (piezas que llegan volando) · tabletales A3 (marco que se abre hacia la sección siguiente) |
| 5 | Cómo funciona | Entiende el proceso en 4 pasos | leadoff A4 (retícula con hilos, mucho aire) |
| 6 | Carreras | Ve que cualquier carrera aporta y qué aporta cada una | leadoff A2/A6 (bloques de color a sangre) |
| 7 | Proyectos | Gira entre las ideas postuladas y elige una para sumarse | ryan A1–A6 |
| 8 | Postulación | Se postula con idea o para sumarse | manual de marca (componentes) |
| 9 | Cierre | Pie con la convocatoria y el acceso del equipo | leadoff A6 (bloque negro) |
| — | `/equipo` | El equipo revisa, aprueba y exporta postulaciones | — (utilitario) |

## 3. Referentes y mapa de adaptación

Fichas completas en `fabrica/proyecto/referentes/` (`unseen`, `tabletales`, `leadoff`, `ryan`). La
identidad sale del manual de Creación Digital (`previo/manual-marca-v0.1.html`).

| Id | Recurso del referente | Qué hace allá | Qué hace aquí (nuestra función) | Choca con |
|---|---|---|---|---|
| unseen A1 | Precarga «[93%]» con mascota | Entretiene la carga | Cuenta hasta 100 con la gema de Algora al centro; anticipa el tono | leadoff A1 (D-1) |
| unseen A2 | Titular sobre trama de caracteres que se deforma con el cursor | Textura de marca | Trama de `$ 0 1 + =` y letras de ALGORA detrás de la pregunta; el cursor la deforma | — |
| unseen A3–A4 | Línea ondulada que se vuelve sólida al recorrerla; hitos con etiquetas `[MOTION] [JAN_25]` | Proyectos del año | Hitos `[IDEA] [EQUIPO] [USUARIOS] [VALOR] [NOMBRE]` con titular grande | — |
| unseen A5 | Mascota que viaja por la línea y se inclina con la velocidad | Personalidad | Lo que viaja por la línea (D-5) | — |
| unseen A6 | En celular la línea se apila en vertical | Lectura cómoda | D-4 | prototipo v2 (horizontal siempre) |
| tabletales A1–A2, K1 | Ilustración en capas con parallax (yPercent 14, scale 0,94) | Profundidad de la portada | Objetos 3D por código en capas a distinta velocidad, reemplazables por assets de Antigravity | sin ilustración propia |
| tabletales A3, K2 | Marco que crece como tinta hasta llenar la pantalla | Paso a la colección | Paso de «Productos» a «Cómo funciona» | — |
| tabletales A4, K4 | Piezas que vuelan a su sitio con giro | Arman la escena | Los productos (app, juego, tienda…) llegan volando a su sitio | — |
| tabletales A5 | Titulares letra por letra desde abajo | Ritmo de entrada | Titulares de sección | — |
| tabletales K3 | Tinta dorada que pinta el cursor | Detalle mágico | D-6 | encargo (no se pidió) |
| leadoff A1 | Intro negra palabra por palabra con «Skip intro» | Manifiesto de entrada | Solo cabe una entrada (D-1) | unseen A1 |
| leadoff A2–A3, K1 | Bloque de un color a sangre, titular condensado en mayúsculas, foto que crece dentro de la frase | Impacto | Portada y «Productos» en bloques del manual (cobalto, ácido, tomate, magenta) con un objeto que crece entre las palabras | tipografía (D-3) |
| leadoff A4–A5 | Retícula de columnas con hilos finos, mucho blanco; corre en horizontal | Servicios | «Cómo funciona»: 4 columnas con hilos (D-7) | dos scrolls horizontales |
| leadoff A6, K2 | Bloques negros que cortan el blanco; medidas fluidas max(min, vw) | Ritmo y aire | Cierre y separadores; todos los espacios fluidos | — |
| ryan A1–A4, K1–K2 | Hélice de tarjetas curvas que gira con el scroll de una sección fija | Portafolio | Proyectos postulados y `[EJEMPLO]`; clic → formulario con el proyecto elegido | técnica (D-2) |
| ryan A5, K3 | Zoom y deriva de la imagen al girar rápido | Sensación física | Sobre lo que lleve cada tarjeta (D-8) | — |
| ryan A6 | Título con año en superíndice | Jerarquía | Nombre de la idea con la facultad como superíndice | — |

**Arco persuasivo:** posibilidad («¿Y si esta vez sí?») → consecuencias que se imaginan (los hitos) →
lo concreto (productos) → cómo (4 pasos) → permiso (cualquier carrera) → prueba (proyectos reales) →
postularse. El mensaje se vive, no se dice; nunca se prometen ingresos.

## 4. Dirección de arte

- **Paleta (manual v0.1):** papel `#F6F8FB` · tinta `#0D0D0D` · ácido `#D1FF22` · cobalto `#2C08FF` ·
  tomate `#FF103E` · magenta `#FF3D8A`. Bloques a sangre con un solo color cada uno. Tema claro y oscuro
  intercambiables; los bloques de color son iguales en ambos.
- **Tipografía (manual v0.1):** DM Serif Text (titulares, cursiva de acento), Zalando Sans (texto),
  JetBrains Mono (etiquetas entre corchetes), Rubik Bubbles (una palabra de acento). Pendiente D-3.
- **Movimiento:** precarga ~1,5 s; titulares por línea (0,6 s power2.out); scroll horizontal con scrub;
  parallax suave; hélice ligada al scroll. Con movimiento reducido: todo visible y apilado, sin pin, la
  hélice pasa a lista.

## 5. Contenido

- Inicio: los textos de tono del `ENCARGO.md` § 2 (borrador; el autor los aprueba en el pulido).
- Cómo funciona, carreras y formulario: los del prototipo v2 como borrador.
- Proyectos `[EJEMPLO]`: `previo/sitio-vite-2026-11-09/src/ejemplos.js`.

## 6. Decisiones del autor

| Fecha | Decisión | Opciones que había |
|---|---|---|
| 2026-11-09 | Retomar este proyecto; reescribir el encargo con lo de hoy | proyecto nuevo desde el preset |
| 2026-11-09 | Inicio: posibilidad → hitos → productos | casos reales → 2027 libre; mezcla |
| 2026-11-09 | Stack: Astro del preset, adaptado (GSAP, WebGL, Supabase) | Vite del prototipo |
| 2026-11-09 | Repo `jsmmdz/convocatoria-algora`, público | otro |
| 2026-11-09 | Datos en Supabase; anillo solo con ideas aprobadas; `[EJEMPLO]` hasta tener 6 reales | Google Sheets; Netlify Forms |
| 2026-11-09 | Tema claro/oscuro intercambiable | fijo |
| 2026-11-09 | D-1 · Entrada: precarga de Unseen (contador con la mascota al centro); el titular entra después por líneas como Leadoff | intro negra de Leadoff; las dos |
| 2026-11-09 | D-2 · Hélice de proyectos: WebGL curvo como Ryan, gira con el scroll y además con flechas y teclado; tarjetas reales en el DOM | CSS 3D plano; WebGL solo scroll |
| 2026-11-09 | D-3 · Titulares XXL en DM Serif Text (manual); de Leadoff se calcan tamaño, aire y objeto dentro de la frase | sumar una condensada |
| 2026-11-09 | D-4 · Hitos: horizontal en escritorio, vertical apilado en celular (como Unseen) | horizontal siempre |
| 2026-11-09 | D-5 · **Mascota: un unicornio.** Viaja por la línea de hitos inclinándose con la velocidad y está al centro de la precarga. Asset del autor (Antigravity); silueta provisional mientras | gema; objeto por hito; nada |
| 2026-11-09 | D-6 · Sin tinta de cursor de Table Tales | tinta en ácido |
| 2026-11-09 | D-7 · Cómo funciona: 4 columnas fijas con hilos (retícula de Leadoff, sin scroll horizontal) | columnas que corren |
| 2026-11-09 | D-8 · Tarjetas de la hélice: color a sangre por facultad + tipografía; zoom y deriva sobre una trama del fondo | imagen por categoría; papel |
| 2026-11-10 | Pie en tema oscuro: la tinta se aclara un punto (90 % tinta + 10 % papel, `--pie-fondo`) para que el bloque no se funda con el fondo | borde de papel; pie de papel invertido; dejarlo igual |
| 2026-11-10 | Portada: piezas 3D que **cruzan el titular** (Table Tales A1). Una pieza de delante pasa por la parte alta de una línea sin tapar una palabra y otra va detrás de las letras. La pastilla y las etiquetas no se tocan nunca | piezas solo en las esquinas, nada encimado |
| 2026-11-10 | Portada: el titular **crece con la pantalla** por encima de 1440 (proporcional al ancho, con tope por alto en ultraanchos); las etiquetas y el aire crecen con él | tope en el tamaño de 1440 |
| 2026-11-10 | Hitos: el panel de cada hito es un **bloque de color a sangre con la palabra del hito en serif cursiva gigante** (en lugar de la imagen del proyecto de Unseen) | una pieza 3D por hito; solo texto y línea |
| 2026-11-10 | Hitos: la sección va sobre el **fondo del tema** y dos hitos **pasan a fondo invertido** (unseen A4b) | toda en tinta; un color de marca por hito |
| 2026-11-10 | Productos: las piezas que llegan volando son **fichas tipográficas** del DOM (color del manual, nombre en serif cursiva y etiqueta mono `[APP]`…), una por producto | objetos 3D por código; maquetas ilustradas en SVG |
| 2026-11-10 | Marco de tinta: **borde ácido y relleno del tema** (papel o tinta) donde vive «Cómo funciona» | todo en un color de marca; tinta/papel sin color |
| 2026-11-10 | «¿Cuál es el tuyo?»: titular XXL con un botón **Postúlate** que baja al formulario (`#postulacion`, lo construye T07) | solo la pregunta; pregunta que rota por producto |
| 2026-11-14 | Hitos (auditoría de T03, E2): el unicornio **pasa por debajo de los bloques**, como la línea; se esconde detrás de cada bloque y reaparece al otro lado (como la mascota en `unseen-05`) | que la onda esquive los bloques; dejarlo encima |
| 2026-11-14 | Hitos (auditoría de T03, E3): al inclinarse, el unicornio se desplaza **poco: 1,5 px por grado** (como mucho 2), así sigue en la unión sólida/punteada; el valor exacto se afina en el pulido | girar sobre los cascos sin desplazarse; los 8 px por grado del globo de Unseen |
| 2026-11-15 | Hitos (auditoría r4 de T03, E1): los **textos van por encima del unicornio**, como los bloques; si la onda lo sube hasta un titular, pasa por detrás de las letras | bajar la cresta de la onda; dejarlo encima hasta el pulido |
| 2026-11-15 | Hitos (auditoría r4 de T03, E2): la raya de la línea que se ve a través del unicornio (por la mezcla `difference`) **se ve en el pulido**, con la forma de la onda | taparla ya con una silueta del color del fondo |
| 2026-11-15 | Postúlate (auditoría final de T04, E4): **una sola ancla, `#postulacion`**, para la nav y para la sección de productos; el formulario de T07 lleva ese `id` | `#postulate`, la que tenía la nav desde T01 |
| 2026-11-16 | **`T05`–`T08` las construye el orquestador (Claude Fable 5.2) en una sola sesión**, sin Gemini, QA ni auditoría aparte, para dejar el prototipo de escritorio completo («usa Fable para continuar… déjame un prototipo con todas las tareas hechas»). Las decisiones de dirección de esas tareas las toma el orquestador y quedan **por confirmar** en la revisión del prototipo (filas de abajo) | el ciclo de la fábrica v5 tarea por tarea |

### Tomadas por el orquestador en `T05`–`T08` y **aceptadas por el autor el 2026-11-16**

El autor pidió el prototipo completo sin paradas, así que estas no se le preguntaron al construir. Las aceptó
todas, en bloque, el mismo día («Aceptarlas todas»). Están cerradas; si alguna no le gusta al verla, se cambia en
el pulido. El detalle está en la tarea que se cita.

| Tarea | Decisión | Lo que había |
|---|---|---|
| T05 | La entrada de «Cómo funciona» (etiqueta, titular y frase) va **dentro del panel que deja ver el marco de tinta**; las 4 columnas siguen debajo | reemplazar el panel por las columnas |
| T05 | Titular «De la idea **al mercado**, con método» | «al primer peso» del prototipo v2 (roza la regla de no prometer ingresos) |
| T05 | Carreras: **8 bandas a sangre**, una por facultad, en el orden cobalto, ácido, magenta, tomate (se repite). Ese color es el de sus tarjetas en la hélice (D-8) | rejilla de tarjetas; un solo bloque de color |
| T06 | Hélice: el **texto de la tarjeta va pintado dentro de la textura** para que se curve con ella; el botón real queda encima, transparente | texto en el DOM, como el título de Ryan (se despegaba hasta 25 px al girar) |
| T06 | Hélice: las tarjetas que vienen quedan **un escalón más abajo** y suben al girar (como `ryan-03.jpg`); el centro va un 6 % a la derecha y la cabecera abajo a la izquierda | subir hacia la derecha; cabecera arriba |
| T06 | Hélice: **la tarjeta del frente es el botón de sumarse**; una de los lados gira al frente. Sin panel de detalle aparte ni ajuste a la tarjeta más cercana | detalle y botón debajo, como el prototipo v2 |
| T07 | Formulario de **una sola pantalla con dos caminos** (el del prototipo v2) | por pasos (Vitra, Notie, No-Code: nunca elegidos) |
| T08 | Sin Supabase, el panel se puede **recorrer con datos `[EJEMPLO]`** en memoria | solo el aviso «falta conectar» |

## 7. Responsive

Medición `R0` del 2026-11-16 y detalle en `fabrica/proyecto/tareas/R1-responsive.md`. A 1440 px nada cambia.

| Id | Fecha | Decisión | Quién | Opciones que había |
|---|---|---|---|---|
| R-1 | 2026-11-16 | Hitos en celular: **línea vertical con el unicornio** que baja por ella y se vuelve sólida al recorrerla (como Unseen a 390) | autor | dejarlos apilados sin línea ni mascota |
| R-2 | 2026-11-16 | Proyectos en celular: **carrusel horizontal deslizable** con ajuste a cada tarjeta, contador y flechas (desde X-10, queda como caída de la hélice táctil) | autor | lista vertical; hélice vertical en CSS 3D |
| R-3 | 2026-11-16 | ~~Productos en celular: rejilla quieta de dos columnas, sin vuelo ni marco de tinta~~ **Reemplazada por X-9 (2026-11-21)** | orquestador | marco sin pin |
| R-4 | 2026-11-16 | Portada en celular: las piezas 3D **se quedan como en escritorio** (una cruza el titular y otra va detrás de las letras: decisión del autor del 2026-11-10, que vale a cualquier ancho). El intento de quitar el cruce en angosto se devolvió: contradecía esa decisión y su prueba de T02 | orquestador | quitar el cruce en angosto; quitarlas |
| R-5 | 2026-11-16 | Formulario: los dos caminos apilados por debajo de 480 px | orquestador | dos columnas |
| R-6 | 2026-11-16 | Las etiquetas mono de 12 px se quedan (rótulos del manual); los párrafos, mínimo 16 px | orquestador | subir todo a 16 px |
| R-7 | 2026-11-16 | El modo de escritorio (pin, hélice, vuelo) pide ≥ 1024 px **y puntero fino**: las tabletas usan el modo de celular | orquestador | cortar solo por ancho |

Las R-3 a R-7 son del orquestador, conservadoras, para que la última sesión no pare; el autor las ve en el visto
bueno final.

## 8. Publicación del MVP

| Fecha | Decisión | Opciones que había |
|---|---|---|
| 2026-11-16 | El MVP **se publica en modo demostración** (los `[EJEMPLO]` y el aviso de que el formulario no guarda). Supabase se conecta después con los secrets del repo, sin tocar código | publicar con Supabase real; no publicar todavía |
| 2026-11-16 | `R1` y `T09` las construye el orquestador (Claude Fable) en **una última sesión**, sin el ciclo Gemini/QA/auditoría | el ciclo de la fábrica v5 |

## 9. Experiencia reducida (2026-11-21)

El autor pidió «una experiencia un poco más reducida y al punto, más que todo en celulares», sin perder lo que hay.
La versión completa queda en la etiqueta **`v1-completa`** y la rama **`version-completa`** de GitHub; los
componentes que salen del recorrido se quedan en el código, sin usarse. Medido sobre el sitio publicado: **18,4
pantallas en celular (390) y 22,3 en escritorio (1440)**. La meta es ~12 en celular y ~16 en escritorio. Se
construye en `R2`.

| Id | Decisión | Opciones que había |
|---|---|---|
| X-1 | Recorte **en las dos versiones, de distinto grado**: fuerte en celular y leve en escritorio | solo celular; todo igual |
| X-2 | **Tres hitos: Idea, Equipo y Nombre** (salen Usuarios y Valor), en escritorio y en celular. Etiquetas `[01/03]`…`[03/03]` | Idea · Usuarios · Nombre; Idea · Equipo · Usuarios; dejar los 5 en celular |
| X-3 | Hitos en escritorio: **el mismo efecto** (línea, unicornio, bloques, pin horizontal) con 3 hitos, y el recorrido se acorta en proporción (de 7,4 a ~4,5 pantallas) | mismo efecto más corto con 5; dejarlo igual |
| X-4 | Hitos en celular: **carrusel deslizable**, un hito por tarjeta, como el de proyectos (R-2). Reemplaza la línea vertical con el unicornio de R-1 (~0,8 pantallas en lugar de 4,6) | una pantalla compacta; quitarlos |
| X-5 | Carreras: **rejilla de bloques** con los mismos 8 colores, facultad y una línea de lo que aporta: 2 columnas en celular y 4 × 2 en escritorio (de 3,1 a ~1 en celular y de 2,7 a ~1 en escritorio) | fichas de nombre; acordeón |
| X-6 | Formulario en celular: **plegar lo opcional**. A la vista quedan nombre, correo, facultad, programa y lo esencial del camino (idea: nombre y regla; sumarme: proyecto y habilidades). El resto va en «Agregar más detalles», cerrado. No se pierde ningún dato ni cambia Supabase; en escritorio el formulario sigue igual | quitar campos en celular; por pasos |

**Interactividad en celular (autor, 2026-11-21).** Al ver la propuesta, el autor dijo: «me preocupa que se perdió
mucho la interactividad en mobile». Era cierto ya en el MVP: la trama y las piezas no reaccionan al dedo, los
productos son una rejilla quieta (R-3) y la hélice es un carrusel plano. Con R2, además, se iba el unicornio. La
regla: **corto no es quieto**. Cada efecto responde al dedo o al scroll natural, sin pin y sin alargar la página.
Se construye en `R3`.

| Id | Decisión | Opciones que había |
|---|---|---|
| X-7 | Carrusel de hitos con **línea ondulada horizontal bajo las tarjetas** que se vuelve sólida al deslizar y **el unicornio que la recorre** inclinándose con la velocidad del dedo (misma fórmula de T03) | carrusel sin mascota |
| X-8 | Portada en táctil: **la trama se deforma donde tocas o arrastras** y las piezas 3D se mueven con el scroll (parallax). Sin giroscopio | quieta en táctil |
| X-9 | Productos en táctil: **las fichas llegan volando con giro** a la rejilla al entrar en pantalla, sin pin, y **el marco de tinta se abre corto** hacia «Cómo funciona». Reemplaza R-3 | rejilla quieta (R-3) |
| X-10 | Proyectos en táctil: **la hélice curva en WebGL movida por el dedo**, con las tarjetas reales en el DOM. Si un celular de gama media no la sostiene (presupuesto de R3), cae al carrusel plano de R-2 | carrusel plano (R-2) |
| X-11 | Carreras: **cada bloque se abre al tocarlo** (crece en su color y muestra lo que aporta), uno abierto a la vez, accesible con teclado | entrada escalonada; quieta |
