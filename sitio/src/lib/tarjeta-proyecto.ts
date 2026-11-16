// Arma las tarjetas de la hélice con las ideas reales (Supabase). Mismo marcado que Proyectos.astro.
// Sin innerHTML: los textos los escribieron personas.
import type { Proyecto } from '../datos/ejemplos';
import { facultadDe } from '../datos/facultades';

const dos = (n: number): string => String(n).padStart(2, '0');

function span(clase: string | null, texto?: string): HTMLSpanElement {
  const s = document.createElement('span');
  if (clase) s.className = clase;
  if (texto !== undefined) s.textContent = texto;
  return s;
}

function crearTarjeta(p: Proyecto, i: number): HTMLLIElement {
  const facultad = facultadDe(p.area);
  const item = document.createElement('li');
  item.className = 'proyectos__item';
  item.dataset.item = '';

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'tarjeta';
  boton.dataset.tarjeta = '';
  boton.dataset.facultad = String(facultad.indice);
  boton.dataset.idea = p.idea;
  boton.dataset.faltan = p.faltan.join('|');
  boton.style.setProperty('--tarjeta-fondo', `var(--facultad-${facultad.indice})`);
  boton.style.setProperty('--tarjeta-texto', `var(--facultad-texto-${facultad.indice})`);

  const meta = span('tarjeta__meta');
  meta.append(span(null, p.ejemplo ? '[EJEMPLO]' : '[IDEA]'), span(null, dos(i + 1)));

  const titulo = span('tarjeta__titulo', p.idea);
  const sup = document.createElement('sup');
  sup.className = 'tarjeta__facultad';
  sup.textContent = facultad.corto;
  titulo.append(sup);

  const pie = span('tarjeta__pie');
  const estado = p.equipo_completo ? 'Equipo completo' : p.faltan.length > 0 ? `Busca: ${p.faltan.join(' · ')}` : 'Busca equipo';
  pie.append(span(null, estado), span('tarjeta__accion', p.equipo_completo ? 'Ser reserva →' : 'Sumarme →'));

  boton.append(meta, titulo, span('tarjeta__regla', p.regla), pie);
  item.append(boton);
  return item;
}

/** Reemplaza las tarjetas de la lista y actualiza la cuenta y el número de tarjetas de la sección. */
export function pintarTarjetas(seccion: HTMLElement, proyectos: readonly Proyecto[]): void {
  const lista = seccion.querySelector<HTMLElement>('[data-tarjetas]');
  if (!lista) return;
  lista.replaceChildren(...proyectos.map(crearTarjeta));
  seccion.style.setProperty('--n', String(proyectos.length));
  const cuenta = seccion.querySelector<HTMLElement>('[data-cuenta]');
  if (cuenta) cuenta.textContent = dos(proyectos.length);
}
