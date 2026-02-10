import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import type { Turno } from '../../types/turno.types';
import { EstatusTurno } from '../../types/turno.types';
import {
  obtenerTurnos,
  cerrarTurnoActual
} from '../../services/turnosService';
import CierreTurno from '../../components/turnos/CierreTurno/CierreTurno';
import ListaTurnos from '../../components/turnos/ListaTurnos/ListaTurnos';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ConfigTurnos.css';

// Types from CierreTurno component - duplicated here to avoid circular dependencies
// TODO: Consider moving to a shared types file if these types are needed elsewhere
interface Denominaciones {
  billete1000: number;
  billete500: number;
  billete200: number;
  billete100: number;
  billete50: number;
  billete20: number;
  moneda10: number;
  moneda5: number;
  moneda1: number;
  moneda050: number;
}

type EstatusCierre = 'sin_novedades' | 'cuentas_pendientes';

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

  const handleCerrarTurno = async (datosFormulario: {
    idTurno: string;
    retiroFondo: number;
    totalArqueo: number;
    detalleDenominaciones: Denominaciones;
    estatusCierre: EstatusCierre;
  }) => {
    if (!turnoEditar) return;
    
    try {
      // Log the closure data for debugging
      console.log('Datos del cierre de turno:', datosFormulario);
      
      // Call the backend endpoint with the closure data
      await cerrarTurnoActual(datosFormulario);
      
      mostrarMensaje('success', 'Turno cerrado exitosamente');
      setMostrarFormulario(false);
      setTurnoEditar(undefined);
      
      // Reload shifts to get updated data
      await cargarTurnos();
    } catch (error) {
      console.error('Error al cerrar turno:', error);
      mostrarMensaje('error', 'Error al cerrar el turno');
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
        </div>
      </div>

      {/* Contenedor fijo con Lista */}
      <div className="config-container">
        {cargando ? (
          <LoadingSpinner size={48} message="Cargando turnos..." />
        ) : (
          <ListaTurnos
            turnos={turnos}
            onEdit={handleEditarTurno}
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
