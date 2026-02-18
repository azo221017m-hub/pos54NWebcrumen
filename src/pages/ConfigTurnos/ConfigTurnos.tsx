import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Edit } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import type { Turno } from '../../types/turno.types';
import { EstatusTurno } from '../../types/turno.types';
import {
  obtenerTurnos,
  cerrarTurnoActual
} from '../../services/turnosService';
import CierreTurno from '../../components/turnos/CierreTurno/CierreTurno';
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
      const response = await cerrarTurnoActual(datosFormulario);
      
      mostrarMensaje('success', 'Turno cerrado exitosamente');
      setMostrarFormulario(false);
      setTurnoEditar(undefined);
      
      // Actualizar estado local sin recargar - cambiar el estatus del turno cerrado
      setTurnos(prev =>
        prev.map(turno =>
          turno.idturno === response.idturno 
            ? { ...turno, estatusturno: EstatusTurno.CERRADO }
            : turno
        )
      );
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

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        headerTitle="GESTIÓN DE TURNOS"
        headerSubtitle={`${turnos.length} turnos registrados`}
        loading={cargando}
        loadingMessage="Cargando turnos..."
        isEmpty={turnos.length === 0}
        emptyIcon={<Clock size={80} />}
        emptyMessage="No hay turnos registrados."
      >
        <div className="standard-cards-grid">
          {turnos.map((turno) => (
            <StandardCard
              key={turno.idturno}
              title={`Turno #${turno.numeroturno}`}
              fields={[
                {
                  label: 'Clave',
                  value: turno.claveturno
                },
                {
                  label: 'Usuario',
                  value: turno.usuarioturno
                },
                {
                  label: 'Inicio',
                  value: formatearFecha(turno.fechainicioturno)
                },
                {
                  label: 'Fin',
                  value: turno.fechafinturno ? formatearFecha(turno.fechafinturno) : 'En curso'
                },
                {
                  label: 'Estado',
                  value: (
                    <span style={{ 
                      color: turno.estatusturno === EstatusTurno.ABIERTO ? '#10b981' : '#6b7280',
                      fontWeight: 600
                    }}>
                      {turno.estatusturno.toUpperCase()}
                    </span>
                  )
                }
              ]}
              actions={turno.estatusturno === EstatusTurno.ABIERTO ? [
                {
                  label: 'Cerrar Turno',
                  icon: <Edit size={18} />,
                  onClick: () => handleEditarTurno(turno),
                  variant: 'edit'
                }
              ] : []}
            />
          ))}
        </div>
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && turnoEditar && (
        <CierreTurno
          turno={turnoEditar}
          onSubmit={handleCerrarTurno}
          onCancel={handleCancelar}
        />
      )}
    </>
  );
};

export default ConfigTurnos;
