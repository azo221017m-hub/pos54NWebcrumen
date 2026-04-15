import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null, // No inyectar automáticamente, lo haremos manualmente
      includeAssets: ['vite.svg', 'logoposcrumen.svg', 'logowebposcrumen.svg'],
      manifest: {
        name: 'CRUMENCDT -Comunidad Digital Texcoco | Pedidos en Texcoco | Conectándo Negocios y Clientes',
        short_name: 'CRUMENCDT',
        description: 'CRUMENCDT - Comunidad Digital Texcoco. Pedidos en Texcoco, conectando negocios y clientes de la región.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'logoposcrumen.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'logowebposcrumen.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/agradecimientocdt.png'], // Exclude large image (2.49 MB) from precache; served on demand
        // Exclude API endpoints from caching to always fetch fresh data
        navigateFallbackDenylist: [/^\/api/],
        clientsClaim: true, // Tomar control de las páginas abiertas después de activarse
        // Limpiar caches antiguos automáticamente
        cleanupOutdatedCaches: true,
        // ID de versión para forzar invalidación de cache en cada deploy
        cacheId: 'crumencdt-v3',
        runtimeCaching: [
          {
            // Network-first strategy for API calls - always try to fetch from network first
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                // maxEntries: 0 is intentional - we want NO caching of API responses
                // Even with NetworkFirst, we don't want stale API data as fallback
                // This ensures fresh user data after logout/login
                maxEntries: 0,
                maxAgeSeconds: 0
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    // Target browsers that cover all modern mobile devices (Chrome 80+, Safari 13+, Firefox 72+)
    target: ['es2019', 'chrome80', 'safari13', 'firefox72', 'edge80'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
