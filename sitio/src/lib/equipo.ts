// Panel del equipo: entrar con Supabase Auth, revisar postulaciones, aprobar ideas para la hélice, marcar
// equipo completo, borrar con confirmación y exportar CSV. Sin Supabase conectado, el panel se recorre con
// datos de ejemplo en memoria (nada se guarda). Sin innerHTML: los textos los escribieron personas.
import { conectado, supabase, type Fila } from './datos';

type Vista = 'cargando' | 'entrar' | 'sin-conexion' | 'panel';
type Cambio = Partial<Pick<Fila, 'aprobada' | 'equipo_completo'>>;

/** De dónde salen y a dónde van las postulaciones: Supabase o la memoria (demostración). */
interface Fuente {
  demostracion: boolean;
  listar(): Promise<Fila[]>;
  cambiar(id: string, campos: Cambio): Promise<void>;
  borrar(id: string): Promise<void>;
}

const CONFIRMAR_MS = 4000;

function el<K extends keyof HTMLElementTagNameMap>(etiqueta: K, clase?: string, texto?: string): HTMLElementTagNameMap[K] {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function filaDeEjemplo(i: number, parcial: Partial<Fila>): Fila {
  return {
    id: `ejemplo-${i}`,
    created_at: new Date(Date.UTC(2026, 10, 16 - i, 15)).toISOString(),
    tipo: 'idea',
    nombre: `[EJEMPLO] Persona ${i}`,
    correo: `ejemplo${i}@unbosque.edu.co`,
    area: 'Ingeniería',
    programa: '[PROGRAMA], 4.º',
    idea: null,
    regla: null,
    modelo: null,
    publico: null,
    faltan: [],
    publicar: false,
    proyecto: null,
    habilidades: [],
    horas: null,
    portafolio: null,
    motivacion: null,
    aprobada: false,
    equipo_completo: false,
    ...parcial,
  };
}

function fuenteDeEjemplo(): Fuente {
  let filas: Fila[] = [
    filaDeEjemplo(1, { area: 'Ciencias Económicas y Administrativas', idea: 'La Silla del Mes', regla: 'Quien más aporte en el mes pone su marca en una silla del auditorio.', modelo: 'Pago por posición o puja', publico: 'Marcas locales', faltan: ['Desarrollo', 'Diseño'], publicar: true, aprobada: true }),
    filaDeEjemplo(2, { area: 'Creación y Comunicación', idea: 'Pixel Bosque', regla: 'Un muro de 10.000 píxeles del campus; cada píxel cuesta mil pesos.', modelo: 'Venta única', faltan: ['Desarrollo'], publicar: true }),
    filaDeEjemplo(3, { tipo: 'equipo', area: 'Ingeniería', proyecto: 'La Silla del Mes', habilidades: ['Desarrollo', 'Datos'], horas: 6, motivacion: '[EJEMPLO] Me interesan los productos con pagos.' }),
    filaDeEjemplo(4, { area: 'Psicología', idea: 'Racha de Estudio', regla: 'Si no estudias tu hora diaria, tu apuesta va a la vaca del grupo.', modelo: 'Comisión por transacción', faltan: ['Desarrollo', 'Legal'], publicar: false }),
    filaDeEjemplo(5, { tipo: 'equipo', area: 'Ciencias Jurídicas y Políticas', habilidades: ['Legal', 'Investigación'], horas: 4 }),
    filaDeEjemplo(6, { area: 'Ingeniería', idea: 'Turno Express', regla: 'Paga un poco más que el último y te sube un puesto en la fila del laboratorio.', modelo: 'Pago por posición o puja', publicar: true, aprobada: true, equipo_completo: true }),
  ];
  return {
    demostracion: true,
    listar: async () => filas.map((f) => ({ ...f })),
    cambiar: async (id, campos) => {
      filas = filas.map((f) => (f.id === id ? { ...f, ...campos } : f));
    },
    borrar: async (id) => {
      filas = filas.filter((f) => f.id !== id);
    },
  };
}

const esTexto = (v: unknown): v is string => typeof v === 'string';
const textoONulo = (v: unknown): string | null => (esTexto(v) && v !== '' ? v : null);
const lista = (v: unknown): string[] => (Array.isArray(v) ? v.filter(esTexto) : []);

function aFila(dato: unknown): Fila | null {
  if (typeof dato !== 'object' || dato === null) return null;
  const d: Record<string, unknown> = { ...dato };
  if (!esTexto(d.id) || !esTexto(d.nombre) || !esTexto(d.correo)) return null;
  return {
    id: d.id,
    created_at: esTexto(d.created_at) ? d.created_at : '',
    tipo: d.tipo === 'equipo' ? 'equipo' : 'idea',
    nombre: d.nombre,
    correo: d.correo,
    area: esTexto(d.area) ? d.area : '',
    programa: esTexto(d.programa) ? d.programa : '',
    idea: textoONulo(d.idea),
    regla: textoONulo(d.regla),
    modelo: textoONulo(d.modelo),
    publico: textoONulo(d.publico),
    faltan: lista(d.faltan),
    publicar: d.publicar === true,
    proyecto: textoONulo(d.proyecto),
    habilidades: lista(d.habilidades),
    horas: typeof d.horas === 'number' ? d.horas : null,
    portafolio: textoONulo(d.portafolio),
    motivacion: textoONulo(d.motivacion),
    aprobada: d.aprobada === true,
    equipo_completo: d.equipo_completo === true,
  };
}

function fuenteSupabase(): Fuente {
  const cliente = async () => {
    const sb = await supabase();
    if (!sb) throw new Error('Sin conexión con Supabase.');
    return sb;
  };
  return {
    demostracion: false,
    listar: async () => {
      const sb = await cliente();
      const { data, error } = await sb.from('postulaciones').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      const filas: Fila[] = [];
      for (const dato of Array.isArray(data) ? data : []) {
        const fila = aFila(dato);
        if (fila) filas.push(fila);
      }
      return filas;
    },
    cambiar: async (id, campos) => {
      const sb = await cliente();
      const { error } = await sb.from('postulaciones').update(campos).eq('id', id);
      if (error) throw new Error(error.message);
    },
    borrar: async (id) => {
      const sb = await cliente();
      const { error } = await sb.from('postulaciones').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

const COLUMNAS_CSV: ReadonlyArray<keyof Fila> = [
  'created_at', 'tipo', 'nombre', 'correo', 'area', 'programa', 'idea', 'regla', 'modelo', 'publico', 'faltan',
  'publicar', 'aprobada', 'equipo_completo', 'proyecto', 'habilidades', 'horas', 'portafolio', 'motivacion',
];

/** CSV con BOM (para que Excel lea las tildes), comillas dobladas y las listas separadas por «; ». */
export function aCSV(filas: readonly Fila[]): string {
  const celda = (v: Fila[keyof Fila]): string => `"${String(Array.isArray(v) ? v.join('; ') : (v ?? '')).replace(/"/g, '""')}"`;
  const lineas = [COLUMNAS_CSV.join(','), ...filas.map((f) => COLUMNAS_CSV.map((c) => celda(f[c])).join(','))];
  return `﻿${lineas.join('\n')}`;
}

export function iniciarPanel(): void {
  const raiz = document.querySelector<HTMLElement>('[data-panel]');
  const cuerpo = raiz?.querySelector<HTMLTableSectionElement>('[data-filas]');
  const cifras = raiz?.querySelector<HTMLElement>('[data-cifras]');
  const avisoPanel = raiz?.querySelector<HTMLElement>('[data-aviso-panel]');
  const avisoEntrar = raiz?.querySelector<HTMLElement>('[data-aviso-entrar]');
  const salir = raiz?.querySelector<HTMLButtonElement>('[data-salir]');
  if (!raiz || !cuerpo || !cifras || !avisoPanel || !avisoEntrar || !salir) return;

  const filtro = (nombre: string): HTMLSelectElement | null => raiz.querySelector<HTMLSelectElement>(`[data-filtro="${nombre}"]`);
  const filtroTipo = filtro('tipo');
  const filtroArea = filtro('area');
  const filtroEstado = filtro('estado');

  let fuente: Fuente | null = null;
  let filas: Fila[] = [];

  const ver = (vista: Vista): void => {
    for (const seccion of raiz.querySelectorAll<HTMLElement>('[data-vista]')) seccion.hidden = seccion.dataset.vista !== vista;
    salir.hidden = vista !== 'panel';
    const marca = raiz.querySelector<HTMLElement>('[data-marca-demo]');
    if (marca) marca.hidden = !(vista === 'panel' && fuente?.demostracion === true);
  };

  const avisar = (donde: HTMLElement, mensaje: string, mal = false): void => {
    donde.hidden = mensaje === '';
    donde.textContent = mensaje;
    if (mal) donde.dataset.tono = 'mal';
    else delete donde.dataset.tono;
  };

  const filtradas = (): Fila[] => {
    const tipo = filtroTipo?.value ?? '';
    const area = filtroArea?.value ?? '';
    const estado = filtroEstado?.value ?? '';
    return filas.filter(
      (p) =>
        (tipo === '' || p.tipo === tipo) &&
        (area === '' || p.area === area) &&
        (estado === '' || (p.tipo === 'idea' && p.publicar && (estado === 'aprobada' ? p.aprobada : !p.aprobada))),
    );
  };

  const cambiar = async (p: Fila, campos: Cambio, boton: HTMLButtonElement): Promise<void> => {
    if (!fuente) return;
    boton.disabled = true;
    try {
      await fuente.cambiar(p.id, campos);
      Object.assign(p, campos);
      avisar(avisoPanel, '');
      pintar();
    } catch (error) {
      boton.disabled = false;
      avisar(avisoPanel, `No se pudo guardar el cambio: ${error instanceof Error ? error.message : 'error desconocido'}`, true);
    }
  };

  const alternador = (activo: boolean, textoSi: string, textoNo: string, alPulsar: (boton: HTMLButtonElement) => void): HTMLButtonElement => {
    const b = el('button', 'boton boton--mini', activo ? textoSi : textoNo);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(activo));
    b.addEventListener('click', () => alPulsar(b));
    return b;
  };

  const celdaHelice = (p: Fila): HTMLTableCellElement => {
    const td = el('td');
    if (p.tipo !== 'idea') {
      td.textContent = '—';
      return td;
    }
    if (!p.publicar) {
      td.textContent = 'No autorizó publicar';
      return td;
    }
    const caja = el('div', 'fila__acciones');
    caja.append(
      alternador(p.aprobada, 'En la hélice', 'Aprobar', (b) => void cambiar(p, { aprobada: !p.aprobada }, b)),
      alternador(p.equipo_completo, 'Equipo completo', 'Busca equipo', (b) => void cambiar(p, { equipo_completo: !p.equipo_completo }, b)),
    );
    td.append(caja);
    return td;
  };

  // Borrar pide confirmación: el primer clic arma el botón unos segundos y el segundo borra.
  const celdaBorrar = (p: Fila): HTMLTableCellElement => {
    const td = el('td');
    const quien = p.tipo === 'idea' && p.idea ? p.idea : p.nombre;
    const b = el('button', 'boton boton--mini boton--peligro', 'Borrar');
    b.type = 'button';
    // El nombre accesible siempre contiene el texto visible del botón.
    const nombrar = (): void => b.setAttribute('aria-label', `${b.textContent ?? 'Borrar'} la postulación de ${quien}`);
    nombrar();
    let reloj = 0;
    b.addEventListener('click', () => {
      if (!fuente) return;
      if (!('armado' in b.dataset)) {
        b.dataset.armado = '';
        b.textContent = '¿Seguro? Borrar';
        nombrar();
        reloj = window.setTimeout(() => {
          delete b.dataset.armado;
          b.textContent = 'Borrar';
          nombrar();
        }, CONFIRMAR_MS);
        return;
      }
      window.clearTimeout(reloj);
      b.disabled = true;
      fuente
        .borrar(p.id)
        .then(() => {
          filas = filas.filter((x) => x.id !== p.id);
          avisar(avisoPanel, '');
          pintar();
        })
        .catch((error: unknown) => {
          b.disabled = false;
          avisar(avisoPanel, `No se pudo borrar: ${error instanceof Error ? error.message : 'error desconocido'}`, true);
        });
    });
    td.append(b);
    return td;
  };

  const pintar = (): void => {
    const ideas = filas.filter((p) => p.tipo === 'idea');
    const porRevisar = ideas.filter((p) => p.publicar && !p.aprobada).length;
    const areas = new Set(filas.map((p) => p.area));
    const datos: Array<[number, string]> = [
      [filas.length, 'Postulaciones'],
      [ideas.length, 'Con idea'],
      [filas.length - ideas.length, 'Para sumarse'],
      [porRevisar, 'Ideas por revisar'],
      [areas.size, 'Áreas distintas'],
    ];
    cifras.replaceChildren(
      ...datos.map(([n, nombre]) => {
        const caja = el('div', 'cifra');
        caja.append(el('dt', undefined, nombre), el('dd', undefined, String(n)));
        return caja;
      }),
    );

    if (filtroArea) {
      const actual = filtroArea.value;
      filtroArea.length = 1;
      for (const a of [...areas].sort((x, y) => x.localeCompare(y, 'es'))) filtroArea.add(new Option(a, a));
      filtroArea.value = areas.has(actual) ? actual : '';
    }

    cuerpo.replaceChildren();
    const visibles = filtradas();
    if (visibles.length === 0) {
      const td = cuerpo.insertRow().insertCell();
      td.colSpan = 8;
      td.textContent = 'No hay postulaciones con este filtro.';
      return;
    }
    for (const p of visibles) {
      const tr = cuerpo.insertRow();
      const fecha = p.created_at ? new Date(p.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—';

      const tipo = el('td');
      const pastilla = el('span', 'fila__tipo', p.tipo === 'idea' ? 'Idea' : 'Sumarse');
      pastilla.dataset.tipo = p.tipo;
      tipo.append(pastilla);

      const persona = el('td');
      persona.append(el('strong', undefined, p.nombre), el('span', 'fila__suave', p.correo));

      const principal =
        p.tipo === 'idea' ? `${p.idea ?? ''} — ${p.regla ?? ''}` : `${p.proyecto ? `→ ${p.proyecto} · ` : ''}${p.habilidades.join(', ')}`;
      const detalle =
        p.tipo === 'idea'
          ? [p.modelo, p.publico ? `paga: ${p.publico}` : null, p.faltan.length > 0 ? `faltan: ${p.faltan.join(', ')}` : null]
          : [p.horas !== null ? `${p.horas} h/sem` : null, p.portafolio, p.motivacion];

      tr.append(
        el('td', undefined, fecha),
        tipo,
        persona,
        el('td', undefined, `${p.area} · ${p.programa}`),
        el('td', undefined, principal),
        el('td', undefined, detalle.filter((x) => x !== null && x !== '').join(' · ') || '—'),
        celdaHelice(p),
        celdaBorrar(p),
      );
    }
  };

  const cargar = async (): Promise<void> => {
    if (!fuente) return;
    avisar(avisoPanel, 'Cargando…');
    try {
      filas = await fuente.listar();
      // Con las reglas del esquema, alguien que no está en «equipo» recibe una lista vacía en vez de un error.
      avisar(avisoPanel, filas.length === 0 ? 'No hay postulaciones todavía, o tu usuario aún no está inscrito en la tabla «equipo» de Supabase.' : '');
    } catch (error) {
      filas = [];
      avisar(avisoPanel, `No se pudieron cargar las postulaciones: ${error instanceof Error ? error.message : 'error desconocido'}`, true);
    }
    pintar();
  };

  const abrirPanel = (nueva: Fuente): void => {
    fuente = nueva;
    ver('panel');
    void cargar();
  };

  // Entrar
  const formEntrar = raiz.querySelector<HTMLFormElement>('[data-entrar]');
  const botonEntrar = raiz.querySelector<HTMLButtonElement>('[data-entrar-boton]');
  formEntrar?.addEventListener('submit', (e) => {
    e.preventDefault();
    const correo = formEntrar.querySelector<HTMLInputElement>('[name="correo"]');
    const clave = formEntrar.querySelector<HTMLInputElement>('[name="clave"]');
    if (!correo || !clave) return;
    if (correo.value.trim() === '' || clave.value === '') {
      avisar(avisoEntrar, 'Escribe tu correo y tu contraseña.', true);
      (correo.value.trim() === '' ? correo : clave).focus();
      return;
    }
    if (botonEntrar) botonEntrar.disabled = true;
    avisar(avisoEntrar, 'Entrando…');
    void supabase()
      .then(async (sb) => {
        if (!sb) throw new Error('sin conexión');
        const { error } = await sb.auth.signInWithPassword({ email: correo.value.trim(), password: clave.value });
        if (error) throw new Error(error.message);
        avisar(avisoEntrar, '');
        clave.value = '';
        abrirPanel(fuenteSupabase());
      })
      .catch(() => avisar(avisoEntrar, 'El correo o la contraseña no coinciden.', true))
      .finally(() => {
        if (botonEntrar) botonEntrar.disabled = false;
      });
  });

  salir.addEventListener('click', () => {
    const eraDemo = fuente?.demostracion === true;
    fuente = null;
    filas = [];
    if (eraDemo) {
      ver('sin-conexion');
      return;
    }
    void supabase()
      .then((sb) => sb?.auth.signOut())
      .finally(() => ver('entrar'));
  });

  raiz.querySelector<HTMLButtonElement>('[data-demo]')?.addEventListener('click', () => abrirPanel(fuenteDeEjemplo()));
  for (const f of [filtroTipo, filtroArea, filtroEstado]) f?.addEventListener('change', pintar);
  raiz.querySelector<HTMLButtonElement>('[data-recargar]')?.addEventListener('click', () => void cargar());

  raiz.querySelector<HTMLButtonElement>('[data-csv]')?.addEventListener('click', () => {
    const enlace = el('a');
    enlace.href = URL.createObjectURL(new Blob([aCSV(filtradas())], { type: 'text/csv;charset=utf-8' }));
    enlace.download = `postulaciones-algora-${new Date().toISOString().slice(0, 10)}.csv`;
    enlace.click();
    window.setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  });

  // Arranque: sin Supabase, aviso y demostración; con Supabase, la sesión guardada o la pantalla de entrada.
  if (!conectado) {
    ver('sin-conexion');
    return;
  }
  void supabase()
    .then(async (sb) => {
      if (!sb) return ver('sin-conexion');
      const { data } = await sb.auth.getSession();
      if (data.session) abrirPanel(fuenteSupabase());
      else ver('entrar');
    })
    .catch(() => ver('entrar'));
}
