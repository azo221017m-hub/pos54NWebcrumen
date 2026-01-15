import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
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
      await eliminarUsuario(id);
      mostrarMensaje('success', 'Usuario eliminado correctamente');
      await cargarUsuarios();
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
        await actualizarUsuario(usuarioEditar.idUsuario!, data);
        mostrarMensaje('success', 'Usuario actualizado correctamente');
      } else {
        // Crear
        await crearUsuario(data);
        mostrarMensaje('success', 'Usuario creado correctamente');
      }

      await cargarUsuarios();
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
      {/* Header fijo */}
      <div className="config-usuarios-header">
        <button 
          className="btn-back" 
          onClick={() => navigate('/dashboard')}
          title="Volver al Dashboard"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1>Configuración de Usuarios</h1>
        {vista === 'lista' && (
          <button className="btn-nuevo-usuario" onClick={handleNuevoUsuario}>
            <Plus size={20} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Contenedor fijo sin scroll */}
      <div className="config-usuarios-content">
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
