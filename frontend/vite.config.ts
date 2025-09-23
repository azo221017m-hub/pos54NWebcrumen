import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    // Opcional, solo si quieres probar la build localmente con `vite preview`
    port: 4173,
    host: true, // permite acceder desde cualquier IP
    open: true, // abre el navegador automáticamente
    allowedHosts: ['poswebcrumen.onrender.com'] // tu dominio de Render
  }
});
