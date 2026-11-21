---
id: R2
agente: "@constructor"
fase: 3
depende: [T09, R1]
tipo: responsive
requiere:
  - fabrica/nucleo/roles/responsive.md
  - docs/1-PRODUCTO.md
  - docs/2-TECNICO.md
rutas: ["/"]
archivos:
  - sitio/src/components/Hitos.astro
  - sitio/src/lib/hitos.ts
  - sitio/src/components/Carreras.astro
  - sitio/src/components/Postulacion.astro
  - sitio/src/lib/postulacion.ts
  - sitio/src/lib/hitos-vertical.ts
  - sitio/src/lib/carrusel.ts
  - sitio/src/styles/**
  - sitio/tests/T03/**
  - sitio/tests/T05/**
  - sitio/tests/R1/**
  - sitio/tests/R2/**
regresion: [T01, T02, T04, T06, T07, T08, T09]
bloqueantes: []
---

# `R2` · Experiencia reducida

> Fase 3 · Buzón: `fabrica/buzon/R2/` · Decisiones X-1…X-6 en `docs/1-PRODUCTO.md` § 9 (autor, 2026-11-21).
> Respaldo de lo de antes: etiqueta `v1-completa` y rama `version-completa`. **No se borra código que salga del
> recorrido** (la línea vertical de R-1, por ejemplo): se desconecta y se deja documentado aquí dónde quedó.

## Lo medido (2026-11-21, sitio publicado, commit `58aeade`)

| Sección | Celular 390 × 664 | Escritorio 1440 × 900 |
|---|---|---|
| Portada | 1,0 | 1,0 |
| Hitos | 4,6 | 7,4 (pin) |
| Productos | 2,3 | 3,0 |
| Cómo funciona | 1,7 | 0,8 |
| Carreras | 3,1 | 2,7 |
| Proyectos | 0,9 | 5,2 |
| Postulación | 4,0 | 1,7 |
| Pie | 0,8 | 0,6 |
| **Total** | **18,4** | **22,3** |

Meta: **≤ 12,5 en celular y ≤ 16,5 en escritorio**, con la misma medición.

## Qué se entrega

1. **Hitos con 3 (X-2):** `IDEA` «Deja de vivir en tu libreta.» · `EQUIPO` «Alguien de otra carrera la entiende
   mejor que tú.» · `NOMBRE` «Te buscan por lo que construiste.», con `[01/03]`…`[03/03]`. Los colores y el
   invertido de cada uno se conservan (Nombre sigue invertido). Usuarios y Valor quedan comentados en el arreglo
   de `Hitos.astro`, no borrados.
2. **Escritorio (X-3):** el mismo pin horizontal, línea sólida/punteada y unicornio; el recorrido se acorta en
   proporción a los 3 hitos (~4,5 pantallas). Las decisiones de T03 (unicornio bajo los bloques, 1,5 px por grado,
   textos encima) siguen vigentes.
3. **Celular y táctil (X-4, corte R-7):** carrusel deslizable de los 3 hitos, con ajuste a cada tarjeta, contador
   `01 / 03` y flechas ≥ 44 px, igual que el de proyectos (R-2), reusando `lib/carrusel.ts` sin romper el de proyectos. Sin secuestrar el gesto vertical. La línea
   vertical con el unicornio de R-1 se desconecta (no se borra).
4. **Carreras (X-5):** rejilla de 8 bloques con su color a sangre, facultad y una línea de lo que aporta. Dos
   columnas en celular y 4 × 2 en escritorio. Los colores siguen siendo los de las tarjetas de la hélice (D-8).
   Contraste AA de cada texto sobre su bloque.
5. **Formulario en celular (X-6):** a la vista quedan nombre, correo, facultad, programa y lo esencial del camino
   (idea: nombre de la idea y regla; sumarme: proyecto y habilidades). El resto va en un `<details>` «Agregar más
   detalles», cerrado, dentro del mismo `<form>`: los campos se siguen enviando y el esquema de Supabase no
   cambia. En escritorio el formulario se ve igual que hoy. Si hay un error de validación dentro de lo plegado, el
   bloque se abre y el foco va al campo.
6. **Movimiento reducido:** todo visible y apilado, como hoy.

## Pruebas

- **Se actualizan:** `tests/T03` (3 hitos, `[0n/03]`), `tests/R1` (los hitos en celular ya no son la línea
  vertical: esa parte pasa a `tests/R2`) y `tests/T05` (rejilla en lugar de bandas).
- **Nuevas en `tests/R2/`:** alto total en 390 × 844 táctil y en 1440 × 900 dentro de la meta; carrusel de hitos
  (contador, flechas, deslizar, teclado, sin scroll horizontal de página); rejilla de carreras (2 y 4 columnas,
  contraste); el pliegue del formulario (cerrado en celular, abierto o ausente en escritorio, se abre ante un error,
  los campos plegados llegan en el envío de demostración).
- Regresión completa y axe en las 20 pantallas, claro y oscuro.

## Visto bueno

El autor, en un celular de verdad, sobre lo publicado: el carrusel de hitos, la rejilla de carreras y el formulario.
