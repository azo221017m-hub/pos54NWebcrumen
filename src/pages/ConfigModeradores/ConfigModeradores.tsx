import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Shield } from 'lucide-react';
import type { Moderador, ModeradorCreate, ModeradorUpdate } from '../../types/moderador.types';
import {
  useModeradoresQuery,
  useCrearModeradorMutation,
  useActualizarModeradorMutation,
  useEliminarModeradorMutation
} from '../../hooks/queries';
import ListaModeradores from '../../components/moderadores/ListaModeradores/ListaModeradores';
import FormularioModerador from '../../components/moderadores/FormularioModerador/FormularioModerador';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigModeradores.css';

const ConfigModeradores: React.FC = () => {
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [moderadorEditar, setModeradorEditar] = useState<Moderador | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const idnegocio = usuario?.idNegocio || parseInt(localStorage.getItem('idnegocio') || '1');

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  // TanStack Query hooks
  const { data: moderadores = [], isLoading: cargando } = useModeradoresQuery(idnegocio);
  const crearModeradorMutation = useCrearModeradorMutation();
  const actualizarModeradorMutation = useActualizarModeradorMutation();
  const eliminarModeradorMutation = useEliminarModeradorMutation();

  const handleNuevoModerador = () => {
    setModeradorEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarModerador = (moderador: Moderador) => {
    setModeradorEditar(moderador);
    setMostrarFormulario(true);
  };

  const handleGuardarModerador = async (moderadorData: ModeradorCreate) => {
    try {
      if (moderadorEditar) {
        const dataUpdate: ModeradorUpdate = {
          nombremoderador: moderadorData.nombremoderador,
          usuarioauditoria: moderadorData.usuarioauditoria,
          estatus: moderadorData.estatus
        };
        await actualizarModeradorMutation.mutateAsync({ id: moderadorEditar.idmoderador, data: dataUpdate });
        mostrarMensaje('success', 'Moderador actualizado correctamente');
        setMostrarFormulario(false);
        setModeradorEditar(null);
      } else {
        await crearModeradorMutation.mutateAsync(moderadorData);
        mostrarMensaje('success', 'Moderador creado correctamente');
        setMostrarFormulario(false);
        setModeradorEditar(null);
      }
    } catch (error: any) {
      console.error('❌ Error al guardar moderador:', {
        message: error?.response?.data?.message || error?.response?.data?.mensaje || error?.message || 'Error desconocido',
        status: error?.response?.status,
        data: error?.response?.data
      });
      const errorMessage = error?.response?.data?.message || error?.response?.data?.mensaje || error?.message || 'Error al guardar el moderador';
      mostrarMensaje('error', errorMessage);
    }
  };

  const handleEliminarModerador = async (id: number) => {
    const moderador = moderadores.find(m => m.idmoderador === id);
    
    if (!window.confirm(
      `¿Está seguro de eliminar el moderador "${moderador?.nombremoderador}"?\n\nEsta acción desactivará el moderador.`
    )) {
      return;
    }

    try {
      await eliminarModeradorMutation.mutateAsync(id);
      mostrarMensaje('success', 'Moderador eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar moderador:', error);
      mostrarMensaje('error', 'Error al eliminar el moderador');
    }
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setModeradorEditar(null);
  };

  return (
    <div className="config-moderadores-page">
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
            <Shield size={32} className="config-icon" />
            <div>
              <h1>Gestión de Moderadores</h1>
              <p>Administra los moderadores del sistema</p>
            </div>
          </div>
          <button onClick={handleNuevoModerador} className="btn-nuevo">
            <Plus size={20} />
            Nuevo Moderador
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando moderadores..." />
        ) : (
          <ListaModeradores
            moderadores={moderadores}
            onEdit={handleEditarModerador}
            onDelete={handleEliminarModerador}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioModerador
          moderador={moderadorEditar}
          idnegocio={idnegocio}
          onSave={handleGuardarModerador}
          onCancel={handleCancelarFormulario}
        />
      )}
    </div>
  );
};

export default ConfigModeradores;
