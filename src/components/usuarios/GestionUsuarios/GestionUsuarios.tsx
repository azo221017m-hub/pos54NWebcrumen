import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import { ListaUsuarios } from '../ListaUsuarios/ListaUsuarios';
import { FormularioUsuario } from '../FormularioUsuario/FormularioUsuario';
import type { Usuario, UsuarioFormData } from '../../../types/usuario.types';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  validarAliasUnico
} from '../../../services/usuariosService';
import './GestionUsuarios.css';

type Vista = 'lista' | 'formulario';

export const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [vista, setVista] = useState<Vista>('lista');
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Contadores
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.estatus === 1).length;
  const usuariosInactivos = usuarios.filter(u => u.estatus === 0).length;

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
    <div className="gestion-usuarios-container">
      {/* Mensajes */}
      {mensaje && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {vista === 'lista' ? (
        <>
          {/* Header con contadores */}
          <div className="gestion-usuarios-header">
            <div className="header-info">
              <div className="header-title">
                <Users size={32} />
                <h2>Gestión de Usuarios</h2>
              </div>
              <div className="header-contadores">
                <div className="contador total">
                  <span className="contador-numero">{totalUsuarios}</span>
                  <span className="contador-label">Total</span>
                </div>
                <div className="contador activos">
                  <span className="contador-numero">{usuariosActivos}</span>
                  <span className="contador-label">Activos</span>
                </div>
                <div className="contador inactivos">
                  <span className="contador-numero">{usuariosInactivos}</span>
                  <span className="contador-label">Inactivos</span>
                </div>
              </div>
            </div>
            <button className="btn-nuevo-usuario" onClick={handleNuevoUsuario}>
              <Plus size={20} />
              Nuevo Usuario
            </button>
          </div>

          {/* Lista de usuarios */}
          <ListaUsuarios
            usuarios={usuarios}
            onEditar={handleEditarUsuario}
            onEliminar={handleEliminarUsuario}
            loading={loading}
          />
        </>
      ) : (
        <>
          {/* Header del formulario */}
          <div className="gestion-usuarios-header">
            <div className="header-info">
              <h2>{usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            </div>
          </div>

          {/* Formulario */}
          <FormularioUsuario
            usuarioEditar={usuarioEditar}
            onSubmit={handleSubmitFormulario}
            onCancelar={handleCancelarFormulario}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};
