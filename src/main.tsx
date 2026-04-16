import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Diagnóstico: confirmar que el JS se está ejecutando en el cliente
console.log('[APP_START] JS ejecutando — versión 2.5.B13', new Date().toISOString());

// Capturar errores globales de JavaScript (útil para debugging en móviles)
window.onerror = (message, source, lineno, colno, error) => {
  const msg = String(message);
  // Ignorar errores de extensiones del navegador
  if (
    msg.includes('message channel closed') ||
    msg.includes('listener indicated an asynchronous response') ||
    msg.includes('Extension context invalidated')
  ) {
    return true;
  }
  console.error('[APP_JS_ERROR]', { message, source, lineno, colno, error });
  return false;
};

// Suprimir errores de extensiones de navegador que no afectan la funcionalidad
window.addEventListener('error', (event) => {
  // Ignorar errores de extensiones del navegador (listener asíncronos)
  const message = event.message || '';
  if (
    message.includes('message channel closed') ||
    message.includes('listener indicated an asynchronous response') ||
    message.includes('Extension context invalidated')
  ) {
    event.preventDefault();
    return;
  }
  console.error('[APP_UNHANDLED_ERROR]', message);
});

// Capturar promesas rechazadas no manejadas
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason?.toString() || '';
  if (
    message.includes('message channel closed') ||
    message.includes('listener indicated an asynchronous response') ||
    message.includes('Extension context invalidated')
  ) {
    event.preventDefault();
    return;
  }
  console.error('[APP_UNHANDLED_REJECTION]', message);
});

// Evitar que los inputs de tipo número cambien su valor al hacer scroll con el mouse
document.addEventListener('wheel', (event) => {
  const target = event.target as Element;
  if (
    target instanceof HTMLInputElement &&
    target.type === 'number' &&
    document.activeElement === target
  ) {
    target.blur();
  }
}, { passive: true });

// Crear root y renderizar la aplicación
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar Service Worker con manejo de actualizaciones
// Se hace después del render para no bloquear la carga inicial
if (import.meta.env.PROD) {
  // Solo en producción: registrar SW con notificación opcional al usuario
  // NO se aplica la actualización automáticamente; se muestra un banner para que el usuario decida
  import('./services/swUpdateService').then(({ setupPromptUpdate }) => {
    setupPromptUpdate((workbox) => {
      // Disparar evento personalizado para que UpdateNotification muestre el banner
      window.dispatchEvent(new CustomEvent('swUpdateAvailable', { detail: { workbox } }));
    });
  });
}
