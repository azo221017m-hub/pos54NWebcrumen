import React from 'react';
import type { GrupoMovimientos } from '../../../types/grupoMovimientos.types';
import { Edit2, Trash2, FileText } from 'lucide-react';
import './ListaGrupoMovimientos.css';

interface Props {
  grupos: GrupoMovimientos[];
  onEdit: (grupo: GrupoMovimientos) => void;
  onDelete: (id: number) => void;
}

const ListaGrupoMovimientos: React.FC<Props> = ({ grupos, onEdit, onDelete }) => {
  console.log('🟢 ListaGrupoMovimientos - Props recibido:', grupos, 'Es array:', Array.isArray(grupos));
  const gruposArray = Array.isArray(grupos) ? grupos : [];

  const getNaturalezaClass = (naturaleza: string) => {
    return naturaleza === 'COMPRA' ? 'badge-compra' : 'badge-gasto';
  };

  return (
    <div className="lista-grupos-movimientos-container">
      <div className="tabla-wrapper">
        <table className="tabla-grupos-movimientos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Naturaleza</th>
              <th>Usuario</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gruposArray.length === 0 ? (
              <tr>
                <td colSpan={7} className="sin-datos">
                  <FileText size={32} className="icono-vacio-inline" />
                  No hay grupos de movimientos registrados
                </td>
              </tr>
            ) : (
              gruposArray.map((grupo) => (
                <tr key={grupo.id_cuentacontable}>
                  <td>{grupo.id_cuentacontable}</td>
                  <td className="cell-nombre">{grupo.nombrecuentacontable}</td>
                  <td>{grupo.tipocuentacontable}</td>
                  <td>
                    <span className={`badge-naturaleza ${getNaturalezaClass(grupo.naturalezacuentacontable)}`}>
                      {grupo.naturalezacuentacontable}
                    </span>
                  </td>
                  <td>{grupo.usuarioauditoria || '-'}</td>
                  <td>
                    {grupo.fechaRegistroauditoria
                      ? new Date(grupo.fechaRegistroauditoria).toLocaleDateString('es-MX')
                      : '-'}
                  </td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEdit(grupo)}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onDelete(grupo.id_cuentacontable)}
                        title="Eliminar"
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

export default ListaGrupoMovimientos;
