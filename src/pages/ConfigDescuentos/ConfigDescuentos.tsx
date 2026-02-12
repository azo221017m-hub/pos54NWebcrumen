import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BadgePercent } from 'lucide-react';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../../types/descuento.types';
import {
  useDescuentosQuery,
  useCrearDescuentoMutation,
  useActualizarDescuentoMutation,
  useEliminarDescuentoMutation,
} from '../../hooks/queries';
import FormularioDescuento from '../../components/descuentos/FormularioDescuento/FormularioDescuento';
import ListaDescuentos from '../../components/descuentos/ListaDescuentos/ListaDescuentos';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigDescuentos.css';

const ConfigDescuentos: React.FC = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descuentoEditar, setDescuentoEditar] = useState<Descuento | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  // TanStack Query hooks
  const { data: descuentos = [], isLoading: cargando } = useDescuentosQuery();
  const crearMutation = useCrearDescuentoMutation();
  const actualizarMutation = useActualizarDescuentoMutation();
  const eliminarMutation = useEliminarDescuentoMutation();

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const handleCrearDescuento = async (descuento: DescuentoCreate | DescuentoUpdate) => {
    try {
      await crearMutation.mutateAsync(descuento as DescuentoCreate);
      mostrarMensaje('success', 'Descuento creado exitosamente');
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al crear descuento:', error);
      mostrarMensaje('error', 'Error al crear el descuento');
    }
  };

  const handleActualizarDescuento = async (descuento: DescuentoCreate | DescuentoUpdate) => {
    if (!descuentoEditar) return;
    
    try {
      await actualizarMutation.mutateAsync({
        id: descuentoEditar.id_descuento,
        data: descuento as DescuentoUpdate,
      });
      mostrarMensaje('success', 'Descuento actualizado exitosamente');
      setMostrarFormulario(false);
      setDescuentoEditar(undefined);
    } catch (error) {
      console.error('Error al actualizar descuento:', error);
      mostrarMensaje('error', 'Error al actualizar el descuento');
    }
  };

  const handleEliminarDescuento = async (id_descuento: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este descuento?')) {
      return;
    }

    try {
      await eliminarMutation.mutateAsync(id_descuento);
      mostrarMensaje('success', 'Descuento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar descuento:', error);
      mostrarMensaje('error', 'Error al eliminar el descuento');
    }
  };

  const handleEditarDescuento = (descuento: Descuento) => {
    setDescuentoEditar(descuento);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setDescuentoEditar(undefined);
  };

  const handleNuevoDescuento = () => {
    setDescuentoEditar(undefined);
    setMostrarFormulario(true);
  };

  return (
    <div className="config-descuentos-page">
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
            <BadgePercent size={32} className="config-icon" />
            <div>
              <h1>Gestión de Descuentos</h1>
              <p>Administra los descuentos del negocio</p>
            </div>
          </div>
          <button onClick={handleNuevoDescuento} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Descuento
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando descuentos..." />
        ) : (
          <ListaDescuentos
            descuentos={descuentos}
            onEdit={handleEditarDescuento}
            onDelete={handleEliminarDescuento}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioDescuento
          descuentoInicial={descuentoEditar}
          onSubmit={descuentoEditar ? handleActualizarDescuento : handleCrearDescuento}
          onCancel={handleCancelar}
          idnegocio={idnegocio}
        />
      )}
    </div>
  );
};

export default ConfigDescuentos;
