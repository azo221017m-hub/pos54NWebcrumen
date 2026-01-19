/**
 * Componente de Notificación de Actualización de PWA
 * Muestra un banner cuando hay una nueva versión disponible
 */

import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';
import { applyUpdate } from '../services/swUpdateService';
import '../styles/UpdateNotification.css';

const UpdateNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [pendingWorkbox, setPendingWorkbox] = useState<Workbox | null>(null);

  useEffect(() => {
    // Escuchar el evento personalizado de actualización disponible
    const handleUpdateAvailable = (event: Event) => {
      // Verificar que el evento es un CustomEvent con el detalle esperado
      if (event instanceof CustomEvent && event.detail?.workbox) {
        const workbox = event.detail.workbox;
        console.log('🔔 Mostrando notificación de actualización');
        setPendingWorkbox(workbox);
        setShowNotification(true);
      }
    };

    window.addEventListener('swUpdateAvailable', handleUpdateAvailable);

    return () => {
      window.removeEventListener('swUpdateAvailable', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    if (pendingWorkbox) {
      console.log('✅ Usuario aceptó actualización');
      applyUpdate(pendingWorkbox);
      setShowNotification(false);
    }
  };

  const handleDismiss = () => {
    console.log('⏭️ Usuario pospuso actualización');
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="update-notification" role="alert" aria-live="polite">
      <div className="update-notification-content">
        <div className="update-notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="update-notification-text">
          <strong>Nueva versión disponible</strong>
          <p>Hay una actualización disponible. Actualiza para obtener las últimas mejoras.</p>
        </div>
        <div className="update-notification-actions">
          <button 
            className="update-button update-button-primary" 
            onClick={handleUpdate}
            aria-label="Actualizar ahora"
          >
            Actualizar
          </button>
          <button 
            className="update-button update-button-secondary" 
            onClick={handleDismiss}
            aria-label="Cerrar notificación"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
