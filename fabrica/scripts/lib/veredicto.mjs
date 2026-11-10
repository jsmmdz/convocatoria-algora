// Lectura del veredicto del auditor. La fuente principal es el archivo del buzón
// (primera línea de QA-r<N>.md), porque es lo que queda como evidencia; el JSON de la
// respuesta solo confirma. --json-schema guía pero no garantiza: en la prueba del
// lanzador (2026-09-22) el auditor devolvió el JSON cuatro veces, entre bloques de
// código y con `hallazgos` como objeto.

const VALIDOS = ['PASA', 'NO PASA', 'ESCALADO'];

export function veredictoDelArchivo(textoQA) {
  const m = textoQA?.replace(/^﻿/, '').match(/^\s*VEREDICTO:\s*(PASA|NO PASA|ESCALADO)\b/);
  return m ? m[1] : null;
}

// Devuelve todos los objetos JSON de primer nivel que aparezcan en el texto.
function objetosJson(texto) {
  const encontrados = [];
  let profundidad = 0;
  let inicio = -1;
  let enCadena = false;
  let escape = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enCadena) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === '"') enCadena = false;
      continue;
    }
    if (c === '"') enCadena = true;
    else if (c === '{') {
      if (profundidad === 0) inicio = i;
      profundidad++;
    } else if (c === '}' && profundidad > 0) {
      profundidad--;
      if (profundidad === 0) {
        try {
          encontrados.push(JSON.parse(texto.slice(inicio, i + 1)));
        } catch {
          // no era JSON válido: se ignora
        }
      }
    }
  }
  return encontrados;
}

export function veredictoDeRespuesta(respuesta) {
  if (respuesta && typeof respuesta === 'object') return VALIDOS.includes(respuesta.veredicto) ? respuesta.veredicto : null;
  const candidatos = objetosJson(String(respuesta ?? '')).map((o) => o.veredicto).filter((v) => VALIDOS.includes(v));
  if (!candidatos.length) return null;
  // Si el mismo texto trae veredictos distintos, no hay veredicto.
  return candidatos.every((v) => v === candidatos[0]) ? candidatos[0] : 'CONTRADICTORIO';
}

// Une las dos fuentes. Devuelve { veredicto } o { error }.
export function decidirVeredicto(textoQA, respuesta) {
  const archivo = veredictoDelArchivo(textoQA);
  const json = veredictoDeRespuesta(respuesta);
  if (!archivo) return { error: 'QA-r<N>.md no existe o no empieza con «VEREDICTO: …»' };
  if (json === 'CONTRADICTORIO') return { error: 'la respuesta del auditor trae veredictos distintos' };
  if (json && json !== archivo) return { error: `el archivo dice «${archivo}» y la respuesta dice «${json}»` };
  return { veredicto: archivo, confirmadoPorJson: Boolean(json) };
}
