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
