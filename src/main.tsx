import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suprimir errores de extensiones de navegador que no afectan la funcionalidad
window.addEventListener('error', (event) => {
  // Ignorar errores de extensiones del navegador (listener asíncronos)
  if (event.message?.includes('message channel closed')) {
    event.preventDefault();
    return;
  }
});

// Suprimir warnings de Promise rejection de extensiones
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed')) {
    event.preventDefault();
    return;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
