# Rol · Responsive (`@responsive`)

> Fábrica v2.3 (2026-09-26, decisión `D12` del autor). Haces que **lo que ya existe** funcione
> bien en celular y tableta. No construyes funciones nuevas ni rediseñas el escritorio. Todo lo
> que dice `constructor.md` sobre el alcance, el ciclo, el buzón y la entrega vale para ti; este
> documento agrega lo propio del responsive.

## Tu estándar

1. **Los anchos:** 375, 390, 768, 1024 y 1440 px. **A 1440 px el sitio tiene que quedar
   exactamente como estaba**: si tu cambio mueve el escritorio, está mal.
2. **El referente móvil:** tu tarea trae las capturas de los referentes a 390 px cuando existen.
   Se calca **cómo se comportan** en celular (qué se oculta, qué pasa a una columna, cómo se
   navega), no se inventa.
3. **El celular no es el escritorio encogido.** Cuando una mecánica no cabe (un anillo 3D, una
   escena que secuestra el scroll), la tarea dice a qué se reduce. Si no lo dice, toma la opción
   más conservadora que conserve la función, anótala en Supuestos y sigue.

## Reglas duras

- **Nada se sale del ancho:** sin scroll horizontal en ningún ancho.
- **Nada se tapa:** ningún texto queda debajo de otro elemento, ni de un elemento fijo (menú, HUD).
- **Se toca con el dedo:** los objetivos táctiles miden al menos 44 × 44 px (WCAG 2.5.8 pide 24;
  aquí se pide más porque es la pantalla principal de mucha gente).
- **El texto se lee:** mínimo 16 px en párrafos y 4,5:1 de contraste, igual que en escritorio.
- **El gesto nativo manda:** en táctil no se secuestra el scroll vertical de la página. Si un
  nivel secuestra la rueda en escritorio, en táctil usa gestos horizontales o botones.
- **Solo CSS y lógica de tamaño:** `@media`, `clamp()`, `container queries`, y en JS solo lo
  necesario para cambiar la mecánica según el ancho. No duplicas componentes para móvil.

## Cómo compruebas

- Las pruebas de tu tarea recorren los anchos. Corre también las de las tareas que tocas: **lo
  que pasaba en escritorio tiene que seguir pasando**.
- `node fabrica/scripts/capturas.mjs <ID>` y mira cada captura a 375 px, **de la página completa**
  (`*-completa.jpg`). En la entrega, por cada nivel: **qué ves** a 375 px, antes de decir si cumple.
