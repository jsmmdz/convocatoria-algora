const CLAVE = 'algora-tema';

type Tema = 'light' | 'dark';

function temaActual(): Tema {
  const forzado = document.documentElement.dataset.theme;
  if (forzado === 'light' || forzado === 'dark') return forzado;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function alternarTema(): void {
  const siguiente: Tema = temaActual() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = siguiente;
  try {
    localStorage.setItem(CLAVE, siguiente);
  } catch {
    // Sin almacenamiento el tema vale solo para esta visita.
  }
}

export function conectarBotonTema(): void {
  document.getElementById('tema')?.addEventListener('click', alternarTema);
}
