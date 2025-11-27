import React from 'react';
import { Edit2, Trash2, Users, CheckCircle, XCircle, User } from 'lucide-react';
import type { CatModerador } from '../../../types/catModerador.types';
import './ListaCatModeradores.css';

interface Props {
  catModeradores: CatModerador[];
  onEditar: (catModerador: CatModerador) => void;
  onEliminar: (id: number) => void;
}

const ListaCatModeradores: React.FC<Props> = ({ catModeradores, onEditar, onEliminar }) => {
  const catModeradoresArray = Array.isArray(catModeradores) ? catModeradores : [];

  // Función para obtener el conteo de moderadores
  const obtenerCantidadModeradores = (moderadores: string): number => {
    if (!moderadores || moderadores === '' || moderadores === '0') {
      return 0;
    }
    
    if (moderadores.includes(',')) {
      return moderadores.split(',').filter(id => id.trim() !== '0' && id.trim() !== '').length;
    }
    
    return 1;
  };

  if (catModeradoresArray.length === 0) {
    return (
      <div className="lista-cat-moderadores-vacia">
        <Users size={64} className="icono-vacio" />
        <h3>No hay categorías moderador registradas</h3>
        <p>Crea tu primera categoría moderador para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-cat-moderadores">
      {catModeradoresArray.map((catModerador) => {
        const cantidadModeradores = obtenerCantidadModeradores(catModerador.moderadores);
        
        return (
          <div key={catModerador.idmodref} className="cat-moderador-card">
            <div className="cat-moderador-card-header">
              <div className="cat-moderador-icon-wrapper">
                <Users size={28} className="cat-moderador-icon" />
              </div>
              <div className="cat-moderador-info">
                <h3>{catModerador.nombremodref}</h3>
                <span className="cat-moderador-id">ID: {catModerador.idmodref}</span>
              </div>
            </div>

            <div className="cat-moderador-card-body">
              <div className="cat-moderador-details">
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <div className="detail-value">
                    {catModerador.estatus === 1 ? (
                      <CheckCircle size={16} className="status-icon activo" />
                    ) : (
                      <XCircle size={16} className="status-icon inactivo" />
                    )}
                    <span className={`badge ${catModerador.estatus === 1 ? 'activo' : 'inactivo'}`}>
                      {catModerador.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Usuario:</span>
                  <div className="detail-value">
                    <User size={16} className="detail-icon" />
                    <span>{catModerador.usuarioauditoria || 'N/A'}</span>
                  </div>
                </div>

                {cantidadModeradores > 0 && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Moderadores asignados:</span>
                    <div className="detail-value">
                      <Users size={16} className="detail-icon moderadores" />
                      <span className="badge moderadores">
                        {cantidadModeradores} moderador{cantidadModeradores > 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="cat-moderador-card-footer">
              <button
                className="btn-editar"
                onClick={() => onEditar(catModerador)}
                title="Editar categoría moderador"
              >
                <Edit2 size={18} />
                Editar
              </button>
              <button
                className="btn-eliminar"
                onClick={() => onEliminar(catModerador.idmodref)}
                title="Eliminar categoría moderador"
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

export default ListaCatModeradores;
