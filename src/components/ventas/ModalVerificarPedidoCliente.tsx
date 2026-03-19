import React, { useState } from 'react';
import GoogleMapsSelector from '../common/GoogleMapsSelector/GoogleMapsSelector';
import './ModalVerificarPedidoCliente.css';

interface ItemResumen {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  moderadores?: string[];
  notas?: string;
}

interface ClienteInfo {
  referencia?: string;
  telefono: string;
  direccion?: string;
}

type FormaDePago = 'Efectivo' | 'Transferencia';
type TipoVenta = 'DOMICILIO' | 'RECOGER';
type HoraEntrega = 'Lo antes posible' | 'Hora Programada';

interface ModalVerificarPedidoClienteProps {
  isOpen: boolean;
  items: ItemResumen[];
  total: number;
  onSolicitarPedido: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  clienteData?: ClienteInfo | null;
  precioEnvio?: number;
}

/** Returns min selectable time = now + 15 min, formatted as HH:mm */
const getMinHoraProgramada = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 15);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const ModalVerificarPedidoCliente: React.FC<ModalVerificarPedidoClienteProps> = ({
  isOpen,
  items,
  total,
  onSolicitarPedido,
  onClose,
  isProcessing = false,
  clienteData = null,
  precioEnvio = 0,
}) => {
  // Editable address
  const [direccion, setDireccion] = useState(clienteData?.direccion || '');
  // Google Maps URL
  const [ubicacionUrl, setUbicacionUrl] = useState('');
  // Payment method
  const [formaDePago, setFormaDePago] = useState<FormaDePago>('Efectivo');
  // Change required (only if Efectivo)
  const [requiereCambio, setRequiereCambio] = useState('');
  // Sale type
  const [tipoVenta, setTipoVenta] = useState<TipoVenta>('DOMICILIO');
  // Delivery time
  const [horaEntrega, setHoraEntrega] = useState<HoraEntrega>('Lo antes posible');
  // Scheduled hour
  const [horaProgramada, setHoraProgramada] = useState('');
  // Dynamic min hour (recalculated on open and on selection)
  const [minHora, setMinHora] = useState(getMinHoraProgramada);

  // Reset state when modal opens with new data
  React.useEffect(() => {
    if (isOpen) {
      const freshMin = getMinHoraProgramada();
      setMinHora(freshMin);
      setDireccion(clienteData?.direccion || '');
      setUbicacionUrl('');
      setFormaDePago('Efectivo');
      setRequiereCambio('');
      setTipoVenta('DOMICILIO');
      setHoraEntrega('Lo antes posible');
      setHoraProgramada('');
    }
  }, [isOpen, clienteData]);

  if (!isOpen) return null;

  return (
    <div className="mvpc-overlay" onClick={onClose}>
      <div className="mvpc-content" onClick={(e) => e.stopPropagation()}>
        <button className="mvpc-close-btn" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <header className="mvpc-header">
          <div className="mvpc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h2 className="mvpc-title">Verificar Pedido</h2>
          <p className="mvpc-subtitle">Revisa tu pedido antes de enviarlo</p>
        </header>

        <div className="mvpc-body">
          {/* ---------- Left column: Items + Total ---------- */}
          <div className="mvpc-col-left">
            {/* ---------- Items list ---------- */}
            <section className="mvpc-items-list">
              <div className="mvpc-items-header">
                <span className="mvpc-col-producto">Producto</span>
                <span className="mvpc-col-cant">Cant.</span>
                <span className="mvpc-col-precio">Precio</span>
                <span className="mvpc-col-subtotal">Subtotal</span>
              </div>

              {items.map((item, idx) => (
                <article key={idx} className="mvpc-item-row">
                  <div className="mvpc-col-producto">
                    <span className="mvpc-item-nombre">{item.nombre}</span>
                    {item.moderadores && item.moderadores.length > 0 && (
                      <span className="mvpc-item-mods">{item.moderadores.join(', ')}</span>
                    )}
                    {item.notas && (
                      <span className="mvpc-item-nota">📝 {item.notas}</span>
                    )}
                  </div>
                  <span className="mvpc-col-cant">{item.cantidad}</span>
                  <span className="mvpc-col-precio">${item.precioUnitario.toFixed(2)}</span>
                  <span className="mvpc-col-subtotal">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                </article>
              ))}
            </section>

            <div className="mvpc-total-section">
              <span className="mvpc-total-label">Total del pedido</span>
              <span className="mvpc-total-amount">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* ---------- Right column: Client info + Order options ---------- */}
          {clienteData && (
            <div className="mvpc-col-right">
              {/* ---------- Client info section ---------- */}
              <section className="mvpc-cliente-info">
                {clienteData.referencia && (
                  <div className="mvpc-field">
                    <label className="mvpc-field-label">Referencia</label>
                    <span className="mvpc-field-value">{clienteData.referencia}</span>
                  </div>
                )}
                <div className="mvpc-field">
                  <label className="mvpc-field-label">Teléfono</label>
                  <span className="mvpc-field-value">{clienteData.telefono}</span>
                </div>
                <div className="mvpc-field">
                  <label className="mvpc-field-label">Dirección</label>
                  <input
                    type="text"
                    className="mvpc-field-input"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Escribe tu dirección de entrega"
                  />
                </div>

                {/* Mini Google Maps */}
                <div className="mvpc-field mvpc-map-field">
                  <label className="mvpc-field-label">📍 Ubicación</label>
                  <div className="mvpc-mini-map">
                    <GoogleMapsSelector value={ubicacionUrl} onChange={setUbicacionUrl} />
                  </div>
                </div>
              </section>

              {/* ---------- Order options ---------- */}
              <section className="mvpc-options-section">
                {/* Tipo de venta */}
                <div className="mvpc-field">
                  <label className="mvpc-field-label">Tipo de Venta</label>
                  <div className="mvpc-toggle-group">
                    <button
                      type="button"
                      className={`mvpc-toggle-btn ${tipoVenta === 'DOMICILIO' ? 'active' : ''}`}
                      onClick={() => setTipoVenta('DOMICILIO')}
                    >
                      🏠 Domicilio
                    </button>
                    <button
                      type="button"
                      className={`mvpc-toggle-btn ${tipoVenta === 'RECOGER' ? 'active' : ''}`}
                      onClick={() => setTipoVenta('RECOGER')}
                    >
                      🏪 Recoger
                    </button>
                  </div>
                </div>

                {/* Forma de pago */}
                <div className="mvpc-field">
                  <label className="mvpc-field-label">Forma de Pago</label>
                  <div className="mvpc-toggle-group">
                    <button
                      type="button"
                      className={`mvpc-toggle-btn ${formaDePago === 'Efectivo' ? 'active' : ''}`}
                      onClick={() => setFormaDePago('Efectivo')}
                    >
                      💵 Efectivo
                    </button>
                    <button
                      type="button"
                      className={`mvpc-toggle-btn ${formaDePago === 'Transferencia' ? 'active' : ''}`}
                      onClick={() => setFormaDePago('Transferencia')}
                    >
                      🏦 Transferencia
                    </button>
                  </div>
                </div>

                {/* Requiero cambio (only when Efectivo) */}
                {formaDePago === 'Efectivo' && (
                  <div className="mvpc-field">
                    <label className="mvpc-field-label">¿Requiero cambio de $?</label>
                    <input
                      type="number"
                      className="mvpc-field-input"
                      value={requiereCambio}
                      onChange={(e) => setRequiereCambio(e.target.value)}
                      placeholder="Ej: 500"
                      min={0}
                    />
                  </div>
                )}

                {/* Precio de envío */}
                <div className="mvpc-field">
                  <label className="mvpc-field-label">Precio de Envío</label>
                  <span className="mvpc-field-value mvpc-envio-valor">${precioEnvio.toFixed(2)}</span>
                </div>

                {/* Hora de entrega */}
                <div className="mvpc-field">
                  <label className="mvpc-field-label">Hora de Entrega</label>
                  <div className="mvpc-toggle-group">
                    <button
                      type="button"
                      className={`mvpc-toggle-btn ${horaEntrega === 'Lo antes posible' ? 'active' : ''}`}
                      onClick={() => setHoraEntrega('Lo antes posible')}
                    >
                      ⚡ Lo antes posible
                    </button>
                    <button
                      type="button"
                      className={`mvpc-toggle-btn ${horaEntrega === 'Hora Programada' ? 'active' : ''}`}
                      onClick={() => {
                        const freshMin = getMinHoraProgramada();
                        setMinHora(freshMin);
                        setHoraEntrega('Hora Programada');
                        if (!horaProgramada || horaProgramada < freshMin) setHoraProgramada(freshMin);
                      }}
                    >
                      🕐 Hora Programada
                    </button>
                  </div>
                </div>

                {/* Time picker for scheduled delivery */}
                {horaEntrega === 'Hora Programada' && (
                  <div className="mvpc-field mvpc-hora-picker">
                    <label className="mvpc-field-label">Selecciona la hora</label>
                    <input
                      type="time"
                      className="mvpc-field-input mvpc-time-input"
                      value={horaProgramada}
                      onChange={(e) => setHoraProgramada(e.target.value)}
                      min={minHora}
                    />
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* ---------- Notice ---------- */}
        <div className="mvpc-aviso">
          <span className="mvpc-aviso-icon">✅</span>
          <span className="mvpc-aviso-text">
            Pedido sujeto a confirmación del negocio antes de iniciar preparación.
          </span>
        </div>

        <footer className="mvpc-actions">
          <button className="mvpc-btn-cancel" onClick={onClose} disabled={isProcessing}>
            Regresar
          </button>
          <button
            className="mvpc-btn-solicitar"
            onClick={onSolicitarPedido}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Solicitar Pedido'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalVerificarPedidoCliente;
