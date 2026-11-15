#!/usr/bin/env node
/**
 * Lanzador de los constructores Gemini (fábrica v5.0, decisión del autor del 2026-11-14).
 *
 * Claude planea, orquesta y revisa; Gemini 4 Hydrogen construye. Una ronda de construcción es:
 *   - ronda 1 de una tarea con `subtareas`: una sesión de Gemini por subtarea, **en paralelo**, cada una
 *     dueña solo de sus `archivos-S<n>`; después una sesión de **integración** con todos los archivos de
 *     la tarea, que monta las partes, corre compuertas y capturas y escribe ENTREGA-r1.md;
 *   - ronda 1 sin subtareas, o una corrección (r2, r3…): una sola sesión con todos los archivos.
 * Cada sesión es `agy -p --agent constructor` (.agents/agents/constructor.md), con el hook
 * `.agents/hooks.json` → `hook-gemini.mjs`, que recibe por el entorno qué puede escribir.
 *
 * Uso (desde la raíz del repo; lo corre el relevo del workflow /construir-tarea):
 *   node fabrica/scripts/gemini.mjs <ID> r<N> [--esfuerzo low|medium|high|xhigh] [--reintentar] [--simular]
 *
 * Asegura que la ronda corra (si no hay un supervisor vivo, arranca uno desacoplado) y espera hasta
 * `minutosEsperaPorLlamada` de fabrica/proyecto/modelos.json. Sale con:
 *   0 → la ronda terminó; la última línea es el JSON del resultado { estado, entrega, sesiones, mensaje }
 *       con estado ENTREGADA, SIN_CUOTA o FALLO
 *   3 → sigue corriendo: vuelve a llamar el mismo comando
 *   2 → uso incorrecto o tarea mal escrita
 *
 *   --reintentar  si la ronda terminó en SIN_CUOTA o FALLO, la vuelve a correr; las subtareas que ya
 *                 entregaron no se repiten
 *   --simular     no llama a agy: escribe entregas falsas en fabrica/buzon/<ID>/tmp/simulacion/ (para
 *                 probar el ciclo sin gastar cuota)
 *
 * El estado de la ronda vive en fabrica/buzon/<ID>/tmp/gemini-r<N>.json y el registro del supervisor
 * en gemini-r<N>.log, junto a él. Cada sesión deja REGISTRO-gemini-r<N>[-S<n>].json en el buzón, con el
 * modelo, los tiempos y los tokens medidos por agy.
 */
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerFrontmatter } from './lib/globs.mjs';

const FABRICA = 'v5.0';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = fileURLToPath(import.meta.url);
const CONFIG = JSON.parse(readFileSync(join(RAIZ, 'fabrica/proyecto/compuertas.json'), 'utf8'));
const MODELOS = JSON.parse(readFileSync(join(RAIZ, 'fabrica/proyecto/modelos.json'), 'utf8'));

const args = process.argv.slice(2);
const valor = (bandera) => (args.includes(bandera) ? args[args.indexOf(bandera) + 1] : undefined);
const ID = String(args[0] ?? '').toUpperCase();
const N = Number(String(args[1] ?? '').replace(/^r/i, ''));
const SUPERVISAR = args.includes('--supervisar');
const SIMULAR = args.includes('--simular');
const REINTENTAR = args.includes('--reintentar');
const ESFUERZO = valor('--esfuerzo');

function salirUso(mensaje) {
  console.error(mensaje);
  console.error('Uso: node fabrica/scripts/gemini.mjs <ID> r<N> [--esfuerzo low|medium|high|xhigh] [--reintentar] [--simular]');
  process.exit(2);
}
if (!/^T\d+[A-Z]?$/.test(ID) || !(N >= 1)) salirUso('Falta la tarea o la ronda, por ejemplo: node fabrica/scripts/gemini.mjs T04 r1');
if (ESFUERZO && !MODELOS.constructor.esfuerzos.includes(ESFUERZO)) salirUso(`Esfuerzo desconocido: ${ESFUERZO}`);

// ---------- Tarea ----------
const dirTareas = join(RAIZ, CONFIG.tareas);
const archivoTarea = readdirSync(dirTareas).find((f) => f.startsWith(`${ID}-`) && f.endsWith('.md'));
if (!archivoTarea) salirUso(`No hay tarea ${ID} en ${CONFIG.tareas}/`);
const tarea = leerFrontmatter(readFileSync(join(dirTareas, archivoTarea), 'utf8'));
const rutaTarea = `${CONFIG.tareas}/${archivoTarea}`;
const subtareas = N === 1 ? (tarea.subtareas ?? []) : [];
for (const s of subtareas) {
  if (!/^S\d+$/.test(s)) salirUso(`${ID}: la subtarea «${s}» no tiene forma S<n>`);
  if (!(tarea[`archivos-${s}`] ?? []).length) salirUso(`${ID}: la subtarea ${s} no declara archivos-${s}`);
}

const BUZON = join(RAIZ, CONFIG.buzon, ID);
const TMP = join(BUZON, 'tmp');
const SALIDA = SIMULAR ? join(TMP, 'simulacion') : BUZON; // dónde se escriben las entregas
mkdirSync(TMP, { recursive: true });
mkdirSync(SALIDA, { recursive: true });
const ESTADO = join(TMP, `gemini-r${N}${SIMULAR ? '-simulacion' : ''}.json`);
const LOG = join(TMP, `gemini-r${N}${SIMULAR ? '-simulacion' : ''}.log`);
const FINALES = new Set(['ENTREGADA', 'SIN_CUOTA', 'FALLO']);

const leerEstado = () => {
  try {
    return JSON.parse(readFileSync(ESTADO, 'utf8'));
  } catch {
    return null;
  }
};
const guardarEstado = (e) => writeFileSync(ESTADO, JSON.stringify({ ...e, actualizado: new Date().toISOString() }, null, 2));
const vivo = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
};
const log = (texto) => {
  const linea = `[${new Date().toLocaleTimeString('es-CO')}] ${texto}`;
  appendFileSync(LOG, `${linea}\n`);
  if (!SUPERVISAR) console.log(linea);
};

// =====================================================================================
// Modo normal: asegurar el supervisor y esperar
// =====================================================================================
if (!SUPERVISAR) {
  let estado = leerEstado();
  const corriendo = estado?.estado === 'CORRIENDO' && estado.pid && vivo(estado.pid);
  if (estado && FINALES.has(estado.estado) && !(REINTENTAR && estado.estado !== 'ENTREGADA')) {
    terminar(estado);
  }
  if (!corriendo) {
    const fd = openSync(LOG, 'a');
    const extra = [...(ESFUERZO ? ['--esfuerzo', ESFUERZO] : []), ...(SIMULAR ? ['--simular'] : [])];
    const hijo = spawn(process.execPath, [SCRIPT, ID, `r${N}`, '--supervisar', ...extra], {
      cwd: RAIZ, detached: true, stdio: ['ignore', fd, fd], windowsHide: true,
    });
    hijo.unref();
    guardarEstado({ estado: 'CORRIENDO', pid: hijo.pid, tarea: ID, ronda: N, inicio: new Date().toISOString(), sesiones: [] });
    log(`Ronda r${N} de ${ID} arrancada (supervisor ${hijo.pid}${subtareas.length ? `, subtareas ${subtareas.join(', ')} + integración` : ''}).`);
  } else {
    log(`Ronda r${N} de ${ID} sigue corriendo (supervisor ${estado.pid}); espero.`);
  }
  // GEMINI_ESPERA_SEG solo lo usan las pruebas del lanzador (para no esperar 9 minutos).
  const hasta = Date.now() + (Number(process.env.GEMINI_ESPERA_SEG) * 1000 || MODELOS.minutosEsperaPorLlamada * 60_000);
  while (Date.now() < hasta) {
    await new Promise((r) => setTimeout(r, 10_000));
    estado = leerEstado();
    if (estado && FINALES.has(estado.estado)) terminar(estado);
    if (estado?.estado === 'CORRIENDO' && estado.pid && !vivo(estado.pid)) {
      terminar({ ...estado, estado: 'FALLO', mensaje: `El supervisor ${estado.pid} murió sin terminar la ronda. Mira ${rel(LOG)}.` });
    }
  }
  const hechas = (estado?.sesiones ?? []).map((s) => `${s.sub ?? 'única'}: ${s.status}`).join(' · ');
  console.log(JSON.stringify({ estado: 'CORRIENDO', tarea: ID, ronda: N, sesiones: estado?.sesiones ?? [], mensaje: `Sigue corriendo${hechas ? ` (${hechas})` : ''}. Vuelve a correr el mismo comando.` }));
  process.exit(3);
}

function terminar(estado) {
  console.log(JSON.stringify({ estado: estado.estado, tarea: ID, ronda: N, entrega: estado.entrega ?? null, sesiones: estado.sesiones ?? [], mensaje: estado.mensaje ?? '' }));
  process.exit(0);
}

function rel(ruta) {
  return ruta.slice(RAIZ.length + 1).split('\\').join('/');
}

// =====================================================================================
// Supervisor: corre la ronda
// =====================================================================================
const sesiones = [];
const anotar = (s) => {
  sesiones.push(s);
  guardarEstado({ estado: 'CORRIENDO', pid: process.pid, tarea: ID, ronda: N, sesiones });
};

const modelo = (sub) => {
  const e = ESFUERZO ?? (sub && tarea[`esfuerzo-${sub}`]) ?? tarea.esfuerzo ?? MODELOS.constructor.esfuerzoPorDefecto;
  return `${MODELOS.constructor.familia}-${e}`;
};
const esCuota = (texto) => /\b429\b|RESOURCE_EXHAUSTED|quota exceeded|rate.?limit/i.test(texto ?? '');

const encabezado = (mod) =>
  `Registra en el encabezado de tus archivos del buzón: Modelo: ${mod} · Fábrica: ${FABRICA} · Ronda: r${N}. ` +
  'Inicio y Fin con la salida de `date`. Intervenciones del autor: 0 (corres sin autor). ' +
  'Corres sin interfaz y sin notificaciones: nunca termines tu turno esperando un comando en segundo plano; si un comando pasa a segundo plano, consulta su estado con manage_task hasta que termine.';

function ejecutar(argumentos, entorno) {
  return new Promise((resolver) => {
    const hijo = spawn('agy', argumentos, { cwd: RAIZ, env: { ...process.env, ...entorno }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let stdout = '';
    let stderr = '';
    hijo.stdout.on('data', (d) => (stdout += d));
    hijo.stderr.on('data', (d) => (stderr += d));
    hijo.on('close', (codigo) => resolver({ codigo, stdout, stderr }));
    hijo.on('error', (e) => resolver({ codigo: -1, stdout, stderr: String(e) }));
  });
}

/** Una sesión de Gemini. Si termina sin escribir su entrega (y no fue la cuota), se le pide una vez que la termine. */
async function sesion({ sub, archivos, entrega, prompt }) {
  const mod = modelo(sub === 'integracion' ? null : sub);
  const nombre = sub ?? 'única';
  const destino = join(SALIDA, entrega);
  const entorno = { FABRICA_TAREA: ID, FABRICA_SUBTAREA: sub ?? '', FABRICA_ARCHIVOS: JSON.stringify(archivos) };
  let conversacion = null;
  let registro = null;
  for (let intento = 1; intento <= 2; intento++) {
    const orden = intento === 1 ? `${prompt}\n\n${encabezado(mod)}` : `Tu turno terminó sin escribir ${rel(join(BUZON, entrega))}. Termina lo que falte de tu orden y escríbela ahora.`;
    const argumentos = ['-p', orden, '--agent', 'constructor', '--model', mod, '--output-format', 'json',
      '--print-timeout', `${MODELOS.minutosMaximosPorSesion}m`, '--dangerously-skip-permissions'];
    if (conversacion) argumentos.push('--conversation', conversacion);
    const inicio = new Date();
    log(`▶ ${nombre} · ${mod} · intento ${intento}`);
    let r;
    if (SIMULAR && process.env.GEMINI_SIMULAR_CUOTA === nombre) {
      // Solo para las pruebas del lanzador: esa sesión responde como agy sin cuota.
      r = { codigo: 0, stdout: JSON.stringify({ status: 'ERROR', conversation_id: 'simulada', response: 'RESOURCE_EXHAUSTED (429)' }), stderr: '429 Too Many Requests' };
    } else if (SIMULAR) {
      await new Promise((res) => setTimeout(res, Number(process.env.GEMINI_SIMULAR_SEG ?? 1.5) * 1000));
      writeFileSync(destino, `# Entrega simulada · ${ID} · ${nombre} · r${N}\n\n- **Modelo:** ${mod}\n\nArchivos: ${archivos.join(', ')}\n\nOrden:\n\n${orden}\n`);
      r = { codigo: 0, stdout: JSON.stringify({ status: 'SUCCESS', conversation_id: 'simulada', response: 'simulada', usage: { total_tokens: 0 } }), stderr: '' };
    } else {
      r = await ejecutar(argumentos, entorno);
    }
    const fin = new Date();
    let salida = null;
    try {
      salida = JSON.parse(r.stdout.trim().split('\n').filter(Boolean).pop() ?? '');
    } catch {
      // agy no devolvió JSON: queda el texto en el registro
    }
    conversacion = salida?.conversation_id ?? conversacion;
    registro = {
      tarea: ID, ronda: N, subtarea: sub, intento, modelo: mod, fabrica: FABRICA,
      inicio: inicio.toISOString(), fin: fin.toISOString(), segundos: Math.round((fin - inicio) / 1000),
      codigo: r.codigo, status: salida?.status ?? 'SIN_JSON', conversacion,
      usage: salida?.usage ?? null, num_turns: salida?.num_turns ?? null,
      denied_actions: salida?.denied_actions ?? [], respuesta: salida?.response ?? r.stdout.slice(-4000), stderr: r.stderr.slice(-4000),
    };
    const sufijo = `${sub ? `-${sub}` : ''}${intento > 1 ? `-c${intento - 1}` : ''}`;
    writeFileSync(join(SALIDA, `REGISTRO-gemini-r${N}${sufijo}.json`), JSON.stringify(registro, null, 2));
    // Solo cuenta si la sesión no terminó bien: una respuesta que solo menciona «429» no es falta de cuota.
    // agy puede salir con código 0 y status ERROR por la cuota (v2.4, T3a), por eso se mira el status y no el código.
    const cuota = registro.status !== 'SUCCESS' && esCuota(`${registro.stderr} ${registro.respuesta}`);
    log(`  ${nombre}: ${registro.status} · ${registro.segundos} s · ${registro.usage?.total_tokens ?? '?'} tokens${cuota ? ' · SIN CUOTA (429)' : ''}`);
    if (cuota) return { sub, modelo: mod, status: registro.status, segundos: registro.segundos, tokens: registro.usage?.total_tokens ?? null, entrego: existsSync(destino), cuota: true };
    if (existsSync(destino)) break;
    if (!conversacion) break; // sin conversación no hay cómo continuarla
  }
  return { sub, modelo: mod, status: registro.status, segundos: registro.segundos, tokens: registro.usage?.total_tokens ?? null, entrego: existsSync(destino), cuota: false };
}

function sinCuota(cortadas) {
  const fecha = new Date().toLocaleString('es-CO');
  const texto =
    `\n## Sin cuota de Gemini — r${N} (${fecha})\n\n` +
    `- Sesiones cortadas por el 429: ${cortadas.map((s) => s.sub ?? 'única').join(', ')}.\n` +
    `- Decisión del autor (2026-11-14): la tarea **para y se avisa**; no se pasa a otro modelo ni se reintenta solo.\n` +
    `- Se retoma cuando vuelva la cuota con el mismo comando del workflow; lo que ya entregó no se repite ` +
    `(las subtareas con su ENTREGA-r${N}-S<n>.md se saltan).\n`;
  if (!SIMULAR) appendFileSync(join(BUZON, 'ESCALADO.md'), texto);
  return texto;
}

async function ronda() {
  const otras = (s) => subtareas.filter((x) => x !== s).join(', ');
  if (subtareas.length) {
    const pendientes = subtareas.filter((s) => !existsSync(join(SALIDA, `ENTREGA-r1-${s}.md`)));
    if (pendientes.length < subtareas.length) log(`Ya entregaron: ${subtareas.filter((s) => !pendientes.includes(s)).join(', ')}; no se repiten.`);
    const resultados = await Promise.all(pendientes.map((s) => {
      const archivos = tarea[`archivos-${s}`];
      return sesion({
        sub: s, archivos, entrega: `ENTREGA-r1-${s}.md`,
        prompt:
          `Construye la subtarea ${s} de la tarea ${ID} (${rutaTarea}). Tu parte está en la sección «Subtarea ${s}» de la tarea: ` +
          `lee la tarea completa para entender el conjunto, pero construye solo tu parte. ` +
          `Tus archivos, lo único que puedes escribir además de fabrica/buzon/${ID}/: ${archivos.join(', ')}. ` +
          (otras(s) ? `Al mismo tiempo, otras sesiones construyen las subtareas ${otras(s)} en sus propios archivos: no los toques ni supongas que ya existen; si necesitas algo de otra subtarea, usa la interfaz que define la tarea. ` : '') +
          `No montes tu parte en la página: eso lo hace la integración, después. ` +
          `No corras las compuertas completas, ni capturas, ni playwright (otras sesiones corren a la vez); sí puedes correr ` +
          `node fabrica/scripts/compuertas.mjs ${ID} --sin-build y, desde sitio/, npx astro check. ` +
          `Escribe fabrica/buzon/${ID}/ENTREGA-r1-${s}.md con el formato de ENTREGA de fabrica/nucleo/plantillas/buzon.md: ` +
          `qué archivos escribiste, la interfaz que expones (qué exporta cada archivo y cómo se monta), supuestos y SOLICITUDES.`,
      });
    }));
    resultados.forEach(anotar);
    const cortadas = resultados.filter((r) => r.cuota);
    if (cortadas.length) return { estado: 'SIN_CUOTA', mensaje: sinCuota(cortadas).trim() };
    const faltan = subtareas.filter((s) => !existsSync(join(SALIDA, `ENTREGA-r1-${s}.md`)));
    if (faltan.length === subtareas.length) return { estado: 'FALLO', mensaje: `Ninguna subtarea entregó. Mira los REGISTRO-gemini-r1-S*.json del buzón y ${rel(LOG)}.` };
    const integracion = await sesion({
      sub: 'integracion', archivos: tarea.archivos ?? [], entrega: 'ENTREGA-r1.md',
      prompt:
        `Integra la tarea ${ID} (${rutaTarea}). Las subtareas ${subtareas.join(', ')} se construyeron en paralelo; sus entregas son ` +
        `fabrica/buzon/${ID}/ENTREGA-r1-S<n>.md: léelas todas, con sus SOLICITUDES. ` +
        (faltan.length ? `La subtarea ${faltan.join(' y ')} no entregó: constrúyela tú, según su sección de la tarea. ` : '') +
        `Tus archivos son todos los de la tarea. Monta las partes donde la tarea dice, resuelve lo que no encaje sin rehacer lo que funciona ` +
        `y termina la tarea completa como constructor: sigue «Antes de entregar» de fabrica/nucleo/roles/constructor.md ` +
        `(compuertas en primer plano con node fabrica/scripts/compuertas.mjs ${ID}, capturas con node fabrica/scripts/capturas.mjs ${ID} y la lista «Cuándo terminaste»). ` +
        `Escribe fabrica/buzon/${ID}/ENTREGA-r1.md: la entrega de toda la tarea, con un apartado por subtarea.`,
    });
    anotar(integracion);
    if (integracion.cuota) return { estado: 'SIN_CUOTA', mensaje: sinCuota([integracion]).trim() };
    return integracion.entrego
      ? { estado: 'ENTREGADA', entrega: rel(join(SALIDA, 'ENTREGA-r1.md')) }
      : { estado: 'FALLO', mensaje: `La integración terminó sin ENTREGA-r1.md. Mira REGISTRO-gemini-r1-integracion*.json y ${rel(LOG)}.` };
  }

  const orden = N === 1
    ? `Construye el MVP de la tarea ${ID} (${rutaTarea}). Es la ronda 1: tu entrega es fabrica/buzon/${ID}/ENTREGA-r1.md.`
    : `Corrige la tarea ${ID} (${rutaTarea}). Tu orden de trabajo es fabrica/buzon/${ID}/CORRECCION-r${N - 1}.md; lee también la entrega y el QA anteriores del buzón. Tu entrega es fabrica/buzon/${ID}/ENTREGA-r${N}.md.`;
  const unica = await sesion({ sub: null, archivos: tarea.archivos ?? [], entrega: `ENTREGA-r${N}.md`, prompt: orden });
  anotar(unica);
  if (unica.cuota) return { estado: 'SIN_CUOTA', mensaje: sinCuota([unica]).trim() };
  return unica.entrego
    ? { estado: 'ENTREGADA', entrega: rel(join(SALIDA, `ENTREGA-r${N}.md`)) }
    : { estado: 'FALLO', mensaje: `La sesión terminó sin ENTREGA-r${N}.md. Mira REGISTRO-gemini-r${N}*.json y ${rel(LOG)}.` };
}

try {
  log(`Supervisor ${process.pid}: ${ID} r${N}${SIMULAR ? ' (simulación)' : ''}`);
  const resultado = await ronda();
  guardarEstado({ ...resultado, pid: process.pid, tarea: ID, ronda: N, sesiones });
  log(`Fin: ${resultado.estado}${resultado.mensaje ? ` — ${resultado.mensaje.split('\n')[0]}` : ''}`);
} catch (error) {
  guardarEstado({ estado: 'FALLO', pid: process.pid, tarea: ID, ronda: N, sesiones, mensaje: `El supervisor falló: ${error instanceof Error ? error.stack : String(error)}` });
  log(`Fin: FALLO — ${error instanceof Error ? error.message : String(error)}`);
}
