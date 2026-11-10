# Encargo

> **Lo único que llenas tú.** Instrucciones claras y referentes; el resto lo saca la fábrica
> (`fabrica/nucleo/roles/orquestador.md` § 0). Lo marcado con ★ es obligatorio: sin eso no se arranca.
> Lo que dejes en blanco se te pregunta en un solo bloque de decisiones, no se inventa.
> Llenado desde el chat con el autor el 2026-10-30; **reescrito el 2026-11-09** al retomar con manual de
> marca, referentes nuevos y Supabase. Lo que salió está en § 7 (historial), para no volver a proponerlo.

## 1. La web

- ★ **Qué es:** la convocatoria del semillero **Algora** (Creación Digital, Universidad El Bosque) para
  construir proyectos digitales rentables con investigación, abierta a todas las carreras.
- ★ **La única tarea del visitante:** **postularse**, con su idea o para sumarse a un proyecto que ya existe.
- **Para quién:** estudiantes de todas las facultades de El Bosque. Llegan por QR de afiches, redes y
  charlas en clase (estrategia 360 en `previo/ESTRATEGIA_360.md`).
- **Tono:** retador y de alto impacto, «¿tienes una idea millonaria?» sin decirlo literal.
- **Fecha de lanzamiento:** todavía no hay. La web dice «fechas por confirmar».
- **Pedido del autor (2026-11-09):** «copiar y dejar todo lo más pulido posible»: se calca cada referente
  analizando su código original, con el flujo completo de la fábrica.

## 2. Contenido

- **Recorrido del inicio (aprobado el 2026-11-01, confirmado el 2026-11-09):** la posibilidad → las
  consecuencias de un buen proyecto (hitos) → ejemplos de productos → «¿Cuál es el tuyo?» → postúlate.
  Textos de tono (borrador, el autor los aprueba en el pulido):
  - **La posibilidad:** «¿Y si esta vez sí lo haces realidad?»
  - **Los hitos:** `[IDEA]` Deja de vivir en tu libreta · `[EQUIPO]` Alguien de otra carrera la entiende
    mejor que tú · `[USUARIOS]` Gente que no conoces la usa sin que se lo pidas · `[VALOR]` Alguien paga por
    algo que tú hiciste · `[NOMBRE]` Te buscan por lo que construiste.
  - **Lo que se puede hacer:** una app · un juego · una tienda · una herramienta con IA · una plataforma ·
    un servicio · un medio. «¿Cuál es el tuyo?» → Postúlate.
- **Lo demás** (cómo funciona en 4 pasos, qué aporta cada carrera, formulario): los textos del prototipo
  v2 (`previo/prototipo-v2-2026-11-09.html`) sirven de **borrador**; el autor dijo que hay que ajustar
  cosas pero «va por ahí».
- **Formulario:** dos caminos, «Tengo una idea» (nombre, regla en una frase, cómo genera dinero, quién
  pagaría, perfiles que faltan) o «Quiero sumarme» (proyecto, habilidades, horas, portafolio, motivación).
  Datos comunes: nombre, correo institucional, facultad, programa y semestre. Autorización Ley 1581.
- **Datos:** las postulaciones llegan a **Supabase** (decidido el 2026-11-09). Los estudiantes no tienen
  cuenta; el equipo entra a un panel con usuario y contraseña. Esquema y reglas ya probados en el
  prototipo: `previo/sitio-vite-2026-11-09/supabase/esquema.sql`.
- **Proyectos en el anillo:** solo idea, regla, modelo, facultad y perfiles faltantes, **nunca nombre ni
  correo**, y solo las ideas que el equipo aprobó. Mientras haya pocas, se completan con proyectos
  marcados `[EJEMPLO]` (decidido el 2026-11-09).

## 3. Referentes ★

### Referente 1 · Creación Digital
- ★ **Enlace:** https://creaciondigital-ueb.netlify.app/
- ★ **Qué se toma:** **todo el manual de marca**: colores, tipografías, bordes de tinta, sombras duras,
  componentes. Manual v0.1 ya hecho: `previo/manual-marca-v0.1.html`.
- **Para qué:** la identidad de toda la web.

### Referente 2 · 2025.unseen.co
- ★ **Enlace:** https://2025.unseen.co/
- ★ **Qué se toma:** **el inicio, la introducción a la página y el scroll horizontal dinámico** (la línea
  de tiempo y su interactividad).
- **Para qué:** contar el recorrido del inicio (§ 2): la posibilidad y los hitos.

### Referente 3 · Table Tales
- ★ **Enlace:** https://tabletales.crz.studio/
- ★ **Qué se toma:** **la integración sutil de 3D y los efectos parallax.**
- **Para qué:** profundidad en la portada y en las transiciones entre secciones. Los objetos 3D se hacen
  por código mientras el autor genera assets simples aparte (Antigravity); deben poder reemplazarse.

### Referente 4 · Leadoff
- ★ **Enlace:** https://www.leadoff.fr/
- ★ **Qué se toma:** **la estética colorida o desbordada y la diagramación espaciada.**
- **Para qué:** el tono visual de las secciones: bloques de color a sangre, titulares enormes, aire.

### Referente 5 · Ryan Strzok
- ★ **Enlace:** https://ryanstrzok.com/
- ★ **Qué se toma:** **el menú giratorio.**
- **Para qué:** ver los **proyectos postulados o disponibles para sumarse**; desde una tarjeta se llega
  al formulario con el proyecto ya elegido.

## 4. Identidad

- **Manual de marca:** el de Creación Digital (referente 1), en `previo/manual-marca-v0.1.html`.
- **Tema:** claro y oscuro **intercambiables** (botón), con los bloques de color de la marca iguales en
  ambos (decidido el 2026-11-09).

## 5. Publicación

- **Repo:** `jsmmdz/convocatoria-algora`, **público** → https://jsmmdz.github.io/convocatoria-algora/
- **Stack:** Astro, el del preset, adaptado a este proyecto (GSAP, Three.js, Supabase) (2026-11-09).
- **Dominio propio:** no.

## 6. Restricciones

- **No prometer ingresos:** se habla de proyectos rentables e investigación, nunca de «gana plata».
- **Ley 1581 de 2012:** autorización expresa para tratar datos personales antes de enviar la postulación.
- **Datos personales:** nombre y correo solo los ve el equipo.
- **Material que no se toca ni se sube:** `previo/` no se sube hasta que se decida qué se queda.

## 7. Historial (lo que salió, para no volver a proponerlo)

- **2026-10-31:** salen outbid.lol, Banner Trainee Game, Notie como muro y The Million Dollar Homepage.
- **2026-11-01:** segunda ronda descartada: Infinite Craft, RéciTAC, Digital Fans (carreras); Before I Die,
  The Unsent Project (muro).
- **2026-11-09:** el «muro de ideas» pasa a ser el **anillo de proyectos** (Ryan Strzok). Google Sheets
  sale: los datos van a Supabase. La identidad ya no sale de los referentes: hay manual.
- **Formulario:** los candidatos de octubre (Vitra, Notie por pasos, No-Code Community) nunca se eligieron;
  el prototipo v2 usa un formulario de una sola pantalla con dos caminos.
