#!/usr/bin/env node
/**
 * Capturas de una tarea para el VISTO BUENO del autor y para el auditor.
 *
 * En headless, los agentes no tienen navegador (sin interfaz): las capturas las toma este
 * script con Playwright, siempre igual, sobre el build de producción.
 *
 * Uso (desde la raíz del repo, después de un build):
 *   node fabrica/scripts/capturas.mjs <ID>
 *
 * Rutas: las del campo `rutas` del encabezado de la tarea (por defecto «/»). Por cada
 * ruta, en JPEG, en fabrica/buzon/<ID>/capturas/:
 *   - La matriz de 19 pantallas del responsive (matriz/vistas.mjs; celular y tablet
 *     con dedo), cada una en capturas/matriz/<ruta>/ y juntas en tres hojas por ruta:
 *     <ruta>-telefonos.jpg, <ruta>-acostado-tablet.jpg y <ruta>-escritorio-ancho.jpg. Mira las hojas.
 *     Y todas en una sola foto, <ruta>-breakpoints.jpg (autor, 2026-10-18): la que se le muestra al autor.
 *   - 1440 × 900 y 390 × 844, con movimiento normal y reducido, y la página completa.
 * Con --sin-matriz solo saca lo segundo (más rápido, para una revisión puntual).
 *
 * Contrato con el sitio: cuando la página termina su entrada (preloader, animación de llegada) pone
 * `data-listo` en <html>. Las capturas esperan esa señal hasta 25 s; si no llega, capturan igual y
 * lo avisan. Así ninguna captura sale a mitad del preloader (falla F21).
 */
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerFrontmatter } from './lib/globs.mjs';
import { puertos } from './lib/repo.mjs';
import { tomarTurno } from './lib/turno.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITIO = join(RAIZ, 'sitio');
const ID = process.argv[2];
if (!ID) {
  console.error('Uso: node fabrica/scripts/capturas.mjs <ID>');
  process.exit(2);
}
if (!existsSync(join(SITIO, 'dist'))) {
  console.error('No hay sitio/dist: corre las compuertas (o npm run build) antes.');
  process.exit(2);
}

// Playwright vive en las dependencias del sitio, no en la fábrica.
const { chromium, devices } = createRequire(join(SITIO, 'package.json'))('@playwright/test');
const { VISTAS } = await import('./matriz/vistas.mjs');
const CON_MATRIZ = !process.argv.includes('--sin-matriz');
// Las hojas de contacto: un grupo de pantallas por hoja.
const GRUPOS = {
  telefonos: { vistas: ['320x568', '360x780', '375x667', '390x844', '430x932'], alto: 620 },
  'acostado-tablet': { vistas: ['667x375', '844x390', '768x1024', '1024x1366', '1180x820', '1024x768'], alto: 420 },
  'escritorio-ancho': { vistas: ['1366x650', '1440x900', '1920x1080', '2560x1440', '2560x1080', '3440x1440', '5120x1440', '3840x2160'], alto: 300 },
};
// La foto con todos los breakpoints (autor, 2026-10-18): las 19 pantallas de la ruta en una sola imagen, por grupos.
const FOTO = [
  ['Celulares', ['320x568', '360x780', '375x667', '390x844', '430x932'], 640],
  ['Celular acostado y tablets', ['667x375', '844x390', '768x1024', '1024x1366', '1180x820', '1024x768'], 440],
  ['Portátiles y escritorio', ['1366x650', '1440x900', '1920x1080', '2560x1440'], 380],
  ['Ultraanchos y 4K', ['2560x1080', '3440x1440', '5120x1440', '3840x2160'], 300],
];

const dirTareas = join(RAIZ, 'fabrica/proyecto/tareas');
const archivo = readdirSync(dirTareas).find((f) => f.startsWith(`${ID}-`) && f.endsWith('.md'));
const tarea = archivo ? leerFrontmatter(readFileSync(join(dirTareas, archivo), 'utf8')) : {};
const rutas = tarea.rutas?.length ? tarea.rutas : ['/'];

// El puerto es fijo (4331) y el taskkill del final mata el árbol del servidor que lanzó este script.
// Las capturas cargan el procesador como una suite: toman el turno de pruebas.
const PUERTO = puertos().capturas;
const destino = join(RAIZ, 'fabrica/buzon', ID, 'capturas');
mkdirSync(destino, { recursive: true });

const soltarTurno = await tomarTurno(`capturas ${ID}`);
const servidor = spawn(`npx astro preview --port ${PUERTO}`, { cwd: SITIO, shell: true, stdio: 'ignore' });
const esperar = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://localhost:${PUERTO}/`)).ok) return;
    } catch {
      // todavía arrancando
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('astro preview no respondió en 30 s');
};

const nombre = (ruta) => (ruta === '/' ? 'inicio' : ruta.replace(/^\/|\/$/g, '').replace('#', 'ancla-').replace(/\//g, '_'));
const relativa = (p) => p.slice(RAIZ.length + 1).replace(/\\/g, '/');
const hechas = [];

// Una espera fija captura el preloader a medias (le pasó a la fábrica con 3,5 s): se espera la señal
// `data-listo` de <html> y un respiro para la entrada; si no llega en 25 s se captura igual y se avisa.
async function asentar(pagina, etiqueta) {
  const ok = await pagina.waitForFunction(() => document.documentElement.hasAttribute('data-listo'), null, { timeout: 25_000 }).then(() => true, () => false);
  if (!ok) console.log(`  ⚠ ${etiqueta}: la página no puso data-listo en <html> en 25 s; la captura puede mostrar la carga`);
  await pagina.waitForTimeout(600); // la entrada termina de asentarse
}

// La ruta en las 19 pantallas, como la ve el visitante (celular y tablet con dedo y su navegador),
// y las tres hojas que la juntan.
async function matriz(navegador, ruta) {
  const dir = join(destino, 'matriz', nombre(ruta));
  mkdirSync(dir, { recursive: true });
  const tomas = new Map();
  for (const [vista, ancho, alto, tipo] of VISTAS) {
    const tactil = tipo !== 'pc';
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: alto },
      isMobile: tactil,
      hasTouch: tactil,
      ...(tactil ? { userAgent: devices[tipo === 'tel' ? 'iPhone 13' : 'iPad Pro 11'].userAgent } : {}),
    });
    const pagina = await ctx.newPage();
    await pagina.goto(`http://localhost:${PUERTO}${ruta}`, { waitUntil: 'load', timeout: 30_000 }).catch(() => {});
    await asentar(pagina, `${vista} ${ruta}`); // la entrada, la caída y el data-listo de cada nivel
    const salida = join(dir, `${vista}.jpg`);
    await pagina.screenshot({ path: salida, type: 'jpeg', quality: 70 });
    tomas.set(vista, salida);
    await ctx.close();
  }
  const hoja = await navegador.newPage({ viewport: { width: 2400, height: 800 } });
  for (const [grupo, { vistas, alto }] of Object.entries(GRUPOS)) {
    const piezas = vistas
      .filter((v) => tomas.has(v))
      .map((v) => `<figure style="display:inline-block;vertical-align:top;margin:0 12px 12px 0"><figcaption style="color:#ff0;font:22px system-ui;padding:4px 0">${v}</figcaption><img src="data:image/jpeg;base64,${readFileSync(tomas.get(v)).toString('base64')}" style="display:block;height:${alto}px"></figure>`)
      .join('');
    await hoja.setContent(`<body style="margin:0;padding:8px;width:2400px;background:#808080">${piezas}</body>`);
    const salida = join(destino, `${nombre(ruta)}-${grupo}.jpg`);
    await hoja.screenshot({ path: salida, type: 'jpeg', quality: 75, fullPage: true });
    hechas.push(relativa(salida));
  }
  const img = (v) => `data:image/jpeg;base64,${readFileSync(tomas.get(v)).toString('base64')}`;
  const grupos = FOTO.map(([titulo, vistas, alto]) => `<h2 style="margin:16px 0 12px;font:bold 40px system-ui;color:#fff">${titulo}</h2>
    <div style="display:flex;flex-wrap:wrap;gap:20px 24px">${vistas.filter((v) => tomas.has(v)).map((v) => `<figure style="margin:0"><figcaption style="color:#ffd600;font:bold 24px system-ui;padding-bottom:8px">${v.replace('x', ' × ')}</figcaption><img src="${img(v)}" style="display:block;height:${alto}px;outline:1px solid #5a5a5a"></figure>`).join('')}</div>`).join('');
  await hoja.setViewportSize({ width: 2600, height: 800 });
  await hoja.setContent(`<body style="margin:0;padding:24px 40px 40px;width:2520px;background:#202022">${grupos}</body>`);
  const foto = join(destino, `${nombre(ruta)}-breakpoints.jpg`);
  await hoja.screenshot({ path: foto, type: 'jpeg', quality: 85, fullPage: true });
  hechas.push(relativa(foto));
  await hoja.close();
}
try {
  await esperar();
  // WebGL en la tarjeta de video, como las pruebas. Sin un modo explícito el WebGL sale en negro o se
  // dibuja por software (SwiftShader), lento y con tiempos que fallan al azar.
  const navegador = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
  for (const ruta of rutas) {
    if (CON_MATRIZ) await matriz(navegador, ruta);
    for (const [ancho, alto] of [[1440, 900], [390, 844]]) {
      for (const movimiento of ['no-preference', 'reduce']) {
        const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: movimiento });
        await pagina.goto(`http://localhost:${PUERTO}${ruta}`, { waitUntil: 'networkidle' });
        await asentar(pagina, `${ruta} ${ancho}`);
        const archivoSalida = join(destino, `${nombre(ruta)}-${ancho}${movimiento === 'reduce' ? '-reducido' : ''}.jpg`);
        await pagina.screenshot({ path: archivoSalida, type: 'jpeg', quality: 70 });
        hechas.push(archivoSalida.slice(RAIZ.length + 1).replace(/\\/g, '/'));
        // v2.3: la página completa, recorrida con la rueda para que aparezca lo que entra al
        // hacer scroll. El primer pantallazo solo no muestra lo que entra después.
        if (movimiento === 'no-preference') {
          const alto = await pagina.evaluate(() => document.documentElement.scrollHeight);
          for (let y = 0; y < alto; y += 500) { await pagina.mouse.wheel(0, 500); await pagina.waitForTimeout(120); }
          await pagina.evaluate(() => window.scrollTo(0, 0));
          await pagina.waitForTimeout(300);
          const completa = archivoSalida.replace(/\.jpg$/, '-completa.jpg');
          await pagina.screenshot({ path: completa, type: 'jpeg', quality: 60, fullPage: true });
          hechas.push(completa.slice(RAIZ.length + 1).replace(/\\/g, '/'));
        }
        await pagina.close();
      }
    }
  }
  // v2.2 · Estados y comparación contra el referente (fabrica/proyecto/referentes/<ID>.json).
  // Cada estado se captura igual que el frame del referente —mismo tamaño, mismo momento— y
  // cada aspecto que «se toma» queda en una hoja: referente a la izquierda, lo nuestro a la derecha.
  const archivoRef = join(RAIZ, 'fabrica/proyecto/referentes', `${ID}.json`);
  if (existsSync(archivoRef)) {
    const ref = JSON.parse(readFileSync(archivoRef, 'utf8'));
    const capturaDe = new Map();
    for (const e of ref.estados ?? []) {
      const pagina = await navegador.newPage({ viewport: { width: e.ancho ?? 1440, height: e.alto ?? 900 }, reducedMotion: e.movimiento ?? 'no-preference' });
      await pagina.goto(`http://localhost:${PUERTO}${e.ruta}`, { waitUntil: e.esperarRed === false ? 'load' : 'networkidle' }).catch(() => {});
      await asentar(pagina, `estado ${e.nombre}`);
      for (const p of e.pasos ?? []) {
        if (p.esperar) await pagina.waitForTimeout(p.esperar);
        if (p.rueda) { await pagina.mouse.move((e.ancho ?? 1440) / 2, (e.alto ?? 900) / 2); await pagina.mouse.wheel(0, p.rueda); }
        if (p.clic) await pagina.locator(p.clic).first().click({ timeout: 5000 }).catch((err) => console.log(`  ⚠ ${e.nombre}: no pude hacer clic en ${p.clic} (${err.message.split('\n')[0]})`));
        if (p.cursor) await pagina.locator(p.cursor).first().hover({ timeout: 5000 }).catch((err) => console.log(`  ⚠ ${e.nombre}: no pude pasar el cursor por ${p.cursor} (${err.message.split('\n')[0]})`));
        if (p.tecla) await pagina.keyboard.press(p.tecla);
        // Lleva el borde de arriba de un elemento a una fracción del alto de la pantalla (0 = arriba), sin rueda.
        if (p.ir) await pagina.evaluate(({ sel, en }) => { const el = document.querySelector(sel); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - innerHeight * en); }, { sel: p.ir, en: p.en ?? 0 }).catch(() => {});
        // Un barrido del ratón de [x0, y0] a [x1, y1] (efectos que siguen al cursor).
        if (p.barrido) { const [[x0, y0], [x1, y1]] = p.barrido; await pagina.mouse.move(x0, y0); await pagina.mouse.move(x1, y1, { steps: 40 }); }
      }
      const salida = join(destino, `estado-${e.nombre}.jpg`);
      await pagina.screenshot({ path: salida, type: 'jpeg', quality: 75 });
      capturaDe.set(e.nombre, salida);
      hechas.push(salida.slice(RAIZ.length + 1).replace(/\\/g, '/'));
      await pagina.close();
    }

    const dirComp = join(destino, 'comparacion');
    mkdirSync(dirComp, { recursive: true });
    const aUrl = (p) => `data:image/jpeg;base64,${readFileSync(p).toString('base64')}`;
    const hoja = await navegador.newPage({ viewport: { width: 1800, height: 700 } });
    for (const r of ref.referentes ?? []) {
      for (const a of r.se_toma ?? []) {
        const izq = join(RAIZ, a.referente);
        const der = capturaDe.get(a.estado);
        if (!existsSync(izq)) { console.log(`  ⚠ ${a.id}: falta la captura del referente ${a.referente}`); continue; }
        if (!der) { console.log(`  ⚠ ${a.id}: ningún estado se llama «${a.estado}»`); continue; }
        const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
        await hoja.setContent(`<body style="margin:0;background:#111;color:#eee;font:15px system-ui">
          <div style="padding:10px 14px"><b>${esc(a.id)}</b> · ${esc(a.aspecto)} <span style="color:#999">— ${esc(a.fuente)}</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 8px 8px">
            <figure style="margin:0"><img src="${aUrl(izq)}" style="width:100%"><figcaption style="color:#999">Referente · ${esc(r.sitio ?? '')}</figcaption></figure>
            <figure style="margin:0"><img src="${aUrl(der)}" style="width:100%"><figcaption style="color:#999">Nuestro · estado «${esc(a.estado)}»</figcaption></figure>
          </div></body>`);
        const salida = join(dirComp, `${a.id}.jpg`);
        await hoja.screenshot({ path: salida, type: 'jpeg', quality: 75, fullPage: true });
        hechas.push(salida.slice(RAIZ.length + 1).replace(/\\/g, '/'));
      }
    }
    await hoja.close();
  }

  await navegador.close();
  console.log(`${hechas.length} capturas en fabrica/buzon/${ID}/capturas/:\n${hechas.map((h) => `  - ${h}`).join('\n')}`);
} finally {
  soltarTurno();
  // En Windows, servidor.kill() solo mata el cmd de shell:true y deja vivo el árbol npx → cmd → node
  // de astro, que conserva el candado de «astro preview» y tumba la compuerta e2e. Se mata el árbol
  // entero desde el PID del hijo (/T), de forma síncrona para que no quede nada al salir.
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${servidor.pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // ya había salido
    }
  } else {
    servidor.kill();
  }
}
