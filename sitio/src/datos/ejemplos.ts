// Proyectos de ejemplo para la hélice mientras llegan ideas reales aprobadas (decisión del 2026-11-09).
// Con MIN_REALES o más ideas reales, los ejemplos dejan de mostrarse. Vienen del prototipo v2.

export interface Proyecto {
  idea: string;
  regla: string;
  area: string;
  modelo: string | null;
  faltan: string[];
  equipo_completo: boolean;
  ejemplo: boolean;
}

export const MIN_REALES = 6;

type Base = Omit<Proyecto, 'ejemplo' | 'equipo_completo'> & { equipo_completo?: boolean };

const BASE: readonly Base[] = [
  { idea: 'La Silla del Mes', regla: 'Quien más aporte en el mes pone su marca en una silla del auditorio.', area: 'Ciencias Económicas y Administrativas', modelo: 'Pago por posición o puja', faltan: ['Desarrollo', 'Diseño'] },
  { idea: 'Pixel Bosque', regla: 'Un muro de 10.000 píxeles del campus; cada píxel cuesta mil pesos.', area: 'Creación y Comunicación', modelo: 'Venta única', faltan: ['Desarrollo'] },
  { idea: 'Racha de Estudio', regla: 'Si no estudias tu hora diaria, tu apuesta va a la vaca del grupo.', area: 'Psicología', modelo: 'Comisión por transacción', faltan: ['Desarrollo', 'Legal'] },
  { idea: 'Turno Express', regla: 'Paga un poco más que el último y te sube un puesto en la fila del laboratorio.', area: 'Ingeniería', modelo: 'Pago por posición o puja', faltan: [], equipo_completo: true },
  { idea: 'Receta Única', regla: 'Una receta al día, la misma para toda la universidad.', area: 'Ciencias de la Salud', modelo: 'Publicidad o patrocinio', faltan: ['Marketing', 'Datos'] },
  { idea: 'Profe Invitado', regla: 'La clase más votada de la semana se graba y se vende por suscripción.', area: 'Educación', modelo: 'Suscripción', faltan: ['Diseño', 'Negocio'] },
  { idea: 'Cláusula Clara', regla: 'Pega unos términos y condiciones; te los explicamos en tres frases.', area: 'Ciencias Jurídicas y Políticas', modelo: 'Suscripción', faltan: ['Desarrollo'] },
  { idea: 'Pronóstico U', regla: 'Adivina el dato de la semana; el más cercano se lleva el pozo.', area: 'Ciencias', modelo: 'Comisión por transacción', faltan: ['Legal', 'Marketing'] },
];

export const EJEMPLOS: readonly Proyecto[] = BASE.map((p) => ({ ...p, equipo_completo: p.equipo_completo ?? false, ejemplo: true }));

/** Lo que muestra la hélice: las ideas reales y, mientras sean menos de MIN_REALES, ejemplos hasta completar. */
export function mezclarConEjemplos(reales: readonly Proyecto[]): Proyecto[] {
  if (reales.length >= MIN_REALES) return [...reales];
  return [...reales, ...EJEMPLOS.slice(0, Math.max(0, EJEMPLOS.length - reales.length))];
}
