// src/components/MuestraPedidosOnline.tsx
// Muestra de pedidos online con cards detallados

import { useState } from 'react';

// Tipo para pedido online
interface PedidoOnline {
  id: string;
  numeroComanda: string;
  cliente: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  total: number;
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO';
  hora: string;
  formaPago: string;
  observaciones?: string;
}

// Componente muestra de pedidos online
const MuestraPedidosOnline: React.FC = () => {
  
  // Estado para filtrar pedidos
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  // Datos de ejemplo de pedidos online
  const pedidosOnline: PedidoOnline[] = [
    {
      id: 'PO001',
      numeroComanda: 'WEB-001',
      cliente: 'María González',
      items: [
        { nombre: 'Pizza Hawaiana', cantidad: 1, precio: 185 },
        { nombre: 'Refresco Cola', cantidad: 2, precio: 28 }
      ],
      total: 241,
      estado: 'PENDIENTE',
      hora: '14:32',
      formaPago: 'Tarjeta',
      observaciones: 'Sin piña, extra queso'
    },
    {
      id: 'PO002',
      numeroComanda: 'WEB-002',
      cliente: 'Carlos Rodríguez',
      items: [
        { nombre: 'Hamburguesa BBQ', cantidad: 2, precio: 145 },
        { nombre: 'Papas Fritas', cantidad: 2, precio: 45 }
      ],
      total: 380,
      estado: 'PREPARANDO',
      hora: '14:28',
      formaPago: 'Efectivo'
    },
    {
      id: 'PO003',
      numeroComanda: 'WEB-003',
      cliente: 'Ana Martínez',
      items: [
        { nombre: 'Ensalada César', cantidad: 1, precio: 95 },
        { nombre: 'Agua Natural', cantidad: 1, precio: 15 }
      ],
      total: 110,
      estado: 'LISTO',
      hora: '14:15',
      formaPago: 'Transferencia'
    },
    {
      id: 'PO004',
      numeroComanda: 'WEB-004',
      cliente: 'Roberto Silva',
      items: [
        { nombre: 'Tacos al Pastor', cantidad: 4, precio: 28 },
        { nombre: 'Cerveza', cantidad: 2, precio: 35 }
      ],
      total: 182,
      estado: 'PREPARANDO',
      hora: '14:40',
      formaPago: 'Tarjeta',
      observaciones: 'Extra salsa verde'
    },
    {
      id: 'PO005',
      numeroComanda: 'WEB-005',
      cliente: 'Lucía Herrera',
      items: [
        { nombre: 'Sushi Variado', cantidad: 1, precio: 285 },
        { nombre: 'Té Verde', cantidad: 1, precio: 30 }
      ],
      total: 315,
      estado: 'PENDIENTE',
      hora: '14:45',
      formaPago: 'Efectivo'
    },
    {
      id: 'PO006',
      numeroComanda: 'WEB-006',
      cliente: 'Diego López',
      items: [
        { nombre: 'Pasta Carbonara', cantidad: 1, precio: 165 }
      ],
      total: 165,
      estado: 'LISTO',
      hora: '14:20',
      formaPago: 'Transferencia',
      observaciones: 'Sin tocino'
    }
  ];

  // Filtrar pedidos por estado
  const pedidosFiltrados = filtroEstado === 'TODOS' 
    ? pedidosOnline 
    : pedidosOnline.filter(pedido => pedido.estado === filtroEstado);

  // Contar pedidos por estado
  const contadores = {
    PENDIENTE: pedidosOnline.filter(p => p.estado === 'PENDIENTE').length,
    PREPARANDO: pedidosOnline.filter(p => p.estado === 'PREPARANDO').length,
    LISTO: pedidosOnline.filter(p => p.estado === 'LISTO').length,
    ENTREGADO: pedidosOnline.filter(p => p.estado === 'ENTREGADO').length
  };

  // Función para obtener clase CSS del estado
  const getEstadoClass = (estado: string): string => {
    return estado.toLowerCase();
  };

  // Función para formatear precio
  const formatPrecio = (precio: number): string => {
    return `$${precio.toFixed(2)}`;
  };

  return (
    <aside className="muestra-pedidos-online">
      
      {/* Header con título y estadísticas */}
      <header className="pedidos-header">
        <h2>📱 Pedidos Online</h2>
        <div className="pedidos-stats">
          <div className="stat-item pendiente">
            <span className="stat-number">{contadores.PENDIENTE}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-item preparando">
            <span className="stat-number">{contadores.PREPARANDO}</span>
            <span className="stat-label">Preparando</span>
          </div>
          <div className="stat-item listo">
            <span className="stat-number">{contadores.LISTO}</span>
            <span className="stat-label">Listos</span>
          </div>
        </div>
      </header>

      {/* Filtros de estado */}
      <div className="pedidos-filters">
        {['TODOS', 'PENDIENTE', 'PREPARANDO', 'LISTO'].map(estado => (
          <button
            key={estado}
            className={`filter-btn ${filtroEstado === estado ? 'active' : ''}`}
            onClick={() => setFiltroEstado(estado)}
          >
            {estado}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      <div className="pedidos-list">
        {pedidosFiltrados.map(pedido => (
          <div 
            key={pedido.id} 
            className={`pedido-card ${getEstadoClass(pedido.estado)}`}
          >
            
            {/* Header del pedido */}
            <div className="pedido-header">
              <div className="comanda-info">
                <span className="numero-comanda">{pedido.numeroComanda}</span>
                <span className="hora-pedido">{pedido.hora}</span>
              </div>
              <span className={`estado-badge ${getEstadoClass(pedido.estado)}`}>
                {pedido.estado}
              </span>
            </div>

            {/* Cliente */}
            <div className="cliente-info">
              <span className="cliente-icon">👤</span>
              <span className="cliente-nombre">{pedido.cliente}</span>
            </div>

            {/* Items del pedido */}
            <div className="pedido-items">
              {pedido.items.map((item, index) => (
                <div key={index} className="pedido-item">
                  <span className="item-cantidad">{item.cantidad}x</span>
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-precio">{formatPrecio(item.precio * item.cantidad)}</span>
                </div>
              ))}
            </div>

            {/* Observaciones si existen */}
            {pedido.observaciones && (
              <div className="pedido-observaciones">
                <span className="obs-icon">📝</span>
                <span className="obs-text">{pedido.observaciones}</span>
              </div>
            )}

            {/* Footer con total y forma de pago */}
            <div className="pedido-footer">
              <div className="total-pedido">
                <strong>Total: {formatPrecio(pedido.total)}</strong>
              </div>
              <div className="forma-pago">
                <span className="pago-icon">💳</span>
                <span>{pedido.formaPago}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Botón para ver todos */}
      <div className="pedidos-actions">
        <button className="ver-todos-btn">
          Ver Todos los Pedidos
          <span className="btn-arrow">→</span>
        </button>
      </div>

    </aside>
  );
};

export default MuestraPedidosOnline;