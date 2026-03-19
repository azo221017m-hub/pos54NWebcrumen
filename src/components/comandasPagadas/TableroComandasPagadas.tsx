import { useState, useEffect, useCallback } from 'react';
import { obtenerComandasPagadasTurnoActual } from '../../services/ventasWebService';
import type { VentaWebWithDetails } from '../../types/ventasWeb.types';
import './TableroComandasPagadas.css';

interface Props {
  onVolver: () => void;
}

const TableroComandasPagadas = ({ onVolver }: Props) => {
  const [comandas, setComandas] = useState<VentaWebWithDetails[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');
  const [comandaDetalle, setComandaDetalle] = useState<VentaWebWithDetails | null>(null);

  const cargarComandas = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerComandasPagadasTurnoActual();
      setComandas(data);
    } catch {
      setError('Error al cargar las comandas pagadas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarComandas();
  }, [cargarComandas]);

  const formatHora = (fecha: Date | string): string => {
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatMoneda = (valor: number | string): string => {
    return `$${Number(valor || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const contarProductos = (venta: VentaWebWithDetails): number => {
    return venta.detalles.reduce((sum, d) => sum + Number(d.cantidad || 0), 0);
  };

  const getLabelFormaPago = (forma: string): string => {
    const labels: Record<string, string> = {
      EFECTIVO: 'Efectivo',
      TARJETA: 'Tarjeta',
      TRANSFERENCIA: 'Transferencia',
      MIXTO: 'Mixto',
      sinFP: 'Sin FP',
    };
    return labels[forma] || forma;
  };

  const getLabelTipoVenta = (tipo: string): string => {
    const labels: Record<string, string> = {
      MESA: 'Mesa',
      LLEVAR: 'Llevar',
      DOMICILIO: 'Domicilio',
      ONLINE: 'Online',
      MOVIMIENTO: 'Movimiento',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="tablero-comandas-pagadas">
      {/* Encabezado */}
      <div className="tcp-header">
        <button className="tcp-btn-volver" onClick={onVolver} title="Volver al tablero">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </button>
        <h2 className="tcp-titulo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          Comandas Pagadas del Turno
        </h2>

      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="tcp-loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
          Cargando...
        </div>
      ) : error ? (
        <div className="tcp-error">{error}</div>
      ) : comandas.length === 0 ? (
        <div className="tcp-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>No hay comandas pagadas en el turno actual</p>
        </div>
      ) : (
        <div className="tcp-tabla-container">
          <table className="tcp-tabla">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Comanda</th>
                <th>Cliente</th>
                <th>Tipo de Venta</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Forma Pago</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {comandas.map((venta) => (
                <tr key={venta.idventa}>
                  <td className="tcp-hora">{formatHora(venta.fechadeventa)}</td>
                  <td className="tcp-folio">#{venta.folioventa}</td>
                  <td className="tcp-cliente">{venta.cliente || '—'}</td>
                  <td>
                    <span className={`tcp-badge tcp-tipo-${venta.tipodeventa.toLowerCase()}`}>
                      {getLabelTipoVenta(venta.tipodeventa)}
                    </span>
                  </td>
                  <td className="tcp-cant">{contarProductos(venta)}</td>
                  <td className="tcp-total">{formatMoneda(venta.totaldeventa)}</td>
                  <td>
                    <span className={`tcp-badge tcp-fp-${venta.formadepago.toLowerCase()}`}>
                      {getLabelFormaPago(venta.formadepago)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="tcp-btn-ver"
                      onClick={() => setComandaDetalle(venta)}
                      title="Ver detalle de la comanda"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="tcp-total-footer">
            <span>{comandas.length} comanda{comandas.length !== 1 ? 's' : ''} pagada{comandas.length !== 1 ? 's' : ''}</span>
            <span className="tcp-total-sum">
              Total: {formatMoneda(comandas.reduce((sum, v) => sum + Number(v.totaldeventa || 0), 0))}
            </span>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {comandaDetalle && (
        <div className="tcp-modal-overlay" onClick={() => setComandaDetalle(null)}>
          <div className="tcp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="tcp-modal-btn-cerrar"
              onClick={() => setComandaDetalle(null)}
              title="Cerrar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cerrar
            </button>

            <div className="tcp-modal-header">
              <h3>Detalle de Comanda</h3>
              <div className="tcp-modal-meta">
                <span>#{comandaDetalle.folioventa}</span>
                <span>{formatHora(comandaDetalle.fechadeventa)}</span>
              </div>
            </div>

            <div className="tcp-modal-info">
              <div className="tcp-modal-info-row">
                <span className="tcp-modal-label">Cliente:</span>
                <span>{comandaDetalle.cliente || '—'}</span>
              </div>
              <div className="tcp-modal-info-row">
                <span className="tcp-modal-label">Tipo de Venta:</span>
                <span>
                  <span className={`tcp-badge tcp-tipo-${comandaDetalle.tipodeventa.toLowerCase()}`}>
                    {getLabelTipoVenta(comandaDetalle.tipodeventa)}
                  </span>
                </span>
              </div>
              <div className="tcp-modal-info-row">
                <span className="tcp-modal-label">Forma de Pago:</span>
                <span>
                  <span className={`tcp-badge tcp-fp-${comandaDetalle.formadepago.toLowerCase()}`}>
                    {getLabelFormaPago(comandaDetalle.formadepago)}
                  </span>
                </span>
              </div>
            </div>

            <div className="tcp-modal-productos">
              <h4>Productos</h4>
              <table className="tcp-modal-tabla">
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Producto</th>
                    <th>P. Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {comandaDetalle.detalles.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>Sin detalles</td>
                    </tr>
                  ) : (
                    comandaDetalle.detalles.map((d) => (
                      <tr key={d.iddetalleventa}>
                        <td>{d.cantidad}</td>
                        <td>{d.nombreproducto}{d.observaciones ? <span className="tcp-obs"> ({d.observaciones})</span> : null}</td>
                        <td>{formatMoneda(d.preciounitario)}</td>
                        <td>{formatMoneda(d.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="tcp-modal-footer">
              <span className="tcp-modal-total-label">Total:</span>
              <span className="tcp-modal-total-val">{formatMoneda(comandaDetalle.totaldeventa)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableroComandasPagadas;
