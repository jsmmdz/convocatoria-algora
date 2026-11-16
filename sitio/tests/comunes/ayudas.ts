import { expect, type Page } from '@playwright/test';

// Ayudas compartidas por las pruebas de T05–T08.

export type RGB = [number, number, number];

/** Contrato data-listo (docs/2-TECNICO § 2): se mide la página ya entrada y con las fuentes cargadas. */
export async function esperarListo(page: Page): Promise<void> {
  await page.locator('html[data-listo]').waitFor({ state: 'attached', timeout: 6000 });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** Lleva el tope de un elemento al tope de la ventana (el scroll nativo; Lenis y ScrollTrigger lo siguen). */
export async function irA(page: Page, selector: string): Promise<void> {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) throw new Error(`No existe ${s}`);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  }, selector);
}

/** Cualquier color CSS (token, color-mix, rgb…) como [r, g, b] en 0–255, resuelto por el navegador. */
export async function colorDe(page: Page, color: string): Promise<RGB> {
  return page.evaluate((c) => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('sin canvas 2D');
    const valor = c.startsWith('--') ? getComputedStyle(document.documentElement).getPropertyValue(c).trim() : c;
    ctx.fillStyle = valor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b] as [number, number, number];
  }, color);
}

export function contraste(a: RGB, b: RGB): number {
  const lum = ([r, g, bb]: RGB) => {
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bb);
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Fracción de los píxeles de una región de la pantalla que están cerca de un color (lo que se ve, F15). */
export async function fraccionDeColor(page: Page, caja: { x: number; y: number; width: number; height: number }, color: RGB, tolerancia = 48): Promise<number> {
  const png = await page.screenshot({ clip: caja, type: 'png' });
  return page.evaluate(
    async ({ datos, objetivo, tol }) => {
      const imagen = new Image();
      imagen.src = `data:image/png;base64,${datos}`;
      await imagen.decode();
      const lienzo = document.createElement('canvas');
      lienzo.width = imagen.width;
      lienzo.height = imagen.height;
      const ctx = lienzo.getContext('2d');
      if (!ctx) throw new Error('sin canvas 2D');
      ctx.drawImage(imagen, 0, 0);
      const px = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
      let cerca = 0;
      for (let i = 0; i < px.length; i += 4) {
        if (Math.abs(px[i] - objetivo[0]) <= tol && Math.abs(px[i + 1] - objetivo[1]) <= tol && Math.abs(px[i + 2] - objetivo[2]) <= tol) cerca++;
      }
      return cerca / (px.length / 4);
    },
    { datos: png.toString('base64'), objetivo: color, tol: tolerancia },
  );
}

/** Sin errores ni advertencias propias en la consola durante la prueba. */
export function vigilarConsola(page: Page): () => void {
  const problemas: string[] = [];
  const ruido = [/GL Driver Message/i, /Automatic fallback to software WebGL/i];
  page.on('console', (m) => {
    if ((m.type() === 'error' || m.type() === 'warning') && !ruido.some((r) => r.test(m.text()))) problemas.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problemas.push(`pageerror: ${e.message}`));
  return () => expect(problemas, 'consola').toEqual([]);
}
