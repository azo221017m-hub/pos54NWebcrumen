import React from 'react';
import './ModalVerificarPedidoCliente.css';

interface ItemResumen {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  moderadores?: string[];
  notas?: string;
}

interface ModalVerificarPedidoClienteProps {
  isOpen: boolean;
  items: ItemResumen[];
  total: number;
  onSolicitarPedido: () => void;
  onClose: () => void;
  isProcessing?: boolean;
}

const ModalVerificarPedidoCliente: React.FC<ModalVerificarPedidoClienteProps> = ({
  isOpen,
  items,
  total,
  onSolicitarPedido,
  onClose,
  isProcessing = false,
}) => {
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
