import { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { initSessionMonitoring, setupSessionClearOnReload } from './services/sessionService';
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

    // Cleanup al desmontar
    return () => {
      cleanup();
      cleanupReload();
    };
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
