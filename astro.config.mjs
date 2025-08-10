// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

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
          // Improve code splitting
          entryFileNames: 'assets/js/[name].[hash].js',
          chunkFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name].[hash][extname]';
            
            let extType = assetInfo.name.split('.').at(1) || '';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) {
              extType = 'img';
            } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
              extType = 'fonts';
            }
            return `assets/${extType}/[name].[hash][extname]`;
          },
        },
      },
      // Terser options for better minification
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
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
    compress({
      CSS: true,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true,
      // Disable JSON compression to preserve data files
      JSON: false,
      Logger: 1
    }),
  ]
});
