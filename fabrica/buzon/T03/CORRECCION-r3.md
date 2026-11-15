# Corrección r3 — T03 · Hitos (para la ronda 4)

- **La escribe:** el orquestador, después de revisar `AUDITORIA-FINAL.md` (E2, E3, E4), con las decisiones del
  autor del 2026-11-14
- **Fábrica:** v5.0 (construye Gemini; una sola sesión con todos los `archivos` de la tarea)
- **Fecha:** 2026-11-14

El QA-r3 aprobó y la auditoría final encontró tres defectos del viajero que ninguna prueba veía. Ya hay
pruebas para los tres en `sitio/tests/T03/t03.spec.ts` (no las editas). Hoy fallan las cinco y pasan con una
referencia corregida, junto con las 13 que ya había. La tarea (`fabrica/proyecto/tareas/T03-hitos.md`, puntos 4–6) y
la ficha (`fabrica/proyecto/referentes/T03.json`, K2) ya dicen lo nuevo.

### `E2` · El viajero se pinta encima de los bloques
- **Qué cambiar:** el viajero va **por debajo de los bloques y por encima de la línea** (decisión del autor):
  cuando cruza un bloque, el bloque lo tapa y reaparece al otro lado. Hoy `.hitos__guia` tiene `z-index: 3`
  fuera de `[data-hitos-pista]` y los bloques tienen `z-index: 2` dentro. Ojo: la pista tiene
  `will-change: transform`, así que es un contexto de apilamiento propio y nada de fuera puede quedar entre
  la línea y los bloques. Lo de dentro de la pista se mueve con ella: si llevas el viajero ahí, su x en la
  pista es `xPista`, no `xPantalla`.
- **No cambies** la onda ni la x del viajero para que no cruce bloques: la prueba exige que los cruce
  (y así lo decidió el autor).
- **Dónde:** `sitio/src/components/Hitos.astro` y `sitio/src/lib/hitos.ts`.
- **Cómo lo voy a verificar:** `viajero a 1440×900` y `a 1024×768: cuando cruza un bloque, el bloque lo tapa`.

### `E3` · Al inclinarse, el viajero se despega de la línea hasta 282 px
- **Qué cambiar:** el desplazamiento de la inclinación baja de 8 a **1,5 px por grado** (decisión del autor).
  Sigue girando sobre los cascos (`transform-origin` abajo al centro) y se mantienen el lerp 0,04 y el tope de
  40°. Va por token (`--inclinacion-desp`).
- **Dónde:** `sitio/src/styles/tokens.css`.
- **Cómo lo voy a verificar:** `inclinación en movimiento: los cascos se quedan en la unión sólida/punteada,
  como mucho 2 px por grado de inclinación` (rueda real, medida en movimiento). La de la inclinación de
  siempre (ángulo, lados, tope de 40°) tiene que seguir en verde.

### `E4` · La silueta del viajero no se ve en los hitos invertidos (contraste 1:1)
- **Qué cambiar:** en los hitos 3 y 5 (fondo invertido), el cuerpo del unicornio es del mismo color que el
  fondo y solo se ve el halo de 2 px, como un contorno hueco. La **silueta** tiene que contrastar ≥ 3:1 con el
  fondo del hito que tiene debajo, en claro y en oscuro, igual que el titular, que ya se invierte. Cómo lo
  logras es tuyo (por token, por el hito que tiene debajo o mezclando con el fondo como la línea), con dos
  condiciones: ningún hex fuera de `tokens.css`, y que en los hitos normales se siga viendo como hoy, en tinta
  sobre papel o en papel sobre tinta. Con E2 resuelto, el contraste contra los bloques deja de importar,
  porque el viajero queda debajo.
- **Dónde:** `sitio/src/components/Hitos.astro` (y `tokens.css` si hace falta un token).
- **Cómo lo voy a verificar:** `viajero (claro)` y `viajero (oscuro): su silueta se lee sobre el fondo de los
  hitos, también los invertidos (≥ 3:1)`.

### Al terminar
- `node fabrica/scripts/compuertas.mjs T03` en **VERDE**, en primer plano, y después
  `node fabrica/scripts/capturas.mjs T03`. Mira las hojas `hitos-2` y `hitos-tinta`: el unicornio no queda
  encima de ningún bloque y se ve lleno sobre la tinta.
- Tus scripts temporales van en `fabrica/buzon/T03/tmp/`. Arma las rutas con `fileURLToPath`, no con
  `new URL(...).pathname`: el espacio de «PAGINA CONVOCATORIA» se vuelve `%20` y escribe fuera del repo
  (auditoría, E6). Si levantas un servidor propio, ciérralo antes de entregar.
- Entrega en `fabrica/buzon/T03/ENTREGA-r4.md`.
