import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Genera `dist/404.html` como copia exacta de `index.html`.
 *
 * POR QUÉ: este SPA usa BrowserRouter, así que rutas como /login o /clientes
 * sólo existen en el cliente. El hosting (Render) devuelve "Not Found" para
 * cualquier ruta que no exista en disco, de modo que entrar directo a /login,
 * recargar en /clientes o abrir un enlace guardado daba 404.
 *
 * Render sirve /404.html del directorio publicado cuando la ruta no existe;
 * al ser una copia del shell del SPA, React Router resuelve la ruta en el
 * cliente y la aplicación carga con normalidad.
 *
 * Esto NO sustituye la regla de rewrite del hosting, que además devuelve 200
 * en lugar de 404 (ver REPARACION_EMERGENTE_SIN_PWA.md); es el arreglo que
 * funciona sin depender de la configuración del panel de Render.
 */
function spaFallback404(): Plugin {
  let directorioSalida = 'dist'

  return {
    name: 'spa-fallback-404',
    apply: 'build',
    configResolved(config) {
      directorioSalida = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const indice = resolve(directorioSalida, 'index.html')
      const respaldo = resolve(directorioSalida, '404.html')

      if (!existsSync(indice)) {
        this.warn('no se encontró index.html; no se generó 404.html')
        return
      }

      copyFileSync(indice, respaldo)
      console.log('\n[spa-fallback-404] 404.html generado (fallback de rutas del SPA)')
    }
  }
}

export default defineConfig({
  // NOTA: la PWA fue retirada (reparación emergente, ver
  // REPARACION_EMERGENTE_SIN_PWA.md). El Service Worker autodestructivo que
  // desmonta las instalaciones previas ya NO lo genera vite-plugin-pwa: es un
  // archivo estático en `public/sw.js`, para que se sirva igual en desarrollo
  // y en producción.
  plugins: [react(), spaFallback404()],
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
