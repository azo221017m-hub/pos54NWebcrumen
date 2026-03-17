import { api } from './api';
import type { Negocio, ParametrosNegocio, NegocioCompleto, NegocioResponse } from '../types/negocio.types';

// ========== CRUD NEGOCIOS ==========

export const negociosService = {
  // Obtener todos los negocios
  obtenerNegocios: async (): Promise<Negocio[]> => {
    try {
      console.log('📡 Llamando API: GET /negocios');
      const response = await api.get<{ success: boolean; data: Negocio[] }>('/negocios');
      console.log('📡 Respuesta API:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error en obtenerNegocios:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: unknown };
        console.error('📡 Respuesta de error:', axiosError.response);
      }
      throw error;
    }
  },

  // Obtener un negocio por ID
  obtenerNegocioPorId: async (id: number): Promise<NegocioCompleto> => {
    try {
      const response = await api.get<{ success: boolean; data: NegocioCompleto }>(`/negocios/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener negocio:', error);
      throw error;
    }
  },

  // Crear un nuevo negocio con sus parámetros
  crearNegocio: async (data: NegocioCompleto): Promise<Negocio> => {
    try {
      const response = await api.post<NegocioResponse>('/negocios', data);
      if (response.data.success && response.data.data) {
        return response.data.data as Negocio;
      }
      throw new Error('Respuesta inválida del servidor');
    } catch (error: unknown) {
      console.error('Error al crear negocio:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw error;
    }
  },

  // Actualizar un negocio y sus parámetros
  actualizarNegocio: async (id: number, data: NegocioCompleto): Promise<Negocio> => {
    try {
      const response = await api.put<NegocioResponse>(`/negocios/${id}`, data);
      if (response.data.success) {
        return (response.data.data as Negocio) ?? ({ ...data.negocio, idNegocio: id } as Negocio);
      }
      throw new Error(response.data.message || 'Respuesta inválida del servidor');
    } catch (error: unknown) {
      console.error('Error al actualizar negocio:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      throw error;
    }
  },

  // Eliminar un negocio (soft delete - cambiar estatus)
  eliminarNegocio: async (id: number): Promise<number> => {
    try {
      await api.delete(`/negocios/${id}`);
      return id;
    } catch (error) {
      console.error('Error al eliminar negocio:', error);
      throw error;
    }
  },

  // Activar/Desactivar negocio
  cambiarEstatusNegocio: async (id: number, estatus: number): Promise<NegocioResponse> => {
    try {
      const response = await api.patch<NegocioResponse>(`/negocios/${id}/estatus`, { estatus });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estatus:', error);
      throw error;
    }
  },

  // Validar nombre único
  validarNombreUnico: async (nombreNegocio: string, idNegocio?: number): Promise<boolean> => {
    try {
      const response = await api.post<{ success: boolean; disponible: boolean }>('/negocios/validar-nombre', {
        nombreNegocio,
        idNegocio,
      });
      return response.data.disponible;
    } catch (error) {
      console.error('Error al validar nombre:', error);
      throw error;
    }
  },

  // Subir logotipo
  subirLogotipo: async (idNegocio: number, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logotipo', file);

      const response = await api.post<{ success: boolean; data: { logotipo: string } }>(
        `/negocios/${idNegocio}/logotipo`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data.logotipo;
    } catch (error) {
      console.error('Error al subir logotipo:', error);
      throw error;
    }
  },

  // Obtener próximo número de negocio
  obtenerProximoNumeroNegocio: async (): Promise<{ proximoNumero: string; proximoId: number }> => {
    try {
      const response = await api.get<{ 
        success: boolean; 
        data: { proximoNumero: string; proximoId: number } 
      }>('/negocios/proximo-numero');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener próximo número:', error);
      throw error;
    }
  },
};

// ========== CRUD PARÁMETROS ==========

export const parametrosService = {
  // Obtener parámetros de un negocio
  obtenerParametros: async (idNegocio: number): Promise<ParametrosNegocio> => {
    try {
      const response = await api.get<{ success: boolean; data: ParametrosNegocio }>(`/parametros/${idNegocio}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener parámetros:', error);
      throw error;
    }
  },

  // Actualizar parámetros
  actualizarParametros: async (
    idNegocio: number,
    parametros: ParametrosNegocio
  ): Promise<NegocioResponse> => {
    try {
      const response = await api.put<NegocioResponse>(`/parametros/${idNegocio}`, parametros);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar parámetros:', error);
      throw error;
    }
  },
};
