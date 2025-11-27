import { api } from './api';
import type { Rol, RolResponse } from '../types/rol.types';

// ========== CRUD ROLES ==========

export const rolesService = {
  // Obtener todos los roles
  obtenerRoles: async (): Promise<Rol[]> => {
    try {
      console.log('📡 Llamando API: GET /roles');
      const response = await api.get<{ success: boolean; data: Rol[] }>('/roles');
      console.log('📡 Respuesta API:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error en obtenerRoles:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: unknown };
        console.error('📡 Respuesta de error:', axiosError.response);
      }
      throw error;
    }
  },

  // Obtener un rol por ID
  obtenerRolPorId: async (id: number): Promise<Rol> => {
    try {
      const response = await api.get<{ success: boolean; data: Rol }>(`/roles/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      throw error;
    }
  },

  // Crear un nuevo rol
  crearRol: async (data: Rol): Promise<RolResponse> => {
    try {
      console.log('📡 Creando rol:', data);
      console.log('📡 Datos a enviar:', JSON.stringify(data, null, 2));
      const response = await api.post<RolResponse>('/roles', data);
      console.log('✅ Rol creado:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error al crear rol:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: unknown;
            status?: number;
            statusText?: string;
          } 
        };
        console.error('📡 Respuesta de error completa:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
        const responseData = axiosError.response?.data as { message?: string } | undefined;
        if (responseData?.message) {
          throw new Error(responseData.message);
        }
      }
      throw new Error('Error al crear rol');
    }
  },

  // Actualizar un rol
  actualizarRol: async (id: number, data: Rol): Promise<RolResponse> => {
    try {
      console.log('📡 Actualizando rol:', { id, data });
      console.log('📡 URL completa:', `/roles/${id}`);
      console.log('📡 Datos a enviar:', JSON.stringify(data, null, 2));
      const response = await api.put<RolResponse>(`/roles/${id}`, data);
      console.log('✅ Rol actualizado:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error al actualizar rol:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: unknown;
            status?: number;
            statusText?: string;
          } 
        };
        console.error('📡 Respuesta de error completa:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
        console.error('📡 Data JSON:', JSON.stringify(axiosError.response?.data, null, 2));
        console.error('📡 Status code:', axiosError.response?.status);
        const responseData = axiosError.response?.data as { message?: string } | undefined;
        if (responseData?.message) {
          throw new Error(responseData.message);
        }
      }
      throw new Error('Error al actualizar rol');
    }
  },

  // Eliminar un rol (soft delete)
  eliminarRol: async (id: number): Promise<RolResponse> => {
    try {
      console.log('📡 Eliminando rol:', id);
      const response = await api.delete<RolResponse>(`/roles/${id}`);
      console.log('✅ Rol eliminado:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error al eliminar rol:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        console.error('📡 Respuesta de error:', axiosError.response);
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw new Error('Error al eliminar rol');
    }
  },

  // Activar/Desactivar rol
  cambiarEstatusRol: async (id: number, estatus: number): Promise<RolResponse> => {
    try {
      const response = await api.patch<RolResponse>(`/roles/${id}/estatus`, { estatus });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estatus:', error);
      throw error;
    }
  },

  // Validar nombre único
  validarNombreUnico: async (nombreRol: string, idRol?: number): Promise<boolean> => {
    try {
      const response = await api.post<{ success: boolean; disponible: boolean }>('/roles/validar-nombre', {
        nombreRol,
        idRol,
      });
      return response.data.disponible;
    } catch (error) {
      console.error('Error al validar nombre:', error);
      throw error;
    }
  },
};
