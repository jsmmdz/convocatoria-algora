---
id: T10
agente: "@orquestador"
fase: 4
depende: [T09]
tipo: contenido
requiere:
  - ENCARGO.md
  - docs/1-PRODUCTO.md
  - previo/ESTRATEGIA_360.md
rutas: ["/", "/equipo/"]
archivos:
  - sitio/src/**
  - sitio/public/**
  - sitio/tests/**
  - LEEME.md
regresion: [T01, T02, T03, T05, T06, T07, T08, R1, T09]
bloqueantes:
  - "El autor entrega o aprueba los textos (bloques A–H) y, si los tiene, los assets (bloque I)."
---

# `T10` · Textos y contenido definitivos

> Fase 4 · Buzón: `fabrica/buzon/T10/` · Escrita el 2026-11-16 por pedido del autor («deja un plan para dejar los
> textos y contenido definitivo, lo haré después»). **No está empezada.** El sitio publicado
> (https://jsmmdz.github.io/convocatoria-algora/) lleva los textos de `ENCARGO.md` § 2 en el inicio y los del
> prototipo v2 en lo demás, que el autor llamó borrador («va por ahí, hay que ajustar cosas»).

## Cómo se trabaja (tres pasos)

1. **El autor decide por bloques (A–H).** Cada bloque de abajo dice qué texto hay hoy y dónde vive. El autor
   responde bloque por bloque: «queda», o el texto nuevo. Puede hacerlo en el chat o editando este archivo
   (columna «Definitivo»). Lo que no responda se queda como está: **no se inventa** (regla 4.5).
2. **El orquestador aplica** cada texto en su archivo, actualiza la prueba que lo fija (columna «Prueba») y mira
   la captura de esa sección a 390 y 1440: un texto más largo puede partir un titular o desbordar una tarjeta.
3. **Compuertas completas, commit y push.** El push republica solo. Visto bueno del autor sobre el sitio publicado.

## Reglas que todo texto cumple

- **No prometer ingresos** (`ENCARGO.md` § 6): se habla de proyectos rentables e investigación, nunca de «gana plata».
- **Tono** (`ENCARGO.md` § 1): retador y de alto impacto, «¿tienes una idea millonaria?» sin decirlo literal.
- Español de Colombia con tuteo; sin voseo (lo revisa una compuerta).
- **Ley 1581:** el texto de la autorización (bloque G) no se suaviza ni se esconde.
- Nombres de personas, correos y cifras reales solo si el autor los da. Lo que falte lleva marcador visible
  (`[EJEMPLO]`, `[FECHA]`).

## Bloque A · Lo que se ve fuera del sitio (buscadores y redes)

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Título de la pestaña | «Convocatoria Algora» | `sitio/src/layouts/Base.astro:19` | T09 (solo mide que exista) |
| Descripción | «Convocatoria del semillero Algora (Creación Digital, Universidad El Bosque) para estudiantes de cualquier carrera.» | `Base.astro:20` | T09 (≥ 30 caracteres) |
| Imagen al compartir | Captura de la portada, 1200 × 630 | `sitio/public/og.jpg` | T09 (que responda) |
| Favicon | Gema con los colores de la marca | `sitio/public/favicon.svg` | T09 |

Es lo primero que ve quien recibe el enlace por WhatsApp o escanea el QR del afiche: conviene que diga para
quién es y qué hacer. Si cambia el titular de la portada, `og.jpg` se regenera con
`fabrica/buzon/T09/tmp/d-og.mjs` (temporal; si ya no está, es una captura de la portada a 1200 × 630).

## Bloque B · Portada e hitos (aprobados como borrador el 2026-11-01)

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Etiquetas | `[SEMILLERO ALGORA] [CREACIÓN DIGITAL] [CONVOCATORIA_27]` | `components/Portada.astro:9` | — |
| Titular | «¿Y si esta vez sí lo haces realidad?» | `Portada.astro:11` | T02 (parte el titular en líneas y mide el cruce de las piezas: un titular de otro largo obliga a revisar esa prueba) |
| Hitos (5) | `[IDEA]` Deja de vivir en tu libreta. · `[EQUIPO]` Alguien de otra carrera la entiende mejor que tú. · `[USUARIOS]` Gente que no conoces la usa sin que se lo pidas. · `[VALOR]` Alguien paga por algo que tú hiciste. · `[NOMBRE]` Te buscan por lo que construiste. | `components/Hitos.astro:5` | T03 (lista `HITOS` al principio del archivo) |

**Por decidir:** ¿`CONVOCATORIA_27` es el nombre real de esta convocatoria (año 2027)? ¿Los cinco hitos quedan?

## Bloque C · Productos

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Siete fichas | Una app · Un juego · Una tienda · Una herramienta con IA · Una plataforma · Un servicio · Un medio | `components/Productos.astro:3` | — (T04 no tiene pruebas) |
| Pregunta | «¿Cuál es el tuyo?» + botón «Postúlate» | `Productos.astro:17` | — |

El número de fichas (7) está atado a las posiciones del vuelo: cambiar el texto es libre, cambiar la cantidad no.

## Bloque D · Cómo funciona (borrador del prototipo v2)

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Titular | «De la idea al mercado, *con método*.» | `Productos.astro:36` | T05 |
| Frase | «Estudiamos la rentabilidad como objeto de investigación: cada proyecto se prueba en el mercado y deja datos, aprendizajes y un informe.» | `Productos.astro:37` | — |
| Paso 1 | **Postula** · Envía tu idea en una frase o inscríbete para sumarte a un equipo con lo que sabes hacer. · `[SALE]` Banco de ideas y talentos | `components/ComoFunciona.astro:5` | T05 (los cuatro títulos) |
| Paso 2 | **Arma equipo** · Cruzamos ideas con perfiles de distintas carreras. Cada equipo mezcla técnica, negocio y diseño. · `[SALE]` Equipos de 3 a 5 personas | ídem | T05 |
| Paso 3 | **Prototipa y prueba** · Sprints cortos para lanzar una versión mínima y medir si la gente participa y paga. · `[SALE]` Prototipo en línea y métricas | ídem | T05 |
| Paso 4 | **Presenta** · Demo day con resultados reales y un informe que documenta qué funcionó y por qué. · `[SALE]` Demo, informe y portafolio | ídem | T05 |

**Por decidir (son hechos de la convocatoria, no redacción):** ¿los equipos son de 3 a 5? ¿Hay demo day? ¿Cuánto
dura cada paso y cuándo es cada uno? Si hay fechas, este es el bloque donde van.

## Bloque E · Carreras (borrador del prototipo v2)

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Titular y frase | «No hace falta *saber programar*.» · «Un proyecto rentable necesita mucho más que código. Esto es lo que cada área le aporta a un equipo de Algora.» | `components/Carreras.astro:9-10` | — |
| Ocho facultades y su aporte | Ingeniería · Ciencias Económicas y Administrativas · Creación y Comunicación · Psicología · Ciencias Jurídicas y Políticas · Ciencias de la Salud · Educación · Ciencias, cada una con una frase | `sitio/src/datos/facultades.ts:13` | T05 (lista `FACULTADES`) |

**Por decidir:** ¿son esos los nombres oficiales de las facultades de El Bosque y están todas? Esta lista
alimenta también el desplegable del formulario y el color de las tarjetas: se cambia en un solo lugar. El número
de facultades sí puede cambiar (los colores se repiten cada cuatro; hay tokens para ocho).

## Bloque F · Proyectos de la hélice

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Titular y frase | «Gira y *súmate*.» · «Ideas postuladas que buscan equipo. Elige una y pide tu puesto. Las marcadas [EJEMPLO] muestran cómo se verán mientras llegan las primeras.» | `components/Proyectos.astro:16-17` | — |
| Ocho proyectos `[EJEMPLO]` | La Silla del Mes · Pixel Bosque · Racha de Estudio · Turno Express · Receta Única · Profe Invitado · Cláusula Clara · Pronóstico U (idea, regla, modelo, facultad, perfiles) | `sitio/src/datos/ejemplos.ts:18` | T06 (lista `IDEAS`), T08 (dos de ellos en el panel de ejemplo), R1 |

**Por decidir:** ¿los ejemplos quedan como están? Varios son de apuestas o pujas («tu apuesta va a la vaca»,
«el más cercano se lleva el pozo»): revisar si ese es el tono que la universidad quiere en una página pública.
Con Supabase conectado y seis ideas reales aprobadas, los ejemplos dejan de salir solos.

## Bloque G · Postulación (borrador del prototipo v2)

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Titular y texto lateral | «Reclama tu *puesto*.» · «Toma unos cinco minutos. Te escribimos al correo para armar los equipos.» · tres notas (con idea, sin idea, privacidad) | `components/Postulacion.astro:11-16` | — |
| Rótulos, ejemplos y ayudas de los campos | 9 `placeholder` y los `label` | `Postulacion.astro` | T07 (usa «Quiero sumarme» y «Tengo una idea») |
| Listas | Perfiles que faltan (6), habilidades (8), modelos de ingreso (7) | `datos/facultades.ts:32-34` | T06 y T07 (usan «Desarrollo», «Diseño», «Legal»…) |
| Mensajes de validación y de éxito | Los de cada camino, el de éxito y el de modo demostración | `sitio/src/lib/postulacion.ts` y `lib/datos.ts` | T07 (los cita textuales) |
| Autorización Ley 1581 | «Autorizo el tratamiento de mis datos personales para fines de esta convocatoria, según la Ley 1581 de 2012.» | `Postulacion.astro` | T07 |

**Por decidir (hechos, no redacción):**
- ¿El correo debe ser institucional (`@unbosque.edu.co`)? Hoy acepta cualquier correo bien formado.
- ¿La autorización necesita enlazar la política de tratamiento de datos de la universidad y nombrar al
  responsable? Conviene confirmarlo con quien corresponda en El Bosque antes de recibir datos reales.
- ¿Qué pasa después de postularse y en cuánto tiempo? El mensaje de éxito solo dice «te escribiremos».

## Bloque H · Pie, panel y página 404

| Qué | Hoy | Dónde | Prueba |
|---|---|---|---|
| Frase de cierre | «¿Y si esta vez sí?» (del autor, 2026-11-16) | `components/Pie.astro:5` | — |
| Línea y estado | «Semillero Algora · Creación Digital · Universidad El Bosque» · «Convocatoria abierta · fechas por confirmar» | `Pie.astro:13-14` | T01 («Semillero Algora», «Universidad El Bosque») y T09 («fechas por confirmar») |
| Panel del equipo | Rótulos y avisos | `sitio/src/pages/equipo.astro`, `lib/equipo.ts` | T08 |
| 404 | «Esta página no existe» · «Volver al inicio» | `sitio/src/pages/404.astro` | — |

**Por decidir:** las **fechas** (apertura, cierre, resultados). Mientras no haya, sigue «fechas por confirmar»;
cuando haya, van aquí y en el bloque D. ¿Hay un contacto público del semillero (correo, redes) para el pie?

## Bloque I · Assets del autor (no son texto)

| Qué | Hoy | Dónde entra | Formato |
|---|---|---|---|
| Unicornio (mascota) | Silueta provisional por código | `components/Mascota.astro` (precarga, portada, hitos) y el favicon | `.glb`, o PNG/WebP con transparencia; mismo punto de apoyo (`docs/2-TECNICO.md` § 7) |
| Objetos 3D de la portada | Formas por código | función `pieza()` de `lib/capas3d.ts` | `.glb` < 400 KB cada uno |
| Logo «algora» | Texto en Rubik Bubbles | `components/Nav.astro` | SVG, si el semillero tiene uno |

## Lo que NO es de esta tarea

- Conectar Supabase (pasos en `LEEME.md`): se puede hacer antes o después; no depende de los textos.
- Cambios de diseño o de mecánica. Si un texto definitivo no cabe en su sección, se le pregunta al autor si se
  acorta el texto o se ajusta la sección; no se decide solo.

## Cuándo terminaste

- Cada bloque con su respuesta del autor aplicada (o «queda»), anotada en `fabrica/buzon/T10/NOTAS.md`.
- Ningún marcador `[…]` de contenido pendiente en el sitio, salvo los `[EJEMPLO]` de la hélice.
- Las pruebas que citan textos, actualizadas; `node fabrica/scripts/compuertas.mjs T10 --completas` en verde.
- Capturas de cada sección tocada miradas a 390 y 1440. Publicado y con el visto bueno del autor.
