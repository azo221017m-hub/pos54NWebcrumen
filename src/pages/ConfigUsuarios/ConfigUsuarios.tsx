import React, { useState, useEffect, useCallback } from 'react';
import { Plus, User } from 'lucide-react';
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import { ListaUsuarios } from '../../components/usuarios/ListaUsuarios/ListaUsuarios';
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

export const ConfigUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const privilegio = Number(localStorage.getItem('privilegio') || '0');

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
    setMostrarFormulario(true);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditar(usuario);
    setMostrarFormulario(true);
  };

  const handleEliminarUsuario = async (id: number) => {
    if (privilegio < 5) {
      mostrarMensaje('error', 'No tiene privilegios suficientes para eliminar registros');
      return;
    }
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

      setMostrarFormulario(false);
      setUsuarioEditar(null);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      mostrarMensaje('error', 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
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
        <ListaUsuarios
          usuarios={usuarios}
          onEditar={handleEditarUsuario}
          onEliminar={handleEliminarUsuario}
          loading={loading}
        />
      </StandardPageLayout>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <div className="usuario-formulario-overlay">
          <div className="usuario-formulario-modal">
            <FormularioUsuario
              usuarioEditar={usuarioEditar}
              onSubmit={handleSubmitFormulario}
              onCancelar={handleCancelarFormulario}
              loading={loading}
            />
          </div>
        </div>
      )}
    </>
  );
};
