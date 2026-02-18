import React, { useState, useEffect, useCallback } from 'react';
import { Plus, User, Edit, Trash2, Shield } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import { FormularioUsuario } from '../../components/usuarios/FormularioUsuario/FormularioUsuario';
import type { Usuario, UsuarioFormData } from '../../types/usuario.types';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  validarAliasUnico
} from '../../services/usuariosService';
import './ConfigUsuarios.css';

type Vista = 'lista' | 'formulario';

export const ConfigUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [vista, setVista] = useState<Vista>('lista');
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      
      // Log para depuración - verificar que se está solicitando usuarios
      const usuarioData = localStorage.getItem('usuario');
      const usuario = usuarioData ? JSON.parse(usuarioData) : null;
      console.log(`🔄 [FRONTEND] Cargando usuarios para idNegocio: ${usuario?.idNegocio} | Usuario: ${usuario?.nombre} (${usuario?.alias})`);
      
      const data = await obtenerUsuarios();
      setUsuarios(data);
      
      console.log(`✅ [FRONTEND] Usuarios cargados exitosamente: ${data.length} usuarios`);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      mostrarMensaje('error', 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleNuevoUsuario = () => {
    setUsuarioEditar(null);
    setVista('formulario');
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditar(usuario);
    setVista('formulario');
  };

  const handleEliminarUsuario = async (id: number) => {
    try {
      setLoading(true);
      const idEliminado = await eliminarUsuario(id);
      mostrarMensaje('success', 'Usuario eliminado correctamente');
      // Actualizar estado local sin recargar
      setUsuarios(prev => prev.filter(usuario => usuario.idUsuario !== idEliminado));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      mostrarMensaje('error', 'Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFormulario = async (data: UsuarioFormData) => {
    try {
      setLoading(true);

      // Validar alias único
      const aliasUnico = await validarAliasUnico(
        data.alias, 
        usuarioEditar?.idUsuario
      );

      if (!aliasUnico) {
        mostrarMensaje('error', 'El alias ya está en uso');
        setLoading(false);
        return;
      }

      if (usuarioEditar) {
        // Actualizar
        const usuarioActualizado = await actualizarUsuario(usuarioEditar.idUsuario!, data);
        mostrarMensaje('success', 'Usuario actualizado correctamente');
        // Actualizar estado local sin recargar
        setUsuarios(prev =>
          prev.map(usuario =>
            usuario.idUsuario === usuarioActualizado.idUsuario ? usuarioActualizado : usuario
          )
        );
      } else {
        // Crear
        const nuevoUsuario = await crearUsuario(data);
        mostrarMensaje('success', 'Usuario creado correctamente');
        // Actualizar estado local sin recargar
        setUsuarios(prev => [...prev, nuevoUsuario]);
      }

      setVista('lista');
      setUsuarioEditar(null);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      mostrarMensaje('error', 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarFormulario = () => {
    setVista('lista');
    setUsuarioEditar(null);
  };

  return (
    <>
      {/* Mensajes */}
      {mensaje && (
        <div className={`standard-notification ${mensaje.tipo}`}>
          <div className="notification-content">
            <p className="notification-message">{mensaje.texto}</p>
          </div>
          <button
            className="btn-close"
            onClick={() => setMensaje(null)}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {vista === 'lista' ? (
        <StandardPageLayout
          headerTitle="Configuración de Usuarios"
          headerSubtitle="Administra los usuarios del sistema"
          backButtonText="Regresa a DASHBOARD"
          backButtonPath="/dashboard"
          actionButton={{
            text: 'Nuevo Usuario',
            icon: <Plus size={20} />,
            onClick: handleNuevoUsuario
          }}
          loading={loading}
          loadingMessage="Cargando usuarios..."
          isEmpty={usuarios.length === 0}
          emptyIcon={<User size={80} />}
          emptyMessage="No hay usuarios registrados. Comienza agregando uno nuevo."
        >
          <div className="standard-cards-grid">
            {usuarios.map((usuario) => (
              <StandardCard
                key={usuario.idUsuario}
                title={usuario.nombre}
                fields={[
                  {
                    label: 'Alias',
                    value: (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} />
                        {usuario.alias}
                      </span>
                    )
                  },
                  {
                    label: 'Teléfono',
                    value: usuario.telefono || 'No especificado'
                  },
                  {
                    label: 'Cumpleaños',
                    value: usuario.cumple ? new Date(usuario.cumple).toLocaleDateString('es-MX') : 'No especificado'
                  },
                  {
                    label: 'Rol ID',
                    value: (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={14} />
                        {usuario.idRol || 'Sin rol'}
                      </span>
                    )
                  },
                  {
                    label: 'Desempeño',
                    value: `${usuario.desempeno || 0}%`
                  },
                  {
                    label: 'Estado',
                    value: (
                      <span style={{ 
                        color: usuario.estatus === 1 ? '#10b981' : '#ef4444',
                        fontWeight: 600
                      }}>
                        {usuario.estatus === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    )
                  }
                ]}
                actions={[
                  {
                    label: 'Editar',
                    icon: <Edit size={16} />,
                    onClick: () => handleEditarUsuario(usuario),
                    variant: 'edit'
                  },
                  {
                    label: 'Eliminar',
                    icon: <Trash2 size={16} />,
                    onClick: () => {
                      if (window.confirm(`¿Está seguro de eliminar al usuario "${usuario.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
                        handleEliminarUsuario(usuario.idUsuario!);
                      }
                    },
                    variant: 'delete'
                  }
                ]}
              />
            ))}
          </div>
        </StandardPageLayout>
      ) : (
        <div className="standard-page-container">
          <header className="standard-page-header">
            <div className="header-title-section">
              <User size={50} />
              <div>
                <h1 className="header-title">
                  {usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h1>
                <p className="header-subtitle">Complete el formulario</p>
              </div>
            </div>
          </header>
          <main className="standard-page-main">
            <div className="standard-page-content">
              <FormularioUsuario
                usuarioEditar={usuarioEditar}
                onSubmit={handleSubmitFormulario}
                onCancelar={handleCancelarFormulario}
                loading={loading}
              />
            </div>
          </main>
        </div>
      )}
    </>
  );
};
