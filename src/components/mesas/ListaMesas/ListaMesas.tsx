import React from 'react';
import type { Mesa } from '../../../types/mesa.types';
import { EstatusMesa, EstatusTiempo } from '../../../types/mesa.types';
import { Users, Table2, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';
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

  const mesasArray = Array.isArray(mesas) ? mesas : [];

  if (mesasArray.length === 0) {
    return (
      <div className="lista-mesas-vacia">
        <Table2 size={64} className="icono-vacio" />
        <h3>No hay mesas registradas</h3>
        <p>Crea tu primera mesa para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-mesas">
      {mesasArray.map((mesa) => (
        <div key={mesa.idmesa} className="mesa-card">
          <div className="mesa-card-header">
            <div className="mesa-icon-wrapper">
              <Table2 size={24} className="mesa-icon" />
            </div>
            <div className="mesa-info">
              <h3>{mesa.nombremesa}</h3>
              <span className="mesa-numero">Mesa #{mesa.numeromesa}</span>
            </div>
            <div className="mesa-badges">
              <span className={`badge badge-estatus ${getEstatusClass(mesa.estatusmesa)}`}>
                {formatearEstatusTexto(mesa.estatusmesa)}
              </span>
            </div>
          </div>

          <div className="mesa-card-body">
            <div className="mesa-stats">
              <div className="stat-item capacidad">
                <Users size={18} />
                <div className="stat-info">
                  <span className="stat-label">Capacidad</span>
                  <span className="stat-value">{mesa.cantcomensales} comensales</span>
                </div>
              </div>

              <div className="stat-item tiempo">
                <Clock size={18} />
                <div className="stat-info">
                  <span className="stat-label">Estado Tiempo</span>
                  <span className={`stat-value ${getEstatusTiempoClass(mesa.estatustiempo)}`}>
                    {formatearTiempoTexto(mesa.estatustiempo)}
                  </span>
                </div>
              </div>
            </div>

            {mesa.tiempoactual && (
              <div className="mesa-tiempo-actual">
                <AlertCircle size={16} />
                <span>Tiempo transcurrido: {mesa.tiempoactual}</span>
              </div>
            )}

            <div className="mesa-meta">
              <span className="meta-label">Creado por:</span>
              <span className="meta-value">{mesa.UsuarioCreo || 'Sistema'}</span>
            </div>
          </div>

          <div className="mesa-card-footer">
            <button
              className="btn-editar"
              onClick={() => onEdit(mesa)}
              title="Editar mesa"
            >
              <Edit2 size={18} />
              Editar
            </button>
            <button
              className="btn-eliminar"
              onClick={() => onDelete(mesa.idmesa)}
              title="Eliminar mesa"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaMesas;
