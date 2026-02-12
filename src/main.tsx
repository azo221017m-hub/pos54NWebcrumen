import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import { setupPromptUpdate } from './services/swUpdateService'

// Configuración de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 segundos
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

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
});

// Suprimir warnings de Promise rejection de extensiones
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
});

// Crear root y renderizar la aplicación
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Herramientas de desarrollo solo en modo desarrollo */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)

// Registrar Service Worker con manejo de actualizaciones
// Se hace después del render para no bloquear la carga inicial
if (import.meta.env.PROD) {
  // Solo en producción
  setupPromptUpdate((workbox) => {
    // Este callback se ejecutará cuando haya una actualización disponible
    // La notificación se manejará en el componente UpdateNotification
    console.log('📦 Nueva versión detectada, esperando acción del usuario');
    
    // Disparar evento personalizado para que el componente lo capture
    const event = new CustomEvent('swUpdateAvailable', { detail: { workbox } });
    window.dispatchEvent(event);
  });
}
