import React from 'react';
import type { GrupoMovimientos } from '../../../types/grupoMovimientos.types';
import { Edit2, Trash2, FileText, Tag } from 'lucide-react';
import './ListaGrupoMovimientos.css';

interface Props {
  grupos: GrupoMovimientos[];
  onEdit: (grupo: GrupoMovimientos) => void;
  onDelete: (id: number) => void;
}

const ListaGrupoMovimientos: React.FC<Props> = ({ grupos, onEdit, onDelete }) => {
  console.log('🟢 ListaGrupoMovimientos - Props recibido:', grupos, 'Es array:', Array.isArray(grupos));
  const gruposArray = Array.isArray(grupos) ? grupos : [];
  
  if (gruposArray.length === 0) {
    return (
      <div className="lista-grupos-vacia">
        <FileText size={64} className="icono-vacio" />
        <h3>No hay grupos de movimientos registrados</h3>
        <p>Comienza agregando un nuevo grupo de movimientos</p>
      </div>
    );
  }

  const getNaturalezaColor = (naturaleza: string) => {
    return naturaleza === 'COMPRA' ? 'naturaleza-compra' : 'naturaleza-gasto';
  };

  return (
    <div className="lista-grupos-movimientos">
      {gruposArray.map((grupo) => (
        <div key={grupo.id_cuentacontable} className="grupo-card">
          <div className="grupo-card-header">
            <div className="grupo-title-section">
              <h3 className="grupo-nombre">{grupo.nombrecuentacontable}</h3>
              <span className={`naturaleza-badge ${getNaturalezaColor(grupo.naturalezacuentacontable)}`}>
                <Tag size={14} />
                {grupo.naturalezacuentacontable}
              </span>
            </div>
            <div className="grupo-acciones">
              <button
                className="btn-accion btn-editar"
                onClick={() => onEdit(grupo)}
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => onDelete(grupo.id_cuentacontable)}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grupo-card-body">
            <div className="grupo-info-row">
              <span className="info-label">Tipo de Grupo:</span>
              <span className="info-value">{grupo.tipocuentacontable}</span>
            </div>

            {grupo.usuarioauditoria && (
              <div className="grupo-info-row">
                <span className="info-label">Usuario:</span>
                <span className="info-value usuario">{grupo.usuarioauditoria}</span>
              </div>
            )}
          </div>

          <div className="grupo-card-footer">
            {grupo.fechaRegistroauditoria && (
              <span className="fecha-registro">
                Registrado: {new Date(grupo.fechaRegistroauditoria).toLocaleDateString('es-MX')}
              </span>
            )}
            {grupo.fechamodificacionauditoria && (
              <span className="fecha-modificacion">
                Modificado: {new Date(grupo.fechamodificacionauditoria).toLocaleDateString('es-MX')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaGrupoMovimientos;
