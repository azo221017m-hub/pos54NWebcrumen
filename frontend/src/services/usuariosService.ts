import api from './api';
import type { Usuario, UsuarioFormData, UsuarioResponse } from '../types/usuario.types';

// Obtener todos los usuarios
export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  try {
    console.log('🔄 Obteniendo usuarios...');
    const response = await api.get<UsuarioResponse>('/usuarios');
    console.log('✅ Usuarios obtenidos:', response.data);
    
    if (response.data.success && Array.isArray(response.data.data)) {
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
export const crearUsuario = async (usuario: UsuarioFormData): Promise<number | null> => {
  try {
    console.log('🔄 Creando usuario...', usuario);
    const response = await api.post<UsuarioResponse>('/usuarios', usuario);
    console.log('✅ Usuario creado:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      const data = response.data.data as { idUsuario: number };
      return data.idUsuario;
    }
    return null;
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    throw error;
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (id: number, usuario: UsuarioFormData): Promise<boolean> => {
  try {
    console.log(`🔄 Actualizando usuario ${id}...`, usuario);
    const response = await api.put<UsuarioResponse>(`/usuarios/${id}`, usuario);
    console.log('✅ Usuario actualizado:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar un usuario (soft delete)
export const eliminarUsuario = async (id: number): Promise<boolean> => {
  try {
    console.log(`🔄 Eliminando usuario ${id}...`);
    const response = await api.delete<UsuarioResponse>(`/usuarios/${id}`);
    console.log('✅ Usuario eliminado:', response.data);
    return response.data.success;
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
