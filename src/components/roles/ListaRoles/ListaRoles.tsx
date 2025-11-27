import type { Rol } from '../../../types/rol.types';
import './ListaRoles.css';
import { Shield, Edit, Trash2, CheckCircle, XCircle, Award } from 'lucide-react';

interface ListaRolesProps {
  roles: Rol[];
  onEditar: (rol: Rol) => void;
  onEliminar: (id: number) => void;
  loading?: boolean;
}

// Función para obtener información del nivel de privilegio
const obtenerInfoNivel = (nivel: string) => {
  const nivelNum = parseInt(nivel) || 1;
  const niveles = [
    { valor: 1, label: 'Básico', color: '#94a3b8' },
    { valor: 2, label: 'Bajo', color: '#60a5fa' },
    { valor: 3, label: 'Medio', color: '#34d399' },
    { valor: 4, label: 'Alto', color: '#fbbf24' },
    { valor: 5, label: 'Total', color: '#f87171' },
  ];
  return niveles.find(n => n.valor === nivelNum) || niveles[0];
};

export const ListaRoles = ({ roles, onEditar, onEliminar, loading }: ListaRolesProps) => {
  console.log('🎨 ListaRoles - Props recibidas:', {
    rolesCount: roles.length,
    loading,
    roles: roles
  });

  if (loading) {
    return (
      <div className="lista-loading">
        <div className="spinner"></div>
        <p>Cargando roles...</p>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="lista-vacia">
        <Shield size={64} className="icono-vacio" />
        <h3>No hay roles registrados</h3>
        <p>Crea el primer rol de usuario para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-roles">
      {roles.map((rol) => {
        const infoNivel = obtenerInfoNivel(rol.privilegio);
        
        return (
          <div key={rol.idRol} className="rol-card">
            <div className="card-header">
              <div className="card-icon">
                <Shield size={32} />
              </div>
              <div className="card-badge">
                {rol.estatus === 1 ? (
                  <span className="badge-activo">
                    <CheckCircle size={14} />
                    Activo
                  </span>
                ) : (
                  <span className="badge-inactivo">
                    <XCircle size={14} />
                    Inactivo
                  </span>
                )}
              </div>
            </div>

            <div className="card-body">
              <h3 className="card-titulo">{rol.nombreRol}</h3>
              <p className="card-descripcion">{rol.descripcion}</p>

              <div className="card-info">
                <div className="info-item">
                  <Award size={14} />
                  <span className="info-label">Nivel de Privilegio:</span>
                </div>
                <div className="nivel-privilegio-badge" style={{ 
                  backgroundColor: `${infoNivel.color}20`,
                  borderColor: infoNivel.color,
                  color: infoNivel.color
                }}>
                  <span className="nivel-numero">{infoNivel.valor}</span>
                  <span className="nivel-label">{infoNivel.label}</span>
                </div>
              </div>

              <div className="card-meta">
                {rol.idRol && (
                  <span className="meta-item">ID Rol: <strong>{rol.idRol}</strong></span>
                )}
              </div>
            </div>

              <div className="card-footer">
              <button
                className="btn-accion btn-editar"
                onClick={() => {
                  console.log('✏️ Editando rol:', rol);
                  onEditar(rol);
                }}
                title="Editar rol"
              >
                <Edit size={14} />
                Editar
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => {
                  if (rol.idRol) {
                    console.log('🗑️ Eliminando rol:', rol);
                    onEliminar(rol.idRol);
                  }
                }}
                title="Eliminar rol"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
