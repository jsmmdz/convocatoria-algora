COMPUERTAS: VERDE

# Compuertas · T09

- Fecha: 2026-11-16T20:19:51.449Z
- Commit base: `50e7d2b`
- Modo: todos los archivos de la tarea
- Bloquean: 0 · Avisos: 1

| | Grupo | Compuerta | Detalle |
|---|---|---|---|
| ✅ | Alcance | archivos-propios | 0 cambiados dentro de «archivos» |
| ✅ | Alcance | fuera-de-alcance | ninguno |
| ✅ | Alcance | requiere docs/2-TECNICO.md | existe |
| ✅ | Alcance | requiere docs/1-PRODUCTO.md | existe |
| ✅ | Alcance | requiere fabrica/proyecto/referentes/leadoff.json | existe |
| ✅ | Alcance | requiere .github/workflows/deploy.yml | existe |
| ✅ | Alcance | pruebas | de la tarea y sus regresiones: tests/comunes, tests/T09, tests/T01, tests/T02, tests/T03, tests/T05, tests/T06, tests/T07, tests/T08, tests/R1 |
| ✅ | Comandos | npm run check | - 0 errors · - 0 warnings · - 0 hints |
| ✅ | Comandos | npm run build | Complete! |
| ✅ | Comandos | npx playwright test tests/comunes tests/T09 tests/T01 tests/T02 tests/T03 tests/T05 tests/T06 tests/T07 tests/T08 tests/R1 --reporter=line |  passed |
| ✅ | Patrones | any — Tipo any explícito | sin coincidencias |
| ✅ | Patrones | silenciar-compilador — @ts-ignore, @ts-expect-error o doble casteo | sin coincidencias |
| ✅ | Patrones | hex-suelto — Hex literal fuera de los tokens (F6). Todo color sale de sitio/src/styles/tokens.css | sin coincidencias |
| ⚠️ | Patrones | mobiliario — box-shadow o bordes decorativos. Revisar a mano: un borde de foco o de 0 es válido | sitio/src/components/Nav.astro:29<br>sitio/src/components/Nav.astro:53<br>sitio/src/components/Nav.astro:55<br>sitio/src/components/Nav.astro:60<br>sitio/src/components/Postulacion.astro:217<br>sitio/src/components/Postulacion.astro:219<br>sitio/src/components/Postulacion.astro:226<br>sitio/src/components/Postulacion.astro:262<br>sitio/src/components/Postulacion.astro:271<br>sitio/src/components/Postulacion.astro:343<br>sitio/src/components/Postulacion.astro:387<br>sitio/src/components/Postulacion.astro:456<br>… y 20 más |
| ✅ | Patrones | degradado — Degradados. Solo con justificación escrita en la entrega | sin coincidencias |
| ✅ | Patrones | console-log — console.log olvidado | sin coincidencias |
| ✅ | Patrones | ruta-sin-base — Ruta interna o asset escrito desde la raíz: en GitHub Pages el sitio vive bajo /<repo>/. Todo pasa por import.meta.env.BASE_URL | sin coincidencias |
| ✅ | Patrones | voseo — Voseo en textos o comentarios (regla 0) | sin coincidencias |
| ✅ | Presupuestos | fuentes — Fuentes WOFF2 en dist (aviso; referencia < 250 KB) | 168.748 bytes / máx 250.000 |
| ✅ | Presupuestos | js-inicial — JS que carga / en gzip (aviso; referencia < 220 KB) | 79.707 bytes gzip en 6 archivo(s) + inline / máx 220.000 |

✅ pasa · ❌ falla y bloquea · ⚠️ aviso: lo revisa el auditor a mano
