import { useEffect, useState } from 'react';
import { X, Clock, User, Building2, Shield } from 'lucide-react';
import { getToken, decodeToken, getTimeUntilExpiration, formatTimeRemaining } from '../../services/sessionService';
import './SessionInfoModal.css';

interface SessionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  alias: string;
  idNegocio: number;
}

export const SessionInfoModal = ({ isOpen, onClose, alias, idNegocio }: SessionInfoModalProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [expirationDate, setExpirationDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const token = getToken();
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp) {
          // Calcular tiempo restante
          const remaining = getTimeUntilExpiration(token);
          setTimeRemaining(remaining);
          
          // Formatear fecha de expiración
          const expDate = new Date(decoded.exp * 1000);
          setExpirationDate(expDate.toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'medium'
          }));

          // Actualizar cada segundo
          const interval = setInterval(() => {
            const currentToken = getToken();
            if (currentToken) {
              const newRemaining = getTimeUntilExpiration(currentToken);
              setTimeRemaining(newRemaining);
              
              if (newRemaining <= 0) {
                clearInterval(interval);
              }
            }
          }, 1000);

          return () => clearInterval(interval);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="session-modal-overlay" onClick={onClose}>
      <div className="session-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="session-modal-header">
          <div className="session-modal-title">
            <Shield className="session-icon" size={24} />
            <h2>Información de Sesión</h2>
          </div>
          <button className="session-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="session-modal-body">
          <div className="session-info-card">
            <div className="session-info-item">
              <User className="info-icon" size={20} />
              <div className="info-content">
                <span className="info-label">Usuario (Alias)</span>
                <span className="info-value">{alias}</span>
              </div>
            </div>

            <div className="session-info-item">
              <Building2 className="info-icon" size={20} />
              <div className="info-content">
                <span className="info-label">ID Negocio</span>
                <span className="info-value">{idNegocio}</span>
              </div>
            </div>

            <div className="session-info-item highlight">
              <Clock className="info-icon" size={20} />
              <div className="info-content">
                <span className="info-label">Tiempo de Sesión Restante</span>
                <span className="info-value time-value">
                  {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Sesión expirada'}
                </span>
              </div>
            </div>

            <div className="session-info-item">
              <Clock className="info-icon" size={20} />
              <div className="info-content">
                <span className="info-label">Expira el</span>
                <span className="info-value">{expirationDate}</span>
              </div>
            </div>
          </div>

          <div className="session-warning">
            <p>
              <strong>Nota:</strong> Tu sesión tiene una duración de 10 minutos por seguridad.
              Después de ese tiempo, deberás iniciar sesión nuevamente.
            </p>
          </div>
        </div>

        <div className="session-modal-footer">
          <button className="session-modal-btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
