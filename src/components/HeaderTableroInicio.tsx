// src/components/HeaderTableroInicio.tsx
// Header del tablero inicial con logo, bienvenida y menú de usuario

import { useState } from 'react';
import type { Usuario } from '../types';

// Props del componente HeaderTableroInicio
interface HeaderTableroInicioProps {
  user: Usuario;
  onLogout: () => void;
  onToggleProtection: () => void;
  showProtection: boolean;
}

// Componente Header del tablero inicial
const HeaderTableroInicio: React.FC<HeaderTableroInicioProps> = ({
  user,
  onLogout,
  onToggleProtection,
  showProtection
}) => {
  // Estado para controlar el dropdown del usuario
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  
  // Estado para controlar el modal de soporte
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Función para manejar logout
  const handleLogout = (): void => {
    console.log('🚪 Usuario cerrando sesión:', user.nombre || user.alias);
    onLogout();
    setShowUserMenu(false);
  };

  // Función para mostrar modal de soporte
  const handleSupportClick = (): void => {
    setShowSupportModal(true);
    setShowUserMenu(false);
    console.log('📞 Mostrando modal de soporte');
  };

  // Función para cerrar modal de soporte
  const closeSupportModal = (): void => {
    setShowSupportModal(false);
  };

  return (
    <header className="header-tablero-inicio">
      <div className="header-container">
        
        {/* Logo y botón de protección */}
        <div className="header-left">
          <button 
            className={`protection-btn ${showProtection ? 'active' : ''}`}
            onClick={onToggleProtection}
            title={showProtection ? 'Desactivar protección' : 'Activar protección de pantalla'}
          >
            {showProtection ? '🔒' : '☰'}
          </button>
          
          <div className="logo-container">
            <img 
              src="/logowebposcrumen.svg" 
              alt="POSWEBCrumen Logo" 
              className="header-logo"
            />
          </div>
        </div>

        {/* Texto de bienvenida central */}
        <div className="header-center">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Bienvenido, {user.nombre}
            </h1>
            <p className="business-subtitle">
              {user.idNegocio ? `Negocio ID: ${user.idNegocio}` : 'Mi Negocio'} - POSWEBCRUMEN
            </p>
          </div>
        </div>

        {/* Usuario y menú desplegable */}
        <div className="header-right">
          <div 
            className="user-menu-container"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">{user.nombre || user.alias}</span>
              <span className="dropdown-arrow">▼</span>
            </div>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-item user-details">
                  <span className="detail-label">Usuario:</span>
                  <span className="detail-value">{user.nombre || user.alias}</span>
                </div>
                <div className="dropdown-item user-details">
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value">{user.estatus === 1 ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item support-btn"
                  onClick={handleSupportClick}
                >
                  <span className="support-icon">📞</span>
                  Soporte
                </button>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <span className="logout-icon">🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal de Soporte */}
      {showSupportModal && (
        <div className="support-modal-overlay" onClick={closeSupportModal}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📞 Crumen Soporte 24/7</h3>
              <button 
                className="modal-close"
                onClick={closeSupportModal}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="support-info">
                <div className="support-item">
                  <span className="support-icon">📱</span>
                  <div className="support-details">
                    <h4>Soporte en sitio o remoto</h4>
                    <p className="phone-number">Contacto por llamada o whatsApp</p>
                    <p className="support-hours">Disponible 24 horas, 7 días</p>
                  </div>
                </div>
                <div className="support-item">
                  <span className="support-icon">⚡</span>
                  <div className="support-details">
                    <h4>Soporte Técnico</h4>
                    <p className="support-hours">Resolución inmediata de problemas</p>
                    <p className="support-hours">Asistencia con configuración</p>
                  </div>
                </div>
                <div className="support-item">
                  <span className="support-icon">🛠️</span>
                  <div className="support-details">
                    <h4>Mantenimiento</h4>
                    <p className="support-hours">Actualizaciones del sistema</p>
                    <p className="support-hours">Respaldo y seguridad</p>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-call"
                  onClick={() => window.open('tel:5527618631')}
                >
                  📞 Llamar Ahora
                </button>
                <button 
                  className="btn-whatsapp"
                  onClick={() => window.open('https://wa.me/525527618631')}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderTableroInicio;