import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // <- Muy importante: asegura que las rutas desde public funcionen
});
