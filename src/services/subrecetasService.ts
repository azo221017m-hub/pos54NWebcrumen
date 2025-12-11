import apiClient from './api';
import type { Subreceta, SubrecetaCreate, SubrecetaUpdate } from '../types/subreceta.types';

const API_BASE = '/subrecetas';

// Obtener todas las subrecetas por negocio
export const obtenerSubrecetas = async (idnegocio: number): Promise<Subreceta[]> => {
  try {
    console.log('🔵 subrecetasService: Obteniendo subrecetas para negocio:', idnegocio);
    const response = await apiClient.get<Subreceta[]>(`${API_BASE}/negocio/${idnegocio}`);
    console.log('🔵 subrecetasService: Subrecetas obtenidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('🔴 subrecetasService: Error al obtener subrecetas:', error);
    return [];
  }
};

// Obtener una subreceta por ID (con detalles)
export const obtenerSubrecetaPorId = async (id: number): Promise<Subreceta | null> => {
  try {
    console.log('🔵 subrecetasService: Obteniendo subreceta ID:', id);
    const response = await apiClient.get<Subreceta>(`${API_BASE}/${id}`);
    console.log('🔵 subrecetasService: Subreceta obtenida:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔴 subrecetasService: Error al obtener subreceta:', error);
    return null;
  }
};

// Crear nueva subreceta
export const crearSubreceta = async (subreceta: SubrecetaCreate): Promise<{ success: boolean; idSubReceta?: number }> => {
  try {
    console.log('🔵 subrecetasService: Creando subreceta:', subreceta);
    const response = await apiClient.post(API_BASE, subreceta);
    console.log('✅ subrecetasService: Subreceta creada exitosamente');
    return { success: true, idSubReceta: response.data.idSubReceta };
  } catch (error: any) {
    console.error('❌ subrecetasService: Error al crear subreceta:', {
      message: error?.response?.data?.mensaje || error?.response?.data?.message || error?.message || 'Error desconocido',
      status: error?.response?.status,
      data: error?.response?.data
    });
    return { success: false };
  }
};

// Actualizar subreceta
export const actualizarSubreceta = async (id: number, subreceta: SubrecetaUpdate): Promise<boolean> => {
  try {
    console.log('🔵 subrecetasService: Actualizando subreceta ID:', id);
    await apiClient.put(`${API_BASE}/${id}`, subreceta);
    console.log('✅ subrecetasService: Subreceta actualizada exitosamente');
    return true;
  } catch (error: any) {
    console.error('❌ subrecetasService: Error al actualizar subreceta:', {
      message: error?.response?.data?.mensaje || error?.response?.data?.message || error?.message || 'Error desconocido',
      status: error?.response?.status,
      data: error?.response?.data
    });
    return false;
  }
};

// Eliminar subreceta
export const eliminarSubreceta = async (id: number): Promise<boolean> => {
  try {
    console.log('🔵 subrecetasService: Eliminando subreceta ID:', id);
    await apiClient.delete(`${API_BASE}/${id}`);
    console.log('🔵 subrecetasService: Subreceta eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 subrecetasService: Error al eliminar subreceta:', error);
    return false;
  }
};
