import type { Rol } from '../../../types/rol.types';
import './ListaRoles.css';
import { Shield, Edit, CheckCircle, XCircle } from 'lucide-react';

interface ListaRolesProps {
  roles: Rol[];
  onEditar: (rol: Rol) => void;
  loading?: boolean;
}

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

export const ListaRoles = ({ roles, onEditar, loading }: ListaRolesProps) => {
  if (loading) {
    return (
      <div className="lista-loading">
        <div className="spinner"></div>
        <p>Cargando roles...</p>
      </div>
    );
  }

  return (
    <div className="lista-roles-container">
      <div className="tabla-wrapper">
        <table className="tabla-roles">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Nivel de Privilegio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={6} className="sin-datos">
                  <Shield size={32} className="icono-vacio-inline" />
                  No hay roles registrados
                </td>
              </tr>
            ) : (
              roles.map((rol) => {
                const infoNivel = obtenerInfoNivel(rol.privilegio);
                return (
                  <tr key={rol.idRol}>
                    <td>{rol.idRol}</td>
                    <td className="cell-nombre">{rol.nombreRol}</td>
                    <td>{rol.descripcion || '-'}</td>
                    <td>
                      <span
                        className="nivel-badge"
                        style={{
                          backgroundColor: `${infoNivel.color}20`,
                          borderColor: infoNivel.color,
                          color: infoNivel.color
                        }}
                      >
                        {infoNivel.valor} - {infoNivel.label}
                      </span>
                    </td>
                    <td>
                      {rol.estatus === 1 ? (
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
                          onClick={() => onEditar(rol)}
                          title="Editar rol"
                        >
                          <Edit size={16} />
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
