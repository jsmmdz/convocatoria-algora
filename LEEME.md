# Convocatoria Algora

Web de la convocatoria del semillero Algora (Creación Digital, Universidad El Bosque) para estudiantes de
cualquier carrera. Explica cómo funciona el semillero, muestra las carreras y los proyectos, y recibe
postulaciones que solo ve el equipo en un panel privado. Está hecha con Astro y TypeScript estricto, en
`sitio/`.

## Correrla

Necesitas Node 22 o superior.

```bash
cd sitio
npm install
npm run dev       # servidor de desarrollo en http://localhost:4321
npm run build     # genera sitio/dist
npm run check     # tipos y avisos de Astro (debe dar 0 y 0)
npx playwright install chromium   # solo la primera vez, para las pruebas
npx playwright test               # pruebas de comportamiento, accesibilidad y responsive
```

## Modo demostración

Sin las variables de Supabase la web **corre en modo demostración**: todo se ve y se puede probar, pero el
formulario no guarda nada, la hélice de proyectos muestra ejemplos marcados `[EJEMPLO]` y el panel del equipo
trabaja con datos de muestra. Así sale publicada hasta que alguien conecte la base de datos.

## Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre **SQL Editor**, pega todo el contenido de `sitio/supabase/esquema.sql` y ejecútalo. Crea las tablas,
   las políticas de acceso y la función del anillo público (solo ideas aprobadas y sin datos personales).
3. Copia la **Project URL** y la clave **anon** (Project Settings → API).
4. Pónlas como variables:
   - En GitHub: Settings → Secrets and variables → Actions → `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
   - En local: un archivo `sitio/.env` con esas dos líneas (no se sube).
5. Crea los usuarios del equipo en **Authentication → Users → Add user** e inscríbelos con el SQL del final de
   `esquema.sql` (inserta su correo en la tabla `equipo`). Sin esa fila, entrar al panel no muestra nada.
6. Vuelve a publicar (un push a `main` o «Run workflow» en Actions). No hay que tocar código.

## Cómo se publica

Cada push a `main` que cambie `sitio/` dispara `.github/workflows/deploy.yml`: construye con Astro y publica en
GitHub Pages. En el repo, Settings → Pages → Source debe ser **GitHub Actions**. La base de la URL sale sola
del nombre del repo.

## Carpetas

```
sitio/              la web (Astro)
  src/components/   una pieza por sección: portada, hitos, productos, hélice, postulación, pie
  src/lib/          comportamiento: movimiento, 3D, datos de Supabase, rutas
  src/styles/       tokens.css (único lugar con colores), fuentes y estilos globales
  src/pages/        inicio, equipo (panel) y 404
  public/           favicon e imagen para redes
  supabase/         esquema.sql de la base de datos
  tests/            pruebas de Playwright
docs/               producto, decisiones técnicas y estado
fabrica/            proceso y herramientas con las que se construyó (agentes, compuertas, buzones)
```

## Qué no se sube

- `referentes/capturas/` y `referentes/videos/`: material de otros sitios, se queda en el computador de quien
  lo recopiló.
- `fabrica/buzon/*/capturas/comparacion/` y `fabrica/buzon/*/referente/`: llevan capturas de esos referentes.
- `.env` y `.env.*`: claves locales.
- `previo/` y lo que el encargo marque como personal.

Las postulaciones llevan datos personales (Ley 1581 de 2012): solo las ve el equipo, y el formulario pide la
autorización expresa antes de enviarlas.
