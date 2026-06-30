import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptCard from '../../../components/common/ReceiptCard/ReceiptCard';
import type { ReceiptLine } from '../../../components/common/ReceiptCard/ReceiptCard';
import {
  obtenerStockActual,
  obtenerStockBajoMinimo,
  obtenerComprasPorProveedor,
  obtenerRotacionInventario,
  type StockData,
  type BajoMinimoItem,
  type CompraProveedor,
  type RotacionItem,
} from '../../../services/reportesDashboard.service';
import '../SaludNegocio/SaludNegocio.css';
import './InventarioReportes.css';

const mxFmt = (v: number) =>
  `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

type ReporteTab = 'stock' | 'bajo-minimo' | 'compras-proveedor' | 'rotacion';
type ViewMode = 'dashboard' | 'ticket';

export const InventarioReportes: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReporteTab>('stock');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [fechaInicio, setFechaInicio] = useState(firstOfMonth());
  const [fechaFin, setFechaFin] = useState(today());

  const [stock, setStock] = useState<StockData | null>(null);
  const [bajoMinimo, setBajoMinimo] = useState<BajoMinimoItem[] | null>(null);
  const [comprasProveedor, setComprasProveedor] = useState<CompraProveedor[] | null>(null);
  const [rotacion, setRotacion] = useState<RotacionItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const negocioNombre = JSON.parse(localStorage.getItem('negocio') || '{}')?.nombreNegocio || 'MI NEGOCIO POS';
  const negocioDireccion = JSON.parse(localStorage.getItem('negocio') || '{}')?.direccionfiscalnegocio;

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'stock') setStock(await obtenerStockActual());
      else if (tab === 'bajo-minimo') {
        setBajoMinimo(await obtenerStockBajoMinimo());
      } else if (tab === 'compras-proveedor') setComprasProveedor(await obtenerComprasPorProveedor(fechaInicio, fechaFin));
      else if (tab === 'rotacion') setRotacion(await obtenerRotacionInventario(fechaInicio, fechaFin));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [tab, fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const generadoStr = new Date().toLocaleString('es-MX');
  const periodoStr = `${fechaInicio} al ${fechaFin}`;

  const buildStockLines = (d: StockData): ReceiptLine[] => [
    { label: 'Total insumos', value: `${d.total_items}` },
    { label: 'Valor inventario', value: mxFmt(d.valor_total), bold: true },
    { label: 'Críticos', value: `${d.items_criticos}`, dim: d.items_criticos === 0 },
    { label: 'En advertencia', value: `${d.items_advertencia}`, dim: d.items_advertencia === 0 },
    { separator: true, label: '' },
    ...d.items.map(i => ({
      label: i.nombre,
      value: `${i.stock_actual} ${i.unidad_medida}`,
      dim: i.estado === 'OPTIMO',
      bold: i.estado === 'CRITICO',
    })),
  ];

  return (
    <div className="inventario-page reportes-page">
      <div className="reportes-header">
        <button className="reportes-back-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </button>
        <div className="reportes-header-title">
          <h1>Inventario</h1>
          <p>Stock, alertas de reabasto y compras por proveedor</p>
        </div>
        <div className="reportes-view-toggle">
          <button className={`view-toggle-btn ${viewMode === 'dashboard' ? 'active' : ''}`} onClick={() => setViewMode('dashboard')}>Dashboard</button>
          <button className={`view-toggle-btn ${viewMode === 'ticket' ? 'active' : ''}`} onClick={() => setViewMode('ticket')}>Ticket</button>
        </div>
      </div>

      {(tab === 'compras-proveedor' || tab === 'rotacion') && (
        <div className="reportes-filters">
          <label>Desde <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></label>
          <label>Hasta <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></label>
          <button className="reportes-filter-btn" onClick={cargar}>Consultar</button>
        </div>
      )}

      <div className="reportes-tabs">
        {([
          ['stock', 'Stock Actual'],
          ['bajo-minimo', 'Bajo Mínimo'],
          ['compras-proveedor', 'Compras por Proveedor'],
          ['rotacion', 'Rotación'],
        ] as [ReporteTab, string][]).map(([t, label]) => (
          <button key={t} className={`reportes-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      <div className="reportes-content">
        {loading && <div className="reportes-loading">Cargando...</div>}
        {error && <div className="reportes-error">{error}</div>}

        {!loading && !error && (
          <>
            {/* ─── Stock Actual ─── */}
            {tab === 'stock' && stock && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card"><span>Total Insumos</span><strong>{stock.total_items}</strong></div>
                  <div className="kpi-card"><span>Valor Total Inventario</span><strong>{mxFmt(stock.valor_total)}</strong></div>
                  <div className={`kpi-card ${stock.items_criticos > 0 ? 'kpi-semaforo-perdida' : ''}`}>
                    <span>Insumos Críticos</span><strong className={stock.items_criticos > 0 ? 'negative' : ''}>{stock.items_criticos}</strong>
                  </div>
                  <div className={`kpi-card ${stock.items_advertencia > 0 ? 'kpi-semaforo-equilibrio' : ''}`}>
                    <span>En Advertencia</span><strong>{stock.items_advertencia}</strong>
                  </div>
                </div>
                <table className="reportes-table">
                  <thead>
                    <tr><th>Producto</th><th>Unidad</th><th>Stock Actual</th><th>Mínimo</th><th>Costo PP</th><th>Valor Inv.</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {stock.items.map((item, i) => (
                      <tr key={i} className={`estado-${item.estado.toLowerCase()}`}>
                        <td>{item.nombre}</td>
                        <td className="text-center">{item.unidad_medida}</td>
                        <td className="text-right">{item.stock_actual}</td>
                        <td className="text-right">{item.stock_minimo}</td>
                        <td className="text-right">{mxFmt(item.costo_promedio_ponderado)}</td>
                        <td className="text-right">{mxFmt(item.valor_inventario)}</td>
                        <td><span className={`badge badge-${item.estado.toLowerCase()}`}>{item.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'stock' && stock && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="STOCK ACTUAL"
                  generatedAt={generadoStr}
                  lines={buildStockLines(stock)}
                  totals={[{ label: 'Valor total inventario', value: mxFmt(stock.valor_total), bold: true }]}
                  status={stock.items_criticos > 0
                    ? { label: `${stock.items_criticos} INSUMO(S) CRÍTICOS`, variant: 'danger' }
                    : stock.items_advertencia > 0
                      ? { label: `${stock.items_advertencia} EN ADVERTENCIA`, variant: 'warning' }
                      : { label: 'INVENTARIO EN NIVEL ÓPTIMO', variant: 'success' }
                  }
                  footer="Stock actual al momento de la consulta"
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── Bajo Mínimo ─── */}
            {tab === 'bajo-minimo' && bajoMinimo && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className={`kpi-card ${bajoMinimo.length > 0 ? 'kpi-semaforo-perdida' : 'kpi-semaforo-utilidad'}`}>
                    <span>Insumos Bajo Mínimo</span>
                    <strong className={bajoMinimo.length > 0 ? 'negative' : 'positive'}>{bajoMinimo.length}</strong>
                    <div className="kpi-badge">{bajoMinimo.length > 0 ? 'REQUIEREN REABASTO' : 'TODO EN NIVEL'}</div>
                  </div>
                </div>
                <table className="reportes-table">
                  <thead>
                    <tr><th>Insumo</th><th>Stock Actual</th><th>Mínimo</th><th>Déficit</th><th>Proveedor</th></tr>
                  </thead>
                  <tbody>
                    {bajoMinimo.map((item, i) => (
                      <tr key={i}>
                        <td>{item.nombre}</td>
                        <td className="text-right negative">{item.stock_actual} {item.unidad_medida}</td>
                        <td className="text-right">{item.stock_minimo} {item.unidad_medida}</td>
                        <td className="text-right bold negative">{item.deficit} {item.unidad_medida}</td>
                        <td>{item.proveedor || '—'}</td>
                      </tr>
                    ))}
                    {bajoMinimo.length === 0 && (
                      <tr><td colSpan={5} className="text-center empty">Todos los insumos están sobre el mínimo ✓</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'bajo-minimo' && bajoMinimo && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="ALERTAS DE REABASTO"
                  generatedAt={generadoStr}
                  lines={[
                    { label: 'Insumo', value: 'Déficit', bold: true },
                    { separator: true, label: '' },
                    ...bajoMinimo.map(i => ({
                      label: i.nombre,
                      value: `-${i.deficit} ${i.unidad_medida}`,
                    })),
                  ]}
                  totals={[{ label: 'Total insumos bajo mínimo', value: `${bajoMinimo.length}` }]}
                  status={bajoMinimo.length > 0
                    ? { label: `${bajoMinimo.length} REQUIEREN REABASTO URGENTE`, variant: 'danger' }
                    : { label: 'INVENTARIO ÓPTIMO', variant: 'success' }
                  }
                  footer="Productos con stock_actual <= stock_minimo"
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── Compras por Proveedor ─── */}
            {tab === 'compras-proveedor' && comprasProveedor && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card"><span>Proveedores</span><strong>{comprasProveedor.length}</strong></div>
                  <div className="kpi-card"><span>Total Compras</span><strong>{mxFmt(comprasProveedor.reduce((s, p) => s + p.total_monto, 0))}</strong></div>
                </div>
                <table className="reportes-table">
                  <thead>
                    <tr><th>Proveedor</th><th>Operaciones</th><th>Productos</th><th>Última Compra</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {comprasProveedor.map((p, i) => (
                      <tr key={i}>
                        <td>{p.proveedor}</td>
                        <td className="text-center">{p.total_operaciones}</td>
                        <td className="inv-producto-list">{p.productos.slice(0, 3).join(', ')}{p.productos.length > 3 ? ` +${p.productos.length - 3}` : ''}</td>
                        <td>{p.ultima_compra}</td>
                        <td className="text-right bold">{mxFmt(p.total_monto)}</td>
                      </tr>
                    ))}
                    {comprasProveedor.length === 0 && (
                      <tr><td colSpan={5} className="text-center empty">Sin compras en el periodo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'compras-proveedor' && comprasProveedor && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="COMPRAS POR PROVEEDOR"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={[
                    ...comprasProveedor.flatMap(p => [
                      { label: p.proveedor, value: mxFmt(p.total_monto), bold: true },
                      { label: `  ${p.total_operaciones} operaciones`, dim: true, indent: true },
                      { label: `  Última: ${p.ultima_compra}`, dim: true, indent: true },
                      { separator: true, label: '' },
                    ]),
                  ]}
                  totals={[{
                    label: 'Total compras',
                    value: mxFmt(comprasProveedor.reduce((s, p) => s + p.total_monto, 0)),
                    bold: true,
                  }]}
                  onPrint={() => window.print()}
                />
              </div>
            )}

            {/* ─── Rotación ─── */}
            {tab === 'rotacion' && rotacion && viewMode === 'dashboard' && (
              <div className="reportes-dashboard">
                <div className="kpi-grid">
                  <div className="kpi-card"><span>Alta Rotación</span><strong className="positive">{rotacion.filter(r => r.nivel === 'ALTA').length}</strong></div>
                  <div className="kpi-card"><span>Baja Rotación</span><strong className="negative">{rotacion.filter(r => r.nivel === 'BAJA').length}</strong></div>
                </div>
                <table className="reportes-table">
                  <thead>
                    <tr><th>Producto</th><th>Vendido (periodo)</th><th>Stock Actual</th><th>Índice Rot.</th><th>Nivel</th></tr>
                  </thead>
                  <tbody>
                    {rotacion.map((item, i) => (
                      <tr key={i}>
                        <td>{item.nombre}</td>
                        <td className="text-right">{item.cantidad_vendida}</td>
                        <td className="text-right">{item.stock_actual}</td>
                        <td className="text-right">{item.indice_rotacion.toFixed(2)}x</td>
                        <td><span className={`badge badge-rot-${item.nivel.toLowerCase()}`}>{item.nivel}</span></td>
                      </tr>
                    ))}
                    {rotacion.length === 0 && (
                      <tr><td colSpan={5} className="text-center empty">Sin ventas en el periodo</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'rotacion' && rotacion && viewMode === 'ticket' && (
              <div className="ticket-view">
                <ReceiptCard
                  businessName={negocioNombre}
                  businessAddress={negocioDireccion}
                  title="ROTACIÓN DE INVENTARIO"
                  generatedAt={generadoStr}
                  period={periodoStr}
                  lines={[
                    { label: 'ALTA ROTACIÓN', fullRow: true, bold: true },
                    { separator: true, label: '' },
                    ...rotacion.filter(r => r.nivel === 'ALTA').map(r => ({ label: r.nombre, value: `${r.indice_rotacion}x` })),
                    { separator: true, label: '' },
                    { label: 'BAJA ROTACIÓN', fullRow: true, bold: true },
                    { separator: true, label: '' },
                    ...rotacion.filter(r => r.nivel === 'BAJA').map(r => ({ label: r.nombre, value: `${r.indice_rotacion}x`, dim: true })),
                  ]}
                  footer="Índice = Cantidad vendida / Stock actual"
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

export default InventarioReportes;
