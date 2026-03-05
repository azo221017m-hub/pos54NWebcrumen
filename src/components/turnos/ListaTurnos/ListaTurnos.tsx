import React from 'react';
import type { Turno } from '../../../types/turno.types';
import { EstatusTurno } from '../../../types/turno.types';
import { Clock, Edit2, CheckCircle, XCircle } from 'lucide-react';
import './ListaTurnos.css';

interface ListaTurnosProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
}

const ListaTurnos: React.FC<ListaTurnosProps> = ({ turnos, onEdit }) => {
  const getEstatusClass = (estatus: EstatusTurno): string => {
    switch (estatus) {
      case EstatusTurno.ABIERTO: return 'badge-abierto';
      case EstatusTurno.CERRADO: return 'badge-cerrado';
      default: return '';
    }
  };

  const formatearFecha = (fecha: string | null): string => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularDuracion = (fechaInicio: string, fechaFin: string | null): string => {
    if (!fechaFin) return 'En curso';
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = fin.getTime() - inicio.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calcularPorcentajeMeta = (totalventas: number | string | undefined, metaturno: number | string | null | undefined): string => {
    const metaTurnoNum = Number(metaturno) || 0;
    if (metaTurnoNum <= 0) return '0%';
    const totalVentasNum = Number(totalventas) || 0;
    return `${(totalVentasNum / metaTurnoNum * 100).toFixed(1)}%`;
  };

  const turnosArray = Array.isArray(turnos) ? turnos : [];

  return (
    <div className="lista-turnos-container">
      <div className="tabla-wrapper">
        <table className="tabla-turnos">
          <thead>
            <tr>
              <th>#</th>
              <th>Clave</th>
              <th>Usuario</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Duración</th>
              <th>Ventas</th>
              <th>Meta</th>
              <th>% Meta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnosArray.length === 0 ? (
              <tr>
                <td colSpan={11} className="sin-datos">
                  <Clock size={32} className="icono-vacio-inline" />
                  No hay turnos registrados
                </td>
              </tr>
            ) : (
              turnosArray.map((turno) => (
                <tr key={turno.idturno}>
                  <td>{turno.numeroturno}</td>
                  <td className="cell-nombre">{turno.claveturno}</td>
                  <td>{turno.usuarioturno}</td>
                  <td className="cell-fecha">{formatearFecha(turno.fechainicioturno)}</td>
                  <td className="cell-fecha">{formatearFecha(turno.fechafinturno)}</td>
                  <td>{calcularDuracion(turno.fechainicioturno, turno.fechafinturno)}</td>
                  <td className="cell-monto">${(Number(turno.totalventas) || 0).toFixed(2)}</td>
                  <td className="cell-monto">${(Number(turno.metaturno) || 0).toFixed(2)}</td>
                  <td>{calcularPorcentajeMeta(turno.totalventas, turno.metaturno)}</td>
                  <td>
                    <span className={`badge ${getEstatusClass(turno.estatusturno)}`}>
                      {turno.estatusturno === EstatusTurno.ABIERTO ? (
                        <CheckCircle size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      {turno.estatusturno === EstatusTurno.ABIERTO ? 'Abierto' : 'Cerrado'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEdit(turno)}
                        disabled={turno.estatusturno === EstatusTurno.CERRADO}
                        title={turno.estatusturno === EstatusTurno.CERRADO ? 'No se pueden editar turnos cerrados' : 'Cerrar turno'}
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaTurnos;
