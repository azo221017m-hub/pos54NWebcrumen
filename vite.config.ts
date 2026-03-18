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
      includeAssets: ['vite.svg', 'logocrumenpos.svg', 'logowebposcrumen.svg'],
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
            src: 'logocrumenpos.svg',
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
        // Configuración de auto-actualización
        skipWaiting: false, // No activar inmediatamente, esperar la señal del frontend
        clientsClaim: true, // Tomar control de las páginas abiertas después de activarse
        // Limpiar caches antiguos automáticamente
        cleanupOutdatedCaches: true,
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
