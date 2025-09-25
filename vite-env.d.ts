/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // aquí agregas más variables si las usas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
