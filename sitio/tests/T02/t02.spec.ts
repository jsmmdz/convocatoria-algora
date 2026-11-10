import { test, expect, type Page } from '@playwright/test';

// Pruebas de aceptación de T02 (precarga y portada). Las escribe el orquestador; el constructor no las edita.
// Miden el resultado: lo que se pinta, una serie de muestras en el tiempo (F21) y la red; no el mecanismo (F11, F15).
// Contrato de selectores (fabrica/proyecto/tareas/T02-portada.md § Qué construyes):
//   [data-precarga] · [data-precarga-cuenta] · [data-mascota] · section[data-portada] · [data-linea]
//   [data-objeto] · canvas[data-trama] · [data-capa]

const TINTA: [number, number, number] = [13, 13, 13];
const COBALTO: [number, number, number] = [44, 8, 255];
const PREGUNTA = '¿Y si esta vez sí lo haces realidad?';

type Muestra = {
  t: number;
  precarga: boolean;
  cuenta: string | null;
  listo: boolean;
  desfases: number[]; // por línea: (top del hijo − top de la línea) / alto de la línea
  objeto: number; // ancho del objeto dentro de la frase, en px
};

// Muestrea la página cada 16 ms desde antes del primer script: la serie entera, no un instante (F21).
async function registrar(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __muestras: unknown[] };
    w.__muestras = [];
    const visible = (el: Element | null): boolean => {
      if (!el) return false;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05 && r.width > 0 && r.height > 0;
    };
    const vigia = setInterval(() => {
      const html = document.documentElement;
      if (!html) return;
      const lineas = [...document.querySelectorAll('[data-linea]')].map((l) => {
        const hijo = l.firstElementChild;
        const rl = l.getBoundingClientRect();
        if (!hijo || rl.height === 0) return 0;
        return (hijo.getBoundingClientRect().top - rl.top) / rl.height;
      });
      w.__muestras.push({
        t: performance.now(),
        precarga: visible(document.querySelector('[data-precarga]')),
        cuenta: document.querySelector('[data-precarga-cuenta]')?.textContent?.trim() ?? null,
        listo: html.hasAttribute('data-listo'),
        desfases: lineas,
        objeto: document.querySelector('[data-objeto]')?.getBoundingClientRect().width ?? 0,
      });
      if (w.__muestras.length > 600) clearInterval(vigia);
    }, 16);
  });
}

async function muestras(page: Page): Promise<Muestra[]> {
  return page.evaluate(() => (window as unknown as { __muestras: Muestra[] }).__muestras);
}

async function esperarListo(page: Page): Promise<void> {
  await page.locator('html[data-listo]').waitFor({ state: 'attached', timeout: 6000 });
}

function rgbDe(texto: string): [number, number, number] {
  const [r, g, b] = (texto.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
  return [r, g, b];
}

function contraste(a: [number, number, number], b: [number, number, number]): number {
  const lum = ([r, g, bb]: [number, number, number]) => {
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bb);
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Fracción de píxeles de una captura PNG que se alejan de un color (distancia > 40 en RGB).
async function fraccionDistinta(page: Page, png: Buffer, color: [number, number, number]): Promise<number> {
  return page.evaluate(
    async ({ b64, c }) => {
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
      let distintos = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (Math.abs(d[i] - c[0]) + Math.abs(d[i + 1] - c[1]) + Math.abs(d[i + 2] - c[2]) > 40) distintos++;
      }
      return distintos / (d.length / 4);
    },
    { b64: png.toString('base64'), c: color },
  );
}

// Fracción de píxeles que cambian entre dos capturas PNG del mismo tamaño.
async function fraccionCambiada(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ({ a64, b64 }) => {
      const leer = async (s: string) => {
        const img = new Image();
        img.src = `data:image/png;base64,${s}`;
        await img.decode();
        const cv = document.createElement('canvas');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, cv.width, cv.height).data;
      };
      const [da, db] = [await leer(a64), await leer(b64)];
      if (!da || !db || da.length !== db.length) return -1;
      let cambiados = 0;
      for (let i = 0; i < da.length; i += 4) {
        if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30) cambiados++;
      }
      return cambiados / (da.length / 4);
    },
    { a64: a.toString('base64'), b64: b.toString('base64') },
  );
}

// Deja a la vista solo lo que se quiere fotografiar de la portada.
async function soloVer(page: Page, ocultar: string): Promise<void> {
  await page.addStyleTag({ content: `${ocultar} { visibility: hidden !important; }` });
}

test.describe('T02 · precarga y portada', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('precarga: cubre la pantalla en tinta con la mascota al centro y cuenta [0%] → [100%]', async ({ page }) => {
    await registrar(page);
    await page.goto('/', { waitUntil: 'commit' });
    const precarga = page.locator('[data-precarga]');
    await expect(precarga).toBeVisible({ timeout: 1500 });
    const caja = await precarga.boundingBox();
    expect(caja?.width ?? 0, 'cubre todo el ancho').toBeGreaterThanOrEqual(1440 - 1);
    expect(caja?.height ?? 0, 'cubre todo el alto').toBeGreaterThanOrEqual(900 - 1);
    const fondo = await precarga.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(rgbDe(fondo), 'fondo de tinta').toEqual(TINTA);
    const mascota = await precarga.locator('[data-mascota]').boundingBox();
    expect(mascota, 'la mascota está dentro de la precarga').not.toBeNull();
    if (mascota) {
      expect(Math.abs(mascota.x + mascota.width / 2 - 720), 'mascota centrada en horizontal').toBeLessThanOrEqual(1440 * 0.05);
      expect(Math.abs(mascota.y + mascota.height / 2 - 450), 'mascota cerca del centro en vertical').toBeLessThanOrEqual(900 * 0.2);
      expect(mascota.height, 'la mascota se ve (≥ 48 px)').toBeGreaterThanOrEqual(48);
    }
    await esperarListo(page);
    const serie = await muestras(page);
    const cuentas = serie.filter((m) => m.precarga && m.cuenta).map((m) => m.cuenta as string);
    expect(cuentas.length, 'se vio la cuenta').toBeGreaterThan(0);
    for (const c of cuentas) expect(c, 'formato «[NN%]» entre corchetes').toMatch(/^\[\d{1,3}%\]$/);
    const numeros = cuentas.map((c) => Number(c.replace(/\D/g, '')));
    for (let i = 1; i < numeros.length; i++) expect(numeros[i], 'la cuenta nunca baja').toBeGreaterThanOrEqual(numeros[i - 1]);
    expect(new Set(numeros).size, 'la cuenta anima (al menos 6 valores distintos), no salta').toBeGreaterThanOrEqual(6);
    const bajos = new Set(numeros.filter((n) => n > 0 && n < 50));
    expect(bajos.size, 'la cuenta pasa por la mitad baja (al menos 3 valores entre 1 y 49), no salta a 90').toBeGreaterThanOrEqual(3);
    expect(numeros[numeros.length - 1], 'termina en [100%]').toBe(100);
  });

  test('precarga: dura al menos 1,2 s y se va antes de los 3,5 s; data-listo llega con la portada ya entrada', async ({ page }) => {
    await registrar(page);
    await page.goto('/', { waitUntil: 'commit' });
    await esperarListo(page);
    await page.waitForTimeout(300);
    const serie = await muestras(page);
    const vistas = serie.filter((m) => m.precarga);
    expect(vistas.length, 'la precarga se vio').toBeGreaterThan(0);
    const fin = serie.find((m, i) => i > 0 && serie[i - 1].precarga && !m.precarga);
    expect(fin, 'la precarga se fue').toBeTruthy();
    expect(fin?.t ?? Infinity, 'dura al menos 1,2 s desde la navegación').toBeGreaterThanOrEqual(1200);
    expect(fin?.t ?? Infinity, 'se va antes de los 3,5 s').toBeLessThanOrEqual(3500);
    const primeraListo = serie.find((m) => m.listo);
    expect(primeraListo, 'data-listo llegó').toBeTruthy();
    expect(primeraListo?.precarga, 'cuando llega data-listo la precarga ya no está').toBe(false);
    expect(primeraListo?.t ?? Infinity, 'data-listo después de que se fue la precarga').toBeGreaterThanOrEqual(fin?.t ?? Infinity);
    for (const d of primeraListo?.desfases ?? []) expect(Math.abs(d), 'con data-listo cada línea del titular está en su sitio').toBeLessThanOrEqual(0.02);
    expect(primeraListo?.objeto ?? 0, 'con data-listo el objeto ya tiene su tamaño').toBeGreaterThan(20);
  });

  test('entrada: las líneas del titular suben desde abajo y el objeto crece desde cero dentro de la frase', async ({ page }) => {
    await registrar(page);
    await page.goto('/', { waitUntil: 'commit' });
    await esperarListo(page);
    await page.waitForTimeout(300);
    const serie = await muestras(page);
    const despues = serie.filter((m, i) => i > 0 && !m.precarga && serie.slice(0, i).some((x) => x.precarga));
    expect(despues.length, 'hay muestras después de la precarga').toBeGreaterThan(5);
    const nLineas = despues[0].desfases.length;
    expect(nLineas, 'el titular tiene al menos dos [data-linea]').toBeGreaterThanOrEqual(2);
    for (let i = 0; i < nLineas; i++) {
      const maximo = Math.max(...despues.map((m) => m.desfases[i] ?? 0));
      expect(maximo, `la línea ${i + 1} arrancó abajo (desfase de al menos medio alto de línea)`).toBeGreaterThanOrEqual(0.5);
      expect(Math.abs(despues[despues.length - 1].desfases[i] ?? 1), `la línea ${i + 1} terminó en su sitio`).toBeLessThanOrEqual(0.02);
    }
    const anchoFinal = despues[despues.length - 1].objeto;
    const anchoMinimo = Math.min(...despues.map((m) => m.objeto));
    expect(anchoFinal, 'el objeto termina con tamaño').toBeGreaterThan(20);
    expect(anchoMinimo, 'el objeto creció desde (casi) cero').toBeLessThanOrEqual(anchoFinal * 0.15);
  });

  test('portada: bloque cobalto a sangre de toda la pantalla en los tres modos del tema', async ({ page }) => {
    for (const modo of [
      { esquema: 'light' as const, forzar: null },
      { esquema: 'dark' as const, forzar: null },
      { esquema: 'light' as const, forzar: 'dark' },
    ]) {
      await page.emulateMedia({ colorScheme: modo.esquema });
      await page.goto('/');
      if (modo.forzar) await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, modo.forzar);
      await esperarListo(page);
      const portada = page.locator('section[data-portada]');
      await expect(portada).toHaveCount(1);
      const datos = await portada.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { fondo: getComputedStyle(el).backgroundColor, ancho: r.width, alto: r.height, izq: r.left };
      });
      const etiqueta = `${modo.esquema}${modo.forzar ? ' forzado ' + modo.forzar : ''}`;
      expect(rgbDe(datos.fondo), `${etiqueta}: fondo cobalto`).toEqual(COBALTO);
      expect(datos.ancho, `${etiqueta}: a sangre`).toBeGreaterThanOrEqual(1440 - 1);
      expect(Math.abs(datos.izq), `${etiqueta}: pegado al borde`).toBeLessThanOrEqual(1);
      expect(datos.alto, `${etiqueta}: al menos una pantalla de alto`).toBeGreaterThanOrEqual(900 - 1);
    }
  });

  test('titular: un solo h1 con la pregunta completa, «realidad» en cursiva y el objeto entre «sí» y «lo»', async ({ page }) => {
    await page.goto('/');
    await esperarListo(page);
    expect(await page.locator('h1').count(), 'un solo h1 en la página').toBe(1);
    await expect(page.getByRole('heading', { level: 1, name: PREGUNTA, exact: true })).toBeVisible();
    const datos = await page.locator('h1').evaluate((h1) => {
      const objeto = h1.querySelector('[data-objeto]');
      if (!objeto) return null;
      const antes = document.createRange();
      antes.setStart(h1, 0);
      antes.setEndBefore(objeto);
      const despues = document.createRange();
      despues.setStartAfter(objeto);
      despues.setEnd(h1, h1.childNodes.length);
      const r = objeto.getBoundingClientRect();
      const linea = parseFloat(getComputedStyle(h1).fontSize);
      let cursiva = '';
      const caminante = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
      while (caminante.nextNode()) {
        const n = caminante.currentNode;
        if (/realidad/.test(n.textContent ?? '') && n.parentElement) cursiva = getComputedStyle(n.parentElement).fontStyle;
      }
      return {
        antes: antes.toString().replace(/\s+/g, ' ').trim(),
        despues: despues.toString().replace(/\s+/g, ' ').trim(),
        oculto: objeto.getAttribute('aria-hidden'),
        alto: r.height,
        ancho: r.width,
        linea,
        cursiva,
        color: getComputedStyle(h1).color,
        fondo: getComputedStyle(h1.closest('section') ?? document.body).backgroundColor,
      };
    });
    expect(datos, 'hay un [data-objeto] dentro del h1').not.toBeNull();
    if (!datos) return;
    expect(datos.antes, 'antes del objeto').toMatch(/sí$/);
    expect(datos.despues, 'después del objeto').toMatch(/^lo /);
    expect(datos.oculto, 'el objeto es decorativo (aria-hidden)').toBe('true');
    expect(datos.alto, 'el objeto mide al menos medio cuerpo del titular').toBeGreaterThanOrEqual(datos.linea * 0.5);
    expect(datos.ancho, 'el objeto es más ancho que alto, como la foto de Leadoff').toBeGreaterThan(datos.alto);
    expect(datos.cursiva, '«realidad» en la cursiva de acento').toBe('italic');
    expect(contraste(rgbDe(datos.color), rgbDe(datos.fondo)), 'el titular se lee sobre el cobalto').toBeGreaterThanOrEqual(4.5);
  });

  test('trama: dibuja caracteres sobre toda la portada, quieta sin cursor, y el cursor la deforma', async ({ page }) => {
    await page.goto('/');
    await esperarListo(page);
    const trama = page.locator('section[data-portada] canvas[data-trama]');
    await expect(trama).toHaveCount(1);
    expect(await trama.getAttribute('aria-hidden')).toBe('true');
    const [caja, seccion] = await Promise.all([trama.boundingBox(), page.locator('section[data-portada]').boundingBox()]);
    expect(caja && seccion && caja.width >= seccion.width - 2 && caja.height >= Math.min(seccion.height, 900) - 2, 'cubre la portada').toBeTruthy();
    await soloVer(page, 'nav, h1, [data-capa], section[data-portada] > *:not(canvas[data-trama])');
    await page.mouse.move(1430, 890);
    await page.waitForTimeout(1200);
    const zona = { x: 200, y: 300, width: 320, height: 320 };
    const quieta1 = await page.screenshot({ clip: zona });
    expect(await fraccionDistinta(page, quieta1, COBALTO), 'la trama dibuja algo (≥ 3 % de píxeles fuera del cobalto)').toBeGreaterThanOrEqual(0.03);
    await page.waitForTimeout(700);
    const quieta2 = await page.screenshot({ clip: zona });
    expect(await fraccionCambiada(page, quieta1, quieta2), 'sin cursor la trama está quieta').toBeLessThanOrEqual(0.01);
    await page.mouse.move(250, 350);
    await page.mouse.move(470, 570, { steps: 25 });
    await page.waitForTimeout(120);
    const tocada = await page.screenshot({ clip: zona });
    expect(await fraccionCambiada(page, quieta2, tocada), 'el cursor deforma la trama donde pasa').toBeGreaterThanOrEqual(0.03);
  });

  test('3D: Three llega diferido, no en el JS inicial, y las piezas se dibujan en al menos dos capas', async ({ page, request }) => {
    const scripts: string[] = [];
    page.on('response', (r) => {
      if (r.request().resourceType() === 'script') scripts.push(r.url());
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await page.waitForTimeout(800);
    // JS inicial: lo que el HTML nombra (script src y modulepreload).
    const html = await (await request.get('/')).text();
    const iniciales = [...html.matchAll(/<(?:script[^>]+src|link[^>]+rel="modulepreload"[^>]+href)="([^"]+)"/g)].map((m) => m[1]);
    for (const src of iniciales) {
      const cuerpo = await (await request.get(src)).text();
      expect(cuerpo.includes('WebGLRenderer'), `Three no viaja en el JS inicial (${src})`).toBe(false);
    }
    let conThree = 0;
    for (const url of scripts) if ((await (await request.get(url)).text()).includes('WebGLRenderer')) conThree++;
    expect(conThree, 'Three sí llega, en un trozo diferido').toBeGreaterThanOrEqual(1);
    const capas = page.locator('section[data-portada] [data-capa]');
    expect(await capas.count(), 'al menos dos capas de profundidad').toBeGreaterThanOrEqual(2);
    expect(await page.locator('section[data-portada] [data-capa] canvas').count(), 'cada capa dibuja en un canvas').toBeGreaterThanOrEqual(2);
    await soloVer(page, 'nav, h1, canvas[data-trama], section[data-portada] > *:not([data-capa])');
    await page.waitForTimeout(200);
    const foto = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
    expect(await fraccionDistinta(page, foto, COBALTO), 'las piezas 3D se ven (≥ 1 % de la portada)').toBeGreaterThanOrEqual(0.01);
  });

  test('parallax: al bajar, las capas van más lento que el contenido y a velocidades distintas', async ({ page }) => {
    await page.goto('/');
    await esperarListo(page);
    await page.waitForTimeout(400);
    const posiciones = () =>
      page.evaluate(() => ({
        seccion: document.querySelector('section[data-portada]')?.getBoundingClientRect().top ?? 0,
        capas: [...document.querySelectorAll('section[data-portada] [data-capa]')].map((c) => c.getBoundingClientRect().top),
      }));
    const antes = await posiciones();
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(1500);
    const despues = await posiciones();
    const dSeccion = despues.seccion - antes.seccion;
    expect(dSeccion, 'la página bajó').toBeLessThan(-200);
    const razones = antes.capas.map((y, i) => (despues.capas[i] - y) / dSeccion);
    expect(razones.length).toBeGreaterThanOrEqual(2);
    for (const r of razones) {
      expect(r, `cada capa se mueve con la página (razón ${r.toFixed(2)})`).toBeGreaterThan(0.2);
      expect(r, `y más lento que ella (razón ${r.toFixed(2)})`).toBeLessThan(0.97);
    }
    const ordenadas = [...razones].sort((a, b) => a - b);
    expect(ordenadas[ordenadas.length - 1] - ordenadas[0], 'al menos dos velocidades distintas').toBeGreaterThanOrEqual(0.05);
  });

  test('movimiento reducido: sin precarga, titular completo de una vez, sin parallax ni deformación', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await registrar(page);
    await page.goto('/', { waitUntil: 'commit' });
    await esperarListo(page);
    await page.waitForTimeout(400);
    const serie = await muestras(page);
    expect(serie.some((m) => m.precarga), 'la precarga nunca se ve').toBe(false);
    const primeraListo = serie.find((m) => m.listo);
    expect(primeraListo?.t ?? Infinity, 'data-listo en menos de 1 s').toBeLessThanOrEqual(1000);
    for (const m of serie.filter((x) => x.desfases.length)) for (const d of m.desfases) expect(Math.abs(d), 'las líneas nunca se mueven').toBeLessThanOrEqual(0.02);
    await expect(page.getByRole('heading', { level: 1, name: PREGUNTA, exact: true })).toBeVisible();
    const antes = await page.evaluate(() => ({
      s: document.querySelector('section[data-portada]')?.getBoundingClientRect().top ?? 0,
      c: [...document.querySelectorAll('section[data-portada] [data-capa]')].map((c) => c.getBoundingClientRect().top),
    }));
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    const despues = await page.evaluate(() => ({
      s: document.querySelector('section[data-portada]')?.getBoundingClientRect().top ?? 0,
      c: [...document.querySelectorAll('section[data-portada] [data-capa]')].map((c) => c.getBoundingClientRect().top),
    }));
    const dS = despues.s - antes.s;
    antes.c.forEach((y, i) => expect(Math.abs(despues.c[i] - y - dS), `la capa ${i + 1} no hace parallax`).toBeLessThanOrEqual(2));
  });

  test('sin WebGL: sin errores, la portada y el titular completos', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
    await page.addInitScript(() => {
      // Simula un navegador sin WebGL: getContext('webgl'|'webgl2') devuelve null.
      const proto = HTMLCanvasElement.prototype;
      const original = proto.getContext;
      Object.defineProperty(proto, 'getContext', {
        configurable: true,
        value: function (this: HTMLCanvasElement, tipo: string, opciones?: unknown) {
          if (/webgl/i.test(tipo)) return null;
          return Reflect.apply(original, this, [tipo, opciones]);
        },
      });
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    await esperarListo(page);
    await page.waitForTimeout(500);
    expect(errores, 'sin errores en consola').toEqual([]);
    await expect(page.getByRole('heading', { level: 1, name: PREGUNTA, exact: true })).toBeVisible();
    const fondo = await page.locator('section[data-portada]').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(rgbDe(fondo)).toEqual(COBALTO);
  });

  test('respaldo en CSS: si el JS no llega, la precarga se va sola a los 3,5 s', async ({ page }) => {
    await page.route('**/_astro/**/*.js', (r) => r.abort());
    await page.route('**/_astro/*.js', (r) => r.abort());
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForTimeout(4200);
    const precarga = page.locator('[data-precarga]');
    if (await precarga.count()) await expect(precarga, 'a los 4,2 s la precarga ya no tapa nada').toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: PREGUNTA, exact: true })).toBeVisible();
    const objeto = await page.locator('[data-objeto]').boundingBox();
    expect(objeto?.width ?? 0, 'el objeto se ve sin JS').toBeGreaterThan(20);
  });
});

test.describe('T02 · sin JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });

  test('sin JS no hay precarga y la portada se lee completa', async ({ page }) => {
    await page.goto('/');
    // Sin reintento: toBeHidden esperaría hasta 5 s y vería el respaldo CSS de los 3,5 s, no la ausencia.
    const precarga = page.locator('[data-precarga]');
    if (await precarga.count()) expect(await precarga.isVisible(), 'la precarga no aparece sin JS').toBe(false);
    await expect(page.getByRole('heading', { level: 1, name: PREGUNTA, exact: true })).toBeVisible();
    const objeto = await page.locator('[data-objeto]').boundingBox();
    expect(objeto?.width ?? 0, 'el objeto tiene su tamaño sin JS').toBeGreaterThan(20);
    const fondo = await page.locator('section[data-portada]').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(rgbDe(fondo)).toEqual(COBALTO);
  });
});
