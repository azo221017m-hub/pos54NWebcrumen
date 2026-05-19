import { useState, useEffect, useCallback, useRef } from 'react';
import { obtenerComandasPagadasTurnoActual } from '../../services/ventasWebService';
import type { VentaWebWithDetails } from '../../types/ventasWeb.types';
import { getShortFolio } from '../../utils/formatters';
import { setSkipBeforeUnload } from '../../services/sessionService';
import './TableroComandasPagadas.css';

interface Props {
  onVolver: () => void;
}

const PRINT_POPUP_WINDOW_FEATURES = 'width=340,height=700';
const PRINT_WINDOW_READY_DELAY_MS = 500;
const WHATSAPP_NAVIGATION_DELAY_MS = 1500;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatMonedaReporte = (valor: number | string): string =>
  `$${Number(valor || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatHoraReporte = (fecha: Date | string): string => {
  const d = new Date(fecha);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getLabelFormaPagoReporte = (forma: string): string => {
  const labels: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    TARJETA: 'Tarjeta',
    TRANSFERENCIA: 'Transferencia',
    MIXTO: 'Mixto',
    sinFP: 'Sin FP',
  };
  return labels[forma] || forma;
};

const generarTextoReporteComandasPagadas = (comandas: VentaWebWithDetails[]): string => {
  const fecha = new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // Agrupar por forma de pago
  const grupos = new Map<string, VentaWebWithDetails[]>();
  for (const c of comandas) {
    const fp = c.formadepago || 'sinFP';
    if (!grupos.has(fp)) grupos.set(fp, []);
    grupos.get(fp)!.push(c);
  }

  const lineas: string[] = [
    'COMANDAS PAGADAS DEL TURNO',
    `Fecha: ${fecha}`,
    `Total comandas: ${comandas.length}`,
    '',
  ];

  const grandTotal = comandas.reduce((s, c) => s + Number(c.totaldeventa || 0), 0);

  for (const [fp, items] of grupos) {
    const grupoTotal = items.reduce((s, c) => s + Number(c.totaldeventa || 0), 0);
    lineas.push(`── ${getLabelFormaPagoReporte(fp).toUpperCase()} ──`);
    lineas.push(`${'Hora'.padEnd(6)} ${'Comanda'.padEnd(8)} ${'Cliente'.padEnd(16)} ${'Total'.padStart(10)}`);
    lineas.push('-'.repeat(44));
    for (const c of items) {
      const hora = formatHoraReporte(c.fechadeventa).padEnd(6);
      const folio = `#${getShortFolio(c.tipodeventa, c.idventa)}`.padEnd(8);
      const cliente = (c.cliente || '—').substring(0, 16).padEnd(16);
      const total = formatMonedaReporte(c.totaldeventa).padStart(10);
      lineas.push(`${hora} ${folio} ${cliente} ${total}`);
      if (fp === 'TRANSFERENCIA' && c.referencia) {
        lineas.push(`  Ref: ${c.referencia}`);
      }
    }
    lineas.push('-'.repeat(44));
    lineas.push(`Total ${getLabelFormaPagoReporte(fp)}: ${formatMonedaReporte(grupoTotal)}`);
    lineas.push('');
  }

  lineas.push('='.repeat(44));
  lineas.push(`GRAN TOTAL: ${formatMonedaReporte(grandTotal)}`);

  return lineas.join('\n');
};

const generarHtmlReporteComandasPagadas = (comandas: VentaWebWithDetails[]): string => {
  const fecha = new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const grupos = new Map<string, VentaWebWithDetails[]>();
  for (const c of comandas) {
    const fp = c.formadepago || 'sinFP';
    if (!grupos.has(fp)) grupos.set(fp, []);
    grupos.get(fp)!.push(c);
  }

  const grandTotal = comandas.reduce((s, c) => s + Number(c.totaldeventa || 0), 0);

  let cuerpo = '';
  for (const [fp, items] of grupos) {
    const grupoTotal = items.reduce((s, c) => s + Number(c.totaldeventa || 0), 0);
    cuerpo += `<div class="grupo-header">${escapeHtml(getLabelFormaPagoReporte(fp).toUpperCase())}</div>`;
    cuerpo += '<table><thead><tr><th>Hora</th><th>Comanda</th><th>Cliente</th><th>Total</th></tr></thead><tbody>';
    for (const c of items) {
      const hora = escapeHtml(formatHoraReporte(c.fechadeventa));
      const folio = escapeHtml(`#${getShortFolio(c.tipodeventa, c.idventa)}`);
      const cliente = escapeHtml(c.cliente || '—');
      const total = escapeHtml(formatMonedaReporte(c.totaldeventa));
      cuerpo += `<tr><td>${hora}</td><td>${folio}</td><td>${cliente}</td><td>${total}</td></tr>`;
      if (fp === 'TRANSFERENCIA' && c.referencia) {
        cuerpo += `<tr class="ref-row"><td colspan="4">Ref: ${escapeHtml(c.referencia)}</td></tr>`;
      }
    }
    cuerpo += '</tbody></table>';
    cuerpo += `<div class="grupo-total">Total ${escapeHtml(getLabelFormaPagoReporte(fp))}: <strong>${escapeHtml(formatMonedaReporte(grupoTotal))}</strong></div>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Comandas Pagadas del Turno</title>
  <style>
    body { font-family: 'Courier New', Courier, monospace; font-size: 11px; width: 58mm; margin: 0; padding: 6px; }
    h1 { font-size: 12px; text-align: center; margin: 0 0 4px; }
    .fecha { font-size: 10px; text-align: center; color: #666; margin-bottom: 8px; }
    .grupo-header { font-weight: bold; font-size: 11px; background: #f0f0f0; padding: 2px 4px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 2px; }
    th { font-size: 9px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding: 1px 2px; text-align: left; }
    td { font-size: 10px; padding: 1px 2px; vertical-align: top; }
    .ref-row td { font-size: 9px; color: #666; padding-left: 8px; }
    .grupo-total { font-size: 10px; text-align: right; border-top: 1px solid #ccc; padding-top: 2px; margin-bottom: 4px; }
    .gran-total { font-size: 12px; font-weight: bold; text-align: right; border-top: 2px solid #000; padding-top: 4px; margin-top: 8px; }
    @media print { html, body { width: 58mm; } @page { size: 58mm auto; margin: 0; } }
  </style>
</head>
<body>
  <h1>COMANDAS PAGADAS DEL TURNO</h1>
  <div class="fecha">${escapeHtml(fecha)}</div>
  ${cuerpo}
  <div class="gran-total">GRAN TOTAL: ${escapeHtml(formatMonedaReporte(grandTotal))}</div>
</body>
</html>`;
};

const TableroComandasPagadas = ({ onVolver }: Props) => {
  const [comandas, setComandas] = useState<VentaWebWithDetails[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');
  const [comandaDetalle, setComandaDetalle] = useState<VentaWebWithDetails | null>(null);
  const [showReporteModal, setShowReporteModal] = useState(false);
  const whatsappTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (whatsappTimeoutRef.current !== null) {
        clearTimeout(whatsappTimeoutRef.current);
        setSkipBeforeUnload(false);
      }
    };
  }, []);

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

  const handleImprimirReporte = () => {
    const html = generarHtmlReporteComandasPagadas(comandas);
    const popup = window.open('', '_blank', PRINT_POPUP_WINDOW_FEATURES);
    if (!popup) return;
    popup.document.write(html);
    popup.document.close();
    setTimeout(() => {
      popup.print();
    }, PRINT_WINDOW_READY_DELAY_MS);
    setShowReporteModal(false);
  };

  const handleWhatsAppReporte = () => {
    const texto = generarTextoReporteComandasPagadas(comandas);
    const encoded = encodeURIComponent(texto);
    setSkipBeforeUnload(true);
    window.location.href = `whatsapp://send?text=${encoded}`;
    if (whatsappTimeoutRef.current !== null) {
      clearTimeout(whatsappTimeoutRef.current);
    }
    whatsappTimeoutRef.current = setTimeout(() => {
      setSkipBeforeUnload(false);
      whatsappTimeoutRef.current = null;
    }, WHATSAPP_NAVIGATION_DELAY_MS);
    setShowReporteModal(false);
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

        {/* Botón Reporte */}
        {!cargando && !error && comandas.length > 0 && (
          <button
            className="tcp-btn-reporte"
            onClick={() => setShowReporteModal(true)}
            title="Ver opciones de reporte"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Reporte
          </button>
        )}
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
                  <td className="tcp-folio">#{getShortFolio(venta.tipodeventa, venta.idventa)}</td>
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

      {/* Modal Reporte */}
      {showReporteModal && (
        <div className="tcp-modal-overlay" onClick={() => setShowReporteModal(false)}>
          <div className="tcp-modal-card tcp-reporte-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tcp-modal-header">
              <h3>Reporte Comandas Pagadas</h3>
            </div>
            <p className="tcp-reporte-desc">
              Selecciona cómo deseas obtener el reporte de comandas pagadas del turno, agrupadas por forma de pago.
            </p>
            <div className="tcp-reporte-botones">
              <button className="tcp-btn-reporte-imprimir" onClick={handleImprimirReporte}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Imprimir
              </button>
              <button className="tcp-btn-reporte-whatsapp" onClick={handleWhatsAppReporte}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Enviar por WhatsApp
              </button>
              <button className="tcp-btn-reporte-listo" onClick={() => setShowReporteModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {comandaDetalle && (
        <div className="tcp-modal-overlay">
          <div className="tcp-modal-card">
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
                <span>#{getShortFolio(comandaDetalle.tipodeventa, comandaDetalle.idventa)}</span>
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
              {comandaDetalle.formadepago === 'TRANSFERENCIA' && comandaDetalle.referencia && (
                <div className="tcp-modal-info-row">
                  <span className="tcp-modal-label">Referencia:</span>
                  <span>{comandaDetalle.referencia}</span>
                </div>
              )}
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
