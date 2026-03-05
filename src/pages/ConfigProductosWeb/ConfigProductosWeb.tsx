import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package } from 'lucide-react';
import type { ProductoWeb, ProductoWebCreate, ProductoWebUpdate } from '../../types/productoWeb.types';
import {
  obtenerProductosWeb,
  crearProductoWeb,
  actualizarProductoWeb,
  eliminarProductoWeb
} from '../../services/productosWebService';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import ListaProductosWeb from '../../components/productosWeb/ListaProductosWeb/ListaProductosWeb';
import FormularioProductoWeb from '../../components/productosWeb/FormularioProductoWeb/FormularioProductoWeb';
import './ConfigProductosWeb.css';

const ConfigProductosWeb: React.FC = () => {
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
      const idEliminado = await eliminarProductoWeb(id);
      mostrarMensaje('success', 'Producto eliminado exitosamente');
      // Actualizar estado local sin recargar
      setProductos(prev => prev.filter(producto => producto.idProducto !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      mostrarMensaje('error', 'Error al eliminar el producto');
    }
  };

  // Función comentada - no utilizada en el layout estándar
  // Se mantiene por si es necesaria en el futuro
  /*
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
      
      const productoActualizadoCompleto = await actualizarProductoWeb(id, productoActualizado);
      
      mostrarMensaje('success', `Producto ${newValue === 1 ? 'agregado al' : 'removido del'} Menú del Día`);
      // Actualizar estado local sin recargar
      setProductos(prev =>
        prev.map(p =>
          p.idProducto === productoActualizadoCompleto.idProducto ? productoActualizadoCompleto : p
        )
      );
    } catch (error) {
      console.error('Error al actualizar menú del día:', error);
      mostrarMensaje('error', 'Error al actualizar el producto');
    }
  };
  */

  const handleSubmit = async (data: ProductoWebCreate | ProductoWebUpdate) => {
    setGuardando(true);

    try {
      if ('idProducto' in data) {
        const productoActualizado = await actualizarProductoWeb(data.idProducto, data);
        mostrarMensaje('success', 'Producto actualizado exitosamente');
        setMostrarFormulario(false);
        setProductoSeleccionado(null);
        // Actualizar estado local sin recargar
        setProductos(prev =>
          prev.map(producto =>
            producto.idProducto === productoActualizado.idProducto ? productoActualizado : producto
          )
        );
      } else {
        const nuevoProducto = await crearProductoWeb(data);
        mostrarMensaje('success', 'Producto creado exitosamente');
        setMostrarFormulario(false);
        // Actualizar estado local sin recargar - solo si no es Materia Prima
        if (nuevoProducto.tipoproducto !== 'Materia Prima') {
          setProductos(prev => [...prev, nuevoProducto]);
        }
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el producto';
      mostrarMensaje('error', errorMessage);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setProductoSeleccionado(null);
  };

  return (
    <>
      {/* Mensaje de Notificación */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
        </div>
      )}

      <StandardPageLayout
        headerTitle="GESTIÓN DE PRODUCTOS"
        headerSubtitle={`${productos.length} productos registrados`}
        actionButton={{
          text: 'Nuevo Producto',
          icon: <Plus size={20} />,
          onClick: handleNuevo
        }}
        loading={cargando}
        loadingMessage="Cargando productos..."
        isEmpty={productos.length === 0}
        emptyIcon={<Package size={80} />}
        emptyMessage="No hay productos registrados."
      >
        <ListaProductosWeb
          productos={productos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </StandardPageLayout>

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
    </>
  );
};

export default ConfigProductosWeb;
