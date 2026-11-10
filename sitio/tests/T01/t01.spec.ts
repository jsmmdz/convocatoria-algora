import { test, expect, type Page } from '@playwright/test';

// Pruebas de aceptación de T01 (andamio). Las escribe el orquestador; el constructor no las edita.
// Miden el resultado (colores pintados, fuentes cargadas, peticiones de red), no el mecanismo (F11, F15).

const MARCA: Record<string, string> = {
  '--color-papel': '#f6f8fb',
  '--color-tinta': '#0d0d0d',
  '--color-acido': '#d1ff22',
  '--color-cobalto': '#2c08ff',
  '--color-tomate': '#ff103e',
  '--color-magenta': '#ff3d8a',
};
const PAPEL = 'rgb(246, 248, 251)';
const TINTA = 'rgb(13, 13, 13)';

async function fondoDelBody(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

// Normaliza cualquier color CSS a #rrggbb dibujándolo en un canvas.
async function hex(page: Page, color: string): Promise<string | null> {
  return page.evaluate((c) => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx || !c.trim()) return null;
    ctx.fillStyle = '#010203';
    ctx.fillStyle = c.trim();
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    if (r === 1 && g === 2 && b === 3) return null;
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }, color);
}

test.describe('T01 · andamio', () => {
  test('los tokens de marca tienen los hex exactos del manual', async ({ page }) => {
    await page.goto('/');
    for (const [nombre, esperado] of Object.entries(MARCA)) {
      const valor = await page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n), nombre);
      expect(await hex(page, valor), `${nombre} = «${valor.trim()}»`).toBe(esperado);
    }
  });

  test('los tokens de marca son iguales en tema claro y oscuro (del sistema y forzado)', async ({ page }) => {
    // Oscuro por el sistema, sin atributo.
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    for (const [nombre, esperado] of Object.entries(MARCA)) {
      const valor = await page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n), nombre);
      expect(await hex(page, valor), `${nombre} en oscuro del sistema`).toBe(esperado);
    }
    // Oscuro y claro forzados por el botón, con el sistema al revés.
    for (const [sistema, forzado] of [['light', 'dark'], ['dark', 'light']] as const) {
      await page.emulateMedia({ colorScheme: sistema });
      await page.goto('/');
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, forzado);
      for (const [nombre, esperado] of Object.entries(MARCA)) {
        const valor = await page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n), nombre);
        expect(await hex(page, valor), `${nombre} con data-theme=${forzado}`).toBe(esperado);
      }
    }
  });

  test('el tema sigue al sistema: papel en claro, tinta en oscuro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    expect(await fondoDelBody(page)).toBe(PAPEL);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    expect(await fondoDelBody(page)).toBe(TINTA);
  });

  test('el botón de tema cambia el fondo y la elección sobrevive a recargar', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const boton = page.getByRole('button', { name: /cambiar tema/i });
    await expect(boton).toBeVisible();
    await boton.click();
    await expect.poll(() => fondoDelBody(page)).toBe(PAPEL);
    await page.reload();
    expect(await fondoDelBody(page), 'tras recargar sigue en claro').toBe(PAPEL);
    await page.getByRole('button', { name: /cambiar tema/i }).click();
    await expect.poll(() => fondoDelBody(page)).toBe(TINTA);
  });

  test('el texto se lee en los dos temas (contraste del cuerpo ≥ 7:1)', async ({ page }) => {
    for (const esquema of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: esquema });
      await page.goto('/');
      const [fondo, texto] = await page.evaluate(() => {
        const s = getComputedStyle(document.body);
        return [s.backgroundColor, s.color];
      });
      const ratio = await page.evaluate(([a, b]) => {
        const lum = (c: string) => {
          const [r, g, bb] = (c.match(/\d+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
          const lin = (v: number) => { const x = v / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
          return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bb);
        };
        const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (l1 + 0.05) / (l2 + 0.05);
      }, [fondo, texto]);
      expect(ratio, `${esquema}: ${texto} sobre ${fondo}`).toBeGreaterThanOrEqual(7);
    }
  });

  test('las cuatro fuentes del manual se cargan desde el propio sitio', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const cargadas = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')));
    for (const familia of [/DM Serif Text/i, /Zalando Sans/i, /JetBrains Mono/i, /Rubik Bubbles/i]) {
      expect(cargadas.some((f) => familia.test(f)), `${familia} cargada (cargadas: ${cargadas.join(', ')})`).toBe(true);
    }
    const usos = await page.evaluate(() => ({
      h1: getComputedStyle(document.querySelector('h1') ?? document.body).fontFamily,
      body: getComputedStyle(document.body).fontFamily,
    }));
    expect(usos.h1, 'el h1 usa DM Serif Text').toMatch(/DM Serif Text/i);
    expect(usos.body, 'el cuerpo usa Zalando Sans').toMatch(/Zalando Sans/i);
  });

  test('ninguna petición sale del propio sitio', async ({ page, baseURL }) => {
    const origen = new URL(baseURL ?? 'http://localhost').origin;
    const externas: string[] = [];
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith('data:') && !u.startsWith('blob:') && new URL(u).origin !== origen) externas.push(u);
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(externas).toEqual([]);
  });

  test('data-listo aparece en <html> en menos de 4 s', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html[data-listo]')).toHaveCount(1, { timeout: 4000 });
  });

  test('Lenis se monta con movimiento normal y no con movimiento reducido', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(false);
  });

  test('navegación: logo al inicio, botón de tema y «Postúlate» a #postulate, fija al bajar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: /algora/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /postúlate/i })).toHaveAttribute('href', /#postulate$/);
    const familia = await nav.getByRole('link', { name: /algora/i }).evaluate((el) => getComputedStyle(el).fontFamily);
    expect(familia, 'el logo usa Rubik Bubbles').toMatch(/Rubik Bubbles/i);
    // Página alta de prueba; se espera a que Lenis (si está) recalcule su límite antes de girar la rueda.
    await page.evaluate(() => document.body.style.setProperty('min-height', '300vh'));
    await page.waitForTimeout(400);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 1200);
    await expect.poll(() => page.evaluate(() => window.scrollY), { message: 'la página bajó', timeout: 4000 }).toBeGreaterThan(300);
    await page.waitForTimeout(300);
    const caja = await nav.boundingBox();
    expect(Math.abs(caja?.y ?? Infinity), 'la nav sigue pegada arriba después de bajar').toBeLessThanOrEqual(1);
    expect(caja?.height ?? 0, 'la nav se ve').toBeGreaterThan(20);
  });

  test('el pie es un bloque de tinta a sangre con el texto del semillero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const pie = page.getByRole('contentinfo');
    await expect(pie).toContainText('Semillero Algora');
    await expect(pie).toContainText('Universidad El Bosque');
    const { fondo, ancho } = await pie.evaluate((el) => ({ fondo: getComputedStyle(el).backgroundColor, ancho: el.getBoundingClientRect().width }));
    expect(fondo).toBe(TINTA);
    expect(ancho, 'a sangre: ocupa todo el ancho').toBeGreaterThanOrEqual(1440 - 1);
  });

  test('la página de error responde 404 y enlaza al inicio', async ({ page }) => {
    const respuesta = await page.goto('/no-existe-esta-ruta/');
    expect(respuesta?.status()).toBe(404);
    const enlace = page.getByRole('link', { name: /inicio/i }).first();
    await expect(enlace).toHaveAttribute('href', /\/$/);
  });
});
