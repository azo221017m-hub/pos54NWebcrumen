import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import type { ProductoWeb, ProductoWebCreate, ProductoWebUpdate } from '../../types/productoWeb.types';
import {
  useProductosWebQuery,
  useCrearProductoWebMutation,
  useActualizarProductoWebMutation,
  useEliminarProductoWebMutation
} from '../../hooks/queries';
import ListaProductosWeb from '../../components/productosWeb/ListaProductosWeb/ListaProductosWeb';
import FormularioProductoWeb from '../../components/productosWeb/FormularioProductoWeb/FormularioProductoWeb';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigProductosWeb.css';

const ConfigProductosWeb: React.FC = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoWeb | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  // TanStack Query hooks
  const { data: productosData = [], isLoading: cargando, error } = useProductosWebQuery();
  const crearMutation = useCrearProductoWebMutation();
  const actualizarMutation = useActualizarProductoWebMutation();
  const eliminarMutation = useEliminarProductoWebMutation();

  // Filter productos - memoized to avoid recalculation
  const productos = useMemo(() => {
    return productosData.filter(p => p.tipoproducto !== 'Materia Prima');
  }, [productosData]);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  // Handle query errors
  if (error) {
    console.error('Error al cargar productos:', error);
  }

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
      await eliminarMutation.mutateAsync(id);
      mostrarMensaje('success', 'Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      mostrarMensaje('error', 'Error al eliminar el producto');
    }
  };

  const handleToggleMenuDia = async (id: number, currentValue: number) => {
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      
      // Find the product in the current state
      const producto = productos.find(p => p.idProducto === id);
      if (!producto) {
        mostrarMensaje('error', 'Producto no encontrado');
        return;
      }
      
      // Create a complete ProductoWebUpdate object with only menudia updated
      const productoActualizado: ProductoWebUpdate = {
        ...producto,
        menudia: newValue
      };
      
      await actualizarMutation.mutateAsync({ id, data: productoActualizado });
      
      mostrarMensaje('success', `Producto ${newValue === 1 ? 'agregado al' : 'removido del'} Menú del Día`);
    } catch (error) {
      console.error('Error al actualizar menú del día:', error);
      mostrarMensaje('error', 'Error al actualizar el producto');
    }
  };

  const handleSubmit = async (data: ProductoWebCreate | ProductoWebUpdate) => {
    try {
      if ('idProducto' in data) {
        await actualizarMutation.mutateAsync({ id: data.idProducto, data });
        mostrarMensaje('success', 'Producto actualizado exitosamente');
      } else {
        await crearMutation.mutateAsync(data);
        mostrarMensaje('success', 'Producto creado exitosamente');
      }
      setMostrarFormulario(false);
      setProductoSeleccionado(null);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el producto';
      mostrarMensaje('error', errorMessage);
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
          <LoadingSpinner size={48} message="Cargando productos..." />
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
          loading={crearMutation.isPending || actualizarMutation.isPending}
        />
      )}
    </div>
  );
};

export default ConfigProductosWeb;
