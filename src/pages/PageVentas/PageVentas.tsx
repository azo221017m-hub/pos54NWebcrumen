import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus } from 'lucide-react';
import { obtenerProductosWeb } from '../../services/productosWebService';
import { negociosService } from '../../services/negociosService';
import { obtenerCategorias } from '../../services/categoriasService';
import type { ProductoWeb } from '../../types/productoWeb.types';
import type { Usuario } from '../../types/usuario.types';
import type { Negocio } from '../../types/negocio.types';
import type { Categoria } from '../../types/categoria.types';
import './PageVentas.css';

interface ItemComanda {
  producto: ProductoWeb;
  cantidad: number;
  notas?: string;
}

type TipoServicio = 'Domicilio' | 'Llevar' | 'Mesa';

const PageVentas: React.FC = () => {
  const navigate = useNavigate();
  
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
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

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
      const productosActivos = data.filter(p => p.estatus === 1);
      setProductos(productosActivos);
      setProductosVisibles(productosActivos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      // Filtrar solo categorías activas
      const categoriasActivas = data.filter(c => c.estatus === 1);
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

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setProductosVisibles(productos);
    } else {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProductosVisibles(filtrados);
    }
  }, [searchTerm, productos]);

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

  const handleProducir = () => {
    // Lógica para producir la comanda
    if (comanda.length === 0) {
      alert('No hay productos en la comanda');
      return;
    }
    console.log('Produciendo comanda:', comanda);
    alert('Funcionalidad de producción en desarrollo');
  };

  const handleListadoPagos = () => {
    // Lógica para mostrar listado de pagos
    console.log('Mostrando listado de pagos');
    alert('Funcionalidad de listado de pagos en desarrollo');
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

        <div className="user-info-header" style={{ position: 'relative' }}>
          <div 
            className="user-avatar-ventas" 
            style={{ cursor: 'pointer' }}
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
            <div className="user-dropdown-ventas" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '200px',
              zIndex: 1000,
              marginTop: '8px'
            }}>
              <button 
                onClick={() => {
                  setIsScreenLocked(true);
                  setShowUserMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
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
                onClick={() => setTipoServicio('Domicilio')}
              >
                Domicilio
              </button>
              <button 
                className={`btn-tipo-servicio ${tipoServicio === 'Llevar' ? 'active' : ''}`}
                onClick={() => setTipoServicio('Llevar')}
              >
                Llevar
              </button>
              <button 
                className={`btn-tipo-servicio ${tipoServicio === 'Mesa' ? 'active' : ''}`}
                onClick={() => setTipoServicio('Mesa')}
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

            <button 
              className="btn-categoria"
              onClick={() => setShowCategoriasModal(true)}
            >
              <div className="categoria-icon">⚪</div>
              CATEGORIA
            </button>
          </div>

          {/* Grid de productos */}
          <div className="productos-grid">
            {productosVisibles.map((producto) => {
              const cantidadEnComanda = obtenerCantidadEnComanda(producto.idProducto);
              return (
                <div key={producto.idProducto} className="producto-card">
                  <div className="producto-imagen">
                    {producto.imagenProducto ? (
                      <img src={producto.imagenProducto} alt={producto.nombre} />
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
            <button className="btn-producir" onClick={handleProducir}>Producir</button>
            <button className="btn-listado" onClick={handleListadoPagos}>listado de pagos</button>
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

      {/* Modal de Categorías */}
      {showCategoriasModal && (
        <div 
          className="modal-overlay"
          onClick={() => setShowCategoriasModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Categorías</h2>
              <button 
                onClick={() => setShowCategoriasModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {categorias.length > 0 ? (
                categorias.map((categoria) => (
                  <div 
                    key={categoria.idCategoria}
                    style={{
                      padding: '16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.borderColor = '#2196F3';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}
                    onClick={() => {
                      console.log('Categoría seleccionada:', categoria.nombre);
                      // Aquí puedes filtrar productos por categoría si es necesario
                    }}
                  >
                    {categoria.imagencategoria && (
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        <img 
                          src={categoria.imagencategoria} 
                          alt={categoria.nombre}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '18px', 
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        {categoria.nombre}
                      </h3>
                      {categoria.descripcion && (
                        <p style={{ 
                          margin: 0, 
                          fontSize: '14px', 
                          color: '#666'
                        }}>
                          {categoria.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  <p>No hay categorías disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageVentas;
