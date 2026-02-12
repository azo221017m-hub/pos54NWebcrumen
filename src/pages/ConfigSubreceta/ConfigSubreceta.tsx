import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ChefHat } from 'lucide-react';
import ListaSubrecetas from '../../components/subrecetas/ListaSubrecetas/ListaSubrecetas';
import FormularioSubreceta from '../../components/subrecetas/FormularioSubreceta/FormularioSubreceta';
import type { Subreceta, SubrecetaCreate, SubrecetaUpdate } from '../../types/subreceta.types';
import {
  useSubrecetasQuery,
  useCrearSubrecetaMutation,
  useActualizarSubrecetaMutation,
  useEliminarSubrecetaMutation
} from '../../hooks/queries/useSubrecetas';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigSubreceta.css';

const ConfigSubreceta: React.FC = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [subrecetaEditar, setSubrecetaEditar] = useState<Subreceta | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const idnegocio = usuario?.idNegocio || Number(localStorage.getItem('idnegocio')) || 1;

  // TanStack Query hooks
  const { data: subrecetas = [], isLoading: cargando } = useSubrecetasQuery(idnegocio);
  const crearMutation = useCrearSubrecetaMutation();
  const actualizarMutation = useActualizarSubrecetaMutation();
  const eliminarMutation = useEliminarSubrecetaMutation();

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const handleNuevo = () => {
    setSubrecetaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (subreceta: Subreceta) => {
    setSubrecetaEditar(subreceta);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (data: SubrecetaCreate | SubrecetaUpdate) => {
    try {
      if (subrecetaEditar) {
        await actualizarMutation.mutateAsync({ id: subrecetaEditar.idSubReceta, data: data as SubrecetaUpdate });
        setMostrarFormulario(false);
        setSubrecetaEditar(null);
        mostrarMensaje('success', 'Subreceta actualizada exitosamente');
      } else {
        await crearMutation.mutateAsync(data as SubrecetaCreate);
        setMostrarFormulario(false);
        mostrarMensaje('success', 'Subreceta creada exitosamente');
      }
    } catch (error) {
      console.error('Error al guardar subreceta:', error);
      mostrarMensaje('error', 'Error al guardar la subreceta');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta subreceta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await eliminarMutation.mutateAsync(id);
      mostrarMensaje('success', 'Subreceta eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar subreceta:', error);
      mostrarMensaje('error', 'Error al eliminar la subreceta');
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setSubrecetaEditar(null);
  };

  return (
    <div className="config-subreceta-page">
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
            <ChefHat size={32} className="config-icon" />
            <div>
              <h1>Gestión de Subrecetas</h1>
              <p>{subrecetas.length} subreceta{subrecetas.length !== 1 ? 's' : ''} registrada{subrecetas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={handleNuevo} className="btn-nuevo">
            <Plus size={20} />
            Nueva Subreceta
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando subrecetas..." />
        ) : (
          <ListaSubrecetas
            subrecetas={subrecetas}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioSubreceta
          subreceta={subrecetaEditar}
          idnegocio={idnegocio}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default ConfigSubreceta;
