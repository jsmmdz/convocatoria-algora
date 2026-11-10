# Pulido — T01

## Escapados corregidos por el orquestador (2026-11-10)

Arreglos pequeños de la auditoría final, hechos por el orquestador con permiso del autor porque relanzar
costaba más. Ninguno vuelve al constructor.

| Escapado | Archivo | Cambio | Líneas |
|---|---|---|---|
| E3 | `src/components/Nav.astro` | «Postúlate» a `${inicio}#postulate` | 1 |
| E4 | `src/styles/global.css`, `src/components/Pie.astro` | Fuera `overflow-wrap: anywhere` | 2 |
| E5 | `src/styles/tokens.css`, `src/components/Pie.astro` | Token `--pie-fondo`; en oscuro 90 % tinta + 10 % papel (decisión del autor). El pie fija `--foco` en ácido | 10 |
| E7 | `src/styles/fuentes.css` (nuevo), `src/layouts/Base.astro` | `@font-face` solo latino de Zalando Sans y JetBrains Mono | 24 |
| H3 | `src/lib/listo.ts` | El respaldo se cuenta desde la navegación | 2 |

## Pulido con el autor

Pendiente: revisar con el autor las capturas y el sitio (`npm run dev`) y después el visto bueno.
