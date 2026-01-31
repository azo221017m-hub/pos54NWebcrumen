import React from 'react';
import type { Turno } from '../../../types/turno.types';
import { EstatusTurno } from '../../../types/turno.types';
import { Clock, Calendar, User, Building2, Edit2, CheckCircle, XCircle, DollarSign, Target } from 'lucide-react';
import './ListaTurnos.css';

interface ListaTurnosProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
}

const ListaTurnos: React.FC<ListaTurnosProps> = ({ turnos, onEdit }) => {
  const getEstatusClass = (estatus: EstatusTurno): string => {
    switch (estatus) {
      case EstatusTurno.ABIERTO:
        return 'estatus-abierto';
      case EstatusTurno.CERRADO:
        return 'estatus-cerrado';
      default:
        return '';
    }
  };

  const formatearEstatusTexto = (estatus: EstatusTurno): string => {
    const textos = {
      [EstatusTurno.ABIERTO]: 'Abierto',
      [EstatusTurno.CERRADO]: 'Cerrado'
    };
    return textos[estatus] || estatus;
  };

  const formatearFecha = (fecha: string | null): string => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  const calcularPorcentajeMeta = (totalventas: number | string | undefined, metaturno: number | null | undefined): string => {
    if (!metaturno || metaturno <= 0) return '0%';
    const totalVentasNum = Number(totalventas) || 0;
    const porcentaje = (totalVentasNum / metaturno * 100).toFixed(1);
    return `${porcentaje}%`;
  };

  const turnosArray = Array.isArray(turnos) ? turnos : [];

  if (turnosArray.length === 0) {
    return (
      <div className="lista-turnos-vacia">
        <Clock size={64} className="icono-vacio" />
        <h3>No hay turnos registrados</h3>
        <p>Inicia tu primer turno para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-turnos">
      {turnosArray.map((turno) => (
        <div key={turno.idturno} className="turno-card">
          <div className="turno-card-header">
            <div className="turno-icon-wrapper">
              <Clock size={24} className="turno-icon" />
            </div>
            <div className="turno-info">
              <h3>Turno #{turno.numeroturno}</h3>
              <span className="turno-clave">{turno.claveturno}</span>
            </div>
            <div className="turno-badges">
              <span className={`badge badge-estatus ${getEstatusClass(turno.estatusturno)}`}>
                {turno.estatusturno === EstatusTurno.ABIERTO ? (
                  <CheckCircle size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                {formatearEstatusTexto(turno.estatusturno)}
              </span>
            </div>
          </div>

          <div className="turno-card-body">
            <div className="turno-stats">
              <div className="stat-item usuario">
                <User size={18} />
                <div className="stat-info">
                  <span className="stat-label">Usuario</span>
                  <span className="stat-value">{turno.usuarioturno}</span>
                </div>
              </div>

              <div className="stat-item negocio">
                <Building2 size={18} />
                <div className="stat-info">
                  <span className="stat-label">Negocio</span>
                  <span className="stat-value">ID: {turno.idnegocio}</span>
                </div>
              </div>

              <div className="stat-item fecha">
                <Calendar size={18} />
                <div className="stat-info">
                  <span className="stat-label">Inicio</span>
                  <span className="stat-value">{formatearFecha(turno.fechainicioturno)}</span>
                </div>
              </div>

              {turno.fechafinturno && (
                <div className="stat-item fecha">
                  <Calendar size={18} />
                  <div className="stat-info">
                    <span className="stat-label">Fin</span>
                    <span className="stat-value">{formatearFecha(turno.fechafinturno)}</span>
                  </div>
                </div>
              )}

              <div className="stat-item duracion">
                <Clock size={18} />
                <div className="stat-info">
                  <span className="stat-label">Duración</span>
                  <span className="stat-value">{calcularDuracion(turno.fechainicioturno, turno.fechafinturno)}</span>
                </div>
              </div>

              <div className="stat-item detalle">
                <DollarSign size={18} />
                <div className="stat-info">
                  <span className="stat-label">Detalle</span>
                  <div className="stat-value-detalle">
                    <span className="detalle-line">Ventas: ${(Number(turno.totalventas) || 0).toFixed(2)}</span>
                    <span className="detalle-line">Meta: ${(turno.metaturno || 0).toFixed(2)}</span>
                    <span className="detalle-line">
                      <Target size={12} style={{ display: 'inline', marginRight: '2px' }} />
                      {calcularPorcentajeMeta(turno.totalventas, turno.metaturno)} alcanzado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="turno-card-footer">
            <button
              onClick={() => onEdit(turno)}
              className="btn-editar"
              disabled={turno.estatusturno === EstatusTurno.CERRADO}
              title={turno.estatusturno === EstatusTurno.CERRADO ? "No se pueden editar turnos cerrados" : "Cerrar turno"}
            >
              <Edit2 size={16} />
              Cerrar Turno
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaTurnos;
