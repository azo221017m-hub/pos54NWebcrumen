import { useEffect, useState } from 'react';
import AppRouter from './router/AppRouter';
import { initSessionMonitoring, getLogoutMessage } from './services/sessionService';
import './App.css';

function App() {
  // Inicializar el mensaje de logout directamente desde sessionStorage
  const [logoutMessage, setLogoutMessage] = useState<string | null>(() => {
    const message = getLogoutMessage();
    return message;
  });

  useEffect(() => {
    // Auto-limpiar el mensaje después de 5 segundos
    if (logoutMessage) {
      const timeout = setTimeout(() => setLogoutMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [logoutMessage]);

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
      {logoutMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 9999,
          maxWidth: '400px',
          border: '1px solid #f5c6cb',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <strong>Sesión Finalizada:</strong> {logoutMessage}
        </div>
      )}
      <AppRouter />
    </>
  );
}

export default App;
