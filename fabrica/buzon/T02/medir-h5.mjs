// Mide H5 de T02: las piezas 3D no deben depender del scroll. Uso (desde la raíz, con sitio/dist construido):
//   node fabrica/buzon/T02/medir-h5.mjs
// Para cada tamaño toma tres cuadros con solo las capas 3D visibles sobre gris plano:
//   reposo   = carga normal
//   control  = cambiar al tamaño final sin haber bajado
//   scroll   = bajar 400 px con la rueda, cambiar al tamaño final y volver arriba
// y cuenta, por cada una de las seis celdas (3 columnas x 2 filas), los píxeles que no son el gris.
// `control` y `scroll` deben tener pieza en las mismas celdas. Usa el puerto 4392 (rango 4390-4399).
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SITIO = join(RAIZ, 'sitio');
const { chromium } = createRequire(join(SITIO, 'package.json'))('@playwright/test');
const PUERTO = 4392;
const TAMANOS = [
  { ancho: 1440, alto: 900, final: 880 },
  { ancho: 375, alto: 667, final: 640 },
];

const servidor = spawn(`npx astro preview --port ${PUERTO}`, { cwd: SITIO, shell: true, stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://localhost:${PUERTO}/`)).ok) break;
  } catch {
    // arrancando
  }
  await new Promise((r) => setTimeout(r, 500));
}

// Solo las capas 3D visibles, sobre gris plano: lo que no es gris es una pieza.
const SOLO_PIEZAS = `
  html[data-listo] * { visibility: hidden !important; }
  html[data-listo] .portada { background: rgb(128,128,128) !important; }
  html[data-listo] .portada, html[data-listo] [data-capa], html[data-listo] [data-capa] * { visibility: visible !important; }
`;

async function celdas(navegador, pagina) {
  const base64 = (await pagina.screenshot({ type: 'png', clip: undefined })).toString('base64');
  const lector = await navegador.newPage();
  const salida = await lector.evaluate(async (b64) => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
    const c = new OffscreenCanvas(img.width, img.height);
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const { data, width, height } = g.getImageData(0, 0, img.width, img.height);
    const cuenta = [0, 0, 0, 0, 0, 0];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const gris = Math.abs(data[i] - 128) < 8 && Math.abs(data[i + 1] - 128) < 8 && Math.abs(data[i + 2] - 128) < 8;
        if (!gris) cuenta[Math.floor((y / height) * 2) * 3 + Math.floor((x / width) * 3)]++;
      }
    }
    return cuenta;
  }, base64);
  await lector.close();
  return salida;
}

const navegador = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
let fallos = 0;
try {
  for (const t of TAMANOS) {
    const resultado = {};
    for (const caso of ['control', 'scroll']) {
      const pagina = await navegador.newPage({ viewport: { width: t.ancho, height: t.alto } });
      await pagina.goto(`http://localhost:${PUERTO}/`);
      await pagina.locator('html[data-listo]').waitFor({ state: 'attached', timeout: 15_000 });
      await pagina.waitForTimeout(2500);
      await pagina.addStyleTag({ content: SOLO_PIEZAS });
      if (caso === 'control') {
        resultado.reposo = await celdas(navegador, pagina);
      } else {
        await pagina.mouse.move(t.ancho / 2, t.alto / 2);
        await pagina.mouse.wheel(0, 400);
        await pagina.waitForTimeout(1800);
      }
      await pagina.setViewportSize({ width: t.ancho, height: t.final });
      if (caso === 'scroll') {
        await pagina.mouse.wheel(0, -2000);
        await pagina.waitForTimeout(1800);
        const y = await pagina.evaluate(() => window.scrollY);
        if (y !== 0) console.log(`  aviso: scrollY = ${y} al volver arriba`);
      }
      await pagina.waitForTimeout(1500);
      resultado[caso] = await celdas(navegador, pagina);
      await pagina.close();
    }
    const presente = (v) => v.map((n) => (n > 150 ? 1 : 0)).join('');
    // Las piezas giran, así que el conteo varía un poco: se exige misma presencia y que el conteo de cada celda
    // con pieza no se desplome (una pieza sacada o cortada baja una celda a menos de la mitad).
    const proporcion = resultado.scroll.map((n, i) => (resultado.control[i] > 150 ? n / resultado.control[i] : 1));
    const igual =
      presente(resultado.control) === presente(resultado.scroll) &&
      presente(resultado.scroll) === presente(resultado.reposo) &&
      proporcion.every((r) => r >= 0.55 && r <= 1.8);
    if (!igual) fallos++;
    console.log(`${t.ancho}x${t.alto} -> ${t.ancho}x${t.final}  (celdas: fila de arriba izq/centro/der, fila de abajo)`);
    console.log(`  reposo  ${resultado.reposo.join(' ')}  presencia ${presente(resultado.reposo)}`);
    console.log(`  control ${resultado.control.join(' ')}  presencia ${presente(resultado.control)}`);
    console.log(`  scroll  ${resultado.scroll.join(' ')}  presencia ${presente(resultado.scroll)}`);
    console.log(`  scroll/control por celda: ${proporcion.map((r) => r.toFixed(2)).join(' ')}`);
    console.log(`  ${igual ? 'IGUAL' : 'DISTINTO'}`);
  }
} finally {
  await navegador.close();
  try {
    execSync(`taskkill /pid ${servidor.pid} /T /F`, { stdio: 'ignore' });
  } catch {
    // ya cerrado
  }
}
console.log(fallos === 0 ? 'H5: MISMO RESULTADO CON Y SIN SCROLL' : `H5: ${fallos} tamaño(s) cambian con el scroll`);
process.exit(fallos === 0 ? 0 : 1);
