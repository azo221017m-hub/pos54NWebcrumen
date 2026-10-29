import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // ──────────────────────────────────────────────────────────────────────
    // PWA DESACTIVADA (reparación emergente). El sistema opera 100% en línea.
    //
    // El plugin NO se elimina: se deja en modo `selfDestroying`, que genera un
    // Service Worker cuyo único trabajo es desregistrarse y borrar todas las
    // caches. Eso es imprescindible para los dispositivos que YA tienen la PWA
    // instalada: su navegador seguirá pidiendo /sw.js y, al recibir este SW
    // autodestructivo, soltará el precache. Si simplemente quitáramos el
    // plugin, /sw.js devolvería 404 y esos equipos podrían seguir sirviendo
    // indefinidamente el bundle viejo desde su cache.
    //
    // `manifest: false` evita que la app vuelva a ser instalable.
    //
    // Una vez que el parque de dispositivos esté limpio, este plugin puede
    // retirarse por completo. Ver REPARACION_EMERGENTE_SIN_PWA.md.
    // ──────────────────────────────────────────────────────────────────────
    VitePWA({
      selfDestroying: true,
      injectRegister: null,
      manifest: false
    })
  ],
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
