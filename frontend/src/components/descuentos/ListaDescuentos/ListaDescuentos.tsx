import React from 'react';
import type { Descuento } from '../../../types/descuento.types';
import { RequiereAutorizacion } from '../../../types/descuento.types';
import { Percent, BadgePercent, Shield } from 'lucide-react';
import './ListaDescuentos.css';

interface ListaDescuentosProps {
  descuentos: Descuento[];
  onEdit: (descuento: Descuento) => void;
  onDelete: (id_descuento: number) => void;
}

const ListaDescuentos: React.FC<ListaDescuentosProps> = ({ descuentos, onEdit, onDelete }) => {
  // Debug: Verificar que los datos lleguen correctamente
  console.log('ListaDescuentos - Total descuentos:', descuentos.length, descuentos);

  if (descuentos.length === 0) {
    return (
      <div className="lista-vacia">
        <BadgePercent size={48} />
        <p>No hay descuentos registrados</p>
        <span>Crea el primer descuento para comenzar</span>
      </div>
    );
  }

  return (
    <div className="lista-descuentos">
      {descuentos.map((descuento) => (
        <div key={descuento.id_descuento} className="descuento-card">
          <div className="descuento-card-header">
            <div className="descuento-icon">
              <Percent size={24} />
            </div>
            <div className="descuento-header-info">
              <h3>{descuento.nombre}</h3>
              <span className="tipo-badge">{descuento.tipodescuento}</span>
            </div>
          </div>

          <div className="descuento-card-body">
            <div className="descuento-valor">
              <span className="valor-numero">{Number(descuento.valor).toFixed(2)}</span>
              <span className="valor-label">Valor</span>
            </div>

            <div className="descuento-info-grid">
              <div className="info-item">
                <span className="info-label">Estatus</span>
                <span className={`info-value estatus-${descuento.estatusdescuento.toLowerCase()}`}>
                  {descuento.estatusdescuento}
                </span>
              </div>

              <div className="info-item">
                <Shield size={16} />
                <div>
                  <span className="info-label">Autorización</span>
                  <span className={`info-value ${descuento.requiereautorizacion === RequiereAutorizacion.SI ? 'requiere-si' : 'requiere-no'}`}>
                    {descuento.requiereautorizacion === RequiereAutorizacion.SI ? 'Requerida' : 'No requerida'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="descuento-card-footer">
            <div className="descuento-meta">
              <span className="meta-label">Creado por:</span>
              <span className="meta-value">{descuento.UsuarioCreo}</span>
            </div>
            <div className="descuento-actions">
              <button onClick={() => onEdit(descuento)} className="btn-edit">
                Editar
              </button>
              <button onClick={() => onDelete(descuento.id_descuento)} className="btn-delete">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaDescuentos;
