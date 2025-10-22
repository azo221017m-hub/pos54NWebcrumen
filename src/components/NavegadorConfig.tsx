// src/components/NavegadorConfig.tsx
// Navegador de configuraciones con acceso a todos los componentes config

import type { ScreenType } from '../types';

// Props del componente NavegadorConfig
interface NavegadorConfigProps {
  onNavigate: (screen: ScreenType) => void;
}

// Componente navegador de configuraciones
const NavegadorConfig: React.FC<NavegadorConfigProps> = ({ onNavigate }) => {

  // Función para manejar navegación
  const handleNavigate = (screen: ScreenType): void => {
    console.log('🧭 Navegando a configuración:', screen);
    onNavigate(screen);
  };

  return (
    <nav className="navegador-config">
      
      {/* Título del navegador */}
      <header className="navegador-header">
        <h2>⚡ ACCIONES RAPIDAS</h2>
      </header>

      {/* Sección MI NEGOCIO */}
      <div className="config-section">
        <h3 className="section-title">
          <span className="section-icon">🏢</span>
          MI NEGOCIO
        </h3>
        
        <div className="config-grid">
          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-usuarios' as ScreenType)}
          >
            <span className="btn-icon">👥</span>
            <span className="btn-text">Usuarios</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-roles' as ScreenType)}
          >
            <span className="btn-icon">🎭</span>
            <span className="btn-text">Roles</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-clientes' as ScreenType)}
          >
            <span className="btn-icon">👤</span>
            <span className="btn-text">Clientes</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-negocios' as ScreenType)}
          >
            <span className="btn-icon">🏪</span>
            <span className="btn-text">Negocios</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-mesas' as ScreenType)}
          >
            <span className="btn-icon">🪑</span>
            <span className="btn-text">Mesas</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-productos' as ScreenType)}
          >
            <span className="btn-icon">📦</span>
            <span className="btn-text">Productos</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-categorias' as ScreenType)}
          >
            <span className="btn-icon">📁</span>
            <span className="btn-text">Categorías</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-insumos' as ScreenType)}
          >
            <span className="btn-icon">🥘</span>
            <span className="btn-text">Insumos</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-recetas' as ScreenType)}
          >
            <span className="btn-icon">📝</span>
            <span className="btn-text">Recetas</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-sub-recetas' as ScreenType)}
          >
            <span className="btn-icon">📋</span>
            <span className="btn-text">Sub-recetas</span>
          </button>
        </div>
      </div>

    </nav>
  );
};

export default NavegadorConfig;