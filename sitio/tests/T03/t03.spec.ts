import { test, expect, type Page } from '@playwright/test';

// Pruebas de aceptación de T03 (hitos). Las escribe el orquestador; el constructor no las edita.
// Miden el resultado: series de posiciones al recorrer (F21), píxeles de la línea, contraste contra el fondo
// real de cada hito (F15, F24) y el ángulo del viajero en el tiempo; no el mecanismo (F11).
// Contrato de selectores (fabrica/proyecto/tareas/T03-hitos.md § Qué construyes):
//   section[data-hitos] · [data-hitos-pista] · [data-hito] · [data-hito-etiquetas] · [data-hito-titular]
//   [data-hito-bloque] · [data-linea-punteada] · [data-linea-solida] · [data-viajero]

const HITOS = [
  { etiquetas: '[IDEA] [01/05]', titular: 'Deja de vivir en tu libreta.', palabra: 'Idea', bloque: '--color-acido' },
  { etiquetas: '[EQUIPO] [02/05]', titular: 'Alguien de otra carrera la entiende mejor que tú.', palabra: 'Equipo', bloque: '--color-magenta' },
  { etiquetas: '[USUARIOS] [03/05]', titular: 'Gente que no conoces la usa sin que se lo pidas.', palabra: 'Usuarios', bloque: '--color-tomate' },
  { etiquetas: '[VALOR] [04/05]', titular: 'Alguien paga por algo que tú hiciste.', palabra: 'Valor', bloque: '--color-cobalto' },
  { etiquetas: '[NOMBRE] [05/05]', titular: 'Te buscan por lo que construiste.', palabra: 'Nombre', bloque: '--color-acido' },
];
const INVERTIDOS = [2, 4]; // los hitos 3 y 5 pasan a fondo invertido

type RGB = [number, number, number];

function rgbDe(texto: string): RGB {
  const [r, g, b] = (texto.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
  return [r, g, b];
}

function contraste(a: RGB, b: RGB): number {
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

async function esperarListo(page: Page): Promise<void> {
  await page.locator('html[data-listo]').waitFor({ state: 'attached', timeout: 6000 });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

// Un token de color resuelto por el navegador (los tokens están en hex; rgbDe solo lee rgb()).
async function token(page: Page, nombre: string): Promise<RGB> {
  return rgbDe(
    await page.evaluate((n) => {
      const s = document.createElement('span');
      s.style.color = `var(${n})`;
      document.body.append(s);
      const c = getComputedStyle(s).color;
      s.remove();
      return c;
    }, nombre),
  );
}

// Fondo opaco real detrás de un elemento: el primer ancestro con fondo no transparente.
async function fondoDetras(page: Page, selector: string, indice: number): Promise<RGB> {
  return rgbDe(
    await page.evaluate(
      ({ selector, indice }) => {
        let el: Element | null = document.querySelectorAll(selector)[indice] ?? null;
        while (el) {
          const c = getComputedStyle(el).backgroundColor;
          const m = c.match(/[\d.]+/g);
          if (m && (m.length < 4 || Number(m[3]) > 0.95)) return c;
          el = el.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      },
      { selector, indice },
    ),
  );
}

async function inicioSeccion(page: Page): Promise<number> {
  return page.evaluate(() => {
    const s = document.querySelector('section[data-hitos]');
    if (!s) return Infinity;
    return s.getBoundingClientRect().top + window.scrollY;
  });
}

async function irA(page: Page, y: number, espera = 350): Promise<void> {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(espera);
}

type Caja = { x: number; y: number; w: number; h: number };
type Paso = {
  scrollY: number;
  secTop: number;
  pistaX: number;
  anchoPagina: number;
  titulares: Caja[];
  bloques: Caja[];
};

async function foto(page: Page): Promise<Paso> {
  return page.evaluate(() => {
    const caja = (el: Element | null) => {
      const r = el?.getBoundingClientRect();
      return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : { x: NaN, y: NaN, w: 0, h: 0 };
    };
    return {
      scrollY: window.scrollY,
      secTop: document.querySelector('section[data-hitos]')?.getBoundingClientRect().top ?? NaN,
      pistaX: document.querySelector('[data-hitos-pista]')?.getBoundingClientRect().left ?? NaN,
      anchoPagina: document.documentElement.scrollWidth,
      titulares: [...document.querySelectorAll('[data-hito-titular]')].map(caja),
      bloques: [...document.querySelectorAll('[data-hito-bloque]')].map(caja),
    };
  });
}

// Recorre la sección de arriba abajo en pasos de 320 px y devuelve la serie (F21).
async function recorrer(page: Page): Promise<{ serie: Paso[]; inicio: number }> {
  const inicio = await inicioSeccion(page);
  expect(Number.isFinite(inicio), 'existe section[data-hitos]').toBe(true);
  const serie: Paso[] = [];
  let fijada = false;
  for (let y = Math.max(0, inicio - 320); serie.length < 70; y += 320) {
    await irA(page, y);
    const p = await foto(page);
    serie.push(p);
    if (Math.abs(p.secTop) <= 1) fijada = true;
    if (fijada && p.secTop < -200) break;
  }
  return { serie, inicio };
}

const dentro = (c: Caja, W: number, H: number) => c.w > 0 && c.x >= -1 && c.y >= -1 && c.x + c.w <= W + 1 && c.y + c.h <= H + 1;

// Ángulo de rotación (grados) del viajero según su transform calculado.
async function angulo(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.querySelector('[data-viajero]');
    if (!el) return NaN;
    const t = getComputedStyle(el).transform;
    if (!t || t === 'none') return 0;
    const m = new DOMMatrixReadOnly(t);
    return (Math.atan2(m.b, m.a) * 180) / Math.PI;
  });
}

async function esperarQuieto(page: Page): Promise<void> {
  // La inclinación vuelve con lerp 0,04 por cuadro: ~1,5 s desde 40°.
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(250);
    if (Math.abs(await angulo(page)) <= 0.5) return;
  }
}

// Cuánto corre la pista en horizontal (lo que dura el pin).
async function recorridoPista(page: Page): Promise<number> {
  return page.evaluate(() => {
    const s = document.querySelector<HTMLElement>('section[data-hitos]');
    const p = document.querySelector<HTMLElement>('[data-hitos-pista]');
    return s && p ? p.scrollWidth - s.clientWidth : 0;
  });
}

// Espera a que la pista deje de moverse (el scrub la lleva con retraso), para comparar dos capturas seguidas.
async function esperarPistaQuieta(page: Page): Promise<void> {
  let antes = Infinity;
  for (let i = 0; i < 30; i++) {
    const x = await page.evaluate(() => document.querySelector('[data-hitos-pista]')?.getBoundingClientRect().left ?? NaN);
    if (Math.abs(x - antes) < 0.25) return;
    antes = x;
    await page.waitForTimeout(80);
  }
}

async function ocultarViajero(page: Page, ocultar: boolean): Promise<void> {
  await page.evaluate((ocultar) => {
    const id = 'prueba-ocultar-viajero';
    document.getElementById(id)?.remove();
    if (!ocultar) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = '[data-viajero] { visibility: hidden !important; }';
    document.head.append(s);
  }, ocultar);
  await page.waitForTimeout(60);
}

// Fracción de píxeles que cambian entre dos capturas del mismo recorte.
async function fraccionDistinta(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ({ a, b }) => {
      const leer = async (b64: string) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const cv = document.createElement('canvas');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        return ctx?.getImageData(0, 0, cv.width, cv.height).data ?? new Uint8ClampedArray();
      };
      const [da, db] = await Promise.all([leer(a), leer(b)]);
      let distintos = 0;
      for (let k = 0; k < da.length; k += 4) {
        if (Math.abs(da[k] - db[k]) + Math.abs(da[k + 1] - db[k + 1]) + Math.abs(da[k + 2] - db[k + 2]) > 60) distintos++;
      }
      return da.length ? distintos / (da.length / 4) : 1;
    },
    { a: a.toString('base64'), b: b.toString('base64') },
  );
}

test.describe('T03 · hitos', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('contenido: cinco hitos en orden con etiquetas mono, titular h2 ligero y bloque de color con la palabra en cursiva', async ({ page }) => {
    await page.goto('/');
    await esperarListo(page);
    const datos = await page.evaluate(() =>
      [...document.querySelectorAll('[data-hito]')].map((h) => {
        const et = h.querySelector('[data-hito-etiquetas]');
        const ti = h.querySelector('[data-hito-titular]');
        const bl = h.querySelector('[data-hito-bloque]');
        // El elemento más profundo del bloque que lleva la palabra.
        let palabra: Element | null = bl;
        for (const el of bl ? [...bl.querySelectorAll('*')] : []) {
          if (el.textContent?.trim() && el.textContent.trim() === bl?.textContent?.trim()) palabra = el;
        }
        const ps = palabra ? getComputedStyle(palabra) : null;
        const r = bl?.getBoundingClientRect();
        return {
          etiquetas: (et?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          etiquetasFuente: et ? getComputedStyle(et).fontFamily : '',
          titular: (ti?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          titularTag: ti?.tagName ?? '',
          titularFuente: ti ? getComputedStyle(ti).fontFamily : '',
          titularPeso: ti ? Number(getComputedStyle(ti).fontWeight) : 0,
          titularTam: ti ? parseFloat(getComputedStyle(ti).fontSize) : 0,
          palabra: (bl?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          palabraEstilo: ps?.fontStyle ?? '',
          palabraFuente: ps?.fontFamily ?? '',
          palabraColor: ps?.color ?? '',
          palabraOculta: !!palabra?.closest('[aria-hidden="true"]'),
          bloqueFondo: bl ? getComputedStyle(bl).backgroundColor : '',
          bloqueAncho: r?.width ?? 0,
          bloqueAlto: r?.height ?? 0,
        };
      }),
    );
    expect(datos.length, 'cinco [data-hito]').toBe(5);
    expect(await page.locator('h1').count(), 'sigue habiendo un solo h1').toBe(1);
    for (const [i, h] of HITOS.entries()) {
      const d = datos[i];
      const n = `hito ${i + 1}`;
      expect(d.etiquetas, `${n}: etiquetas`).toBe(h.etiquetas);
      expect(d.etiquetasFuente, `${n}: etiquetas en JetBrains Mono`).toMatch(/JetBrains Mono/i);
      expect(d.titularTag, `${n}: el titular es un h2`).toBe('H2');
      expect(d.titular, `${n}: titular`).toBe(h.titular);
      expect(d.titularFuente, `${n}: titular en Zalando Sans`).toMatch(/Zalando Sans/i);
      expect(d.titularPeso, `${n}: titular ligero (≤ 350)`).toBeLessThanOrEqual(350);
      expect(d.titularTam, `${n}: titular grande (≥ 40 px a 1440)`).toBeGreaterThanOrEqual(40);
      expect(d.palabra, `${n}: palabra del bloque`).toBe(h.palabra);
      expect(d.palabraEstilo, `${n}: la palabra va en cursiva`).toBe('italic');
      expect(d.palabraFuente, `${n}: la palabra en DM Serif Text`).toMatch(/DM Serif/i);
      expect(d.palabraOculta, `${n}: la palabra es aria-hidden (repite la etiqueta)`).toBe(true);
      expect(rgbDe(d.bloqueFondo), `${n}: bloque en ${h.bloque}`).toEqual(await token(page, h.bloque));
      expect(contraste(rgbDe(d.palabraColor), rgbDe(d.bloqueFondo)), `${n}: la palabra se lee sobre el bloque (≥ 3:1)`).toBeGreaterThanOrEqual(3);
      expect(d.bloqueAncho, `${n}: bloque de al menos el 30 % del ancho`).toBeGreaterThanOrEqual(1440 * 0.3);
      expect(d.bloqueAlto, `${n}: bloque de al menos el 45 % del alto`).toBeGreaterThanOrEqual(900 * 0.45);
    }
  });

  for (const modo of ['claro', 'oscuro'] as const) {
    test(`fondos (${modo}): los hitos 3 y 5 pasan a fondo invertido y etiquetas y titulares se leen en todos`, async ({ page }) => {
      if (modo === 'oscuro') {
        await page.addInitScript(() => {
          try {
            localStorage.setItem('algora-tema', 'dark');
          } catch {
            // sin almacenamiento
          }
        });
      } else {
        await page.emulateMedia({ colorScheme: 'light' });
      }
      await page.goto('/');
      await esperarListo(page);
      const papel = await token(page, '--color-papel');
      const tinta = await token(page, '--color-tinta');
      const [normal, invertido] = modo === 'claro' ? [papel, tinta] : [tinta, papel];
      for (let i = 0; i < 5; i++) {
        const fondo = await fondoDetras(page, '[data-hito-titular]', i);
        expect(fondo, `hito ${i + 1}: fondo ${INVERTIDOS.includes(i) ? 'invertido' : 'del tema'}`).toEqual(
          INVERTIDOS.includes(i) ? invertido : normal,
        );
        for (const sel of ['[data-hito-titular]', '[data-hito-etiquetas]']) {
          const color = rgbDe(await page.locator(sel).nth(i).evaluate((el) => getComputedStyle(el).color));
          const fondoSel = await fondoDetras(page, sel, i);
          expect(contraste(color, fondoSel), `hito ${i + 1}: ${sel} se lee (≥ 4,5:1)`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }

  for (const vp of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
  ]) {
    test(`horizontal a ${vp.width}×${vp.height}: la sección se fija, la pista corre y cada hito queda entero a la vista; después la página sigue`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await page.setViewportSize(vp);
      await page.goto('/');
      await esperarListo(page);
      const { serie } = await recorrer(page);
      const W = vp.width;
      const H = vp.height;
      const fijos = serie.filter((p) => Math.abs(p.secTop) <= 1);
      expect(fijos.length, 'la sección se queda fija arriba durante el recorrido (≥ 8 pasos de 320 px)').toBeGreaterThanOrEqual(8);
      for (let i = 1; i < fijos.length; i++) {
        expect(fijos[i].pistaX, 'la pista nunca vuelve atrás al bajar').toBeLessThanOrEqual(fijos[i - 1].pistaX + 1);
      }
      expect(fijos[0].pistaX - fijos[fijos.length - 1].pistaX, 'la pista corre al menos tres pantallas').toBeGreaterThanOrEqual(3 * W);
      const y0 = fijos[0].titulares[0].y;
      for (const p of fijos.slice(0, 4)) expect(Math.abs(p.titulares[0].y - y0), 'mientras está fija, el hito 1 no sube ni baja').toBeLessThanOrEqual(2);
      // Cada hito: desde el paso en que su conjunto (titular + bloque) queda más centrado, se ajusta el scroll lo
      // que le falta para centrarlo (la pista corre 1:1) y se comprueba que cabe entero.
      for (let i = 0; i < 5; i++) {
        const centro = (p: Paso) => {
          const a = Math.min(p.titulares[i].x, p.bloques[i].x);
          const b = Math.max(p.titulares[i].x + p.titulares[i].w, p.bloques[i].x + p.bloques[i].w);
          return (a + b) / 2;
        };
        const mejor = fijos.reduce((m, p) => (Math.abs(centro(p) - W / 2) < Math.abs(centro(m) - W / 2) ? p : m), fijos[0]);
        await irA(page, mejor.scrollY + (centro(mejor) - W / 2), 450);
        const p = await foto(page);
        expect(
          dentro(p.titulares[i], W, H) && dentro(p.bloques[i], W, H),
          `el hito ${i + 1} queda entero a la vista (titular y bloque) en algún momento`,
        ).toBe(true);
      }
      await irA(page, serie[serie.length - 1].scrollY);
      for (const p of serie) expect(p.anchoPagina, 'sin scroll horizontal de página').toBeLessThanOrEqual(W + 1);
      expect(serie[serie.length - 1].secTop, 'al terminar la pista la página sigue hacia abajo').toBeLessThan(-200);
      await irA(page, await page.evaluate(() => document.documentElement.scrollHeight), 800);
      const pie = await page.locator('footer').first().boundingBox();
      expect(pie && pie.y < H, 'el pie se alcanza').toBe(true);
    });
  }

  test('línea: sólida detrás del viajero y punteada delante, y el viajero apoyado sobre ella en la misma x de la pantalla', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await esperarListo(page);
    const inicio = await inicioSeccion(page);
    const xs: number[] = [];
    for (const k of [1.2, 2.2, 3.2]) {
      await irA(page, inicio + k * 1440, 300);
      await esperarQuieto(page);
      const v = await page.locator('[data-viajero]').boundingBox();
      expect(v, 'el viajero se ve').not.toBeNull();
      xs.push((v?.x ?? 0) + (v?.width ?? 0) / 2);
    }
    expect(Math.max(...xs) - Math.min(...xs), 'el viajero se queda en la misma x mientras corre la pista').toBeLessThanOrEqual(6);
    expect(xs[0], 'el viajero va hacia el primer tercio de la pantalla').toBeGreaterThanOrEqual(1440 * 0.2);
    expect(xs[0], 'el viajero va hacia el primer tercio de la pantalla').toBeLessThanOrEqual(1440 * 0.45);
    const v = await page.locator('[data-viajero]').boundingBox();
    expect(v?.height ?? 0, 'el viajero mide entre 48 y 110 px').toBeGreaterThanOrEqual(48);
    expect(v?.height ?? 0, 'el viajero mide entre 48 y 110 px').toBeLessThanOrEqual(110);

    // Se ocultan textos, bloques y viajero; quedan los fondos de los hitos y la línea (que puede mezclarse con
    // ellos, por ejemplo con mix-blend-mode: difference).
    await page.addStyleTag({
      content: `[data-hito-titular], [data-hito-etiquetas], [data-hito-bloque], [data-viajero] { visibility: hidden !important; }`,
    });
    await page.waitForTimeout(100);
    const png = await page.screenshot();
    const vx = Math.round((v?.x ?? 0) + (v?.width ?? 0) / 2);
    const vb = (v?.y ?? 0) + (v?.height ?? 0);
    const r = await page.evaluate(
      async ({ b64, vx }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const cv = document.createElement('canvas');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
        const alto = cv.height;
        // Columnas con un píxel de línea: lejos del fondo de esa columna, que se lee justo debajo de la nav.
        const ys = (x: number) => {
          const f = (90 * cv.width + x) * 4;
          const out: number[] = [];
          for (let y = 100; y < alto; y++) {
            const i = (y * cv.width + x) * 4;
            if (Math.abs(d[i] - d[f]) + Math.abs(d[i + 1] - d[f + 1]) + Math.abs(d[i + 2] - d[f + 2]) > 90) out.push(y);
          }
          return out;
        };
        const cobertura = (a: number, b: number) => {
          let con = 0;
          let n = 0;
          for (let x = Math.max(0, a); x < Math.min(cv.width, b); x++) {
            n++;
            if (ys(x).length) con++;
          }
          return n ? con / n : -1;
        };
        const cerca: number[] = [];
        for (let x = vx - 3; x <= vx + 3; x++) cerca.push(...ys(x));
        return {
          detras: cobertura(vx - 220, vx - 24),
          delante: cobertura(vx + 24, vx + 220),
          resto: cobertura(vx + 24, cv.width - 10),
          lineaEnVx: cerca,
        };
      },
      { b64: png.toString('base64'), vx },
    );
    expect(r, 'se pudo leer la captura').not.toBeNull();
    expect(r?.detras ?? 0, 'detrás del viajero la línea es sólida (≥ 90 % de columnas con trazo)').toBeGreaterThanOrEqual(0.9);
    expect(r?.delante ?? 1, 'delante del viajero la línea es punteada (≤ 80 % de columnas con trazo)').toBeLessThanOrEqual(0.8);
    expect(r?.delante ?? 0, 'delante del viajero sigue habiendo línea (≥ 20 %)').toBeGreaterThanOrEqual(0.2);
    expect(r?.resto ?? 0, 'la línea sigue hasta el borde de la pantalla').toBeGreaterThanOrEqual(0.2);
    const tolerancia = Math.max(12, 0.2 * (v?.height ?? 0));
    const dist = Math.min(...(r?.lineaEnVx ?? []).map((y) => Math.abs(y - vb)), Infinity);
    expect(dist, 'los cascos del viajero apoyan sobre la línea').toBeLessThanOrEqual(tolerancia);
  });

  test('línea: también se ve sobre los hitos de fondo invertido', async ({ page }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await esperarListo(page);
    const inicio = await inicioSeccion(page);
    // Avanza hasta que el hito 3 esté centrado en la pantalla.
    let centrado = false;
    for (let y = inicio; y < inicio + 12 * 1440 && !centrado; y += 160) {
      await irA(page, y, 120);
      const c = await page.locator('[data-hito]').nth(2).boundingBox();
      if (c && c.x <= 1440 * 0.15 && c.x + c.width >= 1440 * 0.85) centrado = true;
    }
    expect(centrado, 'el hito 3 llega a ocupar la pantalla').toBe(true);
    await page.waitForTimeout(400);
    const caja = await page.locator('[data-hito]').nth(2).boundingBox();
    const fondo = await fondoDetras(page, '[data-hito-titular]', 2);
    expect(fondo, 'el hito 3 es de fondo tinta').toEqual(await token(page, '--color-tinta'));
    await page.addStyleTag({
      content: `[data-hito-titular], [data-hito-etiquetas], [data-hito-bloque], [data-viajero] { visibility: hidden !important; }`,
    });
    await page.waitForTimeout(100);
    const png = await page.screenshot();
    const cobertura = await page.evaluate(
      async ({ b64, fondo, a, b }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const cv = document.createElement('canvas');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        if (!ctx) return -1;
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let con = 0;
        let n = 0;
        for (let x = Math.max(0, Math.round(a)); x < Math.min(cv.width, Math.round(b)); x++) {
          n++;
          for (let y = 80; y < cv.height; y++) {
            const i = (y * cv.width + x) * 4;
            if (Math.abs(d[i] - fondo[0]) + Math.abs(d[i + 1] - fondo[1]) + Math.abs(d[i + 2] - fondo[2]) > 90) {
              con++;
              break;
            }
          }
        }
        return n ? con / n : -1;
      },
      { b64: png.toString('base64'), fondo, a: Math.max(0, (caja?.x ?? 0) + 30), b: Math.min(1440, (caja?.x ?? 0) + (caja?.width ?? 0) - 30) },
    );
    expect(cobertura, 'sobre el fondo tinta la línea se ve (≥ 25 % de columnas con trazo claro)').toBeGreaterThanOrEqual(0.25);
  });

  test('inclinación: se inclina con la velocidad, a un lado hacia adelante y al otro hacia atrás, nunca más de 40°, y quieto vuelve a 0', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await esperarListo(page);
    const inicio = await inicioSeccion(page);
    await irA(page, inicio + 2 * 1440, 300);
    await esperarQuieto(page);
    expect(Math.abs(await angulo(page)), 'quieto, el viajero está derecho').toBeLessThanOrEqual(1);
    await page.evaluate(() => {
      const w = window as unknown as { __angulos: number[] };
      w.__angulos = [];
      setInterval(() => {
        const el = document.querySelector('[data-viajero]');
        const t = el ? getComputedStyle(el).transform : 'none';
        if (!t || t === 'none') return w.__angulos.push(0);
        const m = new DOMMatrixReadOnly(t);
        w.__angulos.push((Math.atan2(m.b, m.a) * 180) / Math.PI);
      }, 16);
    });
    const leer = () => page.evaluate(() => (window as unknown as { __angulos: number[] }).__angulos.splice(0));
    const pico = (v: number[]) => v.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0);
    await page.mouse.move(720, 450);
    await leer();
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 250);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(700);
    const adelante = await leer();
    await esperarQuieto(page);
    expect(Math.abs(await angulo(page)), 'después de adelante vuelve a quedar derecho').toBeLessThanOrEqual(1);
    await leer();
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, -250);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(700);
    const atras = await leer();
    const [pa, pb] = [pico(adelante), pico(atras)];
    expect(Math.abs(pa), 'hacia adelante se inclina (≥ 6°)').toBeGreaterThanOrEqual(6);
    expect(Math.abs(pb), 'hacia atrás se inclina (≥ 6°)').toBeGreaterThanOrEqual(6);
    expect(Math.sign(pa), 'hacia atrás se inclina para el otro lado').toBe(-Math.sign(pb));
    for (const a of [...adelante, ...atras]) expect(Math.abs(a), 'nunca pasa de 40°').toBeLessThanOrEqual(40.5);
  });

  // --- Escapados de la auditoría final (E2, E3, E4), con las decisiones del autor del 2026-11-14 ---

  // E2 (autor: el viajero pasa por debajo de los bloques, como la línea). Se mide el resultado en píxeles:
  // donde la caja del viajero cruza un bloque, la región se ve igual con el viajero y sin él (F15). En los
  // bordes del rango de escritorio (F13).
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
  ]) {
    test(`viajero a ${vp.width}×${vp.height}: cuando cruza un bloque, el bloque lo tapa (pasa por debajo, como la línea)`, async ({ page }) => {
      test.setTimeout(150_000);
      await page.setViewportSize(vp);
      await page.goto('/');
      await esperarListo(page);
      const inicio = await inicioSeccion(page);
      const recorrido = await recorridoPista(page);
      expect(recorrido, 'la pista corre en horizontal').toBeGreaterThan(vp.width);
      let solapes = 0;
      let peor = 0;
      let dondePeor = '';
      for (let y = inicio + 80; y < inicio + recorrido; y += 160) {
        await irA(page, y, 200);
        await esperarPistaQuieta(page);
        const zona = await page.evaluate(() => {
          const v = document.querySelector('[data-viajero]')?.getBoundingClientRect();
          if (!v || v.width === 0) return null;
          let mejor: { x: number; y: number; w: number; h: number } | null = null;
          for (const b of document.querySelectorAll('[data-hito-bloque]')) {
            const r = b.getBoundingClientRect();
            const x = Math.max(v.left, r.left, 0);
            const yy = Math.max(v.top, r.top, 0);
            const w = Math.min(v.right, r.right, innerWidth) - x;
            const h = Math.min(v.bottom, r.bottom, innerHeight) - yy;
            if (w > 0 && h > 0 && (!mejor || w * h > mejor.w * mejor.h)) mejor = { x, y: yy, w, h };
          }
          return mejor;
        });
        if (!zona || zona.w * zona.h < 600) continue;
        solapes++;
        // Se encoge 3 px por lado: las esquinas redondeadas del bloque no cuentan.
        const clip = { x: Math.ceil(zona.x) + 3, y: Math.ceil(zona.y) + 3, width: Math.floor(zona.w) - 6, height: Math.floor(zona.h) - 6 };
        const con = await page.screenshot({ clip });
        await ocultarViajero(page, true);
        const sin = await page.screenshot({ clip });
        await ocultarViajero(page, false);
        const dif = await fraccionDistinta(page, con, sin);
        if (dif > peor) {
          peor = dif;
          dondePeor = `scroll ${Math.round(y - inicio)} px dentro de la sección`;
        }
      }
      expect(solapes, 'el recorrido lleva al viajero a cruzar bloques (si no, esta prueba no mide nada)').toBeGreaterThanOrEqual(3);
      expect(peor, `donde cruza un bloque, el viajero no se pinta encima (peor: ${dondePeor})`).toBeLessThanOrEqual(0.01);
    });
  }

  // E3 (autor: desplazamiento bajo al inclinarse, 1–2 px por grado). Se mide en movimiento, con rueda real:
  // la distancia de los cascos (y = 96 % del cuadro de la mascota) a la unión sólida/punteada de la línea.
  test('inclinación en movimiento: los cascos se quedan en la unión sólida/punteada, como mucho 2 px por grado de inclinación', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await esperarListo(page);
    const inicio = await inicioSeccion(page);
    await irA(page, inicio + 2 * 1440, 300);
    await esperarQuieto(page);
    await page.evaluate(() => {
      const v = document.querySelector<HTMLElement>('[data-viajero]');
      if (!v) return;
      // Marcador de los cascos: un punto en el 48 % / 96 % del cuadro del viajero, que gira con él.
      const s = document.createElement('style');
      s.textContent = '[data-viajero] { position: relative; } #prueba-cascos { position: absolute; left: 48%; top: 96%; width: 0; height: 0; }';
      document.head.append(s);
      const m = document.createElement('i');
      m.id = 'prueba-cascos';
      v.append(m);
      const w = window as unknown as { __cascos: { hx: number; hy: number; jx: number; ctm: number[]; rot: number }[] };
      w.__cascos = [];
      setInterval(() => {
        const r = m.getBoundingClientRect();
        const sol = document.querySelector('[data-linea-solida]')?.getBoundingClientRect();
        const ctm = document.querySelector<SVGPathElement>('[data-linea-punteada] path')?.getScreenCTM();
        const t = getComputedStyle(v).transform;
        const mt = !t || t === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(t);
        if (!sol || !ctm) return;
        w.__cascos.push({ hx: r.left, hy: r.top, jx: sol.right, ctm: [ctm.a, ctm.d, ctm.e, ctm.f], rot: (Math.atan2(mt.b, mt.a) * 180) / Math.PI });
      }, 24);
    });
    await page.mouse.move(720, 450);
    for (const delta of [240, -240]) {
      for (let i = 0; i < 12; i++) {
        await page.mouse.wheel(0, delta);
        await page.waitForTimeout(30);
      }
      await page.waitForTimeout(600);
    }
    // Altura de la línea en la x de la unión, leída del trazado real (la línea es función de x).
    const muestras = await page.evaluate(() => {
      const w = window as unknown as { __cascos: { hx: number; hy: number; jx: number; ctm: number[]; rot: number }[] };
      const path = document.querySelector<SVGPathElement>('[data-linea-punteada] path');
      if (!path) return [];
      const total = path.getTotalLength();
      const yLocal = (x: number) => {
        let a = 0;
        let b = total;
        for (let i = 0; i < 32; i++) {
          const m = (a + b) / 2;
          if (path.getPointAtLength(m).x < x) a = m;
          else b = m;
        }
        return path.getPointAtLength(a).y;
      };
      return w.__cascos.splice(0).map((s) => {
        const [ca, cd, ce, cf] = s.ctm;
        const jy = cd * yLocal((s.jx - ce) / ca) + cf;
        return { rot: s.rot, dist: Math.hypot(s.hx - s.jx, s.hy - jy) };
      });
    });
    const inclinadas = muestras.filter((s) => Math.abs(s.rot) >= 10);
    expect(inclinadas.length, 'la rueda inclinó el viajero (≥ 5 muestras de 10° o más)').toBeGreaterThanOrEqual(5);
    const peor = muestras.reduce((p, s) => (s.dist - 2 * Math.abs(s.rot) > p.dist - 2 * Math.abs(p.rot) ? s : p), muestras[0]);
    expect(
      peor.dist,
      `los cascos no se despegan de la unión más de 2 px por grado (+ 12 px): ${peor.dist.toFixed(0)} px a ${peor.rot.toFixed(1)}°`,
    ).toBeLessThanOrEqual(2 * Math.abs(peor.rot) + 12);
  });

  // E4: la silueta del viajero (no su halo) se lee sobre el fondo de cada hito, también los invertidos. Se
  // pinta una máscara de la silueta y se mide, píxel a píxel, la captura real contra la misma sin viajero (F24).
  for (const modo of ['claro', 'oscuro'] as const) {
    test(`viajero (${modo}): su silueta se lee sobre el fondo de los hitos, también los invertidos (≥ 3:1)`, async ({ page }) => {
      test.setTimeout(120_000);
      if (modo === 'oscuro') {
        await page.addInitScript(() => {
          try {
            localStorage.setItem('algora-tema', 'dark');
          } catch {
            // sin almacenamiento
          }
        });
      } else {
        await page.emulateMedia({ colorScheme: 'light' });
      }
      await page.goto('/');
      await esperarListo(page);
      const inicio = await inicioSeccion(page);
      const recorrido = await recorridoPista(page);
      for (const i of [0, ...INVERTIDOS]) {
        let encontrado = false;
        for (let y = inicio; y < inicio + recorrido && !encontrado; y += 120) {
          await irA(page, y, 120);
          encontrado = await page.evaluate((i) => {
            const v = document.querySelector('[data-viajero]')?.getBoundingClientRect();
            const h = document.querySelectorAll('[data-hito]')[i]?.getBoundingClientRect();
            if (!v || !h || v.width === 0) return false;
            const dentroDe = (r: DOMRect, m: number) => v.left >= r.left + m && v.right <= r.right - m && v.top >= r.top + m && v.bottom <= r.bottom - m;
            const tocaBloque = [...document.querySelectorAll('[data-hito-bloque]')].some((b) => {
              const r = b.getBoundingClientRect();
              return v.left < r.right + 8 && v.right > r.left - 8 && v.top < r.bottom + 8 && v.bottom > r.top - 8;
            });
            return dentroDe(h, 8) && !tocaBloque;
          }, i);
        }
        expect(encontrado, `el viajero pasa por el hito ${i + 1} fuera de su bloque`).toBe(true);
        await esperarQuieto(page);
        await esperarPistaQuieta(page);
        const caja = await page.locator('[data-viajero]').boundingBox();
        const clip = { x: Math.round(caja?.x ?? 0), y: Math.round(caja?.y ?? 0), width: Math.round(caja?.width ?? 1), height: Math.round(caja?.height ?? 1) };
        const real = await page.screenshot({ clip });
        await ocultarViajero(page, true);
        const fondo = await page.screenshot({ clip });
        await ocultarViajero(page, false);
        await page.addStyleTag({
          content:
            '[data-guia], [data-viajero], [data-viajero] * { filter: none !important; mix-blend-mode: normal !important; opacity: 1 !important; } [data-viajero], [data-viajero] * { color: rgb(255, 0, 0) !important; fill: rgb(255, 0, 0) !important; }',
        });
        await page.waitForTimeout(80);
        const mascara = await page.screenshot({ clip });
        await page.evaluate(() => document.head.lastElementChild?.remove());
        await page.waitForTimeout(80);
        const r = await page.evaluate(
          async ({ imgs }) => {
            const leer = async (b64: string) => {
              const img = new Image();
              img.src = `data:image/png;base64,${b64}`;
              await img.decode();
              const cv = document.createElement('canvas');
              cv.width = img.width;
              cv.height = img.height;
              const ctx = cv.getContext('2d');
              ctx?.drawImage(img, 0, 0);
              return ctx?.getImageData(0, 0, cv.width, cv.height).data ?? new Uint8ClampedArray();
            };
            const [a, b, c] = await Promise.all(imgs.map(leer));
            const lum = (r: number, g: number, bb: number) => {
              const lin = (v: number) => {
                const s = v / 255;
                return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
              };
              return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bb);
            };
            const cs: number[] = [];
            for (let k = 0; k < a.length; k += 4) {
              const enSilueta = c[k] > 200 && c[k + 1] < 60 && c[k + 2] < 60 && Math.abs(c[k] - b[k]) + Math.abs(c[k + 1] - b[k + 1]) + Math.abs(c[k + 2] - b[k + 2]) > 120;
              if (!enSilueta) continue;
              const [l1, l2] = [lum(a[k], a[k + 1], a[k + 2]), lum(b[k], b[k + 1], b[k + 2])].sort((x, y) => y - x);
              cs.push((l1 + 0.05) / (l2 + 0.05));
            }
            cs.sort((x, y) => x - y);
            return { n: cs.length, mediana: cs.length ? cs[Math.floor(cs.length / 2)] : 0 };
          },
          { imgs: [real, fondo, mascara].map((p) => p.toString('base64')) },
        );
        expect(r.n, `hito ${i + 1}: se encontró la silueta del viajero`).toBeGreaterThanOrEqual(300);
        expect(r.mediana, `hito ${i + 1}${INVERTIDOS.includes(i) ? ' (invertido)' : ''}: la silueta contrasta con el fondo (mediana ≥ 3:1)`).toBeGreaterThanOrEqual(3);
      }
    });
  }

  // Apilado: movimiento reducido, por debajo de 1024 px (borde del rango, F13) y en celular.
  for (const caso of [
    { nombre: 'movimiento reducido a 1440', vp: { width: 1440, height: 900 }, reducido: true },
    { nombre: '1000 × 800', vp: { width: 1000, height: 800 }, reducido: false },
    { nombre: '390 × 844', vp: { width: 390, height: 844 }, reducido: false },
  ]) {
    test(`apilado (${caso.nombre}): sin pin, los cinco hitos uno debajo de otro, sin línea ni viajero y sin scroll horizontal`, async ({ page }) => {
      if (caso.reducido) await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize(caso.vp);
      await page.goto('/');
      await esperarListo(page);
      const inicio = await inicioSeccion(page);
      await irA(page, inicio + 300, 500);
      const p = await foto(page);
      expect(p.secTop, 'la sección sube con la página (sin pin)').toBeLessThanOrEqual(-290);
      expect(p.secTop, 'la sección sube con la página (sin pin)').toBeGreaterThanOrEqual(-310);
      for (let i = 0; i < 5; i++) {
        const t = p.titulares[i];
        expect(t.x, `hito ${i + 1}: el titular cabe a lo ancho`).toBeGreaterThanOrEqual(-1);
        expect(t.x + t.w, `hito ${i + 1}: el titular cabe a lo ancho`).toBeLessThanOrEqual(caso.vp.width + 1);
        if (i > 0) expect(t.y, `hito ${i + 1} va debajo del ${i}`).toBeGreaterThan(p.titulares[i - 1].y + p.titulares[i - 1].h);
      }
      expect(p.anchoPagina, 'sin scroll horizontal de página').toBeLessThanOrEqual(caso.vp.width + 1);
      expect(await page.locator('[data-viajero]').isVisible(), 'el viajero no se muestra apilado').toBe(false);
      expect(await page.locator('[data-linea-punteada]').isVisible(), 'la línea no se muestra apilada').toBe(false);
    });
  }

  test.describe('sin JS', () => {
    test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    test('sin JS: los cinco hitos se leen completos y apilados, sin scroll horizontal de página', async ({ page }) => {
      await page.goto('/');
      const p = await foto(page);
      expect(p.titulares.length, 'están los cinco titulares').toBe(5);
      for (let i = 0; i < 5; i++) {
        const t = p.titulares[i];
        expect(t.x, `hito ${i + 1}: el titular cabe a lo ancho`).toBeGreaterThanOrEqual(-1);
        expect(t.x + t.w, `hito ${i + 1}: el titular cabe a lo ancho`).toBeLessThanOrEqual(1441);
        if (i > 0) expect(t.y, `hito ${i + 1} va debajo del ${i}`).toBeGreaterThan(p.titulares[i - 1].y + p.titulares[i - 1].h);
      }
      expect(p.anchoPagina, 'sin scroll horizontal de página').toBeLessThanOrEqual(1441);
    });
  });
});
