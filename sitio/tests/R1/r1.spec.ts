import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { esperarListo, irA } from '../comunes/ayudas';

// Pruebas de aceptación de R1 (responsive). Corren con pantalla táctil de verdad (`hasTouch`): el corte del
// sitio (R-7) es «ancho y puntero fino», así que una tableta de 1024 px usa el modo de celular.
// Miden el resultado en los bordes del rango (F13): 320 a 1024 táctil y un celular acostado.
// Contrato: fabrica/proyecto/tareas/R1-responsive.md.

const PANTALLAS: Array<[number, number]> = [
  [320, 568],
  [375, 667],
  [390, 844],
  [430, 932],
  [844, 390],
  [768, 1024],
  [1024, 1366],
];
const RUTAS = ['/', '/equipo/'];

async function tactil(browser: Browser, ancho: number, alto: number, reducido = false): Promise<{ contexto: BrowserContext; page: Page }> {
  const contexto = await browser.newContext({
    viewport: { width: ancho, height: alto },
    hasTouch: true,
    isMobile: ancho < 800,
    reducedMotion: reducido ? 'reduce' : 'no-preference',
  });
  const page = await contexto.newPage();
  return { contexto, page };
}

test.describe('R1 · en cualquier pantalla táctil', () => {
  for (const ruta of RUTAS) {
    for (const [ancho, alto] of PANTALLAS) {
      test(`${ruta} a ${ancho} × ${alto}: sin scroll horizontal, se toca con el dedo y el texto se lee`, async ({ browser }) => {
        const { contexto, page } = await tactil(browser, ancho, alto);
        await page.goto(ruta, { waitUntil: 'networkidle' });
        await esperarListo(page);
        if (ruta === '/equipo/') {
          await page.locator('[data-demo]').click();
          await expect(page.locator('[data-filas] tr')).toHaveCount(6);
        }
        // Recorre la página para que lo que entra con el scroll ya esté puesto.
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += alto) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(120);
        }

        const medida = await page.evaluate(() => {
          const visible = (el: Element): boolean => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
          };
          const toques: string[] = [];
          for (const el of document.querySelectorAll('a[href], button, input, select, textarea')) {
            if (!visible(el) || el.closest('[aria-hidden="true"]')) continue;
            // Un enlace dentro de un párrafo de texto corrido no es un botón (WCAG 2.5.8, excepción «en línea»).
            if (el.tagName === 'A' && el.parentElement?.tagName === 'P' && (el.parentElement.textContent ?? '').trim() !== (el.textContent ?? '').trim()) continue;
            // La tabla del panel se desplaza dentro de su caja: sus botones se miden igual.
            let r = el.getBoundingClientRect();
            // Una casilla o un radio se tocan por su etiqueta.
            if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
              const etiqueta = el.closest('label');
              if (etiqueta) r = etiqueta.getBoundingClientRect();
            }
            if (r.width < 43.5 || r.height < 43.5) {
              toques.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className).split(' ')[0]} ${Math.round(r.width)}×${Math.round(r.height)}`);
            }
          }
          const textos: string[] = [];
          for (const el of document.querySelectorAll('main p, main li, main td, footer p')) {
            if (!visible(el)) continue;
            const propio = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0);
            if (!propio) continue;
            const s = getComputedStyle(el);
            // Los rótulos mono del manual (etiquetas entre corchetes) se quedan en 12 px (R-6).
            if (/JetBrains|monospace/i.test(s.fontFamily)) continue;
            if (parseFloat(s.fontSize) < 15.5) textos.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${s.fontSize}`);
          }
          return {
            documento: document.documentElement.scrollWidth,
            ventana: window.innerWidth,
            toques: [...new Set(toques)],
            textos: [...new Set(textos)],
          };
        });
        expect(medida.documento, 'ancho del documento').toBeLessThanOrEqual(medida.ventana);
        expect(medida.toques, 'objetivos táctiles de menos de 44 × 44').toEqual([]);
        expect(medida.textos, 'párrafos de menos de 16 px').toEqual([]);
        await contexto.close();
      });
    }
  }

  test('a 390 × 844 nada tapa los titulares ni los botones principales', async ({ browser }) => {
    const { contexto, page } = await tactil(browser, 390, 844);
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    const selectores = ['[data-hito-titular]', '[data-productos-titular]', '[data-postular]', '[data-siguiente] h2', '#carreras-titulo', '#proyectos-titulo', '#postulacion-titulo', '[data-enviar]'];
    for (const selector of selectores) {
      const cuantos = await page.locator(selector).count();
      expect(cuantos, selector).toBeGreaterThan(0);
      for (let i = 0; i < cuantos; i++) {
        const el = page.locator(selector).nth(i);
        await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(350);
        const libre = await el.evaluate((e) => {
          const r = e.getBoundingClientRect();
          const arriba = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return arriba !== null && (e === arriba || e.contains(arriba) || arriba.contains(e));
        });
        expect(libre, `${selector} #${i + 1} a la vista y sin nada encima`).toBe(true);
      }
    }
    await contexto.close();
  });
});

test.describe('R1 · Hitos en celular (R-1)', () => {
  for (const [ancho, alto] of [
    [390, 844],
    [768, 1024],
  ] as Array<[number, number]>) {
    test(`a ${ancho} × ${alto} la línea vertical se vuelve sólida al bajar y el unicornio baja con ella`, async ({ browser }) => {
      const { contexto, page } = await tactil(browser, ancho, alto);
      await page.goto('/', { waitUntil: 'networkidle' });
      await esperarListo(page);
      await expect(page.locator('section[data-hitos]')).toHaveAttribute('data-modo', 'vertical');

      const seccion = await page.locator('section[data-hitos]').evaluate((e) => ({ tope: e.getBoundingClientRect().top + window.scrollY, alto: e.getBoundingClientRect().height }));
      // Serie de posiciones al recorrer la sección (F21): no se mide un solo instante.
      const serie: Array<{ solida: number; viajero: number }> = [];
      for (const fraccion of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        await page.evaluate((y) => window.scrollTo(0, y), seccion.tope + seccion.alto * fraccion - alto / 2);
        await page.waitForTimeout(700);
        serie.push(
          await page.evaluate(() => {
            const s = document.querySelector('section[data-hitos]');
            const solida = document.querySelector('[data-linea-solida]');
            const viajero = document.querySelector('[data-viajero]');
            if (!s || !solida || !viajero) return { solida: -1, viajero: -1 };
            const base = s.getBoundingClientRect().top;
            const v = viajero.getBoundingClientRect();
            return { solida: solida.getBoundingClientRect().height, viajero: v.top + v.height / 2 - base };
          }),
        );
      }
      for (let i = 1; i < serie.length; i++) {
        expect(serie[i].solida, `la parte sólida crece (paso ${i})`).toBeGreaterThan(serie[i - 1].solida + 20);
        expect(serie[i].viajero, `el unicornio baja (paso ${i})`).toBeGreaterThan(serie[i - 1].viajero + 20);
      }
      // El unicornio va cerca de donde está la pantalla, no perdido arriba o abajo.
      const visto = await page.locator('[data-viajero]').evaluate((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
      });
      expect(visto, 'unicornio en pantalla al recorrer').toBe(true);
      await contexto.close();
    });
  }

  test('con movimiento reducido no hay línea ni unicornio: los hitos apilados', async ({ browser }) => {
    const { contexto, page } = await tactil(browser, 390, 844, true);
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await expect(page.locator('section[data-hitos]')).not.toHaveAttribute('data-modo', /.+/);
    await expect(page.locator('[data-viajero]')).toBeHidden();
    await expect(page.locator('[data-hito-titular]')).toHaveCount(5);
    await contexto.close();
  });
});

test.describe('R1 · Proyectos en celular (R-2)', () => {
  for (const [ancho, alto] of [
    [390, 844],
    [1024, 1366],
  ] as Array<[number, number]>) {
    test(`a ${ancho} × ${alto} es un carrusel de una pantalla: desliza, cuenta y suma`, async ({ browser }) => {
      const { contexto, page } = await tactil(browser, ancho, alto);
      await page.goto('/', { waitUntil: 'networkidle' });
      await esperarListo(page);
      await irA(page, '#proyectos');
      const seccion = page.locator('[data-proyectos]');
      await expect(seccion).toHaveAttribute('data-modo', 'carrusel');
      await expect(page.locator('[data-posicion]')).toHaveText('01 / 08');
      const altoSeccion = (await seccion.boundingBox())?.height ?? Infinity;
      expect(altoSeccion, 'la sección cabe en poco más de una pantalla').toBeLessThan(alto * 1.2);

      // Flechas: una tarjeta por pulsación; la fila se desliza, la página no.
      await expect(page.locator('[data-anterior]')).toBeDisabled();
      await page.locator('[data-posterior]').tap();
      await expect(page.locator('[data-posicion]')).toHaveText('02 / 08');
      expect(await page.locator('[data-tarjetas]').evaluate((e) => e.scrollLeft)).toBeGreaterThan(50);

      // Deslizar con el scroll nativo de la fila también cuenta.
      await page.locator('[data-tarjetas]').evaluate((e) => {
        const tarjetas = e.querySelectorAll('[data-tarjeta]');
        tarjetas[3]?.scrollIntoView({ inline: 'center', block: 'nearest' });
      });
      await expect(page.locator('[data-posicion]')).toHaveText('04 / 08');
      const anchos = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }));
      expect(anchos.documento).toBeLessThanOrEqual(anchos.ventana);

      // Tocar la tarjeta a la vista = sumarse.
      await page.locator('[data-tarjeta][aria-current="true"]').tap();
      await expect(page.locator('#p-proyecto')).toHaveValue('Turno Express');
      await expect(page.locator('input[name="tipo"][value="equipo"]')).toBeChecked();
      await contexto.close();
    });
  }

  test('el carrusel no usa WebGL ni deja la sección fija', async ({ browser }) => {
    const { contexto, page } = await tactil(browser, 390, 844);
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await irA(page, '#proyectos');
    await expect(page.locator('[data-proyectos]')).toHaveAttribute('data-modo', 'carrusel');
    await page.waitForTimeout(800);
    await expect(page.locator('[data-proyectos]')).not.toHaveAttribute('data-gl', '');
    await expect(page.locator('[data-helice-gl]')).toBeHidden();
    await contexto.close();
  });
});

test.describe('R1 · el escritorio no cambió de modo', () => {
  test('a 1440 × 900 con ratón: hitos y productos fijos en horizontal y proyectos en hélice', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await expect(page.locator('section[data-hitos]')).toHaveAttribute('data-modo', 'horizontal');
    await expect(page.locator('section[data-productos]')).toHaveAttribute('data-modo', 'horizontal');
    await expect(page.locator('[data-proyectos]')).toHaveAttribute('data-modo', 'helice');
  });

  test('una tableta de 1180 × 820 táctil usa el modo de celular, no el de escritorio (R-7)', async ({ browser }) => {
    const { contexto, page } = await tactil(browser, 1180, 820);
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await expect(page.locator('section[data-hitos]')).toHaveAttribute('data-modo', 'vertical');
    await expect(page.locator('section[data-productos]')).not.toHaveAttribute('data-modo', 'horizontal');
    await expect(page.locator('[data-proyectos]')).toHaveAttribute('data-modo', 'carrusel');
    await contexto.close();
  });
});
