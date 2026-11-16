import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { esperarListo, irA } from '../comunes/ayudas';

// Pruebas de aceptación de T07 (postulación). Corren en modo demostración (sin variables de Supabase): miden
// los dos caminos, la validación campo por campo, la trampa, la autorización de la Ley 1581 y los eventos
// que llegan de otras secciones. El envío real a Supabase se comprueba aparte, con las credenciales del autor.
// Selectores: #postulacion · [data-formulario] · [data-bloque="idea"|"equipo"] · [data-estado] · [data-enviar]

async function abrir(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await esperarListo(page);
  await irA(page, '#postulacion');
}

async function llenarComunes(page: Page): Promise<void> {
  await page.locator('#p-nombre').fill('Persona de Prueba');
  await page.locator('#p-correo').fill('prueba@unbosque.edu.co');
  await page.locator('#p-area').selectOption('Psicología');
  await page.locator('#p-programa').fill('Psicología, 3.º');
}

const estado = (page: Page) => page.locator('[data-estado]');
const enviar = (page: Page) => page.locator('[data-enviar]');

test.describe('T07 · Postulación', () => {
  test('el formulario vive en #postulacion, que es a donde bajan los dos «Postúlate»', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('#postulacion [data-formulario]')).toBeVisible();
    const destinos = await page.locator('a', { hasText: 'Postúlate' }).evaluateAll((els) => els.map((a) => (a instanceof HTMLAnchorElement ? a.hash : '')));
    expect(destinos.length).toBeGreaterThanOrEqual(2);
    expect(new Set(destinos)).toEqual(new Set(['#postulacion']));
  });

  test('dos caminos: cada uno muestra solo sus campos', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[data-bloque="idea"]')).toBeVisible();
    await expect(page.locator('[data-bloque="equipo"]')).toBeHidden();
    await page.getByLabel('Quiero sumarme').check();
    await expect(page.locator('[data-bloque="idea"]')).toBeHidden();
    await expect(page.locator('[data-bloque="equipo"]')).toBeVisible();
    await page.getByLabel('Tengo una idea').check();
    await expect(page.locator('[data-bloque="idea"]')).toBeVisible();
  });

  test('vacío no se envía: dice qué falta, marca el campo y le deja el foco', async ({ page }) => {
    await abrir(page);
    await enviar(page).click();
    await expect(estado(page)).toHaveText('Completa nombre, correo, facultad y programa.');
    await expect(page.locator('#p-nombre')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#p-nombre')).toBeFocused();
    // Al escribir, el campo deja de estar marcado.
    await page.locator('#p-nombre').fill('A');
    await expect(page.locator('#p-nombre')).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('camino «Tengo una idea»: valida en orden correo, nombre de la idea, regla y autorización', async ({ page }) => {
    await abrir(page);
    await llenarComunes(page);
    await page.locator('#p-correo').fill('correo-sin-arroba');
    await enviar(page).click();
    await expect(estado(page)).toContainText('Revisa el correo');
    await expect(page.locator('#p-correo')).toBeFocused();

    await page.locator('#p-correo').fill('prueba@unbosque.edu.co');
    await enviar(page).click();
    await expect(estado(page)).toHaveText('Ponle nombre a tu idea.');
    await page.locator('#p-idea').fill('Idea de prueba');
    await enviar(page).click();
    await expect(estado(page)).toHaveText('Escribe la regla de tu idea en una frase.');
    await page.locator('#p-regla').fill('Una regla en una frase.');

    // Ley 1581: sin autorización expresa no se envía.
    await enviar(page).click();
    await expect(estado(page)).toContainText('autorización de tratamiento de datos');
    await expect(page.locator('#p-consentimiento')).toBeFocused();
    await expect(page.locator('#p-consentimiento')).not.toBeChecked();
  });

  test('camino «Quiero sumarme»: pide una habilidad, horas de 1 a 40 y un enlace con https', async ({ page }) => {
    await abrir(page);
    await page.getByLabel('Quiero sumarme').check();
    await llenarComunes(page);
    await page.locator('#p-consentimiento').check();
    await enviar(page).click();
    await expect(estado(page)).toHaveText('Marca al menos una habilidad.');
    await page.locator('input[name="habilidades"][value="Diseño"]').check();
    await page.locator('#p-horas').fill('80');
    await enviar(page).click();
    await expect(estado(page)).toHaveText('Las horas por semana van de 1 a 40.');
    await page.locator('#p-horas').fill('6');
    await page.locator('#p-portafolio').fill('miportafolio.com');
    await enviar(page).click();
    await expect(estado(page)).toContainText('debe empezar por https://');
  });

  test('en modo demostración lo dice antes y después de enviar, y no finge que guardó', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[data-demo]')).toContainText('[DEMOSTRACIÓN]');
    await llenarComunes(page);
    await page.locator('#p-idea').fill('Idea de prueba');
    await page.locator('#p-regla').fill('Una regla en una frase.');
    await page.locator('#p-consentimiento').check();
    await enviar(page).click();
    await expect(estado(page)).toContainText('Modo demostración');
    await expect(estado(page)).not.toContainText('Postulación recibida');
    // Lo escrito sigue ahí: nada se perdió.
    await expect(page.locator('#p-idea')).toHaveValue('Idea de prueba');
    await expect(enviar(page)).toBeEnabled();
  });

  test('la trampa para bots no se ve ni se alcanza con el teclado, y si se llena no se envía nada', async ({ page }) => {
    await abrir(page);
    const trampa = page.locator('#p-sitio');
    await expect(trampa).toHaveAttribute('tabindex', '-1');
    const caja = await trampa.evaluate((el) => {
      const r = el.parentElement?.getBoundingClientRect();
      return r ? r.width * r.height : Infinity;
    });
    expect(caja, 'área visible de la trampa').toBeLessThanOrEqual(1);
    await llenarComunes(page);
    await page.locator('#p-idea').fill('Idea de prueba');
    await page.locator('#p-regla').fill('Una regla en una frase.');
    await page.locator('#p-consentimiento').check();
    await trampa.evaluate((el) => {
      if (el instanceof HTMLInputElement) el.value = 'https://spam.example';
    });
    await enviar(page).click();
    // Al bot se le responde como si hubiera funcionado; el aviso de demostración (el envío real) no aparece.
    await expect(estado(page)).toContainText('Postulación recibida');
  });

  test('recibe algora:sumarse y algora:reclamar de otras secciones', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('algora:sumarse', { detail: { idea: 'Proyecto X', faltan: ['Legal', 'Datos'] } })));
    await expect(page.locator('input[name="tipo"][value="equipo"]')).toBeChecked();
    await expect(page.locator('#p-proyecto')).toHaveValue('Proyecto X');
    await expect(page.locator('input[name="habilidades"]:checked')).toHaveCount(2);
    await expect(page.locator('#p-nombre')).toBeFocused();
    await expect(page.locator('#p-nombre')).toBeInViewport();

    await page.evaluate(() => document.dispatchEvent(new CustomEvent('algora:reclamar', { detail: { regla: 'Mi regla en una frase' } })));
    await expect(page.locator('input[name="tipo"][value="idea"]')).toBeChecked();
    await expect(page.locator('#p-regla')).toHaveValue('Mi regla en una frase');
    await expect(page.locator('#p-idea')).toBeFocused();
  });

  for (const tema of ['light', 'dark'] as const) {
    test(`axe sobre el formulario con un error a la vista (tema ${tema})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await abrir(page);
      await page.getByLabel('Quiero sumarme').check();
      await page.locator('input[name="habilidades"][value="Diseño"]').check();
      await enviar(page).click();
      await expect(estado(page)).toBeVisible();
      const resultado = await new AxeBuilder({ page }).include('#postulacion').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const graves = resultado.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} × ${v.nodes.length}: ${v.help}`);
      expect(graves).toEqual([]);
    });
  }
});
