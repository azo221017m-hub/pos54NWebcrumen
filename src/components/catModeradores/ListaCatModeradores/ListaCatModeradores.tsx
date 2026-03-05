import React from 'react';
import { Edit2, Trash2, Users } from 'lucide-react';
import type { CatModerador } from '../../../types/catModerador.types';
import './ListaCatModeradores.css';

interface Props {
  catModeradores: CatModerador[];
  onEditar: (catModerador: CatModerador) => void;
  onEliminar: (id: number) => void;
}

const ListaCatModeradores: React.FC<Props> = ({ catModeradores, onEditar, onEliminar }) => {
  const catModeradoresArray = Array.isArray(catModeradores) ? catModeradores : [];

  const obtenerCantidadModeradores = (moderadores: string): number => {
    if (!moderadores || moderadores === '' || moderadores === '0') {
      return 0;
    }
    if (moderadores.includes(',')) {
      return moderadores.split(',').filter(id => id.trim() !== '0' && id.trim() !== '').length;
    }
    return 1;
  };

  return (
    <div className="lista-cat-moderadores-container">
      <div className="tabla-wrapper">
        <table className="tabla-cat-moderadores">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Moderadores</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {catModeradoresArray.length === 0 ? (
              <tr>
                <td colSpan={6} className="sin-datos">
                  <Users size={32} className="icono-vacio-inline" />
                  No hay categorías moderador registradas
                </td>
              </tr>
            ) : (
              catModeradoresArray.map((catModerador) => {
                const cantidadModeradores = obtenerCantidadModeradores(catModerador.moderadores);
                return (
                  <tr key={catModerador.idmodref}>
                    <td>{catModerador.idmodref}</td>
                    <td className="cell-nombre">{catModerador.nombremodref}</td>
                    <td>
                      <span className={`badge ${catModerador.estatus === 1 ? 'badge-activo' : 'badge-inactivo'}`}>
                        {catModerador.estatus === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      {cantidadModeradores > 0 ? (
                        <span className="badge badge-moderadores">
                          {cantidadModeradores} moderador{cantidadModeradores > 1 ? 'es' : ''}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{catModerador.usuarioauditoria || '-'}</td>
                    <td>
                      <div className="acciones-btns">
                        <button
                          className="btn-accion btn-editar"
                          onClick={() => onEditar(catModerador)}
                          title="Editar categoría moderador"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => onEliminar(catModerador.idmodref)}
                          title="Eliminar categoría moderador"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaCatModeradores;
