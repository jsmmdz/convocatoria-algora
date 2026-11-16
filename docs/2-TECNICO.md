# 2 · Técnico — cómo se construye

> Fuente de verdad. La escribe el orquestador en el arranque y se cierra con el autor antes de `T01`.
> Escrito el 2026-11-09 (stack decidido por el autor: «el de Astro, adaptado a este proyecto»).

## 1. Stack

- **Astro** (salida estática) en `sitio/`, TypeScript estricto, CSS propio con tokens. Sin framework de
  componentes. Pruebas con Playwright + axe.
- **Librerías permitidas** (npm, versión fija en `package-lock.json`):
  - `gsap` (ScrollTrigger, SplitText): todo el movimiento ligado al scroll y las entradas. Unseen y
    Leadoff usan GSAP; Table Tales también.
  - `lenis`: scroll suave, como Unseen y Table Tales. Se apaga con movimiento reducido y se conecta al
    `ScrollTrigger.update` de GSAP.
  - `ogl`: WebGL de la hélice de proyectos (la misma librería que usa Ryan Strzok) y de la trama y el
    marco de tinta.
  - `three`: solo para los objetos 3D de la portada y el unicornio si llega como `.glb`; se carga
    diferido (import dinámico) para no pesar en la primera pintura.
  - `@supabase/supabase-js`: postulaciones y proyectos públicos. Se carga diferida (import dinámico en
    `lib/datos.ts`) y solo si están las variables: en modo demostración no entra al JS que carga la página.
- **Prohibidas:** jQuery, frameworks de componentes (React, Vue, Svelte), Barba/Taxi (es una sola página),
  cualquier CDN en tiempo de ejecución (todo sale del build), fuentes que no estén en el manual.
- **Por qué dos librerías WebGL:** OGL es mínima y calza con shaders propios (hélice, trama, tinta); Three
  da cargadores de modelos (`GLTFLoader`) para los assets de Antigravity. Si el peso no cabe en el
  presupuesto (§ 6), se pasa todo a OGL y Three sale.

## 2. Contratos que toda tarea respeta

- **`data-listo` en `<html>`:** se pone cuando termina la precarga y la entrada del titular. Respaldo por
  tiempo de 3,5 s (CSS y JS) por si algo falla (`F8`).
- **Tokens:** todo color, tamaño, espacio, capa, duración y curva vive en `sitio/src/styles/tokens.css`.
  Fuera de ese archivo no hay hex (compuerta `hex-suelto`). En los shaders, los colores entran como
  uniformes leídos de los tokens (`getComputedStyle`), no como literales.
- **Tema:** `data-theme="light|dark"` en `<html>` lo pone el botón; sin atributo manda
  `prefers-color-scheme`. Los bloques de marca (cobalto, ácido, tomate, magenta, noche) son iguales en
  ambos temas. Preferencia guardada en `localStorage` con `try/catch`.
- **Rutas con base:** todo enlace interno y asset pasa por `import.meta.env.BASE_URL` (compuerta
  `ruta-sin-base`).
- **`body{margin:0}`** explícito y foco visible con contraste ≥ 3:1 (prueba común).
- **Movimiento reducido:** contenido completo sin animación: sin precarga, sin pin, hitos apilados, hélice
  como lista de tarjetas, sin Lenis.
- **WebGL con respaldo:** toda escena WebGL tiene un equivalente en el DOM que se ve si WebGL falla o el
  contexto se pierde (la hélice deja sus tarjetas reales; la portada deja su titular completo).
- **Accesibilidad de la hélice:** las tarjetas son botones reales en el DOM con su texto; el canvas es
  `aria-hidden` y `pointer-events:none`. Flechas izquierda/derecha giran, Enter elige. Con WebGL montado el
  texto se pinta además dentro de la textura (para que se curve) y el del botón queda transparente
  (`data-gl-texto`): nunca se quita del DOM.
- **Eventos entre secciones:** `algora:sumarse` (`detail: { idea, faltan }`) desde la hélice al
  formulario; `algora:reclamar` (`detail: { regla }`) si una sección lleva texto al formulario.

## 3. Comandos (desde `sitio/`)

- `npm run dev` (puerto 4321) · `npm run build` · `npm run check` (0 errores, 0 avisos, 0 sugerencias).
- Desde la raíz: `node fabrica/scripts/compuertas.mjs <ID>` y `node fabrica/scripts/capturas.mjs <ID>`.

## 4. Publicación

- GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`): cada push a `main` construye `sitio/`.
  `SITIO_BASE` y `SITIO_URL` salen solos del repo.
- **Variables de Supabase en el build:** `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` como secrets
  del repo, pasadas al paso de build. El orquestador ajusta el workflow en la preparación de `T01`.
- Repo: `jsmmdz/convocatoria-algora` (público) · URL: https://jsmmdz.github.io/convocatoria-algora/

## 5. Datos

- **Supabase.** Esquema y reglas: `sitio/supabase/esquema.sql`, que parte del ya probado en
  `previo/sitio-vite-2026-11-09/supabase/esquema.sql`:
  - `postulaciones`: cualquiera inserta (anon), nadie lee salvo el equipo; checks de longitud y formato.
  - `equipo`: quién entra al panel.
  - `proyectos_publicos()`: función `security definer` que devuelve solo idea, regla, modelo, facultad,
    perfiles faltantes y si el equipo está completo, **solo de ideas aprobadas**.
- **Sin variables de entorno** (desarrollo, pruebas, previsualizaciones): modo demostración. La hélice
  muestra los `[EJEMPLO]` y el formulario avisa que no está conectado. Las pruebas corren en este modo
  y simulan Supabase con `page.route` cuando miden el envío.
- **Panel del equipo:** `/equipo/` con Supabase Auth (correo y contraseña; registro público apagado). Sin
  variables, ofrece recorrerlo con filas `[EJEMPLO]` en memoria.
- **Antispam:** campo trampa oculto y checks del esquema. Sin captcha.

## 6. Presupuestos

- Los de `fabrica/proyecto/compuertas.json` (fuentes < 250 KB, JS inicial < 220 KB en gzip).
- Propios: Three.js y los modelos fuera del JS inicial (import dinámico). Cada modelo `.glb` < 400 KB.
  La página completa < 1,5 MB transferidos sin los modelos.

## 7. Assets del autor

- **Unicornio (mascota):** lo genera el autor en Antigravity. Mientras llega, una silueta provisional
  por código con el mismo tamaño y punto de apoyo, para que el reemplazo no mueva nada. Formato que se
  espera: `.glb` (3D) o PNG/WebP con transparencia; se decide cuando llegue.
- **Objetos 3D de la portada:** formas por código ahora; se reemplazan por `.glb` sin tocar la escena
  (misma función `pieza()`).
