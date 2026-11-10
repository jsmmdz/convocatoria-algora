import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// Las rutas se leen del build, no se escriben a mano: si una tarea agrega una página,
// las pruebas comunes la cubren sin que nadie las toque.
export function rutasDelBuild(dist = join(process.cwd(), 'dist')): string[] {
  if (!existsSync(dist)) throw new Error('No hay dist/: corre `npm run build` antes de las pruebas.');
  const rutas: string[] = [];
  const recorrer = (dir: string) => {
    for (const nombre of readdirSync(dir)) {
      const ruta = join(dir, nombre);
      if (statSync(ruta).isDirectory()) recorrer(ruta);
      else if (nombre === 'index.html') {
        const rel = relative(dist, dir).split(sep).join('/');
        rutas.push(rel ? `/${rel}/` : '/');
      }
    }
  };
  recorrer(dist);
  return rutas.sort();
}
