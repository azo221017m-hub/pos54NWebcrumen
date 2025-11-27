import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import './DashboardPage.css';

interface Usuario {
  id: number;
  nombre: string;
  alias: string;
  telefono?: string;
  idNegocio: number;
  idRol: number;
}

interface PedidoOnline {
  id: number;
  cliente: string;
  productos: string;
  total: number;
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado';
  hora: string;
}

const getUsuarioFromStorage = (): Usuario | null => {
  const usuarioData = localStorage.getItem('usuario');
  return usuarioData ? JSON.parse(usuarioData) : null;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [usuario] = useState<Usuario | null>(getUsuarioFromStorage());
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos (600 segundos)
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConfigSubmenu, setShowConfigSubmenu] = useState(false);
  const [showDashboardSubmenu, setShowDashboardSubmenu] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    // Verificar si hay usuario
    if (!usuario) {
      navigate('/login');
      return;
    }

    // Contador de sesión
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [usuario, navigate]);

  useEffect(() => {
    // Cuando la sesión expira, hacer logout automático
    if (sessionExpired) {
      const timeout = setTimeout(() => {
        handleLogout();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [sessionExpired, handleLogout]);

  if (!usuario) {
    return null;
  }

  // Pedidos online de ejemplo
  const pedidosOnline: PedidoOnline[] = [
    { id: 1, cliente: 'Juan Pérez', productos: '2x Hamburguesa, 1x Refresco', total: 150.00, estado: 'pendiente', hora: '10:30 AM' },
    { id: 2, cliente: 'María García', productos: '1x Pizza Grande, 2x Cerveza', total: 280.00, estado: 'preparando', hora: '10:25 AM' },
    { id: 3, cliente: 'Carlos López', productos: '3x Tacos, 1x Agua', total: 95.00, estado: 'listo', hora: '10:15 AM' },
  ];

  const getEstadoBadgeClass = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'badge-warning';
      case 'preparando': return 'badge-info';
      case 'listo': return 'badge-success';
      case 'entregado': return 'badge-default';
      default: return 'badge-default';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'preparando': return 'Preparando';
      case 'listo': return 'Listo';
      case 'entregado': return 'Entregado';
      default: return estado;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="business-logo">
            <svg viewBox="0 0 100 100" className="logo-icon">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
              <path d="M 30 50 L 45 35 L 70 60 L 45 65 Z" fill="currentColor"/>
              <circle cx="50" cy="50" r="8" fill="currentColor"/>
            </svg>
            <div className="logo-text">
              <h1>POS Crumen</h1>
              <p>Sistema de Punto de Venta</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className={`session-timer ${timeRemaining <= 60 ? 'warning' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{formatTime(timeRemaining)}</span>
          </div>

          <div className="user-menu-container">
            <button 
              className="user-icon-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="user-name">{usuario?.alias}</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="user-details">
                    <p className="user-full-name">{usuario?.nombre}</p>
                    <p className="user-alias">@{usuario?.alias}</p>
                    <p className="user-role">{usuario?.idRol === 1 ? 'Administrador' : 'Vendedor'}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="dashboard-navigation">
        {/* Menú Mi Tablero con Submenú */}
        <div className="nav-item-container">
          <button 
            className={`nav-item ${showDashboardSubmenu ? 'active' : ''}`}
            onClick={() => {
              setShowDashboardSubmenu(!showDashboardSubmenu);
              setShowConfigSubmenu(false); // Cerrar otros menús
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Mi Tablero
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ 
                width: '14px', 
                height: '14px', 
                marginLeft: 'auto',
                transform: showDashboardSubmenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showDashboardSubmenu && (
            <div className="submenu">
              <button 
                className="submenu-item"
                onClick={() => {
                  setIsScreenLocked(true);
                  setShowDashboardSubmenu(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Proteger Pantalla
              </button>
            </div>
          )}
        </div>

        {/* Menú Configuración con Submenú */}
        <div className="nav-item-container">
          <button 
            className={`nav-item ${showConfigSubmenu ? 'active' : ''}`}
            onClick={() => {
              setShowConfigSubmenu(!showConfigSubmenu);
              setShowDashboardSubmenu(false); // Cerrar otros menús
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6"/>
              <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
              <path d="M1 12h6m6 0h6"/>
              <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
            </svg>
            Configuración Sistema
            <svg 
              className={`chevron-submenu ${showConfigSubmenu ? 'rotate' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ width: '16px', height: '16px', marginLeft: 'auto' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Submenú */}
          {showConfigSubmenu && (
            <div className="submenu">
              <button className="submenu-item" onClick={() => navigate('/config-negocios')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Negocios
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-roles')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Rol de Usuarios
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-usuarios')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Usuarios
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-um-compra')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                Unidades de Medida
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-insumos')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 12h8" />
                  <path d="M8 16h8" />
                </svg>
                Insumos
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-clientes')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Clientes
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-cuentas-contables')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                  <line x1="9" y1="11" x2="15" y2="11"/>
                </svg>
                Cuentas Contables
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-moderadores')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Moderadores
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-subrecetas')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                SubRecetas
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-recetas')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                  <path d="M7 2v20"/>
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                </svg>
                Recetas
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-categorias')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2H2v10h10V2z"/>
                  <path d="M22 2h-10v10h10V2z"/>
                  <path d="M12 22H2V12h10v10z"/>
                  <path d="M22 22h-10V12h10v10z"/>
                </svg>
                Categorías
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-cat-moderadores')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Categoría Moderadores
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-mesas')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="8" width="18" height="12" rx="2"/>
                  <circle cx="8" cy="16" r="2"/>
                  <circle cx="16" cy="16" r="2"/>
                  <line x1="8" y1="8" x2="8" y2="4"/>
                  <line x1="16" y1="8" x2="16" y2="4"/>
                </svg>
                Mesas
              </button>
              <button className="submenu-item" onClick={() => navigate('/config-descuentos')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 9l6 6"/>
                  <path d="M9 15l6-6"/>
                </svg>
                Descuentos
              </button>
            </div>
          )}
        </div>

        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="15" rx="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          Productos
        </button>
        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Ventas
        </button>
        <button className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          Inventario
        </button>
      </nav>

      {/* Contenido Principal */}
      <div className="dashboard-main-content">
        <div className="content-left">
          {sessionExpired && (
            <div className="session-expired-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <h3>Sesión Expirada</h3>
                <p>Tu sesión ha finalizado. Serás redirigido al login...</p>
              </div>
            </div>
          )}

          <div className="welcome-section">
            <h2 className="welcome-title">¡Bienvenido, {usuario?.nombre}!</h2>
            <p className="welcome-subtitle">
              Panel de control del sistema POS Crumen
            </p>
          </div>

          <div className="cards-grid">
            <div className="dashboard-card">
              <div className="card-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="15" rx="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 className="card-title">Productos</h3>
              <p className="card-text">Catálogo activo</p>
              <div className="card-stat">0 productos</div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3 className="card-title">Ventas Hoy</h3>
              <p className="card-text">Total del día</p>
              <div className="card-stat">$0.00</div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3 className="card-title">Inventario</h3>
              <p className="card-text">Alertas de stock</p>
              <div className="card-stat">0 alertas</div>
            </div>
          </div>
        </div>

        {/* Tablero de Pedidos Online - Lado Derecho */}
        <aside className="pedidos-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              Pedidos Online
            </h2>
            <span className="badge badge-info">{pedidosOnline.length} activos</span>
          </div>

          <div className="pedidos-list">
            {pedidosOnline.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-info">
                    <h3 className="pedido-cliente">{pedido.cliente}</h3>
                    <p className="pedido-hora">{pedido.hora}</p>
                  </div>
                  <span className={`badge ${getEstadoBadgeClass(pedido.estado)}`}>
                    {getEstadoTexto(pedido.estado)}
                  </span>
                </div>
                <p className="pedido-productos">{pedido.productos}</p>
                <div className="pedido-footer">
                  <span className="pedido-total">${pedido.total.toFixed(2)}</span>
                  <button className="btn-small">Ver detalles</button>
                </div>
              </div>
            ))}
          </div>

          {pedidosOnline.length === 0 && (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>No hay pedidos online activos</p>
            </div>
          )}
        </aside>
      </div>

      {/* Componente de Bloqueo de Pantalla */}
      {isScreenLocked && (
        <div 
          className="screen-lock-overlay"
          onClick={() => setIsScreenLocked(false)}
        >
          <div className="screen-lock-content">
            <div className="lock-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 className="lock-title">POS Crumen</h2>
            <p className="lock-subtitle">Pantalla Protegida</p>
            <p className="lock-hint">Haz clic en cualquier lugar para desbloquear</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
