import React from 'react';
import type { Mesa } from '../../../types/mesa.types';
import { EstatusMesa, EstatusTiempo } from '../../../types/mesa.types';
import { Table2, Edit2, Trash2 } from 'lucide-react';
import './ListaMesas.css';

interface ListaMesasProps {
  mesas: Mesa[];
  onEdit: (mesa: Mesa) => void;
  onDelete: (idmesa: number) => void;
}

const ListaMesas: React.FC<ListaMesasProps> = ({ mesas, onEdit, onDelete }) => {
  console.log('ListaMesas - Total mesas:', mesas.length, mesas);

  const getEstatusClass = (estatus: EstatusMesa): string => {
    switch (estatus) {
      case EstatusMesa.DISPONIBLE: return 'badge-disponible';
      case EstatusMesa.OCUPADA: return 'badge-ocupada';
      case EstatusMesa.RESERVADA: return 'badge-reservada';
      default: return '';
    }
  };

  const getTiempoClass = (estatus: EstatusTiempo): string => {
    switch (estatus) {
      case EstatusTiempo.INACTIVA: return 'badge-inactiva';
      case EstatusTiempo.EN_CURSO: return 'badge-en-curso';
      case EstatusTiempo.DEMORA: return 'badge-demora';
      default: return '';
    }
  };

  const formatEstatusMesa = (estatus: EstatusMesa): string => {
    const textos: Record<string, string> = {
      [EstatusMesa.DISPONIBLE]: 'Disponible',
      [EstatusMesa.OCUPADA]: 'Ocupada',
      [EstatusMesa.RESERVADA]: 'Reservada'
    };
    return textos[estatus] || estatus;
  };

  const formatEstatusTiempo = (estatus: EstatusTiempo): string => {
    const textos: Record<string, string> = {
      [EstatusTiempo.INACTIVA]: 'Inactiva',
      [EstatusTiempo.EN_CURSO]: 'En Curso',
      [EstatusTiempo.DEMORA]: 'Demora'
    };
    return textos[estatus] || estatus;
  };

  const mesasArray = Array.isArray(mesas) ? mesas : [];

  return (
    <div className="lista-mesas-container">
      <div className="tabla-wrapper">
        <table className="tabla-mesas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>#</th>
              <th>Capacidad</th>
              <th>Estado Mesa</th>
              <th>Estado Tiempo</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mesasArray.length === 0 ? (
              <tr>
                <td colSpan={8} className="sin-datos">
                  <Table2 size={32} className="icono-vacio-inline" />
                  No hay mesas registradas
                </td>
              </tr>
            ) : (
              mesasArray.map((mesa) => (
                <tr key={mesa.idmesa}>
                  <td>{mesa.idmesa}</td>
                  <td className="cell-nombre">{mesa.nombremesa}</td>
                  <td>{mesa.numeromesa}</td>
                  <td>{mesa.cantcomensales}</td>
                  <td>
                    <span className={`badge ${getEstatusClass(mesa.estatusmesa)}`}>
                      {formatEstatusMesa(mesa.estatusmesa)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getTiempoClass(mesa.estatustiempo)}`}>
                      {formatEstatusTiempo(mesa.estatustiempo)}
                    </span>
                  </td>
                  <td>{mesa.UsuarioCreo || '-'}</td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEdit(mesa)}
                        title="Editar mesa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onDelete(mesa.idmesa)}
                        title="Eliminar mesa"
                      >
                        <Trash2 size={16} />
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

export default ListaMesas;
