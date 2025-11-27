import React from 'react';
import { Edit2, Trash2, Tag, CheckCircle, XCircle, Image as ImageIcon, Users } from 'lucide-react';
import type { Categoria } from '../../../types/categoria.types';
import './ListaCategorias.css';

interface Props {
  categorias: Categoria[];
  onEditar: (categoria: Categoria) => void;
  onEliminar: (id: number) => void;
}

const ListaCategorias: React.FC<Props> = ({ categorias, onEditar, onEliminar }) => {
  const categoriasArray = Array.isArray(categorias) ? categorias : [];

  // Función para obtener el conteo de moderadores
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

  if (categoriasArray.length === 0) {
    return (
      <div className="lista-categorias-vacia">
        <Tag size={64} className="icono-vacio" />
        <h3>No hay categorías registradas</h3>
        <p>Crea tu primera categoría para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-categorias">
      {categoriasArray.map((categoria) => {
        const cantidadModeradores = obtenerCantidadModeradores(categoria.idmoderadordef);
        
        return (
          <div key={categoria.idCategoria} className="categoria-card">
            <div className="categoria-card-imagen">
              {categoria.imagencategoria ? (
                <img 
                  src={categoria.imagencategoria} 
                  alt={categoria.nombre}
                  className="categoria-img"
                />
              ) : (
                <div className="categoria-img-placeholder">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="categoria-orden-badge">
                #{categoria.orden}
              </div>
            </div>

            <div className="categoria-card-body">
              <div className="categoria-card-header">
                <Tag size={20} className="categoria-icon" />
                <h3>{categoria.nombre}</h3>
              </div>

              {categoria.descripcion && (
                <p className="categoria-descripcion">{categoria.descripcion}</p>
              )}

              <div className="categoria-info-grid">
                <div className="categoria-info-item">
                  {categoria.estatus === 1 ? (
                    <CheckCircle size={16} className="info-icon activo" />
                  ) : (
                    <XCircle size={16} className="info-icon inactivo" />
                  )}
                  <span className={`badge ${categoria.estatus === 1 ? 'activo' : 'inactivo'}`}>
                    {categoria.estatus === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="categoria-info-item">
                  <span className="info-label">Orden:</span>
                  <span className="info-value">{categoria.orden}</span>
                </div>
                
                {cantidadModeradores > 0 && (
                  <div className="categoria-info-item full-width">
                    <Users size={16} className="info-icon moderadores" />
                    <span className="badge moderadores">
                      {cantidadModeradores} moderador{cantidadModeradores > 1 ? 'es' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="categoria-card-footer">
              <button
                className="btn-editar"
                onClick={() => onEditar(categoria)}
                title="Editar categoría"
              >
                <Edit2 size={18} />
                Editar
              </button>
              <button
                className="btn-eliminar"
                onClick={() => onEliminar(categoria.idCategoria)}
                title="Eliminar categoría"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListaCategorias;
