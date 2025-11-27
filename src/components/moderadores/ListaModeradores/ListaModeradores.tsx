import React from 'react';
import type { Moderador } from '../../../types/moderador.types';
import { Edit2, Trash2, UserCheck, Shield } from 'lucide-react';
import './ListaModeradores.css';

interface Props {
  moderadores: Moderador[];
  onEdit: (moderador: Moderador) => void;
  onDelete: (id: number) => void;
}

const ListaModeradores: React.FC<Props> = ({ moderadores, onEdit, onDelete }) => {
  console.log('🟢 ListaModeradores - Props recibido:', moderadores, 'Es array:', Array.isArray(moderadores));
  const moderadoresArray = Array.isArray(moderadores) ? moderadores : [];
  
  if (moderadoresArray.length === 0) {
    return (
      <div className="lista-moderadores-vacia">
        <Shield size={64} className="icono-vacio" />
        <h3>No hay moderadores registrados</h3>
        <p>Comienza agregando un nuevo moderador</p>
      </div>
    );
  }

  return (
    <div className="lista-moderadores">
      {moderadoresArray.map((moderador) => (
        <div key={moderador.idmoderador} className="moderador-card">
          <div className="moderador-card-header">
            <div className="moderador-title-section">
              <div className="moderador-icon">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="moderador-nombre">{moderador.nombremoderador}</h3>
                <span className={`estatus-badge ${moderador.estatus === 1 ? 'activo' : 'inactivo'}`}>
                  {moderador.estatus === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <div className="moderador-acciones">
              <button
                className="btn-accion btn-editar"
                onClick={() => onEdit(moderador)}
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => onDelete(moderador.idmoderador)}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="moderador-card-body">
            {moderador.usuarioauditoria && (
              <div className="moderador-info-row">
                <UserCheck size={16} className="info-icon" />
                <span className="info-label">Registrado por:</span>
                <span className="info-value usuario">{moderador.usuarioauditoria}</span>
              </div>
            )}
          </div>

          <div className="moderador-card-footer">
            {moderador.fechaRegistroauditoria && (
              <span className="fecha-registro">
                Registrado: {new Date(moderador.fechaRegistroauditoria).toLocaleDateString('es-MX')}
              </span>
            )}
            {moderador.fehamodificacionauditoria && (
              <span className="fecha-modificacion">
                Modificado: {new Date(moderador.fehamodificacionauditoria).toLocaleDateString('es-MX')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaModeradores;
