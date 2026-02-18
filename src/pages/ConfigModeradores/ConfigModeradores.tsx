import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Shield, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import type { Moderador, ModeradorCreate, ModeradorUpdate } from '../../types/moderador.types';
import {
  obtenerModeradores,
  crearModerador,
  actualizarModerador,
  eliminarModerador
} from '../../services/moderadoresService';
import FormularioModerador from '../../components/moderadores/FormularioModerador/FormularioModerador';
import './ConfigModeradores.css';

const ConfigModeradores: React.FC = () => {
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [moderadorEditar, setModeradorEditar] = useState<Moderador | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  // Obtener idnegocio del localStorage
  const idnegocio = parseInt(localStorage.getItem('idnegocio') || '1');

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarModeradores = useCallback(async () => {
    try {
      console.log('🔷 ConfigModeradores - Iniciando carga...');
      setCargando(true);
      const data = await obtenerModeradores(idnegocio);
      console.log('🔷 ConfigModeradores - Datos recibidos:', data);
      setModeradores(data);
    } catch (error) {
      console.error('❌ Error al cargar moderadores:', error);
      mostrarMensaje('error', 'Error al cargar los moderadores');
      setModeradores([]);
    } finally {
      setCargando(false);
    }
  }, [idnegocio, mostrarMensaje]);

  useEffect(() => {
    cargarModeradores();
  }, [cargarModeradores]);

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
        const moderadorActualizado = await actualizarModerador(moderadorEditar.idmoderador, dataUpdate);
        mostrarMensaje('success', 'Moderador actualizado correctamente');
        setMostrarFormulario(false);
        setModeradorEditar(null);
        setModeradores(prev =>
          prev.map(mod =>
            mod.idmoderador === moderadorActualizado.idmoderador ? moderadorActualizado : mod
          )
        );
      } else {
        const nuevoModerador = await crearModerador(moderadorData);
        mostrarMensaje('success', 'Moderador creado correctamente');
        setMostrarFormulario(false);
        setModeradorEditar(null);
        setModeradores(prev => [...prev, nuevoModerador]);
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
      const idEliminado = await eliminarModerador(id);
      mostrarMensaje('success', 'Moderador eliminado correctamente');
      setModeradores(prev => prev.filter(mod => mod.idmoderador !== idEliminado));
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
        headerTitle="Gestión de Moderadores"
        headerSubtitle="Administra los moderadores del sistema"
        actionButton={{
          text: 'Nuevo Moderador',
          icon: <Plus size={20} />,
          onClick: handleNuevoModerador
        }}
        loading={cargando}
        loadingMessage="Cargando moderadores..."
        isEmpty={moderadores.length === 0}
        emptyIcon={<Shield size={64} />}
        emptyMessage="No hay moderadores registrados."
      >
        <div className="standard-cards-grid">
          {moderadores.map((moderador) => (
            <StandardCard
              key={moderador.idmoderador}
              title={moderador.nombremoderador}
              fields={[
                {
                  label: 'Estado',
                  value: (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: moderador.estatus === 1 ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {moderador.estatus === 1 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {moderador.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  )
                },
                {
                  label: 'Usuario Auditoría',
                  value: moderador.usuarioauditoria || 'N/A'
                },
                {
                  label: 'Fecha Registro',
                  value: moderador.fechaRegistroauditoria
                    ? new Date(moderador.fechaRegistroauditoria).toLocaleDateString('es-MX')
                    : 'N/A'
                }
              ]}
              actions={[
                {
                  label: 'Editar',
                  icon: <Edit size={16} />,
                  onClick: () => handleEditarModerador(moderador),
                  variant: 'edit'
                },
                {
                  label: 'Eliminar',
                  icon: <Trash2 size={16} />,
                  onClick: () => handleEliminarModerador(moderador.idmoderador),
                  variant: 'delete'
                }
              ]}
            />
          ))}
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
      </StandardPageLayout>
    </>
  );
};

export default ConfigModeradores;
