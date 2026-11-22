import { test, expect, devices, type Page } from '@playwright/test';
import { esperarListo } from './ayudas';

// Portada blanca en celulares de visitantes (reporte del autor, 2026-11-22). Los canvas WebGL transparentes
// (trama, marco de tinta) escribían (color, alfa) sin premultiplicar y pedían premultipliedAlpha: false. Hay
// dispositivos que ignoran esa bandera: el papel de cada píxel se sumaba al cobalto y la portada se veía blanca,
// con el titular casi invisible. Se mide en los píxeles de la captura, no en el CSS (el CSS siempre dio cobalto).

const COBALTO: [number, number, number] = [44, 8, 255];

/** Fracción de una rejilla de puntos de la portada visible cuyo color está cerca del cobalto. */
async function fraccionCobalto(page: Page): Promise<number> {
  const caja = await page.locator('.portada').boundingBox();
  if (!caja) throw new Error('sin portada');
  const alto = Math.min(caja.height, page.viewportSize()!.height) - caja.y;
  const png = await page.screenshot({ clip: { x: caja.x, y: caja.y, width: caja.width, height: alto } });
  return page.evaluate(
    async ({ datos, ref }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${datos}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      let cerca = 0;
      let total = 0;
      for (let y = 0; y < c.height; y += 8) {
        for (let x = 0; x < c.width; x += 8) {
          const i = (y * c.width + x) * 4;
          const d = Math.hypot(data[i] - ref[0], data[i + 1] - ref[1], data[i + 2] - ref[2]);
          if (d < 60) cerca++;
          total++;
        }
      }
      return cerca / total;
    },
    { datos: png.toString('base64'), ref: COBALTO },
  );
}

/** Simula el dispositivo que ignora premultipliedAlpha: false (fuerza true en todo contexto WebGL). */
async function ignorarBanderaPremultiplicado(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error: se envuelve la firma sobrecargada
    HTMLCanvasElement.prototype.getContext = function (tipo: string, opciones?: Record<string, unknown>) {
      if (opciones && opciones.premultipliedAlpha === false) opciones = { ...opciones, premultipliedAlpha: true };
      return original.call(this, tipo, opciones);
    };
  });
}

const celular = devices['iPhone 13'];

for (const [nombre, preparar] of [
  ['normal', async () => {}],
  ['en un dispositivo que ignora premultipliedAlpha: false', ignorarBanderaPremultiplicado],
] as const) {
  test.describe(`portada azul, ${nombre}`, () => {
    test.use({ viewport: celular.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    for (const tema of ['light', 'dark'] as const) {
      test(`la portada se ve cobalto en tema ${tema}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: tema });
        await preparar(page);
        await page.goto('/');
        await esperarListo(page);
        await page.waitForTimeout(1200); // la trama y las piezas ya dibujadas
        // Con la portada normal más de la mitad de la rejilla es cobalto puro (la trama y las piezas son finas);
        // con el defecto bajaba a ~0.
        expect(await fraccionCobalto(page)).toBeGreaterThan(0.45);
      });
    }
  });
}
