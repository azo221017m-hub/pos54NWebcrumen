import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, Loader } from 'lucide-react';
import type { Turno, TurnoUpdate } from '../../types/turno.types';
import { EstatusTurno } from '../../types/turno.types';
import {
  obtenerTurnos,
  crearTurno,
  actualizarTurno,
  eliminarTurno
} from '../../services/turnosService';
import CierreTurno from '../../components/turnos/CierreTurno/CierreTurno';
import ListaTurnos from '../../components/turnos/ListaTurnos/ListaTurnos';
import './ConfigTurnos.css';

const ConfigTurnos: React.FC = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [turnoEditar, setTurnoEditar] = useState<Turno | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarTurnos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerTurnos();
      setTurnos(data);
    } catch (error) {
      console.error('Error al cargar turnos:', error);
      mostrarMensaje('error', 'Error al cargar los turnos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  const handleIniciarTurno = async () => {
    try {
      // Verificar si ya existe un turno abierto
      const turnoAbierto = turnos.find(t => t.estatusturno === EstatusTurno.ABIERTO);
      if (turnoAbierto) {
        mostrarMensaje('error', 'Ya existe un turno abierto. Cierra el turno actual antes de iniciar uno nuevo.');
        return;
      }

      const nuevoTurno = await crearTurno();
      mostrarMensaje('success', 'Turno iniciado exitosamente');
      setTurnos(prev => [...prev, nuevoTurno]);
    } catch (error: any) {
      console.error('Error al iniciar turno:', error);
      const errorMsg = error.response?.data?.message || 'Error al iniciar el turno';
      mostrarMensaje('error', errorMsg);
    }
  };

  const handleCerrarTurno = async () => {
    if (!turnoEditar) return;
    
    try {
      // Actualizar el turno con estatus cerrado
      const turnoUpdate: TurnoUpdate = {
        estatusturno: EstatusTurno.CERRADO
      };
      
      const turnoActualizado = await actualizarTurno(turnoEditar.idturno, turnoUpdate);
      mostrarMensaje('success', 'Turno cerrado exitosamente');
      setMostrarFormulario(false);
      setTurnoEditar(undefined);
      setTurnos(prev =>
        prev.map(t =>
          t.idturno === turnoActualizado.idturno ? turnoActualizado : t
        )
      );
    } catch (error) {
      console.error('Error al cerrar turno:', error);
      mostrarMensaje('error', 'Error al cerrar el turno');
    }
  };

  const handleEliminarTurno = async (idturno: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este turno?')) {
      return;
    }

    try {
      const idEliminado = await eliminarTurno(idturno);
      mostrarMensaje('success', 'Turno eliminado exitosamente');
      setTurnos(prev => prev.filter(t => t.idturno !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar turno:', error);
      mostrarMensaje('error', 'Error al eliminar el turno');
    }
  };

  const handleEditarTurno = (turno: Turno) => {
    if (turno.estatusturno === EstatusTurno.CERRADO) {
      mostrarMensaje('error', 'No se pueden editar turnos cerrados');
      return;
    }
    setTurnoEditar(turno);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setTurnoEditar(undefined);
  };

  return (
    <div className="config-turnos-page">
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
            <Clock size={32} className="config-icon" />
            <div>
              <h1>Gestión de Turnos</h1>
              <p>Administra los turnos de trabajo del negocio</p>
            </div>
          </div>
          <button onClick={handleIniciarTurno} className="btn-nuevo">
            <Plus size={20} />
            Iniciar Turno
          </button>
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <div className="config-cargando">
            <Loader className="spinner" size={48} />
            <p>Cargando turnos...</p>
          </div>
        ) : (
          <ListaTurnos
            turnos={turnos}
            onEdit={handleEditarTurno}
            onDelete={handleEliminarTurno}
          />
        )}
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && turnoEditar && (
        <CierreTurno
          turno={turnoEditar}
          onSubmit={handleCerrarTurno}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default ConfigTurnos;
