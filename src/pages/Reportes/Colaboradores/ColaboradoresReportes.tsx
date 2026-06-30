import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptCard from '../../../components/common/ReceiptCard/ReceiptCard';
import {
  obtenerRankingColaboradores,
  obtenerCumplimientoMeta,
  obtenerKpiColaboradores,
  type ColaboradorRanking,
  type ColaboradorMeta,
  type ColaboradorKpi,
} from '../../../services/reportesDashboard.service';
import '../SaludNegocio/SaludNegocio.css';
import './ColaboradoresReportes.css';

const mxFmt = (v: number) =>
  `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

type ReporteTab = 'ranking' | 'meta' | 'kpi';
type ViewMode = 'dashboard' | 'ticket';

export const ColaboradoresReportes: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReporteTab>('ranking');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [fechaInicio, setFechaInicio] = useState(firstOfMonth());
  const [fechaFin, setFechaFin] = useState(today());

  const [ranking, setRanking] = useState<ColaboradorRanking[] | null>(null);
  const [meta, setMeta] = useState<ColaboradorMeta[] | null>(null);
  const [kpi, setKpi] = useState<ColaboradorKpi[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const negocioNombre = JSON.parse(localStorage.getItem('negocio') || '{}')?.nombreNegocio || 'MI NEGOCIO POS';
  const negocioDireccion = JSON.parse(localStorage.getItem('negocio') || '{}')?.direccionfiscalnegocio;

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'ranking') setRanking(await obtenerRankingColaboradores(fechaInicio, fechaFin));
      else if (tab === 'meta') setMeta(await obtenerCumplimientoMeta(fechaInicio, fechaFin));
      else if (tab === 'kpi') setKpi(await obtenerKpiColaboradores(fechaInicio, fechaFin));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [tab, fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const generadoStr = new Date().toLocaleString('es-MX');
  const periodoStr = `${fechaInicio} al ${fechaFin}`;

  // ColaboradorMeta: colaborador, claveturno, fecha_turno, meta, venta_real, cumplimiento_pct, semaforo
  const semBadgeClass = (s: string) =>
    s === 'SUPERO' ? 'badge-col-supero'
    : s === 'CUMPLIO' ? 'badge-col-cumplio'
    : 'badge-col-no_cumplio';

  return (
    <div className="colaboradores-page reportes-page">
      <div className="reportes-header">
        <button className="reportes-back-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </button>
        <div className="reportes-header-title">
          <h1>Colaboradores</h1>
          <p>Ranking de ventas, cumplimiento de metas y KPIs</p>
        </div>
        <div className="reportes-view-toggle">
          <button className={`view-toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`} onClick={() => setViewMode('dashboard')}>Dashboard</button>
          <button className={`view-toggle-btn ${viewMode === 'ticket' ? 'active' : ''}`} onClick={() => setViewMode('ticket')}>Ticket</button>
        </div>
      </div>

      <div className="reportes-filters">
        <label>Desde <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></label>
        <label>Hasta <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></label>
        <button className="reportes-filter-btn" onClick={cargar}>Consultar</button>
      </div>

      <div className="reportes-tabs">
        {([
          ['ranking', 'Ranking Ventas'],
          ['meta', 'Cumplimiento Meta'],
          ['kpi', 'KPIs'],
        ] as [ReporteTab, string][]).map(([t, label]) => (
          <button key={t} className={`reportes-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      <div className="reportes-content">
        {loading && <div className="reportes-loading">Cargando...</div>}
        {error && <div className="reportes-error">{error}</div>}

        {!loading && !error && (
          <>
            {/* ─── Ranking ─── */}
            {/* ColaboradorRanking: colaborador, total_ventas, total_tickets, ticket_promedio, total_descuentos, posicion */}
            {tab === 'ranking' && ranking && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card kpi-card-highlight kpi-semaforo-utilidad">
                    <span>Líder del Periodo</span>
                    <strong>{ranking[0]?.colaborador || '—'}</strong>
                    <small>{ranking[0] ? mxFmt(ranking[0].total_ventas) : ''}</small>
                  </div>
                  <div className="kpi-card">
                    <span>Colaboradores Activos</span>
                    <strong>{ranking.length}</strong>
                  </div>
                  <div className="kpi-card">
                    <span>Total Vendido</span>
                    <strong>{mxFmt(ranking.reduce((s, r) => s + r.total_ventas, 0))}</strong>
                  </div>
                </div>

                <div className="col-ranking-list">
                  {ranking.map((r, i) => {
                    const total = ranking.reduce((s, x) => s + x.total_ventas, 0);
                    const pct = total > 0 ? (r.total_ventas / total) * 100 : 0;
                    return (
                      <div key={i} className={`col-ranking-item ${i < 3 ? 'col-top-3' : ''}`}>
                        <div className="col-ranking-pos">
                          {/* posicion es el campo correcto (no ranking) */}
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${r.posicion}`}
                        </div>
                        <div className="col-ranking-info">
                          <div className="col-ranking-name">{r.colaborador}</div>
                          <div className="col-ranking-bar-wrap">
                            <div className="col-ranking-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="col-ranking-sub">{r.total_tickets} tickets · Prom {mxFmt(r.ticket_promedio)}</div>
                        </div>
                        <div className="col-ranking-total">{mxFmt(r.total_ventas)}</div>
                      </div>
                    );
                  })}
                  {ranking.length === 0 && <div className="reportes-loading">Sin ventas en el periodo</div>}
                </div>
              </div>
            )}

            {tab === 'ranking' && ranking && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="RANKING DE VENTAS"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={[
                    { label: '#  Colaborador', value: 'Total', bold: true },
                    { separator: true, label: '' },
                    ...ranking.map(r => ({
                      label: `${String(r.posicion).padStart(2, ' ')}. ${r.colaborador.slice(0, 16)}`,
                      value: mxFmt(r.total_ventas),
                      bold: r.posicion === 1,
                    })),
                  ]}
                  totals={[{ label: 'Total periodo', value: mxFmt(ranking.reduce((s, r) => s + r.total_ventas, 0)), bold: true }]}
                  footer={`${ranking.length} colaboradores activos`}
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── Meta ─── */}
            {/* ColaboradorMeta: colaborador, claveturno, fecha_turno, meta, venta_real, cumplimiento_pct, semaforo */}
            {tab === 'meta' && meta && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card kpi-semaforo-utilidad">
                    <span>Superaron Meta</span>
                    <strong className="positive">{meta.filter(m => m.semaforo === 'SUPERO').length}</strong>
                  </div>
                  <div className="kpi-card kpi-semaforo-equilibrio">
                    <span>Cumplieron Meta</span>
                    <strong>{meta.filter(m => m.semaforo === 'CUMPLIO').length}</strong>
                  </div>
                  <div className="kpi-card kpi-semaforo-perdida">
                    <span>No Cumplieron</span>
                    <strong className="negative">{meta.filter(m => m.semaforo === 'NO_CUMPLIO').length}</strong>
                  </div>
                </div>
                <table className="reportes-table">
                  <thead>
                    <tr><th>Colaborador</th><th>Turno</th><th>Fecha</th><th>Meta</th><th>Venta Real</th><th>Cumplim.</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {meta.map((m, i) => (
                      <tr key={i}>
                        <td>{m.colaborador}</td>
                        <td>{m.claveturno}</td>
                        <td>{m.fecha_turno}</td>
                        <td className="text-right">{mxFmt(m.meta)}</td>
                        <td className="text-right bold">{mxFmt(m.venta_real)}</td>
                        <td className={`text-right ${m.cumplimiento_pct >= 100 ? 'positive' : 'negative'}`}>
                          {m.cumplimiento_pct.toFixed(1)}%
                        </td>
                        <td><span className={`badge ${semBadgeClass(m.semaforo)}`}>{m.semaforo}</span></td>
                      </tr>
                    ))}
                    {meta.length === 0 && (
                      <tr><td colSpan={7} className="text-center empty">Sin turnos con meta en el periodo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'meta' && meta && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="CUMPLIMIENTO DE METAS"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={[
                    { label: 'Colaborador / Turno', value: 'Logro', bold: true },
                    { separator: true, label: '' },
                    ...meta.map(m => ({
                      label: `${m.colaborador.slice(0, 14)} ${m.claveturno}`,
                      value: `${m.cumplimiento_pct.toFixed(1)}%`,
                      bold: m.cumplimiento_pct >= 100,
                    })),
                    { separator: true, label: '' },
                    { label: 'Superaron meta', value: `${meta.filter(m => m.semaforo === 'SUPERO').length}` },
                    { label: 'Cumplieron', value: `${meta.filter(m => m.semaforo === 'CUMPLIO').length}` },
                    { label: 'No cumplieron', value: `${meta.filter(m => m.semaforo === 'NO_CUMPLIO').length}` },
                  ]}
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── KPIs ─── */}
            {/* ColaboradorKpi: colaborador, total_ventas, total_tickets, ticket_promedio,
                total_descuentos, total_devoluciones, turnos_trabajados, monto_devoluciones */}
            {tab === 'kpi' && kpi && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <table className="reportes-table">
                  <thead>
                    <tr><th>Colaborador</th><th>Turnos</th><th>Total Ventas</th><th>Descuentos</th><th>Devoluciones</th><th>Ticket Prom.</th></tr>
                  </thead>
                  <tbody>
                    {kpi.map((k, i) => (
                      <tr key={i}>
                        <td>{k.colaborador}</td>
                        <td className="text-center">{k.turnos_trabajados}</td>
                        <td className="text-right bold">{mxFmt(k.total_ventas)}</td>
                        <td className="text-right">{mxFmt(k.total_descuentos)}</td>
                        <td className={`text-right ${k.total_devoluciones > 0 ? 'negative' : ''}`}>{k.total_devoluciones}</td>
                        <td className="text-right">{mxFmt(k.ticket_promedio)}</td>
                      </tr>
                    ))}
                    {kpi.length === 0 && (
                      <tr><td colSpan={6} className="text-center empty">Sin datos en el periodo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'kpi' && kpi && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="KPIs COLABORADORES"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={kpi.flatMap(k => [
                    { label: k.colaborador, fullRow: true, bold: true },
                    { label: '  Turnos trabajados', value: `${k.turnos_trabajados}`, indent: true },
                    { label: '  Total ventas', value: mxFmt(k.total_ventas), indent: true },
                    { label: '  Descuentos', value: mxFmt(k.total_descuentos), indent: true, dim: true },
                    { label: '  Devoluciones', value: `${k.total_devoluciones}`, indent: true, dim: true },
                    { label: '  Ticket promedio', value: mxFmt(k.ticket_promedio), indent: true },
                    { separator: true, label: '' },
                  ])}
                  footer={`${kpi.length} colaboradores en el periodo`}
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

export default ColaboradoresReportes;
