// src/components/PanelAlertasRapidas.tsx
// Panel simplificado para mostrar solo pedidos online

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Pedido } from '../types'; // Importa tipos

// Props del componente
interface PanelAlertasRapidasProps {
  // Componente sin props adicionales
}

// Componente principal - ahora solo muestra pedidos online
const PanelAlertasRapidas: React.FC<PanelAlertasRapidasProps> = () => {
  // Estado para pedidos online
  const [pedidosOnline, setPedidosOnline] = useState<Pedido[]>([]);

  // Datos simulados de pedidos online
  useEffect(() => {
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
          { nombre: 'Papas Fritas', cantidad: 2, precio: 45.00, subtotal: 90.00 }
        ],
        total: 380.00,
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
          { nombre: 'Ensalada Griega', cantidad: 1, precio: 95.00, subtotal: 95.00 }
        ],
        total: 95.00,
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
          { nombre: 'Guacamole', cantidad: 1, precio: 55.00, subtotal: 55.00 }
        ],
        total: 167.00,
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
          { nombre: 'Pasta Carbonara', cantidad: 1, precio: 165.00, subtotal: 165.00 }
        ],
        total: 165.00,
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
          { nombre: 'Sushi Variado', cantidad: 1, precio: 285.00, subtotal: 285.00 }
        ],
        total: 285.00,
        formaPago: 'TRANSFERENCIA',
        estado: 'LISTO',
        fechaPedido: '2025-10-18',
        horaPedido: '15:45',
        observaciones: 'Sin wasabi'
      }
    ];
    
    setPedidosOnline(mockOnlineOrders);
    console.log('🌐 Pedidos online cargados:', mockOnlineOrders.length);
  }, []);

  // Función para manejar click en pedido
  const handlePedidoClick = (pedido: Pedido): void => {
    console.log('🌐 Click en pedido online:', pedido.numeroComanda);
    // Aquí se puede agregar lógica para mostrar detalles del pedido
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
    <div className="panel-alertas-rapidas">
      
      {/* SOLO SECCIÓN PEDIDOS ONLINE */}
      <div className="pedidos-online-section">
        <div className="section-header">
          <h3>🌐 Pedidos Online</h3>
          <span className="pedidos-count">{pedidosOnline.length}</span>
        </div>
        
        <div className="pedidos-online-list">
          {pedidosOnline.map((pedido) => (
            <div 
              key={pedido.idPedido} 
              className="pedido-online-card"
              onClick={() => handlePedidoClick(pedido)}
            >
              {/* Header del pedido online */}
              <div className="pedido-header">
                <span className="pedido-numero">{pedido.numeroComanda}</span>
                <span className={`pedido-estado ${getStatusClass(pedido.estado)}`}>
                  {pedido.estado}
                </span>
              </div>

              {/* Cliente */}
              <div className="pedido-cliente">
                <span className="cliente-icon">🌐</span>
                <span className="cliente-nombre">{pedido.cliente}</span>
              </div>

              {/* Lista de productos */}
              <div className="pedido-productos">
                {pedido.productos.slice(0, 2).map((producto, index) => (
                  <div key={index} className="pedido-producto">
                    <div className="producto-info">
                      <span className="producto-cantidad">{producto.cantidad}x</span>
                      <span className="producto-nombre">{producto.nombre}</span>
                    </div>
                    <div className="producto-precio">
                      {formatPrice(producto.subtotal)}
                    </div>
                  </div>
                ))}
                {pedido.productos.length > 2 && (
                  <div className="productos-mas">
                    +{pedido.productos.length - 2} más...
                  </div>
                )}
              </div>

              {/* Footer con total y forma de pago */}
              <div className="pedido-footer">
                <div className="pedido-total">
                  Total: {formatPrice(pedido.total)}
                </div>
                <div className="pedido-pago">
                  {pedido.formaPago}
                </div>
              </div>

              {/* Observaciones si existen */}
              {pedido.observaciones && (
                <div className="pedido-observaciones">
                  💬 {pedido.observaciones}
                </div>
              )}

              {/* Hora del pedido */}
              <div className="pedido-tiempo">
                {pedido.horaPedido}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PanelAlertasRapidas;