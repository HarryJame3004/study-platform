import { defineConfig } from 'astro/config';

export default defineConfig({
  // SITE_URL takes precedence over the URL supplied by Netlify at build time.
  site: process.env.SITE_URL || process.env.URL || 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'always',
});
