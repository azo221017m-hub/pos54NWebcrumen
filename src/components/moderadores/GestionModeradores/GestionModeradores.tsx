import React, { useState, useEffect, useCallback } from 'react';
import type { Moderador, ModeradorCreate, ModeradorUpdate } from '../../../types/moderador.types';
import {
  obtenerModeradores,
  crearModerador,
  actualizarModerador,
  eliminarModerador
} from '../../../services/moderadoresService';
import ListaModeradores from '../ListaModeradores/ListaModeradores';
import FormularioModerador from '../FormularioModerador/FormularioModerador';
import { Plus, Shield, Loader } from 'lucide-react';
import './GestionModeradores.css';

interface Props {
  idnegocio: number;
}

const GestionModeradores: React.FC<Props> = ({ idnegocio }) => {
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [moderadorEditar, setModeradorEditar] = useState<Moderador | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarModeradores = useCallback(async () => {
    try {
      console.log('🔷 GestionModeradores - Iniciando carga...');
      setCargando(true);
      const data = await obtenerModeradores(idnegocio);
      console.log('🔷 GestionModeradores - Datos recibidos:', data);
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
    } catch (error) {
      console.error('Error al guardar moderador:', error);
      mostrarMensaje('error', 'Error al guardar el moderador');
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
    <div className="gestion-moderadores">
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

      <div className="moderadores-header">
        <div className="moderadores-header-content">
          <div className="moderadores-title">
            <Shield size={32} className="moderadores-icon" />
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

      <div className="moderadores-content">
        {cargando ? (
          <div className="moderadores-cargando">
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

export default GestionModeradores;
