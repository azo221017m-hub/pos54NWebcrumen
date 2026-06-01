import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProductosWeb } from '../../services/productosWebService';
import { negociosService } from '../../services/negociosService';
import { obtenerCategorias } from '../../services/categoriasService';
import { crearVentaWeb, agregarDetallesAVenta } from '../../services/ventasWebService';
import { verificarTurnoAbierto } from '../../services/turnosService';
import { clearSession } from '../../services/sessionService';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../components/FeedbackToast';
import { extractShortFolio } from '../../utils/formatters';
import { obtenerMesas } from '../../services/mesasService';
import { obtenerCatModeradores } from '../../services/catModeradoresService';
import { obtenerModeradores } from '../../services/moderadoresService';
import { buscarClientesPorReferencia } from '../../services/clientesService';
import { registrarLog } from '../../services/logService';
import { getPaperConfig } from '../../utils/ticketLayout';
import ModalIniciaTurno from '../../components/turnos/ModalIniciaTurno';
import ModuloPagos from '../../components/ventas/ModuloPagos';
import useIsMobile from '../../hooks/useIsMobile';
import type { ProductoWeb } from '../../types/productoWeb.types';
import type { Negocio } from '../../types/negocio.types';
import type { Categoria } from '../../types/categoria.types';
import type { TipoServicio } from '../../types/mesa.types';
import type { Mesa } from '../../types/mesa.types';
import type { CatModerador } from '../../types/catModerador.types';
import type { Moderador } from '../../types/moderador.types';
import type { VentaWebCreate, EstadoDeVenta, TipoDeVenta, EstadoDetalle, EstatusDePago, OrigenVenta } from '../../types/ventasWeb.types';
import './PageVentasMobile.css';

// ── Types ──────────────────────────────────────────────────
type TipoModerador = 'SOLO CON' | 'SIN' | 'LIMPIO';

interface ItemComanda {
  producto: ProductoWeb;
  cantidad: number;
  notas?: string;
  moderadores?: string;
  moderadoresNames?: string[];
  tipoModerador?: TipoModerador;
  estadodetalle?: EstadoDetalle;
  comensal?: string;
  iddetalleventa?: number;
}

// ── Constants ──────────────────────────────────────────────
const ESTATUS_ACTIVO = 1;
const ESTADO_ORDENADO: EstadoDetalle = 'ORDENADO';
const STEPS = ['Servicio', 'Catálogo', 'Comanda', 'Pago'] as const;
type Step = 0 | 1 | 2 | 3;

// ── Step icons ─────────────────────────────────────────────
const SERVICE_ICONS: Record<TipoServicio, string> = {
  Mesa: '🍽️',
  Llevar: '🛍️',
  Domicilio: '🛵',
};

const PageVentasMobile: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect desktop users away from this mobile page
  useEffect(() => {
    if (!isMobile) {
      navigate('/ventas', { replace: true });
    }
  }, [isMobile, navigate]);

  const privilegio = Number(localStorage.getItem('privilegio') || '0');
  const usuario = (() => {
    try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
  })();

  // ── Data state ─────────────────────────────────────────
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<ProductoWeb[]>([]);
  const [productosVisibles, setProductosVisibles] = useState<ProductoWeb[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // ── UI state ──────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showIniciaTurnoModal, setShowIniciaTurnoModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [imprimirChecked, setImprimirChecked] = useState(true);

  // ── Servicio state ────────────────────────────────────
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>('Mesa');
  const [mesaNombre, setMesaNombre] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [telefonoEntrega, setTelefonoEntrega] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [isServiceConfigured, setIsServiceConfigured] = useState(false);

  // ── Comanda state ─────────────────────────────────────
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  const [currentVentaId, setCurrentVentaId] = useState<number | null>(null);
  const [currentFolioVenta, setCurrentFolioVenta] = useState<string | null>(null);

  // ── Nota sheet ────────────────────────────────────────
  const [showNotaSheet, setShowNotaSheet] = useState(false);
  const [editingNotaIdx, setEditingNotaIdx] = useState<number | null>(null);
  const [tempNota, setTempNota] = useState('');

  // ── Mesa state ────────────────────────────────────────
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [referenciaCliente, setReferenciaCliente] = useState('');

  // ── Moderador state ───────────────────────────────────
  const [catModeradores, setCatModeradores] = useState<CatModerador[]>([]);
  const [moderadoresList, setModeradores] = useState<Moderador[]>([]);
  const [showModSheet, setShowModSheet] = useState(false);
  const [modProducto, setModProducto] = useState<ProductoWeb | null>(null);
  const [modTipo, setModTipo] = useState<TipoModerador>('LIMPIO');
  const [modIdsSelected, setModIdsSelected] = useState<number[]>([]);
  const [modStep, setModStep] = useState<'tipo' | 'lista'>('tipo');

  // ── Load data on mount ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        // Check turno
        const turno = await verificarTurnoAbierto();
        if (!turno) {
          setShowIniciaTurnoModal(true);
        }

        // Load products, categories
        const [prods, cats] = await Promise.all([
          obtenerProductosWeb(),
          obtenerCategorias(),
        ]);
        const activos = prods.filter(p => p.estatus === ESTATUS_ACTIVO && p.tipoproducto !== 'Materia Prima');
        setProductos(activos);
        setProductosVisibles(activos);
        const catsActivas = cats.filter(c => c.estatus === ESTATUS_ACTIVO);
        setCategorias(catsActivas);

        // Load mesas, catModeradores, moderadores in parallel
        const idNegocio = usuario?.idNegocio;
        const [mesasData, catMods, mods] = await Promise.all([
          obtenerMesas().catch(() => [] as Mesa[]),
          obtenerCatModeradores().catch(() => [] as CatModerador[]),
          idNegocio ? obtenerModeradores(idNegocio).catch(() => [] as Moderador[]) : Promise.resolve([] as Moderador[]),
        ]);
        setMesas(mesasData);
        setCatModeradores(catMods);
        setModeradores(mods);

        // Load negocio
        if (usuario?.idNegocio) {
          const negData = await negociosService.obtenerNegocioPorId(usuario.idNegocio);
          if (negData?.negocio) setNegocio(negData.negocio);
          if (negData?.parametros) {
            setImprimirChecked(negData.parametros.impresionComanda === 1);
          }
        }
      } catch (err) {
        console.error('PageVentasMobile init error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter products ───────────────────────────────────
  useEffect(() => {
    let filtrados = productos;
    if (categoriaSeleccionada !== null) {
      filtrados = filtrados.filter(p => p.idCategoria === categoriaSeleccionada);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtrados = filtrados.filter(
        p => p.nombre.toLowerCase().includes(lower) || p.descripcion.toLowerCase().includes(lower)
      );
    }
    setProductosVisibles(filtrados);
  }, [searchTerm, productos, categoriaSeleccionada]);

  // ── Helpers ───────────────────────────────────────────
  const calcularTotal = () =>
    comanda.reduce((t, item) => t + (Number(item.producto.precio) || 0) * item.cantidad, 0);

  const getServiceLabel = (): string => {
    if (tipoServicio === 'Mesa') {
      if (mesaSeleccionada) return `Mesa ${mesaSeleccionada.numeromesa}`;
      return mesaNombre ? `Mesa: ${mesaNombre}` : 'Mesa';
    }
    if (tipoServicio === 'Llevar') return clienteNombre || 'Mostrador';
    if (tipoServicio === 'Domicilio') return clienteNombre || 'Domicilio';
    return tipoServicio;
  };

  const agregarAComanda = (producto: ProductoWeb, moderadores?: string, moderadoresNames?: string[]) => {
    setComanda(prev => {
      // When no moderadores specified (e.g. increment +), find first matching non-ordered item
      if (moderadores === undefined) {
        const existente = prev.find(
          item => item.producto.idProducto === producto.idProducto && item.estadodetalle !== ESTADO_ORDENADO
        );
        if (existente) {
          return prev.map(item =>
            item === existente ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        }
        return [...prev, { producto, cantidad: 1 }];
      }
      // When moderadores specified, match on both product and moderadores string
      const existente = prev.find(
        item =>
          item.producto.idProducto === producto.idProducto &&
          item.estadodetalle !== ESTADO_ORDENADO &&
          (item.moderadores || '') === (moderadores || '')
      );
      if (existente) {
        return prev.map(item =>
          item === existente ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto, cantidad: 1, moderadores, moderadoresNames }];
    });
  };

  // ── Moderador helpers ────────────────────────────────
  const getAvailableModeradores = (idCategoria: number): Moderador[] => {
    const cat = categorias.find(c => c.idCategoria === idCategoria);
    if (!cat) return [];
    const v = cat.idmoderadordef;
    if (v === null || v === undefined || v === '' || v === '0' || v === 0) return [];
    let catModIds: number[] = [];
    if (typeof v === 'string') {
      catModIds = v.split(',').map(id => Number(id.trim())).filter(id => id > 0);
    } else if (typeof v === 'number' && v > 0) {
      catModIds = [v];
    }
    const matchedCatMods = catModeradores.filter(cm => catModIds.includes(cm.idmodref));
    const allModIds: number[] = [];
    for (const cm of matchedCatMods) {
      const str = cm.moderadores?.trim();
      if (str) {
        str.split(',').map(id => Number(id.trim())).filter(id => id > 0).forEach(id => allModIds.push(id));
      }
    }
    const uniqueIds = Array.from(new Set(allModIds));
    return moderadoresList.filter(m => uniqueIds.includes(m.idmoderador));
  };

  const getCantidadEnComanda = (idProducto: number) =>
    comanda
      .filter(item => item.producto.idProducto === idProducto)
      .reduce((s, item) => s + item.cantidad, 0);

  // ── Reference lookup ─────────────────────────────────
  const handleReferenciaBlur = async () => {
    if (!referenciaCliente.trim()) return;
    try {
      const clientes = await buscarClientesPorReferencia(referenciaCliente.trim());
      if (clientes.length > 0) {
        const c = clientes[0];
        const parts = [`Nombre: ${c.nombre}`];
        if (c.telefono) parts.push(`Tel: ${c.telefono}`);
        if (c.direccion) parts.push(`Dir: ${c.direccion}`);
        showInfoToast(`Cliente encontrado · ${parts.join(' · ')}`);
      } else {
        showInfoToast('Cliente no registrado');
      }
    } catch {
      // ignore - do not block the sale
    }
  };

  // ── Moderador product add ─────────────────────────────
  const handleAddProducto = (prod: ProductoWeb) => {
    const availableMods = getAvailableModeradores(prod.idCategoria);
    if (availableMods.length > 0) {
      setModProducto(prod);
      setModTipo('LIMPIO');
      setModIdsSelected([]);
      setModStep('tipo');
      setShowModSheet(true);
    } else {
      agregarAComanda(prod);
    }
  };

  const handleConfirmModerador = () => {
    if (!modProducto) return;
    const availableMods = getAvailableModeradores(modProducto.idCategoria);
    let moderadoresStr: string | undefined;
    let moderadoresNames: string[] | undefined;
    if (modTipo === 'LIMPIO') {
      moderadoresStr = 'LIMPIO';
      moderadoresNames = ['LIMPIO'];
    } else if (modTipo === 'SIN') {
      if (modIdsSelected.length === 0) {
        moderadoresStr = 'LIMPIO';
        moderadoresNames = ['LIMPIO'];
      } else {
        moderadoresStr = `SIN:${modIdsSelected.join(',')}`;
        moderadoresNames = modIdsSelected
          .flatMap(id => {
            const name = availableMods.find(m => m.idmoderador === id)?.nombremoderador;
            return name ? [`SIN ${name}`] : [];
          });
      }
    } else {
      if (modIdsSelected.length === 0) {
        moderadoresStr = undefined;
        moderadoresNames = undefined;
      } else {
        moderadoresStr = modIdsSelected.join(',');
        moderadoresNames = modIdsSelected
          .flatMap(id => {
            const name = availableMods.find(m => m.idmoderador === id)?.nombremoderador;
            return name ? [name] : [];
          });
      }
    }
    agregarAComanda(modProducto, moderadoresStr, moderadoresNames);
    setShowModSheet(false);
    setModProducto(null);
    setModIdsSelected([]);
    setModStep('tipo');
  };

  const cambiarCantidad = (index: number, delta: number) => {
    setComanda(prev => {
      const item = prev[index];
      if (!item || item.estadodetalle === ESTADO_ORDENADO) return prev;
      const nuevaCantidad = item.cantidad + delta;
      if (nuevaCantidad <= 0) return prev.filter((_, i) => i !== index);
      return prev.map((it, i) => (i === index ? { ...it, cantidad: nuevaCantidad } : it));
    });
  };

  const handlePostVenta = useCallback(() => {
    if (privilegio === 2) {
      // Stay on mobile ventas, reset
      setComanda([]);
      setIsServiceConfigured(false);
      setCurrentVentaId(null);
      setCurrentFolioVenta(null);
      setCurrentStep(0);
    } else {
      navigate('/dashboard-mobile', { replace: true });
    }
  }, [privilegio, navigate]);

  // ── Service config validation ─────────────────────────
  const validateServiceConfig = (): boolean => {
    if (tipoServicio === 'Mesa') {
      if (!mesaNombre.trim()) { showErrorToast('Ingresa el nombre o número de mesa'); return false; }
    } else if (tipoServicio === 'Llevar') {
      if (!clienteNombre.trim()) { showErrorToast('Ingresa el nombre del cliente'); return false; }
    } else if (tipoServicio === 'Domicilio') {
      if (!clienteNombre.trim()) { showErrorToast('Ingresa el nombre del cliente'); return false; }
      if (!direccionEntrega.trim()) { showErrorToast('Ingresa la dirección de entrega'); return false; }
    }
    return true;
  };

  const handleConfirmService = () => {
    if (!validateServiceConfig()) return;
    setIsServiceConfigured(true);
    setCurrentStep(1);
  };

  // ── Print comanda ─────────────────────────────────────
  const imprimirComandaCocina = (items: ItemComanda[]) => {
    const cfg = getPaperConfig();
    const ahora = new Date().toLocaleString('es-MX');
    const nombreNegocio = negocio?.nombreNegocio || 'POS Crumen';
    const tipoLabel = tipoServicio.toUpperCase();
    const clienteLabel =
      tipoServicio === 'Mesa' ? mesaNombre :
      tipoServicio === 'Llevar' ? clienteNombre :
      clienteNombre;

    const escH = (v?: string | null) => (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const itemsHtml = items.map(item => {
      const sub = (Number(item.producto.precio) || 0) * item.cantidad;
      return `<div class="item">
        <b>${escH(item.producto.nombre)}</b><br/>
        ${item.cantidad} x $${Number(item.producto.precio).toFixed(2)} = $${sub.toFixed(2)}
        ${item.notas ? `<br/><small>Nota: ${escH(item.notas)}</small>` : ''}
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Comanda</title>
    <style>body{font-family:'Courier New',monospace;font-size:${cfg.fontSize}px;width:${cfg.cssWidth};margin:0;padding:8px}
    .item{margin:6px 0;border-bottom:1px solid #ccc;padding-bottom:4px}
    @media print{html,body{width:${cfg.cssWidth}}@page{size:${cfg.cssWidth} auto;margin:0}}</style></head>
    <body><b>${escH(nombreNegocio)}</b><br/>COMANDA COCINA<br/>${tipoLabel} | ${escH(clienteLabel)}<br/>${escH(ahora)}<hr/>${itemsHtml}</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', `width=${cfg.popupWidth},height=500`);
    if (win) win.addEventListener('unload', () => URL.revokeObjectURL(url));
    else URL.revokeObjectURL(url);
  };

  // ── Create venta ──────────────────────────────────────
  const crearVenta = async (
    estadodeventa: EstadoDeVenta,
    estadodetalle: EstadoDetalle,
    estatusdepago: EstatusDePago,
    accionLog?: string
  ): Promise<boolean> => {
    if (comanda.length === 0) { showErrorToast('No hay productos en la comanda'); return false; }
    if (!usuario) { showErrorToast('Usuario no autenticado'); return false; }
    if (!isServiceConfigured) { showErrorToast('Configure el tipo de servicio'); return false; }

    const itemsToInsert = comanda.filter(item => item.estadodetalle !== ESTADO_ORDENADO);
    if (itemsToInsert.length === 0) { showErrorToast('Todos los productos ya han sido ordenados'); return false; }

    const hasOrdenado = comanda.some(item => item.estadodetalle === ESTADO_ORDENADO);

    setIsProcessing(true);
    try {
      const tipoDeVentaMap: Record<TipoServicio, TipoDeVenta> = {
        Mesa: 'MESA', Llevar: 'LLEVAR', Domicilio: 'DOMICILIO',
      };

      let cliente = usuario.nombre;
      let direcciondeentrega: string | null = null;
      let contactodeentrega: string | null = null;
      let telefonodeentrega: string | null = telefonoEntrega || null;
      let fechaprogramadaentrega: string | null = null;

      if (tipoServicio === 'Mesa') {
        const mesaLabel = mesaSeleccionada ? `Mesa ${mesaSeleccionada.numeromesa}` : mesaNombre;
        cliente = `Mesa: ${mesaLabel}`;
        telefonodeentrega = null;
      } else if (tipoServicio === 'Llevar') {
        cliente = telefonoEntrega || clienteNombre;
        telefonodeentrega = telefonoEntrega || null;
      } else if (tipoServicio === 'Domicilio') {
        cliente = telefonoEntrega || clienteNombre;
        direcciondeentrega = direccionEntrega;
        telefonodeentrega = telefonoEntrega || null;
        contactodeentrega = clienteNombre || null;
      }

      const detallesData = itemsToInsert.map(item => ({
        idproducto: item.producto.idProducto,
        nombreproducto: item.producto.nombre,
        idreceta:
          (item.producto.tipoproducto === 'Receta' || item.producto.tipoproducto === 'Inventario') &&
          item.producto.idreferencia
            ? item.producto.idreferencia
            : null,
        tipoproducto: item.producto.tipoproducto,
        cantidad: item.cantidad,
        preciounitario: Number(item.producto.precio),
        costounitario: Number(item.producto.costoproducto),
        observaciones: item.notas || null,
        moderadores: item.moderadores || null,
        comensal: item.comensal || null,
      }));

      let resultado: { success: boolean; idventa?: number; folioventa?: string; message?: string };

      if (hasOrdenado && currentVentaId) {
        resultado = await agregarDetallesAVenta(currentVentaId, detallesData, estadodetalle);
      } else {
        const ventaData: VentaWebCreate = {
          tipodeventa: tipoDeVentaMap[tipoServicio],
          cliente,
          formadepago: 'sinFP',
          direcciondeentrega,
          contactodeentrega,
          telefonodeentrega,
          fechaprogramadaentrega: fechaprogramadaentrega || undefined,
          estadodeventa,
          estatusdepago,
          estadodetalle,
          descripcionmov: 'VENTA',
          origenventa: 'SITIO' as OrigenVenta,
          detalles: detallesData,
        };
        resultado = await crearVentaWeb(ventaData);
        if (resultado.success && resultado.idventa && resultado.folioventa) {
          setCurrentVentaId(resultado.idventa);
          setCurrentFolioVenta(resultado.folioventa);
        }
      }

      if (resultado.success) {
        showSuccessToast(`Venta: ${extractShortFolio(resultado.folioventa || '')}`);
        if (accionLog) {
          const desc = hasOrdenado && currentVentaId ? 'UPDATE' : 'CREATE';
          registrarLog('Mi Operación', accionLog, desc, {
            tabla_afectada: 'tblposcrumenwebventas',
            idregistro: resultado.idventa ?? null,
          });
        }
        setComanda(prev =>
          prev.map(item =>
            item.estadodetalle !== ESTADO_ORDENADO ? { ...item, estadodetalle } : item
          )
        );
        return true;
      } else {
        showErrorToast(resultado.message || 'Error al registrar venta');
        return false;
      }
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : 'Error de conexión');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProducir = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    const itemsParaImprimir = comanda.filter(item => item.estadodetalle !== ESTADO_ORDENADO);
    try {
      const ok = await crearVenta(ESTADO_ORDENADO, ESTADO_ORDENADO, 'PENDIENTE', 'Producir');
      if (ok) {
        if (imprimirChecked && itemsParaImprimir.length > 0) imprimirComandaCocina(itemsParaImprimir);
        handlePostVenta();
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleEsperar = async () => {
    const ok = await crearVenta('ESPERAR', 'ESPERAR', 'ESPERAR', 'Esperar');
    if (ok) handlePostVenta();
  };

  const handlePagarPress = async () => {
    if (currentVentaId) {
      setCurrentStep(3);
      return;
    }
    // Need to create venta first before showing payment
    const ok = await crearVenta(ESTADO_ORDENADO, ESTADO_ORDENADO, 'PENDIENTE', 'Pagar');
    if (ok) setCurrentStep(3);
  };

  const handleCancelar = async () => {
    setComanda([]);
    setIsServiceConfigured(false);
    setCurrentVentaId(null);
    setCurrentFolioVenta(null);
    if (privilegio === 2) {
      setCurrentStep(0);
      return;
    }
    navigate('/dashboard-mobile', { replace: true });
  };

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const handleTurnoIniciado = (_turnoId: number, _claveturno: string) => {
    setShowIniciaTurnoModal(false);
  };

  // ── Render ─────────────────────────────────────────────
  if (!usuario) {
    navigate('/login', { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="pvm-loading">
        <div className="pvm-spinner" />
        <span>Cargando...</span>
      </div>
    );
  }

  const totalComanda = calcularTotal();
  const cantidadItems = comanda.reduce((s, i) => s + i.cantidad, 0);

  // Header title by step
  const stepTitles = ['Tipo de Servicio', 'Catálogo', 'Comanda', 'Pago'];

  return (
    <div className="pvm-page">
      {/* ── Header ──────────────────────────────── */}
      <header className="pvm-header">
        <div className="pvm-header-left">
          {currentStep > 0 && (
            <button
              className="pvm-back-btn"
              onClick={() => setCurrentStep((currentStep - 1) as Step)}
              aria-label="Volver"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div>
            <div className="pvm-header-title">{stepTitles[currentStep]}</div>
            <div className="pvm-header-subtitle">
              {negocio?.nombreNegocio || 'Mi Negocio'}
              {isServiceConfigured && currentStep > 0 && ` · ${getServiceLabel()}`}
            </div>
          </div>
        </div>
        <div className="pvm-header-right">
          {cantidadItems > 0 && currentStep < 3 && (
            <button
              className="pvm-badge pvm-badge-orange"
              onClick={() => setCurrentStep(2)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label={`Ver comanda (${cantidadItems} items)`}
            >
              <span className="pvm-badge pvm-badge-orange">{cantidadItems}</span>
            </button>
          )}
          <div style={{ position: 'relative' }}>
            <button
              className="pvm-icon-btn"
              onClick={() => setShowUserMenu(v => !v)}
              aria-label="Menú usuario"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            {showUserMenu && (
              <div className="pvm-user-dropdown">
                <div className="pvm-user-info-bar">
                  <div className="pvm-user-info-name">{usuario.nombre}</div>
                  <div className="pvm-user-info-alias">@{usuario.alias}</div>
                </div>
                {privilegio !== 2 && (
                  <button
                    className="pvm-user-dropdown-item"
                    onClick={() => { setShowUserMenu(false); navigate('/dashboard-mobile'); }}
                  >
                    🏠 Dashboard
                  </button>
                )}
                <button
                  className="pvm-user-dropdown-item danger"
                  onClick={handleLogout}
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Step indicator ─────────────────────── */}
      <div className="pvm-steps">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`pvm-step${i < currentStep ? ' done' : i === currentStep ? ' active' : ''}`}
          />
        ))}
      </div>

      {/* ── Content ─────────────────────────────── */}
      <div className="pvm-content">

        {/* ── Step 0: Tipo Servicio ────────────── */}
        {currentStep === 0 && (
          <div className="pvm-section">
            <div>
              <div className="pvm-section-heading">¿Cómo es esta venta?</div>
              <div className="pvm-section-subtitle">Selecciona el tipo de servicio</div>
            </div>

            <div className="pvm-service-grid">
              {(['Mesa', 'Llevar', 'Domicilio'] as TipoServicio[]).map(tipo => (
                <div
                  key={tipo}
                  className={`pvm-service-card${tipoServicio === tipo ? ' selected' : ''}`}
                  onClick={() => setTipoServicio(tipo)}
                >
                  <span className="pvm-service-card-icon">{SERVICE_ICONS[tipo]}</span>
                  <span className="pvm-service-card-label">{tipo}</span>
                </div>
              ))}
            </div>

            {/* Service config form */}
            {tipoServicio === 'Mesa' && (
              <div className="pvm-field">
                <label className="pvm-label">Mesa / Número</label>
                {mesas.length > 0 ? (
                  <div className="pvm-mesa-grid">
                    {mesas.map(mesa => (
                      <button
                        key={mesa.idmesa}
                        type="button"
                        className={`pvm-mesa-btn${mesaSeleccionada?.idmesa === mesa.idmesa ? ' selected' : ''}`}
                        onClick={() => { setMesaSeleccionada(mesa); setMesaNombre(String(mesa.numeromesa)); }}
                      >
                        Mesa {mesa.numeromesa}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    className="pvm-input"
                    type="text"
                    placeholder="Ej: 1, Mesa VIP, Barra..."
                    value={mesaNombre}
                    onChange={e => setMesaNombre(e.target.value)}
                    autoComplete="off"
                  />
                )}
                <label className="pvm-label" style={{ marginTop: 8 }}>Referencia del Cliente (opcional)</label>
                <input
                  className="pvm-input"
                  type="text"
                  placeholder="Referencia del cliente"
                  value={referenciaCliente}
                  onChange={e => setReferenciaCliente(e.target.value)}
                  onBlur={handleReferenciaBlur}
                  autoComplete="off"
                />
              </div>
            )}

            {tipoServicio === 'Llevar' && (
              <div className="pvm-field">
                <label className="pvm-label">Nombre del cliente</label>
                <input
                  className="pvm-input"
                  type="text"
                  placeholder="Nombre o mostrador"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                  autoComplete="off"
                />
                <label className="pvm-label" style={{ marginTop: 8 }}>Teléfono (opcional)</label>
                <input
                  className="pvm-input"
                  type="tel"
                  placeholder="10 dígitos"
                  value={telefonoEntrega}
                  onChange={e => setTelefonoEntrega(e.target.value)}
                />
              </div>
            )}

            {tipoServicio === 'Domicilio' && (
              <div className="pvm-field">
                <label className="pvm-label">Nombre del cliente</label>
                <input
                  className="pvm-input"
                  type="text"
                  placeholder="Nombre del cliente"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                  autoComplete="off"
                />
                <label className="pvm-label" style={{ marginTop: 8 }}>Teléfono</label>
                <input
                  className="pvm-input"
                  type="tel"
                  placeholder="10 dígitos"
                  value={telefonoEntrega}
                  onChange={e => setTelefonoEntrega(e.target.value)}
                />
                <label className="pvm-label" style={{ marginTop: 8 }}>Dirección de entrega</label>
                <input
                  className="pvm-input"
                  type="text"
                  placeholder="Calle, número, colonia..."
                  value={direccionEntrega}
                  onChange={e => setDireccionEntrega(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Catálogo ─────────────────── */}
        {currentStep === 1 && (
          <div className="pvm-section">
            {/* Service info bar */}
            <div className="pvm-service-info">
              <span className="pvm-service-info-icon">{SERVICE_ICONS[tipoServicio]}</span>
              <div className="pvm-service-info-text">
                <div className="pvm-service-info-title">{tipoServicio}</div>
                <div className="pvm-service-info-detail">{getServiceLabel()}</div>
              </div>
              <button className="pvm-service-info-edit" onClick={() => { setIsServiceConfigured(false); setCurrentStep(0); }}>
                Editar
              </button>
            </div>

            {/* Search */}
            <div className="pvm-search-wrap">
              <svg className="pvm-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="pvm-search"
                type="search"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="pvm-categories">
              <div
                className={`pvm-cat-chip${categoriaSeleccionada === null ? ' active' : ''}`}
                onClick={() => setCategoriaSeleccionada(null)}
              >
                Todos
              </div>
              {categorias.map(cat => (
                <div
                  key={cat.idCategoria}
                  className={`pvm-cat-chip${categoriaSeleccionada === cat.idCategoria ? ' active' : ''}`}
                  onClick={() => setCategoriaSeleccionada(prev => prev === cat.idCategoria ? null : cat.idCategoria)}
                >
                  {cat.nombre}
                </div>
              ))}
            </div>

            {/* Product grid */}
            {productosVisibles.length === 0 ? (
              <div className="pvm-empty">
                <div className="pvm-empty-icon">🔍</div>
                <div className="pvm-empty-text">No se encontraron productos</div>
              </div>
            ) : (
              <div className="pvm-product-grid">
                {productosVisibles.map(prod => {
                  const qty = getCantidadEnComanda(prod.idProducto);
                  return (
                    <div key={prod.idProducto} className="pvm-product-card">
                      {prod.imagenProducto ? (
                        <img className="pvm-product-img" src={prod.imagenProducto} alt={prod.nombre} />
                      ) : (
                        <div className="pvm-product-img-placeholder">🍽️</div>
                      )}
                      {qty > 0 && <span className="pvm-product-qty-badge">{qty}</span>}
                      <div className="pvm-product-name">{prod.nombre}</div>
                      <div className="pvm-product-price">${Number(prod.precio).toFixed(2)}</div>
                      {qty === 0 ? (
                        <button className="pvm-product-add-btn" onClick={() => handleAddProducto(prod)}>
                          + Agregar
                        </button>
                      ) : (
                        <div className="pvm-product-qty-row">
                          <button className="pvm-qty-btn" onClick={() => {
                            let idx = -1;
                            for (let i = comanda.length - 1; i >= 0; i--) {
                              const ci = comanda[i]!;
                              if (ci.producto.idProducto === prod.idProducto && ci.estadodetalle !== ESTADO_ORDENADO) {
                                idx = i; break;
                              }
                            }
                            if (idx >= 0) cambiarCantidad(idx, -1);
                          }}>−</button>
                          <span className="pvm-qty-display">{qty}</span>
                          <button className="pvm-qty-btn" onClick={() => agregarAComanda(prod)}>+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Comanda ──────────────────── */}
        {currentStep === 2 && (
          <div className="pvm-section">
            <div>
              <div className="pvm-section-heading">Tu pedido</div>
              <div className="pvm-section-subtitle">{getServiceLabel()} · {comanda.length} producto{comanda.length !== 1 ? 's' : ''}</div>
            </div>

            {comanda.length === 0 ? (
              <div className="pvm-empty">
                <div className="pvm-empty-icon">🛒</div>
                <div className="pvm-empty-text">No hay productos en la comanda</div>
                <button className="pvm-btn pvm-btn-primary" style={{ marginTop: 8 }} onClick={() => setCurrentStep(1)}>
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="pvm-comanda-list">
                  {comanda.map((item, idx) => {
                    const subtotal = (Number(item.producto.precio) || 0) * item.cantidad;
                    const isOrdenado = item.estadodetalle === ESTADO_ORDENADO;
                    return (
                      <div key={idx} className="pvm-comanda-item">
                        <div className="pvm-comanda-item-info">
                          <div className="pvm-comanda-item-name">{item.producto.nombre}</div>
                          <div className="pvm-comanda-item-price">
                            ${Number(item.producto.precio).toFixed(2)} c/u
                            {item.notas && <span style={{ color: '#94a3b8' }}> · {item.notas}</span>}
                          </div>
                          {item.moderadoresNames && item.moderadoresNames.length > 0 && (
                            <div className="pvm-comanda-item-moderadores">
                              {item.moderadoresNames.join(' · ')}
                            </div>
                          )}
                          {isOrdenado && <div className="pvm-comanda-item-ordered">✓ Ordenado</div>}
                        </div>
                        {!isOrdenado ? (
                          <div className="pvm-comanda-item-controls">
                            <button className="pvm-qty-btn" style={{ background: '#fef2f2', color: '#ef4444' }} onClick={() => cambiarCantidad(idx, -1)}>−</button>
                            <span className="pvm-qty-display" style={{ background: '#fff', minWidth: 32 }}>{item.cantidad}</span>
                            <button className="pvm-qty-btn" onClick={() => cambiarCantidad(idx, 1)}>+</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: '#64748b', minWidth: 32, textAlign: 'center' }}>{item.cantidad}x</span>
                        )}
                        <div className="pvm-comanda-item-total">${subtotal.toFixed(2)}</div>
                        {!isOrdenado && (
                          <button
                            style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '4px', cursor: 'pointer', fontSize: 16 }}
                            onClick={() => { setEditingNotaIdx(idx); setTempNota(item.notas || ''); setShowNotaSheet(true); }}
                            aria-label="Agregar nota"
                          >
                            📝
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pvm-comanda-summary">
                  <div className="pvm-summary-row">
                    <span>Productos ({cantidadItems})</span>
                    <span>${totalComanda.toFixed(2)}</span>
                  </div>
                  <div className="pvm-summary-row total">
                    <span>Total</span>
                    <span>${totalComanda.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                  <input
                    type="checkbox"
                    id="pvm-imprimir"
                    checked={imprimirChecked}
                    onChange={e => setImprimirChecked(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <label htmlFor="pvm-imprimir" style={{ fontSize: 14, color: '#475569' }}>
                    Imprimir comanda de cocina
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 3: Pago (ModuloPagos) ───────── */}
        {currentStep === 3 && currentVentaId && (
          <div className="pvm-section">
            <ModuloPagos
              ventaId={currentVentaId}
              folioventa={currentFolioVenta || ''}
              totalCuenta={totalComanda}
              onClose={handlePostVenta}
              onPaymentSuccess={handlePostVenta}
            />
          </div>
        )}
      </div>

      {/* ── Action bar ───────────────────────────── */}
      {currentStep < 3 && (
        <div className="pvm-action-bar">
          {currentStep === 0 && (
            <>
              <button className="pvm-btn pvm-btn-secondary pvm-btn-sm" onClick={handleCancelar}>
                Cancelar
              </button>
              <button className="pvm-btn pvm-btn-primary" onClick={handleConfirmService}>
                Continuar →
              </button>
            </>
          )}

          {currentStep === 1 && (
            <>
              {comanda.length > 0 && (
                <button
                  className="pvm-btn pvm-btn-secondary pvm-btn-sm"
                  onClick={() => setCurrentStep(2)}
                >
                  Ver pedido ({cantidadItems})
                </button>
              )}
              <button
                className="pvm-btn pvm-btn-primary"
                disabled={comanda.length === 0}
                onClick={() => setCurrentStep(2)}
              >
                Continuar {totalComanda > 0 ? `· $${totalComanda.toFixed(2)}` : ''}
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <button className="pvm-btn pvm-btn-secondary pvm-btn-sm" onClick={() => setCurrentStep(1)}>
                ＋ Más
              </button>
              <button
                className="pvm-btn pvm-btn-warning"
                disabled={comanda.length === 0 || isProcessing}
                onClick={handleEsperar}
              >
                Esperar
              </button>
              <button
                className="pvm-btn pvm-btn-success"
                disabled={comanda.length === 0 || isProcessing}
                onClick={handleProducir}
              >
                {isProcessing ? '...' : 'Producir'}
              </button>
              <button
                className="pvm-btn pvm-btn-primary pvm-btn-sm"
                disabled={comanda.length === 0 || isProcessing}
                onClick={handlePagarPress}
                title="Cobrar"
              >
                💳
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Moderador bottom sheet ───────────────── */}
      {showModSheet && modProducto && (
        <div className="pvm-overlay" onClick={() => setShowModSheet(false)}>
          <div className="pvm-sheet pvm-mod-sheet" onClick={e => e.stopPropagation()}>
            <div className="pvm-sheet-handle" />
            <div className="pvm-sheet-title">{modProducto.nombre}</div>
            <div className="pvm-mod-subtitle">Selecciona el tipo de modificación</div>

            {modStep === 'tipo' && (
              <>
                <div className="pvm-mod-tipo-grid">
                  {(['SOLO CON', 'SIN', 'LIMPIO'] as TipoModerador[]).map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      className={`pvm-mod-tipo-btn${modTipo === tipo ? ' selected' : ''}`}
                      onClick={() => setModTipo(tipo)}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="pvm-btn pvm-btn-secondary" onClick={() => setShowModSheet(false)}>
                    Cancelar
                  </button>
                  {modTipo !== 'LIMPIO' ? (
                    <button className="pvm-btn pvm-btn-primary" onClick={() => setModStep('lista')}>
                      Elegir →
                    </button>
                  ) : (
                    <button className="pvm-btn pvm-btn-primary" onClick={handleConfirmModerador}>
                      Confirmar
                    </button>
                  )}
                </div>
              </>
            )}

            {modStep === 'lista' && (
              <>
                <div className="pvm-mod-list-label">
                  {modTipo === 'SIN' ? 'Excluir:' : 'Incluir solo:'}
                </div>
                <div className="pvm-mod-checkbox-list">
                  {getAvailableModeradores(modProducto.idCategoria).map(m => (
                    <label key={m.idmoderador} className="pvm-mod-checkbox-item">
                      <input
                        type="checkbox"
                        checked={modIdsSelected.includes(m.idmoderador)}
                        onChange={() =>
                          setModIdsSelected(prev =>
                            prev.includes(m.idmoderador)
                              ? prev.filter(id => id !== m.idmoderador)
                              : [...prev, m.idmoderador]
                          )
                        }
                      />
                      <span>{m.nombremoderador}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="pvm-btn pvm-btn-secondary" onClick={() => setModStep('tipo')}>
                    ← Atrás
                  </button>
                  <button className="pvm-btn pvm-btn-primary" onClick={handleConfirmModerador}>
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Nota bottom sheet ────────────────── */}
      {showNotaSheet && (
        <div className="pvm-overlay" onClick={() => setShowNotaSheet(false)}>
          <div className="pvm-sheet" onClick={e => e.stopPropagation()}>
            <div className="pvm-sheet-handle" />
            <div className="pvm-sheet-title">Nota para el producto</div>
            <textarea
              className="pvm-input"
              rows={3}
              placeholder="Ej: sin cebolla, bien cocido..."
              value={tempNota}
              onChange={e => setTempNota(e.target.value)}
              style={{ resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="pvm-btn pvm-btn-secondary"
                onClick={() => { setShowNotaSheet(false); setEditingNotaIdx(null); setTempNota(''); }}
              >
                Cancelar
              </button>
              <button
                className="pvm-btn pvm-btn-primary"
                onClick={() => {
                  if (editingNotaIdx !== null) {
                    setComanda(prev =>
                      prev.map((item, i) =>
                        i === editingNotaIdx ? { ...item, notas: tempNota.trim() || undefined } : item
                      )
                    );
                  }
                  setShowNotaSheet(false);
                  setEditingNotaIdx(null);
                  setTempNota('');
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────── */}
      {showIniciaTurnoModal && (
        <ModalIniciaTurno
          isOpen={showIniciaTurnoModal}
          onCancelar={() => navigate('/dashboard-mobile')}
          onTurnoIniciado={handleTurnoIniciado}
        />
      )}
    </div>
  );
};

export default PageVentasMobile;
