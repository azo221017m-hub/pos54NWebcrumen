import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'logocrumenpos.svg', 'logowebposcrumen.svg'],
      manifest: {
        name: 'POS54N Web Crumen - Sistema POS y Comanda Digital',
        short_name: 'POS54N Crumen',
        description: 'Sistema de Punto de Venta (POS) profesional con comanda digital para restaurantes. Gestión de ventas, inventario, comandas digitales y control de mesas.',
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
        // Exclude API endpoints from caching to always fetch fresh data
        navigateFallbackDenylist: [/^\/api/],
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
      }
    }
  }
})
