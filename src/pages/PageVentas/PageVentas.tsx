import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, ChevronLeft, ChevronRight, StickyNote } from 'lucide-react';
import { obtenerProductosWeb } from '../../services/productosWebService';
import { negociosService } from '../../services/negociosService';
import { obtenerCategorias } from '../../services/categoriasService';
import { crearVentaWeb } from '../../services/ventasWebService';
import { obtenerModeradores } from '../../services/moderadoresService';
import { obtenerModeradoresRef } from '../../services/moderadoresRefService';
import { verificarTurnoAbierto } from '../../services/turnosService';
import ModalTipoServicio from '../../components/ventas/ModalTipoServicio';
import ModalSeleccionVentaPageVentas from '../../components/ventas/ModalSeleccionVentaPageVentas';
import ModalIniciaTurno from '../../components/turnos/ModalIniciaTurno';
import FichaDeComanda from '../../components/ventas/FichaDeComanda';
import type { MesaFormData, LlevarFormData, DomicilioFormData } from '../../components/ventas/ModalTipoServicio';
import type { ProductoWeb } from '../../types/productoWeb.types';
import type { Usuario } from '../../types/usuario.types';
import type { Negocio } from '../../types/negocio.types';
import type { Categoria } from '../../types/categoria.types';
import type { TipoServicio } from '../../types/mesa.types';
import type { VentaWebCreate, VentaWebWithDetails, TipoDeVenta, EstadoDeVenta, EstadoDetalle, EstatusDePago } from '../../types/ventasWeb.types';
import type { Moderador } from '../../types/moderador.types';
import type { CatModerador } from '../../types/catModerador.types';
import './PageVentas.css';

interface ItemComanda {
  producto: ProductoWeb;
  cantidad: number;
  notas?: string;
  moderadores?: string; // Comma-separated IDs
  moderadoresNames?: string[]; // Array of names for display
}

// Constants
const ESTATUS_ACTIVO = 1;
const SERVICE_CONFIG_MODAL_DELAY_MS = 300;
const SELECTION_MODAL_DISPLAY_DELAY_MS = 500;
const MODERADORES_PLACEHOLDER = 'Moderadores';

const PageVentas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const categoriasScrollRef = useRef<HTMLDivElement>(null);
  
  // Get sale data from navigation state
  const ventaToLoad = (location.state as { ventaToLoad?: VentaWebWithDetails })?.ventaToLoad;
  const tipoServicioPreseleccionado = (location.state as { tipoServicioPreseleccionado?: TipoServicio })?.tipoServicioPreseleccionado;
  
  // Utility function to safely format prices
  const formatPrice = (price: number | string | undefined | null): string => {
    return (Number(price) || 0).toFixed(2);
  };
  
  // Estados
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<ProductoWeb[]>([]);
  const [productosVisibles, setProductosVisibles] = useState<ProductoWeb[]>([]);
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>('Mesa');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  
  // Moderadores states
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [catModeradores, setCatModeradores] = useState<CatModerador[]>([]);
  const [showModModal, setShowModModal] = useState(false);
  const [selectedProductoIdForMod, setSelectedProductoIdForMod] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [modSelectionMode, setModSelectionMode] = useState<'options' | 'list'>('options');
  const [tempSelectedModeradoresIds, setTempSelectedModeradoresIds] = useState<number[]>([]);
  
  // Nota states
  const [editingNotaIndex, setEditingNotaIndex] = useState<number | null>(null);
  const [tempNotaText, setTempNotaText] = useState<string>('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [mesaData, setMesaData] = useState<MesaFormData | null>(null);
  const [llevarData, setLlevarData] = useState<LlevarFormData | null>(null);
  const [domicilioData, setDomicilioData] = useState<DomicilioFormData | null>(null);
  const [isServiceConfigured, setIsServiceConfigured] = useState(false);
  const [isLoadedFromDashboard, setIsLoadedFromDashboard] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  // Turno states
  const [showIniciaTurnoModal, setShowIniciaTurnoModal] = useState(false);
  const [hasTurnoAbierto, setHasTurnoAbierto] = useState<boolean | null>(null);
  const [isCheckingTurno, setIsCheckingTurno] = useState(true);


  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-info-header')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Functions defined before they are used
  const cargarNegocio = async (idNegocio: number) => {
    try {
      const data = await negociosService.obtenerNegocioPorId(idNegocio);
      if (data?.negocio) {
        setNegocio(data.negocio);
      }
    } catch (error) {
      console.error('Error al cargar negocio:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductosWeb();
      // Filtrar solo productos activos y que no sean Materia Prima
      const productosActivos = data.filter(p => p.estatus === ESTATUS_ACTIVO && p.tipoproducto !== 'Materia Prima');
      setProductos(productosActivos);
      setProductosVisibles(productosActivos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      // Note: Server already filters by user's idnegocio
      // Filtrar solo categorías activas
      const categoriasActivas = data.filter(c => c.estatus === ESTATUS_ACTIVO);
      setCategorias(categoriasActivas);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarModeradores = async (idNegocio: number) => {
    try {
      const mods = await obtenerModeradores(idNegocio);
      const modsActivos = mods.filter(m => m.estatus === ESTATUS_ACTIVO);
      setModeradores(modsActivos);
      
      const catMods = await obtenerModeradoresRef(idNegocio);
      // Map ModeradorRef to CatModerador format
      const mappedCatMods = catMods
        .filter(cm => cm.estatus === ESTATUS_ACTIVO)
        .map(cm => ({
          idmodref: cm.idmoderadorref,
          nombremodref: cm.nombremodref,
          fechaRegistroauditoria: cm.fechaRegistroauditoria,
          usuarioauditoria: cm.usuarioauditoria,
          fehamodificacionauditoria: cm.fehamodificacionauditoria,
          idnegocio: cm.idnegocio,
          estatus: cm.estatus,
          moderadores: cm.moderadores || ''
        }));
      setCatModeradores(mappedCatMods);
    } catch (error) {
      console.error('Error al cargar moderadores:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
      
      // Cargar datos del negocio del usuario
      if (user.idNegocio) {
        cargarNegocio(user.idNegocio);
        cargarModeradores(user.idNegocio);
      }
    }

    cargarProductos();
    cargarCategorias();

    // Check if a service type was preselected from dashboard modal
    if (tipoServicioPreseleccionado) {
      setTipoServicio(tipoServicioPreseleccionado);
      setIsServiceConfigured(false);
      // Open the modal to configure the service
      setTimeout(() => {
        setModalOpen(true);
      }, SERVICE_CONFIG_MODAL_DELAY_MS);
    }

    // If a sale is being loaded from dashboard
    if (ventaToLoad) {
      // Set service type based on sale type
      const tipoServicioMap: Record<TipoDeVenta, TipoServicio> = {
        'DOMICILIO': 'Domicilio',
        'LLEVAR': 'Llevar',
        'MESA': 'Mesa',
        'ONLINE': 'Llevar', // Map ONLINE to Llevar as closest match
        'MOVIMIENTO': 'Llevar' // Map MOVIMIENTO to Llevar as closest match
      };
      
      setTipoServicio(tipoServicioMap[ventaToLoad.tipodeventa] || 'Mesa');
      setIsServiceConfigured(true);
      setIsLoadedFromDashboard(true);

      // Load products into comanda
      const itemsComanda: ItemComanda[] = ventaToLoad.detalles.map(detalle => {
        // Parse moderadores and determine moderadoresNames
        let moderadoresNames: string[] | undefined = undefined;
        if (detalle.moderadores) {
          if (detalle.moderadores === 'LIMPIO') {
            moderadoresNames = ['LIMPIO'];
          } else {
            // It's a comma-separated list of IDs - we'll need to resolve them later
            // For now, just mark that it has moderadores
            moderadoresNames = [MODERADORES_PLACEHOLDER];
          }
        }

        return {
          producto: {
            idProducto: detalle.idproducto,
            nombre: detalle.nombreproducto,
            precio: detalle.preciounitario,
            costoproducto: detalle.costounitario,
            descripcion: '',
            idCategoria: 0,
            codigoSKU: '',
            tipoproducto: detalle.idreceta ? 'Receta' : 'Directo',
            idreferencia: detalle.idreceta || null,
            unidaddemedida: 'Pieza',
            imagenProducto: null,
            estatus: 1,
            idnegocio: detalle.idnegocio,
            usuarioauditoria: detalle.usuarioauditoria,
            fechamodificacionauditoria: detalle.fechamodificacionauditoria,
            fechaRegistroauditoria: new Date().toISOString(),
            fehamodificacionauditoria: new Date().toISOString()
          } as ProductoWeb,
          cantidad: Math.round(detalle.cantidad), // Ensure integer value
          notas: detalle.observaciones || undefined,
          moderadores: detalle.moderadores || undefined,
          moderadoresNames
        };
      });
      
      setComanda(itemsComanda);

      // Set service data based on type
      if (ventaToLoad.tipodeventa === 'MESA') {
        setMesaData({
          idmesa: null,
          nombremesa: ventaToLoad.cliente.replace('Mesa: ', '')
        });
      } else if (ventaToLoad.tipodeventa === 'LLEVAR') {
        setLlevarData({
          cliente: ventaToLoad.cliente,
          idcliente: null,
          fechaprogramadaventa: ventaToLoad.fechaprogramadaventa 
            ? new Date(ventaToLoad.fechaprogramadaventa).toISOString().slice(0, 16)
            : ''
        });
      } else if (ventaToLoad.tipodeventa === 'DOMICILIO') {
        setDomicilioData({
          cliente: ventaToLoad.cliente,
          idcliente: null,
          fechaprogramadaventa: ventaToLoad.fechaprogramadaventa 
            ? new Date(ventaToLoad.fechaprogramadaventa).toISOString().slice(0, 16)
            : '',
          direcciondeentrega: ventaToLoad.direcciondeentrega || '',
          telefonodeentrega: ventaToLoad.telefonodeentrega || '',
          contactodeentrega: ventaToLoad.contactodeentrega || '',
          observaciones: ventaToLoad.detalles[0]?.observaciones || ''
        });
      }
    }
  }, []);

  // Check for open turno (shift) when component mounts
  useEffect(() => {
    const checkTurno = async () => {
      // Only check if not loaded from dashboard
      if (!isLoadedFromDashboard) {
        try {
          setIsCheckingTurno(true);
          const turnoAbierto = await verificarTurnoAbierto();
          const hasTurno = turnoAbierto !== null;
          setHasTurnoAbierto(hasTurno);
          
          // If no open turno, show IniciaTurno modal
          if (!hasTurno) {
            console.log('No hay turno abierto, mostrando modal Inicia Turno');
            setTimeout(() => {
              setShowIniciaTurnoModal(true);
            }, SELECTION_MODAL_DISPLAY_DELAY_MS);
          }
        } catch (error) {
          console.error('Error al verificar turno:', error);
          // On error, allow user to proceed
          setHasTurnoAbierto(true);
        } finally {
          setIsCheckingTurno(false);
        }
      } else {
        // If loaded from dashboard, skip turno check
        setHasTurnoAbierto(true);
        setIsCheckingTurno(false);
      }
    };

    checkTurno();
  }, [isLoadedFromDashboard]);

  // Resolve moderador names after moderadores are loaded (for items loaded from dashboard)
  useEffect(() => {
    if (moderadores.length > 0 && isLoadedFromDashboard) {
      // Update comanda items that have moderadores but no resolved names yet
      setComanda(prevComanda => {
        const needsUpdate = prevComanda.some(item => 
          item.moderadores && 
          item.moderadores !== 'LIMPIO' && 
          (!item.moderadoresNames || item.moderadoresNames[0] === MODERADORES_PLACEHOLDER)
        );

        if (!needsUpdate) return prevComanda;

        return prevComanda.map(item => {
          if (item.moderadores && item.moderadores !== 'LIMPIO' && 
              (!item.moderadoresNames || item.moderadoresNames[0] === MODERADORES_PLACEHOLDER)) {
            // Parse comma-separated IDs and resolve to names
            const moderadorIds = item.moderadores
              .split(',')
              .map(id => Number(id.trim()))
              .filter(id => !isNaN(id) && id > 0); // Filter out invalid IDs
            const modNames = moderadorIds
              .map(id => moderadores.find(m => m.idmoderador === id)?.nombremoderador)
              .filter(Boolean) as string[];
            
            return {
              ...item,
              moderadoresNames: modNames.length > 0 ? modNames : undefined
            };
          }
          return item;
        });
      });
    }
  }, [moderadores, isLoadedFromDashboard]);

  // Show selection modal when comanda is empty and service not configured
  useEffect(() => {
    // Only show if:
    // - Not loaded from dashboard
    // - Service is not configured
    // - Comanda is empty
    // - Has open turno (shift)
    // - Not checking turno
    if (!isLoadedFromDashboard && !isServiceConfigured && comanda.length === 0 && hasTurnoAbierto && !isCheckingTurno) {
      const timer = setTimeout(() => {
        setShowSelectionModal(true);
      }, SELECTION_MODAL_DISPLAY_DELAY_MS);

      return () => clearTimeout(timer);
    } else {
      // Hide modal if comanda has items or service is configured
      setShowSelectionModal(false);
    }
  }, [comanda.length, isServiceConfigured, isLoadedFromDashboard, hasTurnoAbierto, isCheckingTurno]);

  // Filtrar productos por búsqueda y categoría
  useEffect(() => {
    let filtrados = productos;
    
    // Filtrar por categoría seleccionada
    if (categoriaSeleccionada !== null) {
      filtrados = filtrados.filter(p => p.idCategoria === categoriaSeleccionada);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setProductosVisibles(filtrados);
  }, [searchTerm, productos, categoriaSeleccionada]);

  // Helper functions
  const hasSameModeradores = (itemModerators: string | undefined, moderadores: string | undefined): boolean => {
    return (itemModerators || '') === (moderadores || '');
  };

  const isValidItemIndex = (index: number | null): boolean => {
    return index !== null && index >= 0 && index < comanda.length;
  };

  const closeModModal = () => {
    setShowModModal(false);
    setSelectedProductoIdForMod(null);
    setSelectedItemIndex(null);
    setTempSelectedModeradoresIds([]);
  };

  const agregarAComanda = (producto: ProductoWeb, moderadores?: string, moderadoresNames?: string[]) => {
    // Find existing item with same product AND same moderadores
    const itemExistente = comanda.find(item => 
      item.producto.idProducto === producto.idProducto && 
      hasSameModeradores(item.moderadores, moderadores)
    );
    
    if (itemExistente) {
      setComanda(comanda.map(item => 
        item === itemExistente
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setComanda([...comanda, { producto, cantidad: 1, moderadores, moderadoresNames }]);
    }
  };

  const disminuirCantidad = (producto: ProductoWeb, moderadores?: string) => {
    const itemExistente = comanda.find(item => 
      item.producto.idProducto === producto.idProducto && 
      hasSameModeradores(item.moderadores, moderadores)
    );
    
    if (itemExistente) {
      if (itemExistente.cantidad > 1) {
        setComanda(comanda.map(item => 
          item === itemExistente
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        ));
      } else {
        setComanda(comanda.filter(item => item !== itemExistente));
      }
    }
  };

  const actualizarCantidad = (producto: ProductoWeb, moderadores: string | undefined, nuevaCantidad: number) => {
    // Validate quantity is a positive integer
    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
      return;
    }

    const itemExistente = comanda.find(item => 
      item.producto.idProducto === producto.idProducto && 
      hasSameModeradores(item.moderadores, moderadores)
    );
    
    if (itemExistente) {
      setComanda(comanda.map(item => 
        item === itemExistente
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const handleModClickForProductCard = (producto: ProductoWeb) => {
    // Set the product for which moderadores are being selected
    setSelectedProductoIdForMod(producto.idProducto);
    // Set selectedItemIndex to null to indicate this is for a new product, not an existing comanda item
    setSelectedItemIndex(null);
    setModSelectionMode('options');
    // Clear previously selected moderadores when opening the modal
    setTempSelectedModeradoresIds([]);
    setShowModModal(true);
  };

  const calcularTotal = (): number => {
    return comanda.reduce((total, item) => {
      const precio = Number(item.producto.precio) || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const crearVenta = async (estadodeventa: EstadoDeVenta = 'SOLICITADO', estadodetalle: EstadoDetalle = 'ORDENADO', estatusdepago: EstatusDePago = 'PENDIENTE') => {
    // Lógica común para crear ventas
    if (comanda.length === 0) {
      alert('No hay productos en la comanda');
      return;
    }

    if (!usuario) {
      alert('Usuario no autenticado');
      return;
    }

    // Validar que el servicio esté configurado
    if (!isServiceConfigured) {
      alert('Por favor configure el tipo de servicio antes de continuar');
      setModalOpen(true);
      return;
    }

    // Validar que se hayan configurado los datos del tipo de servicio
    if (tipoServicio === 'Mesa' && !mesaData) {
      alert('Por favor configure los datos de la mesa antes de continuar');
      setModalOpen(true);
      return;
    }
    if (tipoServicio === 'Llevar' && !llevarData) {
      alert('Por favor configure los datos de entrega antes de continuar');
      setModalOpen(true);
      return;
    }
    if (tipoServicio === 'Domicilio' && !domicilioData) {
      alert('Por favor configure los datos de domicilio antes de continuar');
      setModalOpen(true);
      return;
    }

    try {
      // Mapear TipoServicio a TipoDeVenta
      const tipoDeVentaMap: Record<TipoServicio, TipoDeVenta> = {
        'Domicilio': 'DOMICILIO',
        'Llevar': 'LLEVAR',
        'Mesa': 'MESA'
      };

      // Construir datos de la venta según el tipo de servicio
      let cliente = usuario.nombre;
      let direcciondeentrega: string | null = null;
      let contactodeentrega: string | null = null;
      let telefonodeentrega: string | null = null;
      let fechaprogramadaventa: string | null = null;
      
      if (tipoServicio === 'Mesa' && mesaData) {
        cliente = `Mesa: ${mesaData.nombremesa}`;
      } else if (tipoServicio === 'Llevar' && llevarData) {
        cliente = llevarData.cliente;
        fechaprogramadaventa = llevarData.fechaprogramadaventa;
      } else if (tipoServicio === 'Domicilio' && domicilioData) {
        cliente = domicilioData.cliente;
        fechaprogramadaventa = domicilioData.fechaprogramadaventa;
        direcciondeentrega = domicilioData.direcciondeentrega;
        telefonodeentrega = domicilioData.telefonodeentrega;
        contactodeentrega = domicilioData.contactodeentrega || null;
      }

      const ventaData: VentaWebCreate = {
        tipodeventa: tipoDeVentaMap[tipoServicio],
        cliente: cliente,
        formadepago: 'sinFP', // Valor por defecto según requerimientos
        direcciondeentrega,
        contactodeentrega,
        telefonodeentrega,
        fechaprogramadaentrega: fechaprogramadaventa || undefined,
        estadodeventa: estadodeventa,
        estatusdepago: estatusdepago,
        estadodetalle: estadodetalle,
        detalles: comanda.map(item => ({
          idproducto: item.producto.idProducto,
          nombreproducto: item.producto.nombre,
          // Priorizar receta: solo asignar si existe y tipo es Receta
          idreceta: item.producto.tipoproducto === 'Receta' && item.producto.idreferencia 
            ? item.producto.idreferencia 
            : null,
          tipoproducto: item.producto.tipoproducto,
          cantidad: item.cantidad,
          preciounitario: Number(item.producto.precio),
          costounitario: Number(item.producto.costoproducto),
          observaciones: item.notas || (tipoServicio === 'Domicilio' && domicilioData?.observaciones) || null,
          moderadores: item.moderadores || null
        }))
      };

      console.log('Creando venta:', ventaData);
      
      const resultado = await crearVentaWeb(ventaData);

      if (resultado.success) {
        alert(`¡Venta registrada exitosamente!\nFolio: ${resultado.folioventa}`);
        // Limpiar la comanda y datos del servicio
        setComanda([]);
        setMesaData(null);
        setLlevarData(null);
        setDomicilioData(null);
        setIsServiceConfigured(false);
      } else {
        const errorMsg = resultado.message || 'Error desconocido';
        console.error('Error al registrar venta:', errorMsg);
        alert(`Error al registrar la venta:\n${errorMsg}\n\nPor favor, verifique que todos los datos estén correctos e intente nuevamente.`);
      }
    } catch (error) {
      console.error('Error al crear venta:', error);
      const errorMsg = (error instanceof Error) ? error.message : 'Error de conexión con el servidor';
      alert(`Error al registrar la venta:\n${errorMsg}\n\nPor favor, intente nuevamente.`);
    }
  };

  const handleTurnoIniciado = (turnoId: number, claveturno: string) => {
    console.log('Turno iniciado exitosamente:', turnoId, claveturno);
    setShowIniciaTurnoModal(false);
    setHasTurnoAbierto(true);
    // After turno is opened, show selection modal
    setTimeout(() => {
      setShowSelectionModal(true);
    }, SELECTION_MODAL_DISPLAY_DELAY_MS);
  };

  const handleProducir = async () => {
    await crearVenta('ORDENADO', 'ORDENADO', 'PENDIENTE');
  };

  const handleEsperar = async () => {
    await crearVenta('ESPERAR', 'ESPERAR', 'ESPERAR');
  };

  const handleModeradorSelection = (selectedModeradores: number[]) => {
    // Get moderadores names
    const modNames = selectedModeradores
      .map(id => moderadores.find(m => m.idmoderador === id)?.nombremoderador)
      .filter(Boolean) as string[];

    if (selectedItemIndex === null) {
      // Adding new product to comanda with moderadores
      if (selectedProductoIdForMod === null) return;
      const producto = productos.find(p => p.idProducto === selectedProductoIdForMod);
      if (!producto) return;
      
      agregarAComanda(producto, selectedModeradores.join(','), modNames);
    } else {
      // Updating existing comanda item with moderadores
      if (!isValidItemIndex(selectedItemIndex)) return;
      
      setComanda(comanda.map((item, idx) => 
        idx === selectedItemIndex
          ? { 
              ...item, 
              moderadores: selectedModeradores.join(','),
              moderadoresNames: modNames
            }
          : item
      ));
    }

    closeModModal();
  };

  const updateComandaWithModerador = (moderadores: string | undefined, moderadoresNames: string[]) => {
    if (selectedItemIndex === null) {
      // Adding new product to comanda with moderadores
      if (selectedProductoIdForMod === null) return;
      const producto = productos.find(p => p.idProducto === selectedProductoIdForMod);
      if (!producto) return;
      
      agregarAComanda(producto, moderadores, moderadoresNames);
    } else {
      // Updating existing comanda item with moderadores
      if (!isValidItemIndex(selectedItemIndex)) return;
      
      setComanda(comanda.map((item, idx) => 
        idx === selectedItemIndex
          ? { 
              ...item, 
              moderadores,
              moderadoresNames
            }
          : item
      ));
    }
    
    closeModModal();
  };

  const handleModLimpio = () => {
    updateComandaWithModerador('LIMPIO', ['LIMPIO']);
  };

  const handleModConTodo = () => {
    if (selectedProductoIdForMod === null) return;
    
    const availableMods = getAvailableModeradores(selectedProductoIdForMod);
    const allModIds = availableMods.map(m => m.idmoderador).join(',');
    // Show "CON TODO" as the label instead of individual moderador names
    const allModNames = ['CON TODO'];
    
    updateComandaWithModerador(allModIds, allModNames);
  };

  const handleModSoloCon = () => {
    // Initialize tempSelectedModeradoresIds with current moderadores if editing an existing item
    if (selectedItemIndex !== null && isValidItemIndex(selectedItemIndex)) {
      const currentItem = comanda[selectedItemIndex];
      const currentMods = currentItem.moderadores?.split(',').map(Number) || [];
      setTempSelectedModeradoresIds(currentMods);
    } else {
      setTempSelectedModeradoresIds([]);
    }
    // Show the moderadores list for selection
    setModSelectionMode('list');
  };

  const handleModeradorToggle = (moderadorId: number, isChecked: boolean) => {
    // Update temporary selected moderadores without closing the modal
    const newMods = isChecked
      ? [...tempSelectedModeradoresIds.filter(id => id !== moderadorId), moderadorId] // Prevent duplicates
      : tempSelectedModeradoresIds.filter(id => id !== moderadorId);
    
    setTempSelectedModeradoresIds(newMods);
  };

  const handleConfirmModeradorSelection = () => {
    // Apply the temporary selected moderadores
    // Note: Empty selection is valid (equivalent to "LIMPIO")
    handleModeradorSelection(tempSelectedModeradoresIds);
  };

  const handleNotaClick = (index: number, currentNota?: string) => {
    setEditingNotaIndex(index);
    setTempNotaText(currentNota || '');
  };

  const handleNotaSave = (index: number) => {
    setComanda(comanda.map((item, idx) => 
      idx === index
        ? { ...item, notas: tempNotaText.trim() || undefined }
        : item
    ));
    setEditingNotaIndex(null);
    setTempNotaText('');
  };

  const handleNotaCancel = () => {
    setEditingNotaIndex(null);
    setTempNotaText('');
  };

  const getCategoryName = (idCategoria: number): string => {
    const categoria = categorias.find(c => c.idCategoria === idCategoria);
    return categoria?.nombre || '';
  };

  const getIdModeradorDef = (idCategoria: number): string => {
    const categoria = categorias.find(c => c.idCategoria === idCategoria);
    if (!categoria || !categoria.idmoderadordef) {
      return '';
    }
    const moderadorDefValue = categoria.idmoderadordef;
    const invalidValues = [null, undefined, '', '0', 0];
    if (invalidValues.includes(moderadorDefValue as any)) {
      return '';
    }
    return String(moderadorDefValue);
  };

  const hasModeradorDef = (idProducto: number): boolean => {
    // Find the product's category
    const producto = productos.find(p => p.idProducto === idProducto);
    if (!producto) {
      return false;
    }

    // Reuse getIdModeradorDef logic to check for valid idmoderadordef
    return getIdModeradorDef(producto.idCategoria) !== '';
  };

  const getModeradorCategoryNames = (idProducto: number): string[] => {
    // Find the product's category
    const producto = productos.find(p => p.idProducto === idProducto);
    if (!producto) {
      return [];
    }

    // Find the category
    const categoria = categorias.find(c => c.idCategoria === producto.idCategoria);
    if (!categoria) {
      return [];
    }
    
    // Check if category has a moderadordef defined
    const moderadorDefValue = categoria.idmoderadordef;
    const invalidValues = [null, undefined, '', '0', 0];
    if (invalidValues.includes(moderadorDefValue as any)) {
      return [];
    }

    // Parse moderadorDefValue - it can be a single ID or comma-separated IDs
    let moderadorRefIds: number[] = [];
    if (typeof moderadorDefValue === 'string') {
      if (moderadorDefValue.includes(',')) {
        moderadorRefIds = moderadorDefValue.split(',').map(id => Number(id.trim())).filter(id => id > 0);
      } else {
        const id = Number(moderadorDefValue);
        if (id > 0) moderadorRefIds = [id];
      }
    } else if (typeof moderadorDefValue === 'number' && moderadorDefValue > 0) {
      moderadorRefIds = [moderadorDefValue];
    }

    if (moderadorRefIds.length === 0) {
      return [];
    }

    // Get all catModeradores that match any of the moderadorRefIds
    const matchedCatModeradores = catModeradores.filter(cm => 
      moderadorRefIds.includes(cm.idmodref)
    );
    
    // Return the names of the matched moderador categories
    return matchedCatModeradores.map(cm => cm.nombremodref);
  };

  const getAvailableModeradores = (idProducto: number): Moderador[] => {
    // Find the product's category
    const producto = productos.find(p => p.idProducto === idProducto);
    if (!producto) {
      return [];
    }

    // Find the category
    const categoria = categorias.find(c => c.idCategoria === producto.idCategoria);
    if (!categoria) {
      return [];
    }
    
    // Check if category has a moderadordef defined
    // Treat null, undefined, empty string, '0', and 0 as "no moderadores"
    const moderadorDefValue = categoria.idmoderadordef;
    const invalidValues = [null, undefined, '', '0', 0];
    if (invalidValues.includes(moderadorDefValue as any)) {
      return [];
    }

    // Parse moderadorDefValue - it can be a single ID or comma-separated IDs
    let moderadorRefIds: number[] = [];
    if (typeof moderadorDefValue === 'string') {
      if (moderadorDefValue.includes(',')) {
        moderadorRefIds = moderadorDefValue.split(',').map(id => Number(id.trim())).filter(id => id > 0);
      } else {
        const id = Number(moderadorDefValue);
        if (id > 0) moderadorRefIds = [id];
      }
    } else if (typeof moderadorDefValue === 'number' && moderadorDefValue > 0) {
      moderadorRefIds = [moderadorDefValue];
    }

    if (moderadorRefIds.length === 0) {
      return [];
    }

    // Get all catModeradores that match any of the moderadorRefIds
    const matchedCatModeradores = catModeradores.filter(cm => 
      moderadorRefIds.includes(cm.idmodref)
    );
    
    if (matchedCatModeradores.length === 0) {
      return [];
    }

    // Collect all moderador IDs from all matched catModeradores
    const allModeradorIds: number[] = [];
    for (const catModerador of matchedCatModeradores) {
      const moderadoresStr = catModerador.moderadores?.trim();
      if (moderadoresStr) {
        const ids = moderadoresStr
          .split(',')
          .map(id => Number(id.trim()))
          .filter(id => id > 0);
        allModeradorIds.push(...ids);
      }
    }

    if (allModeradorIds.length === 0) {
      return [];
    }
    
    // Filter and return unique moderadores
    const uniqueModeradorIds = Array.from(new Set(allModeradorIds));
    return moderadores.filter(m => uniqueModeradorIds.includes(m.idmoderador));
  };

  const handleListadoPagos = () => {
    // Lógica para mostrar listado de pagos
    console.log('Mostrando listado de pagos');
    alert('Funcionalidad de listado de pagos en desarrollo');
  };

  const handleCategoriaClick = (idCategoria: number) => {
    // Toggle: si es la misma categoría, deseleccionar
    if (categoriaSeleccionada === idCategoria) {
      setCategoriaSeleccionada(null);
    } else {
      setCategoriaSeleccionada(idCategoria);
    }
  };

  const scrollCategorias = (direction: 'left' | 'right') => {
    if (categoriasScrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? categoriasScrollRef.current.scrollLeft - scrollAmount
        : categoriasScrollRef.current.scrollLeft + scrollAmount;
      
      categoriasScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCancelar = () => {
    // Clear comanda (total is calculated dynamically)
    setComanda([]);
    // Reset service configuration
    setMesaData(null);
    setLlevarData(null);
    setDomicilioData(null);
    setIsServiceConfigured(false);
    setIsLoadedFromDashboard(false);
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  const handleSelectionModalVentaSelect = (tipo: TipoServicio) => {
    setTipoServicio(tipo);
    setIsServiceConfigured(false);
    setShowSelectionModal(false);
    // Open configuration modal after a short delay
    setTimeout(() => {
      setModalOpen(true);
    }, SERVICE_CONFIG_MODAL_DELAY_MS);
  };

  // Note: handleOverlayClick (defined in modal component) handles navigation to dashboard
  // when clicking outside the modal, replacing the previous handleSelectionModalClose handler

  const handleModalSave = (data: MesaFormData | LlevarFormData | DomicilioFormData) => {
    if (tipoServicio === 'Mesa') {
      setMesaData(data as MesaFormData);
    } else if (tipoServicio === 'Llevar') {
      setLlevarData(data as LlevarFormData);
    } else if (tipoServicio === 'Domicilio') {
      setDomicilioData(data as DomicilioFormData);
    }
    setIsServiceConfigured(true);
    setModalOpen(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Navigate to Dashboard when canceling service configuration
    navigate('/dashboard');
  };

  const getInitialModalData = (): MesaFormData | LlevarFormData | DomicilioFormData | undefined => {
    if (tipoServicio === 'Mesa' && mesaData) {
      return mesaData;
    } else if (tipoServicio === 'Llevar' && llevarData) {
      return llevarData;
    } else if (tipoServicio === 'Domicilio' && domicilioData) {
      return domicilioData;
    }
    return undefined;
  };

  return (
    <div className="page-ventas">
      {/* Overlay de pantalla bloqueada */}
      {isScreenLocked && (
        <div 
          className="screen-lock-overlay-ventas"
          onClick={() => setIsScreenLocked(false)}
        >
          <div className="lock-content-ventas">
            {negocio?.logotipo && (
              <div className="lock-logo-ventas">
                <img src={negocio.logotipo} alt="Logo" />
              </div>
            )}
            <h2 className="lock-business-name">{negocio?.nombreNegocio || 'POS Crumen'}</h2>
            <p className="lock-hint-ventas">Haz clic en cualquier lugar para desbloquear</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="ventas-header">
        <button className="btn-back-dashboard" onClick={handleCancelar}>
          <ArrowLeft size={20} />
          Cancelar
        </button>

        <FichaDeComanda
          tipoServicio={tipoServicio}
          mesaData={mesaData}
          llevarData={llevarData}
          domicilioData={domicilioData}
          isServiceConfigured={isServiceConfigured}
        />

        <div className="user-info-header">
          <div 
            className="user-avatar-ventas" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {usuario?.fotoavatar ? (
              <img src={usuario.fotoavatar} alt={usuario.nombre} />
            ) : (
              <div className="avatar-placeholder">
                {usuario?.alias?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="user-details-ventas">
            <p className="user-alias-ventas">@{usuario?.alias || 'Usuario'}</p>
            <p className="user-business-ventas">{negocio?.nombreNegocio || 'Negocio'}</p>
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="user-dropdown-ventas">
              <button 
                onClick={() => {
                  setIsScreenLocked(true);
                  setShowUserMenu(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Bloquea Pantalla
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="ventas-content">
        {/* Panel izquierdo - Productos */}
        <div className="productos-panel">
          {/* Controles superiores */}
          <div className="controles-superiores">
            <div className="search-bar">
              <Search size={20} />
              <input 
                type="text"
                placeholder="input para buscar productos por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Carrusel de Categorías - Show when service is configured */}
          <div className={`categorias-carousel-container ${!isServiceConfigured ? 'hidden' : ''}`}>
            <button 
              className="carousel-nav-button carousel-nav-left"
              onClick={() => scrollCategorias('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="categorias-carousel" ref={categoriasScrollRef}>
              {categorias.map((categoria) => (
                <div 
                  key={categoria.idCategoria}
                  className={`categoria-slide-item ${categoriaSeleccionada === categoria.idCategoria ? 'selected' : ''}`}
                  onClick={() => handleCategoriaClick(categoria.idCategoria)}
                >
                  {categoria.imagencategoria ? (
                    <div className="categoria-slide-imagen">
                      <img 
                        src={categoria.imagencategoria} 
                        alt={categoria.nombre}
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallbackSpan = document.createElement('span');
                            fallbackSpan.textContent = '📁';
                            parent.appendChild(fallbackSpan);
                            parent.classList.add('categoria-placeholder');
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="categoria-slide-imagen categoria-placeholder">
                      <span>📁</span>
                    </div>
                  )}
                  <span className="categoria-slide-nombre">{categoria.nombre}</span>
                </div>
              ))}
            </div>

            <button 
              className="carousel-nav-button carousel-nav-right"
              onClick={() => scrollCategorias('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Grid de productos - Show when service is configured */}
          <div className={`productos-grid ${!isServiceConfigured ? 'hidden' : ''}`}>
            {productosVisibles.map((producto) => {
              const categoriaNombre = getCategoryName(producto.idCategoria);
              const moderadorCategoriasNames = getModeradorCategoryNames(producto.idProducto);
              const idModeradorDef = getIdModeradorDef(producto.idCategoria);
              
              return (
                <div key={producto.idProducto} className="producto-card">
                  <div className="producto-imagen">
                    {producto.imagenProducto ? (
                      <img src={`data:image/jpeg;base64,${producto.imagenProducto}`} alt={producto.nombre} />
                    ) : (
                      <div className="imagen-placeholder">
                        <div className="icono-producto">🍽️</div>
                      </div>
                    )}
                  </div>
                  <div className="producto-info">
                    <h3 className="producto-nombre">{producto.nombre}</h3>
                    {categoriaNombre && (
                      <p className="producto-categoria">Categoría: {categoriaNombre}</p>
                    )}
                    {moderadorCategoriasNames.length > 0 && (
                      <p className="producto-moderador-categoria">
                        Mod: {moderadorCategoriasNames.join(', ')}
                      </p>
                    )}
                    {idModeradorDef && (
                      <p className="producto-idmoderadordef">
                        idmoderadordef: {idModeradorDef}
                      </p>
                    )}
                    <p className="producto-precio">$ {formatPrice(producto.precio)}</p>
                  </div>
                  <div className="producto-acciones">
                    <button 
                      className="btn-accion btn-plus"
                      onClick={() => {
                        // Add with "CON TODO" moderador by default if product has moderador definition
                        if (hasModeradorDef(producto.idProducto)) {
                          const availableMods = getAvailableModeradores(producto.idProducto);
                          const allModIds = availableMods.map(m => m.idmoderador).join(',');
                          agregarAComanda(producto, allModIds, ['CON TODO']);
                        } else {
                          agregarAComanda(producto);
                        }
                      }}
                    >
                      <Plus size={16} />
                    </button>
                    {hasModeradorDef(producto.idProducto) && (
                      <button 
                        className="btn-accion btn-mod"
                        onClick={() => handleModClickForProductCard(producto)}
                      >
                        Mod
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {productosVisibles.length === 0 && (
            <div className="empty-productos">
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>

        {/* Panel derecho - Comanda/Carrito */}
        <div className="comanda-panel">
          <div className="comanda-header">
            <h2>Total de cuenta</h2>
          </div>

          <div className="comanda-buttons">
            <button className="btn-producir" onClick={handleProducir} disabled={!isServiceConfigured || comanda.length === 0}>Producir</button>
            <button className="btn-esperar" onClick={handleEsperar} disabled={!isServiceConfigured || comanda.length === 0}>Esperar</button>
            <button className="btn-listado" onClick={handleListadoPagos} disabled={!isServiceConfigured}>listado de pagos</button>
          </div>

          <div className="comanda-total">
            <span className="total-label">Total:</span>
            <span className="total-amount">${calcularTotal().toFixed(2)}</span>
          </div>

          <div className="comanda-items">
            {comanda.map((item, index) => (
              <div key={`${item.producto.idProducto}-${item.moderadores || 'none'}-${index}`} className="comanda-item">
                <div className="comanda-item-header">
                  <input 
                    type="number" 
                    className="comanda-item-cantidad-input"
                    value={item.cantidad}
                    min="1"
                    step="1"
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Parse the value
                      const newValue = parseInt(inputValue, 10);
                      // Update only if it's a valid positive integer
                      if (!isNaN(newValue) && newValue > 0) {
                        actualizarCantidad(item.producto, item.moderadores, newValue);
                      }
                      // If empty or invalid, the value prop will keep showing the current cantidad
                    }}
                    onBlur={(e) => {
                      // Ensure at least 1 on blur if empty or invalid
                      const inputValue = e.target.value;
                      const newValue = parseInt(inputValue, 10);
                      if (isNaN(newValue) || newValue < 1) {
                        actualizarCantidad(item.producto, item.moderadores, 1);
                      }
                    }}
                  />
                  <span className="comanda-item-nombre">{item.producto.nombre}</span>
                  <span className="comanda-item-precio">
                    $ {formatPrice((Number(item.producto.precio) || 0) * item.cantidad)}
                  </span>
                </div>
                {item.moderadoresNames && item.moderadoresNames.length > 0 && (
                  <div className="comanda-item-moderadores">
                    <span className="moderadores-label">Mod:</span>
                    <span className="moderadores-list">{item.moderadoresNames.join(', ')}</span>
                  </div>
                )}
                {item.notas && editingNotaIndex !== index && (
                  <div className="comanda-item-notas">
                    <span className="notas-label">Nota:</span>
                    <span className="notas-text">{item.notas}</span>
                  </div>
                )}
                {editingNotaIndex === index && (
                  <div className="comanda-item-nota-edit">
                    <textarea
                      className="nota-textarea"
                      value={tempNotaText}
                      onChange={(e) => setTempNotaText(e.target.value)}
                      placeholder="Agregar nota..."
                      rows={3}
                      autoFocus
                    />
                    <div className="nota-actions">
                      <button 
                        className="btn-nota-save"
                        onClick={() => handleNotaSave(index)}
                      >
                        Guardar
                      </button>
                      <button 
                        className="btn-nota-cancel"
                        onClick={handleNotaCancel}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                <div className="comanda-item-acciones">
                  <button 
                    className="btn-comanda-accion btn-minus"
                    onClick={() => disminuirCantidad(item.producto, item.moderadores)}
                  >
                    <Minus size={14} />
                  </button>
                  <button 
                    className="btn-comanda-accion btn-plus"
                    onClick={() => agregarAComanda(item.producto, item.moderadores, item.moderadoresNames)}
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    className="btn-comanda-accion btn-nota"
                    onClick={() => handleNotaClick(index, item.notas)}
                    title="Agregar nota"
                  >
                    <StickyNote size={14} />
                  </button>
                </div>
              </div>
            ))}

            {comanda.length === 0 && (
              <div className="comanda-empty">
                <p>No hay productos en la comanda</p>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Modal para configuración de tipo de servicio */}
      <ModalTipoServicio
        tipoServicio={tipoServicio}
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={getInitialModalData()}
      />

      {/* Modal para selección de tipo de venta */}
      <ModalSeleccionVentaPageVentas
        isOpen={showSelectionModal}
        onTipoVentaSelect={handleSelectionModalVentaSelect}
      />

      {/* Modal para iniciar turno */}
      <ModalIniciaTurno
        isOpen={showIniciaTurnoModal}
        onTurnoIniciado={handleTurnoIniciado}
        usuarioAlias={usuario?.alias}
      />

      {/* Modal para selección de moderadores */}
      {showModModal && selectedProductoIdForMod && (
        <div className="modal-overlay" onClick={closeModModal}>
          <div className="modal-mod-content" onClick={(e) => e.stopPropagation()}>
            {modSelectionMode === 'options' ? (
              // Show LIMPIO | CON TODO | SOLO CON options
              <>
                <h3>Seleccione una opción</h3>
                <div className="mod-options-container">
                  <button 
                    className="btn-mod-option btn-limpio"
                    onClick={handleModLimpio}
                  >
                    <div className="mod-option-icon">🚫</div>
                    <span className="mod-option-label">LIMPIO</span>
                    <p className="mod-option-description">Sin modificaciones</p>
                  </button>
                  
                  <button 
                    className="btn-mod-option btn-con-todo"
                    onClick={handleModConTodo}
                  >
                    <div className="mod-option-icon">✅</div>
                    <span className="mod-option-label">CON TODO</span>
                    <p className="mod-option-description">Todas las modificaciones</p>
                  </button>
                  
                  <button 
                    className="btn-mod-option btn-solo-con"
                    onClick={handleModSoloCon}
                  >
                    <div className="mod-option-icon">✏️</div>
                    <span className="mod-option-label">SOLO CON</span>
                    <p className="mod-option-description">Seleccionar específicas</p>
                  </button>
                </div>
                <div className="modal-actions">
                  <button className="btn-modal-close" onClick={closeModModal}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              // Show moderadores list for selection
              <>
                <div className="modal-header-with-back">
                  <button 
                    className="btn-back-to-options"
                    onClick={() => setModSelectionMode('options')}
                  >
                    ← Volver
                  </button>
                  <h3>Seleccionar Moderadores</h3>
                </div>
                <div className="moderadores-list">
                  {selectedProductoIdForMod !== null && getAvailableModeradores(selectedProductoIdForMod).map((mod) => {
                    const isSelected = tempSelectedModeradoresIds.includes(mod.idmoderador);
                    
                    return (
                      <label key={mod.idmoderador} className="moderador-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleModeradorToggle(mod.idmoderador, e.target.checked)}
                        />
                        <span>{mod.nombremoderador}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="modal-actions">
                  <button className="btn-modal-close" onClick={closeModModal}>
                    Cancelar
                  </button>
                  <button className="btn-modal-confirm" onClick={handleConfirmModeradorSelection}>
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageVentas;
