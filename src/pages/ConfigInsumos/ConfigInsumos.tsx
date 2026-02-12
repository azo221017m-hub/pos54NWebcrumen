import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import type { Insumo, InsumoCreate } from '../../types/insumo.types';
import {
  useInsumosQuery,
  useCrearInsumoMutation,
  useActualizarInsumoMutation,
  useEliminarInsumoMutation
} from '../../hooks/queries/useInsumos';
import ListaInsumos from '../../components/insumos/ListaInsumos/ListaInsumos';
import FormularioInsumo from '../../components/insumos/FormularioInsumo/FormularioInsumo';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigInsumos.css';

const ConfigInsumos: React.FC = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [insumoEditar, setInsumoEditar] = useState<Insumo | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del usuario en localStorage
  const usuarioData = localStorage.getItem('usuario');
  let usuario = null;
  try {
    usuario = usuarioData ? JSON.parse(usuarioData) : null;
  } catch (error) {
    console.error('Error parsing usuario from localStorage:', error);
  }
  const idnegocio = usuario?.idNegocio || 0;

  // TanStack Query hooks
  const { data: insumos = [], isLoading: cargando } = useInsumosQuery(idnegocio);
  const crearMutation = useCrearInsumoMutation();
  const actualizarMutation = useActualizarInsumoMutation();
  const eliminarMutation = useEliminarInsumoMutation();

  // Helper para extraer mensaje de error
  const extraerMensajeError = (error: unknown, mensajePorDefecto: string): string => {
    return (error as { response?: { data?: { message?: string } } })?.response?.data?.message || mensajePorDefecto;
  };

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const handleNuevo = () => {
    setInsumoEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (insumo: Insumo) => {
    setInsumoEditar(insumo);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setInsumoEditar(null);
  };

  const handleCrear = async (data: InsumoCreate) => {
    try {
      await crearMutation.mutateAsync(data);
      mostrarMensaje('success', 'Insumo creado exitosamente');
      setMostrarFormulario(false);
    } catch (error: unknown) {
      console.error('Error al crear insumo:', error);
      const mensaje = extraerMensajeError(error, 'Error al crear el insumo');
      mostrarMensaje('error', mensaje);
      throw error;
    }
  };

  const handleActualizar = async (data: InsumoCreate) => {
    if (!insumoEditar) return;

    try {
      await actualizarMutation.mutateAsync({ id: insumoEditar.id_insumo, data });
      mostrarMensaje('success', 'Insumo actualizado exitosamente');
      setMostrarFormulario(false);
      setInsumoEditar(null);
    } catch (error: unknown) {
      console.error('Error al actualizar insumo:', error);
      const mensaje = extraerMensajeError(error, 'Error al actualizar el insumo');
      mostrarMensaje('error', mensaje);
      throw error;
    }
  };

  const handleEliminar = async (id: number) => {
    const insumo = insumos.find(i => i.id_insumo === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar el insumo "${insumo?.nombre}"?\n\nEsta acción no se puede deshacer.`
    )) {
      return;
    }

    try {
      await eliminarMutation.mutateAsync(id);
      mostrarMensaje('success', 'Insumo eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar insumo:', error);
      mostrarMensaje('error', 'Error al eliminar el insumo');
    }
  };

  return (
    <div className="config-insumos-page">
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
              <h1>Gestión de Insumos</h1>
              <p>Administra los insumos del negocio</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Insumo
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando insumos..." />
        ) : (
          <ListaInsumos
            insumos={insumos}
            onEdit={handleEditar}
            onDelete={handleEliminar}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioInsumo
          insumoEditar={insumoEditar}
          onSubmit={insumoEditar ? handleActualizar : handleCrear}
          onCancel={handleCancelar}
          loading={cargando}
        />
      )}
    </div>
  );
};

export default ConfigInsumos;
