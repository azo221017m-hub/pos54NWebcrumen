import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptCard from '../../../components/common/ReceiptCard/ReceiptCard';
import type { ReceiptLine } from '../../../components/common/ReceiptCard/ReceiptCard';
import {
  obtenerVentasHoy,
  obtenerVentasPorTurno,
  obtenerTopProductos,
  obtenerVentasMensual,
  type VentasHoyData,
  type VentasTurnoItem,
  type TopProducto,
  type VentasMensual,
} from '../../../services/reportesDashboard.service';
import '../SaludNegocio/SaludNegocio.css';
import './VentasReportes.css';

const mxFmt = (v: number) =>
  `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};
const currentYear = () => new Date().getFullYear().toString();

type ReporteTab = 'hoy' | 'por-turno' | 'top-productos' | 'mensual';
type ViewMode = 'dashboard' | 'ticket';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// Calcula el porcentaje de logro. logrometa ya viene precalculado del backend.
const logroPct = (t: VentasTurnoItem): number => t.logrometa ?? (t.metaturno ? (t.total_ventas / t.metaturno) * 100 : 0);

export const VentasReportes: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReporteTab>('hoy');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [fechaInicio, setFechaInicio] = useState(firstOfMonth());
  const [fechaFin, setFechaFin] = useState(today());
  const [anio, setAnio] = useState(currentYear());
  const [topLimit, setTopLimit] = useState('10');

  const [ventasHoy, setVentasHoy] = useState<VentasHoyData | null>(null);
  const [turnosData, setTurnosData] = useState<VentasTurnoItem[] | null>(null);
  const [topProductos, setTopProductos] = useState<TopProducto[] | null>(null);
  const [mensual, setMensual] = useState<VentasMensual[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const negocioNombre = JSON.parse(localStorage.getItem('negocio') || '{}')?.nombreNegocio || 'MI NEGOCIO POS';
  const negocioDireccion = JSON.parse(localStorage.getItem('negocio') || '{}')?.direccionfiscalnegocio;

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'hoy') setVentasHoy(await obtenerVentasHoy());
      else if (tab === 'por-turno') setTurnosData(await obtenerVentasPorTurno(fechaInicio, fechaFin));
      else if (tab === 'top-productos') setTopProductos(await obtenerTopProductos(fechaInicio, fechaFin, parseInt(topLimit)));
      else if (tab === 'mensual') setMensual(await obtenerVentasMensual(parseInt(anio)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [tab, fechaInicio, fechaFin, topLimit, anio]);

  useEffect(() => { cargar(); }, [cargar]);

  const generadoStr = new Date().toLocaleString('es-MX');
  const periodoStr = `${fechaInicio} al ${fechaFin}`;

  // VentasHoyData usa total_cobrado y periodo_anterior (puede ser null)
  const buildHoyLines = (d: VentasHoyData): ReceiptLine[] => [
    { label: 'Total cobrado', value: mxFmt(d.total_cobrado), bold: true },
    { label: 'Tickets vendidos', value: `${d.total_tickets}` },
    { label: 'Ticket promedio', value: mxFmt(d.ticket_promedio) },
    { label: 'Descuentos', value: mxFmt(d.total_descuentos), dim: true },
    { separator: true, label: '' },
    { label: 'FORMAS DE PAGO', fullRow: true, bold: true },
    // por_forma_pago: { formadepago, total, cantidad }
    ...d.por_forma_pago.map(fp => ({ label: fp.formadepago, value: mxFmt(fp.total) })),
    ...(d.periodo_anterior ? [
      { separator: true, label: '' },
      { label: 'vs Día anterior', value: mxFmt(d.periodo_anterior.total), dim: true },
      { label: 'Variación', value: `${d.periodo_anterior.variacion_pct >= 0 ? '+' : ''}${d.periodo_anterior.variacion_pct.toFixed(1)}%`, bold: true },
    ] : []),
  ];

  return (
    <div className="ventas-page reportes-page">
      <div className="reportes-header">
        <button className="reportes-back-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </button>
        <div className="reportes-header-title">
          <h1>Ventas</h1>
          <p>Ventas del día, por turno, top productos y mensual</p>
        </div>
        <div className="reportes-view-toggle">
          <button className={`view-toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`} onClick={() => setViewMode('dashboard')}>Dashboard</button>
          <button className={`view-toggle-btn ${viewMode === 'ticket' ? 'active' : ''}`} onClick={() => setViewMode('ticket')}>Ticket</button>
        </div>
      </div>

      {(tab === 'por-turno' || tab === 'top-productos') && (
        <div className="reportes-filters">
          <label>Desde <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></label>
          <label>Hasta <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></label>
          {tab === 'top-productos' && (
            <label>Top <select value={topLimit} onChange={e => setTopLimit(e.target.value)} className="reportes-select">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select></label>
          )}
          <button className="reportes-filter-btn" onClick={cargar}>Consultar</button>
        </div>
      )}

      {tab === 'mensual' && (
        <div className="reportes-filters">
          <label>Año <input type="number" value={anio} onChange={e => setAnio(e.target.value)} min="2020" max="2100" className="reportes-anio-input" /></label>
          <button className="reportes-filter-btn" onClick={cargar}>Consultar</button>
        </div>
      )}

      <div className="reportes-tabs">
        {([
          ['hoy', 'Ventas del Día'],
          ['por-turno', 'Por Turno'],
          ['top-productos', 'Top Productos'],
          ['mensual', 'Mensual/Anual'],
        ] as [ReporteTab, string][]).map(([t, label]) => (
          <button key={t} className={`reportes-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      <div className="reportes-content">
        {loading && <div className="reportes-loading">Cargando...</div>}
        {error && <div className="reportes-error">{error}</div>}

        {!loading && !error && (
          <>
            {/* ─── Ventas del Día ─── */}
            {tab === 'hoy' && ventasHoy && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card kpi-card-highlight kpi-semaforo-utilidad">
                    <span>Ventas Hoy</span>
                    {/* total_cobrado = monto cobrado del día */}
                    <strong>{mxFmt(ventasHoy.total_cobrado)}</strong>
                    {ventasHoy.periodo_anterior && (
                      <div className="kpi-badge">
                        {ventasHoy.periodo_anterior.variacion_pct >= 0 ? '▲' : '▼'}
                        {Math.abs(ventasHoy.periodo_anterior.variacion_pct).toFixed(1)}% vs ayer
                      </div>
                    )}
                  </div>
                  <div className="kpi-card">
                    <span>Tickets</span>
                    <strong>{ventasHoy.total_tickets}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Ticket Promedio</span>
                    <strong>{mxFmt(ventasHoy.ticket_promedio)}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Descuentos</span>
                    <strong className="negative">{mxFmt(ventasHoy.total_descuentos)}</strong>
                  </div>
                </div>

                <div className="reportes-two-col">
                  <div className="reportes-table-section">
                    <h3>Por Forma de Pago</h3>
                    <table className="reportes-table">
                      {/* formadepago, total, cantidad según VentasHoyData */}
                      <thead><tr><th>Forma de Pago</th><th>Monto</th><th>Cant.</th></tr></thead>
                      <tbody>
                        {ventasHoy.por_forma_pago.map((fp, i) => (
                          <tr key={i}>
                            <td>{fp.formadepago}</td>
                            <td className="text-right">{mxFmt(fp.total)}</td>
                            <td className="text-right">{fp.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="reportes-table-section">
                    <h3>Por Turno</h3>
                    <table className="reportes-table">
                      {/* por_turno: claveturno, usuarioturno, total */}
                      <thead><tr><th>Turno</th><th>Responsable</th><th>Ventas</th></tr></thead>
                      <tbody>
                        {ventasHoy.por_turno.map((t, i) => (
                          <tr key={i}>
                            <td>{t.claveturno}</td>
                            <td>{t.usuarioturno || '—'}</td>
                            <td className="text-right">{mxFmt(t.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'hoy' && ventasHoy && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="VENTAS DEL DÍA"
                  generatedAt={generadoStr}
                  lines={buildHoyLines(ventasHoy)}
                  totals={[{ label: 'TOTAL HOY', value: mxFmt(ventasHoy.total_cobrado), bold: true }]}
                  status={ventasHoy.periodo_anterior
                    ? ventasHoy.periodo_anterior.variacion_pct >= 0
                      ? { label: `▲ ${ventasHoy.periodo_anterior.variacion_pct.toFixed(1)}% SOBRE AYER`, variant: 'success' }
                      : { label: `▼ ${Math.abs(ventasHoy.periodo_anterior.variacion_pct).toFixed(1)}% BAJO AYER`, variant: 'warning' }
                    : undefined
                  }
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── Por Turno ─── */}
            {tab === 'por-turno' && turnosData && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <span>Turnos en Periodo</span>
                    <strong>{turnosData.length}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Total Ventas</span>
                    <strong>{mxFmt(turnosData.reduce((s, t) => s + t.total_ventas, 0))}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Turnos con Meta Lograda</span>
                    <strong className="positive">{turnosData.filter(t => t.semaforo === 'SUPERO' || t.semaforo === 'CUMPLIO').length}</strong>
                  </div>
                </div>
                <table className="reportes-table">
                  {/* VentasTurnoItem: claveturno, usuarioturno, fechainicioturno, total_ventas, metaturno, logrometa, semaforo */}
                  <thead>
                    <tr><th>Turno</th><th>Fecha</th><th>Responsable</th><th>Meta</th><th>Ventas</th><th>Logro</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {turnosData.map((t, i) => {
                      const pct = logroPct(t);
                      return (
                        <tr key={i}>
                          <td>{t.claveturno}</td>
                          <td>{t.fechainicioturno?.split('T')[0] ?? '—'}</td>
                          <td>{t.usuarioturno || '—'}</td>
                          <td className="text-right">{t.metaturno ? mxFmt(t.metaturno) : '—'}</td>
                          <td className="text-right bold">{mxFmt(t.total_ventas)}</td>
                          <td className={`text-right ${pct >= 100 ? 'positive' : 'negative'}`}>{pct.toFixed(1)}%</td>
                          <td><span className={`badge badge-turno-${(t.semaforo ?? 'sin_meta').toLowerCase()}`}>{t.semaforo ?? 'SIN META'}</span></td>
                        </tr>
                      );
                    })}
                    {turnosData.length === 0 && (
                      <tr><td colSpan={7} className="text-center empty">Sin turnos en el periodo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'por-turno' && turnosData && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="VENTAS POR TURNO"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={[
                    { label: 'Turno / Responsable', value: 'Ventas', bold: true },
                    { separator: true, label: '' },
                    ...turnosData.flatMap(t => [
                      { label: `${t.claveturno} ${t.usuarioturno || ''}`, value: mxFmt(t.total_ventas) },
                      { label: `  Logro: ${logroPct(t).toFixed(1)}%`, dim: true, indent: true },
                    ]),
                  ]}
                  totals={[{ label: 'Total periodo', value: mxFmt(turnosData.reduce((s, t) => s + t.total_ventas, 0)), bold: true }]}
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── Top Productos ─── */}
            {tab === 'top-productos' && topProductos && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    {/* TopProducto: nombreproducto, cantidad_vendida, total_ventas */}
                    <span>Producto #1</span>
                    <strong>{topProductos[0]?.nombreproducto || '—'}</strong>
                    <small>{topProductos[0] ? mxFmt(topProductos[0].total_ventas) : ''}</small>
                  </div>
                  <div className="kpi-card">
                    <span>Total Productos</span>
                    <strong>{topProductos.length}</strong>
                  </div>
                </div>
                <table className="reportes-table">
                  <thead>
                    <tr><th>#</th><th>Producto</th><th>Cantidad</th><th>Total Vendido</th><th>% del Total</th></tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const totalGlobal = topProductos.reduce((s, p) => s + p.total_ventas, 0);
                      return topProductos.map((p, i) => (
                        <tr key={i} className={i < 3 ? 'top-producto-row' : ''}>
                          <td className="text-center">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </td>
                          <td>{p.nombreproducto}</td>
                          <td className="text-right">{p.cantidad_vendida}</td>
                          <td className="text-right bold">{mxFmt(p.total_ventas)}</td>
                          <td className="text-right">
                            <div className="ventas-bar-mini">
                              <div className="ventas-bar-fill" style={{ width: `${totalGlobal > 0 ? (p.total_ventas / totalGlobal) * 100 : 0}%` }} />
                              <span>{totalGlobal > 0 ? ((p.total_ventas / totalGlobal) * 100).toFixed(1) : '0.0'}%</span>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'top-productos' && topProductos && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title={`TOP ${topLimit} PRODUCTOS`}
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={[
                    { label: '#  Producto', value: 'Total', bold: true },
                    { separator: true, label: '' },
                    ...topProductos.map((p, i) => ({
                      label: `${String(i + 1).padStart(2, ' ')}. ${p.nombreproducto.slice(0, 18)}`,
                      value: mxFmt(p.total_ventas),
                    })),
                  ]}
                  totals={[{ label: 'Total', value: mxFmt(topProductos.reduce((s, p) => s + p.total_ventas, 0)), bold: true }]}
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── Mensual/Anual ─── */}
            {tab === 'mensual' && mensual && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                {/* VentasMensual: mes, mes_nombre, total, tickets, ticket_promedio */}
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <span>Total Año {anio}</span>
                    <strong>{mxFmt(mensual.reduce((s, m) => s + m.total, 0))}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Mejor Mes</span>
                    <strong>{mensual.reduce((best, m) => m.total > best.total ? m : best, mensual[0])?.mes_nombre ?? '—'}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Meses con Ventas</span>
                    <strong>{mensual.filter(m => m.total > 0).length}</strong>
                  </div>
                </div>
                <div className="ventas-chart-bar">
                  {mensual.map((m, i) => {
                    const max = Math.max(...mensual.map(x => x.total));
                    const pct = max > 0 ? (m.total / max) * 100 : 0;
                    return (
                      <div key={i} className="ventas-chart-col">
                        <div className="ventas-chart-value">{m.total > 0 ? mxFmt(m.total) : ''}</div>
                        <div className="ventas-chart-bar-outer">
                          <div className="ventas-chart-bar-inner" style={{ height: `${pct}%` }} />
                        </div>
                        <div className="ventas-chart-label">{MESES[i] ?? m.mes_nombre.slice(0, 3)}</div>
                      </div>
                    );
                  })}
                </div>
                <table className="reportes-table">
                  <thead><tr><th>Mes</th><th>Ventas</th><th>Tickets</th><th>Ticket Prom.</th></tr></thead>
                  <tbody>
                    {mensual.map((m, i) => (
                      <tr key={i} className={m.total === 0 ? 'mes-sin-ventas' : ''}>
                        <td>{m.mes_nombre}</td>
                        <td className="text-right">{mxFmt(m.total)}</td>
                        <td className="text-right">{m.tickets}</td>
                        <td className="text-right">{m.tickets > 0 ? mxFmt(m.ticket_promedio) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'mensual' && mensual && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title={`VENTAS ${anio}`}
                  generatedAt={generadoStr}
                  lines={[
                    { label: 'Mes', value: 'Total', bold: true },
                    { separator: true, label: '' },
                    ...mensual.map(m => ({
                      label: m.mes_nombre,
                      value: m.total > 0 ? mxFmt(m.total) : '—',
                      dim: m.total === 0,
                    })),
                  ]}
                  totals={[{ label: `Total ${anio}`, value: mxFmt(mensual.reduce((s, m) => s + m.total, 0)), bold: true }]}
                  onPrint={() => window.print()}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VentasReportes;
