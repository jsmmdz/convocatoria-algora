// Formulario de postulación: dos caminos (idea / sumarse), validación, trampa para bots y envío a Supabase
// (o aviso de modo demostración). Recibe `algora:sumarse` desde la hélice y `algora:reclamar` desde
// cualquier sección que lleve una regla al formulario (docs/2-TECNICO § 2).
import { lenis } from './movimiento';
import { enviarPostulacion, ErrorDeEnvio, type Postulacion, type Tipo } from './datos';

type Tono = 'neutro' | 'bien' | 'mal';
type Campo = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ENLACE = /^https?:\/\//i;

export function iniciarPostulacion(): void {
  const seccion = document.querySelector<HTMLElement>('[data-postulacion]');
  const form = seccion?.querySelector<HTMLFormElement>('[data-formulario]');
  const estado = form?.querySelector<HTMLElement>('[data-estado]');
  const enviar = form?.querySelector<HTMLButtonElement>('[data-enviar]');
  if (!seccion || !form || !estado || !enviar) return;

  const campo = (nombre: string): Campo | null => form.querySelector<Campo>(`[name="${nombre}"]:not([type="checkbox"]):not([type="radio"])`);
  const valor = (nombre: string): string => campo(nombre)?.value.trim() ?? '';
  const casilla = (nombre: string): HTMLInputElement | null => form.querySelector<HTMLInputElement>(`input[type="checkbox"][name="${nombre}"]`);
  const marcados = (nombre: string): string[] =>
    Array.from(form.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${nombre}"]:checked`)).map((i) => i.value);

  const tipoActual = (): Tipo => (form.querySelector<HTMLInputElement>('input[name="tipo"]:checked')?.value === 'equipo' ? 'equipo' : 'idea');

  const ponerTipo = (tipo: Tipo): void => {
    const radio = form.querySelector<HTMLInputElement>(`input[name="tipo"][value="${tipo}"]`);
    if (radio) radio.checked = true;
    for (const bloque of form.querySelectorAll<HTMLElement>('[data-bloque]')) bloque.hidden = bloque.dataset.bloque !== tipo;
  };

  const mostrar = (mensaje: string, tono: Tono): void => {
    estado.hidden = false;
    estado.dataset.tono = tono;
    estado.textContent = mensaje;
  };

  // El campo con el problema queda descrito por el mensaje de estado (además de su ayuda, si la tiene).
  const describir = (el: Element, poner: boolean): void => {
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id !== '' && id !== estado.id);
    if (poner) ids.push(estado.id);
    if (ids.length > 0) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  const limpiarErrores = (): void => {
    for (const el of form.querySelectorAll('[aria-invalid]')) {
      el.removeAttribute('aria-invalid');
      describir(el, false);
    }
  };

  const leer = (): Postulacion => {
    const horas = Number(valor('horas'));
    return {
      tipo: tipoActual(),
      nombre: valor('nombre'),
      correo: valor('correo'),
      area: valor('area'),
      programa: valor('programa'),
      idea: valor('idea'),
      regla: valor('regla'),
      modelo: valor('modelo'),
      publico: valor('publico'),
      faltan: marcados('faltan'),
      publicar: casilla('publicar')?.checked ?? false,
      proyecto: valor('proyecto'),
      habilidades: marcados('habilidades'),
      horas: valor('horas') === '' || !Number.isFinite(horas) ? null : horas,
      portafolio: valor('portafolio'),
      motivacion: valor('motivacion'),
    };
  };

  /** Devuelve el mensaje y el campo del primer problema, o null si todo está bien. */
  const validar = (d: Postulacion): { mensaje: string; donde: HTMLElement | null } | null => {
    const obligatorios: Array<[string, string]> = [
      ['nombre', d.nombre],
      ['correo', d.correo],
      ['area', d.area],
      ['programa', d.programa],
    ];
    const falta = obligatorios.find(([, v]) => v === '');
    if (falta) return { mensaje: 'Completa nombre, correo, facultad y programa.', donde: campo(falta[0]) };
    if (d.nombre.length < 2) return { mensaje: 'Escribe tu nombre completo.', donde: campo('nombre') };
    if (!CORREO.test(d.correo)) return { mensaje: 'Revisa el correo: debe tener la forma usuario@dominio.', donde: campo('correo') };
    if (d.tipo === 'idea' && d.idea === '') return { mensaje: 'Ponle nombre a tu idea.', donde: campo('idea') };
    if (d.tipo === 'idea' && d.regla === '') return { mensaje: 'Escribe la regla de tu idea en una frase.', donde: campo('regla') };
    if (d.tipo === 'equipo' && d.habilidades.length === 0) {
      return { mensaje: 'Marca al menos una habilidad.', donde: form.querySelector<HTMLInputElement>('input[name="habilidades"]') };
    }
    if (d.tipo === 'equipo' && d.horas !== null && (!Number.isInteger(d.horas) || d.horas < 1 || d.horas > 40)) {
      return { mensaje: 'Las horas por semana van de 1 a 40.', donde: campo('horas') };
    }
    if (d.tipo === 'equipo' && d.portafolio !== '' && !ENLACE.test(d.portafolio)) {
      return { mensaje: 'El enlace del portafolio debe empezar por https://', donde: campo('portafolio') };
    }
    if (!(casilla('consentimiento')?.checked ?? false)) {
      return { mensaje: 'Necesitamos tu autorización de tratamiento de datos para recibir la postulación.', donde: casilla('consentimiento') };
    }
    return null;
  };

  form.addEventListener('change', (e) => {
    if (e.target instanceof HTMLInputElement && e.target.name === 'tipo') ponerTipo(tipoActual());
  });
  form.addEventListener('input', (e) => {
    if (e.target instanceof Element && e.target.hasAttribute('aria-invalid')) {
      e.target.removeAttribute('aria-invalid');
      describir(e.target, false);
    }
  });

  let enviando = false;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (enviando) return;
    limpiarErrores();
    const d = leer();
    const problema = validar(d);
    if (problema) {
      if (problema.donde) {
        problema.donde.setAttribute('aria-invalid', 'true');
        describir(problema.donde, true);
        problema.donde.focus();
      }
      mostrar(problema.mensaje, 'mal');
      return;
    }
    const exito = '¡Postulación recibida! Te escribiremos al correo que dejaste.';
    // Trampa: un bot llenó el campo oculto. Se le responde como si hubiera funcionado y no se guarda nada.
    if (valor('sitio') !== '') {
      mostrar(exito, 'bien');
      return;
    }

    enviando = true;
    enviar.disabled = true;
    mostrar('Enviando…', 'neutro');
    enviarPostulacion(d)
      .then(() => {
        const extra = d.tipo === 'idea' && d.publicar ? ' Tu idea aparecerá en la hélice cuando el equipo la revise.' : '';
        mostrar(exito + extra, 'bien');
        form.reset();
        ponerTipo(d.tipo);
      })
      .catch((error: unknown) => {
        if (error instanceof ErrorDeEnvio) mostrar(error.message, error.demostracion ? 'neutro' : 'mal');
        else mostrar('No pudimos guardar tu postulación. Inténtalo de nuevo en un momento.', 'mal');
      })
      .finally(() => {
        enviando = false;
        enviar.disabled = false;
      });
  });

  /** Baja al formulario sin animar (hay secciones fijas en el camino) y deja el foco en un campo. */
  const irAlFormulario = (foco: string): void => {
    if (lenis) lenis.scrollTo(seccion, { immediate: true, force: true });
    else seccion.scrollIntoView();
    requestAnimationFrame(() => campo(foco)?.focus({ preventScroll: true }));
  };

  // Desde la hélice: sumarse a un proyecto, con las habilidades que le faltan ya marcadas.
  document.addEventListener('algora:sumarse', (e) => {
    if (!(e instanceof CustomEvent)) return;
    const detalle: unknown = e.detail;
    const idea = typeof detalle === 'object' && detalle !== null && 'idea' in detalle && typeof detalle.idea === 'string' ? detalle.idea : '';
    const faltan = typeof detalle === 'object' && detalle !== null && 'faltan' in detalle && Array.isArray(detalle.faltan) ? detalle.faltan : [];
    ponerTipo('equipo');
    const proyecto = campo('proyecto');
    if (proyecto) proyecto.value = idea;
    for (const habilidad of form.querySelectorAll<HTMLInputElement>('input[name="habilidades"]')) {
      habilidad.checked = faltan.includes(habilidad.value);
    }
    limpiarErrores();
    estado.hidden = true;
    irAlFormulario('nombre');
  });

  // Desde una sección que lleve una regla escrita al formulario.
  document.addEventListener('algora:reclamar', (e) => {
    if (!(e instanceof CustomEvent)) return;
    const detalle: unknown = e.detail;
    const regla = typeof detalle === 'object' && detalle !== null && 'regla' in detalle && typeof detalle.regla === 'string' ? detalle.regla.trim() : '';
    ponerTipo('idea');
    const campoRegla = campo('regla');
    if (campoRegla && regla !== '') campoRegla.value = regla;
    irAlFormulario('idea');
  });

  ponerTipo(tipoActual());
}
