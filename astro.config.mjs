// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server', // SSR habilitado para API routes y páginas dinámicas

  adapter: vercel({
    webAnalytics: {
      enabled: false // Cambiar a true si quieres usar Vercel Analytics
    }
  }),

  vite: {
    plugins: [tailwindcss()]
  },

  image: {
    // Optimización de imágenes con Sharp
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});