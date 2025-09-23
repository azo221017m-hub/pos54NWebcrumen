import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    port: parseInt(process.env.PORT) || 4173, // puerto para vite preview
    host: true                                // permite acceso externo
  }
});
