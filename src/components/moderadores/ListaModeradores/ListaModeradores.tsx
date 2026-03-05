import React from 'react';
import type { Moderador } from '../../../types/moderador.types';
import { Edit2, Trash2, Shield } from 'lucide-react';
import './ListaModeradores.css';

interface Props {
  moderadores: Moderador[];
  onEdit: (moderador: Moderador) => void;
  onDelete: (id: number) => void;
}

const ListaModeradores: React.FC<Props> = ({ moderadores, onEdit, onDelete }) => {
  console.log('🟢 ListaModeradores - Props recibido:', moderadores, 'Es array:', Array.isArray(moderadores));
  const moderadoresArray = Array.isArray(moderadores) ? moderadores : [];

  return (
    <div className="lista-moderadores-container">
      <div className="tabla-wrapper">
        <table className="tabla-moderadores">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {moderadoresArray.length === 0 ? (
              <tr>
                <td colSpan={6} className="sin-datos">
                  <Shield size={32} className="icono-vacio-inline" />
                  No hay moderadores registrados
                </td>
              </tr>
            ) : (
              moderadoresArray.map((moderador) => (
                <tr key={moderador.idmoderador}>
                  <td>{moderador.idmoderador}</td>
                  <td className="cell-nombre">{moderador.nombremoderador}</td>
                  <td>
                    <span className={`badge ${moderador.estatus === 1 ? 'badge-activo' : 'badge-inactivo'}`}>
                      {moderador.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{moderador.usuarioauditoria || '-'}</td>
                  <td>
                    {moderador.fechaRegistroauditoria
                      ? new Date(moderador.fechaRegistroauditoria).toLocaleDateString('es-MX')
                      : '-'}
                  </td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEdit(moderador)}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => onDelete(moderador.idmoderador)}
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

export default ListaModeradores;
