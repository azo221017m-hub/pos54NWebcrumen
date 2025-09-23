import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.', // o './frontend' según tu estructura
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT ?? '5173'),
    host: true,
  },
  preview: {
    port: parseInt(process.env.PORT ?? '5173'),
    host: true,
    allowedHosts: ['poswebcrumen.onrender.com'],
  }
});
