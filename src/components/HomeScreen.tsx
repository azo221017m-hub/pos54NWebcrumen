// src/components/HomeScreen.tsx
// Pantalla principal con dashboard y navegación

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, ScreenType, Pedido } from '../types'; // Importa tipos
import '../styles/HomeScreenNew.css'; // Importa estilos específicos

// Componente de navegación derecha con botones directos
interface RightNavigationProps {
  onNavigate: (screen: ScreenType) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RightNavigation: React.FC<RightNavigationProps> = ({ onNavigate }) => {
  // Función para manejar navegación
  const handleNavigate = (screen: ScreenType) => {
    console.log('🎯 Navegando a:', screen); // Log de navegación
    onNavigate(screen);
  };

  return (
    <div className="right-navigation">
      <h2>🧭 Navegación</h2>
      <div className="nav-sections">
        
        {/* SECCIÓN CONFIGURAR */}
        <div className="nav-section-group">
          <div className="nav-section-title">
            <span>⚙️</span>
            CONFIGURAR
          </div>
          <div className="nav-buttons-grid">
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-usuarios' as ScreenType)}
            >
              <span className="nav-button-icon">👥</span>
              <span className="nav-button-text">Usuarios</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-roles' as ScreenType)}
            >
              <span className="nav-button-icon">🎭</span>
              <span className="nav-button-text">Roles</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-clientes' as ScreenType)}
            >
              <span className="nav-button-icon">👤</span>
              <span className="nav-button-text">Clientes</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-categorias' as ScreenType)}
            >
              <span className="nav-button-icon">🏷️</span>
              <span className="nav-button-text">Categorías</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-insumos' as ScreenType)}
            >
              <span className="nav-button-icon">🧪</span>
              <span className="nav-button-text">Insumos</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('formulario-negocio' as ScreenType)}
            >
              <span className="nav-button-icon">🏢</span>
              <span className="nav-button-text">Registro Negocio</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-productos' as ScreenType)}
            >
              <span className="nav-button-icon">📦</span>
              <span className="nav-button-text">Productos</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-recetas' as ScreenType)}
            >
              <span className="nav-button-icon">📋</span>
              <span className="nav-button-text">Recetas</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-sub-recetas' as ScreenType)}
            >
              <span className="nav-button-icon">🍴</span>
              <span className="nav-button-text">Sub-Recetas</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-mesas' as ScreenType)}
            >
              <span className="nav-button-icon">🍽️</span>
              <span className="nav-button-text">Mesas</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-perfil' as ScreenType)}
            >
              <span className="nav-button-icon">👤</span>
              <span className="nav-button-text">Perfil</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN VENTAS */}
        <div className="nav-section-group">
          <div className="nav-section-title">
            <span>💰</span>
            VENTAS
          </div>
          <div className="nav-buttons-grid">
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('iniciar-venta' as ScreenType)}
            >
              <span className="nav-button-icon">🛒</span>
              <span className="nav-button-text">Iniciar Venta</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('indicadores-ventas' as ScreenType)}
            >
              <span className="nav-button-icon">📊</span>
              <span className="nav-button-text">Indicadores</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN SISTEMA */}
        <div className="nav-section-group">
          <div className="nav-section-title">
            <span>🔧</span>
            SISTEMA
          </div>
          <div className="nav-buttons-grid">
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('config-negocios' as ScreenType)}
            >
              <span className="nav-button-icon">🏢</span>
              <span className="nav-button-text">Negocios</span>
            </button>
            <button 
              className="nav-direct-button"
              onClick={() => handleNavigate('sistema-configuracion' as ScreenType)}
            >
              <span className="nav-button-icon">🔧</span>
              <span className="nav-button-text">Configuración</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Componente de pedidos online con 15 registros simulados
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OnlineOrdersComponent: React.FC = () => {
  // Datos simulados de 15 pedidos online tipo comanda
  const mockOnlineOrders: Pedido[] = [
    {
      idPedido: 'ONL001',
      numeroComanda: 'WEB-001',
      cliente: 'Sofia Ramírez',
      productos: [
        { nombre: 'Pizza Hawaiana', cantidad: 1, precio: 185.00, subtotal: 185.00 },
        { nombre: 'Refresco 600ml', cantidad: 2, precio: 28.00, subtotal: 56.00 }
      ],
      total: 241.00,
      formaPago: 'TARJETA',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '14:30',
      observaciones: 'Sin piña'
    },
    {
      idPedido: 'ONL002',
      numeroComanda: 'WEB-002',
      cliente: 'Diego Morales',
      productos: [
        { nombre: 'Hamburguesa BBQ', cantidad: 2, precio: 145.00, subtotal: 290.00 },
        { nombre: 'Papas Fritas', cantidad: 2, precio: 45.00, subtotal: 90.00 },
        { nombre: 'Cerveza', cantidad: 1, precio: 40.00, subtotal: 40.00 }
      ],
      total: 420.00,
      formaPago: 'TRANSFERENCIA',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '14:45',
      observaciones: 'Extra queso'
    },
    {
      idPedido: 'ONL003',
      numeroComanda: 'WEB-003',
      cliente: 'Carmen Jiménez',
      productos: [
        { nombre: 'Ensalada Griega', cantidad: 1, precio: 95.00, subtotal: 95.00 },
        { nombre: 'Pan de Ajo', cantidad: 1, precio: 35.00, subtotal: 35.00 }
      ],
      total: 130.00,
      formaPago: 'EFECTIVO',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '15:00',
      observaciones: 'Dressing aparte'
    },
    {
      idPedido: 'ONL004',
      numeroComanda: 'WEB-004',
      cliente: 'Ricardo Vega',
      productos: [
        { nombre: 'Tacos de Carnitas', cantidad: 4, precio: 28.00, subtotal: 112.00 },
        { nombre: 'Guacamole', cantidad: 1, precio: 55.00, subtotal: 55.00 },
        { nombre: 'Agua de Jamaica', cantidad: 1, precio: 25.00, subtotal: 25.00 }
      ],
      total: 192.00,
      formaPago: 'MIXTO',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '15:15',
      observaciones: 'Extra salsa verde'
    },
    {
      idPedido: 'ONL005',
      numeroComanda: 'WEB-005',
      cliente: 'Isabella Torres',
      productos: [
        { nombre: 'Pasta Carbonara', cantidad: 1, precio: 165.00, subtotal: 165.00 },
        { nombre: 'Copa de Vino Blanco', cantidad: 1, precio: 85.00, subtotal: 85.00 }
      ],
      total: 250.00,
      formaPago: 'TARJETA',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '15:30',
      observaciones: 'Sin tocino'
    },
    {
      idPedido: 'ONL006',
      numeroComanda: 'WEB-006',
      cliente: 'Alejandro Ruiz',
      productos: [
        { nombre: 'Sushi Variado', cantidad: 1, precio: 285.00, subtotal: 285.00 },
        { nombre: 'Té Verde', cantidad: 2, precio: 30.00, subtotal: 60.00 }
      ],
      total: 345.00,
      formaPago: 'TRANSFERENCIA',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '15:45',
      observaciones: 'Sin wasabi'
    },
    {
      idPedido: 'ONL007',
      numeroComanda: 'WEB-007',
      cliente: 'Valentina Castro',
      productos: [
        { nombre: 'Pollo Teriyaki', cantidad: 1, precio: 155.00, subtotal: 155.00 },
        { nombre: 'Arroz Frito', cantidad: 1, precio: 45.00, subtotal: 45.00 },
        { nombre: 'Limonada', cantidad: 1, precio: 28.00, subtotal: 28.00 }
      ],
      total: 228.00,
      formaPago: 'EFECTIVO',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '16:00',
      observaciones: 'Pollo bien cocido'
    },
    {
      idPedido: 'ONL008',
      numeroComanda: 'WEB-008',
      cliente: 'Sebastián López',
      productos: [
        { nombre: 'Ceviche Mixto', cantidad: 1, precio: 195.00, subtotal: 195.00 },
        { nombre: 'Tostadas', cantidad: 1, precio: 25.00, subtotal: 25.00 }
      ],
      total: 220.00,
      formaPago: 'TARJETA',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '16:15',
      observaciones: 'Picante bajo'
    },
    {
      idPedido: 'ONL009',
      numeroComanda: 'WEB-009',
      cliente: 'Camila Herrera',
      productos: [
        { nombre: 'Wrap Vegano', cantidad: 2, precio: 95.00, subtotal: 190.00 },
        { nombre: 'Smoothie Verde', cantidad: 2, precio: 55.00, subtotal: 110.00 }
      ],
      total: 300.00,
      formaPago: 'TRANSFERENCIA',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '16:30',
      observaciones: 'Sin miel'
    },
    {
      idPedido: 'ONL010',
      numeroComanda: 'WEB-010',
      cliente: 'Andrés Mendoza',
      productos: [
        { nombre: 'Parrillada Mixta', cantidad: 1, precio: 385.00, subtotal: 385.00 },
        { nombre: 'Tortillas', cantidad: 1, precio: 15.00, subtotal: 15.00 },
        { nombre: 'Cerveza 355ml', cantidad: 3, precio: 35.00, subtotal: 105.00 }
      ],
      total: 505.00,
      formaPago: 'MIXTO',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '16:45',
      observaciones: 'Término medio'
    },
    {
      idPedido: 'ONL011',
      numeroComanda: 'WEB-011',
      cliente: 'Fernanda Silva',
      productos: [
        { nombre: 'Crepes Dulces', cantidad: 1, precio: 85.00, subtotal: 85.00 },
        { nombre: 'Café Capuchino', cantidad: 1, precio: 45.00, subtotal: 45.00 }
      ],
      total: 130.00,
      formaPago: 'EFECTIVO',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '17:00',
      observaciones: 'Extra nutella'
    },
    {
      idPedido: 'ONL012',
      numeroComanda: 'WEB-012',
      cliente: 'Gabriel Ortiz',
      productos: [
        { nombre: 'Sandwich Club', cantidad: 1, precio: 115.00, subtotal: 115.00 },
        { nombre: 'Papas Gajo', cantidad: 1, precio: 55.00, subtotal: 55.00 },
        { nombre: 'Malteada Vainilla', cantidad: 1, precio: 65.00, subtotal: 65.00 }
      ],
      total: 235.00,
      formaPago: 'TARJETA',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '17:15',
      observaciones: 'Pan tostado'
    },
    {
      idPedido: 'ONL013',
      numeroComanda: 'WEB-013',
      cliente: 'Natalia Vargas',
      productos: [
        { nombre: 'Ramen Picante', cantidad: 1, precio: 135.00, subtotal: 135.00 },
        { nombre: 'Gyoza', cantidad: 6, precio: 15.00, subtotal: 90.00 }
      ],
      total: 225.00,
      formaPago: 'TRANSFERENCIA',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '17:30',
      observaciones: 'Extra picante'
    },
    {
      idPedido: 'ONL014',
      numeroComanda: 'WEB-014',
      cliente: 'Emilio Guerrero',
      productos: [
        { nombre: 'Fish & Chips', cantidad: 1, precio: 175.00, subtotal: 175.00 },
        { nombre: 'Cerveza Artesanal', cantidad: 1, precio: 65.00, subtotal: 65.00 }
      ],
      total: 240.00,
      formaPago: 'EFECTIVO',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '17:45',
      observaciones: 'Bien dorado'
    },
    {
      idPedido: 'ONL015',
      numeroComanda: 'WEB-015',
      cliente: 'Adriana Flores',
      productos: [
        { nombre: 'Lasaña Casera', cantidad: 1, precio: 165.00, subtotal: 165.00 },
        { nombre: 'Ensalada Verde', cantidad: 1, precio: 55.00, subtotal: 55.00 },
        { nombre: 'Agua Mineral', cantidad: 2, precio: 22.00, subtotal: 44.00 }
      ],
      total: 264.00,
      formaPago: 'MIXTO',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '18:00',
      observaciones: 'Queso extra'
    }
  ];

  // Función para manejar click en pedido online
  const handleOnlineOrderClick = (pedido: Pedido): void => {
    console.log('🌐 Click en pedido online:', pedido.numeroComanda); // Log de click
    // Aquí se puede agregar lógica para mostrar detalles del pedido online
  };

  // Función para obtener clase CSS según el estado
  const getStatusClass = (estado: string): string => {
    return estado.toLowerCase().replace(' ', '-');
  };

  // Función para formatear precio
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <section className="online-orders-section">
      <h2>🌐 Pedidos Online</h2>
      <div className="online-orders-list">
        {mockOnlineOrders.map((pedido) => (
          <div 
            key={pedido.idPedido} 
            className="online-order-card"
            onClick={() => handleOnlineOrderClick(pedido)}
          >
            {/* Header del pedido online */}
            <div className="order-header">
              <span className="order-number">{pedido.numeroComanda}</span>
              <span className={`order-status ${getStatusClass(pedido.estado)}`}>
                {pedido.estado}
              </span>
            </div>

            {/* Cliente */}
            <div className="order-client">
              <span>🌐</span>
              <span>{pedido.cliente}</span>
            </div>

            {/* Lista de productos */}
            <div className="order-products">
              {pedido.productos.map((producto, index) => (
                <div key={index} className="order-product">
                  <div className="product-info">
                    <span className="product-quantity">{producto.cantidad}x</span>
                    {producto.nombre}
                  </div>
                  <div className="product-price">
                    {formatPrice(producto.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con total y forma de pago */}
            <div className="order-footer">
              <div className="order-total">
                Total: {formatPrice(pedido.total)}
              </div>
              <div className="order-payment">
                {pedido.formaPago}
              </div>
            </div>

            {/* Observaciones si existen */}
            {pedido.observaciones && (
              <div className="order-notes">
                💬 {pedido.observaciones}
              </div>
            )}

            {/* Hora del pedido */}
            <div className="order-time">
              {pedido.horaPedido} - {pedido.fechaPedido}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Interfaz para las props del componente
interface HomeScreenProps {
  user: Usuario; // Usuario autenticado
  onNavigate: (screen: ScreenType) => void; // Función de navegación
}

// Componente de pantalla principal
const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate }) => {
  // Estado para controlar el overlay de vidrio
  const [showGlassOverlay, setShowGlassOverlay] = useState<boolean>(false);

  // Efecto para log al montar el componente
  useEffect(() => {
    console.log('🏠 Cargando pantalla principal para:', user.nombre); // Log de carga
  }, [user]);

  // Función para toggle del overlay de vidrio
  const toggleGlassOverlay = (): void => {
    setShowGlassOverlay(!showGlassOverlay);
    console.log('🔒 Toggle overlay de vidrio:', !showGlassOverlay); // Log del estado
  };

  // Función para manejar clicks en los indicadores
  const handleIndicatorClick = (indicatorId: string): void => {
    console.log('📊 Click en indicador:', indicatorId); // Log de click
    
    // Aquí se puede agregar lógica específica para cada indicador
    switch (indicatorId) {
      case 'ventas':
        console.log('💰 Mostrando detalles de ventas'); // Log específico
        onNavigate('indicadores-ventas' as ScreenType);
        break;
      case 'servicios':
        console.log('🛠️ Mostrando servicios'); // Log específico
        break;
      case 'finanzas':
        console.log('📊 Mostrando finanzas'); // Log específico
        break;
      case 'productos':
        console.log('🏆 Mostrando top productos'); // Log específico
        onNavigate('config-productos' as ScreenType);
        break;
      case 'inventario':
        console.log('📦 Mostrando inventario'); // Log específico
        onNavigate('config-insumos' as ScreenType);
        break;
      case 'clientes':
        console.log('👥 Mostrando clientes'); // Log específico
        onNavigate('config-clientes' as ScreenType);
        break;
      default:
        console.log('📊 Indicador genérico'); // Log genérico
    }
  };

  return (
    <div className="home-screen">
      {/* Contenido principal */}
      <main className="main-content">
        
        {/* Header del dashboard */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className={`hamburger-btn ${showGlassOverlay ? 'active' : ''}`}
                onClick={toggleGlassOverlay}
                title={showGlassOverlay ? 'Desactivar protección' : 'Activar protección de pantalla'}
              >
                <span className="hamburger-icon">
                  {showGlassOverlay ? '🔒' : '☰'}
                </span>
              </button>
              <div className="welcome-text">
                <h1>Bienvenido, {user.nombre}</h1>
                <p>Panel de control - POSWEBCrumen</p>
              </div>
            </div>
            <div className="header-right">
              <div className="user-info">
                <img 
                  src="/logowebposcrumen.svg" 
                  alt="POSWEBCrumen Logo" 
                  className="header-logo"
                />
               </div>
                 <span className="user-avatar">👤</span>
                <span className="user-name">{user.usuario}</span>
            </div>
          </div>
        </header>

        {/* Contenido principal con 3 columnas */}
        <div className="dashboard-container">
          
          {/* Columna izquierda: Navegación */}
          <div className="dashboard-left-area">
            <div className="left-navigator">
              <h2>🧭 NAVEGADOR</h2>
              
              <div className="nav-section-title-left">Configuración</div>
              <div className="nav-icons-grid">
                <button className="nav-icon-item" onClick={() => onNavigate('config-usuarios' as ScreenType)}>
                  <span className="icon">👥</span>
                  <span className="label">Usuarios</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-roles' as ScreenType)}>
                  <span className="icon">🎭</span>
                  <span className="label">Roles</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-clientes' as ScreenType)}>
                  <span className="icon">👤</span>
                  <span className="label">Clientes</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-negocios' as ScreenType)}>
                  <span className="icon">🏪</span>
                  <span className="label">Negocios</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-mesas' as ScreenType)}>
                  <span className="icon">🪑</span>
                  <span className="label">Mesas</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-productos' as ScreenType)}>
                  <span className="icon">📦</span>
                  <span className="label">Productos</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-categorias' as ScreenType)}>
                  <span className="icon">📁</span>
                  <span className="label">Categorías</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-insumos' as ScreenType)}>
                  <span className="icon">🥘</span>
                  <span className="label">Insumos</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-recetas' as ScreenType)}>
                  <span className="icon">📝</span>
                  <span className="label">Recetas</span>
                </button>
                <button className="nav-icon-item" onClick={() => onNavigate('config-subrecetas' as ScreenType)}>
                  <span className="icon">📋</span>
                  <span className="label">Sub-recetas</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Columna central: Indicadores */}
          <div className="dashboard-main-area">
            <section className="indicators-section">
              <h1 className="main-title">Panel de Control</h1>
              
              <div className="indicators-grid">
              
              {/* Cards de indicadores minimalistas - 8 indicadores */}
              <div className="indicator-card" onClick={() => handleIndicatorClick('ventas')}>
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3 className="card-title">Ventas del Día</h3>
                  <div className="card-value">$25,480</div>
                  <div className="card-change positive">+15.2% ↗️</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('pedidos')}>
                <div className="card-icon">🍽️</div>
                <div className="card-content">
                  <h3 className="card-title">Pedidos</h3>
                  <div className="card-value">47</div>
                  <div className="card-change positive">+12 nuevos</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('clientes')}>
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <h3 className="card-title">Clientes</h3>
                  <div className="card-value">156</div>
                  <div className="card-change positive">+3 nuevos</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('productos')}>
                <div className="card-icon">📦</div>
                <div className="card-content">
                  <h3 className="card-title">Productos</h3>
                  <div className="card-value">284</div>
                  <div className="card-change warning">Stock bajo</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('ingresos')}>
                <div className="card-icon">💵</div>
                <div className="card-content">
                  <h3 className="card-title">Ingresos</h3>
                  <div className="card-value">$187K</div>
                  <div className="card-change positive">+22.5% ↗️</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('gastos')}>
                <div className="card-icon">💸</div>
                <div className="card-content">
                  <h3 className="card-title">Gastos</h3>
                  <div className="card-value">$42K</div>
                  <div className="card-change negative">+8.1% ↗️</div>
                </div>
              </div>



            </div>
            </section>
          </div>

          {/* Columna derecha: Pedidos Online */}
          <div className="dashboard-right-area">
            {/* Renderizamos el componente RightNavigation para usar la declaración y permitir navegación rápida */}
            <RightNavigation onNavigate={onNavigate} />

            <OnlineOrdersComponent />
          </div>

        </div>

      </main>

      {/* Overlay de vidrio para protección */}
      {showGlassOverlay && (
        <div 
          className="glass-overlay"
          onClick={toggleGlassOverlay}
        >
          <div className="glass-content">
            <div className="glass-lock-icon">
              <img src="/logowebposcrumen.svg" alt="Logo Crumen POS" className="glass-logo" />
            </div>
            <h2>Pantalla Protegida</h2>
            <p>Haz clic en cualquier lugar para desbloquear</p>
           
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeScreen;