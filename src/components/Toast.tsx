// src/components/Toast.tsx
// Componente de toast mejorado para notificaciones con animaciones

import React, { useEffect, useState } from 'react';
import '../styles/ToastNew.css';

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
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Activar animación de entrada
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Auto-ocultar después del tiempo especificado
    let hideTimer: number;
    if (autoHide) {
      hideTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [duration, autoHide]);

  const handleClose = () => {
    setIsLeaving(true);
    // Esperar que termine la animación antes de cerrar
    setTimeout(() => {
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

  return (
    <div 
      className={`toast toast-${type} ${isVisible ? 'toast-show' : ''} ${isLeaving ? 'toast-hide' : ''}`}
      role="alert"
      aria-live="polite"
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
  );
};

export default Toast;