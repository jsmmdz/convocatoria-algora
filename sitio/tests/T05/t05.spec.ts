import { test, expect } from '@playwright/test';
import { colorDe, contraste, esperarListo, irA } from '../comunes/ayudas';

// Pruebas de aceptación de T05 (Cómo funciona y carreras). Miden el resultado: dónde quedan las columnas,
// el color real de cada banda y el contraste de su texto; no el mecanismo (F11, F15).
// Selectores: [data-siguiente] (entrada de «Cómo funciona») · [data-pasos] · [data-paso] · #carreras · [data-carrera]

const FACULTADES = [
  'Ingeniería',
  'Ciencias Económicas y Administrativas',
  'Creación y Comunicación',
  'Psicología',
  'Ciencias Jurídicas y Políticas',
  'Ciencias de la Salud',
  'Educación',
  'Ciencias',
];

test.describe('T05 · Cómo funciona', () => {
  for (const ancho of [1440, 1024]) {
    test(`a ${ancho} px los 4 pasos son 4 columnas fijas de la misma medida, en una sola fila`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await esperarListo(page);
      const cajas = await page.locator('[data-paso]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })));
      expect(cajas).toHaveLength(4);
      for (const c of cajas) {
        expect(Math.abs(c.y - cajas[0].y), 'misma fila').toBeLessThanOrEqual(1);
        expect(Math.abs(c.h - cajas[0].h), 'mismo alto').toBeLessThanOrEqual(1);
        expect(c.h, 'columnas altas, con aire').toBeGreaterThanOrEqual(380);
      }
      for (let i = 1; i < 4; i++) expect(cajas[i].x, 'una a la derecha de la otra').toBeGreaterThan(cajas[i - 1].x + cajas[i - 1].w - 2);
      // Sin scroll horizontal de la franja (D-7): la última columna termina dentro de la ventana.
      expect(cajas[3].x + cajas[3].w).toBeLessThanOrEqual(ancho);
    });
  }

  test('a 390 px los pasos se apilan y ninguno se sale de la pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    const cajas = await page.locator('[data-paso]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y, w: r.width })));
    for (let i = 1; i < cajas.length; i++) expect(cajas[i].y).toBeGreaterThan(cajas[i - 1].y);
    for (const c of cajas) expect(c.x + c.w).toBeLessThanOrEqual(390);
  });

  test('la entrada de la sección tiene su titular y los pasos llevan título, texto y lo que sale', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await expect(page.locator('[data-siguiente] h2')).toHaveText('De la idea al mercado, con método.');
    await expect(page.locator('[data-paso] h3')).toHaveText(['Postula', 'Arma equipo', 'Prototipa y prueba', 'Presenta']);
    for (const paso of await page.locator('[data-paso]').all()) await expect(paso).toContainText('[SALE]');
  });

  test('lo que entra con el scroll termina a la vista, y con movimiento reducido lo está desde el principio', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await irA(page, '[data-pasos]');
    await expect.poll(() => page.locator('[data-paso]').evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity)), { timeout: 4000 }).toEqual(['1', '1', '1', '1']);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    const opacidades = await page.locator('[data-revelar]').evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
    expect(opacidades.length).toBeGreaterThan(8);
    expect(new Set(opacidades)).toEqual(new Set(['1']));
  });
});

test.describe('T05 · Carreras', () => {
  test('una banda de color a sangre por facultad, con su texto legible sobre ese color', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    const bandas = page.locator('[data-carrera]');
    await expect(bandas.locator('h3')).toHaveText(FACULTADES);
    const medidas = await bandas.evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        const nombre = e.querySelector('h3');
        const aporte = e.querySelector('p');
        return {
          x: r.x,
          w: r.width,
          fondo: getComputedStyle(e).backgroundColor,
          nombre: nombre ? getComputedStyle(nombre).color : '',
          aporte: aporte ? getComputedStyle(aporte).color : '',
          textoAporte: (aporte?.textContent ?? '').trim(),
        };
      }),
    );
    expect(medidas).toHaveLength(8);
    for (const [i, m] of medidas.entries()) {
      expect(m.x, 'a sangre por la izquierda').toBeLessThanOrEqual(0);
      expect(m.w, 'a sangre por la derecha').toBeGreaterThanOrEqual(1440 - 1);
      const fondo = await colorDe(page, m.fondo);
      expect(fondo, `color de la facultad ${i + 1}`).toEqual(await colorDe(page, `--facultad-${i + 1}`));
      expect(contraste(await colorDe(page, m.nombre), fondo), `nombre de la facultad ${i + 1}`).toBeGreaterThanOrEqual(4.5);
      expect(contraste(await colorDe(page, m.aporte), fondo), `aporte de la facultad ${i + 1}`).toBeGreaterThanOrEqual(4.5);
      expect(m.textoAporte.length, 'lo que aporta').toBeGreaterThan(20);
      // Dos bandas seguidas nunca comparten color.
      if (i > 0) expect(m.fondo).not.toBe(medidas[i - 1].fondo);
    }
  });

  test('los bloques de marca son iguales en claro y en oscuro', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    const leer = () => page.locator('[data-carrera]').evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor + getComputedStyle(e).color));
    const claro = await leer();
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    expect(await leer()).toEqual(claro);
  });
});
