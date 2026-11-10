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
  cargada: boolean; // document.readyState === 'complete' (ya disparó `load`)
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
        cargada: document.readyState === 'complete',
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

type Caja = { x: number; y: number; w: number; h: number };

// Por cada caja, la fracción de sus píxeles que se aleja de un color (distancia > 24 en RGB).
async function fraccionEnCajas(page: Page, png: Buffer, color: [number, number, number], cajas: Caja[]): Promise<number[]> {
  return page.evaluate(
    async ({ b64, c, cajas }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.width;
      cv.height = img.height;
      const ctx = cv.getContext('2d');
      if (!ctx) return cajas.map(() => -1);
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      return cajas.map((q) => {
        let n = 0;
        let distintos = 0;
        const [x0, y0] = [Math.max(0, Math.floor(q.x)), Math.max(0, Math.floor(q.y))];
        const [x1, y1] = [Math.min(cv.width, Math.floor(q.x + q.w)), Math.min(cv.height, Math.floor(q.y + q.h))];
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const i = (y * cv.width + x) * 4;
            n++;
            if (Math.abs(d[i] - c[0]) + Math.abs(d[i + 1] - c[1]) + Math.abs(d[i + 2] - c[2]) > 24) distintos++;
          }
        }
        return n ? distintos / n : -1;
      });
    },
    { b64: png.toString('base64'), c: color, cajas },
  );
}

const GRIS: [number, number, number] = [128, 128, 128];

// Deja a la vista solo las capas 3D sobre gris plano: lo que no es gris es una pieza. Con `soloDelante`, solo
// las capas que van después del titular en el documento (las que se pintan encima del contenido).
async function soloPiezas(page: Page, soloDelante: boolean): Promise<void> {
  await page.evaluate((soloDelante) => {
    const linea = document.querySelector('[data-linea]');
    document.querySelectorAll('[data-capa]').forEach((capa) => {
      const despues = !!linea && !!(linea.compareDocumentPosition(capa) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (!soloDelante || despues) capa.setAttribute('data-prueba-pieza', '');
    });
  }, soloDelante);
  await page.addStyleTag({
    content: `html[data-listo] * { visibility: hidden !important; }
      html[data-listo] section[data-portada] { visibility: visible !important; background: rgb(128,128,128) !important; }
      html[data-listo] [data-prueba-pieza], html[data-listo] [data-prueba-pieza] * { visibility: visible !important; }`,
  });
}

// Deja a la vista solo lo que se quiere fotografiar de la portada.
async function soloVer(page: Page, ocultar: string): Promise<void> {
  await page.addStyleTag({
    content: `${ocultar} { visibility: hidden !important; }`,
  });
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
    for (const d of primeraListo?.desfases ?? [])
      expect(Math.abs(d), 'con data-listo cada línea del titular está en su sitio').toBeLessThanOrEqual(0.02);
    expect(primeraListo?.objeto ?? 0, 'con data-listo el objeto ya tiene su tamaño').toBeGreaterThan(20);
  });

  // E3 de la auditoría de T02: con la carga rápida, una cuenta que remata a 100 sin esperar `load` pasaba igual.
  // Aquí las fuentes tardan 5 s, así que `load` llega tarde: la cuenta no pasa de 90 mientras tanto y la
  // precarga se va por el respaldo, sin quedarse colgada.
  test('precarga: con load tardío la cuenta se queda en 90 y el respaldo la quita antes de los 3,6 s', async ({ page }) => {
    await page.route('**/*.woff2', async (ruta) => {
      await new Promise((r) => setTimeout(r, 5000));
      await ruta.continue().catch(() => {});
    });
    await registrar(page);
    await page.goto('/', { waitUntil: 'commit' });
    await esperarListo(page);
    await page.waitForTimeout(200);
    const serie = await muestras(page);
    const sinCargar = serie.filter((m) => !m.cargada);
    const fin = serie.find((m, i) => i > 0 && serie[i - 1].precarga && !m.precarga);
    expect(fin, 'la precarga se fue').toBeTruthy();
    expect(
      sinCargar.some((m) => m.t >= (fin?.t ?? Infinity)),
      'la prueba de verdad retrasó load más allá de la precarga',
    ).toBe(true);
    const cuentas = sinCargar.filter((m) => m.precarga && m.cuenta).map((m) => Number((m.cuenta as string).replace(/\D/g, '')));
    expect(cuentas.length, 'se vio la cuenta antes de load').toBeGreaterThan(0);
    expect(Math.max(...cuentas), 'sin load la cuenta no pasa de 95').toBeLessThanOrEqual(95);
    expect(fin?.t ?? Infinity, 'el respaldo quita la precarga antes de los 3,6 s').toBeLessThanOrEqual(3600);
    expect(serie.find((m) => m.listo)?.t ?? Infinity, 'data-listo llega por el respaldo').toBeLessThanOrEqual(3700);
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
      if (modo.forzar)
        await page.evaluate((t) => {
          document.documentElement.dataset.theme = t;
        }, modo.forzar);
      await esperarListo(page);
      const portada = page.locator('section[data-portada]');
      await expect(portada).toHaveCount(1);
      const datos = await portada.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          fondo: getComputedStyle(el).backgroundColor,
          ancho: r.width,
          alto: r.height,
          izq: r.left,
        };
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
    expect(
      caja && seccion && caja.width >= seccion.width - 2 && caja.height >= Math.min(seccion.height, 900) - 2,
      'cubre la portada',
    ).toBeTruthy();
    await soloVer(page, 'nav, h1, [data-capa], section[data-portada] > *:not(canvas[data-trama])');
    await page.mouse.move(1430, 890);
    await page.waitForTimeout(1200);
    const zona = { x: 200, y: 300, width: 320, height: 320 };
    const quieta1 = await page.screenshot({ clip: zona });
    expect(
      await fraccionDistinta(page, quieta1, COBALTO),
      'la trama dibuja algo (≥ 3 % de píxeles fuera del cobalto)',
    ).toBeGreaterThanOrEqual(0.03);
    await page.waitForTimeout(700);
    const quieta2 = await page.screenshot({ clip: zona });
    expect(await fraccionCambiada(page, quieta1, quieta2), 'sin cursor la trama está quieta').toBeLessThanOrEqual(0.01);
    await page.mouse.move(250, 350);
    await page.mouse.move(470, 570, { steps: 25 });
    await page.waitForTimeout(120);
    const tocada = await page.screenshot({ clip: zona });
    expect(await fraccionCambiada(page, quieta2, tocada), 'el cursor deforma la trama donde pasa').toBeGreaterThanOrEqual(0.03);
  });

  // E2 de T02: la trama tocada por el cursor subía el brillo detrás del texto y bajaba el contraste del papel
  // a 2,2:1. La prueba del titular medía contra el fondo de la sección, no contra lo pintado detrás (F24).
  // Aquí solo queda la trama sobre el cobalto, se barre el contenido con el cursor y se mide el papel contra
  // cada píxel detrás de las etiquetas y del titular.
  test('trama: tocada por el cursor no baja el contraste del papel detrás de las etiquetas ni del titular', async ({ page }) => {
    await page.goto('/');
    await esperarListo(page);
    await page.waitForTimeout(800);
    const cajas = await page.evaluate(() => {
      const out: {
        nombre: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }[] = [];
      const caja = (nombre: string, r: DOMRect) => out.push({ nombre, x: r.left, y: r.top, w: r.width, h: r.height });
      document.querySelectorAll('[data-etiquetas] > *').forEach((e, i) => caja(`etiqueta ${i + 1}`, e.getBoundingClientRect()));
      document.querySelectorAll('[data-linea]').forEach((l, i) => {
        const rango = document.createRange();
        rango.selectNodeContents(l);
        // Recortado a la caja de la línea: [data-linea] corta con overflow y el alto de la fuente sobresale.
        const lr = l.getBoundingClientRect();
        [...rango.getClientRects()]
          .map((r) => new DOMRect(r.left, Math.max(r.top, lr.top), r.width, Math.min(r.bottom, lr.bottom) - Math.max(r.top, lr.top)))
          .filter((r) => r.width > 4 && r.height > 4)
          .forEach((r, j) => caja(`línea ${i + 1}.${j + 1}`, r));
      });
      return out;
    });
    expect(cajas.length, 'hay etiquetas y líneas que medir').toBeGreaterThanOrEqual(5);
    await page.addStyleTag({
      content: `html[data-listo] section[data-portada] * { visibility: hidden !important; }
        html[data-listo] canvas[data-trama] { visibility: visible !important; }`,
    });
    // El papel resuelto por el navegador (el token está en hex; rgbDe solo lee rgb()).
    const papel = rgbDe(
      await page.evaluate(() => {
        const muestra = document.createElement('span');
        muestra.style.color = 'var(--color-papel)';
        document.body.append(muestra);
        const color = getComputedStyle(muestra).color;
        muestra.remove();
        return color;
      }),
    );
    expect(contraste(papel, COBALTO), 'el papel se leyó bien (contra el cobalto pasa de 7:1)').toBeGreaterThan(7);
    const reposo = await page.screenshot();
    // Una caja a la vez: el cursor la cruza por el medio y la foto se toma enseguida, con la estela viva.
    const bajos: number[] = [];
    let tocada = 0;
    for (const c of cajas) {
      await page.mouse.move(c.x - 20, c.y + c.h / 2);
      await page.mouse.move(c.x + c.w + 20, c.y + c.h / 2, { steps: 6 });
      await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2, { steps: 3 });
      const png = await page.screenshot();
      tocada = Math.max(tocada, await fraccionCambiada(page, reposo, png));
      bajos.push((await medirBajos(png, [c]))[0]);
      await page.mouse.move(2, 2);
      await page.waitForTimeout(1100); // la estela vuelve al reposo antes de la caja siguiente
    }
    expect(tocada, 'el barrido de verdad tocó la trama (si no, la prueba no mide nada)').toBeGreaterThan(0.002);
    cajas.forEach((c, i) => {
      expect(bajos[i], `detrás de ${c.nombre}, píxeles de la trama tocada con el papel a menos de 4,5:1`).toBeLessThanOrEqual(0.005);
    });

    async function medirBajos(png: Buffer, cajas: { x: number; y: number; w: number; h: number }[]): Promise<number[]> {
      return page.evaluate(
        async ({ b64, cajas, papel }) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const cv = document.createElement('canvas');
          cv.width = img.width;
          cv.height = img.height;
          const ctx = cv.getContext('2d');
          if (!ctx) return cajas.map(() => -1);
          ctx.drawImage(img, 0, 0);
          const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
          const lin = (v: number) => {
            const t = v / 255;
            return t <= 0.04045 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4;
          };
          const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          const lp = lum(papel[0], papel[1], papel[2]);
          return cajas.map((q) => {
            let n = 0;
            let malos = 0;
            for (let y = Math.max(0, Math.floor(q.y)); y < Math.min(cv.height, Math.floor(q.y + q.h)); y++) {
              for (let x = Math.max(0, Math.floor(q.x)); x < Math.min(cv.width, Math.floor(q.x + q.w)); x++) {
                const i = (y * cv.width + x) * 4;
                const l = lum(d[i], d[i + 1], d[i + 2]);
                const k = (Math.max(l, lp) + 0.05) / (Math.min(l, lp) + 0.05);
                n++;
                if (k < 4.5) malos++;
              }
            }
            return n ? malos / n : -1;
          });
        },
        { b64: png.toString('base64'), cajas, papel },
      );
    }
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
    expect(await page.locator('section[data-portada] [data-capa] canvas').count(), 'cada capa dibuja en un canvas').toBeGreaterThanOrEqual(
      2,
    );
    await soloVer(page, 'nav, h1, canvas[data-trama], section[data-portada] > *:not([data-capa])');
    await page.waitForTimeout(200);
    const foto = await page.screenshot({
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    expect(await fraccionDistinta(page, foto, COBALTO), 'las piezas 3D se ven (≥ 1 % de la portada)').toBeGreaterThanOrEqual(0.01);
  });

  // H1 y H7 de T02 (decisión del autor 2026-11-10): una pieza de delante cruza el titular a propósito, como en
  // Table Tales, pero sin taparlo (≤ 25 % de cada fragmento); la pastilla y las etiquetas no se tocan nunca, tampoco cuando
  // el cursor las mueve. Antes solo lo veían las capturas y una sonda del auditor.
  test('3D: una pieza de delante cruza el titular sin taparlo y ninguna toca la pastilla ni las etiquetas, en reposo y con el cursor', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const tamanos = [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
      { width: 375, height: 667 },
    ];
    for (const vp of tamanos) {
      await page.setViewportSize(vp);
      await page.goto('/');
      await esperarListo(page);
      await page.waitForTimeout(1200);
      const cajas = await page.evaluate(() => {
        const out: {
          nombre: string;
          x: number;
          y: number;
          w: number;
          h: number;
        }[] = [];
        const caja = (nombre: string, r: DOMRect) => out.push({ nombre, x: r.left, y: r.top, w: r.width, h: r.height });
        document.querySelectorAll('[data-etiquetas] > *').forEach((e, i) => caja(`etiqueta ${i + 1}`, e.getBoundingClientRect()));
        const objeto = document.querySelector('[data-objeto]');
        if (objeto) caja('pastilla', objeto.getBoundingClientRect());
        document.querySelectorAll('[data-linea]').forEach((l, i) => {
          const rango = document.createRange();
          rango.selectNodeContents(l);
          // Recortado a la caja de la línea: [data-linea] corta con overflow y el alto de la fuente sobresale.
          const lr = l.getBoundingClientRect();
          [...rango.getClientRects()]
            .map((r) => new DOMRect(r.left, Math.max(r.top, lr.top), r.width, Math.min(r.bottom, lr.bottom) - Math.max(r.top, lr.top)))
            .filter((r) => r.width > 4 && r.height > 4)
            .forEach((r, j) => caja(`línea ${i + 1}.${j + 1}`, r));
        });
        return out;
      });
      expect(cajas.filter((c) => c.nombre.startsWith('etiqueta')).length, 'las etiquetas están en [data-etiquetas]').toBeGreaterThanOrEqual(
        3,
      );
      await soloPiezas(page, true);
      const cursores: [string, number, number][] = [
        ['reposo', -1, -1],
        ['centro', vp.width / 2, vp.height / 2],
        ['esquina de Postúlate', vp.width - 60, 30],
        ['abajo a la izquierda', 40, vp.height - 40],
      ];
      let vioPiezas = false;
      let cruce = 0;
      for (const [donde, x, y] of cursores) {
        if (x >= 0) await page.mouse.move(x, y, { steps: 4 });
        await page.waitForTimeout(1200);
        const png = await page.screenshot();
        vioPiezas ||= (await fraccionDistinta(page, png, GRIS)) > 0.005;
        const tapado = await fraccionEnCajas(page, png, GRIS, cajas);
        cajas.forEach((c, i) => {
          const esLinea = c.nombre.startsWith('línea');
          if (esLinea && donde === 'reposo') cruce = Math.max(cruce, tapado[i]);
          expect(tapado[i], `${vp.width}×${vp.height}, cursor ${donde}: una pieza tapa ${c.nombre}`).toBeLessThanOrEqual(
            esLinea ? 0.25 : 0.01,
          );
        });
      }
      expect(vioPiezas, `${vp.width}×${vp.height}: se ven piezas delante (si no, la prueba no mide nada)`).toBe(true);
      expect(cruce, `${vp.width}×${vp.height}: en reposo una pieza de delante cruza el titular`).toBeGreaterThanOrEqual(0.01);
    }
  });

  // H5 de T02: si el tamaño cambia con la página bajada (giro del celular, barra del navegador), las piezas
  // se recolocan igual que sin scroll; antes la franja de la nav se medía en la ventana y las sacaba.
  test('3D: cambiar el tamaño con la página bajada deja las piezas donde estarían sin scroll', async ({ page }) => {
    test.setTimeout(90_000);
    const celdas = (w: number, h: number): Caja[] =>
      [0, 1].flatMap((f) =>
        [0, 1, 2].map((c) => ({
          x: (c * w) / 3,
          y: (f * h) / 2,
          w: w / 3,
          h: h / 2,
        })),
      );
    const medir = async (conScroll: boolean): Promise<number[]> => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
      await esperarListo(page);
      await page.waitForTimeout(1500);
      if (conScroll) {
        await page.mouse.move(720, 450);
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(1500);
        expect(await page.evaluate(() => window.scrollY), 'la página bajó').toBeGreaterThan(200);
      }
      await page.setViewportSize({ width: 1440, height: 880 });
      if (conScroll) {
        await page.mouse.wheel(0, -2000);
        await page.waitForTimeout(1500);
      }
      await page.waitForTimeout(1200);
      await soloPiezas(page, false);
      await page.mouse.move(720, 440); // cursor al centro: sin desplazamiento de parallax en los dos casos
      await page.waitForTimeout(1500);
      return fraccionEnCajas(page, await page.screenshot(), GRIS, celdas(1440, 880));
    };
    const control = await medir(false);
    const bajada = await medir(true);
    const presencia = (v: number[]) => v.map((n) => (n > 0.002 ? 1 : 0)).join('');
    expect(
      control.some((n) => n > 0.002),
      'sin scroll se ven piezas (si no, la prueba no mide nada)',
    ).toBe(true);
    expect(presencia(bajada), `celdas con pieza (3×2): sin scroll ${presencia(control)}, con scroll ${presencia(bajada)}`).toBe(
      presencia(control),
    );
    control.forEach((n, i) => {
      if (n > 0.002)
        expect(bajada[i] / n, `celda ${i + 1}: la pieza no se sale ni se corta (con scroll / sin scroll)`).toBeGreaterThanOrEqual(0.55);
    });
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
    expect(
      serie.some((m) => m.precarga),
      'la precarga nunca se ve',
    ).toBe(false);
    const primeraListo = serie.find((m) => m.listo);
    expect(primeraListo?.t ?? Infinity, 'data-listo en menos de 1 s').toBeLessThanOrEqual(1000);
    for (const m of serie.filter((x) => x.desfases.length))
      for (const d of m.desfases) expect(Math.abs(d), 'las líneas nunca se mueven').toBeLessThanOrEqual(0.02);
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
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
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
  test.use({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });

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
