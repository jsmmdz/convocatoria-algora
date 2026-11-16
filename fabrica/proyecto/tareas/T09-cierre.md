---
id: T09
agente: "@orquestador"
fase: 3
depende: [R1]
tipo: cierre
requiere:
  - docs/2-TECNICO.md
  - docs/1-PRODUCTO.md
  - fabrica/proyecto/referentes/leadoff.json
  - .github/workflows/deploy.yml
rutas: ["/", "/equipo/"]
archivos:
  - sitio/src/**
  - sitio/public/**
  - sitio/tests/T09/**
  - sitio/astro.config.mjs
  - .github/workflows/deploy.yml
  - LEEME.md
regresion: [T01, T02, T03, T05, T06, T07, T08, R1]
bloqueantes: []
---

# `T09` · Cierre y publicación

> Fase 3 · Buzón: `fabrica/buzon/T09/` · **La construye el orquestador (Claude Fable) en la última sesión**,
> después de `R1`. Decisión del autor del 2026-11-16: **se publica en modo demostración** (sin Supabase);
> Supabase se conecta después solo con los secrets del repo, sin tocar código.

## Qué construyes

1. **Pulido de `T05`–`T08`** (el autor aceptó sus ocho decisiones el 2026-11-16). Lo de «Queda para el pulido»
   de cada tarea que el orquestador puede resolver solo: la cabecera de la hélice que roza los dorsos a 1024,
   espacios y ritmo. Los textos siguen siendo el borrador del prototipo v2 hasta que el autor los cambie.
   `PULIDO.md` en cada buzón.
2. **Pie en bloque negro (leadoff A6).** El pie de hoy son tres líneas. Pasa a un bloque de tinta a sangre con
   una frase XXL de cierre y un «Postúlate» final, la línea del semillero, «Convocatoria abierta · fechas por
   confirmar» y el acceso del equipo. Conserva lo que mide `tests/T01` (texto del semillero, fondo
   `--pie-fondo`, ancho completo). **La frase de cierre no está decidida:** va `[FRASE DE CIERRE DEL AUTOR]`
   si el autor no la da antes; no se inventa (regla 4.5). La del prototipo v2, «2027 está libre.», salió con el
   recorrido viejo y no se reutiliza sin preguntarle.
3. **Metadatos:** favicon (la gema o el unicornio provisional en SVG, con los tokens), `og:title`,
   `og:description`, `og:image` (una captura de la portada a 1200 × 630 generada por script), `theme-color`
   por tema y `lang`. Todo con `BASE_URL`.
4. **Rendimiento** (`docs/2-TECNICO.md` § 6): JS inicial < 220 KB gzip (hoy 78,5 KB), fuentes < 250 KB (hoy
   168,7 KB), página < 1,5 MB transferidos, Three fuera del JS inicial (ya es import dinámico: comprobarlo en
   el build). `loading`/`decoding` en imágenes si aparecen. Medir con el build publicado, no en dev.
5. **axe en las 20 pantallas** de la matriz (`fabrica/scripts/matriz/vistas.mjs`), en claro y oscuro, en `/` y
   `/equipo/`: prueba nueva en `sitio/tests/T09/`. Las comunes solo miden una pantalla.
6. **`LEEME.md` en la raíz** (el repo es público): qué es, cómo correrlo, cómo conectar Supabase (crear
   proyecto → `sitio/supabase/esquema.sql` → secrets `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` →
   inscribir al equipo) y qué no se sube. Es el único documento nuevo, y no es de planeación.
7. **Publicación.** Comprobado el 2026-11-16: **el repo `jsmmdz/convocatoria-algora` todavía no existe en
   GitHub y el repo local no tiene remoto**; `gh` está autenticado como `jsmmdz`.
   1. Antes de subir: `git ls-files` no trae nada de `referentes/capturas/`, `referentes/videos/`, `previo/`,
      `fabrica/buzon/*/capturas/comparacion/` ni `.env` (hoy está limpio: 0 archivos de `previo/`). Buscar
      datos personales en lo versionado (el correo del autor no debe aparecer).
   2. `gh repo create jsmmdz/convocatoria-algora --public --source . --remote origin` y `git push -u origin main`.
   3. En el repo: Settings → Pages → Source: **GitHub Actions** (`gh api -X POST repos/jsmmdz/convocatoria-algora/pages -f build_type=workflow`).
   4. Esperar el workflow (`gh run watch`) y abrir https://jsmmdz.github.io/convocatoria-algora/.
   5. **Probar publicado** (falla «se ve bien en local y no publicada»): consola limpia, fuentes y `_astro`
      bajo `/convocatoria-algora/`, `/equipo/` responde, el ancla `#postulacion` funciona, el aviso
      `[DEMOSTRACIÓN]` está. Correr las comunes contra la URL publicada.
   6. El CI usa Node 22 y en local hay Node 24: si el build del CI falla por eso, igualar la versión del workflow.

## Lo que necesita al autor

- **Autorización de publicar: dada** (2026-11-16, «Publicar en modo demostración»). Crear el repo público y
  el primer push son la acción que esa respuesta cubre; cualquier otra cosa hacia afuera se pregunta.
- **La frase de cierre del pie** (punto 2) y **los textos definitivos**, si los quiere distintos del borrador.
- **El unicornio** (Antigravity): si no llega, sale la silueta provisional.
- **Visto bueno final** sobre el sitio publicado, en un celular de verdad.

## Cuándo terminaste

- `node fabrica/scripts/compuertas.mjs T09 --completas` en verde.
- El sitio publicado abre, probado como dice el punto 7.5.
- `T05`–`T09` y `R1` con su cierre en el buzón; `docs/3-ESTADO.md` dice «MVP publicado» y lista lo que queda
  fuera del MVP: Supabase real, textos definitivos, unicornio y objetos 3D de Antigravity.
