// Lectura de los tokens de tokens.css desde TypeScript: los shaders y las escenas no llevan literales.

export function leerToken(nombre: string, desde: Element = document.documentElement): string {
  return getComputedStyle(desde).getPropertyValue(nombre).trim();
}

/** Número de un token: acepta «0.34», «13px» o «0.8em» (se queda con la parte numérica). */
export function leerNumero(nombre: string, respaldo: number, desde: Element = document.documentElement): number {
  const n = parseFloat(leerToken(nombre, desde));
  return Number.isFinite(n) ? n : respaldo;
}

/** Duración de un token en segundos: «600ms» → 0.6, «1s» → 1. */
export function leerSegundos(nombre: string, respaldo: number): number {
  const texto = leerToken(nombre);
  const n = parseFloat(texto);
  if (!Number.isFinite(n)) return respaldo;
  return texto.endsWith('ms') ? n / 1000 : n;
}

/** Color de un token como [r, g, b] en 0–1. Se dibuja en un canvas 2D para entender cualquier sintaxis CSS. */
export function leerColor(nombre: string): [number, number, number] {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!ctx) return [1, 1, 1];
  ctx.fillStyle = leerToken(nombre);
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}
