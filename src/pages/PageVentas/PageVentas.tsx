import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus } from 'lucide-react';
import { obtenerProductosWeb } from '../../services/productosWebService';
import { negociosService } from '../../services/negociosService';
import type { ProductoWeb } from '../../types/productoWeb.types';
import type { Usuario } from '../../types/usuario.types';
import type { Negocio } from '../../types/negocio.types';
import './PageVentas.css';

interface ItemComanda {
  producto: ProductoWeb;
  cantidad: number;
  notas?: string;
}

type TipoServicio = 'Domicilio' | 'Llevar' | 'Mesa';

const PageVentas: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [productos, setProductos] = useState<ProductoWeb[]>([]);
  const [productosVisibles, setProductosVisibles] = useState<ProductoWeb[]>([]);
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  const [isScreenLocked, setIsScreenLocked] = useState(true);
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>('Mesa');
  const [searchTerm, setSearchTerm] = useState('');

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
  }, []);

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

  const quitarDeComanda = (idProducto: number) => {
    setComanda(comanda.filter(item => item.producto.idProducto !== idProducto));
  };

  const obtenerCantidadEnComanda = (idProducto: number): number => {
    const item = comanda.find(item => item.producto.idProducto === idProducto);
    return item ? item.cantidad : 0;
  };

  const calcularTotal = (): number => {
    return comanda.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
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

        <div className="user-info-header">
          <div className="user-avatar-ventas">
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

            <button className="btn-categoria">
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
                    <p className="producto-precio">$ {producto.precio.toFixed(2)}</p>
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
                    $ {(item.producto.precio * item.cantidad).toFixed(2)}
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
    </div>
  );
};

export default PageVentas;
