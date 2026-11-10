export const meta = {
  name: 'construir-tarea',
  description: 'Fábrica v3: constructor (Sonnet) → QA (Sonnet, contexto limpio) → correcciones → auditoría final (Opus) de una tarea',
  whenToUse: 'Cuando el autor pide construir una tarea de fabrica/proyecto/tareas/, por ejemplo: /construir-tarea T01. Para retomar una tarea parada sin volver a construirla: /construir-tarea T01 auditoria, T01 qa r4 o T01 correccion r4',
  phases: [
    { title: 'Construir', detail: 'constructor · Sonnet 5.5' },
    { title: 'QA', detail: 'qa · Sonnet 5.5 high, contexto limpio' },
    { title: 'Auditoría final', detail: 'auditor-final · Opus 5.5 high', model: 'opus' },
  ],
}

// Entrada: "/construir-tarea T01" o "T01 high" (texto) o { id: 'T01', rondas: 3, esfuerzo: 'high' }.
// Retomar (v3.3), después de que el orquestador arregla lo que paró el ciclo: "T01 correccion r4" (el
// constructor lee CORRECCION-r3), "T01 qa r4" (otro QA de la última entrega) o "T01 auditoria" (solo la
// auditoría final); o { id, desde: 'correccion' | 'qa' | 'auditoria', ronda: 4 }.
const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const palabras = typeof args === 'string' ? args.trim().split(/\s+/) : []
const entrada = typeof args === 'string'
  ? {
      id: palabras[0],
      desde: palabras.slice(1).find((p) => ['correccion', 'qa', 'auditoria'].includes(sinTildes(p))),
      ronda: (palabras.slice(1).find((p) => /^r\d+$/i.test(p)) || '').slice(1),
      esfuerzo: palabras.slice(1).map((p) => p.toLowerCase()).find((p) => ['low', 'medium', 'high', 'xhigh', 'max'].includes(p)),
    }
  : (args ?? {})
const ID = String(entrada.id ?? '').toUpperCase()
if (!/^T\d+[A-Z]?$/.test(ID)) throw new Error('Falta el ID de la tarea, por ejemplo: /construir-tarea T01')
const DESDE = sinTildes(entrada.desde) || 'construir'
if (!['construir', 'correccion', 'qa', 'auditoria'].includes(DESDE)) throw new Error(`No sé retomar desde «${entrada.desde}»: usa correccion, qa o auditoria`)
const INICIO = DESDE === 'construir' ? 1 : Number(entrada.ronda) || 0
if ((DESDE === 'correccion' || DESDE === 'qa') && INICIO < 2) throw new Error(`Di la ronda en que se retoma, por ejemplo: /construir-tarea ${ID} ${DESDE} r4`)
// Construir: 1 construcción + hasta 2 correcciones. Retomar: hasta 2 rondas.
const RONDAS = Math.min(Math.max(Number(entrada.rondas) || (DESDE === 'construir' ? 3 : 2), 1), 3)
const ESFUERZO = entrada.esfuerzo // opcional: 'high' para tareas de shaders; si no, el del agente

const VEREDICTO = {
  type: 'object',
  required: ['veredicto', 'resumen', 'hallazgos'],
  properties: {
    veredicto: { type: 'string', enum: ['PASA', 'NO_PASA'] },
    resumen: { type: 'string' },
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severidad', 'dueno', 'descripcion'],
        properties: {
          severidad: { type: 'string', enum: ['Crítico', 'Mayor', 'Menor'] },
          dueno: { type: 'string', enum: ['constructor', 'orquestador'] },
          descripcion: { type: 'string' },
        },
      },
    },
  },
}

const FINAL = {
  type: 'object',
  required: ['resumen', 'escapados'],
  properties: {
    resumen: { type: 'string' },
    escapados: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'severidad', 'descripcion', 'porQueEscapo'],
        properties: {
          id: { type: 'string' },
          severidad: { type: 'string', enum: ['Crítico', 'Mayor', 'Menor'] },
          descripcion: { type: 'string' },
          porQueEscapo: { type: 'string' },
        },
      },
    },
  },
}

const opcionesConstructor = (ronda) => ({
  agentType: 'constructor',
  label: `constructor r${ronda}`,
  phase: 'Construir',
  ...(ESFUERZO ? { effort: ESFUERZO } : {}),
})

const rondas = []
let veredicto = null
let bloqueo = []

for (let i = 0; DESDE !== 'auditoria' && i < RONDAS; i++) {
  const ronda = INICIO + i
  const ultima = i === RONDAS - 1
  const sinEntrega = DESDE === 'qa' && i === 0
  let entrega = null
  if (sinEntrega) {
    log(`Se retoma en el QA de la ronda ${ronda}, sin construir de nuevo.`)
  } else {
    const orden = ronda === 1
      ? `Construye el MVP de la tarea ${ID} (fabrica/proyecto/tareas/${ID}-*.md). Es la ronda 1: tu entrega es fabrica/buzon/${ID}/ENTREGA-r1.md.`
      : `Corrige la tarea ${ID}. Tu orden de trabajo es fabrica/buzon/${ID}/CORRECCION-r${ronda - 1}.md; lee también la entrega y el QA anteriores del buzón. Tu entrega es fabrica/buzon/${ID}/ENTREGA-r${ronda}.md.`
    entrega = await agent(orden, opcionesConstructor(ronda))
    if (entrega === null) {
      log(`El constructor de la ronda ${ronda} no terminó (detenido o error de la API). Se para el ciclo.`)
      rondas.push({ ronda, entrega: null, qa: null })
      break
    }
  }

  veredicto = await agent(
    `Audita la ronda ${ronda} de la tarea ${ID}. ` +
    (sinEntrega
      ? `No hay entrega nueva: el orquestador arregló lo que paró el ciclo (lee ESCALADO.md); audita la entrega más reciente del buzón con el árbol de hoy. `
      : `La entrega está en fabrica/buzon/${ID}/ENTREGA-r${ronda}.md. `) +
    `Corre primero node fabrica/scripts/compuertas.mjs ${ID} --guardar y después sigue tu rol. ` +
    `Escribe fabrica/buzon/${ID}/QA-r${ronda}.md` +
    (ultima ? `; es la última ronda: si no pasa, escribe ESCALADO.md en lugar de CORRECCION.` : ` y, si no pasa, CORRECCION-r${ronda}.md.`) +
    ` Marca el dueño de cada hallazgo: «orquestador» si el constructor no lo puede arreglar (una prueba, una compuerta, un archivo fuera de su tarea, una contradicción entre la tarea y las pruebas); si no, «constructor». ` +
    `Si hay un Crítico o un Mayor del orquestador, escribe también ESCALADO.md (si ya existe, agrégale una sección con la ronda): el ciclo se para ahí. ` +
    `Devuelve el veredicto.`,
    { agentType: 'qa', label: `qa r${ronda}`, phase: 'QA', schema: VEREDICTO },
  )
  rondas.push({ ronda, entrega, qa: veredicto })
  if (!veredicto) {
    log(`El QA de la ronda ${ronda} no terminó. Se para el ciclo.`)
    break
  }
  log(`Ronda ${ronda}: ${veredicto.veredicto} (${veredicto.hallazgos.length} hallazgos)`)
  if (veredicto.veredicto === 'PASA') break
  // Corte temprano (v3.3): lo que solo arregla el orquestador no se le manda otra vez al constructor.
  // Falla F16: se gastaban rondas en una prueba de otra tarea que el constructor no podía editar.
  bloqueo = veredicto.hallazgos.filter((h) => h.dueno === 'orquestador' && h.severidad !== 'Menor')
  if (bloqueo.length) {
    log(`Corte temprano: ${bloqueo.length} hallazgo(s) que bloquean y son del orquestador. Se para el ciclo en la ronda ${ronda}.`)
    break
  }
}

let final = null
const aprobada = veredicto && veredicto.veredicto === 'PASA'
if (aprobada || DESDE === 'auditoria') {
  const contexto = aprobada
    ? `El QA la aprobó: lee fabrica/buzon/${ID}/ (entregas y QA) y la tarea.`
    : `El QA no la aprobó solo por un bloqueo que era del orquestador y que él ya arregló: lee fabrica/buzon/${ID}/ (entregas, QA, ESCALADO.md y el COMPUERTAS-r* más reciente, que debe estar en verde) y la tarea. Si las compuertas no están en verde, dilo en el resumen.`
  final = await agent(
    `Haz la auditoría final de la tarea ${ID}. ${contexto} ` +
    // v3.6: la suite completa corre solo aquí; el constructor y el QA corren la tarea y sus regresiones directas.
    `Corre una vez, en primer plano, node fabrica/scripts/compuertas.mjs ${ID} --completas --guardar: es la única corrida de la suite completa; un ❌ o un ⚠️ de reintento es un hallazgo tuyo. ` +
    `Escribe fabrica/buzon/${ID}/AUDITORIA-FINAL.md y devuelve el resumen.`,
    { agentType: 'auditor-final', label: 'auditoría final', phase: 'Auditoría final', schema: FINAL },
  )
} else if (bloqueo.length) {
  log('Bloqueada: el orquestador arregla lo suyo y la retoma con correccion, qa o auditoria, sin volver a construir.')
} else {
  log('Sin aprobación del QA: no hay auditoría final. La tarea vuelve al orquestador.')
}

return {
  tarea: ID,
  desde: DESDE,
  estado: final ? 'AUDITADA' : bloqueo.length ? 'BLOQUEADA' : (veredicto && veredicto.veredicto === 'NO_PASA' ? 'ESCALADA' : 'INCOMPLETA'),
  rondas: rondas.map((r) => ({ ronda: r.ronda, veredicto: r.qa ? r.qa.veredicto : null, hallazgos: r.qa ? r.qa.hallazgos : [] })),
  auditoriaFinal: final,
  tokensDeSalida: budget.spent(),
}
