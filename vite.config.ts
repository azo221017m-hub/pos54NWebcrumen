import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // carpeta de salida del build
  },
  server: {
    port: parseInt(process.env.PORT ?? '5173'),
    host: true,
  },
  preview: {
    port: parseInt(process.env.PORT ?? '5173'),
    host: true,
    allowedHosts: ['poswebcrumen.onrender.com'],
  },
});
