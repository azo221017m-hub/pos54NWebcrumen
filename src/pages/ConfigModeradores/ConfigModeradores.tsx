import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Shield, Loader } from 'lucide-react';
import type { Moderador, ModeradorCreate, ModeradorUpdate } from '../../types/moderador.types';
import {
  obtenerModeradores,
  crearModerador,
  actualizarModerador,
  eliminarModerador
} from '../../services/moderadoresService';
import ListaModeradores from '../../components/moderadores/ListaModeradores/ListaModeradores';
import FormularioModerador from '../../components/moderadores/FormularioModerador/FormularioModerador';
import './ConfigModeradores.css';

const ConfigModeradores: React.FC = () => {
  const navigate = useNavigate();
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
        await actualizarModerador(moderadorEditar.idmoderador, dataUpdate);
        mostrarMensaje('success', 'Moderador actualizado correctamente');
      } else {
        await crearModerador(moderadorData);
        mostrarMensaje('success', 'Moderador creado correctamente');
      }
      setMostrarFormulario(false);
      setModeradorEditar(null);
      cargarModeradores();
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
      await eliminarModerador(id);
      mostrarMensaje('success', 'Moderador eliminado correctamente');
      cargarModeradores();
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
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando moderadores...</p>
          </div>
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
