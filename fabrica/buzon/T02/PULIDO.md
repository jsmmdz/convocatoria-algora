# Pulido — T02

## Escapados corregidos por el orquestador (2026-11-10)

Son arreglos pequeños de la auditoría final y de la revisión del orquestador. Relanzar costaba más que hacerlos. Ninguno vuelve al constructor.

| Escapado | Archivo | Cambio | Líneas |
|---|---|---|---|
| E2 (H3) | `src/lib/trama.ts` | Máscara de contenido: el cursor no aviva la trama detrás de las líneas ni de las etiquetas; las zonas se vuelven a medir con un ResizeObserver | 45 |
| E4 | `src/lib/capas3d.ts` | El recorrido del cursor se escala con las piezas; el dedo no mueve las piezas | 6 |

Pruebas nuevas en `tests/T02/` (escritas por el orquestador, cada una validada sembrando el defecto):
- `load` tardío (E3).
- Contraste contra la trama tocada (E2).
- Solape de las piezas con el contenido (H1/H7/E4).
- Cambio de tamaño con scroll (H5).

## Pulido con el autor (2026-11-10)

Hay dos decisiones del autor, anotadas en `docs/1-PRODUCTO.md` § 6.

| Cambio | Archivo | Por qué | Líneas |
|---|---|---|---|
| Piezas que cruzan el titular: van ancladas a un punto del texto (`Cruce`). El octaedro de delante va en el borde de arriba, entre «esta» y «vez»; el cubo tinta, detrás de «haces». Se apartan solo de la pastilla, las etiquetas y la nav, siguen al cursor solo en horizontal, a la mitad, y su radio no pasa del 30 % del alto de la línea | `src/lib/capas3d.ts` | H7: calcar Table Tales A1. En el primer intento el octaedro tapaba entero el «sí»; con el parallax completo se montaba en las etiquetas a 1280 × 720; y en tablet vertical tapaba «ta ve» porque su tamaño salía de la pantalla y no del texto | 45 |
| `--titular-portada`: igual al xl hasta 1440 y después `min(8,2vw, 15vh)`. Las etiquetas y el aire crecen con él | `src/styles/tokens.css`, `src/components/Portada.astro` | En 2560 y 4K el titular quedaba diminuto | 8 |
| Prueba de solape según la decisión: el titular se puede cruzar hasta un 25 % por fragmento, y el cruce tiene que existir; pastilla y etiquetas, ≤ 1 % | `tests/T02/t02.spec.ts` | Se validó sembrando dos defectos: sin el cruce y con el parallax completo | 10 |

Queda para más adelante (sin decisión pendiente): cuando el respaldo corta la precarga en una carga lenta, la capa se va de golpe mostrando `[90%]`. La tarea lo permite.
