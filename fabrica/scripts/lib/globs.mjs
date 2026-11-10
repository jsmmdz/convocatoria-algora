// Globs mínimos compartidos por las compuertas y los hooks: ** cruza carpetas, * no,
// y un "!" al inicio excluye. Sin dependencias, para que la fábrica se copie tal cual.

export function globARegex(glob, flags = '') {
  let r = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      r += glob[i + 2] === '/' ? '(?:.*/)?' : '.*';
      i += glob[i + 2] === '/' ? 2 : 1;
    } else if (c === '*') r += '[^/]*';
    else if (c === '?') r += '[^/]';
    else r += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${r}$`, flags);
}

export function coincide(ruta, globs = [], flags = '') {
  const incluye = globs.filter((g) => !g.startsWith('!'));
  const excluye = globs.filter((g) => g.startsWith('!')).map((g) => g.slice(1));
  return incluye.some((g) => globARegex(g, flags).test(ruta)) && !excluye.some((g) => globARegex(g, flags).test(ruta));
}

// Frontmatter mínimo: clave: valor, clave: [a, b] y listas con "  - x"
export function leerFrontmatter(texto) {
  const m = texto.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const limpiar = (s) => s.trim().replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '');
  const datos = {};
  let clave = null;
  for (const linea of m[1].split('\n')) {
    const item = linea.match(/^\s+-\s+(.*)$/);
    if (item && clave) {
      datos[clave].push(limpiar(item[1]));
      continue;
    }
    const par = linea.match(/^([\w-]+):\s*(.*)$/);
    if (!par) continue;
    clave = par[1];
    const valor = limpiar(par[2]);
    if (valor === '') datos[clave] = [];
    else if (valor.startsWith('[')) datos[clave] = valor.slice(1, -1).split(',').map(limpiar).filter(Boolean);
    else datos[clave] = valor;
  }
  return datos;
}
