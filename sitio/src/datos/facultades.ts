// Facultades de la convocatoria: una sola lista para las bandas de «Carreras», el color de las tarjetas de la
// hélice (D-8) y el desplegable del formulario. Textos del prototipo v2 (borrador; el autor los aprueba).

export interface Facultad {
  /** 1 a 8: índice de los tokens --facultad-<n> y --facultad-texto-<n>. */
  indice: number;
  nombre: string;
  /** Nombre corto para el superíndice de las tarjetas (ryan A6). */
  corto: string;
  aporte: string;
}

export const FACULTADES: readonly Facultad[] = [
  { indice: 1, nombre: 'Ingeniería', corto: 'Ingeniería', aporte: 'Construir el producto, automatizar pagos, medir datos y escalar.' },
  { indice: 2, nombre: 'Ciencias Económicas y Administrativas', corto: 'Económicas', aporte: 'Modelo de negocio, precios, finanzas y proyección de ingresos.' },
  { indice: 3, nombre: 'Creación y Comunicación', corto: 'Creación', aporte: 'Identidad, experiencia de usuario, contenido y campañas que se comparten.' },
  { indice: 4, nombre: 'Psicología', corto: 'Psicología', aporte: 'Motivación, comportamiento del usuario y dinámicas que enganchan con ética.' },
  { indice: 5, nombre: 'Ciencias Jurídicas y Políticas', corto: 'Jurídicas', aporte: 'Términos y condiciones, protección de datos y propiedad intelectual.' },
  { indice: 6, nombre: 'Ciencias de la Salud', corto: 'Salud', aporte: 'Problemas reales del sector salud que pueden volverse servicios digitales.' },
  { indice: 7, nombre: 'Educación', corto: 'Educación', aporte: 'Dinámicas de aprendizaje, comunidades y productos educativos.' },
  { indice: 8, nombre: 'Ciencias', corto: 'Ciencias', aporte: 'Análisis de datos, modelos y experimentos para validar hipótesis.' },
];

/** Índice de color de «Otra» o de un área que no está en la lista. */
export const INDICE_OTRA = 9;

export function facultadDe(area: string | null | undefined): { indice: number; corto: string } {
  const f = FACULTADES.find((x) => x.nombre === (area ?? '').trim());
  return f ? { indice: f.indice, corto: f.corto } : { indice: INDICE_OTRA, corto: (area ?? '').trim() || 'Otra' };
}

export const PERFILES_FALTAN: readonly string[] = ['Desarrollo', 'Diseño', 'Negocio', 'Marketing', 'Legal', 'Datos'];
export const HABILIDADES: readonly string[] = ['Desarrollo', 'Diseño', 'Negocio', 'Marketing', 'Contenido', 'Legal', 'Datos', 'Investigación'];
export const MODELOS: readonly string[] = [
  'Pago por posición o puja',
  'Venta única',
  'Suscripción',
  'Comisión por transacción',
  'Publicidad o patrocinio',
  'Donación o crowdfunding',
  'Aún no lo sé',
];
