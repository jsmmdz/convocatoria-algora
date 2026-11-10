#!/usr/bin/env node
/**
 * Captura los referentes con enlace (fábrica v2.2), siempre con los mismos pasos.
 *
 * Los referentes son el estándar de calidad del auditor, pero los sitios cambian y los agentes
 * no tienen navegador: lo que el auditor mira son capturas fechadas. Este script las rehace
 * siempre con los mismos pasos, definidos en referentes/_sitios.json.
 *
 *   node fabrica/scripts/referentes.mjs              todos los sitios
 *   node fabrica/scripts/referentes.mjs <nombre>     solo uno
 *
 * WebGL corre en la tarjeta de video: sin un modo explícito, los sitios con WebGL salen en negro.
 *
 * ⚠ Los tiempos de un preloader dependen de la red: con el sitio en caché la carga corre más rápido
 * y se salta estados. Captura en la primera visita (contexto nuevo) y compara antes de reemplazar.
 *
 * Las capturas quedan en referentes/capturas/ y no se suben al repo (son de otros sitios: .gitignore).
 * Lo corre el orquestador, nunca un agente, y el resultado se revisa antes de versionarlo.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Playwright vive en sitio/, pero en el arranque el sitio todavía no existe: se busca también en
// PLAYWRIGHT_DESDE (una carpeta con @playwright/test instalado) y en la carpeta desde la que se corre.
function playwright() {
  for (const desde of [join(RAIZ, 'sitio'), process.env.PLAYWRIGHT_DESDE, process.cwd()].filter(Boolean)) {
    try { return createRequire(join(desde, 'package.json'))('@playwright/test'); } catch { /* sigue */ }
  }
  console.error('No encontré @playwright/test: instálalo en sitio/ o define PLAYWRIGHT_DESDE con una carpeta que lo tenga.');
  process.exit(2);
}
const { chromium } = playwright();
const config = JSON.parse(readFileSync(join(RAIZ, 'referentes/_sitios.json'), 'utf8'));
const DESTINO = join(RAIZ, 'referentes/capturas');
mkdirSync(DESTINO, { recursive: true });

const solo = process.argv[2];
const sitios = config.sitios.filter((s) => !solo || s.nombre === solo);
if (!sitios.length) {
  console.error(`No hay un sitio «${solo}» en _sitios.json`);
  process.exit(2);
}

const navegador = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  for (const sitio of sitios) {
   // `anchos` (opcional): [[1440, 900], [390, 844]]. Con más de uno, cada archivo lleva el ancho al final.
   // Cada ancho en un contexto nuevo: es la primera visita, con el preloader completo.
   const anchos = sitio.anchos ?? [[1440, 900]];
   for (const [ancho, alto] of anchos) {
    const contexto = await navegador.newContext({ viewport: { width: ancho, height: alto } });
    const pagina = await contexto.newPage();
    // sinEsperarCarga: cuando el preloader ES el referente, no se espera a que termine de cargar.
    const carga = pagina.goto(sitio.url, { waitUntil: sitio.sinEsperarCarga ? 'commit' : 'networkidle', timeout: 90000 });
    if (!sitio.sinEsperarCarga) await carga.catch((e) => console.log(`  ⚠ ${sitio.nombre}: ${e.message.split('\n')[0]}`));
    else carga.catch(() => {});
    for (const toma of sitio.tomas) {
      for (const p of toma.pasos) {
        if (p.esperar) await pagina.waitForTimeout(p.esperar);
        if (p.rueda) { await pagina.mouse.move(ancho / 2, alto / 2); for (let k = 0; k < 6; k++) { await pagina.mouse.wheel(0, p.rueda / 6); await pagina.waitForTimeout(150); } }
        if (p.clicXY) await pagina.mouse.click(...p.clicXY);
        if (p.moverXY) await pagina.mouse.move(...p.moverXY);
        if (p.arrastrar) { await pagina.mouse.move(...p.arrastrar[0]); await pagina.mouse.down(); await pagina.mouse.move(...p.arrastrar[1], { steps: 20 }); await pagina.mouse.up(); }
        if (p.clic) await pagina.locator(p.clic).first().click({ timeout: 5000 }).catch(() => console.log(`  ⚠ no pude hacer clic en ${p.clic}`));
        if (p.cursor) await pagina.locator(p.cursor).first().hover({ timeout: 5000 }).catch(() => console.log(`  ⚠ no pude pasar el cursor por ${p.cursor}`));
        if (p.tecla) await pagina.keyboard.press(p.tecla);
      }
      const archivo = anchos.length > 1 ? toma.archivo.replace(/\.jpg$/, `-${ancho}.jpg`) : toma.archivo;
      await pagina.screenshot({ path: join(DESTINO, archivo), type: 'jpeg', quality: 80 });
      console.log(`  ✔ referentes/capturas/${archivo}`);
    }
    await contexto.close();
   }
  }
} finally {
  await navegador.close();
}
console.log('Revisa las capturas: si el sitio cambió desde la ficha, la ficha y docs/1-PRODUCTO.md también.');
