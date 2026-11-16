// Conexión con Supabase (docs/2-TECNICO § 5). Sin las variables PUBLIC_SUPABASE_URL y
// PUBLIC_SUPABASE_ANON_KEY la web corre en modo demostración: la hélice muestra los [EJEMPLO] y el
// formulario avisa que no puede guardar. La librería se carga diferida, solo si hay conexión.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Proyecto } from '../datos/ejemplos';

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const URL_SUPABASE = texto(import.meta.env.PUBLIC_SUPABASE_URL);
const CLAVE_ANON = texto(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);

export const conectado: boolean = URL_SUPABASE !== '' && CLAVE_ANON !== '';

let cliente: Promise<SupabaseClient> | null = null;

/** El cliente de Supabase, o null en modo demostración. */
export async function supabase(): Promise<SupabaseClient | null> {
  if (!conectado) return null;
  cliente ??= import('@supabase/supabase-js').then((m) => m.createClient(URL_SUPABASE, CLAVE_ANON));
  return cliente;
}

export type Tipo = 'idea' | 'equipo';

export interface Postulacion {
  tipo: Tipo;
  nombre: string;
  correo: string;
  area: string;
  programa: string;
  // con idea
  idea: string;
  regla: string;
  modelo: string;
  publico: string;
  faltan: string[];
  publicar: boolean;
  // para sumarse
  proyecto: string;
  habilidades: string[];
  horas: number | null;
  portafolio: string;
  motivacion: string;
}

/** Fila completa, como la ve el equipo en el panel. */
export interface Fila {
  id: string;
  created_at: string;
  tipo: Tipo;
  nombre: string;
  correo: string;
  area: string;
  programa: string;
  idea: string | null;
  regla: string | null;
  modelo: string | null;
  publico: string | null;
  faltan: string[];
  publicar: boolean;
  proyecto: string | null;
  habilidades: string[];
  horas: number | null;
  portafolio: string | null;
  motivacion: string | null;
  aprobada: boolean;
  equipo_completo: boolean;
}

export class ErrorDeEnvio extends Error {
  constructor(
    mensaje: string,
    readonly demostracion = false,
  ) {
    super(mensaje);
  }
}

/** Guarda una postulación. Lanza ErrorDeEnvio con un mensaje para la persona si algo falla. */
export async function enviarPostulacion(d: Postulacion): Promise<void> {
  const sb = await supabase();
  if (!sb) {
    throw new ErrorDeEnvio('Modo demostración: la convocatoria todavía no está conectada a la base de datos, así que tu postulación no se guardó.', true);
  }
  const comunes = { tipo: d.tipo, nombre: d.nombre, correo: d.correo, area: d.area, programa: d.programa, consentimiento: true };
  const fila: Record<string, string | number | boolean | string[] | null> =
    d.tipo === 'idea'
      ? { ...comunes, idea: d.idea, regla: d.regla, modelo: d.modelo || null, publico: d.publico || null, faltan: d.faltan, publicar: d.publicar }
      : { ...comunes, proyecto: d.proyecto || null, habilidades: d.habilidades, horas: d.horas, portafolio: d.portafolio || null, motivacion: d.motivacion || null };
  const { error } = await sb.from('postulaciones').insert(fila);
  if (error) throw new ErrorDeEnvio('No pudimos guardar tu postulación. Revisa tu conexión e inténtalo de nuevo.');
}

const esTexto = (v: unknown): v is string => typeof v === 'string';

/** Ideas aprobadas para la hélice: sin nombres ni correos (función proyectos_publicos del esquema). */
export async function cargarProyectos(): Promise<Proyecto[]> {
  try {
    const sb = await supabase();
    if (!sb) return [];
    const { data, error } = await sb.rpc('proyectos_publicos');
    if (error || !Array.isArray(data)) return [];
    const proyectos: Proyecto[] = [];
    for (const fila of data) {
      if (typeof fila !== 'object' || fila === null) continue;
      const f: Record<string, unknown> = fila;
      if (!esTexto(f.idea) || !esTexto(f.regla)) continue;
      proyectos.push({
        idea: f.idea,
        regla: f.regla,
        area: esTexto(f.area) ? f.area : '',
        modelo: esTexto(f.modelo) ? f.modelo : null,
        faltan: Array.isArray(f.faltan) ? f.faltan.filter(esTexto) : [],
        equipo_completo: f.equipo_completo === true,
        ejemplo: false,
      });
    }
    return proyectos;
  } catch {
    return [];
  }
}
