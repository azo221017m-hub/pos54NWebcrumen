import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerVentasWeb, obtenerResumenVentas, actualizarVentaWeb, type ResumenVentas } from '../../services/ventasWebService';
import type { VentaWebWithDetails, EstadoDeVenta } from '../../types/ventasWeb.types';
import { verificarTurnoAbierto, cerrarTurnoActual } from '../../services/turnosService';
import type { Turno } from '../../types/turno.types';
import { clearSession } from '../../services/sessionService';
import { negociosService } from '../../services/negociosService';
import type { Negocio } from '../../types/negocio.types';
import { obtenerInsumos } from '../../services/insumosService';
import type { Insumo } from '../../types/insumo.types';
import { registrarLog } from '../../services/logService';
import { showSuccessToast, showErrorToast } from '../../components/FeedbackToast';
import { useWebSocket } from '../../hooks/useWebSocket';
import useIsMobile from '../../hooks/useIsMobile';
import CierreTurno from '../../components/turnos/CierreTurno/CierreTurno';
import './PageDashboardMobile.css';

interface Usuario {
  id: number;
  nombre: string;
  alias: string;
  telefono?: string;
  idNegocio: number;
  idRol: number;
}

const getUsuario = (): Usuario | null => {
  const data = localStorage.getItem('usuario');
  return data ? JSON.parse(data) : null;
};

const getPrivilegio = (): number => {
  const data = localStorage.getItem('privilegio');
  return data ? Number(data) : 0;
};

type Tab = 'inicio' | 'ventas' | 'menu';

type NivelInventario = {
  nivel: 'OPTIMO' | 'ADVERTENCIA' | 'CRITICO';
  mensaje: string;
};

const formatCurrency = (amount: number) =>
  `$${Number(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const badgeClass = (estado: string) => {
  switch (estado) {
    case 'ORDENADO': return 'pdm-badge-ordenado';
    case 'ESPERAR':  return 'pdm-badge-esperar';
    case 'SOLICITADO': return 'pdm-badge-solicitado';
    default:         return 'pdm-badge-default';
  }
};

const badgeLabel = (estado: string) => {
  switch (estado) {
    case 'ORDENADO':   return 'En mesa';
    case 'ESPERAR':    return 'En espera';
    case 'SOLICITADO': return 'Solicitado';
    default:           return estado;
  }
};

export const PageDashboardMobile = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [usuario] = useState<Usuario | null>(getUsuario());
  const [privilegio] = useState<number>(getPrivilegio());

  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('inicio');

  // Data
  const [turno, setTurno]               = useState<Turno | null>(null);
  const [ventas, setVentas]             = useState<VentaWebWithDetails[]>([]);
  const [resumen, setResumen]           = useState<ResumenVentas | null>(null);
  const [negocio, setNegocio]           = useState<Negocio | null>(null);
  const [nivelInv, setNivelInv]         = useState<NivelInventario>({ nivel: 'OPTIMO', mensaje: 'Cargando…' });
  const [loading, setLoading]           = useState(true);
  const [showCierre, setShowCierre]     = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing]     = useState(false);

  // ─── Redirect desktop back to /dashboard ────────────────────────────────
  useEffect(() => {
    if (!isMobile) {
      navigate('/dashboard', { replace: true });
    }
  }, [isMobile, navigate]);

  // ─── Load data ────────────────────────────────────────────────────────────
  const cargarTurno = useCallback(async () => {
    try {
      const t = await verificarTurnoAbierto();
      setTurno(t);
    } catch {
      setTurno(null);
    }
  }, []);

  const cargarVentas = useCallback(async () => {
    try {
      const all = await obtenerVentasWeb();
      const activas = all.filter(v =>
        v.estadodeventa === 'ORDENADO' || v.estadodeventa === 'ESPERAR' || v.estadodeventa === 'SOLICITADO'
      );
      setVentas(activas);
    } catch {
      /* ignore */
    }
  }, []);

  const cargarResumen = useCallback(async () => {
    try {
      const r = await obtenerResumenVentas();
      setResumen(r);
    } catch {
      /* ignore */
    }
  }, []);

  const cargarInventario = useCallback(async () => {
    if (!usuario?.idNegocio) return;
    try {
      const insumos = await obtenerInsumos(usuario.idNegocio);
      let criticos = 0;
      let advertencia = 0;
      insumos.forEach((ins: Insumo) => {
        const actual  = Number(ins.stock_actual  || 0);
        const minimo  = Number(ins.stock_minimo  || 0);
        if (actual <= minimo)         criticos++;
        else if (actual <= minimo * 1.2) advertencia++;
      });
      if (criticos > 0) {
        setNivelInv({ nivel: 'CRITICO',     mensaje: `${criticos} insumo${criticos > 1 ? 's' : ''} crítico${criticos > 1 ? 's' : ''}` });
      } else if (advertencia > 0) {
        setNivelInv({ nivel: 'ADVERTENCIA', mensaje: `${advertencia} insumo${advertencia > 1 ? 's' : ''} en advertencia` });
      } else {
        setNivelInv({ nivel: 'OPTIMO',      mensaje: 'Inventario óptimo' });
      }
    } catch {
      /* ignore */
    }
  }, [usuario?.idNegocio]);

  const cargarNegocio = useCallback(async () => {
    if (!usuario?.idNegocio) return;
    try {
      const n = await negociosService.obtenerNegocioPorId(usuario.idNegocio);
      setNegocio(n);
    } catch {
      /* ignore */
    }
  }, [usuario?.idNegocio]);

  const cargarTodo = useCallback(async () => {
    await Promise.all([
      cargarTurno(),
      cargarVentas(),
      cargarResumen(),
      cargarInventario(),
      cargarNegocio(),
    ]);
    setLoading(false);
  }, [cargarTurno, cargarVentas, cargarResumen, cargarInventario, cargarNegocio]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  // ─── WebSocket: refresh ventas on update ─────────────────────────────────
  const handleWebSocketMessage = useCallback((message: { type?: string }) => {
    if (
      message?.type === 'VENTA_ACTUALIZADA' ||
      message?.type === 'NUEVA_VENTA' ||
      message?.type === 'ESTADO_VENTA'
    ) {
      cargarVentas();
      cargarResumen();
    }
  }, [cargarVentas, cargarResumen]);

  useWebSocket(handleWebSocketMessage);

  // ─── Pull-to-refresh (tap the header area) ───────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await Promise.all([cargarVentas(), cargarResumen(), cargarTurno()]);
    setRefreshing(false);
    showSuccessToast('✅ Datos actualizados');
  }, [refreshing, cargarVentas, cargarResumen, cargarTurno]);

  // ─── Order status change ──────────────────────────────────────────────────
  const cambiarEstado = useCallback(async (idVenta: number, estado: EstadoDeVenta) => {
    try {
      const res = await actualizarVentaWeb(idVenta, { estadodeventa: estado });
      if (res.success) {
        await cargarVentas();
        showSuccessToast('✅ Estado actualizado');
      } else {
        showErrorToast('Error al actualizar estado');
      }
    } catch {
      showErrorToast('Error al actualizar estado');
    }
  }, [cargarVentas]);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    registrarLog('PageDashboardMobile', 'Cierre sesión móvil', 'SESIÓN');
    clearSession();
    window.location.href = '/login';
  }, []);

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pdm-loading">
        <div className="pdm-spinner" />
        <span>Cargando…</span>
      </div>
    );
  }

  const pedidosActivos = ventas.length;
  const totalCobrado   = resumen?.totalCobrado ?? 0;
  const totalOrdenado  = resumen?.totalOrdenado ?? 0;

  const invBadgeClass =
    nivelInv.nivel === 'CRITICO'     ? 'pdm-inv-badge critico'     :
    nivelInv.nivel === 'ADVERTENCIA' ? 'pdm-inv-badge advertencia' : 'pdm-inv-badge optimo';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="pdm-page" onClick={() => setShowUserMenu(false)}>
      {/* ── Header ──────────────────────────────────── */}
      <header className="pdm-header">
        <div className="pdm-header-brand">
          {negocio?.logo_url ? (
            <img
              src={negocio.logo_url}
              alt={negocio.nombre_negocio}
              className="pdm-header-logo"
            />
          ) : (
            <div className="pdm-header-logo-placeholder">🏪</div>
          )}
          <div className="pdm-header-text">
            <div className="pdm-header-negocio">
              {negocio?.nombre_negocio ?? 'Mi Negocio'}
            </div>
            <div className="pdm-header-bienvenida">
              Hola, {usuario?.alias ?? usuario?.nombre ?? 'Usuario'}
            </div>
          </div>
        </div>

        <div className="pdm-header-actions">
          {/* Refresh button */}
          <button
            className="pdm-icon-btn"
            onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            aria-label="Actualizar"
            disabled={refreshing}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              className="pdm-icon-btn"
              onClick={(e) => { e.stopPropagation(); setShowUserMenu(v => !v); }}
              aria-label="Menú usuario"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>
            {showUserMenu && (
              <div className="pdm-user-dropdown" onClick={e => e.stopPropagation()}>
                <div className="pdm-user-dropdown-header">
                  <div className="pdm-user-name">{usuario?.nombre}</div>
                  <div className="pdm-user-alias">{usuario?.alias}</div>
                </div>
                <button
                  className="pdm-user-dropdown-item danger"
                  onClick={handleLogout}
                >
                  <span>🚪</span> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────── */}
      <main className="pdm-content">
        {/* ─── TAB: INICIO ─────────────────────────── */}
        {activeTab === 'inicio' && (
          <>
            {/* Turno card */}
            <div className="pdm-turno-card">
              <div className="pdm-turno-info">
                <div className="pdm-turno-label">Estado de turno</div>
                <div className="pdm-turno-status">
                  {turno ? '✅ Turno abierto' : '⏸ Sin turno activo'}
                </div>
                {turno && (
                  <div className="pdm-turno-clave">{turno.clave_turno}</div>
                )}
              </div>
              {turno && privilegio >= 3 && (
                <button
                  className="pdm-turno-btn"
                  onClick={() => { registrarLog('PageDashboardMobile', 'Cierre turno', 'ACCIÓN'); setShowCierre(true); }}
                >
                  Cerrar turno
                </button>
              )}
            </div>

            {/* KPI cards */}
            <p className="pdm-section-title">Mi turno</p>
            <div className="pdm-kpi-row">
              <div className="pdm-kpi-card">
                <span className="pdm-kpi-icon">💰</span>
                <span className="pdm-kpi-label">Cobrado</span>
                <span className="pdm-kpi-value green">{formatCurrency(totalCobrado)}</span>
              </div>
              <div className="pdm-kpi-card">
                <span className="pdm-kpi-icon">🧾</span>
                <span className="pdm-kpi-label">Pedidos activos</span>
                <span className={`pdm-kpi-value ${pedidosActivos > 0 ? 'blue' : ''}`}>
                  {pedidosActivos}
                </span>
              </div>
              <div className="pdm-kpi-card">
                <span className="pdm-kpi-icon">⏳</span>
                <span className="pdm-kpi-label">Por cobrar</span>
                <span className="pdm-kpi-value orange">{formatCurrency(totalOrdenado)}</span>
              </div>
              <div className="pdm-kpi-card">
                <span className="pdm-kpi-icon">📦</span>
                <span className="pdm-kpi-label">Inventario</span>
                <span className={invBadgeClass} style={{ fontSize: 12 }}>{nivelInv.mensaje}</span>
              </div>
            </div>

            {/* Quick actions */}
            <p className="pdm-section-title">Acceso rápido</p>
            <div className="pdm-quick-actions">
              <button className="pdm-qa-btn" onClick={() => navigate('/ventas-mobile')}>
                <span className="pdm-qa-icon">➕</span>
                <span className="pdm-qa-label">Nueva venta</span>
              </button>
              <button className="pdm-qa-btn" onClick={() => { registrarLog('PageDashboardMobile', 'Gastos', 'NAVEGACIÓN'); navigate('/gastos'); }}>
                <span className="pdm-qa-icon">💸</span>
                <span className="pdm-qa-label">Gastos</span>
              </button>
              <button className="pdm-qa-btn" onClick={() => { registrarLog('PageDashboardMobile', 'Inventario', 'NAVEGACIÓN'); navigate('/movimientos-inventario'); }}>
                <span className="pdm-qa-icon">📦</span>
                <span className="pdm-qa-label">Inventario</span>
              </button>
              <button className="pdm-qa-btn" onClick={() => setActiveTab('ventas')}>
                <span className="pdm-qa-icon">📋</span>
                <span className="pdm-qa-label">Pedidos</span>
              </button>
            </div>
          </>
        )}

        {/* ─── TAB: VENTAS ─────────────────────────── */}
        {activeTab === 'ventas' && (
          <>
            <p className="pdm-section-title">Pedidos activos</p>
            {ventas.length === 0 ? (
              <div className="pdm-empty">
                <span className="pdm-empty-icon">🎉</span>
                <span className="pdm-empty-text">No hay pedidos activos</span>
              </div>
            ) : (
              <div className="pdm-order-list">
                {ventas.map(venta => {
                  const folio = venta.folioventa ?? `#${venta.idventa}`;
                  const nombre = venta.nombrecomensal ?? venta.tipoventa ?? '—';
                  const productos = (venta.detalles ?? [])
                    .map(d => `${d.nombreproducto}${d.cantidad > 1 ? ` x${d.cantidad}` : ''}`)
                    .join(', ') || '—';
                  const total = Number(venta.totaldeventa || 0);
                  return (
                    <div key={venta.idventa} className="pdm-order-card">
                      <div className="pdm-order-header">
                        <span className="pdm-order-folio">{folio}</span>
                        <span className={`pdm-order-badge ${badgeClass(venta.estadodeventa)}`}>
                          {badgeLabel(venta.estadodeventa)}
                        </span>
                      </div>
                      <div className="pdm-order-cliente">{nombre}</div>
                      <div className="pdm-order-productos">{productos}</div>
                      <div className="pdm-order-footer">
                        <span className="pdm-order-total">{formatCurrency(total)}</span>
                        <div className="pdm-order-actions">
                          {venta.estadodeventa === 'ESPERAR' && (
                            <button
                              className="pdm-order-btn primary"
                              onClick={() => cambiarEstado(venta.idventa, 'ORDENADO')}
                            >
                              Ordenar
                            </button>
                          )}
                          {venta.estadodeventa === 'ORDENADO' && (
                            <button
                              className="pdm-order-btn success"
                              onClick={() => cambiarEstado(venta.idventa, 'SOLICITADO')}
                            >
                              Solicitar
                            </button>
                          )}
                          <button
                            className="pdm-order-btn secondary"
                            onClick={() => navigate('/ventas-mobile', { state: { idVenta: venta.idventa, folioVenta: venta.folioventa } })}
                          >
                            Ir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── TAB: MENÚ ───────────────────────────── */}
        {activeTab === 'menu' && (
          <>
            <p className="pdm-section-title">Navegación</p>
            <div className="pdm-menu-list">
              <button className="pdm-menu-item" onClick={() => navigate('/ventas-mobile')}>
                <span className="pdm-menu-item-icon">🛒</span>
                Nueva venta
                <span className="pdm-menu-item-chevron">›</span>
              </button>
              <button className="pdm-menu-item" onClick={() => navigate('/gastos')}>
                <span className="pdm-menu-item-icon">💸</span>
                Gastos
                <span className="pdm-menu-item-chevron">›</span>
              </button>
              <button className="pdm-menu-item" onClick={() => navigate('/movimientos-inventario')}>
                <span className="pdm-menu-item-icon">📦</span>
                Inventario
                <span className="pdm-menu-item-chevron">›</span>
              </button>
              {privilegio >= 3 && (
                <button className="pdm-menu-item" onClick={() => navigate('/config-mesas')}>
                  <span className="pdm-menu-item-icon">🪑</span>
                  Mesas
                  <span className="pdm-menu-item-chevron">›</span>
                </button>
              )}
              {privilegio >= 5 && (
                <button className="pdm-menu-item" onClick={() => navigate('/config-productos')}>
                  <span className="pdm-menu-item-icon">🍽️</span>
                  Productos
                  <span className="pdm-menu-item-chevron">›</span>
                </button>
              )}
            </div>

            <p className="pdm-section-title" style={{ marginTop: 8 }}>Turno</p>
            <div className="pdm-menu-list">
              {turno && privilegio >= 3 && (
                <button className="pdm-menu-item" onClick={() => setShowCierre(true)}>
                  <span className="pdm-menu-item-icon">🔒</span>
                  Cerrar turno
                  <span className="pdm-menu-item-chevron">›</span>
                </button>
              )}
              <button className="pdm-menu-item" onClick={() => navigate('/dashboard')}>
                <span className="pdm-menu-item-icon">🖥️</span>
                Vista escritorio
                <span className="pdm-menu-item-chevron">›</span>
              </button>
            </div>

            <p className="pdm-section-title" style={{ marginTop: 8 }}>Sesión</p>
            <div className="pdm-menu-list">
              <button className="pdm-menu-item danger" onClick={handleLogout}>
                <span className="pdm-menu-item-icon">🚪</span>
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </main>

      {/* ── Bottom navigation ───────────────────────── */}
      <nav className="pdm-bottom-nav">
        <button
          className={`pdm-nav-item ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          <span className="pdm-nav-item-icon">🏠</span>
          <span className="pdm-nav-item-label">Inicio</span>
        </button>

        <button
          className={`pdm-nav-item ${activeTab === 'ventas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventas')}
        >
          <span className="pdm-nav-item-icon">🧾</span>
          <span className="pdm-nav-item-label">Pedidos</span>
          {pedidosActivos > 0 && (
            <span className="pdm-nav-badge">{pedidosActivos}</span>
          )}
        </button>

        <button
          className="pdm-nav-item"
          onClick={() => navigate('/ventas-mobile')}
          style={{ color: '#3b82f6' }}
        >
          <span className="pdm-nav-item-icon">➕</span>
          <span className="pdm-nav-item-label">Venta</span>
        </button>

        <button
          className={`pdm-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <span className="pdm-nav-item-icon">☰</span>
          <span className="pdm-nav-item-label">Menú</span>
        </button>
      </nav>

      {/* ── Cierre de turno modal ────────────────────── */}
      {showCierre && turno && (
        <div className="pdm-modal-overlay">
          <CierreTurno
            turno={turno}
            onCancel={() => setShowCierre(false)}
            onSubmit={async (datosFormulario) => {
              try {
                await cerrarTurnoActual(datosFormulario);
                setShowCierre(false);
                await cargarTurno();
                await cargarResumen();
                showSuccessToast('✅ Turno cerrado exitosamente');
              } catch {
                showErrorToast('Error al cerrar el turno');
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PageDashboardMobile;
