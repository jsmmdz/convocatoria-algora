COMPUERTAS: ROJO

# Compuertas · T01

- Fecha: 2026-11-10T10:51:06.414Z
- Commit base: `924a517`
- Modo: archivos cambiados
- Bloquean: 1 · Avisos: 1

| | Grupo | Compuerta | Detalle |
|---|---|---|---|
| ✅ | Alcance | archivos-propios | 15 cambiados dentro de «archivos» |
| ✅ | Alcance | fuera-de-alcance | ninguno |
| ✅ | Alcance | requiere docs/2-TECNICO.md | existe |
| ✅ | Alcance | requiere docs/1-PRODUCTO.md | existe |
| ✅ | Alcance | requiere sitio/tests/T01/t01.spec.ts | existe |
| ✅ | Alcance | pruebas | de la tarea y sus regresiones: tests/comunes, tests/T01 |
| ✅ | Comandos | npm run check | - 0 errors · - 0 warnings · - 0 hints |
| ✅ | Comandos | npm run build | Complete! |
| ❌ | Comandos | npx playwright test tests/comunes tests/T01 --reporter=line | código 1 · falta:  passed |
| ✅ | Patrones | any — Tipo any explícito | sin coincidencias |
| ✅ | Patrones | silenciar-compilador — @ts-ignore, @ts-expect-error o doble casteo | sin coincidencias |
| ✅ | Patrones | hex-suelto — Hex literal fuera de los tokens (F6). Todo color sale de sitio/src/styles/tokens.css | sin coincidencias |
| ⚠️ | Patrones | mobiliario — box-shadow o bordes decorativos. Revisar a mano: un borde de foco o de 0 es válido | sitio/src/components/Nav.astro:29<br>sitio/src/components/Nav.astro:53<br>sitio/src/components/Nav.astro:55<br>sitio/src/components/Nav.astro:60 |
| ✅ | Patrones | degradado — Degradados. Solo con justificación escrita en la entrega | sin coincidencias |
| ✅ | Patrones | console-log — console.log olvidado | sin coincidencias |
| ✅ | Patrones | ruta-sin-base — Ruta interna o asset escrito desde la raíz: en GitHub Pages el sitio vive bajo /<repo>/. Todo pasa por import.meta.env.BASE_URL | sin coincidencias |
| ✅ | Patrones | voseo — Voseo en textos o comentarios (regla 0) | sin coincidencias |
| ✅ | Presupuestos | fuentes — Fuentes WOFF2 en dist (aviso; referencia < 250 KB) | 240.444 bytes / máx 250.000 |
| ✅ | Presupuestos | js-inicial — JS que carga / en gzip (aviso; referencia < 220 KB) | 49.524 bytes gzip en 1 archivo(s) + inline / máx 220.000 |

✅ pasa · ❌ falla y bloquea · ⚠️ aviso: lo revisa el auditor a mano
