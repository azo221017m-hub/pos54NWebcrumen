import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { obtenerProductosWeb } from '../../services/productosWebService';
import { negociosService } from '../../services/negociosService';
import { obtenerCategorias } from '../../services/categoriasService';
import { crearVentaWeb } from '../../services/ventasWebService';
import ModalTipoServicio from '../../components/ventas/ModalTipoServicio';
import type { MesaFormData, LlevarFormData, DomicilioFormData } from '../../components/ventas/ModalTipoServicio';
import type { ProductoWeb } from '../../types/productoWeb.types';
import type { Usuario } from '../../types/usuario.types';
import type { Negocio } from '../../types/negocio.types';
import type { Categoria } from '../../types/categoria.types';
import type { TipoServicio } from '../../types/mesa.types';
import type { VentaWebCreate, TipoDeVenta } from '../../types/ventasWeb.types';
import './PageVentas.css';

interface ItemComanda {
  producto: ProductoWeb;
  cantidad: number;
  notas?: string;
}

// Constants
const ESTATUS_ACTIVO = 1;

const PageVentas: React.FC = () => {
  const navigate = useNavigate();
  const categoriasScrollRef = useRef<HTMLDivElement>(null);
  
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
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [mesaData, setMesaData] = useState<MesaFormData | null>(null);
  const [llevarData, setLlevarData] = useState<LlevarFormData | null>(null);
  const [domicilioData, setDomicilioData] = useState<DomicilioFormData | null>(null);
  const [isServiceConfigured, setIsServiceConfigured] = useState(false);

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
      // Filtrar solo productos activos
      const productosActivos = data.filter(p => p.estatus === ESTATUS_ACTIVO);
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

  // Cargar datos iniciales
  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
      
      // Cargar datos del negocio del usuario
      if (user.idNegocio) {
        cargarNegocio(user.idNegocio);
      }
    }

    cargarProductos();
    cargarCategorias();
  }, []);

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

  const agregarAComanda = (producto: ProductoWeb) => {
    const itemExistente = comanda.find(item => item.producto.idProducto === producto.idProducto);
    
    if (itemExistente) {
      setComanda(comanda.map(item => 
        item.producto.idProducto === producto.idProducto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setComanda([...comanda, { producto, cantidad: 1 }]);
    }
  };

  const disminuirCantidad = (producto: ProductoWeb) => {
    const itemExistente = comanda.find(item => item.producto.idProducto === producto.idProducto);
    
    if (itemExistente) {
      if (itemExistente.cantidad > 1) {
        setComanda(comanda.map(item => 
          item.producto.idProducto === producto.idProducto
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        ));
      } else {
        setComanda(comanda.filter(item => item.producto.idProducto !== producto.idProducto));
      }
    }
  };

  const obtenerCantidadEnComanda = (idProducto: number): number => {
    const item = comanda.find(item => item.producto.idProducto === idProducto);
    return item ? item.cantidad : 0;
  };

  const calcularTotal = (): number => {
    return comanda.reduce((total, item) => {
      const precio = Number(item.producto.precio) || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const handleProducir = async () => {
    // Lógica para producir la comanda
    if (comanda.length === 0) {
      alert('No hay productos en la comanda');
      return;
    }

    if (!usuario) {
      alert('Usuario no autenticado');
      return;
    }

    // Validar que se hayan configurado los datos del tipo de servicio
    if (tipoServicio === 'Mesa' && !mesaData) {
      alert('Por favor configure los datos de la mesa antes de producir');
      return;
    }
    if (tipoServicio === 'Llevar' && !llevarData) {
      alert('Por favor configure los datos de entrega antes de producir');
      return;
    }
    if (tipoServicio === 'Domicilio' && !domicilioData) {
      alert('Por favor configure los datos de domicilio antes de producir');
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
        formadepago: 'EFECTIVO', // Valor por defecto, se puede agregar selector en UI
        direcciondeentrega,
        contactodeentrega,
        telefonodeentrega,
        fechaprogramadaventa: fechaprogramadaventa || undefined,
        detalles: comanda.map(item => ({
          idproducto: item.producto.idProducto,
          nombreproducto: item.producto.nombre,
          // Priorizar receta: solo asignar si existe y tipo es Receta
          idreceta: item.producto.tipoproducto === 'Receta' && item.producto.idreferencia 
            ? item.producto.idreferencia 
            : null,
          nombrereceta: item.producto.tipoproducto === 'Receta' && item.producto.nombreReceta 
            ? item.producto.nombreReceta 
            : null,
          cantidad: item.cantidad,
          preciounitario: Number(item.producto.precio),
          costounitario: Number(item.producto.costoproducto),
          observaciones: item.notas || (tipoServicio === 'Domicilio' && domicilioData?.observaciones) || null
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
      } else {
        alert(`Error al registrar la venta: ${resultado.message}`);
      }
    } catch (error) {
      console.error('Error al producir comanda:', error);
      alert('Error al registrar la venta. Por favor, intente nuevamente.');
    }
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

  const handleTipoServicioClick = (tipo: TipoServicio) => {
    setTipoServicio(tipo);
    setIsServiceConfigured(false);
    setModalOpen(true);
  };

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
        <button className="btn-back-dashboard" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Dashboard
        </button>

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
            <div className="tipo-servicio-selector">
              <button 
                className={`btn-tipo-servicio ${tipoServicio === 'Domicilio' ? 'active' : ''}`}
                onClick={() => handleTipoServicioClick('Domicilio')}
              >
                Domicilio
              </button>
              <button 
                className={`btn-tipo-servicio ${tipoServicio === 'Llevar' ? 'active' : ''}`}
                onClick={() => handleTipoServicioClick('Llevar')}
              >
                Llevar
              </button>
              <button 
                className={`btn-tipo-servicio ${tipoServicio === 'Mesa' ? 'active' : ''}`}
                onClick={() => handleTipoServicioClick('Mesa')}
              >
                Mesa
              </button>
            </div>

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
              const cantidadEnComanda = obtenerCantidadEnComanda(producto.idProducto);
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
                    <p className="producto-precio">$ {formatPrice(producto.precio)}</p>
                  </div>
                  <div className="producto-acciones">
                    <button 
                      className="btn-accion btn-minus"
                      onClick={() => disminuirCantidad(producto)}
                      disabled={cantidadEnComanda === 0}
                    >
                      <Minus size={16} />
                    </button>
                    <button 
                      className="btn-accion btn-plus"
                      onClick={() => agregarAComanda(producto)}
                    >
                      <Plus size={16} />
                    </button>
                    <button className="btn-accion btn-mod">
                      Mod
                    </button>
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
            <button className="btn-producir" onClick={handleProducir} disabled={!isServiceConfigured}>Producir</button>
            <button className="btn-listado" onClick={handleListadoPagos} disabled={!isServiceConfigured}>listado de pagos</button>
          </div>

          <div className="comanda-total">
            <span className="total-label">Total:</span>
            <span className="total-amount">${calcularTotal().toFixed(2)}</span>
          </div>

          <div className="comanda-items">
            {comanda.map((item) => (
              <div key={item.producto.idProducto} className="comanda-item">
                <div className="comanda-item-header">
                  <span className="comanda-item-cantidad">{item.cantidad}</span>
                  <span className="comanda-item-nombre">{item.producto.nombre}</span>
                  <span className="comanda-item-precio">
                    $ {formatPrice((Number(item.producto.precio) || 0) * item.cantidad)}
                  </span>
                </div>
                <div className="comanda-item-acciones">
                  <button 
                    className="btn-comanda-accion btn-minus"
                    onClick={() => disminuirCantidad(item.producto)}
                  >
                    <Minus size={14} />
                  </button>
                  <button 
                    className="btn-comanda-accion btn-plus"
                    onClick={() => agregarAComanda(item.producto)}
                  >
                    <Plus size={14} />
                  </button>
                  <button className="btn-comanda-accion btn-mod">
                    Mod
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

          <div className="comanda-scroll-indicator">
            {comanda.length > 3 && (
              <>
                <div className="scroll-arrow scroll-up">↑</div>
                <div className="scroll-arrow scroll-down">↓</div>
              </>
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
    </div>
  );
};

export default PageVentas;
