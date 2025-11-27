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
    if (!window.confirm('¿Está seguro de eliminar este moderador?')) {
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
      <div className="gestion-header">
        <div className="header-info">
          <Shield size={32} className="header-icon" />
          <div>
            <h2>Moderadores</h2>
            <p>Gestiona los moderadores del sistema</p>
          </div>
        </div>
        <button className="btn-nuevo-moderador" onClick={handleNuevoModerador}>
          <Plus size={20} />
          Nuevo Moderador
        </button>
      </div>

      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {cargando ? (
        <div className="loading-container">
          <Loader size={48} className="spinner" />
          <p>Cargando moderadores...</p>
        </div>
      ) : (
        <ListaModeradores
          moderadores={moderadores}
          onEdit={handleEditarModerador}
          onDelete={handleEliminarModerador}
        />
      )}

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
