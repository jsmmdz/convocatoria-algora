COMPUERTAS: ROJO

# Compuertas · T03

- Fecha: 2026-11-11T01:11:22.602Z
- Commit base: `174da15`
- Modo: archivos cambiados
- Bloquean: 1 · Avisos: 0

| | Grupo | Compuerta | Detalle |
|---|---|---|---|
| ✅ | Alcance | archivos-propios | 4 cambiados dentro de «archivos» |
| ✅ | Alcance | fuera-de-alcance | ninguno |
| ✅ | Alcance | requiere docs/2-TECNICO.md | existe |
| ✅ | Alcance | requiere docs/1-PRODUCTO.md | existe |
| ✅ | Alcance | requiere fabrica/proyecto/referentes/T03.json | existe |
| ✅ | Alcance | requiere sitio/tests/T03/t03.spec.ts | existe |
| ✅ | Alcance | pruebas | de la tarea y sus regresiones: tests/comunes, tests/T03, tests/T01, tests/T02 |
| ✅ | Comandos | npm run check | - 0 errors · - 0 warnings · - 0 hints |
| ✅ | Comandos | npm run build | Complete! |
| ❌ | Comandos | npx playwright test tests/comunes tests/T03 tests/T01 tests/T02 --reporter=line | código 1 · aparece: «3 failed» · fallan:<br>[chromium] › tests\comunes\sitio.spec.ts:50:5 › ruta / › carga sin errores ni advertencias en consola<br>[chromium] › tests\T02\t02.spec.ts:374:3 › T02 · precarga y portada › trama: dibuja caracteres sobre toda la portada, quieta sin cursor, y el cursor la deforma<br>[chromium] › tests\T02\t02.spec.ts:408:3 › T02 · precarga y portada › trama: tocada por el cursor no baja el contraste del papel detrás de las etiquetas ni del titular<br>y al repetirlas solas: código 1 · falta:  passed · aparece: «3 failed» · fallan:<br>[chromium] › tests\comunes\sitio.spec.ts:50:5 › ruta / › carga sin errores ni advertencias en consola<br>[chromium] › tests\T02\t02.spec.ts:374:3 › T02 · precarga y portada › trama: dibuja caracteres sobre toda la portada, quieta sin cursor, y el cursor la deforma<br>[chromium] › tests\T02\t02.spec.ts:408:3 › T02 · precarga y portada › trama: tocada por el cursor no baja el contraste del papel detrás de las etiquetas ni del titular |
| ✅ | Patrones | any — Tipo any explícito | sin coincidencias |
| ✅ | Patrones | silenciar-compilador — @ts-ignore, @ts-expect-error o doble casteo | sin coincidencias |
| ✅ | Patrones | hex-suelto — Hex literal fuera de los tokens (F6). Todo color sale de sitio/src/styles/tokens.css | sin coincidencias |
| ✅ | Patrones | mobiliario — box-shadow o bordes decorativos. Revisar a mano: un borde de foco o de 0 es válido | sin coincidencias |
| ✅ | Patrones | degradado — Degradados. Solo con justificación escrita en la entrega | sin coincidencias |
| ✅ | Patrones | console-log — console.log olvidado | sin coincidencias |
| ✅ | Patrones | ruta-sin-base — Ruta interna o asset escrito desde la raíz: en GitHub Pages el sitio vive bajo /<repo>/. Todo pasa por import.meta.env.BASE_URL | sin coincidencias |
| ✅ | Patrones | voseo — Voseo en textos o comentarios (regla 0) | sin coincidencias |
| ✅ | Presupuestos | fuentes — Fuentes WOFF2 en dist (aviso; referencia < 250 KB) | 168.748 bytes / máx 250.000 |
| ✅ | Presupuestos | js-inicial — JS que carga / en gzip (aviso; referencia < 220 KB) | 69.367 bytes gzip en 3 archivo(s) + inline / máx 220.000 |

✅ pasa · ❌ falla y bloquea · ⚠️ aviso: lo revisa el auditor a mano
