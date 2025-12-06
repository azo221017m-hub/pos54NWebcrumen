import React from 'react';
import type { Descuento } from '../../../types/descuento.types';
import { RequiereAutorizacion } from '../../../types/descuento.types';
import { Percent, BadgePercent, Shield, Edit2, Trash2, CheckCircle, XCircle, DollarSign } from 'lucide-react';
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
      case 'porcentaje': return 'tipo-porcentaje';
      case 'efectivo': return 'tipo-efectivo';
      default: return '';
    }
  };

  if (descuentosArray.length === 0) {
    return (
      <div className="lista-descuentos-vacia">
        <BadgePercent size={64} className="icono-vacio" />
        <h3>No hay descuentos registrados</h3>
        <p>Crea tu primer descuento para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-descuentos">
      {descuentosArray.map((descuento) => (
        <div key={descuento.id_descuento} className="descuento-card">
          <div className="descuento-card-header">
            <div className="descuento-icon-wrapper">
              <Percent size={24} className="descuento-icon" />
            </div>
            <div className="descuento-info">
              <h3>{descuento.nombre}</h3>
              <span className="descuento-id">ID: {descuento.id_descuento}</span>
            </div>
            <div className="descuento-badges">
              <span className={`badge badge-tipo ${getTipoClass(descuento.tipodescuento)}`}>
                {descuento.tipodescuento === 'Porcentaje' ? '%' : '$'} {descuento.tipodescuento}
              </span>
              {descuento.estatusdescuento === 'ACTIVO' ? (
                <span className="badge badge-activo">
                  <CheckCircle size={14} />
                  Activo
                </span>
              ) : (
                <span className="badge badge-inactivo">
                  <XCircle size={14} />
                  Inactivo
                </span>
              )}
            </div>
          </div>

          <div className="descuento-card-body">
            <div className="descuento-stats">
              <div className="stat-item valor">
                <DollarSign size={18} />
                <div className="stat-info">
                  <span className="stat-label">Valor</span>
                  <span className="stat-value">
                    {descuento.tipodescuento === 'Porcentaje' 
                      ? `${Number(descuento.valor).toFixed(0)}%`
                      : `$${Number(descuento.valor).toFixed(2)}`
                    }
                  </span>
                </div>
              </div>

              <div className="stat-item autorizacion">
                <Shield size={18} />
                <div className="stat-info">
                  <span className="stat-label">Autorización</span>
                  <span className={`stat-value ${descuento.requiereautorizacion === RequiereAutorizacion.SI ? 'requiere-si' : 'requiere-no'}`}>
                    {descuento.requiereautorizacion === RequiereAutorizacion.SI ? 'Requerida' : 'No requerida'}
                  </span>
                </div>
              </div>
            </div>

            <div className="descuento-meta">
              <span className="meta-label">Creado por:</span>
              <span className="meta-value">{descuento.UsuarioCreo || 'Sistema'}</span>
            </div>
          </div>

          <div className="descuento-card-footer">
            <button
              className="btn-editar"
              onClick={() => onEdit(descuento)}
              title="Editar descuento"
            >
              <Edit2 size={18} />
              Editar
            </button>
            <button
              className="btn-eliminar"
              onClick={() => onDelete(descuento.id_descuento)}
              title="Eliminar descuento"
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

export default ListaDescuentos;
