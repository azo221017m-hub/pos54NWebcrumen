import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import ListaTurnos from '../../components/turnos/ListaTurnos/ListaTurnos';
import type { Turno } from '../../types/turno.types';
import { EstatusTurno } from '../../types/turno.types';
import {
  obtenerTurnos,
  cerrarTurno
} from '../../services/turnosService';
import CierreTurno from '../../components/turnos/CierreTurno/CierreTurno';
import TicketFinTurno from '../../components/turnos/TicketFinTurno/TicketFinTurno';
import './ConfigTurnos.css';

const ConfigTurnos: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [turnoEditar, setTurnoEditar] = useState<Turno | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [claveturnoCorte, setClaveturnoCorte] = useState<string | null>(null);
  const [efectivoContadoCorte, setEfectivoContadoCorte] = useState<number | undefined>(undefined);

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

  // Paso 1: el formulario de arqueo confirma → mostrar preview del ticket SIN cerrar aún
  const handleCierreTurnoFormSubmit = (claveturno: string, totalArqueo: number) => {
    setEfectivoContadoCorte(totalArqueo > 0 ? totalArqueo : undefined);
    setClaveturnoCorte(claveturno);
    setMostrarFormulario(false);
    setTurnoEditar(undefined);
  };

  // Paso 2: el usuario elige Imprimir o WhatsApp → cerrar turno en BD
  const handleCerrarTurnoAction = async () => {
    if (!claveturnoCorte) throw new Error('Sin clave de turno');
    await cerrarTurno(claveturnoCorte);
    setTurnos((prev: Turno[]) =>
      prev.map((turno: Turno) =>
        turno.claveturno === claveturnoCorte
          ? { ...turno, estatusturno: EstatusTurno.CERRADO }
          : turno
      )
    );
    mostrarMensaje('success', 'Turno cerrado exitosamente');
  };

  const handleEditarTurno = (turno: Turno) => {
    if (turno.estatusturno === EstatusTurno.CERRADO) {
      mostrarMensaje('error', 'No se pueden editar turnos cerrados');
      return;
    }
    setTurnoEditar(turno);
    setMostrarFormulario(true);
  };

  const handleVerCorte = (turno: Turno) => {
    setClaveturnoCorte(turno.claveturno);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setTurnoEditar(undefined);
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
        <ListaTurnos
          turnos={turnos}
          onEdit={handleEditarTurno}
          onVerCorte={handleVerCorte}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && turnoEditar && (
        <CierreTurno
          turno={turnoEditar}
          onSubmit={handleCierreTurnoFormSubmit}
          onCancel={handleCancelar}
        />
      )}

      {/* Ticket de Fin de Turno */}
      {claveturnoCorte && (
        <TicketFinTurno
          claveturno={claveturnoCorte}
          efectivoContado={efectivoContadoCorte}
          onCerrarTurno={handleCerrarTurnoAction}
          onClose={() => { setClaveturnoCorte(null); setEfectivoContadoCorte(undefined); }}
        />
      )}
    </>
  );
};

export default ConfigTurnos;
