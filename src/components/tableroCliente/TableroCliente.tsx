import React, { useState, useEffect, useCallback, useRef } from 'react';
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

function formatHora(fecha: string): string {
  try {
    return new Date(fecha).toLocaleString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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

interface GrupoNegocio {
  idnegocio: number;
  logotipo: string | null;
  contacto: string | null;
  pedidos: PedidoTransito[];
}

function agruparPorNegocio(pedidos: PedidoTransito[]): GrupoNegocio[] {
  const map = new Map<number, GrupoNegocio>();
  for (const p of pedidos) {
    if (!map.has(p.idnegocio)) {
      map.set(p.idnegocio, {
        idnegocio: p.idnegocio,
        logotipo: p.negocio_logotipo,
        contacto: p.negocio_contacto,
        pedidos: [],
      });
    }
    map.get(p.idnegocio)!.pedidos.push(p);
  }
  return Array.from(map.values());
}

const TableroCliente: React.FC<TableroClienteProps> = ({ onOcultar }) => {
  const [pedidos, setPedidos] = useState<PedidoTransito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [chatTexts, setChatTexts] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState<Record<number, boolean>>({});
  const [chatFlash, setChatFlash] = useState<number | null>(null);
  const prevPedidosRef = useRef<PedidoTransito[]>([]);

  const cargarPedidos = useCallback(async () => {
    try {
      const data = await clienteWebService.obtenerMisPedidos();
      // Detect new business messages for notification
      const prev = prevPedidosRef.current;
      if (prev.length > 0) {
        for (const p of data) {
          const old = prev.find(o => o.idpedidowebtransito === p.idpedidowebtransito);
          if (old && p.mensajenegociopedidostransito && p.mensajenegociopedidostransito !== old.mensajenegociopedidostransito) {
            // New business message – play sound & flash
            try {
              const audio = new Audio('/notificacion.wav');
              audio.play().catch(() => {});
            } catch { /* ignore */ }
            setChatFlash(p.idpedidowebtransito);
            setTimeout(() => setChatFlash(null), 3000);
          }
        }
      }
      prevPedidosRef.current = data;
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
      if (data.type === 'estado_cambio_web' || data.type === 'nuevo_pedido_web' || data.type === 'mensaje_pedido_transito') {
        cargarPedidos();
      }
    },
  });

  const handleEnviarMensaje = async (idpedidowebtransito: number) => {
    const texto = (chatTexts[idpedidowebtransito] || '').trim();
    if (!texto) return;
    setEnviando(prev => ({ ...prev, [idpedidowebtransito]: true }));
    const ok = await clienteWebService.enviarMensajePedido(idpedidowebtransito, texto);
    if (ok) {
      setChatTexts(prev => ({ ...prev, [idpedidowebtransito]: '' }));
      await cargarPedidos();
    }
    setEnviando(prev => ({ ...prev, [idpedidowebtransito]: false }));
  };

  const pedidosActivos = pedidos.filter(
    p => ['SOLICITADO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO'].includes(p.estatuspedidotransito)
  );

  const grupos = agruparPorNegocio(pedidosActivos);

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
        <div className="tc-grupos">
          {grupos.map((grupo) => (
            <div key={grupo.idnegocio} className="tc-grupo">
              {/* Negocio header */}
              <div className="tc-grupo-header">
                {grupo.logotipo ? (
                  <img src={grupo.logotipo} alt="Logo negocio" className="tc-grupo-logo" />
                ) : (
                  <div className="tc-grupo-logo-placeholder">🏪</div>
                )}
                {grupo.contacto && (
                  <span className="tc-grupo-contacto">
                    <svg className="tc-contacto-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    {grupo.contacto}
                  </span>
                )}
              </div>

              {/* Pedidos grid */}
              <div className="tc-pedidos-grid">
                {grupo.pedidos.map((pedido) => {
                  const stepIdx = getStepIndex(pedido.estatuspedidotransito);
                  const isEntregado = pedido.estatuspedidotransito === 'ENTREGADO';
                  const productos = parseDetalleProductos(pedido.detalleproductos);
                  const isExpanded = expandido === pedido.idpedidowebtransito;
                  const isFlashing = chatFlash === pedido.idpedidowebtransito;

                  return (
                    <div
                      key={pedido.idpedidowebtransito}
                      className={`tc-card${isEntregado ? ' tc-card--entregado' : ''}${isFlashing ? ' tc-card--flash' : ''}`}
                    >
                      {/* Card header */}
                      <div className="tc-card-top">
                        <div className="tc-card-folio">
                          <span className="tc-folio-hash">#</span>
                          {pedido.folioventa}
                        </div>
                        <div className="tc-card-total">{formatMoneda(pedido.totalpedido)}</div>
                      </div>

                      <div className="tc-card-fecha">
                        🕐 {formatHora(pedido.fechahorapedidowebtransito || pedido.fechahorapedidosolicitado)}
                      </div>

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

                      {/* Observaciones negocio – ¡Atención! */}
                      {pedido.observacionesnegociopedidostransito && (
                        <div className="tc-atencion">
                          <span className="tc-atencion-icon">⚠️</span>
                          <div className="tc-atencion-content">
                            <strong>¡Atención!</strong>
                            <p>{pedido.observacionesnegociopedidostransito}</p>
                          </div>
                        </div>
                      )}

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

                          <div className="tc-puntos-pedido">
                            <span>Puntos obtenidos: <strong>{pedido.puntosobtenidospedidostransito}</strong></span>
                          </div>

                          {/* MiniChat CDT */}
                          <div className={`tc-minichat${isFlashing ? ' tc-minichat--flash' : ''}`}>
                            <div className="tc-minichat-title">
                              <svg className="tc-minichat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                              </svg>
                              Chat con el negocio
                            </div>

                            {/* Business message (read-only) */}
                            {pedido.mensajenegociopedidostransito && (
                              <div className="tc-minichat-msg tc-minichat-msg--negocio">
                                <span className="tc-minichat-msg-label">Negocio:</span>
                                <p>{pedido.mensajenegociopedidostransito}</p>
                              </div>
                            )}

                            {/* Client message (read-only display) */}
                            {pedido.mensajeclientepedidostransito && (
                              <div className="tc-minichat-msg tc-minichat-msg--cliente">
                                <span className="tc-minichat-msg-label">Tú:</span>
                                <p>{pedido.mensajeclientepedidostransito}</p>
                              </div>
                            )}

                            {/* Input area – only for active (non-delivered) orders */}
                            {!isEntregado && (
                              <div className="tc-minichat-input-row">
                                <input
                                  type="text"
                                  className="tc-minichat-input"
                                  placeholder="Escribe un mensaje…"
                                  maxLength={500}
                                  value={chatTexts[pedido.idpedidowebtransito] || ''}
                                  onChange={(e) => setChatTexts(prev => ({ ...prev, [pedido.idpedidowebtransito]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleEnviarMensaje(pedido.idpedidowebtransito);
                                    }
                                  }}
                                  disabled={enviando[pedido.idpedidowebtransito]}
                                />
                                <button
                                  className="tc-minichat-send"
                                  onClick={() => handleEnviarMensaje(pedido.idpedidowebtransito)}
                                  disabled={enviando[pedido.idpedidowebtransito] || !(chatTexts[pedido.idpedidowebtransito] || '').trim()}
                                  title="Enviar"
                                >
                                  {enviando[pedido.idpedidowebtransito] ? (
                                    <div className="tc-minichat-send-spinner" />
                                  ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="tc-minichat-send-icon">
                                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableroCliente;
