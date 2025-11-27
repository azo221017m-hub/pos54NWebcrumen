import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Phone, Calendar, Building2, Shield, TrendingUp } from 'lucide-react';
import type { Usuario } from '../../../types/usuario.types';
import type { Negocio } from '../../../types/negocio.types';
import type { Rol } from '../../../types/rol.types';
import { negociosService } from '../../../services/negociosService';
import { rolesService } from '../../../services/rolesService';
import './ListaUsuarios.css';

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

  // Cargar negocios y roles para mostrar nombres
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

  // Función para obtener nombre del negocio
  const obtenerNombreNegocio = (idNegocio?: number): string => {
    if (!idNegocio) return 'N/A';
    const negocio = negocios.find(n => n.idNegocio === idNegocio);
    return negocio?.nombreNegocio || `ID: ${idNegocio}`;
  };

  // Función para obtener nombre del rol
  const obtenerNombreRol = (idRol?: number): string => {
    if (!idRol) return 'N/A';
    const rol = roles.find(r => r.idRol === idRol);
    return rol?.nombreRol || `ID: ${idRol}`;
  };

  if (loading) {
    return (
      <div className="lista-usuarios-loading">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="lista-usuarios-empty">
        <User size={64} strokeWidth={1} />
        <h3>No hay usuarios registrados</h3>
        <p>Comienza creando un nuevo usuario</p>
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
      <div className="usuarios-grid">
        {usuarios.map((usuario) => (
          <div key={usuario.idUsuario} className="usuario-card">
            {/* Header con Avatar y Estado */}
            <div className="usuario-card-header">
              <div className="usuario-avatar">
                {usuario.fotoavatar_size && usuario.fotoavatar_size > 0 && usuario.fotoavatar ? (
                  <img 
                    src={`data:image/jpeg;base64,${usuario.fotoavatar}`} 
                    alt={usuario.nombre}
                    onError={(e) => {
                      // Si falla la carga, mostrar icono por defecto
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('svg')) {
                        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        icon.setAttribute('width', '32');
                        icon.setAttribute('height', '32');
                        icon.setAttribute('viewBox', '0 0 24 24');
                        icon.setAttribute('fill', 'none');
                        icon.setAttribute('stroke', 'currentColor');
                        icon.setAttribute('stroke-width', '2');
                        icon.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className="usuario-header-info">
                <h3>{usuario.nombre}</h3>
                <span className="usuario-alias">@{usuario.alias}</span>
              </div>
              <span className={`usuario-badge ${usuario.estatus === 1 ? 'activo' : 'inactivo'}`}>
                {usuario.estatus === 1 ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Información de contacto */}
            {(usuario.telefono || usuario.cumple) && (
              <div className="usuario-contacto">
                {usuario.telefono && (
                  <div className="contacto-item">
                    <Phone size={16} />
                    <span>{usuario.telefono}</span>
                  </div>
                )}
                {usuario.cumple && (
                  <div className="contacto-item">
                    <Calendar size={16} />
                    <span>{formatFecha(usuario.cumple)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Frase personal */}
            {usuario.frasepersonal && (
              <div className="usuario-frase">
                <p>"{usuario.frasepersonal}"</p>
              </div>
            )}

            {/* Métricas */}
            <div className="usuario-metricas">
              <div className="metrica-item">
                <TrendingUp size={16} className="metrica-icon desempeno" />
                <div className="metrica-info">
                  <span className="metrica-label">Desempeño</span>
                  <span className="metrica-valor">{Number(usuario.desempeno || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="metrica-item">
                <User size={16} className="metrica-icon popularidad" />
                <div className="metrica-info">
                  <span className="metrica-label">Popularidad</span>
                  <span className="metrica-valor">{Number(usuario.popularidad || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Asignaciones */}
            <div className="usuario-asignaciones">
              <div className="asignacion-item">
                <Building2 size={14} />
                <span>Negocio: {obtenerNombreNegocio(usuario.idNegocio)}</span>
              </div>
              <div className="asignacion-item">
                <Shield size={14} />
                <span>Rol: {obtenerNombreRol(usuario.idRol)}</span>
              </div>
            </div>

            {/* Meta información */}
            <div className="usuario-meta">
              <span className="meta-item">ID: {usuario.idUsuario}</span>
              <span className="meta-item">Registro: {formatFecha(usuario.fechaRegistroauditoria)}</span>
            </div>

            {/* Acciones */}
            <div className="usuario-card-actions">
              <button
                className="btn-action btn-editar"
                onClick={() => onEditar(usuario)}
                title="Editar usuario"
              >
                <Edit size={18} />
                <span>Editar</span>
              </button>
              <button
                className="btn-action btn-eliminar"
                onClick={() => {
                  if (window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
                    onEliminar(usuario.idUsuario!);
                  }
                }}
                title="Eliminar usuario"
              >
                <Trash2 size={18} />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
