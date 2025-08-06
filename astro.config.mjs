// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  compressHTML: true,
  build: {
    // Prerender all pages at build time
    format: 'file',
  },
  vite: {
    build: {
      // Optimize for production
      minify: 'terser',
      // Chunk CSS files
      cssCodeSplit: true,
      // Reduce chunk size
      chunkSizeWarningLimit: 60,
      rollupOptions: {
        output: {
          // Optimize chunk size
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            utils: ['./src/utils/'],
          },
        },
      },
    },
    ssr: {
      // Avoid ssr external for better optimization
      noExternal: true,
    },
  },
  site: 'https://bestspavietnam.com', // Updated to new domain
  integrations: [
    tailwind(),
    sitemap({
      // Configuration options
      filter: (page) => !page.includes('/404'), // Exclude 404 page from sitemap
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 1000, // Set to a very low value to force creation of sitemap-index.xml
    }),
  ]
});
