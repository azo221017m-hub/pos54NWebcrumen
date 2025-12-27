import { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { initSessionMonitoring } from './services/sessionService';
import './App.css';

function App() {
  useEffect(() => {
    // Inicializar monitoreo de sesión
    // Ahora checkTokenExpiration maneja correctamente cuando no hay token
    const cleanup = initSessionMonitoring(
      undefined, // Usar autoLogout por defecto
      (minutesRemaining) => {
        // Advertir al usuario cuando queden 5 minutos o menos
        if (minutesRemaining <= 5) {
          console.warn(`Tu sesión expirará en ${minutesRemaining} minuto(s)`);
        }
      }
    );

    // Cleanup al desmontar
    return cleanup;
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
