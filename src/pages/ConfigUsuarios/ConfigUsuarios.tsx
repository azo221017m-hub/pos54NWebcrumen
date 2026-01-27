import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, User } from 'lucide-react';
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

type Vista = 'lista' | 'formulario';

export const ConfigUsuarios: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="config-usuarios-page">
      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje-notificacion mensaje-${mensaje.tipo}`}>
          <div className="mensaje-contenido">
            <span className="mensaje-texto">{mensaje.texto}</span>
            <button
              className="mensaje-cerrar"
              onClick={() => setMensaje(null)}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header con botones */}
      <div className="config-header">
        <button 
          className="btn-volver" 
          onClick={() => navigate('/dashboard')}
          title="Volver al Dashboard"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        
        <div className="config-header-content">
          <div className="config-title">
            <User size={32} className="config-icon" />
            <div>
              <h1>Configuración de Usuarios</h1>
              <p>Administra los usuarios del sistema</p>
            </div>
          </div>
          {vista === 'lista' && (
            <button className="btn-nuevo" onClick={handleNuevoUsuario}>
              <Plus size={20} />
              Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      {/* Contenedor fijo sin scroll */}
      <div className="config-container">
        {vista === 'lista' ? (
          <ListaUsuarios
            usuarios={usuarios}
            onEditar={handleEditarUsuario}
            onEliminar={handleEliminarUsuario}
            loading={loading}
          />
        ) : (
          <FormularioUsuario
            usuarioEditar={usuarioEditar}
            onSubmit={handleSubmitFormulario}
            onCancelar={handleCancelarFormulario}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
