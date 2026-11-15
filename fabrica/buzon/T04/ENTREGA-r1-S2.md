# Entrega r1 — T04 · Subtarea S2 (Marco de tinta)

- **Tarea:** T04
- **Ronda:** r1
- **Modelo:** gemini-4-hydrogen-xhigh
- **Fábrica:** v5.0
- **Inicio:** Sun Nov 15 14:39:26 HPS 2026
- **Fin:** Sun Nov 15 14:46:34 HPS 2026
- **Intervenciones del autor:** 0

## Resumen
Construí `sitio/src/lib/marco-tinta.ts` con el shader OGL del marco de tinta (técnica K2 de Table Tales A3), su bucle de tiempo acotado por visibilidad y progreso, redimensionamiento limitado por DPR y ciclo seguro de contexto WebGL. No monté el módulo en la página ni toqué archivos de S1 o de integración. Tampoco ejecuté build, Playwright ni capturas, siguiendo la orden de subtarea paralela.

## Archivos
- Creado: `sitio/src/lib/marco-tinta.ts`
- Creado (buzón): `fabrica/buzon/T04/ENTREGA-r1-S2.md`

## Interfaz expuesta
`sitio/src/lib/marco-tinta.ts` exporta:

```ts
export interface Marco {
  /** p de 0 a 1, ya con la curva aplicada por la integración. 0 = todo el canvas en --productos-bloque
   *  (hueco cerrado); 1 = el hueco pasó los cuatro bordes y el canvas no pinta nada (transparente). */
  progreso(p: number): void;
  /** Ajusta el tamaño al de la ventana, con DPR tope --marco-dpr-max. */
  redimensionar(): void;
  /** Para el bucle, quita los oyentes y libera el contexto (si no se perdió ya: mira isContextLost, E7 de T03). */
  destruir(): void;
}

/** null si no hay WebGL (hayWebGL de src/lib/webgl.ts): entonces no se crea nada y no hay avisos en consola. */
export function montarMarco(canvas: HTMLCanvasElement): Marco | null;
```

- **Cómo se monta:** la integración importa `./marco-tinta` con `import()` diferido al acercarse `section[data-productos]`, pasa el `<canvas data-marco aria-hidden="true">` a `montarMarco(canvas)` y verifica si devolvió `null` (sin WebGL).
- **Cómo se conduce:** en la segunda mitad del pin, tras apagar titular, etiqueta, botón y fichas, la integración llama `marco.progreso(power2.in(t))` con `t` de `0` a `1` entre `0.26` y `0.90` del tramo (`0` antes, `1` al pasar `0.90`).
- **Limpieza y redimensionamiento:** escucha `resize` de `window`, `webglcontextlost`/`webglcontextrestored` en el `<canvas>` y usa `IntersectionObserver` sobre el `<canvas>` para pausar el `requestAnimationFrame` fuera de pantalla. Aun así expone `redimensionar()` para sincronizar con `ScrollTrigger.refresh()` y `destruir()` para parar el bucle, quitar oyentes, limpiar `style.width`/`style.height` y liberar el contexto WebGL.
- **Eventos y `data-*`:** no lee ni escribe atributos `data-*` ni emite eventos propios. Si ocurre una pérdida real de contexto (`webglcontextlost`), llama `preventDefault()` y oculta el canvas con `canvas.style.display = 'none'`.
- **Tokens que consume:** `--productos-bloque` (respaldo `--color-cobalto`), `--color-acido`, `--marco-pincel` (respaldo `120`), `--marco-ruido-escala` (respaldo `1.6`), `--marco-ruido-tiempo` (respaldo `0.03`) y `--marco-dpr-max` (respaldo `2`).

## Compuertas
`COMPUERTAS: VERDE` con `node fabrica/scripts/compuertas.mjs T04 --sin-build` (`Bloquean: 0 · Avisos: 4`):
- ⚠️ `Comandos / check/build`: saltados con `--sin-build` porque las capturas, el build y Playwright no corren en subtareas paralelas. `npx astro check` sí corrió aparte desde `sitio/` con `0 errors, 0 warnings, 0 hints`.
- ⚠️ `Patrones / mobiliario`: reporta 5 líneas en `sitio/src/components/Productos.astro` (archivo de la subtarea S1 en paralelo; `marco-tinta.ts` no tuvo coincidencias en ningún patrón).
- ⚠️ `Presupuestos / fuentes` y `js-inicial`: sin `dist/` por `--sin-build`; los verifica la integración al correr las compuertas completas.

## Verificación
1. `Set-Location "sitio"; npx astro check` (después de la última edición):
   ```text
   14:46:26 [check] Getting diagnostics for Astro files in C:\UNIVERSIDAD\UNIVERSIDAD\PAGINA CONVOCATORIA\sitio...
   Result (32 files): 
   - 0 errors
   - 0 warnings
   - 0 hints
   ```
2. `node fabrica/scripts/compuertas.mjs T04 --sin-build` (después de la última edición):
   ```text
   COMPUERTAS: VERDE
   - Bloquean: 0 · Avisos: 4
   - archivos-propios: 3 cambiados dentro de «archivos»
   - fuera-de-alcance: ninguno
   - Patrones (any, silenciar-compilador, hex-suelto, degradado, console-log, ruta-sin-base, voseo): sin coincidencias
   ```
3. `date` al inicio y al fin: `Sun Nov 15 14:39:26 HPS 2026` → `Sun Nov 15 14:46:34 HPS 2026`.
4. **Sin verificar en navegador en S2:** la compilación efectiva del shader GLSL en WebGL, la ausencia de avisos de consola en runtime y la apariencia visual del borde orgánico quedan sin ejecutar aquí por la restricción de no correr Playwright ni `capturas.mjs` durante subtareas en paralelo.

## Decisiones
- **Coordenadas en píxeles CSS (`uTam` y `uResolucion`):** convertí `gl_FragCoord.xy / uResolucion * uTam` para que la distancia con signo al rectángulo redondeado (`sdRectRedondeado`) y el grosor del pincel (`uPincel`) sean isotrópicos en cualquier proporción de pantalla y DPR fraccionario, evitando deformaciones ovaladas.
- **Forma y ruido orgánico (`fbm` 5 octavas):** combiné lóbulos direccionales (`fbm(dir * uRuidoEscala + uTiempo * uRuidoTiempo)`), variación independiente de grosor (`anchoVar` con contraste estirado entre 18 % y 100 % de `uPincel`) y textura de borde en espacio de pantalla (`pos * 0.016`), manteniendo lados rectos y esquinas moderadas (`radioBase` entre 16 y 40 px) para que sea un rectángulo redondeado orgánico y no un óvalo.
- **Límites `p = 0` y `p = 1`:** en `p <= 0` el shader devuelve `uBloque` sólido y detiene el bucle; en `p >= 1` devuelve transparente (`vec4(0.0)`) y detiene el bucle; un margen `radioBase + uPincel * 1.25 + 16.0` asegura que incluso los lóbulos internos sobrepasen las cuatro esquinas antes de `p = 1`.
- **Lectura segura de `--productos-bloque`:** añadí `leerColorToken` sobre `leerToken`/`leerColor` de `src/lib/tokens.ts` para seguir cadenas `var(--otro)` si el navegador las devuelve sin resolver en `getComputedStyle` y respaldar con `--color-cobalto` si el token aún no está en `tokens.css`.
- **Re-montaje tras `destruir()`:** dado que la integración monta al acercarse y llama `destruir()` al alejarse (liberando el contexto con `WEBGL_lose_context.loseContext()` si `!gl.isContextLost()`), guardé el estado en un `WeakMap` por `<canvas>` para poder llamar `restoreContext()` limpiamente si `montarMarco` vuelve a invocarse sobre el mismo elemento `<canvas>`.

## Supuestos
- `fabrica/proyecto/perfil.md` no existe en el repositorio; los contratos de paleta, tokens y técnica se tomaron de `docs/1-PRODUCTO.md`, `docs/2-TECNICO.md`, `sitio/src/styles/tokens.css`, `fabrica/proyecto/referentes/T04.json` y `fabrica/proyecto/tareas/T04-productos.md`.
- Como la integración todavía no escribió los tokens de T04 en `sitio/src/styles/tokens.css`, supongo los valores iniciales de la tabla de la tarea (`--productos-bloque: var(--color-cobalto)`, `--marco-pincel: 120`, `--marco-ruido-escala: 1.6`, `--marco-ruido-tiempo: 0.03`, `--marco-dpr-max: 2`) como respaldos en `marco-tinta.ts`.
- Supongo que `Productos.astro` posiciona `<canvas data-marco>` cubriendo la ventana (`inset: 0`, tamaño de viewport) mientras el modo horizontal está activo, coherente con el cálculo de `medirVentana()`.

## PENDIENTES
Ninguno propio de S2 (los tokens y el montaje pertenecen a la integración).

## SOLICITUDES
- Para la integración (`sitio/src/styles/tokens.css`, `sitio/src/components/Productos.astro` y `sitio/src/lib/productos.ts`):
  1. Agregar en `tokens.css` los tokens `--productos-bloque`, `--marco-pincel`, `--marco-ruido-escala`, `--marco-ruido-tiempo` y `--marco-dpr-max`.
  2. En `Productos.astro` / `productos.ts`, dar al `<canvas data-marco>` tamaño/posición a pantalla completa en modo horizontal (`inset: 0`), cargarlo diferido con `import('./marco-tinta')`, pasar `progreso(power2.in(t))` en el tramo `0.26–0.90` de la segunda mitad del pin y destruir al alejarse o salir del modo horizontal.
  3. Verificar en la corrida de integración que el shader compila sin avisos en consola y revisar `capturas` (`marco`) contra el referente para ajustar en el pulido si hace falta.
