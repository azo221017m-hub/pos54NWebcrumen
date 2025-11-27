import React from 'react';
import type { Mesa } from '../../../types/mesa.types';
import { EstatusMesa, EstatusTiempo } from '../../../types/mesa.types';
import { Users, Table2, Clock, AlertCircle } from 'lucide-react';
import './ListaMesas.css';

interface ListaMesasProps {
  mesas: Mesa[];
  onEdit: (mesa: Mesa) => void;
  onDelete: (idmesa: number) => void;
}

const ListaMesas: React.FC<ListaMesasProps> = ({ mesas, onEdit, onDelete }) => {
  // Debug: Verificar que los datos lleguen correctamente
  console.log('ListaMesas - Total mesas:', mesas.length, mesas);

  const getEstatusClass = (estatus: EstatusMesa): string => {
    switch (estatus) {
      case EstatusMesa.DISPONIBLE:
        return 'estatus-disponible';
      case EstatusMesa.OCUPADA:
        return 'estatus-ocupada';
      case EstatusMesa.RESERVADA:
        return 'estatus-reservada';
      default:
        return '';
    }
  };

  const getEstatusTiempoClass = (estatus: EstatusTiempo): string => {
    switch (estatus) {
      case EstatusTiempo.INACTIVA:
        return 'tiempo-inactiva';
      case EstatusTiempo.EN_CURSO:
        return 'tiempo-en-curso';
      case EstatusTiempo.DEMORA:
        return 'tiempo-demora';
      default:
        return '';
    }
  };

  const formatearEstatusTexto = (estatus: EstatusMesa): string => {
    const textos = {
      [EstatusMesa.DISPONIBLE]: 'Disponible',
      [EstatusMesa.OCUPADA]: 'Ocupada',
      [EstatusMesa.RESERVADA]: 'Reservada'
    };
    return textos[estatus] || estatus;
  };

  const formatearTiempoTexto = (estatus: EstatusTiempo): string => {
    const textos = {
      [EstatusTiempo.INACTIVA]: 'Inactiva',
      [EstatusTiempo.EN_CURSO]: 'En Curso',
      [EstatusTiempo.DEMORA]: 'Demora'
    };
    return textos[estatus] || estatus;
  };

  if (mesas.length === 0) {
    return (
      <div className="lista-vacia">
        <Table2 size={48} />
        <p>No hay mesas registradas</p>
        <span>Crea la primera mesa para comenzar</span>
      </div>
    );
  }

  return (
    <div className="lista-mesas">
      {mesas.map((mesa) => (
        <div key={mesa.idmesa} className="mesa-card">
          <div className="mesa-card-header">
            <div className="mesa-numero-badge">
              <Table2 size={20} />
              <span>Mesa #{mesa.numeromesa}</span>
            </div>
            <div className="mesa-badges">
              <span className={`badge-estatus ${getEstatusClass(mesa.estatusmesa)}`}>
                {formatearEstatusTexto(mesa.estatusmesa)}
              </span>
            </div>
          </div>

          <div className="mesa-card-body">
            <h3 className="mesa-nombre">{mesa.nombremesa}</h3>

            <div className="mesa-info-grid">
              <div className="info-item">
                <Users size={18} />
                <div>
                  <span className="info-label">Capacidad</span>
                  <span className="info-value">{mesa.cantcomensales} comensales</span>
                </div>
              </div>

              <div className="info-item">
                <Clock size={18} />
                <div>
                  <span className="info-label">Estado Tiempo</span>
                  <span className={`info-value ${getEstatusTiempoClass(mesa.estatustiempo)}`}>
                    {formatearTiempoTexto(mesa.estatustiempo)}
                  </span>
                </div>
              </div>

              {mesa.tiempoactual && (
                <div className="info-item">
                  <AlertCircle size={18} />
                  <div>
                    <span className="info-label">Tiempo Transcurrido</span>
                    <span className="info-value">{mesa.tiempoactual}</span>
                  </div>
                </div>
              )}
            </div>

            {mesa.tiempodeinicio && (
              <div className="mesa-tiempo-inicio">
                <Clock size={16} />
                <span>Inicio: {new Date(mesa.tiempodeinicio).toLocaleString('es-MX')}</span>
              </div>
            )}
          </div>

          <div className="mesa-card-footer">
            <div className="mesa-meta">
              <span className="meta-label">Creado por:</span>
              <span className="meta-value">{mesa.UsuarioCreo}</span>
            </div>
            <div className="mesa-actions">
              <button 
                onClick={() => onEdit(mesa)} 
                className="btn-edit"
                title="Editar mesa"
              >
                Editar
              </button>
              <button 
                onClick={() => onDelete(mesa.idmesa)} 
                className="btn-delete"
                title="Eliminar mesa"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaMesas;
