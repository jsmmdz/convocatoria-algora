import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { VISTAS } from '../../../fabrica/scripts/matriz/vistas.mjs';
import { esperarListo } from '../comunes/ayudas';

// Pruebas de aceptación de T09 (cierre). axe en las 20 pantallas de la matriz, en claro y oscuro, en las dos
// rutas (las comunes solo miden una pantalla), el pie nuevo, los metadatos y los presupuestos de peso
// medidos sobre el build (docs/2-TECNICO § 6).

const DIST = join(process.cwd(), 'dist');
const pantallas = VISTAS.map((v) => ({ nombre: String(v[0]), ancho: Number(v[1]), alto: Number(v[2]), tipo: String(v[3]) }));

test.describe('T09 · axe en las 20 pantallas', () => {
  for (const ruta of ['/', '/equipo/']) {
    for (const tema of ['light', 'dark'] as const) {
      test(`${ruta} en ${tema}: sin violaciones serias ni críticas en ninguna pantalla`, async ({ browser }) => {
        test.setTimeout(240_000);
        const fallos: string[] = [];
        for (const { nombre, ancho, alto, tipo } of pantallas) {
          const contexto = await browser.newContext({
            viewport: { width: ancho, height: alto },
            colorScheme: tema,
            hasTouch: tipo !== 'pc',
            isMobile: tipo === 'tel',
          });
          const page = await contexto.newPage();
          await page.goto(ruta, { waitUntil: 'networkidle' });
          await esperarListo(page);
          if (ruta === '/equipo/') await page.locator('[data-demo]').click();
          const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
          for (const v of resultado.violations) {
            if (v.impact === 'serious' || v.impact === 'critical') fallos.push(`${nombre}: ${v.id} × ${v.nodes.length} (${v.nodes[0]?.target.join(' ')})`);
          }
          await contexto.close();
        }
        expect(fallos).toEqual([]);
      });
    }
  }
});

test.describe('T09 · pie y metadatos', () => {
  test('el pie cierra con una frase grande, un Postúlate que baja al formulario y el acceso del equipo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    const pie = page.getByRole('contentinfo');
    await expect(pie).toContainText('Semillero Algora');
    await expect(pie).toContainText('fechas por confirmar');
    await expect(pie.getByRole('link', { name: 'Acceso del equipo' })).toBeVisible();
    const postular = pie.getByRole('link', { name: 'Postúlate' });
    await expect(postular).toBeVisible();
    expect(await postular.evaluate((a) => (a instanceof HTMLAnchorElement ? a.hash : ''))).toBe('#postulacion');
    // Bloque con aire: bastante más alto que las tres líneas de antes (319 px a 390).
    const caja = await pie.boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThan(400);
    expect(caja?.width ?? 0).toBeGreaterThanOrEqual(1439);
  });

  test('desde el panel, el Postúlate del pie lleva al formulario de la página principal', async ({ page }) => {
    await page.goto('/equipo/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await page.getByRole('contentinfo').getByRole('link', { name: 'Postúlate' }).click();
    await expect(page).toHaveURL(/\/#postulacion$/);
    await expect(page.locator('#postulacion')).toBeVisible();
  });

  test('cada página trae favicon, título, descripción e imagen para redes que existen', async ({ page, request }) => {
    for (const ruta of ['/', '/equipo/']) {
      await page.goto(ruta, { waitUntil: 'networkidle' });
      const meta = await page.evaluate(() => {
        const leer = (s: string, atributo: string): string => document.querySelector(s)?.getAttribute(atributo) ?? '';
        return {
          titulo: document.title,
          descripcion: leer('meta[name="description"]', 'content'),
          icono: leer('link[rel="icon"]', 'href'),
          ogTitulo: leer('meta[property="og:title"]', 'content'),
          ogDescripcion: leer('meta[property="og:description"]', 'content'),
          ogImagen: leer('meta[property="og:image"]', 'content'),
          idioma: document.documentElement.lang,
        };
      });
      expect(meta.titulo.length, 'título').toBeGreaterThan(5);
      expect(meta.descripcion.length, 'descripción').toBeGreaterThan(30);
      expect(meta.ogTitulo.length, 'og:title').toBeGreaterThan(5);
      expect(meta.ogDescripcion.length, 'og:description').toBeGreaterThan(30);
      expect(meta.idioma).toBe('es-CO');
      for (const recurso of [meta.icono, meta.ogImagen]) {
        expect(recurso, `recurso de ${ruta}`).not.toBe('');
        const respuesta = await request.get(new URL(recurso, page.url()).pathname);
        expect(respuesta.status(), recurso).toBe(200);
      }
    }
  });
});

test.describe('T09 · presupuestos de peso (sobre dist/)', () => {
  const archivos = (dir: string): string[] =>
    existsSync(dir) ? readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? archivos(join(dir, n)) : [join(dir, n)])) : [];

  test('el JS que carga la página principal pesa menos de 220 KB en gzip y no trae Three ni Supabase', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    const precargas = [...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
    const iniciales = [...new Set([...scripts, ...precargas])];
    expect(iniciales.length).toBeGreaterThan(0);
    let total = 0;
    for (const src of iniciales) {
      const ruta = join(DIST, src.replace(/^\//, ''));
      const codigo = readFileSync(ruta);
      total += gzipSync(codigo).length;
      const texto = codigo.toString('utf8');
      // Marcas propias de cada librería: si aparecen, entró al JS inicial y dejó de ser import dinámico.
      expect(texto.includes('WebGLRenderer') && texto.includes('THREE'), `${src} trae Three`).toBe(false);
      expect(texto.includes('supabase-js') || texto.includes('PostgrestClient'), `${src} trae Supabase`).toBe(false);
    }
    expect(total, 'gzip del JS inicial').toBeLessThan(220_000);
  });

  test('las fuentes pesan menos de 250 KB y la página, sin modelos, menos de 1,5 MB', () => {
    const todos = archivos(DIST);
    const peso = (filtro: (r: string) => boolean): number => todos.filter(filtro).reduce((suma, r) => suma + statSync(r).size, 0);
    expect(peso((r) => r.endsWith('.woff2')), 'fuentes').toBeLessThan(250_000);
    // Lo que puede llegar a bajar un visitante de la página principal: todo dist menos el panel y los modelos.
    const transferible = todos
      .filter((r) => !r.endsWith('.glb') && !r.includes(`${join('dist', 'equipo')}`))
      .reduce((suma, r) => suma + (/\.(js|css|html|svg)$/.test(r) ? gzipSync(readFileSync(r)).length : statSync(r).size), 0);
    expect(transferible, 'página completa (gzip en texto)').toBeLessThan(1_500_000);
  });
});
