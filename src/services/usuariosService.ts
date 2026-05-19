import api from './api';
import type { Usuario, UsuarioFormData, UsuarioResponse } from '../types/usuario.types';
import { registrarLog } from './logService';

// Obtener todos los usuarios
export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  try {
    // Obtener datos del usuario actual para logging (con manejo de errores)
    let usuario = null;
    try {
      const usuarioData = localStorage.getItem('usuario');
      usuario = usuarioData ? JSON.parse(usuarioData) : null;
    } catch (parseError) {
      console.error('Error al parsear datos de usuario:', parseError);
    }
    
    console.log('🔄 Obteniendo usuarios...');
    if (usuario) {
      console.log(`📋 [USUARIOS FRONTEND] Solicitando usuarios para idNegocio: ${usuario?.idNegocio} | Usuario: ${usuario?.nombre} (${usuario?.alias})`);
    }
    
    const response = await api.get<UsuarioResponse>('/usuarios');
    console.log('✅ Usuarios obtenidos:', response.data);
    
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`✅ [USUARIOS FRONTEND] Recibidos ${response.data.data.length} usuarios`);
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    throw error;
  }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = async (id: number): Promise<Usuario | null> => {
  try {
    console.log(`🔄 Obteniendo usuario ${id}...`);
    const response = await api.get<UsuarioResponse>(`/usuarios/${id}`);
    console.log('✅ Usuario obtenido:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data as Usuario;
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    throw error;
  }
};

// Crear un nuevo usuario
export const crearUsuario = async (usuario: UsuarioFormData): Promise<Usuario> => {
  try {
    console.log('🔄 Creando usuario...', usuario);
    const response = await api.post<UsuarioResponse>('/usuarios', usuario);
    console.log('✅ Usuario creado:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      // Retornar el usuario completo creado
      const result = response.data.data as Usuario;
      registrarLog('Configuración Negocio', 'Usuarios', 'CREATE', { tabla_afectada: 'tblposcrumenwebusuarios', idregistro: result.idUsuario });
      return result;
    }
    throw new Error('Error al crear usuario: respuesta inválida');
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    throw error;
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (id: number, usuario: UsuarioFormData): Promise<Usuario> => {
  try {
    console.log(`🔄 Actualizando usuario ${id}...`, usuario);
    const response = await api.put<UsuarioResponse>(`/usuarios/${id}`, usuario);
    console.log('✅ Usuario actualizado:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      registrarLog('Configuración Negocio', 'Usuarios', 'UPDATE', { tabla_afectada: 'tblposcrumenwebusuarios', idregistro: id });
      return response.data.data as Usuario;
    }
    throw new Error('Error al actualizar usuario: respuesta inválida');
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar un usuario (soft delete)
export const eliminarUsuario = async (id: number): Promise<number> => {
  try {
    console.log(`🔄 Eliminando usuario ${id}...`);
    const response = await api.delete<UsuarioResponse>(`/usuarios/${id}`);
    console.log('✅ Usuario eliminado:', response.data);
    if (response.data.success) {
      registrarLog('Configuración Negocio', 'Usuarios', 'DELETE', { tabla_afectada: 'tblposcrumenwebusuarios', idregistro: id });
      return id;
    }
    throw new Error('Error al eliminar usuario');
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    throw error;
  }
};

// Cambiar estatus de un usuario
export const cambiarEstatusUsuario = async (id: number, estatus: number): Promise<boolean> => {
  try {
    console.log(`🔄 Cambiando estatus del usuario ${id} a ${estatus}...`);
    const response = await api.patch<UsuarioResponse>(`/usuarios/${id}/estatus`, { estatus });
    console.log('✅ Estatus cambiado:', response.data);
    if (response.data.success) {
      registrarLog('Configuración Negocio', 'Usuarios', 'UPDATE', { tabla_afectada: 'tblposcrumenwebusuarios', idregistro: id });
    }
    return response.data.success;
  } catch (error) {
    console.error('❌ Error al cambiar estatus:', error);
    throw error;
  }
};

// Validar si un alias es único
export const validarAliasUnico = async (alias: string, idUsuario?: number): Promise<boolean> => {
  try {
    console.log(`🔄 Validando alias único: ${alias}...`);
    const response = await api.post<UsuarioResponse>('/usuarios/validar-alias', {
      alias,
      idUsuario
    });
    console.log('✅ Validación de alias:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      const data = response.data.data as { esUnico: boolean };
      return data.esUnico;
    }
    return false;
  } catch (error) {
    console.error('❌ Error al validar alias:', error);
    throw error;
  }
};

// Actualizar imagen de usuario
export const actualizarImagenUsuario = async (
  id: number, 
  tipoImagen: 'fotoine' | 'fotopersona' | 'fotoavatar', 
  imagen: Blob | string
): Promise<boolean> => {
  try {
    console.log(`🔄 Actualizando ${tipoImagen} del usuario ${id}...`);
    const response = await api.patch<UsuarioResponse>(`/usuarios/${id}/imagen`, {
      tipoImagen,
      imagen
    });
    console.log('✅ Imagen actualizada:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('❌ Error al actualizar imagen:', error);
    throw error;
  }
};

export default {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstatusUsuario,
  validarAliasUnico,
  actualizarImagenUsuario
};
