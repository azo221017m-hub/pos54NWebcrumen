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
export const crearGrupoMovimientos = async (grupo: GrupoMovimientosCreate): Promise<GrupoMovimientos> => {
  const response = await apiClient.post<GrupoMovimientos>(API_BASE, grupo);
  return response.data;
};

// Actualizar grupo de movimientos
export const actualizarGrupoMovimientos = async (id: number, grupo: GrupoMovimientosUpdate): Promise<GrupoMovimientos> => {
  const response = await apiClient.put<GrupoMovimientos>(`${API_BASE}/${id}`, grupo);
  return response.data;
};

// Eliminar grupo de movimientos
export const eliminarGrupoMovimientos = async (id: number): Promise<number> => {
  await apiClient.delete(`${API_BASE}/${id}`);
  return id;
};
