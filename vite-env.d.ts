/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly FRONTEND_URL: string
  // agrega aquí cualquier otra variable VITE_...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


