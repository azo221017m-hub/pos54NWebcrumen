import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptCard from '../../../components/common/ReceiptCard/ReceiptCard';
import type { ReceiptLine, ReceiptStatus } from '../../../components/common/ReceiptCard/ReceiptCard';
import {
  obtenerSaludNegocio,
  obtenerGastosDescuentos,
  obtenerSugerenciaCompra,
  type SaludNegocioData,
  type GastosDescuentosData,
  type SugerenciaCompraData,
} from '../../../services/reportesDashboard.service';
import './SaludNegocio.css';

const mxFmt = (v: number) =>
  `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

type ReporteTab = 'estado' | 'punto-equilibrio' | 'gastos-descuentos' | 'sugerencia-compra';
type ViewMode = 'dashboard' | 'ticket';

export const SaludNegocio: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReporteTab>('estado');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [fechaInicio, setFechaInicio] = useState(firstOfMonth());
  const [fechaFin, setFechaFin] = useState(today());

  const [salud, setSalud] = useState<SaludNegocioData | null>(null);
  const [gastosDesc, setGastosDesc] = useState<GastosDescuentosData | null>(null);
  const [sugerencia, setSugerencia] = useState<SugerenciaCompraData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const negocioNombre = JSON.parse(localStorage.getItem('negocio') || '{}')?.nombreNegocio || 'MI NEGOCIO POS';
  const negocioDireccion = JSON.parse(localStorage.getItem('negocio') || '{}')?.direccionfiscalnegocio;

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'estado' || tab === 'punto-equilibrio') {
        setSalud(await obtenerSaludNegocio(fechaInicio, fechaFin));
      } else if (tab === 'gastos-descuentos') {
        setGastosDesc(await obtenerGastosDescuentos(fechaInicio, fechaFin));
      } else if (tab === 'sugerencia-compra') {
        setSugerencia(await obtenerSugerenciaCompra());
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [tab, fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = (texto: string) => {
    window.open(`whatsapp://send?text=${encodeURIComponent(texto)}`, '_blank');
  };

  // ── Construir lines para ReceiptCard ──────────────────────────────────────

  const buildEstadoLines = (d: SaludNegocioData): ReceiptLine[] => [
    { label: 'Ventas totales', value: mxFmt(d.ventas_totales), bold: true },
    { label: 'Costo de ventas', value: mxFmt(d.costo_ventas), dim: true },
    { label: 'Utilidad bruta', value: mxFmt(d.utilidad_bruta) },
    { separator: true, label: '' },
    { label: 'Gastos operativos', value: mxFmt(d.gastos_operativos) },
    { label: 'Descuentos otorg.', value: mxFmt(d.descuentos_totales) },
    { label: 'Compras del periodo', value: mxFmt(d.compras_totales) },
  ];

  const buildEstadoTotals = (d: SaludNegocioData): ReceiptLine[] => [
    { label: 'Utilidad neta', value: mxFmt(d.utilidad_neta), bold: true },
  ];

  const buildSaludStatus = (d: SaludNegocioData): ReceiptStatus => ({
    label: d.semaforo === 'UTILIDAD' ? 'CON UTILIDAD' : d.semaforo === 'EQUILIBRIO' ? 'EN EQUILIBRIO' : 'CON PÉRDIDA',
    variant: d.semaforo === 'UTILIDAD' ? 'success' : d.semaforo === 'EQUILIBRIO' ? 'info' : 'danger',
  });

  const buildPELines = (d: SaludNegocioData): ReceiptLine[] => [
    { label: 'Gastos totales', value: mxFmt(d.gastos_operativos) },
    { label: 'Margen contrib.', value: `${d.margen_contribucion.toFixed(1)}%` },
    { separator: true, label: '' },
    { label: 'Punto de equilibrio', value: mxFmt(d.punto_equilibrio_monto), bold: true },
    { label: 'Tickets necesarios', value: `${d.punto_equilibrio_tickets} tickets`, bold: true },
    { label: 'Ticket promedio', value: mxFmt(d.ticket_promedio), dim: true },
    { separator: true, label: '' },
    { label: 'Ventas actuales', value: mxFmt(d.ventas_totales) },
    { label: 'Diferencia vs PE', value: mxFmt(d.ventas_totales - d.punto_equilibrio_monto) },
  ];

  const buildSugerenciaLines = (d: SugerenciaCompraData): ReceiptLine[] => {
    const lines: ReceiptLine[] = [];
    d.items.forEach(item => {
      lines.push({ label: item.nombre, value: `${item.cantidad_sugerida} ${item.unidad_medida}`, bold: true });
      lines.push({ label: `  Stk: ${item.stock_actual} / Mín: ${item.stock_minimo}`, dim: true, fullRow: false, indent: true });
      if (item.proveedor_habitual) lines.push({ label: `  Prov: ${item.proveedor_habitual}`, dim: true, fullRow: false, indent: true });
      if (item.ultima_compra) lines.push({ label: `  Últ. compra: ${item.ultima_compra}`, dim: true, fullRow: false, indent: true });
      lines.push({ separator: true, label: '' });
    });
    return lines;
  };

  const periodoStr = `${fechaInicio} al ${fechaFin}`;
  const generadoStr = new Date().toLocaleString('es-MX');

  return (
    <div className="salud-page reportes-page">
      {/* Cabecera */}
      <div className="reportes-header">
        <button className="reportes-back-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </button>
        <div className="reportes-header-title">
          <h1>Salud del Negocio</h1>
          <p>Análisis financiero y punto de equilibrio</p>
        </div>
        <div className="reportes-view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => setViewMode('dashboard')}
          >Dashboard</button>
          <button
            className={`view-toggle-btn ${viewMode === 'ticket' ? 'active' : ''}`}
            onClick={() => setViewMode('ticket')}
          >Ticket</button>
        </div>
      </div>

      {/* Filtros de fecha */}
      {tab !== 'sugerencia-compra' && (
        <div className="reportes-filters">
          <label>
            Desde
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
          </label>
          <label>
            Hasta
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </label>
          <button className="reportes-filter-btn" onClick={cargar}>Consultar</button>
        </div>
      )}

      {/* Tabs */}
      <div className="reportes-tabs">
        {([
          ['estado', 'Estado de Salud'],
          ['punto-equilibrio', 'Punto de Equilibrio'],
          ['gastos-descuentos', 'Gastos y Descuentos'],
          ['sugerencia-compra', 'Sugerencia de Compra'],
        ] as [ReporteTab, string][]).map(([t, label]) => (
          <button
            key={t}
            className={`reportes-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >{label}</button>
        ))}
      </div>

      {/* Contenido */}
      <div className="reportes-content">
        {loading && <div className="reportes-loading">Cargando...</div>}
        {error && <div className="reportes-error">{error}</div>}

        {!loading && !error && (
          <>
            {/* ─── Estado de Salud ─── */}
            {tab === 'estado' && salud && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <span>Ventas Totales</span>
                    <strong>{mxFmt(salud.ventas_totales)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Costo de Ventas</span>
                    <strong>{mxFmt(salud.costo_ventas)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Utilidad Bruta</span>
                    <strong className={salud.utilidad_bruta >= 0 ? 'positive' : 'negative'}>{mxFmt(salud.utilidad_bruta)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Gastos Operativos</span>
                    <strong>{mxFmt(salud.gastos_operativos)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Descuentos Otorgados</span>
                    <strong>{mxFmt(salud.descuentos_totales)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Compras del Periodo</span>
                    <strong>{mxFmt(salud.compras_totales)}</strong>
                  </div>
                  <div className={`kpi-card kpi-card-highlight kpi-semaforo-${salud.semaforo.toLowerCase()}`}>
                    <span>Utilidad Neta</span>
                    <strong>{mxFmt(salud.utilidad_neta)}</strong>
                    <div className="kpi-badge">{salud.semaforo === 'UTILIDAD' ? 'CON UTILIDAD' : salud.semaforo === 'EQUILIBRIO' ? 'EN EQUILIBRIO' : 'CON PÉRDIDA'}</div>
                  </div>
                </div>
                <div className="salud-bar-container">
                  <div className="salud-bar-label">Margen de Contribución</div>
                  <div className="salud-bar-track">
                    <div
                      className="salud-bar-fill"
                      style={{ width: `${Math.min(100, salud.margen_contribucion)}%` }}
                    />
                  </div>
                  <div className="salud-bar-value">{salud.margen_contribucion.toFixed(1)}%</div>
                </div>
              </div>
            )}

            {tab === 'estado' && salud && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="ESTADO DE SALUD"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={buildEstadoLines(salud)}
                  totals={buildEstadoTotals(salud)}
                  status={buildSaludStatus(salud)}
                  footer="Ventas - Costos - Gastos Operativos"
                  onPrint={handlePrint}
                />
              </div>
            )}

            {/* ─── Punto de Equilibrio ─── */}
            {tab === 'punto-equilibrio' && salud && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <span>Punto de Equilibrio</span>
                    <strong>{mxFmt(salud.punto_equilibrio_monto)}</strong>
                    <small>Monto mínimo de ventas</small>
                  </div>
                  <div className="kpi-card">
                    <span>Tickets Necesarios</span>
                    <strong>{salud.punto_equilibrio_tickets}</strong>
                    <small>Para cubrir gastos</small>
                  </div>
                  <div className="kpi-card">
                    <span>Ticket Promedio</span>
                    <strong>{mxFmt(salud.ticket_promedio)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Margen de Contribución</span>
                    <strong>{salud.margen_contribucion.toFixed(1)}%</strong>
                    <small>(Ventas - Costo) / Ventas</small>
                  </div>
                  <div className="kpi-card">
                    <span>Costos Fijos (Gastos)</span>
                    <strong>{mxFmt(salud.gastos_operativos)}</strong>
                  </div>
                  <div className={`kpi-card kpi-card-highlight ${salud.ventas_totales >= salud.punto_equilibrio_monto ? 'kpi-semaforo-utilidad' : 'kpi-semaforo-perdida'}`}>
                    <span>Ventas Actuales vs PE</span>
                    <strong>{mxFmt(salud.ventas_totales - salud.punto_equilibrio_monto)}</strong>
                    <div className="kpi-badge">{salud.ventas_totales >= salud.punto_equilibrio_monto ? 'SOBRE EL PE' : 'BAJO EL PE'}</div>
                  </div>
                </div>
                <div className="pe-formula-box">
                  <p>PE = Gastos Totales / Margen de Contribución</p>
                  <p>PE = {mxFmt(salud.gastos_operativos)} / {(salud.margen_contribucion / 100).toFixed(4)} = {mxFmt(salud.punto_equilibrio_monto)}</p>
                </div>
              </div>
            )}

            {tab === 'punto-equilibrio' && salud && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="PUNTO DE EQUILIBRIO"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={buildPELines(salud)}
                  status={{
                    label: salud.ventas_totales >= salud.punto_equilibrio_monto ? 'SOBRE EL PUNTO DE EQUILIBRIO' : 'BAJO EL PUNTO DE EQUILIBRIO',
                    variant: salud.ventas_totales >= salud.punto_equilibrio_monto ? 'success' : 'danger',
                  }}
                  footer="PE = Gastos / Margen de Contribución"
                  onPrint={handlePrint}
                />
              </div>
            )}

            {/* ─── Gastos y Descuentos ─── */}
            {tab === 'gastos-descuentos' && gastosDesc && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <span>Total Gastos</span>
                    <strong>{mxFmt(gastosDesc.total_gastos)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Total Descuentos</span>
                    <strong>{mxFmt(gastosDesc.total_descuentos)}</strong>
                  </div>
                </div>
                <div className="reportes-two-col">
                  <div className="reportes-table-section">
                    <h3>Gastos por Categoría</h3>
                    <table className="reportes-table">
                      <thead><tr><th>Categoría</th><th>Operaciones</th><th>Total</th></tr></thead>
                      <tbody>
                        {gastosDesc.gastos_por_categoria.map((g, i) => (
                          <tr key={i}>
                            <td>{g.categoria}</td>
                            <td className="text-center">{g.cantidad}</td>
                            <td className="text-right">{mxFmt(g.total)}</td>
                          </tr>
                        ))}
                        {gastosDesc.gastos_por_categoria.length === 0 && (
                          <tr><td colSpan={3} className="text-center empty">Sin gastos en el periodo</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="reportes-table-section">
                    <h3>Descuentos Otorgados</h3>
                    <table className="reportes-table">
                      <thead><tr><th>Descuento</th><th>Colaborador</th><th>Ops.</th><th>Monto</th></tr></thead>
                      <tbody>
                        {gastosDesc.descuentos_por_nombre.map((d, i) => (
                          <tr key={i}>
                            <td>{d.nombre}</td>
                            <td>{d.colaborador}</td>
                            <td className="text-center">{d.operaciones}</td>
                            <td className="text-right">{mxFmt(d.monto)}</td>
                          </tr>
                        ))}
                        {gastosDesc.descuentos_por_nombre.length === 0 && (
                          <tr><td colSpan={4} className="text-center empty">Sin descuentos en el periodo</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'gastos-descuentos' && gastosDesc && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="GASTOS Y DESCUENTOS"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={[
                    { label: 'GASTOS POR CATEGORÍA', fullRow: true, bold: true },
                    { separator: true, label: '' },
                    ...gastosDesc.gastos_por_categoria.map(g => ({
                      label: g.categoria,
                      value: mxFmt(g.total),
                    })),
                    { separator: true, label: '' },
                    { label: 'DESCUENTOS OTORGADOS', fullRow: true, bold: true },
                    { separator: true, label: '' },
                    ...gastosDesc.descuentos_por_nombre.map(d => ({
                      label: `${d.nombre} / ${d.colaborador}`,
                      value: mxFmt(d.monto),
                    })),
                  ]}
                  totals={[
                    { label: 'Total gastos', value: mxFmt(gastosDesc.total_gastos) },
                    { label: 'Total descuentos', value: mxFmt(gastosDesc.total_descuentos) },
                  ]}
                  onPrint={handlePrint}
                />
              </div>
            )}

            {/* ─── Sugerencia de Compra ─── */}
            {tab === 'sugerencia-compra' && sugerencia && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <span>Productos a Reponer</span>
                    <strong>{sugerencia.items.length}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Costo Estimado</span>
                    <strong>{mxFmt(sugerencia.total_estimado)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Críticos</span>
                    <strong className="negative">{sugerencia.items.filter(i => i.urgencia === 'CRITICA').length}</strong>
                  </div>
                </div>
                <table className="reportes-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock / Mín</th>
                      <th>Sugerido</th>
                      <th>Proveedor</th>
                      <th>Últ. compra</th>
                      <th>Urgencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sugerencia.items.map((item, i) => (
                      <tr key={i} className={`urgencia-${item.urgencia.toLowerCase()}`}>
                        <td>{item.nombre}</td>
                        <td className="text-center">{item.stock_actual} / {item.stock_minimo} {item.unidad_medida}</td>
                        <td className="text-center bold">{item.cantidad_sugerida} {item.unidad_medida}</td>
                        <td>{item.proveedor_habitual || '—'}</td>
                        <td>{item.ultima_compra || '—'}</td>
                        <td><span className={`badge badge-${item.urgencia.toLowerCase()}`}>{item.urgencia}</span></td>
                      </tr>
                    ))}
                    {sugerencia.items.length === 0 && (
                      <tr><td colSpan={6} className="text-center empty">Todos los insumos están sobre el mínimo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'sugerencia-compra' && sugerencia && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="SUGERENCIA DE COMPRA"
                  generatedAt={generadoStr}
                  lines={[
                    { label: 'Producto / Sugerido / Prov.', fullRow: true, dim: true },
                    { separator: true, label: '' },
                    ...buildSugerenciaLines(sugerencia),
                  ]}
                  totals={[
                    { label: 'Productos sugeridos', value: `${sugerencia.items.length}` },
                    { label: 'Costo estimado', value: mxFmt(sugerencia.total_estimado) },
                  ]}
                  footer="Basado en stock mínimo y frecuencia de compras previas"
                  onPrint={handlePrint}
                  onWhatsApp={() => {
                    const texto = sugerencia.items
                      .map(i => `${i.nombre}: ${i.cantidad_sugerida} ${i.unidad_medida} (Prov: ${i.proveedor_habitual || 'N/A'})`)
                      .join('\n');
                    handleWhatsApp(`SUGERENCIA DE COMPRA\n${new Date().toLocaleDateString('es-MX')}\n\n${texto}\n\nTotal estimado: ${mxFmt(sugerencia.total_estimado)}`);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SaludNegocio;
