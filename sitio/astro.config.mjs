import { defineConfig } from 'astro/config';

// El despliegue fija SITIO_URL y SITIO_BASE (GitHub Pages sirve bajo /<repo>/).
export default defineConfig({
  site: process.env.SITIO_URL,
  base: process.env.SITIO_BASE ?? '/',
  devToolbar: { enabled: false },
});
