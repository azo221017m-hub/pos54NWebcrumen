import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { Usuario } from '../../../types/usuario.types';
import type { Negocio } from '../../../types/negocio.types';
import type { Rol } from '../../../types/rol.types';
import { negociosService } from '../../../services/negociosService';
import { rolesService } from '../../../services/rolesService';
import './ListaUsuarios.css';

// Avatar image with fallback icon on error
const AvatarImg: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (error) return <User size={20} />;
  return <img src={src} alt={alt} onError={() => setError(true)} />;
};

interface ListaUsuariosProps {
  usuarios: Usuario[];
  onEditar: (usuario: Usuario) => void;
  onEliminar: (id: number) => void;
  loading?: boolean;
}

export const ListaUsuarios: React.FC<ListaUsuariosProps> = ({
  usuarios,
  onEditar,
  onEliminar,
  loading = false
}) => {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [negociosData, rolesData] = await Promise.all([
          negociosService.obtenerNegocios(),
          rolesService.obtenerRoles()
        ]);
        setNegocios(negociosData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  const obtenerNombreNegocio = (idNegocio?: number): string => {
    if (!idNegocio) return 'N/A';
    const negocio = negocios.find(n => n.idNegocio === idNegocio);
    return negocio?.nombreNegocio || `ID: ${idNegocio}`;
  };

  const obtenerNombreRol = (idRol?: number): string => {
    if (!idRol) return 'N/A';
    const rol = roles.find(r => r.idRol === idRol);
    return rol?.nombreRol || `ID: ${idRol}`;
  };

  if (loading) {
    return (
      <div className="lista-loading">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="lista-usuarios-container">
      <div className="tabla-wrapper">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Nombre</th>
              <th>Alias</th>
              <th>Teléfono</th>
              <th>Negocio</th>
              <th>Rol</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={9} className="sin-datos">
                  <User size={32} className="icono-vacio-inline" />
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.idUsuario}>
                  <td>
                    <div className="usuario-avatar-thumb">
                      {usuario.fotoavatar_size && usuario.fotoavatar_size > 0 && usuario.fotoavatar ? (
                        <AvatarImg src={`data:image/jpeg;base64,${usuario.fotoavatar}`} alt={usuario.nombre} />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                  </td>
                  <td className="cell-nombre">{usuario.nombre}</td>
                  <td className="cell-alias">@{usuario.alias}</td>
                  <td>{usuario.telefono || '-'}</td>
                  <td>{obtenerNombreNegocio(usuario.idNegocio)}</td>
                  <td>{obtenerNombreRol(usuario.idRol)}</td>
                  <td>{formatFecha(usuario.fechaRegistroauditoria)}</td>
                  <td>
                    {usuario.estatus === 1 ? (
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
                        onClick={() => onEditar(usuario)}
                        title="Editar usuario"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => {
                          if (window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
                            onEliminar(usuario.idUsuario!);
                          }
                        }}
                        title="Eliminar usuario"
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
