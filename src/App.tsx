import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './router/AppRouter';
import UpdateNotification from './components/UpdateNotification';
import FeedbackToast from './components/FeedbackToast';
import CatalogoStatus from './components/catalogo/CatalogoStatus';
import { initSessionMonitoring, setupSessionClearOnReload } from './services/sessionService';
import { setupActivityTracking } from './services/activityRefreshService';
import { queryClient } from './config/queryClient';
import './App.css';

function App() {
  useEffect(() => {
    // Inicializar monitoreo de sesión
    // Ahora checkTokenExpiration maneja correctamente cuando no hay token
    const cleanup = initSessionMonitoring(
      undefined, // Usar autoLogout por defecto
      (minutesRemaining) => {
        // Advertir al usuario cuando queden 2 minutos o menos
        if (minutesRemaining <= 2) {
          console.warn(`⚠️ Tu sesión expirará en ${minutesRemaining} minuto(s)`);
        }
      }
    );

    // Configurar limpieza de sesión al recargar la página
    const cleanupReload = setupSessionClearOnReload();

    // Configurar rastreo de actividad para renovación de token
    const cleanupActivity = setupActivityTracking();

    // Cleanup al desmontar
    return () => {
      cleanup();
      cleanupReload();
      cleanupActivity();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <UpdateNotification />
      {/* Sincroniza el catálogo local (IndexedDB) y muestra ONLINE/OFFLINE/SINCRONIZANDO.
          Se monta aquí una sola vez para que aplique a pantallas web y móviles. */}
      <CatalogoStatus />
      <FeedbackToast />
    </QueryClientProvider>
  );
}

export default App;
