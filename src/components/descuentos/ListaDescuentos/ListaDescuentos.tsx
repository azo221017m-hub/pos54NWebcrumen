import React from 'react';
import type { Descuento } from '../../../types/descuento.types';
import { RequiereAutorizacion } from '../../../types/descuento.types';
import { BadgePercent, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import './ListaDescuentos.css';

interface ListaDescuentosProps {
  descuentos: Descuento[];
  onEdit: (descuento: Descuento) => void;
  onDelete: (id_descuento: number) => void;
}

const ListaDescuentos: React.FC<ListaDescuentosProps> = ({ descuentos, onEdit, onDelete }) => {
  const descuentosArray = Array.isArray(descuentos) ? descuentos : [];

  const getTipoClass = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'porcentaje': return 'badge-porcentaje';
      case 'efectivo': return 'badge-efectivo';
      default: return '';
    }
  };

  const formatValor = (descuento: Descuento) => {
    return descuento.tipodescuento === 'Porcentaje'
      ? `${Number(descuento.valor).toFixed(0)}%`
      : `$${Number(descuento.valor).toFixed(2)}`;
  };

  return (
    <div className="lista-descuentos-container">
      <div className="tabla-wrapper">
        <table className="tabla-descuentos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Autorización</th>
              <th>Estado</th>
              <th>Creado por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {descuentosArray.length === 0 ? (
              <tr>
                <td colSpan={8} className="sin-datos">
                  <BadgePercent size={32} className="icono-vacio-inline" />
                  No hay descuentos registrados
                </td>
              </tr>
            ) : (
              descuentosArray.map((descuento) => (
                <tr key={descuento.id_descuento}>
                  <td>{descuento.id_descuento}</td>
                  <td className="cell-nombre">{descuento.nombre}</td>
                  <td>
                    <span className={`badge ${getTipoClass(descuento.tipodescuento)}`}>
                      {descuento.tipodescuento}
                    </span>
                  </td>
                  <td className="cell-valor">{formatValor(descuento)}</td>
                  <td>
                    <span className={`badge ${descuento.requiereautorizacion === RequiereAutorizacion.SI ? 'badge-requiere-si' : 'badge-requiere-no'}`}>
                      {descuento.requiereautorizacion === RequiereAutorizacion.SI ? 'Requerida' : 'No requerida'}
                    </span>
                  </td>
                  <td>
                    {descuento.estatusdescuento === 'ACTIVO' ? (
                      <span className="badge badge-activo">
                        <CheckCircle size={13} /> Activo
                      </span>
                    ) : (
                      <span className="badge badge-inactivo">
                        <XCircle size={13} /> Inactivo
                      </span>
                    )}
                  </td>
                  <td>{descuento.UsuarioCreo || '-'}</td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEdit(descuento)}
                        title="Editar descuento"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onDelete(descuento.id_descuento)}
                        title="Eliminar descuento"
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

export default ListaDescuentos;
