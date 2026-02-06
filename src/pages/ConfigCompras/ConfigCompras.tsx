import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ShoppingCart, Loader } from 'lucide-react';
import type { CompraWithDetails, CompraCreate, CompraUpdate } from '../../types/compras.types';
import {
  obtenerCompras,
  crearCompra,
  actualizarCompra,
  eliminarCompra
} from '../../services/comprasService';
import ListaCompras from '../../components/compras/ListaCompras/ListaCompras';
import FormularioCompra from '../../components/compras/FormularioCompra/FormularioCompra';
import './ConfigCompras.css';

const ConfigCompras: React.FC = () => {
  const navigate = useNavigate();
  const [compras, setCompras] = useState<CompraWithDetails[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraWithDetails | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarCompras = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerCompras();
      setCompras(data);
    } catch (error) {
      console.error('Error al cargar compras:', error);
      mostrarMensaje('error', 'Error al cargar las compras');
      setCompras([]);
    } finally {
      setCargando(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarCompras();
  }, [cargarCompras]);

  const handleNuevo = () => {
    setCompraSeleccionada(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (compra: CompraWithDetails) => {
    setCompraSeleccionada(compra);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id: number) => {
    const compra = compras.find(c => c.idcompra === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar la compra "${compra?.foliocompra}"?\n\nEsta acción marcará la compra como eliminada.`
    )) {
      return;
    }

    try {
      const eliminado = await eliminarCompra(id);
      if (eliminado) {
        mostrarMensaje('success', 'Compra eliminada exitosamente');
        // Recargar la lista de compras
        cargarCompras();
      }
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      mostrarMensaje('error', 'Error al eliminar la compra');
    }
  };

  const handleSubmit = async (data: CompraCreate | CompraUpdate) => {
    setGuardando(true);

    try {
      if (compraSeleccionada) {
        // Actualizar compra existente
        const resultado = await actualizarCompra(compraSeleccionada.idcompra, data as CompraUpdate);
        if (resultado.success) {
          mostrarMensaje('success', 'Compra actualizada exitosamente');
          setMostrarFormulario(false);
          setCompraSeleccionada(null);
          // Recargar la lista
          cargarCompras();
        } else {
          mostrarMensaje('error', resultado.message || 'Error al actualizar la compra');
        }
      } else {
        // Crear nueva compra
        const resultado = await crearCompra(data as CompraCreate);
        if (resultado.success) {
          mostrarMensaje('success', `Compra creada exitosamente: ${resultado.foliocompra}`);
          setMostrarFormulario(false);
          // Recargar la lista
          cargarCompras();
        } else {
          mostrarMensaje('error', resultado.message || 'Error al crear la compra');
        }
      }
    } catch (error) {
      console.error('Error al guardar compra:', error);
      mostrarMensaje('error', 'Error al guardar la compra');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setCompraSeleccionada(null);
  };

  return (
    <div className="config-compras-page">
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
            <ShoppingCart size={32} className="config-icon" />
            <div>
              <h1>Gestión de Compras</h1>
              <p>Administra las compras del sistema</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nueva Compra
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando compras...</p>
          </div>
        ) : (
          <ListaCompras
            compras={compras}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioCompra
          compraEditar={compraSeleccionada}
          idnegocio={idnegocio}
          onSubmit={handleSubmit}
          onCancel={handleCancelar}
          loading={guardando}
        />
      )}
    </div>
  );
};

export default ConfigCompras;
