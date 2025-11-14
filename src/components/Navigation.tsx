// src/components/Navigation.tsx
// Componente de navegación lateral con menú dropdown

import type { Usuario, ScreenType } from '../types'; // Importa tipos
import '../styles/Navigation.css'; // Importa estilos específicos

// Interfaz para las props del componente
interface NavigationProps {
  user: Usuario; // Usuario autenticado
  onNavigate: (screen: ScreenType) => void; // Función de navegación
  onLogout: () => void; // Función de logout
  showMobile: boolean; // Mostrar en móvil
  onToggleMobile: () => void; // Toggle del menú móvil
}

// Componente de navegación
const Navigation: React.FC<NavigationProps> = ({ 
  user, 
  onNavigate, 
  onLogout, 
  showMobile, 
  onToggleMobile 
}) => {

  // Función para manejar navegación y cerrar menú móvil
  const handleNavigate = (screen: ScreenType): void => {
    console.log('🧭 Navegando a:', screen); // Log de navegación
    onNavigate(screen); // Navega a la pantalla
    if (showMobile) {
      onToggleMobile(); // Cierra el menú móvil
    }
  };

  // Función para manejar logout
  const handleLogout = (): void => {
    console.log('🚪 Cerrando sesión desde navegación'); // Log de logout
    onLogout(); // Ejecuta logout
  };

  return (
    <nav className={`navigation ${showMobile ? 'mobile-open' : ''}`}>
      
      {/* Header de la navegación */}
      <div className="nav-header">
        <div className="nav-logo">
          <span className="nav-logo-icon">🏪</span>
          <span className="nav-logo-text">POSCrumen</span>
        </div>
        {showMobile && (
          <button className="nav-close" onClick={onToggleMobile}>
            ✕
          </button>
        )}
      </div>

      {/* Información del usuario */}
      <div className="nav-user">
        <div className="nav-user-avatar">👤</div>
        <div className="nav-user-info">
          <div className="nav-user-name">{user.nombre}</div>
          <div className="nav-user-role">Usuario</div>
        </div>
      </div>

      {/* Menú principal */}
      <div className="nav-menu">
        
        {/* Sección CONFIGURAR */}
        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-section-icon">⚙️</span>
            CONFIGURAR
          </div>
          <ul className="nav-items">
            <li>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('config-usuarios')}
              >
                <span className="nav-item-icon">👥</span>
                Usuarios
              </button>
            </li>
            <li>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('config-negocios')}
              >
                <span className="nav-item-icon">🏢</span>
                Negocios
              </button>
            </li>
            <li>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('config-categorias')}
              >
                <span className="nav-item-icon">📂</span>
                Categorías
              </button>
            </li>
            <li>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('config-insumos')}
              >
                <span className="nav-item-icon">📦</span>
                Insumos
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">🍽️</span>
                Productos
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">📝</span>
                Recetas
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">👤</span>
                Perfil
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">🧾</span>
                Recibos
              </button>
            </li>
          </ul>
        </div>

        {/* Sección VENTAS */}
        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-section-icon">💰</span>
            VENTAS
          </div>
          <ul className="nav-items">
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">🛒</span>
                Iniciar Venta
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">📊</span>
                Indicadores
              </button>
            </li>
          </ul>
        </div>

        {/* Sección SISTEMA */}
        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-section-icon">🔧</span>
            SISTEMA
          </div>
          <ul className="nav-items">
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">⚙️</span>
                Configuración
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">📋</span>
                Reportes
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-item-icon">🔄</span>
                Respaldos
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer con botón de logout */}
      <div className="nav-footer">
        <button className="nav-logout" onClick={handleLogout}>
          <span className="nav-item-icon">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navigation;