// src/components/Toast.tsx
// Componente para mostrar mensajes toast con estilos verde y rojo

import { useEffect } from 'react';
import '../styles/Toast.css';

// Interfaz para las props del Toast
interface ToastProps {
  message: string; // Mensaje a mostrar
  type: 'success' | 'error' | 'info'; // Tipo de mensaje
  isVisible: boolean; // Si está visible
  onClose: () => void; // Función para cerrar
  duration?: number; // Duración en milisegundos (opcional)
}

// Componente Toast
const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 4000 
}) => {
  // Efecto para auto-cerrar el toast
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Si no está visible, no renderiza nada
  if (!isVisible) return null;

  // Determina el icono según el tipo
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;