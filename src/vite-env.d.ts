/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_APP_NAME: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declaración del evento personalizado de actualización de Service Worker
interface WindowEventMap {
  swUpdateAvailable: CustomEvent<{ workbox: import('workbox-window').Workbox }>;
}

/**
 * Versión de la APLICACIÓN, inyectada por Vite desde package.json.
 * No confundir con la versión del CATÁLOGO (`catalogVersion`), que vive en
 * IndexedDB y se sincroniza con MySQL de forma independiente.
 */
declare const __APP_VERSION__: string;
