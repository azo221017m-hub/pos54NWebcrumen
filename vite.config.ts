import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

// Versión de la APLICACIÓN (distinta de la versión del CATÁLOGO).
// La app se actualiza vía Service Worker (banner de UpdateNotification);
// el catálogo se actualiza vía IndexedDB + /api/catalogo/sync. Son dos ciclos
// de vida independientes y no deben confundirse.
const { version: appVersion } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
) as { version: string }

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
        // Servir el app shell desde el precache cuando no hay red: sin esto la PWA
        // no arranca offline y el catálogo local de IndexedDB no serviría de nada.
        navigateFallback: 'index.html',
        // NO activar automáticamente: esperar a que el usuario confirme la actualización
        skipWaiting: false,
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
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  build: {
    // Target browsers that cover all modern mobile devices (Chrome 80+, Safari 13+, Firefox 72+)
    target: ['es2019', 'chrome80', 'safari13', 'firefox72', 'edge80'],
  },
  server: {
    host: true,
    // Necesario para exponer el dev server vía túnel (Cloudflare/ngrok):
    // Vite rechaza por defecto peticiones con un Host header que no reconoce.
    allowedHosts: true,
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
  },
  preview: {
    host: true,
    allowedHosts: true,
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
