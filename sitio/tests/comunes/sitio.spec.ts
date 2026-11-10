import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { rutasDelBuild } from './rutas';

// Pruebas comunes a todo el sitio. Cada una traduce a código un criterio que antes
// era prosa en «Cuándo terminaste» o una regla del núcleo (reglas.md § 5).

const RUTAS = rutasDelBuild();

// Avisos del renderizador por software de Chromium sin interfaz (SwiftShader), no del sitio.
// Filtro estrecho: solo mensajes de rendimiento del driver y el aviso de fallback a software.
const RUIDO_DEL_DRIVER = [
  /^\[\.WebGL-[0-9a-fx]+\]GL Driver Message \([^)]*Performance/i,
  /Automatic fallback to software WebGL has been deprecated/i,
];

// Convierte cualquier color CSS (incluido color-mix) a sRGB dibujándolo en un canvas.
async function rgb(page: Page, color: string): Promise<[number, number, number] | null> {
  return page.evaluate((c) => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#010203'; // centinela: si el color no se entiende, queda este
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    if (r === 1 && g === 2 && b === 3) return null;
    return [r, g, b] as [number, number, number];
  }, color);
}

function contraste(a: [number, number, number], b: [number, number, number]): number {
  const lum = ([r, g, b]: [number, number, number]) => {
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const [claro, oscuro] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

for (const ruta of RUTAS) {
  test.describe(`ruta ${ruta}`, () => {
    test('carga sin errores ni advertencias en consola', async ({ page }) => {
      const problemas: string[] = [];
      page.on('console', (m) => {
        if ((m.type() === 'error' || m.type() === 'warning') && !RUIDO_DEL_DRIVER.some((r) => r.test(m.text()))) problemas.push(`${m.type()}: ${m.text()}`);
      });
      page.on('pageerror', (e) => problemas.push(`pageerror: ${e.message}`));
      const respuesta = await page.goto(ruta, { waitUntil: 'networkidle' });
      expect(respuesta?.status(), 'código HTTP').toBe(200);
      expect(problemas, 'consola').toEqual([]);
    });

    test('a 375 px no hay scroll horizontal', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(ruta, { waitUntil: 'networkidle' });
      const anchos = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, cuerpo: document.body.scrollWidth, ventana: window.innerWidth }));
      expect(anchos.documento, JSON.stringify(anchos)).toBeLessThanOrEqual(anchos.ventana);
      expect(anchos.cuerpo, JSON.stringify(anchos)).toBeLessThanOrEqual(anchos.ventana);
    });

    test('axe: sin violaciones serias ni críticas (WCAG 2.2 A/AA)', async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'networkidle' });
      const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const graves = resultado.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id} (${v.impact}) × ${v.nodes.length}: ${v.help}`);
      expect(graves, 'violaciones graves de axe').toEqual([]);
    });

    test('con movimiento reducido: sin scroll secuestrado y con el contenido visible', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(ruta, { waitUntil: 'networkidle' });
      const estado = await page.evaluate(() => {
        const overflow = (el: Element) => getComputedStyle(el).overflowY;
        const escenario = document.querySelector('main');
        return {
          html: overflow(document.documentElement),
          body: overflow(document.body),
          escenarioVisible: escenario ? getComputedStyle(escenario).opacity !== '0' && getComputedStyle(escenario).visibility !== 'hidden' : true,
        };
      });
      expect(estado.html, 'overflow de html').not.toBe('hidden');
      expect(estado.body, 'overflow de body').not.toBe('hidden');
      expect(estado.escenarioVisible, '<main> visible').toBe(true);
    });

    test('teclado: cada elemento enfocable muestra foco con contraste ≥ 3:1 contra el fondo', async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'networkidle' });
      const fondoTexto = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const fondo = await rgb(page, fondoTexto);
      test.skip(!fondo, `no se pudo leer el fondo (${fondoTexto})`);
      const vistos = new Set<string>();
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        const foco = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const s = getComputedStyle(el);
          const id = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}:${(el.textContent ?? '').trim().slice(0, 30)}`;
          return { id, estilo: s.outlineStyle, ancho: parseFloat(s.outlineWidth), color: s.outlineColor, sombra: s.boxShadow };
        });
        if (!foco || vistos.has(foco.id)) break; // se dio la vuelta o no hay nada enfocable
        vistos.add(foco.id);
        const visible = (foco.estilo !== 'none' && foco.ancho > 0) || foco.sombra !== 'none';
        expect(visible, `foco visible en ${foco.id}`).toBe(true);
        if (foco.estilo !== 'none' && foco.ancho > 0) {
          const color = await rgb(page, foco.color);
          if (color && fondo) expect(contraste(color, fondo), `contraste del foco en ${foco.id} (${foco.color} sobre ${fondoTexto})`).toBeGreaterThanOrEqual(3);
        }
      }
    });
  });
}
