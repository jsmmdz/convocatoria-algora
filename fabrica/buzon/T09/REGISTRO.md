# Registro — R1 y T09 (una sesión, con subagentes)

- **Fecha:** 2026-11-16.
- **Orquestador:** Claude Fable 5.2 (planeó, escribió las pruebas, integró, corrigió y publicó).
- **Constructores:** cuatro subagentes `constructor` (Sonnet) en paralelo, con archivos separados, por pedido del
  autor («vas a hacer el rol de orquestador y director para dar instrucciones a subagentes más baratos»).
- **Sin** QA de Sonnet ni auditoría de Opus aparte.

| Subagente | Qué hizo | Tokens | Minutos |
|---|---|---|---|
| R1-A | Afinado táctil: nav, productos, pasos 2 × 2, formulario, panel | 128.761 | 7,0 |
| R1-B | Hitos en celular: línea vertical con unicornio (`hitos-vertical.ts`) | 87.636 | 4,8 |
| R1-C | Proyectos en celular: carrusel deslizable (`carrusel.ts`) | 90.985 | 4,5 |
| T09-D | Pie de cierre, metadatos, favicon, imagen para redes y `LEEME.md` | 91.721 | 5,0 |

Cifras del resumen de cada subagente al terminar. Los tokens del orquestador no se midieron.

## Lo que corrigió el orquestador al integrar

| Dónde | Qué pasó | Cómo se vio |
|---|---|---|
| Panel | La regla táctil de 16 px de la tabla iba antes que la regla base y esta la pisaba | prueba de R1 (7 pantallas) |
| Portada | R1-A quitó el cruce de las piezas 3D en angosto (decisión R-4 del orquestador). Contradecía la decisión del autor del 2026-11-10 y su prueba de T02: se devolvió `capas3d.ts` y se corrigió R-4 en `docs/1-PRODUCTO.md` | regresión de T02 |
| Pruebas de T03 y T06 | Exigían «sin línea ni viajero» y «ninguna tarjeta a la derecha» en angosto; R-1 y R-2 lo cambian. Se actualizaron | regresión |
| Despliegue | `hashFiles()` en el `if` del trabajo: GitHub rechaza el archivo. Se quitó | primer run en rojo |
| Prueba de T09 | Tipo de `VISTAS` mal declarado | `npm run check` de los subagentes |

## Resultado

- Compuertas completas en verde sobre `50e7d2b` (`COMPUERTAS-r1.md`): todas las pruebas de T01–T09 y R1; JS inicial
  79.707 B gzip; fuentes 168.748 B.
- **Publicado** en https://jsmmdz.github.io/convocatoria-algora/ (repo público `jsmmdz/convocatoria-algora`, modo
  demostración). Probado publicado con `tmp/publicado.mjs`: 200 en `/` y `/equipo/`, 404 en ruta inexistente, consola
  limpia, ningún recurso fuera de `/convocatoria-algora/`, hélice con WebGL a 1440, línea vertical y carrusel a 390
  táctil, «Sumarme» llena el formulario, `#postulacion` funciona, `og.jpg` responde.

## Sin hacer

- `theme-color` por tema (pide un color literal en `Base.astro`, que la compuerta de hex no deja; habría que
  ponerlo desde `tema.ts`).
- Pulido fino de `T05`–`T08` (la cabecera de la hélice roza los dorsos a 1024 con ratón).
- No se miró la matriz de 20 pantallas en capturas (`capturas.mjs`); axe sí corrió en las 20, en claro y oscuro.
- Nada probado en un celular de verdad.
