import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package, Loader } from 'lucide-react';
import type { ProductoWeb, ProductoWebCreate, ProductoWebUpdate } from '../../types/productoWeb.types';
import {
  obtenerProductosWeb,
  crearProductoWeb,
  actualizarProductoWeb,
  eliminarProductoWeb
} from '../../services/productosWebService';
import ListaProductosWeb from '../../components/productosWeb/ListaProductosWeb/ListaProductosWeb';
import FormularioProductoWeb from '../../components/productosWeb/FormularioProductoWeb/FormularioProductoWeb';
import './ConfigProductosWeb.css';

const ConfigProductosWeb: React.FC = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoWeb[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoWeb | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerProductosWeb();
      // Filtrar productos que no sean Materia Prima
      const productosFiltrados = data.filter(p => p.tipoproducto !== 'Materia Prima');
      setProductos(productosFiltrados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      mostrarMensaje('error', 'Error al cargar los productos');
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const handleNuevo = () => {
    setProductoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (producto: ProductoWeb) => {
    setProductoSeleccionado(producto);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    const producto = productos.find(p => p.idProducto === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar el producto "${producto?.nombre}"?\n\nEsta acción desactivará el producto.`
    )) {
      return;
    }

    try {
      const exito = await eliminarProductoWeb(id);
      if (exito) {
        mostrarMensaje('success', 'Producto eliminado exitosamente');
        cargarProductos();
      } else {
        mostrarMensaje('error', 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      mostrarMensaje('error', 'Error al eliminar el producto');
    }
  };

  const handleToggleMenuDia = async (id: number, currentValue: number) => {
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      const resultado = await actualizarProductoWeb(id, { menudia: newValue });
      
      if (resultado.success) {
        mostrarMensaje('success', `Producto ${newValue === 1 ? 'agregado al' : 'removido del'} Menú del Día`);
        cargarProductos();
      } else {
        mostrarMensaje('error', resultado.message || 'Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error al actualizar menú del día:', error);
      mostrarMensaje('error', 'Error al actualizar el producto');
    }
  };

  const handleSubmit = async (data: ProductoWebCreate | ProductoWebUpdate) => {
    setGuardando(true);

    try {
      if ('idProducto' in data) {
        const resultado = await actualizarProductoWeb(data.idProducto, data);
        if (resultado.success) {
          mostrarMensaje('success', 'Producto actualizado exitosamente');
          setMostrarFormulario(false);
          setProductoSeleccionado(null);
          cargarProductos();
        } else {
          mostrarMensaje('error', resultado.message || 'Error al actualizar el producto');
        }
      } else {
        const resultado = await crearProductoWeb(data);
        if (resultado.success) {
          mostrarMensaje('success', 'Producto creado exitosamente');
          setMostrarFormulario(false);
          cargarProductos();
        } else {
          mostrarMensaje('error', resultado.message || 'Error al crear el producto');
        }
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      mostrarMensaje('error', 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setProductoSeleccionado(null);
  };

  return (
    <div className="config-productos-web-page">
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`mensaje-notificacion mensaje-${mensaje.tipo}`}>
          <div className="mensaje-contenido">
            <span className="mensaje-texto">{mensaje.texto}</span>
            <button
              className="mensaje-cerrar"
              onClick={() => setMensaje(null)}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header con botones */}
      <div className="config-header">
        <button className="btn-volver" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        
        <div className="config-header-content">
          <div className="config-title">
            <Package size={32} className="config-icon" />
            <div>
              <h1>Gestión de Productos</h1>
              <p>Administra los productos del sistema</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando productos...</p>
          </div>
        ) : (
          <ListaProductosWeb
            productos={productos}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            onToggleMenuDia={handleToggleMenuDia}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioProductoWeb
          productoEditar={productoSeleccionado}
          idnegocio={idnegocio}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
          loading={guardando}
        />
      )}
    </div>
  );
};

export default ConfigProductosWeb;
