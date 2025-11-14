// src/components/NavegadorConfig.tsx
// Navegador de configuraciones con acceso a todos los componentes config

import type { ScreenType } from '../types';
import React from 'react';

// Props del componente NavegadorConfig
interface NavegadorConfigProps {
  onNavigate: (screen: ScreenType) => void;
}

// Componente navegador de configuraciones
const NavegadorConfig: React.FC<NavegadorConfigProps> = ({ onNavigate }) => {

  // Función para manejar navegación
  const handleNavigate = (screen: ScreenType): void => {
    console.log('🧭 [NavegadorConfig] Navegando a configuración:', screen);
    console.log('🧭 [NavegadorConfig] Llamando onNavigate con:', screen);
    onNavigate(screen);
    console.log('🧭 [NavegadorConfig] onNavigate ejecutado');
  };

  return (
    <nav className="navegador-config">
      
      {/* Título del navegador */}
      <header className="navegador-header">
        <h2>⚙️ CONFIGURACIÓN de MI NEGOCIO</h2>
      </header>

      {/* Sección CONFIGURACIÓN de MI NEGOCIO */}
      <div className="config-section">
                
        <div className="config-grid">
          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-mesas' as ScreenType)}
          >
            <span className="btn-icon">🪑</span>
            <span className="btn-text">Mesas</span>
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
            onClick={() => handleNavigate('config-descuentos' as ScreenType)}
          >
            <span className="btn-icon">💰</span>
            <span className="btn-text">Descuentos</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-roles' as ScreenType)}
          >
            <span className="btn-icon">👤</span>
            <span className="btn-text">Rol de Usuario</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-usuarios' as ScreenType)}
          >
            <span className="btn-icon">👥</span>
            <span className="btn-text">Usuarios</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-umedida' as ScreenType)}
          >
            <span className="btn-icon">📏</span>
            <span className="btn-text">Unidades de Medida</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-insumos' as ScreenType)}
          >
            <span className="btn-icon">📦</span>
            <span className="btn-text">Insumos</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-cuenta-contable' as ScreenType)}
          >
            <span className="btn-icon">💰</span>
            <span className="btn-text">Cuenta Contable</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-proveedores' as ScreenType)}
          >
            <span className="btn-icon">🏪</span>
            <span className="btn-text">Proveedores</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-clientes' as ScreenType)}
          >
            <span className="btn-icon">👥</span>
            <span className="btn-text">Clientes</span>
          </button>

          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-productos' as ScreenType)}
          >
            <span className="btn-icon">🛒</span>
            <span className="btn-text">Productos</span>
          </button>
          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-negocios' as ScreenType)}
          >
            <span className="btn-icon">🏢</span>
            <span className="btn-text">Negocios</span>
          </button>
          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-moderadores' as ScreenType)}
          >
            <span className="btn-icon">🛡️</span>
            <span className="btn-text">Moderadores</span>
          </button>
          <button 
            className="config-btn"
            onClick={() => handleNavigate('config-categoria-moderadores' as ScreenType)}
          >
            <span className="btn-icon">📂</span>
            <span className="btn-text">Categorías Moderadores</span>
          </button>

        </div>
      </div>

    </nav>
  );
};

export default NavegadorConfig;