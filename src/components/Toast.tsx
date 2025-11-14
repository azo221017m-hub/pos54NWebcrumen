// src/components/Toast.tsx
// Componente de toast mejorado para notificaciones con animaciones

import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // Duración en milisegundos (por defecto 2000)
  onClose: () => void;
  autoHide?: boolean; // Auto-ocultar (por defecto true)
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 2000, 
  onClose,
  autoHide = true 
}) => {
  console.log('🍞 [Toast] ===== TOAST CREADO =====');
  console.log('🍞 [Toast] Message:', message);
  console.log('🍞 [Toast] Type:', type);
  console.log('🍞 [Toast] Duration:', duration);
  console.log('🍞 [Toast] AutoHide:', autoHide);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    console.log('🎬 [Toast] useEffect ejecutado - iniciando timers');
    
    // Activar animación de entrada
    const showTimer = setTimeout(() => {
      console.log('👀 [Toast] Haciendo visible el toast - setIsVisible(true)');
      setIsVisible(true);
    }, 10);

    // Auto-ocultar después del tiempo especificado
    let hideTimer: number;
    if (autoHide) {
      console.log(`⏰ [Toast] Configurando auto-hide en ${duration}ms`);
      hideTimer = setTimeout(() => {
        console.log('⏰ [Toast] Tiempo agotado - llamando handleClose');
        handleClose();
      }, duration);
    }

    return () => {
      console.log('🧹 [Toast] Cleanup - limpiando timers');
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [duration, autoHide]);

  const handleClose = () => {
    console.log('❌ [Toast] Cerrando toast');
    setIsLeaving(true);
    // Esperar que termine la animación antes de cerrar
    setTimeout(() => {
      console.log('🚪 [Toast] Toast cerrado completamente');
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
      default:
        return '#2196f3';
    }
  };

  const toastClasses = `toast toast-${type} ${isVisible && !isLeaving ? 'toast-visible' : ''}`;
  console.log('🎨 [Toast] Clases aplicadas:', toastClasses, { isVisible, isLeaving });

  return (
    <div className="toast-container">
      <div 
        className={toastClasses}
        role="alert"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          backgroundColor: type === 'error' ? '#ff4444' : '#44ff44',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div className="toast-content">
          <span className="toast-icon">
            {getIcon()}
          </span>
          <span className="toast-message">{message}</span>
          <button 
            className="toast-close" 
            onClick={handleClose}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
        
        {/* Barra de progreso */}
        {autoHide && (
          <div 
            className="toast-progress"
            style={{
              backgroundColor: getProgressColor(),
              animationDuration: `${duration}ms`,
              animationPlayState: isLeaving ? 'paused' : 'running'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Toast;