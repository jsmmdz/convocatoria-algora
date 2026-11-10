COMPUERTAS: ROJO

# Compuertas · T02

- Fecha: 2026-11-10T22:08:21.661Z
- Commit base: `f3ff49d`
- Modo: archivos cambiados
- Bloquean: 1 · Avisos: 0

| | Grupo | Compuerta | Detalle |
|---|---|---|---|
| ✅ | Alcance | archivos-propios | 15 cambiados dentro de «archivos» |
| ❌ | Alcance | fuera-de-alcance | .claude/agents/analista-referente.md — ruta protegida<br>.claude/agents/auditor-final.md — ruta protegida<br>.claude/agents/constructor.md — ruta protegida<br>.claude/agents/qa.md — ruta protegida<br>.gitignore<br>docs/1-PRODUCTO.md — ruta protegida<br>docs/3-ESTADO.md — ruta protegida<br>fabrica/LEEME.md<br>fabrica/nucleo/fallas.md — ruta protegida<br>fabrica/nucleo/plantillas/buzon.md — ruta protegida<br>fabrica/nucleo/plantillas/tarea.md — ruta protegida<br>fabrica/nucleo/reglas.md — ruta protegida<br>fabrica/nucleo/roles/orquestador.md — ruta protegida<br>fabrica/scripts/capturas.mjs — ruta protegida<br>fabrica/scripts/hook-agente.mjs — ruta protegida<br>fabrica/scripts/matriz/vistas.mjs — ruta protegida<br>sitio/tests/T02/t02.spec.ts — ruta protegida<br>fabrica/scripts/probar-hook.mjs — ruta protegida |
| ✅ | Alcance | requiere docs/2-TECNICO.md | existe |
| ✅ | Alcance | requiere docs/1-PRODUCTO.md | existe |
| ✅ | Alcance | requiere fabrica/proyecto/referentes/T02.json | existe |
| ✅ | Alcance | requiere sitio/tests/T02/t02.spec.ts | existe |
| ✅ | Alcance | pruebas | completas: tests/comunes, tests/T02, tests/T01 |
| ✅ | Comandos | npm run check | - 0 errors · - 0 warnings · - 0 hints |
| ✅ | Comandos | npm run build | Complete! |
| ✅ | Comandos | npx playwright test tests/comunes tests/T02 tests/T01 --reporter=line |  passed |
| ✅ | Patrones | any — Tipo any explícito | sin coincidencias |
| ✅ | Patrones | silenciar-compilador — @ts-ignore, @ts-expect-error o doble casteo | sin coincidencias |
| ✅ | Patrones | hex-suelto — Hex literal fuera de los tokens (F6). Todo color sale de sitio/src/styles/tokens.css | sin coincidencias |
| ✅ | Patrones | mobiliario — box-shadow o bordes decorativos. Revisar a mano: un borde de foco o de 0 es válido | sin coincidencias |
| ✅ | Patrones | degradado — Degradados. Solo con justificación escrita en la entrega | sin coincidencias |
| ✅ | Patrones | console-log — console.log olvidado | sin coincidencias |
| ✅ | Patrones | ruta-sin-base — Ruta interna o asset escrito desde la raíz: en GitHub Pages el sitio vive bajo /<repo>/. Todo pasa por import.meta.env.BASE_URL | sin coincidencias |
| ✅ | Patrones | voseo — Voseo en textos o comentarios (regla 0) | sin coincidencias |
| ✅ | Presupuestos | fuentes — Fuentes WOFF2 en dist (aviso; referencia < 250 KB) | 168.748 bytes / máx 250.000 |
| ✅ | Presupuestos | js-inicial — JS que carga / en gzip (aviso; referencia < 220 KB) | 68.343 bytes gzip en 3 archivo(s) + inline / máx 220.000 |

✅ pasa · ❌ falla y bloquea · ⚠️ aviso: lo revisa el auditor a mano
