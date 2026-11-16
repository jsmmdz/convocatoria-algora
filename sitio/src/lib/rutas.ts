// Todo enlace interno pasa por BASE_URL: en GitHub Pages el sitio vive bajo /<repo>/.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const inicio = `${base}/`;
export const equipo = `${base}/equipo/`;
