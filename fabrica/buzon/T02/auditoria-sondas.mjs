// Sondas de la auditoría final de T02: prueban la función en el navegador, no solo lo que miden las pruebas.
// Uso (desde la raíz, con sitio/dist construido): node fabrica/buzon/T02/auditoria-sondas.mjs
// Levanta `astro preview` en el 4393 (rango 4390-4399) y lo cierra con el árbol entero (F25).
// Salidas en fabrica/buzon/T02/capturas/auditoria/ y el resumen en sondas.json.
//   1. Piezas de la capa de delante sobre el contenido según dónde esté el cursor (no solo en reposo).
//   2. Contraste del papel contra la trama real, detrás de las etiquetas y del titular, en reposo y tocada.
//   3. Vuelta de la trama al reposo y densidad centro/esquinas.
//   4. Precarga con `load` tardío (la cursiva tarda 6 s).
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SITIO = join(RAIZ, 'sitio');
const OUT = join(RAIZ, 'fabrica', 'buzon', 'T02', 'capturas', 'auditoria');
mkdirSync(OUT, { recursive: true });
const { chromium } = createRequire(join(SITIO, 'package.json'))('@playwright/test');
const PUERTO = 4393;
const URL = `http://localhost:${PUERTO}/`;

const servidor = spawn(`npx astro preview --port ${PUERTO}`, { cwd: SITIO, shell: true, stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(URL)).ok) break; } catch { /* arrancando */ }
  await new Promise((r) => setTimeout(r, 500));
}
const nav = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });

async function analizar(png, rects, modo) {
  const lector = await nav.newPage();
  const r = await lector.evaluate(async ({ b64, rects, modo }) => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
    const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const { data, width } = g.getImageData(0, 0, img.width, img.height);
    const lin = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const Lp = L(246, 248, 251); // --color-papel
    return rects.map((q) => {
      let n = 0, malos = 0, min = 99, distintos = 0;
      for (let y = Math.max(0, Math.floor(q.y)); y < Math.floor(q.y + q.h); y++) for (let x = Math.max(0, Math.floor(q.x)); x < Math.floor(q.x + q.w); x++) {
        const i = (y * width + x) * 4; n++;
        if (modo === 'gris') { if (Math.abs(data[i] - 128) + Math.abs(data[i + 1] - 128) + Math.abs(data[i + 2] - 128) > 24) distintos++; }
        else { const l = L(data[i], data[i + 1], data[i + 2]); const k = (Math.max(l, Lp) + 0.05) / (Math.min(l, Lp) + 0.05); if (k < min) min = k; if (k < 4.5) malos++; }
      }
      return modo === 'gris' ? { nombre: q.nombre, tapado: +(distintos / n).toFixed(3) } : { nombre: q.nombre, bajo45: +(malos / n).toFixed(3), min: +min.toFixed(2) };
    });
  }, { b64: png.toString('base64'), rects, modo });
  await lector.close();
  return r;
}
const rectsContenido = (p) => p.evaluate(() => {
  const out = [];
  document.querySelectorAll('[data-etiquetas] > span').forEach((e, i) => { const r = e.getBoundingClientRect(); out.push({ nombre: 'etiqueta' + i, x: r.left, y: r.top, w: r.width, h: r.height }); });
  const o = document.querySelector('[data-objeto]').getBoundingClientRect(); out.push({ nombre: 'pastilla', x: o.left, y: o.top, w: o.width, h: o.height });
  document.querySelectorAll('[data-linea] > span').forEach((l, i) => { const rg = document.createRange(); rg.selectNodeContents(l); [...rg.getClientRects()].forEach((r, j) => { if (r.width > 4) out.push({ nombre: `linea${i}.${j}`, x: r.left, y: r.top, w: r.width, h: r.height }); }); });
  return out;
});

const salida = {};
try {
  // 1) Capa de delante sobre el contenido, por posición del cursor
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
    const ctx = await nav.newContext({ viewport: vp }); const p = await ctx.newPage();
    await p.goto(URL); await p.locator('html[data-listo]').waitFor({ state: 'attached' }); await p.waitForTimeout(1500);
    const rects = await rectsContenido(p);
    await p.addStyleTag({ content: 'html[data-listo] * { visibility: hidden !important; } html[data-listo] .portada { background: rgb(128,128,128) !important; } html[data-listo] .portada, html[data-listo] [data-capa], html[data-listo] [data-capa] * { visibility: visible !important; } html[data-listo] .portada__capa--atras { opacity: 0 !important; }' });
    const cursores = { reposo: null, postulate: [vp.width - 100, 30], tema: [vp.width - 220, 30], logo: [90, 30], arribaCentro: [vp.width / 2, 120], abajoIzq: [40, vp.height - 40], abajoDer: [vp.width - 40, vp.height - 40], centro: [vp.width / 2, vp.height / 2] };
    const clave = `${vp.width}x${vp.height}`;
    salida[clave] = {};
    for (const [nombre, c] of Object.entries(cursores)) {
      if (c) await p.mouse.move(c[0], c[1], { steps: 5 });
      await p.waitForTimeout(2500);
      const png = await p.screenshot();
      if (vp.width === 1440) writeFileSync(join(OUT, `delante-${nombre}.png`), png);
      salida[clave][nombre] = (await analizar(png, rects, 'gris')).filter((x) => x.tapado > 0.01);
    }
    await ctx.close();
  }
  // Foto completa con el cursor sobre «Postúlate» y abajo a la izquierda
  {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto(URL); await p.locator('html[data-listo]').waitFor({ state: 'attached' }); await p.waitForTimeout(1500);
    await p.mouse.move(1340, 30, { steps: 5 }); await p.waitForTimeout(2500);
    writeFileSync(join(OUT, 'completa-cursor-postulate.png'), await p.screenshot());
    await p.mouse.move(60, 860, { steps: 5 }); await p.waitForTimeout(2500);
    writeFileSync(join(OUT, 'completa-cursor-abajo-izq.png'), await p.screenshot());
    await ctx.close();
  }
  // 2 y 3) Contraste contra la trama, vuelta al reposo y densidad
  {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto(URL); await p.locator('html[data-listo]').waitFor({ state: 'attached' }); await p.waitForTimeout(1200);
    const rects = await rectsContenido(p);
    await p.mouse.move(1430, 890); await p.waitForTimeout(1500);
    await p.addStyleTag({ content: 'nav, [data-capa], [data-etiquetas], h1 { visibility: hidden !important; }' });
    await p.waitForTimeout(200);
    const reposo = await p.screenshot(); writeFileSync(join(OUT, 'trama-reposo.png'), reposo);
    salida.contrasteReposo = await analizar(reposo, rects, 'contraste');
    await p.mouse.move(450, 310); await p.mouse.move(1000, 310, { steps: 30 }); await p.mouse.move(800, 420, { steps: 15 });
    await p.waitForTimeout(60);
    const tocada = await p.screenshot(); writeFileSync(join(OUT, 'trama-tocada.png'), tocada);
    salida.contrasteTocada = await analizar(tocada, rects, 'contraste');
    await p.waitForTimeout(1500);
    const vuelta = await p.screenshot();
    const lector = await nav.newPage();
    salida.vueltaAlReposo = await lector.evaluate(async ([a, b]) => {
      const leer = async (s) => { const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob()); const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; };
      const [da, db] = [await leer(a), await leer(b)]; let n = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30) n++; return n / (da.length / 4);
    }, [reposo.toString('base64'), vuelta.toString('base64')]);
    salida.densidad = await lector.evaluate(async (b64) => {
      const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const zona = (x, y, w, h) => { const d = g.getImageData(x, y, w, h).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - 44) + Math.abs(d[i + 1] - 8) + Math.abs(d[i + 2] - 255) > 40) n++; return +(n / (d.length / 4)).toFixed(3); };
      return { centro: zona(570, 380, 300, 200), esquinaSupIzq: zona(0, 70, 300, 200), esquinaInfDer: zona(1140, 700, 300, 200) };
    }, reposo.toString('base64'));
    await lector.close(); await ctx.close();
  }
  // 4) load tardío: la cursiva tarda 6 s
  {
    const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    const errores = []; p.on('pageerror', (e) => errores.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
    await p.route('**/*italic*.woff2', async (r) => { await new Promise((s) => setTimeout(s, 6000)); await r.continue(); });
    await p.addInitScript(() => { window.__s = []; const v = setInterval(() => { const pc = document.querySelector('[data-precarga]'); window.__s.push([Math.round(performance.now()), pc ? getComputedStyle(pc).opacity : 'x', document.querySelector('[data-precarga-cuenta]')?.textContent ?? '-', document.documentElement.hasAttribute('data-listo'), document.readyState]); if (window.__s.length > 400) clearInterval(v); }, 50); });
    await p.goto(URL, { waitUntil: 'commit' }); await p.waitForTimeout(7000);
    const s = await p.evaluate(() => window.__s);
    const cambios = s.filter((x, i) => i === 0 || JSON.stringify(x.slice(2)) !== JSON.stringify(s[i - 1].slice(2)) || (x[1] === 'x') !== (s[i - 1][1] === 'x'));
    salida.loadTardio = { cambios: cambios.slice(-14), errores };
    await ctx.close();
  }
} finally {
  await nav.close();
  if (process.platform === 'win32') { try { execSync(`taskkill /PID ${servidor.pid} /T /F`, { stdio: 'ignore' }); } catch { /* ya cerrado */ } } else servidor.kill();
}
writeFileSync(join(OUT, 'sondas.json'), JSON.stringify(salida, null, 1));
console.log(JSON.stringify(salida));
