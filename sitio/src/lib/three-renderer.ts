// El renderer de Three va en su propio módulo: así el build lo parte del resto de Three en dos trozos diferidos
// y ninguno pasa de 500 kB (el aviso del build). Solo lo importa capas3d.ts, con import() dinámico.
export { WebGLRenderer } from 'three';
