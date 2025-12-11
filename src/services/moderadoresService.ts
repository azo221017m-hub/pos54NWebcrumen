import apiClient from './api';
import type { Moderador, ModeradorCreate, ModeradorUpdate } from '../types/moderador.types';

const API_BASE = '/moderadores';

// Obtener todos los moderadores de un negocio
export const obtenerModeradores = async (idnegocio: number): Promise<Moderador[]> => {
  try {
    console.log('🔵 moderadoresService - Solicitando moderadores del negocio:', idnegocio);
    const response = await apiClient.get<Moderador[]>(`${API_BASE}/negocio/${idnegocio}`);
    console.log('✅ moderadoresService - Respuesta recibida:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('⚠️ moderadoresService - La respuesta no es un array, devolviendo []');
    return [];
  } catch (error) {
    console.error('❌ moderadoresService - Error al obtener moderadores:', error);
    return [];
  }
};

// Obtener un moderador por ID
export const obtenerModerador = async (id: number): Promise<Moderador | null> => {
  try {
    const response = await apiClient.get<Moderador>(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener moderador:', error);
    return null;
  }
};

// Crear nuevo moderador
export const crearModerador = async (moderador: ModeradorCreate): Promise<void> => {
  try {
    await apiClient.post(API_BASE, moderador);
  } catch (error: any) {
    console.error('❌ moderadoresService - Error al crear moderador:', {
      message: error?.response?.data?.message || error?.message || 'Error desconocido',
      status: error?.response?.status,
      data: error?.response?.data
    });
    throw error;
  }
};

// Actualizar moderador
export const actualizarModerador = async (id: number, moderador: ModeradorUpdate): Promise<void> => {
  try {
    await apiClient.put(`${API_BASE}/${id}`, moderador);
  } catch (error: any) {
    console.error('❌ moderadoresService - Error al actualizar moderador:', {
      message: error?.response?.data?.message || error?.message || 'Error desconocido',
      status: error?.response?.status,
      data: error?.response?.data
    });
    throw error;
  }
};

// Eliminar moderador
export const eliminarModerador = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_BASE}/${id}`);
};
