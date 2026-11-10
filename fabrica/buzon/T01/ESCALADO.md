# T01 escalada al orquestador

- **Tarea:** T01
- **Ronda:** r1
- **Modelo:** claude-sonnet-5-5
- **Fábrica:** v2.1
- **Inicio:** 2026-11-10 05:50
- **Fin:** 2026-11-10 05:57
- **Intervenciones del autor:** 0

- **Ronda:** r1

## Qué no se resolvió y por qué el constructor no lo resuelve

**H1 (Crítico, orquestador).** `node fabrica/scripts/compuertas.mjs T01` sale en ROJO solo por la compuerta e2e: `astro preview` se niega a arrancar porque el candado del proyecto apunta a un servidor suelto.

- Proceso suelto: PID 82384 (`astro.mjs preview --port 4331`), padre `cmd.exe` 37980, abuelo `npx` 69840. Los tres nacieron el 2026-11-10 a las 05:48:44–46, durante la corrida de `capturas.mjs` del constructor. Siguen vivos; el puerto 4331 ya aparece `CLOSED`.
- Qué hay que hacer: cerrar esos procesos (el auditor no lo hizo: están fuera del rango 4390–4399) y arreglar la limpieza de `fabrica/scripts/capturas.mjs` (el `taskkill` por puerto mata al que escucha, no al árbol `npx`/`cmd`/`node` que lanzó con `shell: true`). Si no se arregla, cada `capturas.mjs` bloqueará la compuerta siguiente de cualquier tarea.
- Reproducción del código sin ese proceso: servidor propio en el 4392 sobre `sitio/dist` y las mismas pruebas, **17 passed**. No sustituye a la compuerta.

## Menores pendientes

- H2: `sitio/src/tipos-node.d.ts` (shim de `node:fs`, `node:path` y `process`) existe porque `astro check` lee `sitio/tests/comunes/rutas.ts`. Cuando el orquestador decida (excluir `tests` en `sitio/tsconfig.json` o instalar `@types/node`), hay que borrar el shim.
- H3: ninguna prueba exige el tope de 3,5 s de `data-listo` ni el foco en el tema oscuro.

## Qué debe mirar el orquestador con más cuidado

- Tras liberar el proceso, volver a correr las compuertas antes de cualquier otra corrida de `capturas.mjs`, para confirmar el verde.
- No encontré código acomodado a la prueba: el tema sale de `localStorage` y de `dataset.theme` reales, Lenis es una instancia real condicionada por `matchMedia`, y las fuentes se midieron por `document.fonts`.
- No queda ningún hallazgo del constructor abierto. Con H1 resuelto, T01 estaría en condiciones de pasar sin otra ronda de construcción.

## Ronda r2

- **Ronda:** r2
- **Modelo:** claude-sonnet-5-5
- **Inicio:** 2026-11-10 05:58
- **Fin:** 2026-11-10 06:15
- **Intervenciones del autor:** 0

**H1 de la r1: resuelto.** `capturas.mjs` ya mata el árbol del servidor; tras correrlo no queda ningún `astro preview`, y `npx playwright test tests/comunes tests/T01` da 17 passed. La compuerta e2e sale en ✅.

**H4 (Crítico, orquestador).** `node fabrica/scripts/compuertas.mjs T01 --guardar` sigue en ROJO, ahora solo por `fuera-de-alcance`: `fabrica/scripts/capturas.mjs` (ruta protegida) y `sitio/tsconfig.json`. Son los dos archivos que el orquestador editó para el arreglo y siguen sin versionar (`git status`: `M`). Qué hay que hacer: commit de esos dos archivos (junto con el resto) y volver a correr las compuertas. Si se prefiere, `sitio/tsconfig.json` también puede entrar en `archivos` de T01, pero `capturas.mjs` solo se limpia con el commit.

**H3 (Menor, orquestador)** sigue abierto: tope de 3,5 s de `data-listo` y foco en tema oscuro sin prueba.

No hay hallazgo del constructor. Con H4 resuelto, T01 queda en condiciones de pasar sin otra ronda de construcción.
