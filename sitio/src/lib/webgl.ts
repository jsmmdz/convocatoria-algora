// Comprueba que haya WebGL antes de crear un renderer: sin WebGL no se crea nada y no hay errores (docs/2-TECNICO § 2).
let disponible: boolean | null = null;

export function hayWebGL(): boolean {
  if (disponible !== null) return disponible;
  try {
    const prueba = document.createElement('canvas');
    const gl = prueba.getContext('webgl2') ?? prueba.getContext('webgl');
    disponible = gl !== null;
    // Se devuelve el contexto de prueba a la GPU: el navegador limita los contextos vivos.
    // Si el navegador ya lo perdió, no se suelta otra vez: Chrome avisa en consola (auditoría de T03, E7).
    if (gl && !gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    disponible = false;
  }
  return disponible;
}
