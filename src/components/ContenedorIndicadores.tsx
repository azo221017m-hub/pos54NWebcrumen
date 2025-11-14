// src/components/ContenedorIndicadores.tsx
// Contenedor de indicadores principales del dashboard

// Props del componente ContenedorIndicadores
interface ContenedorIndicadoresProps {
  onIndicatorClick: (indicator: string) => void;
}

// Componente contenedor de indicadores
const ContenedorIndicadores: React.FC<ContenedorIndicadoresProps> = ({ 
  onIndicatorClick 
}) => {
  
  // Función para manejar click en indicador
  const handleClick = (indicator: string): void => {
    console.log('📊 Click en indicador:', indicator);
    onIndicatorClick(indicator);
  };

  return (
    <section className="contenedor-indicadores">
      
      {/* Título de la sección */}
      <header className="indicadores-header">
        <h1>📊 Tablero Principal</h1>
      
      </header>

      {/* Grid de indicadores */}
      <div className="indicadores-grid">
        
        {/* Área de Ventas - Dividida en 4 mini-cards */}
        <div className="ventas-area">
          <div 
            className="mini-card ventas-hoy"
            onClick={() => handleClick('ventas-hoy')}
          >
            <div className="mini-icon">💰</div>
            <div className="mini-content">
              <h4>Ventas Hoy</h4>
              <div className="mini-value">$24.3K</div>
              <div className="mini-change positive">+12.5% ↗️</div>
            </div>
          </div>
          
          <div 
            className="mini-card ventas-semana"
            onClick={() => handleClick('ventas-semana')}
          >
            <div className="mini-icon">📈</div>
            <div className="mini-content">
              <h4>Esta Semana</h4>
              <div className="mini-value">$156K</div>
              <div className="mini-change positive">+8.7% ↗️</div>
            </div>
          </div>
          
          <div 
            className="mini-card ventas-mes"
            onClick={() => handleClick('ventas-mes')}
          >
            <div className="mini-icon">📊</div>
            <div className="mini-content">
              <h4>Este Mes</h4>
              <div className="mini-value">$678K</div>
              <div className="mini-change positive">+15.2% ↗️</div>
            </div>
          </div>
          
          <div 
            className="mini-card ticket-promedio"
            onClick={() => handleClick('ticket-promedio')}
          >
            <div className="mini-icon">🎯</div>
            <div className="mini-content">
              <h4>Ticket Prom.</h4>
              <div className="mini-value">$342</div>
              <div className="mini-change positive">+5.1% ↗️</div>
            </div>
          </div>
        </div>

        {/* Indicador de Inventario */}
        <div 
          className="indicador-card inventario"
          onClick={() => handleClick('inventario')}
        >
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3 className="card-title">Inventario</h3>
            <div className="card-value">89%</div>
            <div className="card-change neutral">Stock OK</div>
            <div className="card-subtitle">425 productos</div>
          </div>
        </div>

        {/* Indicador de Empleados */}
        <div 
          className="indicador-card empleados"
          onClick={() => handleClick('empleados')}
        >
          <div className="card-icon">👨‍💼</div>
          <div className="card-content">
            <h3 className="card-title">Empleados</h3>
            <div className="card-value">12</div>
            <div className="card-change positive">2 nuevos</div>
            <div className="card-subtitle">Activos hoy</div>
          </div>
        </div>


        {/* Área de Productos - Dividida en 4 mini-cards */}
        
        <div className="productos-area">
        
          <div 
            className="mini-card productos-disponibles"
            onClick={() => handleClick('productos-disponibles')}
          >
            <div className="mini-icon">📦</div>
            <div className="mini-content">
              <h4>Disponibles</h4>
              <div className="mini-value">248</div>
              <div className="mini-change positive">Stock OK</div>
            </div>
          </div>
          
          <div 
            className="mini-card productos-agotados"
            onClick={() => handleClick('productos-agotados')}
          >
            <div className="mini-icon">⚠️</div>
            <div className="mini-content">
              <h4>Por Agotar</h4>
              <div className="mini-value">12</div>
              <div className="mini-change warning">Crítico</div>
            </div>
          </div>
          
          <div 
            className="mini-card productos-nuevos"
            onClick={() => handleClick('productos-nuevos')}
          >
            <div className="mini-icon">✨</div>
            <div className="mini-content">
              <h4>Nuevos</h4>
              <div className="mini-value">8</div>
              <div className="mini-change positive">Esta semana</div>
            </div>
          </div>
          
          <div 
            className="mini-card productos-top"
            onClick={() => handleClick('productos-top')}
          >
            <div className="mini-icon">🏆</div>
            <div className="mini-content">
              <h4>Más Vendidos</h4>
              <div className="mini-value">15</div>
              <div className="mini-change positive">Top ventas</div>
            </div>
          </div>
        </div>

        {/* Indicador de Clientes */}
        <div 
          className="indicador-card clientes"
          onClick={() => handleClick('clientes')}
        >
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3 className="card-title">Clientes</h3>
            <div className="card-value">156</div>
            <div className="card-change positive">+3 nuevos</div>
            <div className="card-subtitle">Total registrados</div>
          </div>
        </div>
        {/* Indicador de Pedidos */}
        <div 
          className="indicador-card pedidos"
          onClick={() => handleClick('pedidos')}
        >
          <div className="card-icon">🛒</div>
          <div className="card-content">
            <h3 className="card-title">Pedidos Online</h3>
            <div className="card-value">34</div>
            <div className="card-change positive">+18% ↗️</div>
            <div className="realtime-indicators">
              <div className="realtime-item">
                <span className="pulse-dot pendiente"></span>
                <span>8 Pendientes</span>
              </div>
              <div className="realtime-item">
                <span className="pulse-dot proceso"></span>
                <span>12 En proceso</span>
              </div>
              <div className="realtime-item">
                <span className="pulse-dot entregado"></span>
                <span>14 Entregados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de Ingresos */}
        <div 
          className="indicador-card ingresos"
          onClick={() => handleClick('ingresos')}
        >
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3 className="card-title">Ingresos del Día</h3>
            <div className="card-value">$24.3K</div>
            <div className="card-change positive">+22.5% ↗️</div>
            <div className="realtime-indicators">
              <div className="realtime-item">
                <span className="pulse-dot efectivo"></span>
                <span>$12.4K Efectivo</span>
              </div>
              <div className="realtime-item">
                <span className="pulse-dot tarjeta"></span>
                <span>$9.8K Tarjetas</span>
              </div>
              <div className="realtime-item">
                <span className="pulse-dot online"></span>
                <span>$2.1K Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de Gastos */}
        <div 
          className="indicador-card gastos"
          onClick={() => handleClick('gastos')}
        >
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3 className="card-title">Gastos</h3>
            <div className="card-value">$42K</div>
            <div className="card-change negative">+8.1% ↗️</div>
            <div className="card-subtitle">Este mes</div>
          </div>
        </div>

      </div>

      {/* Funcionalidad de soporte removida - ahora en HeaderTableroInicio */}

    </section>
  );
};

export default ContenedorIndicadores;