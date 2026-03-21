import React, { useState, useEffect, useCallback } from 'react';
import { clienteWebService } from '../../services/clienteWebService';
import type { PedidoTransito } from '../../services/clienteWebService';
import { useWebSocket } from '../../hooks/useWebSocket';
import './TableroCliente.css';

interface TableroClienteProps {
  onOcultar: () => void;
}

const PASOS_TIMELINE = [
  { key: 'SOLICITADO', label: 'Solicitado', icon: '📋' },
  { key: 'PREPARANDO', label: 'Preparando', icon: '👨‍🍳' },
  { key: 'EN_CAMINO', label: 'En Camino', icon: '🚴' },
  { key: 'ENTREGADO', label: 'Entregado', icon: '✅' },
];

function getStepIndex(estatus: string): number {
  const idx = PASOS_TIMELINE.findIndex(p => p.key === estatus);
  return idx >= 0 ? idx : 0;
}

function formatFecha(fecha: string): string {
  try {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fecha;
  }
}

function formatMoneda(val: number): string {
  return `$${Number(val).toFixed(2)}`;
}

function parseDetalleProductos(json: string): Array<{ nombreproducto: string; cantidad: number; preciounitario: number }> {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

const TableroCliente: React.FC<TableroClienteProps> = ({ onOcultar }) => {
  const [pedidos, setPedidos] = useState<PedidoTransito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);

  const cargarPedidos = useCallback(async () => {
    try {
      const data = await clienteWebService.obtenerMisPedidos();
      setPedidos(data);
    } catch (err) {
      console.error('Error loading pedidos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // Real-time WebSocket updates
  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'estado_cambio_web' || data.type === 'nuevo_pedido_web') {
        cargarPedidos();
      }
    },
  });

  const pedidosActivos = pedidos.filter(
    p => p.estatuspedidotransito !== 'CANCELADO'
  );

  const saldoPuntos = pedidosActivos.length > 0
    ? pedidosActivos[0].saldopuntospedidostransito
    : 0;

  return (
    <div className="tc-tablero">
      {/* Header */}
      <div className="tc-header">
        <div className="tc-header-left">
          <svg className="tc-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <h3 className="tc-title">Mis Pedidos</h3>
        </div>
        <div className="tc-header-right">
          <div className="tc-puntos">
            <svg className="tc-puntos-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M6 12h12" />
            </svg>
            <span className="tc-puntos-valor">{saldoPuntos}</span>
            <span className="tc-puntos-label">puntos</span>
          </div>
          <button className="tc-ocultar-btn" onClick={onOcultar} aria-label="Ocultar mi tablero">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tc-ocultar-icon">
              <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
            Ocultar mi Tablero
          </button>
        </div>
      </div>

      {/* Content */}
      {cargando ? (
        <div className="tc-loading">
          <div className="tc-spinner" />
          <p>Cargando pedidos…</p>
        </div>
      ) : pedidosActivos.length === 0 ? (
        <div className="tc-empty">
          <svg className="tc-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>No tienes pedidos activos</p>
        </div>
      ) : (
        <div className="tc-pedidos-grid">
          {pedidosActivos.map((pedido) => {
            const stepIdx = getStepIndex(pedido.estatuspedidotransito);
            const isEntregado = pedido.estatuspedidotransito === 'ENTREGADO';
            const productos = parseDetalleProductos(pedido.detalleproductos);
            const isExpanded = expandido === pedido.idpedidowebtransito;

            return (
              <div
                key={pedido.idpedidowebtransito}
                className={`tc-card${isEntregado ? ' tc-card--entregado' : ''}`}
              >
                {/* Card header */}
                <div className="tc-card-top">
                  <div className="tc-card-folio">
                    <span className="tc-folio-hash">#</span>
                    {pedido.folioventa}
                  </div>
                  <div className="tc-card-total">{formatMoneda(pedido.totalpedido)}</div>
                </div>

                <div className="tc-card-fecha">{formatFecha(pedido.fechahorapedidosolicitado)}</div>

                {/* Timeline */}
                <div className="tc-timeline">
                  {PASOS_TIMELINE.map((paso, i) => {
                    const isActive = i <= stepIdx;
                    const isCurrent = i === stepIdx;
                    return (
                      <div key={paso.key} className={`tc-step${isActive ? ' tc-step--active' : ''}${isCurrent ? ' tc-step--current' : ''}`}>
                        <div className="tc-step-dot">
                          <span className="tc-step-emoji">{paso.icon}</span>
                        </div>
                        {i < PASOS_TIMELINE.length - 1 && (
                          <div className={`tc-step-line${isActive && i < stepIdx ? ' tc-step-line--active' : ''}`} />
                        )}
                        <span className="tc-step-label">{paso.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Toggle details */}
                <button
                  className="tc-detalle-toggle"
                  onClick={() => setExpandido(isExpanded ? null : pedido.idpedidowebtransito)}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                  <svg className={`tc-detalle-chevron${isExpanded ? ' tc-detalle-chevron--open' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="tc-detalle">
                    <ul className="tc-productos-list">
                      {productos.map((prod, idx) => (
                        <li key={idx} className="tc-producto-item">
                          <span className="tc-producto-cant">{prod.cantidad}x</span>
                          <span className="tc-producto-nombre">{prod.nombreproducto}</span>
                          <span className="tc-producto-precio">{formatMoneda(prod.preciounitario * prod.cantidad)}</span>
                        </li>
                      ))}
                    </ul>
                    {pedido.mensajenegociopedidostransito && (
                      <div className="tc-mensaje-negocio">
                        <strong>Mensaje del negocio:</strong> {pedido.mensajenegociopedidostransito}
                      </div>
                    )}
                    <div className="tc-puntos-pedido">
                      <span>Puntos obtenidos: <strong>{pedido.puntosobtenidospedidostransito}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TableroCliente;
