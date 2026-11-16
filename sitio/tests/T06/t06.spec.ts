import { test, expect, type Page } from '@playwright/test';
import { colorDe, esperarListo, fraccionDeColor, irA, vigilarConsola } from '../comunes/ayudas';

// Pruebas de aceptación de T06 (hélice de proyectos). Miden lo que el visitante ve y puede hacer: qué
// tarjeta queda al frente al girar con el scroll, las flechas y el teclado, que el canvas pinta de verdad
// la tarjeta (píxeles, F15) y que «Sumarme» deja el formulario listo. Las esperas son por estado (F21).
// Selectores: [data-proyectos] · [data-tarjeta] (aria-current = la del frente) · [data-posicion]
//   [data-anterior] · [data-posterior] · [data-helice-gl]

const IDEAS = ['La Silla del Mes', 'Pixel Bosque', 'Racha de Estudio', 'Turno Express', 'Receta Única', 'Profe Invitado', 'Cláusula Clara', 'Pronóstico U'];

async function abrirEnHelice(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await esperarListo(page);
  await irA(page, '[data-proyectos]');
  await expect(page.locator('[data-proyectos]')).toHaveAttribute('data-modo', 'helice');
  await expect(page.locator('[data-posicion]')).toHaveText('01 / 08');
}

const delFrente = (page: Page) => page.locator('[data-tarjeta][aria-current="true"]');

test.describe('T06 · Hélice de proyectos', () => {
  test('las tarjetas son botones reales con la idea, la regla y la facultad; el canvas no estorba', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    const tarjetas = page.getByRole('button').and(page.locator('[data-tarjeta]'));
    await expect(tarjetas).toHaveCount(8);
    for (const [i, idea] of IDEAS.entries()) {
      await expect(tarjetas.nth(i)).toContainText(idea);
      await expect(tarjetas.nth(i)).toContainText('[EJEMPLO]');
    }
    await expect(page.locator('[data-helice-gl]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('a 1440 px la sección queda fija y el scroll gira la hélice: cada 0,6 pantallas pasa una tarjeta', async ({ page }) => {
    const sinErrores = vigilarConsola(page);
    await abrirEnHelice(page);
    await expect(delFrente(page)).toContainText(IDEAS[0]);
    const etapaAntes = await page.locator('[data-etapa]').boundingBox();

    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 540);
    await expect(page.locator('[data-posicion]')).toHaveText('02 / 08');
    await expect(delFrente(page)).toContainText(IDEAS[1]);
    await page.mouse.wheel(0, 1080);
    await expect(page.locator('[data-posicion]')).toHaveText('04 / 08');

    // La etapa no se movió: la sección está fija mientras gira.
    const etapaDespues = await page.locator('[data-etapa]').boundingBox();
    expect(Math.abs((etapaDespues?.y ?? Infinity) - (etapaAntes?.y ?? 0))).toBeLessThan(1);
    // La del frente queda centrada y entera en la pantalla.
    await expect.poll(async () => {
      const caja = await delFrente(page).boundingBox();
      return caja ? Math.abs(caja.x + caja.width / 2 - 1440 * 0.56) : Infinity;
    }).toBeLessThan(24);
    sinErrores();
  });

  test('el canvas pinta la tarjeta del frente con el color de su facultad, debajo del botón', async ({ page }) => {
    await abrirEnHelice(page);
    await expect(page.locator('[data-proyectos]')).toHaveAttribute('data-gl', '', { timeout: 8000 });
    await expect(page.locator('[data-proyectos]')).toHaveAttribute('data-gl-texto', '', { timeout: 8000 });
    await page.waitForTimeout(400); // deja pintar el cuadro siguiente al montaje
    const caja = await delFrente(page).boundingBox();
    expect(caja).not.toBeNull();
    if (!caja) return;
    // «La Silla del Mes» es de Económicas: ácido. La mayor parte de la tarjeta es de ese color.
    const acido = await colorDe(page, '--facultad-2');
    expect(await fraccionDeColor(page, caja, acido)).toBeGreaterThan(0.6);
    // Y lleva el texto pintado (tinta) dentro: el del DOM está transparente.
    const tinta = await colorDe(page, '--color-tinta');
    expect(await fraccionDeColor(page, caja, tinta, 70)).toBeGreaterThan(0.01);
  });

  test('las flechas giran una tarjeta y se apagan en los extremos', async ({ page }) => {
    await abrirEnHelice(page);
    await expect(page.locator('[data-anterior]')).toBeDisabled();
    await page.locator('[data-posterior]').click();
    await expect(page.locator('[data-posicion]')).toHaveText('02 / 08');
    await page.locator('[data-posterior]').click();
    await expect(page.locator('[data-posicion]')).toHaveText('03 / 08');
    await page.locator('[data-anterior]').click();
    await expect(page.locator('[data-posicion]')).toHaveText('02 / 08');
    await expect(page.locator('[data-anterior]')).toBeEnabled();
  });

  test('con el teclado: Tab llega a una tarjeta, las flechas giran y llevan el foco, Enter suma', async ({ page }) => {
    await abrirEnHelice(page);
    await page.locator('[data-tarjeta]').first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-posicion]')).toHaveText('02 / 08');
    await expect(page.locator('[data-tarjeta]').nth(1)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-tarjeta]').nth(2)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-posicion]')).toHaveText('02 / 08');
    await page.keyboard.press('Enter');
    await expect(page.locator('#p-proyecto')).toHaveValue(IDEAS[1]);
  });

  test('clic en la tarjeta del frente: el formulario queda en «Quiero sumarme» con el proyecto y lo que le falta', async ({ page }) => {
    await abrirEnHelice(page);
    await delFrente(page).click();
    await expect(page.locator('input[name="tipo"][value="equipo"]')).toBeChecked();
    await expect(page.locator('#p-proyecto')).toHaveValue(IDEAS[0]);
    await expect(page.locator('input[name="habilidades"][value="Desarrollo"]')).toBeChecked();
    await expect(page.locator('input[name="habilidades"][value="Diseño"]')).toBeChecked();
    await expect(page.locator('input[name="habilidades"][value="Legal"]')).not.toBeChecked();
    await expect(page.locator('#p-nombre')).toBeFocused();
    await expect(page.locator('#p-nombre')).toBeInViewport();
  });

  test('clic en una tarjeta de los lados la trae al frente y no manda al formulario', async ({ page }) => {
    await abrirEnHelice(page);
    await page.locator('[data-tarjeta]').nth(1).click();
    await expect(page.locator('[data-posicion]')).toHaveText('02 / 08');
    await expect(page.locator('#p-proyecto')).toHaveValue('');
    await expect(page.locator('input[name="tipo"][value="idea"]')).toBeChecked();
  });

  test('con movimiento reducido la hélice es una lista: todo a la vista y cada tarjeta suma', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await expect(page.locator('[data-proyectos]')).not.toHaveAttribute('data-modo', 'helice');
    const seccion = await page.locator('[data-proyectos]').boundingBox();
    // Sin sección fija: mide lo que ocupa su contenido, no 5 pantallas de recorrido.
    expect(seccion?.height ?? Infinity).toBeLessThan(900 * 3);
    for (const tarjeta of await page.locator('[data-tarjeta]').all()) await expect(tarjeta).toBeVisible();
    await page.locator('[data-tarjeta]').nth(2).click();
    await expect(page.locator('#p-proyecto')).toHaveValue(IDEAS[2]);
    await expect(page.locator('input[name="tipo"][value="equipo"]')).toBeChecked();
  });

  test('a 390 px es la lista y no hay scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await expect(page.locator('[data-proyectos]')).not.toHaveAttribute('data-modo', 'helice');
    // Desde R1 (R-2) en angosto es un carrusel: las tarjetas que no están a la vista quedan a la derecha,
    // dentro de la fila que se desliza. Lo que no puede pasar es que la página se ensanche.
    const anchos = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }));
    expect(anchos.documento).toBeLessThanOrEqual(anchos.ventana);
  });
});
