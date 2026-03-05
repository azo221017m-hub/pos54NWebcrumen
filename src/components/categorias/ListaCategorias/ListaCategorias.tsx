import React from 'react';
import { Edit2, Trash2, Tag, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import type { Categoria } from '../../../types/categoria.types';
import './ListaCategorias.css';

interface Props {
  categorias: Categoria[];
  onEditar: (categoria: Categoria) => void;
  onEliminar: (id: number) => void;
}

const ListaCategorias: React.FC<Props> = ({ categorias, onEditar, onEliminar }) => {
  const categoriasArray = Array.isArray(categorias) ? categorias : [];

  const obtenerCantidadModeradores = (idmoderadordef: number | string): number => {
    if (!idmoderadordef || idmoderadordef === 0 || idmoderadordef === '0') {
      return 0;
    }
    const idsString = idmoderadordef.toString();
    if (idsString.includes(',')) {
      return idsString.split(',').filter(id => id.trim() !== '0' && id.trim() !== '').length;
    }
    return 1;
  };

  return (
    <div className="lista-categorias-container">
      <div className="tabla-wrapper">
        <table className="tabla-categorias">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Orden</th>
              <th>Moderadores</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasArray.length === 0 ? (
              <tr>
                <td colSpan={7} className="sin-datos">
                  <Tag size={32} className="icono-vacio-inline" />
                  No hay categorías registradas
                </td>
              </tr>
            ) : (
              categoriasArray.map((categoria) => {
                const cantidadModeradores = obtenerCantidadModeradores(categoria.idmoderadordef);
                return (
                  <tr key={categoria.idCategoria}>
                    <td>
                      {categoria.imagencategoria ? (
                        <img
                          src={categoria.imagencategoria}
                          alt={categoria.nombre}
                          className="categoria-img-thumb"
                        />
                      ) : (
                        <div className="categoria-img-placeholder-sm">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="cell-nombre">{categoria.nombre}</td>
                    <td className="cell-descripcion">{categoria.descripcion || '-'}</td>
                    <td>{categoria.orden}</td>
                    <td>
                      {cantidadModeradores > 0 ? (
                        <span className="badge badge-moderadores">
                          {cantidadModeradores} mod{cantidadModeradores > 1 ? 's' : ''}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {categoria.estatus === 1 ? (
                        <span className="badge badge-activo">
                          <CheckCircle size={13} /> Activo
                        </span>
                      ) : (
                        <span className="badge badge-inactivo">
                          <XCircle size={13} /> Inactivo
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="acciones-btns">
                        <button
                          className="btn-accion btn-editar"
                          onClick={() => onEditar(categoria)}
                          title="Editar categoría"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => onEliminar(categoria.idCategoria)}
                          title="Eliminar categoría"
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

export default ListaCategorias;
