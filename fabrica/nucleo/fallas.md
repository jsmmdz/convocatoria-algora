# Fallas ya pagadas — catálogo F1–F22

Lo que se escapó al construir webs con esta fábrica, agrupado por la fase en la que se previene. Cada
falla tiene su contramedida ya puesta en un rol, una regla, una compuerta o una prueba. **Si una falla
se repite después de su contramedida, la contramedida no sirvió:** se anota aquí con la evidencia
(tarea, ronda, archivo) y se corrige el proceso, no el modelo.

## Al capturar el referente

| Falla | Qué pasa | Cómo se evita |
|---|---|---|
| Resumir el referente a la manera propia | La tarea describe el referente de memoria («un plano que se arrastra») y el sitio real era otra cosa; no había ni una imagen del referente en el repo | Capturas y grabaciones fechadas; la ficha cita cuadros, no impresiones |
| WebGL negro en la captura | Playwright dibuja por software (SwiftShader) sin GPU | Chromium con `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist` (Windows); si aun así sale negro, cuadros del video |
| Estados del preloader que no salen | Con el sitio en caché la carga corre más rápido y se salta estados | Capturar en la primera visita (contexto nuevo) y comparar antes de reemplazar |
| El sitio cambió | Los referentes se rediseñan | Capturas fechadas y con los mismos pasos siempre (`referentes.mjs`) |
| `WebFetch` devuelve 429 | El sitio bloquea la petición | Navegador integrado (`get_page_text` + captura); no reintentar |
| Copiar código del bundle | Licencia y dependencias ajenas | Bundles solo al scratchpad; la ficha describe la técnica con fórmulas y constantes propias |
| Subir capturas ajenas a un repo público | Son de otros sitios | `referentes/capturas/` va en `.gitignore`; se quedan en el computador |
| Verificación anti-bots (Cloudflare) | El navegador automático recibe un «Verify you are human» y no el sitio | Capturar en el navegador integrado, donde el sitio carga normal. **El captcha nunca se resuelve** |
| Dominio del referente cambió de dueño | Un enlace viejo de Awwwards redirige a un sitio sin relación (pasó con una tabla periódica interactiva) | Verificar en vivo cada candidato antes de presentarlo; si redirige a otra cosa, se descarta sin interactuar |
| El autor no puede juzgar un referente por una frase | Descripciones en texto no bastan para elegir interacciones | Una hoja por candidato con 3–4 estados de su interacción, enlace y «qué mirar» |

## Al especificar (las que nacen del orquestador)

La mayoría de los defectos nacen en las pruebas del orquestador, no en el constructor.

| Código | Falla | Contramedida |
|---|---|---|
| F11 | La especificación mide el mecanismo, no el resultado (pide `opacity` y sale un contraste de 1,97:1) | Especificar el resultado medible |
| F13 | La prueba mide un punto de un rango (bien a 1440 px, roto entre 1025 y 1300) | Medir los bordes del rango |
| F15 | La prueba mide estructura, no percepción (`z-index`, `toBeVisible()`) | Píxeles y contraste |
| F16 | La prueba exige algo de una tarea futura; el agente lo inyecta donde no va, o gasta rondas en una prueba que no puede editar | La prueba vive en la tarea dueña; corte temprano del workflow |
| F18 | Pruebas que comparten estado corren en paralelo (31 fallos falsos con dos suites a la vez) | En orden; turno de pruebas |
| F19 | Pruebas tan lentas que se cortan y el agente las persigue (millones de tokens perdidos) | Medir cuánto tardan antes de entregar; capturas en base64 |
| F20 | Pruebas de tiempos que fallan al azar bajo carga | Menos procesos; WebGL en GPU; medir constantes (τ) y no duraciones |
| F21 | La prueba mide un instante de una animación que no controla | Serie de capturas; esperar `data-listo`; medir la región que cambia |
| F22 | `?? 0` convierte «todavía no pasó» en «terminó a los 0 ms» | Lo ausente es `Infinity` |
| — | Decisiones repartidas en muchos documentos que se contradicen | Tres documentos (`docs/1-2-3`); nada se decide fuera de ellos |

## Al construir

| Código | Falla | Contramedida |
|---|---|---|
| F1 | Dato inventado (cifras, medidas, textos que nadie dio) | Toda cifra con fuente; texto inventado con `[EJEMPLO]` y en PENDIENTES |
| F2/F3 | Conclusión escrita a mano en un instrumento; «calculado» sin cálculo | El veredicto lo produce el script |
| F4 | Cifra correcta, función rota (fuente con el peso bien y sin puntuación; shader aprobado leyendo y que nunca compiló) | Probar la función, no solo la métrica; mirar la captura |
| F6 | Violación de algo cerrado por un agregado «inofensivo» (un hex fuera de la paleta) | Compuerta de hex sueltos / tokens |
| F8 | Estado sin salida (navegación bloqueada si un video no dispara `ended`) | Toda espera tiene un respaldo por tiempo |
| F17 | El agente rodea la restricción (hex partidos en `'#' + '1C3F94'`, excepciones para pasar una prueba) | Regla explícita: si la prueba contradice el producto, se reporta; el hook niega |
| F10 | El agente termina su turno esperando un proceso en segundo plano | Comandos largos en primer plano |

## Al revisar

| Código | Falla | Contramedida |
|---|---|---|
| F5 | Dato medido que nadie cruza con su uso (2,62:1 impreso y el foco usa ese color) | Cruzar cada medida con dónde se usa |
| F7 | Entidad inventada (un agente o comando que no existe) | Verificar cada nombre citado |
| F9 | Defecto invisible a todo revisor humano o modelo (`progressbar` sin nombre); solo lo vio axe | axe en cada ruta (prueba común) |
| F12 | Estado animado sin medir (hover a 2,19:1) | Medir hover y estado final |
| F14 | El revisor describe el criterio, no la captura | «Lo que veo» se escribe antes de leer los aspectos |
| — | El mismo modelo construye y revisa: comparte puntos ciegos | QA con contexto limpio y auditoría final con otro modelo |

## Al publicar

| Falla | Qué pasa | Cómo se evita |
|---|---|---|
| Se ve bien en local y no publicada | GitHub Pages sirve el sitio bajo `/<repo>/`; las rutas escritas desde la raíz se rompen | Todo pasa por `import.meta.env.BASE_URL` (compuerta `ruta-sin-base`); el despliegue fija `SITIO_BASE` |
| Margen blanco alrededor | El navegador pone 8 px de margen al `body` | `body{margin:0}` explícito siempre |
| Clases genéricas que chocan | `.tag` de una sección hereda el estilo de otra definida más abajo | Prefijo por sección y mirar la captura tras cada sección nueva |
| Formularios que nadie recibe | Una página estática no guarda datos | El destino de los datos se decide en `docs/2-TECNICO.md` antes de construir el formulario |

## Sobre el proceso

- **El autor como bus de mensajes** es el costo más grande: el ciclo fijo lo corre un workflow, no una persona.
- **El paralelo no acelera lo lento:** el cuello de botella es la revisión del autor. Tareas en serie.
- **`status: SUCCESS` no significa tarea hecha:** se verifica con compuertas y pruebas, nunca con lo que
  reporta el agente.
- **El gusto no tiene compuerta:** el visto bueno del autor es un estado obligatorio.
