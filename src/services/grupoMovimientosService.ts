import apiClient from './api';
import type { GrupoMovimientos, GrupoMovimientosCreate, GrupoMovimientosUpdate } from '../types/grupoMovimientos.types';

const API_BASE = '/cuentas-contables';

// Obtener todos los grupos de movimientos de un negocio
export const obtenerGrupoMovimientos = async (): Promise<GrupoMovimientos[]> => {
  try {
    console.log('🔵 grupoMovimientosService - Solicitando grupos de movimientos del negocio autenticado');
    const response = await apiClient.get<GrupoMovimientos[]>(API_BASE);
    console.log('✅ grupoMovimientosService - Respuesta recibida:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('⚠️ grupoMovimientosService - La respuesta no es un array, devolviendo []');
    return [];
  } catch (error) {
    console.error('❌ grupoMovimientosService - Error al obtener grupos de movimientos:', error);
    return [];
  }
};

// Obtener un grupo de movimientos por ID
export const obtenerGrupoMovimiento = async (id: number): Promise<GrupoMovimientos | null> => {
  try {
    const response = await apiClient.get<GrupoMovimientos>(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener grupo de movimientos:', error);
    return null;
  }
};

// Crear nuevo grupo de movimientos
export const crearGrupoMovimientos = async (grupo: GrupoMovimientosCreate): Promise<void> => {
  await apiClient.post(API_BASE, grupo);
};

// Actualizar grupo de movimientos
export const actualizarGrupoMovimientos = async (id: number, grupo: GrupoMovimientosUpdate): Promise<void> => {
  await apiClient.put(`${API_BASE}/${id}`, grupo);
};

// Eliminar grupo de movimientos
export const eliminarGrupoMovimientos = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_BASE}/${id}`);
};
