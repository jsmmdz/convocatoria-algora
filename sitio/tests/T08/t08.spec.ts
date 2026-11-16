import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { esperarListo } from '../comunes/ayudas';

// Pruebas de aceptación de T08 (panel del equipo). Corren en modo demostración (sin variables de Supabase),
// con los datos de ejemplo en memoria: filtrar, aprobar, marcar equipo completo, borrar con confirmación y
// descargar CSV. La entrada con Supabase Auth se comprueba aparte, con las credenciales del autor.
// Selectores: [data-vista] · [data-demo] · [data-filas] · [data-filtro] · [data-cifras] · [data-csv] · [data-salir]

async function abrirDemo(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/equipo/', { waitUntil: 'networkidle' });
  await esperarListo(page);
  await page.locator('[data-demo]').click();
  await expect(page.locator('[data-filas] tr')).toHaveCount(6);
}

const filas = (page: Page) => page.locator('[data-filas] tr');
const cifra = (page: Page, nombre: string) => page.locator('[data-cifras] .cifra', { hasText: nombre }).locator('dd');

test.describe('T08 · Panel del equipo', () => {
  test('sin Supabase lo dice, no muestra postulaciones y los buscadores no la listan', async ({ page }) => {
    await page.goto('/equipo/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await expect(page.locator('[data-vista="sin-conexion"]')).toBeVisible();
    await expect(page.locator('[data-vista="panel"]')).toBeHidden();
    await expect(page.locator('[data-vista="entrar"]')).toBeHidden();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('se llega desde el pie del sitio', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await page.getByRole('contentinfo').getByRole('link', { name: 'Acceso del equipo' }).click();
    await expect(page).toHaveURL(/\/equipo\/$/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('la demostración está marcada y las cifras cuentan lo que hay en la tabla', async ({ page }) => {
    await abrirDemo(page);
    await expect(page.locator('[data-marca-demo]')).toContainText('[DEMOSTRACIÓN]');
    await expect(cifra(page, 'Postulaciones')).toHaveText('6');
    await expect(cifra(page, 'Con idea')).toHaveText('4');
    await expect(cifra(page, 'Para sumarse')).toHaveText('2');
    await expect(cifra(page, 'Ideas por revisar')).toHaveText('1');
  });

  test('filtra por tipo, por área y por estado', async ({ page }) => {
    await abrirDemo(page);
    await page.locator('[data-filtro="tipo"]').selectOption('equipo');
    await expect(filas(page)).toHaveCount(2);
    await page.locator('[data-filtro="tipo"]').selectOption('');
    await page.locator('[data-filtro="area"]').selectOption('Ingeniería');
    await expect(filas(page)).toHaveCount(2);
    await page.locator('[data-filtro="area"]').selectOption('');
    await page.locator('[data-filtro="estado"]').selectOption('pendiente');
    await expect(filas(page)).toHaveCount(1);
    await expect(filas(page).first()).toContainText('Pixel Bosque');
    await page.locator('[data-filtro="estado"]').selectOption('aprobada');
    await expect(filas(page)).toHaveCount(2);
    await page.locator('[data-filtro="tipo"]').selectOption('equipo');
    await expect(filas(page).first()).toHaveText('No hay postulaciones con este filtro.');
  });

  test('aprobar una idea para la hélice y marcar su equipo completo', async ({ page }) => {
    await abrirDemo(page);
    const pixel = filas(page).filter({ hasText: 'Pixel Bosque' });
    await expect(pixel.getByRole('button', { name: 'Aprobar' })).toHaveAttribute('aria-pressed', 'false');
    await pixel.getByRole('button', { name: 'Aprobar' }).click();
    await expect(pixel.getByRole('button', { name: 'En la hélice' })).toHaveAttribute('aria-pressed', 'true');
    await expect(cifra(page, 'Ideas por revisar')).toHaveText('0');
    await pixel.getByRole('button', { name: 'Busca equipo' }).click();
    await expect(pixel.getByRole('button', { name: 'Equipo completo' })).toHaveAttribute('aria-pressed', 'true');
    // Quien no autorizó publicar no se puede aprobar; quien se suma no tiene hélice.
    await expect(filas(page).filter({ hasText: 'Racha de Estudio' })).toContainText('No autorizó publicar');
    await expect(filas(page).filter({ hasText: 'Racha de Estudio' }).getByRole('button', { name: 'Aprobar' })).toHaveCount(0);
  });

  test('borrar pide confirmación: un clic no borra, el segundo sí', async ({ page }) => {
    await abrirDemo(page);
    const fila = filas(page).filter({ hasText: 'Pixel Bosque' });
    const borrar = fila.locator('.boton--peligro');
    await borrar.click();
    await expect(borrar).toHaveText('¿Seguro? Borrar');
    await expect(filas(page)).toHaveCount(6);
    await borrar.click();
    await expect(filas(page)).toHaveCount(5);
    await expect(filas(page).filter({ hasText: 'Pixel Bosque' })).toHaveCount(0);
    await expect(cifra(page, 'Postulaciones')).toHaveText('5');
  });

  test('descarga un CSV con lo filtrado, con cabecera, tildes y comillas bien puestas', async ({ page }) => {
    await abrirDemo(page);
    await page.locator('[data-filtro="tipo"]').selectOption('idea');
    const [descarga] = await Promise.all([page.waitForEvent('download'), page.locator('[data-csv]').click()]);
    expect(descarga.suggestedFilename()).toMatch(/^postulaciones-algora-\d{4}-\d{2}-\d{2}\.csv$/);
    const ruta = await descarga.path();
    const contenido = readFileSync(ruta, 'utf8');
    expect(contenido.charCodeAt(0), 'BOM para Excel').toBe(0xfeff);
    const lineas = contenido.slice(1).split('\n');
    expect(lineas[0]).toMatch(/^created_at,tipo,nombre,correo,area,programa,idea,regla/);
    expect(lineas).toHaveLength(1 + 4);
    expect(contenido).toContain('"Ciencias Económicas y Administrativas"');
    expect(contenido).toContain('"Desarrollo; Diseño"');
  });

  test('cerrar la demostración vuelve al aviso y deja de mostrar datos', async ({ page }) => {
    await abrirDemo(page);
    await page.locator('[data-salir]').click();
    await expect(page.locator('[data-vista="sin-conexion"]')).toBeVisible();
    await expect(page.locator('[data-vista="panel"]')).toBeHidden();
  });

  test('a 390 px la tabla se desplaza dentro de su caja y la página no', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/equipo/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await page.locator('[data-demo]').click();
    await expect(filas(page)).toHaveCount(6);
    const anchos = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }));
    expect(anchos.documento).toBeLessThanOrEqual(anchos.ventana);
  });

  for (const tema of ['light', 'dark'] as const) {
    test(`axe con el panel abierto y un botón de borrar armado (tema ${tema})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await abrirDemo(page);
      await filas(page).first().locator('.boton--peligro').click();
      const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const graves = resultado.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} × ${v.nodes.length}: ${v.help}`);
      expect(graves).toEqual([]);
    });
  }
});
