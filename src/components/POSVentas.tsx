// src/components/POSVentas.tsx
// Componente principal para el punto de venta (POS)
// Muestra categorías, productos según la categoría seleccionada, y una comanda

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Categoria, Producto, ComandaProducto } from '../types';
import '../styles/POSVentas.css';

interface POSVentasProps {
  onBack: () => void;
}

const POSVentas: React.FC<POSVentasProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [comanda, setComanda] = useState<ComandaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  // Cargar productos cuando se selecciona una categoría
  useEffect(() => {
    if (categoriaSeleccionada !== null) {
      cargarProductos(categoriaSeleccionada);
    }
  }, [categoriaSeleccionada]);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/categorias');
      const data = await response.json();
      
      if (data.success) {
        setCategorias(data.data);
      } else {
        setError('Error al cargar categorías');
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async (idCategoria: number) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/productos');
      const data = await response.json();
      
      if (data.success) {
        // Filtrar productos por categoría
        const productosFiltrados = data.data.filter(
          (p: Producto) => p.idCategoria === idCategoria
        );
        setProductos(productosFiltrados);
      } else {
        setError('Error al cargar productos');
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const agregarAComanda = (producto: Producto) => {
    const productoExistente = comanda.find(p => p.idProducto === producto.idProducto);
    
    if (productoExistente) {
      // Incrementar cantidad si ya existe
      setComanda(comanda.map(p => 
        p.idProducto === producto.idProducto
          ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio }
          : p
      ));
    } else {
      // Agregar nuevo producto a la comanda
      const nuevoProducto: ComandaProducto = {
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        subtotal: producto.precio,
        imagenProducto: producto.imagenProducto
      };
      setComanda([...comanda, nuevoProducto]);
    }
  };

  const eliminarDeComanda = (idProducto: number) => {
    setComanda(comanda.filter(p => p.idProducto !== idProducto));
  };

  const incrementarCantidad = (idProducto: number) => {
    setComanda(comanda.map(p => 
      p.idProducto === idProducto
        ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio }
        : p
    ));
  };

  const decrementarCantidad = (idProducto: number) => {
    setComanda(comanda.map(p => {
      if (p.idProducto === idProducto) {
        const nuevaCantidad = p.cantidad - 1;
        if (nuevaCantidad <= 0) {
          return p; // Se eliminará en el filtro siguiente
        }
        return { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio };
      }
      return p;
    }).filter(p => p.cantidad > 0));
  };

  const calcularTotal = (): number => {
    return comanda.reduce((total, producto) => total + producto.subtotal, 0);
  };

  const limpiarComanda = () => {
    setComanda([]);
  };

  const procesarVenta = () => {
    if (comanda.length === 0) {
      alert('La comanda está vacía');
      return;
    }
    
    // TODO: Implementar procesamiento de venta (enviar al backend)
    alert(`Venta procesada: Total $${calcularTotal().toFixed(2)}`);
    limpiarComanda();
  };

  return (
    <div className="pos-ventas-container">
      {/* Header */}
      <div className="pos-header">
        <button className="btn-back" onClick={onBack}>
          ← Regresar
        </button>
        <h1>🛒 Punto de Venta</h1>
        <div className="user-info">
          👤 {user?.nombre || 'Usuario'}
        </div>
      </div>

      {/* Contenedor principal con 3 columnas */}
      <div className="pos-main">
        {/* Panel de Categorías */}
        <div className="pos-panel categorias-panel">
          <h2>📂 Categorías</h2>
          {loading && <p>Cargando categorías...</p>}
          {error && <p className="error">{error}</p>}
          <div className="categorias-lista">
            {categorias.map(categoria => (
              <button
                key={categoria.idCategoria}
                className={`categoria-card ${categoriaSeleccionada === categoria.idCategoria ? 'selected' : ''}`}
                onClick={() => setCategoriaSeleccionada(categoria.idCategoria)}
              >
                <div className="categoria-nombre">{categoria.nombre}</div>
                {categoria.descripcion && (
                  <div className="categoria-descripcion">{categoria.descripcion}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Productos */}
        <div className="pos-panel productos-panel">
          <h2>🍽️ Productos</h2>
          {!categoriaSeleccionada ? (
            <p className="info-message">Selecciona una categoría para ver productos</p>
          ) : loading ? (
            <p>Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="info-message">No hay productos en esta categoría</p>
          ) : (
            <div className="productos-grid">
              {productos.map(producto => (
                <div
                  key={producto.idProducto}
                  className="producto-card"
                  onClick={() => agregarAComanda(producto)}
                >
                  {producto.imagenProducto && (
                    <img 
                      src={`http://localhost:4000${producto.imagenProducto}`} 
                      alt={producto.nombre}
                      className="producto-imagen"
                    />
                  )}
                  <div className="producto-nombre">{producto.nombre}</div>
                  <div className="producto-descripcion">{producto.descripcion}</div>
                  <div className="producto-precio">${producto.precio.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Comanda */}
        <div className="pos-panel comanda-panel">
          <h2>📝 Comanda</h2>
          {comanda.length === 0 ? (
            <p className="info-message">La comanda está vacía</p>
          ) : (
            <>
              <div className="comanda-lista">
                {comanda.map(producto => (
                  <div key={producto.idProducto} className="comanda-item">
                    <div className="comanda-item-info">
                      <div className="comanda-item-nombre">{producto.nombre}</div>
                      <div className="comanda-item-precio">${producto.precio.toFixed(2)}</div>
                    </div>
                    <div className="comanda-item-controles">
                      <button 
                        className="btn-cantidad"
                        onClick={() => decrementarCantidad(producto.idProducto)}
                      >
                        −
                      </button>
                      <span className="comanda-item-cantidad">{producto.cantidad}</span>
                      <button 
                        className="btn-cantidad"
                        onClick={() => incrementarCantidad(producto.idProducto)}
                      >
                        +
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => eliminarDeComanda(producto.idProducto)}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="comanda-item-subtotal">
                      ${producto.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="comanda-footer">
                <div className="comanda-total">
                  <strong>TOTAL:</strong>
                  <strong>${calcularTotal().toFixed(2)}</strong>
                </div>
                <div className="comanda-acciones">
                  <button className="btn-limpiar" onClick={limpiarComanda}>
                    Limpiar
                  </button>
                  <button className="btn-procesar" onClick={procesarVenta}>
                    Procesar Venta
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSVentas;
