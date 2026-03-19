import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { obtenerVentasWeb, actualizarVentaWeb, obtenerResumenVentas, obtenerSaludNegocio, obtenerTopProductosTurno, type ResumenVentas, type SaludNegocio, type TopProductoTurno } from '../services/ventasWebService';
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
import { showSuccessToast, showErrorToast, showInfoToast } from '../components/FeedbackToast';
import { obtenerInsumos } from '../services/insumosService';
import type { Insumo } from '../types/insumo.types';
import { negociosService } from '../services/negociosService';
import type { Negocio } from '../types/negocio.types';
import TableroComandasPagadas from '../components/comandasPagadas/TableroComandasPagadas';
import { useWebSocket } from '../hooks/useWebSocket';
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
  estadodeventa: string;
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

// Helper to get the short sale folio: first letter of tipodeventa + idventa
const getShortFolio = (tipodeventa: TipoDeVenta, idventa: number): string => {
  return `${tipodeventa.charAt(0)}${idventa}`;
};

// Helper to distribute MIXTO total proportionally between EFECTIVO and TRANSFERENCIA
const distribuirMixto = (efectivoAPI: number, transferenciaAPI: number, mixtoAPI: number): { efectivo: number; transferencia: number } => {
  const baseTotal = efectivoAPI + transferenciaAPI;
  if (baseTotal > 0) {
    return {
      efectivo: efectivoAPI + mixtoAPI * (efectivoAPI / baseTotal),
      transferencia: transferenciaAPI + mixtoAPI * (transferenciaAPI / baseTotal)
    };
  }
  return {
    efectivo: efectivoAPI + mixtoAPI / 2,
    transferencia: transferenciaAPI + mixtoAPI / 2
  };
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

// Helper to determine if a venta originated from the SITIO (POS) — includes legacy orders without origenventa set
// Also includes WEB orders that are already ORDENADO (moved to Comandas del Día after adjustment)
const isSitioOrder = (venta: VentaWebWithDetails): boolean =>
  venta.origenventa === 'SITIO' || venta.origenventa === null || venta.origenventa === undefined ||
  (venta.origenventa === 'WEB' && venta.estadodeventa === 'ORDENADO');

// Helper to format quantity: show as integer when value has no decimal part
const formatQuantity = (cantidad: number): number => {
  const qty = Number(cantidad);
  return qty % 1 === 0 ? Math.floor(qty) : qty;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [usuario] = useState<Usuario | null>(getUsuarioFromStorage());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConfigSubmenu, setShowConfigSubmenu] = useState(false);
  const [showConfigNegocioSubmenu, setShowConfigNegocioSubmenu] = useState(false);
  const [showDashboardSubmenu, setShowDashboardSubmenu] = useState(false);
  const [showMiOperacionSubmenu, setShowMiOperacionSubmenu] = useState(false);
  const [dashboardView, setDashboardView] = useState<'indicadores' | 'comandas' | 'comandas-pagadas'>('indicadores');
  const [autoSwitchedToComandas, setAutoSwitchedToComandas] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ventasSolicitadas, setVentasSolicitadas] = useState<VentaWebWithDetails[]>([]);
  const [tipoVentaFilter, setTipoVentaFilter] = useState<TipoVentaFilterOption>(TIPO_VENTA_FILTER_ALL);
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [pagosRegistrados, setPagosRegistrados] = useState<Record<string, number>>({});
  const [resumenVentas, setResumenVentas] = useState<ResumenVentas>({
    totalCobrado: 0,
    totalOrdenado: 0,
    totalVentasCobradas: 0,
    totalGastos: 0,
    totalDescuentos: 0,
    metaTurno: 0,
    hasTurnoAbierto: false,
    ventasPorFormaDePago: [],
    ventasPorTipoDeVenta: [],
    descuentosPorTipo: []
  });
  const [saludNegocio, setSaludNegocio] = useState<SaludNegocio>({
    ventas: 0,
    costoVenta: 0,
    margenBruto: 0,
    porcentajeMargen: 0,
    gastos: 0,
    utilidadOperativa: 0,
    valorInventario: 0,
    totalVentas: 0,
    totalGastos: 0,
    totalCompras: 0,
    periodo: {
      inicio: '',
      fin: ''
    }
  });
  const [turnoAbierto, setTurnoAbierto] = useState<Turno | null>(null);
  const [showCierreTurnoModal, setShowCierreTurnoModal] = useState(false);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [abiertoAhoraWeb, setAbiertoAhoraWeb] = useState<boolean>(false);
  const [nivelInventario, setNivelInventario] = useState<{
    nivel: 'OPTIMO' | 'ADVERTENCIA' | 'CRITICO';
    color: string;
    mensaje: string;
    icono: string;
    insumosAfectados: number;
  }>({
    nivel: 'OPTIMO',
    color: '#10b981',
    mensaje: 'Inventario en nivel óptimo',
    icono: '🟢',
    insumosAfectados: 0
  });
  const [topProductosMayor, setTopProductosMayor] = useState<TopProductoTurno[]>([]);
  const [topProductosMenor, setTopProductosMenor] = useState<TopProductoTurno[]>([]);

  // Track already-notified order IDs to avoid duplicate sound alerts
  const notifiedOrdersRef = useRef<Set<number>>(new Set());

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
      // Filter sales with ORDENADO, ESPERAR and SOLICITADO status
      const ventasFiltradas = ventas.filter(venta => 
        venta.estadodeventa === 'ORDENADO' || venta.estadodeventa === 'ESPERAR' || venta.estadodeventa === 'SOLICITADO'
      );
      
      // Fetch registered payments for MIXTO sales in parallel
      // Use all filtered ventas (both SITIO and WEB) for payment lookups
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
      console.log('🟡 DashboardPage: Llamando cargarResumenVentas...');
      const resumen = await obtenerResumenVentas();
      console.log('🟡 DashboardPage: Resumen recibido, actualizando estado:', resumen);
      setResumenVentas(resumen);
    } catch (error) {
      console.error('Error al cargar resumen de ventas:', error);
    }
  }, []);

  const cargarSaludNegocio = useCallback(async () => {
    try {
      const salud = await obtenerSaludNegocio();
      setSaludNegocio(salud);
    } catch (error) {
      console.error('Error al cargar salud del negocio:', error);
    }
  }, []);

  const calcularNivelInventario = useCallback(async () => {
    if (!usuario?.idNegocio) return;
    
    try {
      const insumos = await obtenerInsumos(usuario.idNegocio);
      
      let criticos = 0;
      let advertencia = 0;
      
      insumos.forEach((insumo: Insumo) => {
        const stockActual = Number(insumo.stock_actual || 0);
        const stockMinimo = Number(insumo.stock_minimo || 0);
        
        if (stockActual <= stockMinimo) {
          criticos++;
        } else if (stockActual <= stockMinimo * 1.2) {
          advertencia++;
        }
      });
      
      // Determinar el nivel general basado en prioridad
      if (criticos > 0) {
        setNivelInventario({
          nivel: 'CRITICO',
          color: '#ef4444',
          mensaje: `${criticos} insumo${criticos !== 1 ? 's' : ''} en nivel crítico`,
          icono: '🔴',
          insumosAfectados: criticos
        });
      } else if (advertencia > 0) {
        setNivelInventario({
          nivel: 'ADVERTENCIA',
          color: '#f59e0b',
          mensaje: `${advertencia} insumo${advertencia !== 1 ? 's' : ''} próximo${advertencia !== 1 ? 's' : ''} a nivel mínimo`,
          icono: '🟠',
          insumosAfectados: advertencia
        });
      } else {
        setNivelInventario({
          nivel: 'OPTIMO',
          color: '#10b981',
          mensaje: 'Inventario en nivel óptimo',
          icono: '🟢',
          insumosAfectados: 0
        });
      }
    } catch (error) {
      console.error('Error al calcular nivel de inventario:', error);
    }
  }, [usuario?.idNegocio]);

  const verificarTurno = useCallback(async () => {
    try {
      const turno = await verificarTurnoAbierto();
      setTurnoAbierto(turno);
    } catch (error) {
      console.error('Error al verificar turno abierto:', error);
      setTurnoAbierto(null);
    }
  }, []);

  const cargarTopProductosTurno = useCallback(async () => {
    try {
      const data = await obtenerTopProductosTurno();
      setTopProductosMayor(data.top10Mayor);
      setTopProductosMenor(data.top10Menor);
    } catch (error) {
      console.error('Error al cargar top productos del turno:', error);
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

  const handleToggleAbiertoAhoraWeb = async () => {
    if (!usuario?.idNegocio) return;
    const nuevoValor: 0 | 1 = abiertoAhoraWeb ? 0 : 1;
    try {
      const result = await negociosService.toggleAbiertoAhoraWeb(usuario.idNegocio, nuevoValor);
      if (result.success) {
        setAbiertoAhoraWeb(nuevoValor === 1);
        showSuccessToast(nuevoValor === 1 ? '✅ Pedidos WEB activados' : '⏸ Pedidos WEB desactivados');
      } else {
        showErrorToast('Error al cambiar estado de pedidos WEB');
      }
    } catch (error) {
      console.error('Error al togglear abiertoahoraweb:', error);
      showErrorToast('Error al cambiar estado de pedidos WEB');
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
      doc.text(`Folio: ${getShortFolio(venta.tipodeventa, venta.idventa)}`, 5, yPos);
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
    // Comandas del día: orders from SITIO (POS), legacy orders, and WEB+ORDENADO orders
    const comandasSitio = ventasSolicitadas.filter(isSitioOrder);
    const filtered = tipoVentaFilter === TIPO_VENTA_FILTER_ALL
      ? comandasSitio
      : comandasSitio.filter(v => {
          // WEB+ORDENADO orders are displayed as 'ONLINE' type for filtering purposes
          const displayTipo = (v.origenventa === 'WEB' && v.estadodeventa === 'ORDENADO') ? 'ONLINE' : v.tipodeventa;
          return displayTipo === tipoVentaFilter;
        });
    // Sort by fechamodificacionauditoria ascending (oldest first)
    return filtered.sort((a, b) =>
      new Date(a.fechamodificacionauditoria).getTime() - new Date(b.fechamodificacionauditoria).getTime()
    );
  }, [ventasSolicitadas, tipoVentaFilter]);

  // Comandas del Día count: SITIO orders (or legacy without origenventa)
  const comandasSitioCount = useMemo(() => 
    ventasSolicitadas.filter(isSitioOrder).length,
    [ventasSolicitadas]
  );

  // Auto-show comandas dashboard when there are pending orders (only on first load)
  useEffect(() => {
    if (comandasSitioCount > 0 && !autoSwitchedToComandas) {
      setDashboardView('comandas');
      setAutoSwitchedToComandas(true);
    }
  }, [comandasSitioCount, autoSwitchedToComandas]);

  // Debounce timers for WebSocket-triggered refreshes to avoid rapid successive API calls
  const wsDebounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const debouncedRefresh = useCallback((key: string, fn: () => void, delay = 500) => {
    if (wsDebounceTimers.current[key]) {
      clearTimeout(wsDebounceTimers.current[key]);
    }
    wsDebounceTimers.current[key] = setTimeout(fn, delay);
  }, []);

  // Clean up debounce timers on unmount
  useEffect(() => {
    const timers = wsDebounceTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Listen for real-time dashboard updates via WebSocket (replaces setInterval polling)
  useWebSocket({
    onMessage: (data) => {
      if (data.type === 'nuevo_pedido_web') {
        const orderId = data.idventa as number;
        if (!notifiedOrdersRef.current.has(orderId)) {
          notifiedOrdersRef.current.add(orderId);
          const audio = new Audio('/notificacion.wav');
          audio.play().catch((err) => { console.debug('Audio playback blocked:', err); });
        }
        cargarVentasSolicitadas();
        showInfoToast(`🛎 Pedido WEB entrante: ${data.folioventa}`);
      } else if (data.type === 'venta_update') {
        debouncedRefresh('ventas', () => {
          cargarVentasSolicitadas();
          cargarResumenVentas();
          cargarSaludNegocio();
          cargarTopProductosTurno();
        });
      } else if (data.type === 'gasto_update') {
        debouncedRefresh('gastos', () => {
          cargarSaludNegocio();
        });
      } else if (data.type === 'turno_update') {
        debouncedRefresh('turno', () => {
          verificarTurno();
          cargarResumenVentas();
          cargarTopProductosTurno();
        });
      } else if (data.type === 'inventario_update') {
        debouncedRefresh('inventario', () => {
          calcularNivelInventario();
        });
      }
    }
  });

  useEffect(() => {
    // Verificar si hay usuario - check localStorage directly to avoid stale state
    const usuarioData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    if (!usuarioData || !token) {
      navigate('/login');
      return;
    }

    // Client-mode users don't have dashboard access - redirect to business selection
    if (localStorage.getItem('clienteMode') === 'true') {
      navigate('/clientes');
      return;
    }

    // Privilege 2 users don't have dashboard access
    const priv = Number(localStorage.getItem('privilegio') || '0');
    if (priv === 2) {
      navigate('/ventas');
      return;
    }

    // Load sales with ORDENADO and ESPERAR status
    cargarVentasSolicitadas();
    // Load moderadores for PDF generation
    cargarModeradores();
    // Load sales summary for current shift
    cargarResumenVentas();
    // Load business health data
    cargarSaludNegocio();
    // Calculate inventory level
    calcularNivelInventario();
    // Load top products for current shift
    cargarTopProductosTurno();
    // Load negocio data for branding
    if (usuario?.idNegocio) {
      negociosService.obtenerNegocioPorId(usuario.idNegocio)
        .then(data => {
          if (data?.negocio) {
            setNegocio(data.negocio);
            setAbiertoAhoraWeb(Number(data.negocio.abiertoahoraweb) === 1);
          }
        })
        .catch(err => { console.error('Error al cargar datos del negocio:', err); });
    }

    // Verify open turno
    verificarTurno();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cargarVentasSolicitadas, cargarModeradores, cargarResumenVentas, cargarSaludNegocio, and verificarTurno omitted to prevent infinite refresh loop
  }, [navigate]);

  // Early return if not authenticated
  const usuarioData = localStorage.getItem('usuario');
  if (!usuarioData || !usuario) {
    return null;
  }

  const privilegio = Number(localStorage.getItem('privilegio') || '0');

  // Real pedidos online: only WEB orders with SOLICITADO status
  // Only consider detalles where estadodetalle = 'SOLICITADO'
  const pedidosOnline: PedidoOnline[] = ventasSolicitadas
    .filter(v => v.origenventa === 'WEB' && v.estadodeventa === 'SOLICITADO')
    .map(v => {
      const detallesSolicitados = v.detalles.filter(d => d.estadodetalle === 'SOLICITADO');
      return {
        id: v.idventa,
        cliente: v.cliente,
        productos: detallesSolicitados
          .map(d => `${formatQuantity(d.cantidad)}x ${d.nombreproducto}`)
          .join(', '),
        total: detallesSolicitados.reduce((sum, d) => sum + (Number(d.total) || 0), 0),
        estado: 'pendiente' as const,
        estadodeventa: v.estadodeventa,
        hora: new Date(v.fechadeventa).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
    });

  const getEstadoBadgeClass = (estadodeventa: string) => {
    switch(estadodeventa) {
      case 'SOLICITADO': return 'badge-neon-solicitado';
      case 'PREPARANDO': return 'badge-info';
      case 'EN_CAMINO': return 'badge-warning';
      case 'ENTREGADO': return 'badge-success';
      case 'CANCELADO': return 'badge-default';
      case 'DEVUELTO': return 'badge-default';
      case 'ORDENADO': return 'badge-info';
      case 'ESPERAR': return 'badge-warning';
      default: return 'badge-default';
    }
  };

  const getEstadoTexto = (estadodeventa: string) => {
    switch(estadodeventa) {
      case 'SOLICITADO': return 'Solicitado';
      case 'PREPARANDO': return 'Preparando';
      case 'EN_CAMINO': return 'En Camino';
      case 'ENTREGADO': return 'Entregado';
      case 'CANCELADO': return 'Cancelado';
      case 'DEVUELTO': return 'Devuelto';
      case 'ORDENADO': return 'Ordenado';
      case 'ESPERAR': return 'Esperar';
      default: return estadodeventa;
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
            <img src={negocio?.logotipo || "/logowebposcrumen.svg"} alt="Logo" className="logo-icon" />
            <div className="logo-text">
              <h1>¡Bienvenido, {usuario?.nombre}!</h1>
              <p>Tablero de {negocio?.nombreNegocio || 'mi Negocio'}</p>
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
              {privilegio !== 3 && (
              <button
                className="submenu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDashboardView('indicadores');
                  setShowDashboardSubmenu(false);
                  setMobileMenuOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Salud de mi negocio
              </button>
              )}
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
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-anuncios'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
                Anuncios
              </button>
            </div>
          )}
        </div>
        )}

        {/* Menú Configuración Negocio */}
        {privilegio !== 3 && (
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
              {privilegio !== 4 && (
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
              )}

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
              {privilegio !== 4 && (
              <button className="submenu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/config-descuentos'); setMobileMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 9l6 6"/>
                  <path d="M9 15l6-6"/>
                </svg>
                Descuentos
              </button>
              )}
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
        )}

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
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  navigate('/gastos');
                  setMobileMenuOpen(false);
                  setShowMiOperacionSubmenu(false);
                }}
                disabled={privilegio === 3 && !turnoAbierto}
                title={privilegio === 3 && !turnoAbierto ? "Requiere turno abierto para registrar gastos" : "Registro de Gastos"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Gastos
              </button>
              {privilegio !== 3 && (
              <button 
                className="submenu-item" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  navigate('/movimientos-inventario'); 
                  setMobileMenuOpen(false); 
                  setShowMiOperacionSubmenu(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Movimientos
              </button>
              )}
              <button
                className="submenu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDashboardView('comandas-pagadas');
                  setMobileMenuOpen(false);
                  setShowMiOperacionSubmenu(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
                Comandas Pagadas
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
              <button
                className="submenu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleAbiertoAhoraWeb();
                  setMobileMenuOpen(false);
                  setShowMiOperacionSubmenu(false);
                }}
                title={abiertoAhoraWeb ? 'Desactivar canal de pedidos WEB' : 'Activar canal de pedidos WEB'}
              >
                {abiertoAhoraWeb ? (
                  <svg viewBox="0 0 24 24" fill="#2563eb" stroke="#2563eb" strokeWidth="2" style={{ color: '#2563eb' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                )}
                Activar pedidos WEB
              </button>
            </div>
          )}
        </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="dashboard-main-content" onClick={() => {
        setShowConfigSubmenu(false);
        setShowConfigNegocioSubmenu(false);
        setShowDashboardSubmenu(false);
        setShowMiOperacionSubmenu(false);
        setShowUserMenu(false);
      }}>
        {dashboardView === 'comandas-pagadas' ? (
          <TableroComandasPagadas onVolver={() => setDashboardView('indicadores')} />
        ) : dashboardView === 'indicadores' ? (
          <div className="content-left">
            <div className="welcome-section">
              <div className="welcome-header-row">
                {/* Comandas del Día label/button */}
                {(() => {
                  const hasPendingOrders = comandasSitioCount > 0;
                  const hasPedidosWeb = pedidosOnline.length > 0;
                  const isClickable = hasPendingOrders || hasPedidosWeb;
                  const accentColor = isClickable ? '#f97316' : '#6b7280';
                  return (
                    <div
                      onClick={() => { if (isClickable) setDashboardView('comandas'); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: isClickable ? 'pointer' : 'default',
                        padding: '0.5rem 1rem',
                        backgroundColor: isClickable ? '#fff7ed' : '#f9fafb',
                        border: `1px solid ${isClickable ? '#f97316' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        userSelect: 'none',
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: accentColor }}>
                        Comandas del Día [{comandasSitioCount}]
                      </span>
                      {hasPedidosWeb && (
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2563eb' }}>
                          Pedidos WEB [{pedidosOnline.length}]
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="cards-grid">
            {privilegio !== 3 && (
            <div className="dashboard-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="card-icon purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h3 className="card-title" style={{ margin: 0 }}>Salud de mi Negocio</h3>
              </div>
              
              {/* Date display in top right */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.7rem', color: '#6b7280', fontWeight: '500' }}>
                {saludNegocio.periodo.mes || (() => {
                  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                  const now = new Date();
                  return `${meses[now.getMonth()]} ${now.getFullYear()}`;
                })()}
              </div>
              
              {/* New Business Health Metrics */}
              {saludNegocio.ventas > 0 ? (
                <div style={{ marginTop: '1rem' }}>
                  {/* Main Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    {/* Ventas */}
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#eff6ff', 
                      borderRadius: '8px',
                      border: '1px solid #dbeafe'
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Ventas
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#3b82f6' }}>
                        ${saludNegocio.ventas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Costo de Venta */}
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Costo de Venta
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#475569' }}>
                        ${saludNegocio.costoVenta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Margen Bruto */}
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f0fdf4', 
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Margen Bruto
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                        ${saludNegocio.margenBruto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* % Margen */}
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#faf5ff', 
                      borderRadius: '8px',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
                        % Margen
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#8b5cf6' }}>
                        {saludNegocio.porcentajeMargen.toFixed(2)}%
                      </div>
                    </div>

                    {/* Gastos */}
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '8px',
                      border: '1px solid #fde68a'
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Gastos
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f59e0b' }}>
                        ${saludNegocio.gastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Utilidad Operativa */}
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Utilidad Operativa
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: saludNegocio.utilidadOperativa >= 0 ? '#0ea5e9' : '#dc2626' }}>
                        ${saludNegocio.utilidadOperativa.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Separador */}
                  <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '0.75rem' }}></div>

                  {/* Visual Indicator - Margin Health */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#6b7280', marginBottom: '0.35rem', fontWeight: '500', textAlign: 'center' }}>
                      {saludNegocio.clasificacion ? `Estado: ${saludNegocio.clasificacion}` : 'Estado del Margen'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      height: '20px', 
                      borderRadius: '10px', 
                      overflow: 'hidden',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      backgroundColor: '#f3f4f6'
                    }}>
                      <div style={{
                        width: `${Math.min(Math.max(saludNegocio.porcentajeMargen, 0), 100)}%`,
                        backgroundColor: saludNegocio.colorMargen || (
                          saludNegocio.porcentajeMargen >= 30 
                            ? '#10b981' // green - healthy
                            : saludNegocio.porcentajeMargen >= 15
                              ? '#f59e0b' // amber - warning
                              : '#ef4444' // red - critical
                        ),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.55rem',
                        fontWeight: '700',
                        transition: 'width 0.3s ease, background-color 0.3s ease'
                      }}>
                        {saludNegocio.porcentajeMargen > 0 && `${saludNegocio.porcentajeMargen.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div style={{ 
                    textAlign: 'center', 
                    fontSize: '0.65rem', 
                    color: saludNegocio.colorMargen || (saludNegocio.margenBruto > 0 ? '#10b981' : '#ef4444'),
                    fontWeight: '600',
                    marginBottom: saludNegocio.alertas && saludNegocio.alertas.length > 0 ? '0.75rem' : '0.5rem'
                  }}>
                    {saludNegocio.descripcionMargen || (
                      saludNegocio.margenBruto > 0
                        ? saludNegocio.porcentajeMargen >= 30
                          ? '✓ Margen saludable'
                          : saludNegocio.porcentajeMargen >= 15
                            ? '⚠ Margen aceptable'
                            : '⚠ Margen bajo'
                        : '⚠ Sin margen de ganancia'
                    )}
                  </div>

                  {/* Alertas y Sugerencias */}
                  {saludNegocio.alertas && saludNegocio.alertas.length > 0 && (
                    <>
                      {/* Separador */}
                      <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '0.75rem' }}></div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ 
                          fontSize: '0.6rem', 
                          fontWeight: '600', 
                          color: '#374151', 
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <span style={{ fontSize: '0.7rem' }}>⚠️</span>
                          Sugerencias de Mejora
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {saludNegocio.alertas.map((alerta, index) => (
                            <div 
                              key={index}
                              style={{ 
                                padding: '0.5rem', 
                                backgroundColor: '#fef3c7', 
                                borderLeft: '3px solid #f59e0b',
                                borderRadius: '4px'
                              }}
                            >
                              <div style={{ 
                                fontSize: '0.55rem', 
                                fontWeight: '600', 
                                color: '#92400e',
                                marginBottom: '0.15rem'
                              }}>
                                {alerta.mensaje}
                              </div>
                              <div style={{ 
                                fontSize: '0.5rem', 
                                color: '#78350f',
                                lineHeight: '1.3'
                              }}>
                                {alerta.descripcion}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="card-stat" style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                  Sin datos del mes
                </div>
              )}
            </div>
            )}

            {/* Card de Ventas Hoy - Rediseñado según mockup */}
            <div className="dashboard-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div className="card-icon blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <h3 className="card-title" style={{ margin: 0 }}>Ventas Hoy</h3>
              </div>

              {/* Turno Actual - Solo mostrar si hay turno abierto */}
              {turnoAbierto && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.6rem', color: '#9ca3af', marginBottom: '0.25rem', fontWeight: '500' }}>
                    Turno Actual
                  </p>
                  <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6', margin: 0, lineHeight: '1' }}>
                    {turnoAbierto.numeroturno}
                  </p>
                </div>
              )}

              {/* Título: Tipo de Venta */}
              <h4 style={{ fontSize: '0.7rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                Tipo de Venta
              </h4>

              {/* Gráfico de Barras Horizontales - Por Tipo de Venta */}
              <div style={{ marginBottom: '1rem' }}>
                {(() => {
                  const coloresTipoVenta: Record<string, string> = {
                    'MESA': '#3b82f6',
                    'DOMICILIO': '#f59e0b',
                    'LLEVAR': '#f97316',
                    'ONLINE': '#8b5cf6'
                  };
                  const datosTipoVenta = resumenVentas.ventasPorTipoDeVenta || [];
                  if (datosTipoVenta.length === 0) {
                    return (
                      <p style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center' }}>Sin ventas registradas</p>
                    );
                  }
                  const totalTipoVenta = datosTipoVenta.reduce((sum, item) => sum + item.total, 0) || 1;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {datosTipoVenta.map((item, index) => {
                        const percentage = totalTipoVenta > 0 ? (item.total / totalTipoVenta) * 100 : 0;
                        const color = coloresTipoVenta[item.tipodeventa] || '#9ca3af';
                        return (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }}></div>
                                <span style={{ fontSize: '0.65rem', color: '#374151', fontWeight: '600' }}>
                                  {item.tipodeventa}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: color }}>
                                ${item.total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '20px', backgroundColor: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${percentage}%`,
                                height: '100%',
                                backgroundColor: color,
                                borderRadius: '10px',
                                transition: 'width 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                paddingRight: percentage > 15 ? '0.5rem' : '0'
                              }}>
                                {percentage > 15 && (
                                  <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'white' }}>
                                    {percentage.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Separador */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }}></div>

              {/* Título: Forma de Pago */}
              <h4 style={{ fontSize: '0.7rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                Forma de Pago
              </h4>

              {/* Gráfico de Barras Horizontales - EFECTIVO y TRANSFERENCIA (MIXTO distribuido) */}
              <div style={{ marginBottom: '1rem' }}>
                {(() => {
                  const apiDataFP = resumenVentas.ventasPorFormaDePago || [];
                  const efectivoAPI = apiDataFP.find(item => item.formadepago === 'EFECTIVO')?.total || 0;
                  const transferenciaAPI = apiDataFP.find(item => item.formadepago === 'TRANSFERENCIA')?.total || 0;
                  const mixtoAPI = apiDataFP.find(item => item.formadepago === 'MIXTO')?.total || 0;
                  const { efectivo: efectivoTotal, transferencia: transferenciaTotal } = distribuirMixto(efectivoAPI, transferenciaAPI, mixtoAPI);
                  const datosFP = [
                    { formadepago: 'EFECTIVO', total: efectivoTotal, color: '#10b981' },
                    { formadepago: 'TRANSFERENCIA', total: transferenciaTotal, color: '#8b5cf6' }
                  ];
                  const totalFP = datosFP.reduce((sum, item) => sum + item.total, 0) || 1;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {datosFP.map((item, index) => {
                        const percentage = totalFP > 0 ? (item.total / totalFP) * 100 : 0;
                        return (
                          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: item.color }}></div>
                                <span style={{ fontSize: '0.65rem', color: '#374151', fontWeight: '600' }}>
                                  {item.formadepago}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: item.color }}>
                                ${item.total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '20px', backgroundColor: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${percentage}%`,
                                height: '100%',
                                backgroundColor: item.color,
                                borderRadius: '10px',
                                transition: 'width 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                paddingRight: percentage > 15 ? '0.5rem' : '0'
                              }}>
                                {percentage > 15 && (
                                  <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'white' }}>
                                    {percentage.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Separador */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }}></div>

              {/* Cobrado y Ordenado en la parte inferior */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.3rem', fontWeight: '500' }}>
                    Cobrado:
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
                    ${resumenVentas.totalCobrado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.3rem', fontWeight: '500' }}>
                    Ordenado:
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f97316', margin: 0 }}>
                    ${resumenVentas.totalOrdenado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.3rem', fontWeight: '500' }}>
                    Gastos:
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444', margin: 0 }}>
                    ${resumenVentas.totalGastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0.3rem', fontWeight: '500' }}>
                    Descuentos:
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>
                    ${resumenVentas.totalDescuentos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Barra de progreso: Meta de Venta vs Cobrado */}
              {resumenVentas.metaTurno > 0 && (
                <>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }}></div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#374151', fontWeight: '600' }}>
                        Meta de Venta
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280' }}>
                        ${resumenVentas.metaTurno.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {(() => {
                      const pct = Math.min((resumenVentas.totalCobrado / Math.max(resumenVentas.metaTurno, 1)) * 100, 100);
                      const goalReached = resumenVentas.totalCobrado >= resumenVentas.metaTurno;
                      const barColor = goalReached ? '#10b981' : '#3b82f6';
                      return (
                        <>
                          <div style={{
                            width: '100%',
                            height: '18px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '9px',
                            overflow: 'hidden',
                            marginBottom: '0.3rem'
                          }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              backgroundColor: barColor,
                              borderRadius: '9px',
                              transition: 'width 0.4s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: pct > 15 ? '0.4rem' : '0'
                            }}>
                              {pct > 15 && (
                                <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'white' }}>
                                  {pct.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>
                              Cobrado: ${resumenVentas.totalCobrado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: '0.6rem', fontWeight: '600', color: barColor }}>
                              {goalReached ? '¡Meta alcanzada!' : `${pct.toFixed(1)}% de la meta`}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>

            {privilegio !== 3 && (
            <div className="dashboard-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="card-icon green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <h3 className="card-title" style={{ margin: 0 }}>Inventario</h3>
              </div>
              <p className="card-text">Valor de Inventario</p>
              <div className="card-stat">
                ${saludNegocio.valorInventario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              {/* Indicador de Nivel de Inventario - Más compacto */}
              <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                backgroundColor: `${nivelInventario.color}15`,
                border: `1px solid ${nivelInventario.color}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{ fontSize: '1rem' }}>{nivelInventario.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: nivelInventario.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    {nivelInventario.nivel}
                  </div>
                  <div style={{
                    fontSize: '0.6rem',
                    color: '#6b7280',
                    marginTop: '0.1rem'
                  }}>
                    {nivelInventario.mensaje}
                  </div>
                </div>
              </div>

              {/* TOP10 productos del turno */}
              {(topProductosMayor.length > 0 || topProductosMenor.length > 0) && (
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  gap: '0.4rem'
                }}>
                  {/* Sección A: Mayor importe */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.55rem',
                      fontWeight: '700',
                      color: '#10b981',
                      textTransform: 'uppercase',
                      marginBottom: '0.2rem',
                      letterSpacing: '0.2px'
                    }}>▲ Top Mayor</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.5rem' }}>
                      <tbody>
                        {topProductosMayor.map((p, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1px 2px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '0', width: '70%' }} title={p.nombreproducto}>{p.nombreproducto}</td>
                            <td style={{ padding: '1px 2px', color: '#10b981', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>${p.importetotal.toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Sección B: Menor importe */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.55rem',
                      fontWeight: '700',
                      color: '#f59e0b',
                      textTransform: 'uppercase',
                      marginBottom: '0.2rem',
                      letterSpacing: '0.2px'
                    }}>▼ Top Menor</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.5rem' }}>
                      <tbody>
                        {topProductosMenor.map((p, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1px 2px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '0', width: '70%' }} title={p.nombreproducto}>{p.nombreproducto}</td>
                            <td style={{ padding: '1px 2px', color: '#f59e0b', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>${p.importetotal.toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
          </div>
        ) : (
          <>
            <div className="content-left">
              {/* Sección de Comandas del Día */}
              {comandasSitioCount > 0 ? (
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
                    {ventasFiltradas.map((venta) => {
                      const isWebOrdenado = venta.origenventa === 'WEB' && venta.estadodeventa === 'ORDENADO';
                      const displayTipo: TipoDeVenta = isWebOrdenado ? 'ONLINE' : venta.tipodeventa;
                      return (
                      <div key={venta.idventa} className={`venta-solicitada-card ${getTipoVentaColorClass(displayTipo)}${isWebOrdenado ? ' origen-web' : ''}`}>
                        {/* Card Header: short folio + tipo label */}
                        <div className="venta-card-header">
                          <span className="venta-folio">
                            {getShortFolio(displayTipo, venta.idventa)}
                          </span>
                          <span className={`venta-tipo-chip ${getTipoVentaColorClass(displayTipo)}`}>
                            <span className="venta-tipo-chip-icon">
                              <TipoVentaIcon tipo={displayTipo} />
                            </span>
                            {displayTipo}
                          </span>
                        </div>

                        {/* Card Body */}
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
                          
                          {/* Status selector - only show for native ONLINE sales, not WEB-origin cards */}
                          {venta.tipodeventa === 'ONLINE' && !isWebOrdenado && (
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

                        {/* Card Footer */}
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
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }}>
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No hay comandas del día</p>
                </div>
              )}
            </div>

            {/* Tablero de Pedidos WEB - Lado Derecho */}
            <aside className="pedidos-panel">
              <div className="panel-header">
                <h2 className="panel-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  Pedidos WEB
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
                      <span className={`badge ${getEstadoBadgeClass(pedido.estadodeventa)}`}>
                        {getEstadoTexto(pedido.estadodeventa)}
                      </span>
                    </div>
                    <p className="pedido-productos">{pedido.productos}</p>
                    <div className="pedido-footer">
                      <span className="pedido-total">${(Number(pedido.total) || 0).toFixed(2)}</span>
                      <button
                        className="btn-small"
                        onClick={() => {
                          const venta = ventasSolicitadas.find(v => v.idventa === pedido.id);
                          if (venta) handleVerDetalle(venta);
                        }}
                      >Ver detalle</button>
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
                  <p>No hay pedidos WEB activos</p>
                </div>
              )}
            </aside>
          </>
        )}
      </div>

      {/* Componente de Bloqueo de Pantalla */}
      {isScreenLocked && (
        <div 
          className="screen-lock-overlay"
          onClick={() => setIsScreenLocked(false)}
        >
          <div className="screen-lock-content">
            <div className="lock-logo">
              <img src={negocio?.logotipo || "/logowebposcrumen.svg"} alt="Logo" />
            </div>
            <h2 className="lock-title">{negocio?.nombreNegocio || 'POSWEB Crumen'}</h2>
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
