import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { obtenerVentasWeb, actualizarVentaWeb, obtenerResumenVentas, type ResumenVentas } from '../services/ventasWebService';
import type { VentaWebWithDetails, EstadoDeVenta, TipoDeVenta } from '../types/ventasWeb.types';
import jsPDF from 'jspdf';
import { SessionTimer } from '../components/common/SessionTimer';
import { clearSession } from '../services/sessionService';
import { obtenerModeradores } from '../services/moderadoresService';
import type { Moderador } from '../types/moderador.types';
import { obtenerDetallesPagos } from '../services/pagosService';
import { verificarTurnoAbierto, cerrarTurnoActual } from '../services/turnosService';
import type { Turno } from '../types/turno.types';
import CierreTurno from '../components/turnos/CierreTurno/CierreTurno';
import { showSuccessToast, showErrorToast } from '../components/FeedbackToast';
import './DashboardPage.css';

interface Usuario {
  id: number;
  nombre: string;
  alias: string;
  telefono?: string;
  idNegocio: number;
  idRol: number;
}

interface PedidoOnline {
  id: number;
  cliente: string;
  productos: string;
  total: number;
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado';
  hora: string;
}

interface DatosCierreTurno {
  idTurno: string;
  retiroFondo: number;
  totalArqueo: number;
  detalleDenominaciones: {
    billete1000: number;
    billete500: number;
    billete200: number;
    billete100: number;
    billete50: number;
    billete20: number;
    moneda10: number;
    moneda5: number;
    moneda1: number;
    moneda050: number;
  };
  estatusCierre: 'sin_novedades' | 'cuentas_pendientes';
}

const getUsuarioFromStorage = (): Usuario | null => {
  const usuarioData = localStorage.getItem('usuario');
  return usuarioData ? JSON.parse(usuarioData) : null;
};

const TIPO_VENTA_FILTER_ALL = 'TODOS' as const;
type TipoVentaFilterOption = TipoDeVenta | typeof TIPO_VENTA_FILTER_ALL;

// Refresh interval for sales summary (in milliseconds)
const SALES_SUMMARY_REFRESH_INTERVAL = 30000; // 30 seconds

// Helper to render icon SVG for sale type as React component
const TipoVentaIcon: React.FC<{ tipo: TipoDeVenta }> = ({ tipo }) => {
  switch (tipo) {
    case 'DOMICILIO':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      );
    case 'LLEVAR':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      );
    case 'MESA':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="8" width="18" height="12" rx="2"/>
          <line x1="8" y1="8" x2="8" y2="4"/>
          <line x1="16" y1="8" x2="16" y2="4"/>
        </svg>
      );
    case 'ONLINE':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      );
    case 'MOVIMIENTO':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="8" width="18" height="12" rx="2"/>
          <line x1="8" y1="8" x2="8" y2="4"/>
          <line x1="16" y1="8" x2="16" y2="4"/>
        </svg>
      );
  }
};

// Helper to get color class for sale type
const getTipoVentaColorClass = (tipo: TipoDeVenta): string => {
  const colors: Record<TipoDeVenta, string> = {
    'DOMICILIO': 'tipo-domicilio',
    'LLEVAR': 'tipo-llevar',
    'MESA': 'tipo-mesa',
    'ONLINE': 'tipo-online',
    'MOVIMIENTO': 'tipo-movimiento'
  };
  return colors[tipo] || 'tipo-mesa';
};

// Helper to calculate display amount for MIXTO sales
const calcularImporteMostrar = (venta: VentaWebWithDetails, pagosRegistrados: Record<string, number>): number => {
  const total = Number(venta.totaldeventa) || 0;
  if (venta.formadepago === 'MIXTO') {
    const pagos = pagosRegistrados[venta.folioventa] || 0;
    return Math.max(0, total - pagos);
  }
  return total;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [usuario] = useState<Usuario | null>(getUsuarioFromStorage());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConfigSubmenu, setShowConfigSubmenu] = useState(false);
  const [showConfigNegocioSubmenu, setShowConfigNegocioSubmenu] = useState(false);
  const [showDashboardSubmenu, setShowDashboardSubmenu] = useState(false);
  const [showMiOperacionSubmenu, setShowMiOperacionSubmenu] = useState(false);
  const [showInventarioSubmenu, setShowInventarioSubmenu] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ventasSolicitadas, setVentasSolicitadas] = useState<VentaWebWithDetails[]>([]);
  const [tipoVentaFilter, setTipoVentaFilter] = useState<TipoVentaFilterOption>(TIPO_VENTA_FILTER_ALL);
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [pagosRegistrados, setPagosRegistrados] = useState<Record<string, number>>({});
  const [resumenVentas, setResumenVentas] = useState<ResumenVentas>({
    totalCobrado: 0,
    totalOrdenado: 0,
    metaTurno: 0,
    hasTurnoAbierto: false
  });
  const [turnoAbierto, setTurnoAbierto] = useState<Turno | null>(null);
  const [showCierreTurnoModal, setShowCierreTurnoModal] = useState(false);

  const handleLogout = useCallback(() => {
    // Limpiar completamente la sesión
    clearSession();
    
    // Forzar recarga completa de la página para limpiar todo el estado de React
    // Esto garantiza que no quede ningún dato del usuario anterior en memoria
    window.location.href = '/login';
  }, []);

  const cargarVentasSolicitadas = useCallback(async () => {
    try {
      const ventas = await obtenerVentasWeb();
      // Filter sales with ORDENADO and ESPERAR status
      const ventasFiltradas = ventas.filter(venta => 
        venta.estadodeventa === 'ORDENADO' || venta.estadodeventa === 'ESPERAR'
      );
      
      // Fetch registered payments for MIXTO sales in parallel
      const ventasMixto = ventasFiltradas.filter(v => v.formadepago === 'MIXTO');
      const pagosPromises = ventasMixto.map(async (venta) => {
        try {
          const detallesPagos = await obtenerDetallesPagos(venta.folioventa);
          const sumaPagos = detallesPagos.reduce((sum, pago) => sum + Number(pago.totaldepago || 0), 0);
          return { folioventa: venta.folioventa, sumaPagos };
        } catch (error) {
          console.error(`Error al cargar pagos para folio ${venta.folioventa}:`, error);
          return { folioventa: venta.folioventa, sumaPagos: 0 };
        }
      });
      
      const pagosResults = await Promise.all(pagosPromises);
      const pagosMap: Record<string, number> = {};
      pagosResults.forEach(result => {
        pagosMap[result.folioventa] = result.sumaPagos;
      });
      
      // Set both states together (React 18 will batch these automatically)
      setVentasSolicitadas(ventasFiltradas);
      setPagosRegistrados(pagosMap);
    } catch (error) {
      console.error('Error al cargar comandas del día:', error);
    }
  }, []);

  const cargarModeradores = useCallback(async () => {
    if (!usuario?.idNegocio) return;
    try {
      const mods = await obtenerModeradores(usuario.idNegocio);
      setModeradores(mods);
    } catch (error) {
      console.error('Error al cargar moderadores:', error);
    }
  }, [usuario?.idNegocio]);

  const cargarResumenVentas = useCallback(async () => {
    try {
      const resumen = await obtenerResumenVentas();
      setResumenVentas(resumen);
    } catch (error) {
      console.error('Error al cargar resumen de ventas:', error);
    }
  }, []);

  const verificarTurno = useCallback(async () => {
    try {
      const turno = await verificarTurnoAbierto();
      setTurnoAbierto(turno);
    } catch (error) {
      console.error('Error al verificar turno abierto:', error);
      setTurnoAbierto(null);
    }
  }, []);

  const handleStatusChange = async (ventaId: number, newStatus: EstadoDeVenta) => {
    try {
      const result = await actualizarVentaWeb(ventaId, { estadodeventa: newStatus });
      if (result.success) {
        // Reload sales after status change
        await cargarVentasSolicitadas();
      } else {
        alert(`Error al actualizar estado: ${result.message}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al actualizar el estado de la venta');
    }
  };

  const handleFinalizaDiaClick = () => {
    setShowCierreTurnoModal(true);
    setShowMiOperacionSubmenu(false);
  };

  const handleCierreTurnoCancel = () => {
    setShowCierreTurnoModal(false);
  };

  const handleCierreTurnoSubmit = async (datosFormulario: DatosCierreTurno) => {
    try {
      console.log('Datos de cierre de turno:', datosFormulario);
      // Call the service to close the turno
      await cerrarTurnoActual(datosFormulario);
      console.log('Turno cerrado exitosamente');
      setShowCierreTurnoModal(false);
      // Refresh the turno status and sales summary
      await verificarTurno();
      await cargarResumenVentas();
      // Show a success message
      showSuccessToast('Turno cerrado exitosamente');
    } catch (error) {
      console.error('Error al cerrar turno:', error);
      showErrorToast('Error al cerrar el turno. Por favor intente nuevamente.');
    }
  };

  // Helper function to resolve moderador names from IDs
  const resolveModeradoresNames = useCallback((moderadoresStr: string | null): string[] => {
    if (!moderadoresStr || moderadoresStr === '' || moderadoresStr === '0') {
      return [];
    }
    
    // Special case for LIMPIO
    if (moderadoresStr === 'LIMPIO') {
      return ['LIMPIO'];
    }

    // Parse comma-separated IDs
    const ids = moderadoresStr.split(',')
      .map(id => id.trim())
      .filter(id => id !== '' && id !== '0')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    // Resolve names
    const names = ids
      .map(id => moderadores.find(m => m.idmoderador === id)?.nombremoderador)
      .filter((name): name is string => !!name);

    return names;
  }, [moderadores]);

  const handleGenerateComandaPDF = (venta: VentaWebWithDetails) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Ticket size: 80mm width
      });

      // PDF Constants
      const PRODUCT_NAME_MAX_LENGTH = 20;
      const PRODUCT_NAME_WRAP_WIDTH = 28;
      const NOTES_WRAP_WIDTH = 55;

      let yPos = 10;
      const lineHeight = 5;
      const pageWidth = 80;

      // Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('POS CRUMEN', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 1.5;

      doc.setFontSize(12);
      doc.text('COMANDA', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 1.5;

      // Sale info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Folio: ${venta.folioventa}`, 5, yPos);
      yPos += lineHeight;
      doc.text(`Tipo: ${venta.tipodeventa}`, 5, yPos);
      yPos += lineHeight;
      doc.text(`Cliente: ${venta.cliente}`, 5, yPos);
      yPos += lineHeight;
      doc.text(`Fecha: ${new Date(venta.fechadeventa).toLocaleString()}`, 5, yPos);
      yPos += lineHeight * 1.5;

      // Line separator
      doc.line(5, yPos, pageWidth - 5, yPos);
      yPos += lineHeight;

      // Products header
      doc.setFont('helvetica', 'bold');
      doc.text('Cant.', 5, yPos);
      doc.text('Producto', 15, yPos);
      doc.text('P.Unit', 48, yPos, { align: 'right' });
      doc.text('Subtotal', pageWidth - 5, yPos, { align: 'right' });
      yPos += lineHeight;

      doc.line(5, yPos, pageWidth - 5, yPos);
      yPos += lineHeight;

      // Products
      doc.setFont('helvetica', 'normal');
      venta.detalles.forEach((detalle) => {
        // Check if we need a new page
        if (yPos > 180) {
          doc.addPage();
          yPos = 10;
        }

        // Cantidad
        doc.text(`${detalle.cantidad}`, 5, yPos);
        
        // Product name - wrap if too long
        const productName = detalle.nombreproducto;
        if (productName.length > PRODUCT_NAME_MAX_LENGTH) {
          const lines = doc.splitTextToSize(productName, PRODUCT_NAME_WRAP_WIDTH);
          doc.text(lines, 15, yPos);
          yPos += lineHeight * (lines.length - 1);
        } else {
          doc.text(productName, 15, yPos);
        }
        
        // Precio unitario
        doc.text(`$${Number(detalle.preciounitario).toFixed(2)}`, 48, yPos, { align: 'right' });
        
        // Subtotal (cantidad * preciounitario)
        const subtotal = detalle.cantidad * Number(detalle.preciounitario);
        doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 5, yPos, { align: 'right' });
        yPos += lineHeight;

        // Moderadores if any
        const moderadoresNames = resolveModeradoresNames(detalle.moderadores);
        if (moderadoresNames.length > 0) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          const moderadoresText = `  Mod: ${moderadoresNames.join(', ')}`;
          const moderadoresLines = doc.splitTextToSize(moderadoresText, NOTES_WRAP_WIDTH);
          doc.text(moderadoresLines, 15, yPos);
          yPos += lineHeight * moderadoresLines.length;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
        }

        // Observations if any
        if (detalle.observaciones) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          const observacionesText = `  * ${detalle.observaciones}`;
          const observacionesLines = doc.splitTextToSize(observacionesText, NOTES_WRAP_WIDTH);
          doc.text(observacionesLines, 15, yPos);
          yPos += lineHeight * observacionesLines.length;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
        }
      });

      yPos += lineHeight * 0.5;
      doc.line(5, yPos, pageWidth - 5, yPos);
      yPos += lineHeight;

      // Totals
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', 5, yPos);
      doc.text(`$${Number(venta.totaldeventa).toFixed(2)}`, pageWidth - 5, yPos, { align: 'right' });
      yPos += lineHeight * 2;

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Gracias por su preferencia', pageWidth / 2, yPos, { align: 'center' });

      // Print the PDF
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar la comanda en PDF');
    }
  };

  const handleVerDetalle = (venta: VentaWebWithDetails) => {
    // Navigate to sales page with the sale data
    navigate('/ventas', { state: { ventaToLoad: venta } });
  };

  const handlePagar = (venta: VentaWebWithDetails) => {
    // Navigate to sales page with the sale data and flag to show payment module
    navigate('/ventas', { state: { ventaToLoad: venta, showPaymentModule: true } });
  };

  // Memoize filtered ventas to avoid redundant filtering
  const ventasFiltradas = useMemo(() => {
    if (tipoVentaFilter === TIPO_VENTA_FILTER_ALL) {
      return ventasSolicitadas;
    }
    return ventasSolicitadas.filter(v => v.tipodeventa === tipoVentaFilter);
  }, [ventasSolicitadas, tipoVentaFilter]);

  useEffect(() => {
    // Verificar si hay usuario - check localStorage directly to avoid stale state
    const usuarioData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    if (!usuarioData || !token) {
      navigate('/login');
      return;
    }

    // Load sales with ORDENADO and ESPERAR status
    cargarVentasSolicitadas();
    // Load moderadores for PDF generation
    cargarModeradores();
    // Load sales summary for current shift
    cargarResumenVentas();

    // Verify open turno
    verificarTurno();

    // Refresh sales summary and turno status periodically
    const intervalId = setInterval(() => {
      cargarResumenVentas();
      verificarTurno();
    }, SALES_SUMMARY_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cargarVentasSolicitadas, cargarModeradores, cargarResumenVentas, and verificarTurno omitted to prevent infinite refresh loop
  }, [navigate]);

  // Early return if not authenticated
  const usuarioData = localStorage.getItem('usuario');
  if (!usuarioData || !usuario) {
    return null;
  }

  // Pedidos online de ejemplo
  const pedidosOnline: PedidoOnline[] = [
    { id: 1, cliente: 'Juan Pérez', productos: '2x Hamburguesa, 1x Refresco', total: 150.00, estado: 'pendiente', hora: '10:30 AM' },
    { id: 2, cliente: 'María García', productos: '1x Pizza Grande, 2x Cerveza', total: 280.00, estado: 'preparando', hora: '10:25 AM' },
    { id: 3, cliente: 'Carlos López', productos: '3x Tacos, 1x Agua', total: 95.00, estado: 'listo', hora: '10:15 AM' },
  ];

  const getEstadoBadgeClass = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'badge-warning';
      case 'preparando': return 'badge-info';
      case 'listo': return 'badge-success';
      case 'entregado': return 'badge-default';
      default: return 'badge-default';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'preparando': return 'Preparando';
      case 'listo': return 'Listo';
      case 'entregado': return 'Entregado';
      default: return estado;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
          <div className="business-logo">
            <img src="/logowebposcrumen.svg" alt="Logo" className="logo-icon" />
            <div className="logo-text">
              <h1>POSWEB Crumen</h1>
              <p>Sistema Administrador de Negocios</p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <SessionTimer />
          <div className="user-menu-container">
            <button 
              className="user-icon-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="user-name">{usuario?.alias}</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="user-details">
                    <p className="user-full-name">{usuario?.nombre}</p>
                    <p className="user-alias">@{usuario?.alias}</p>
                    <p className="user-role">{usuario?.idRol === 1 ? 'Administrador' : 'Vendedor'}</p>
                    <p className="user-negocio">ID Negocio: {usuario?.idNegocio}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className={`dashboard-navigation ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Overlay para cerrar el menú en mobile */}
        {mobileMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        <div className="nav-menu-container">
        {/* Menú Mi Tablero con Submenú */}
        <div className="nav-item-container">
          <button 
            className={`nav-item ${showDashboardSubmenu ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDashboardSubmenu(!showDashboardSubmenu);
              setShowConfigSubmenu(false);
              setShowConfigNegocioSubmenu(false);
              setShowMiOperacionSubmenu(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Mi Tablero
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ 
                width: '14px', 
                height: '14px', 
                marginLeft: 'auto',
                transform: showDashboardSubmenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showDashboardSubmenu && (
            <div className="submenu">
              <button 
                className="submenu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsScreenLocked(true);
                  setShowDashboardSubmenu(false);
                  setShowMiOperacionSubmenu(false);
                  setMobileMenuOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Proteger Pantalla
              </button>
            </div>
          )}
        </div>

        {/* Menú Configuración Sistema - Solo visible si idNegocio === 99999 */}
        {usuario?.idNegocio === 99999 && (
        <div className="nav-item-container">
          <button 
            className={`nav-item ${showConfigSubmenu ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowConfigSubmenu(!showConfigSubmenu);
              setShowDashboardSubmenu(false);
              setShowConfigNegocioSubmenu(false);
              setShowMiOperacionSubmenu(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6"/>
              <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
              <path d="M1 12h6m6 0h6"/>
              <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
            </svg>
            Configuración Sistema
            <svg 
              className={`chevron-submenu ${showConfigSubmenu ? 'rotate' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ width: '16px', height: '16px', marginLeft: 'auto' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Submenú Configuración Sistema */}
          {showConfigSubmenu && (
            <div className="submenu">
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-negocios'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Negocio
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-roles'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Rol de Usuarios
              </button>
              <button className="submenu-item" onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                console.log(`📋 [USUARIOS] Mostrando usuarios con idNegocio: ${usuario?.idNegocio} | Usuario: ${usuario?.nombre} (${usuario?.alias}) | Timestamp: ${new Date().toISOString()}`);
                navigate('/config-usuarios'); 
                setMobileMenuOpen(false); 
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Usuarios
              </button>
            </div>
          )}
        </div>
        )}

        {/* Menú Configuración Negocio */}
        <div className="nav-item-container">
          <button 
            className={`nav-item ${showConfigNegocioSubmenu ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowConfigNegocioSubmenu(!showConfigNegocioSubmenu);
              setShowDashboardSubmenu(false);
              setShowConfigSubmenu(false);
              setShowMiOperacionSubmenu(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Configuración Negocio
            <svg 
              className={`chevron-submenu ${showConfigNegocioSubmenu ? 'rotate' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ width: '16px', height: '16px', marginLeft: 'auto' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Submenú Configuración Negocio */}
          {showConfigNegocioSubmenu && (
            <div className="submenu">
              <button className="submenu-item" onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                console.log(`📋 [USUARIOS] Mostrando usuarios con idNegocio: ${usuario?.idNegocio} | Usuario: ${usuario?.nombre} (${usuario?.alias}) | Timestamp: ${new Date().toISOString()}`);
                navigate('/config-usuarios'); 
                setMobileMenuOpen(false); 
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Usuarios
              </button>

              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-cuentas-contables'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                  <line x1="9" y1="11" x2="15" y2="11"/>
                </svg>
                Grupo de Movimientos
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-proveedores'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/>
                  <path d="M14 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  <circle cx="7" cy="18" r="2"/>
                  <circle cx="17" cy="18" r="2"/>
                  <line x1="5" y1="18" x2="15" y2="18"/>
                </svg>
                Proveedores
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-insumos'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 12h8" />
                  <path d="M8 16h8" />
                </svg>
                Insumos
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-subrecetas'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Subrecetas
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-recetas'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                  <path d="M7 2v20"/>
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                </svg>
                Recetas
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-moderadores'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Moderadores
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-cat-moderadores'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Categoría Moderadores
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-categorias'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2H2v10h10V2z"/>
                  <path d="M22 2h-10v10h10V2z"/>
                  <path d="M12 22H2V12h10v10z"/>
                  <path d="M22 22h-10V12h10v10z"/>
                </svg>
                Categorías
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-productos'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="15" rx="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Productos
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-mesas'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="8" width="18" height="12" rx="2"/>
                  <circle cx="8" cy="16" r="2"/>
                  <circle cx="16" cy="16" r="2"/>
                  <line x1="8" y1="8" x2="8" y2="4"/>
                  <line x1="16" y1="8" x2="16" y2="4"/>
                </svg>
                Mesas
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-clientes'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Clientes
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-descuentos'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 9l6 6"/>
                  <path d="M9 15l6-6"/>
                </svg>
                Descuentos
              </button>
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-turnos'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Turnos
              </button>
            </div>
          )}
        </div>

        {/* Menú Mi Operación con Submenú */}
        <div className="nav-item-container">
          <button 
            className={`nav-item ${showMiOperacionSubmenu ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMiOperacionSubmenu(!showMiOperacionSubmenu);
              setShowDashboardSubmenu(false);
              setShowConfigSubmenu(false);
              setShowConfigNegocioSubmenu(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Mi Operación
            <svg 
              className={`chevron-submenu ${showMiOperacionSubmenu ? 'rotate' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ 
                width: '14px', 
                height: '14px', 
                marginLeft: 'auto',
                transform: showMiOperacionSubmenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Submenú Mi Operación */}
          {showMiOperacionSubmenu && (
            <div className="submenu">
              <button 
                className="submenu-item" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  navigate('/ventas'); 
                  setMobileMenuOpen(false); 
                  setShowMiOperacionSubmenu(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Inicia Venta
              </button>
              <button 
                className="submenu-item" 
                disabled 
                title="Próximamente"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Gastos
              </button>
              <button 
                className="submenu-item" 
                disabled={!turnoAbierto}
                title={turnoAbierto ? "Finalizar día" : "No hay turno abierto"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFinalizaDiaClick();
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Finaliza Día
              </button>
            </div>
          )}
        </div>

        {/* Menú Inventario con Submenú */}
        <div className="nav-item-container">
          <button 
            className={`nav-item ${showInventarioSubmenu ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowInventarioSubmenu(!showInventarioSubmenu);
              setShowDashboardSubmenu(false);
              setShowConfigSubmenu(false);
              setShowConfigNegocioSubmenu(false);
              setShowMiOperacionSubmenu(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Inventario
            <svg 
              className={`chevron-submenu ${showInventarioSubmenu ? 'rotate' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ 
                width: '14px', 
                height: '14px', 
                marginLeft: 'auto',
                transform: showInventarioSubmenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Submenú Inventario */}
          {showInventarioSubmenu && (
            <div className="submenu">
              <button 
                className="submenu-item" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  navigate('/movimientos-inventario'); 
                  setMobileMenuOpen(false); 
                  setShowInventarioSubmenu(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Movimientos
              </button>
            </div>
          )}
        </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="dashboard-main-content">
        <div className="content-left">
          <div className="welcome-section">
            <h2 className="welcome-title">¡Bienvenido, {usuario?.nombre}!</h2>
            <p className="welcome-subtitle">
              Panel de control del sistema POS Crumen
            </p>
          </div>

          <div className="cards-grid">
            <div className="dashboard-card">
              <div className="card-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 className="card-title">Salud de mi Negocio</h3>
              <p className="card-text">Comparativo del mes</p>
              <div className="card-stat">Ventas vs Gastos</div>
            </div>

            <div className="dashboard-card">
              <div className="card-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3 className="card-title">Ventas Hoy</h3>
              <p className="card-text" style={{ fontSize: '0.55rem', marginBottom: '0.35rem' }}>Turno Actual</p>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.55rem', color: '#718096' }}>Cobrado:</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#10b981' }}>
                    ${resumenVentas.totalCobrado.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.55rem', color: '#718096' }}>Ordenado:</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#f59e0b' }}>
                    ${resumenVentas.totalOrdenado.toFixed(2)}
                  </span>
                </div>
              </div>

              {resumenVentas.metaTurno > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.55rem', color: '#718096' }}>Meta:</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#6b7280' }}>
                      ${resumenVentas.metaTurno.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    marginBottom: '0.25rem'
                  }}>
                    <div style={{
                      width: `${Math.min((resumenVentas.totalCobrado / (resumenVentas.metaTurno || 1)) * 100, 100)}%`,
                      height: '100%',
                      backgroundColor: resumenVentas.totalCobrado >= resumenVentas.metaTurno ? '#10b981' : '#3b82f6',
                      transition: 'width 0.3s ease',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#6b7280', textAlign: 'center' }}>
                    {((resumenVentas.totalCobrado / (resumenVentas.metaTurno || 1)) * 100).toFixed(1)}% completado
                  </div>
                </div>
              )}
            </div>

            <div className="dashboard-card">
              <div className="card-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3 className="card-title">Inventario</h3>
              <p className="card-text">Alertas de stock</p>
              <div className="card-stat">0 alertas</div>
            </div>
          </div>

          {/* Sección de Comandas del Día */}
          {ventasSolicitadas.length > 0 && (
            <div className="ventas-solicitadas-section">
              <div className="section-header">
                {/* Filter by Tipo de Venta */}
                <div className="tipo-venta-filter">
                  <label htmlFor="tipo-venta-filter">Tipo:</label>
                  <select 
                    id="tipo-venta-filter"
                    value={tipoVentaFilter}
                    onChange={(e) => setTipoVentaFilter(e.target.value as TipoVentaFilterOption)}
                    className="tipo-venta-filter-select"
                  >
                    <option value={TIPO_VENTA_FILTER_ALL}>Todos</option>
                    <option value="LLEVAR">Llevar</option>
                    <option value="DOMICILIO">Domicilio</option>
                    <option value="MESA">Mesa</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
                
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Comandas del Día
                </h3>
                <span className="badge badge-warning">
                  {ventasFiltradas.length}
                </span>
              </div>
              <div className="ventas-solicitadas-grid">
                {ventasFiltradas.map((venta) => (
                  <div key={venta.idventa} className="venta-solicitada-card">
                    <div className="venta-card-header">
                      <span className="venta-folio">{venta.folioventa}</span>
                      <div className="venta-tipo-badge">
                        <span className={`tipo-venta-icon ${getTipoVentaColorClass(venta.tipodeventa)}`}>
                          <TipoVentaIcon tipo={venta.tipodeventa} />
                        </span>
                        <span className="tipo-venta-label">{venta.tipodeventa}</span>
                      </div>
                    </div>
                    <div className="venta-card-body">
                      <p className="venta-cliente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {venta.cliente}
                      </p>
                      <p className="venta-items">
                        <strong>{venta.detalles?.reduce((sum, d) => sum + Number(d.cantidad), 0) || 0}</strong> producto(s)
                      </p>
                      
                      {/* Status selector - only show for ONLINE sales */}
                      {venta.tipodeventa === 'ONLINE' && (
                        <div className="venta-status-selector">
                          <label htmlFor={`status-${venta.idventa}`}>Estado:</label>
                          <select
                            id={`status-${venta.idventa}`}
                            value={venta.estadodeventa}
                            onChange={(e) => handleStatusChange(venta.idventa, e.target.value as EstadoDeVenta)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="SOLICITADO">Solicitado</option>
                            <option value="PREPARANDO">Preparando</option>
                            <option value="EN_CAMINO">En Camino</option>
                            <option value="ENTREGADO">Entregado</option>
                            <option value="CANCELADO">Cancelado</option>
                            <option value="DEVUELTO">Devuelto</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="venta-card-footer">
                      <span className="venta-total">
                        ${calcularImporteMostrar(venta, pagosRegistrados).toFixed(2)}
                      </span>
                      <div className="venta-card-actions">
                        <button 
                          className="btn-comanda"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateComandaPDF(venta);
                          }}
                          title="Generar comanda PDF"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        </button>
                        {venta.estadodeventa !== 'ESPERAR' && (
                          <button 
                            className="btn-pagar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePagar(venta);
                            }}
                            title="Pagar"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                              <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            Pagar
                          </button>
                        )}
                        {venta.formadepago !== 'MIXTO' && (
                          <button 
                            className="btn-ver-detalle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerDetalle(venta);
                            }}
                          >
                            Ver detalle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tablero de Pedidos Online - Lado Derecho */}
        <aside className="pedidos-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              Pedidos Online
            </h2>
            <span className="badge badge-info">{pedidosOnline.length} activos</span>
          </div>

          <div className="pedidos-list">
            {pedidosOnline.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-info">
                    <h3 className="pedido-cliente">{pedido.cliente}</h3>
                    <p className="pedido-hora">{pedido.hora}</p>
                  </div>
                  <span className={`badge ${getEstadoBadgeClass(pedido.estado)}`}>
                    {getEstadoTexto(pedido.estado)}
                  </span>
                </div>
                <p className="pedido-productos">{pedido.productos}</p>
                <div className="pedido-footer">
                  <span className="pedido-total">${(Number(pedido.total) || 0).toFixed(2)}</span>
                  <button className="btn-small">Ver detalles</button>
                </div>
              </div>
            ))}
          </div>

          {pedidosOnline.length === 0 && (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>No hay pedidos online activos</p>
            </div>
          )}
        </aside>
      </div>

      {/* Componente de Bloqueo de Pantalla */}
      {isScreenLocked && (
        <div 
          className="screen-lock-overlay"
          onClick={() => setIsScreenLocked(false)}
        >
          <div className="screen-lock-content">
            <div className="lock-logo">
              <img src="/logowebposcrumen.svg" alt="Logo" />
            </div>
            <h2 className="lock-title">POSWEB Crumen</h2>
            <p className="lock-subtitle">Pantalla Protegida</p>
            <p className="lock-hint">Haz clic en cualquier lugar para desbloquear</p>
          </div>
        </div>
      )}

      {/* Modal de Cierre de Turno */}
      {showCierreTurnoModal && turnoAbierto && (
        <CierreTurno 
          turno={turnoAbierto}
          onCancel={handleCierreTurnoCancel}
          onSubmit={handleCierreTurnoSubmit}
        />
      )}
    </div>
  );
};

export default DashboardPage;
