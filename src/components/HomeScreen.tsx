// src/components/HomeScreen.tsx
// Pantalla principal con dashboard y navegación

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, Indicator, ScreenType } from '../types'; // Importa tipos
import '../styles/HomeScreen.css'; // Importa estilos específicos

// Componente de navegación mejorado con menú dropdown
interface NavigationProps {
  user: Usuario;
  onNavigate: (screen: ScreenType) => void;
   showMobile: boolean;
  onToggleMobile: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, showMobile, onToggleMobile }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Función para manejar dropdown
  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Función para manejar navegación y cerrar dropdown
  const handleNavigate = (screen: ScreenType) => {
    onNavigate(screen);
    setOpenDropdown(null);
  };

  return (
    <nav className={`navigation ${showMobile ? 'mobile-open' : ''}`}>
      {/* Header de navegación */}
      <div className="nav-header">
        <div className="nav-brand">
          <span className="brand-icon">🏪</span>
          <span className="brand-text">POSWEBCrumen</span>
        </div>
        <button className="mobile-toggle" onClick={onToggleMobile}>
          ☰
        </button>
      </div>

      {/* Menú principal */}
      <div className="nav-menu">
        
        {/* CONFIGURAR */}
        <div className="nav-section">
          <button 
            className={`nav-section-btn ${openDropdown === 'config' ? 'active' : ''}`}
            onClick={() => toggleDropdown('config')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">CONFIGURAR</span>
            <span className="nav-arrow">{openDropdown === 'config' ? '▼' : '▶'}</span>
          </button>
          
          {openDropdown === 'config' && (
            <div className="nav-dropdown">
              <button onClick={() => handleNavigate('config-usuarios' as ScreenType)}>
                <span className="dropdown-icon">👥</span>
                Usuarios
              </button>
              <button onClick={() => handleNavigate('config-roles' as ScreenType)}>
                <span className="dropdown-icon">🎭</span>
                Roles
              </button>
              <button onClick={() => handleNavigate('config-clientes' as ScreenType)}>
                <span className="dropdown-icon">👤</span>
                Clientes
              </button>
              <button onClick={() => handleNavigate('config-categorias' as ScreenType)}>
                <span className="dropdown-icon">🏷️</span>
                Categorías
              </button>
              <button onClick={() => handleNavigate('config-insumos' as ScreenType)}>
                <span className="dropdown-icon">🧪</span>
                Insumos
              </button>
              <button onClick={() => handleNavigate('formulario-negocio' as ScreenType)}>
                <span className="dropdown-icon">🏢</span>
                Registro Negocio
              </button>
              <button onClick={() => handleNavigate('config-productos' as ScreenType)}>
                <span className="dropdown-icon">📦</span>
                Productos
              </button>
              <button onClick={() => handleNavigate('config-recetas' as ScreenType)}>
                <span className="dropdown-icon">📋</span>
                Recetas
              </button>
              <button onClick={() => handleNavigate('config-perfil' as ScreenType)}>
                <span className="dropdown-icon">👤</span>
                Perfil
              </button>
              <button onClick={() => handleNavigate('config-recibos' as ScreenType)}>
                <span className="dropdown-icon">🧾</span>
                Recibos
              </button>
            </div>
          )}
        </div>

        {/* VENTAS */}
        <div className="nav-section">
          <button 
            className={`nav-section-btn ${openDropdown === 'ventas' ? 'active' : ''}`}
            onClick={() => toggleDropdown('ventas')}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">VENTAS</span>
            <span className="nav-arrow">{openDropdown === 'ventas' ? '▼' : '▶'}</span>
          </button>
          
          {openDropdown === 'ventas' && (
            <div className="nav-dropdown">
              <button onClick={() => handleNavigate('iniciar-venta' as ScreenType)}>
                <span className="dropdown-icon">🛒</span>
                Iniciar Venta
              </button>
              <button onClick={() => handleNavigate('indicadores-ventas' as ScreenType)}>
                <span className="dropdown-icon">📊</span>
                Indicadores
              </button>
            </div>
          )}
        </div>

        {/* SISTEMA */}
        <div className="nav-section">
          <button 
            className={`nav-section-btn ${openDropdown === 'sistema' ? 'active' : ''}`}
            onClick={() => toggleDropdown('sistema')}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">SISTEMA</span>
            <span className="nav-arrow">{openDropdown === 'sistema' ? '▼' : '▶'}</span>
          </button>
          
          {openDropdown === 'sistema' && (
            <div className="nav-dropdown">
              <button onClick={() => handleNavigate('config-negocios' as ScreenType)}>
                <span className="dropdown-icon">🏢</span>
                Negocios
              </button>
              <button onClick={() => handleNavigate('sistema-configuracion' as ScreenType)}>
                <span className="dropdown-icon">🔧</span>
                Configuración
              </button>
            </div>
          )}
        </div>
      </div>

     
    </nav>
  );
};

// Interfaz para las props del componente
interface HomeScreenProps {
  user: Usuario; // Usuario autenticado
  onNavigate: (screen: ScreenType) => void; // Función de navegación
  onLogout: () => void; // Función de logout
}

// Componente de pantalla principal
const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate }) => {
  // Estado para los indicadores del dashboard
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  // Estado para mostrar/ocultar el menú móvil
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  // Efecto para cargar los indicadores al montar el componente
  useEffect(() => {
    console.log('🏠 Cargando pantalla principal para:', user.nombre); // Log de carga
    loadIndicators(); // Carga los indicadores
  }, [user]);

  // Función para cargar indicadores de ejemplo
  const loadIndicators = (): void => {
    console.log('📊 Cargando indicadores del dashboard'); // Log de carga
    
    // Datos de ejemplo para los indicadores
    const exampleIndicators: Indicator[] = [
      {
        id: 'ventas',
        title: 'Ventas del Día',
        value: '$15,420.50',
        description: 'Total de ventas registradas hoy',
        icon: '💰',
        color: '#10b981' // Verde
      },
      {
        id: 'servicios',
        title: 'Servicios',
        value: '24',
        description: 'Servicios completados hoy',
        icon: '🛠️',
        color: '#3b82f6' // Azul
      },
      {
        id: 'compras_vs_ventas',
        title: 'Compras vs Ventas',
        value: '68%',
        description: 'Margen de ganancia actual',
        icon: '📈',
        color: '#8b5cf6' // Morado
      },
      {
        id: 'top_productos',
        title: 'Top Productos',
        value: 'Ver Lista',
        description: 'Los 5 productos más vendidos',
        icon: '🏆',
        color: '#f59e0b' // Amarillo
      }
    ];

    setIndicators(exampleIndicators); // Establece los indicadores
    console.log('✅ Indicadores cargados exitosamente'); // Log de éxito
  };

  // Función para manejar clicks en los indicadores
  const handleIndicatorClick = (indicatorId: string): void => {
    console.log('📊 Click en indicador:', indicatorId); // Log de click
    
    // Aquí se puede agregar lógica específica para cada indicador
    switch (indicatorId) {
      case 'ventas':
        console.log('💰 Mostrando detalles de ventas'); // Log específico
        break;
      case 'servicios':
        console.log('🛠️ Mostrando servicios'); // Log específico
        break;
      case 'top_productos':
        console.log('🏆 Mostrando top productos'); // Log específico
        break;
      default:
        console.log('📊 Indicador genérico'); // Log genérico
    }
  };

  return (
    <div className="home-screen">
      {/* Navegación lateral */}
      <Navigation 
        user={user}
        onNavigate={onNavigate}
        showMobile={showMobileMenu}
        onToggleMobile={() => setShowMobileMenu(!showMobileMenu)}
      />

      {/* Contenido principal */}
      <main className="main-content">
        
        {/* Header del dashboard */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="mobile-menu-toggle"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                ☰
              </button>
              <div className="welcome-text">
                <h1>Bienvenido, {user.nombre}</h1>
                <p>Panel de control - POSWEBCrumen</p>
              </div>
            </div>
            <div className="header-right">
              <div className="user-info">
                <span className="user-avatar">👤</span>
                <span className="user-name">{user.usuario}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Grid de indicadores mejorado */}
        <section className="indicators-section">
          <div className="main-indicators-grid">
            
            {/* Indicadores dinámicos agrupados */}
            <div className="dynamic-indicators">
              {indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="indicator-card dynamic-card"
                  onClick={() => handleIndicatorClick(ind.id)}
                >
                  <div className="card-header">
                    <div className="card-icon" style={{ color: ind.color }}>{ind.icon}</div>
                    <div className="card-title">
                      <h3>{ind.title}</h3>
                      <span className="card-subtitle">{ind.description}</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="main-value">{ind.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tarjeta 1: Ventas del Día */}
            <div className="indicator-card main-card ventas-card">
              <div className="card-header">
                <div className="card-icon">💰</div>
                <div className="card-title">
                  <h3>Ventas del Día</h3>
                  <span className="card-subtitle">Ingresos actuales</span>
                </div>
              </div>
              <div className="card-content">
                <div className="main-value">$25,480.00</div>
                <div className="secondary-info">
                  <span className="trend positive">+15.2% ↗️</span>
                  <span className="comparison">vs ayer</span>
                </div>
                <div className="mini-stats">
                  <div className="mini-stat">
                    <span className="mini-label">Transacciones:</span>
                    <span className="mini-value">47</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-label">Promedio:</span>
                    <span className="mini-value">$541.70</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Servicios Activos */}
            <div className="indicator-card main-card servicios-card">
              <div className="card-header">
                <div className="card-icon">🔧</div>
                <div className="card-title">
                  <h3>Servicios</h3>
                  <span className="card-subtitle">Estado actual</span>
                </div>
              </div>
              <div className="card-content">
                <div className="main-value">12</div>
                <div className="secondary-info">
                  <span className="trend neutral">= Sin cambios</span>
                  <span className="comparison">vs ayer</span>
                </div>
                <div className="mini-stats">
                  <div className="mini-stat">
                    <span className="mini-label">Completados:</span>
                    <span className="mini-value">8</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-label">Pendientes:</span>
                    <span className="mini-value">4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Compras vs Ventas Netas */}
            <div className="indicator-card main-card finanzas-card">
              <div className="card-header">
                <div className="card-icon">📊</div>
                <div className="card-title">
                  <h3>Compras + Gastos vs Ventas</h3>
                  <span className="card-subtitle">Balance mensual</span>
                </div>
              </div>
              <div className="card-content">
                <div className="balance-info">
                  <div className="balance-item">
                    <span className="balance-label">Ventas:</span>
                    <span className="balance-value positive">$125,480</span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Gastos:</span>
                    <span className="balance-value negative">$68,250</span>
                  </div>
                  <div className="balance-item main">
                    <span className="balance-label">Utilidad:</span>
                    <span className="balance-value profit">$57,230</span>
                  </div>
                </div>
                <div className="secondary-info">
                  <span className="trend positive">+8.5% ↗️</span>
                  <span className="comparison">vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Top 5 Productos */}
            <div className="indicator-card main-card productos-card">
              <div className="card-header">
                <div className="card-icon">🏆</div>
                <div className="card-title">
                  <h3>Top 5 Productos</h3>
                  <span className="card-subtitle">Más vendidos</span>
                </div>
              </div>
              <div className="card-content">
                <div className="top-list">
                  <div className="top-item">
                    <span className="rank">1.</span>
                    <span className="item-name">Combo Especial</span>
                    <span className="item-value">$2,450</span>
                  </div>
                  <div className="top-item">
                    <span className="rank">2.</span>
                    <span className="item-name">Hamburguesa Premium</span>
                    <span className="item-value">$1,890</span>
                  </div>
                  <div className="top-item">
                    <span className="rank">3.</span>
                    <span className="item-name">Pizza Familiar</span>
                    <span className="item-value">$1,650</span>
                  </div>
                  <div className="top-item">
                    <span className="rank">4.</span>
                    <span className="item-name">Bebidas Premium</span>
                    <span className="item-value">$980</span>
                  </div>
                  <div className="top-item">
                    <span className="rank">5.</span>
                    <span className="item-name">Postre del Chef</span>
                    <span className="item-value">$750</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Sección de acciones rápidas */}
        <section className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <button 
              className="action-button"
              onClick={() => onNavigate('config-usuarios' as ScreenType)}
            >
              <span className="action-icon">👥</span>
              <span>Gestionar Usuarios</span>
            </button>
            <button 
              className="action-button"
              onClick={() => onNavigate('config-negocios' as ScreenType)}
            >
              <span className="action-icon">🏢</span>
              <span>Gestionar Negocios</span>
            </button>
            <button 
              className="action-button"
              onClick={() => onNavigate('config-roles' as ScreenType)}
            >
              <span className="action-icon">🎭</span>
              <span>Gestionar Roles</span>
            </button>
            <button 
              className="action-button"
              onClick={() => onNavigate('config-clientes' as ScreenType)}
            >
              <span className="action-icon">�</span>
              <span>Gestionar Clientes</span>
            </button>
          </div>
        </section>

      </main>

      {/* Overlay para menú móvil */}
      {showMobileMenu && (
        <div 
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default HomeScreen;