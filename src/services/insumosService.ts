import apiClient from './api';
import type { Insumo, InsumoCreate, InsumoUpdate } from '../types/insumo.types';

const API_BASE = '/insumos';

// Obtener todos los insumos de un negocio
export const obtenerInsumos = async (idnegocio: number): Promise<Insumo[]> => {
  try {
    console.log('🔵 insumosService - Solicitando insumos del negocio:', idnegocio);
    console.log('🔵 URL completa:', `${API_BASE}/negocio/${idnegocio}`);
    const response = await apiClient.get<Insumo[]>(`${API_BASE}/negocio/${idnegocio}`);
    console.log('✅ insumosService - Respuesta recibida:', response.data);
    
    // Validación: asegurarse de devolver siempre un array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Si la respuesta no es un array, devolver array vacío
    console.warn('⚠️ insumosService - La respuesta no es un array, devolviendo []');
    return [];
  } catch (error) {
    console.error('❌ insumosService - Error al obtener insumos:', error);
    return []; // Devolver array vacío en caso de error
  }
};

// Obtener insumos activos e inventariables de un negocio (activo=1, inventariable=1)
export const obtenerInsumosInventariables = async (idnegocio: number): Promise<Insumo[]> => {
  try {
    const response = await apiClient.get<Insumo[]>(`${API_BASE}/negocio/${idnegocio}/inventariables`);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('❌ insumosService - Error al obtener insumos inventariables:', error);
    return [];
  }
};

// Obtener un insumo por ID
export const obtenerInsumo = async (id_insumo: number): Promise<Insumo> => {
  const response = await apiClient.get<Insumo>(`${API_BASE}/${id_insumo}`);
  return response.data;
};

// Validar si existe un nombre de insumo
export const validarNombreInsumo = async (nombre: string, id_insumo?: number): Promise<boolean> => {
  const params = id_insumo ? `?id_insumo=${id_insumo}` : '';
  const response = await apiClient.get<{ existe: boolean }>(`${API_BASE}/validar-nombre/${encodeURIComponent(nombre)}${params}`);
  return response.data.existe;
};

// Crear un nuevo insumo
export const crearInsumo = async (insumo: InsumoCreate): Promise<Insumo> => {
  const response = await apiClient.post<Insumo>(API_BASE, insumo);
  return response.data;
};

// Actualizar un insumo
export const actualizarInsumo = async (id_insumo: number, insumo: InsumoUpdate): Promise<Insumo> => {
  const response = await apiClient.put<Insumo>(`${API_BASE}/${id_insumo}`, insumo);
  return response.data;
};

// Eliminar un insumo
export const eliminarInsumo = async (id_insumo: number): Promise<number> => {
  await apiClient.delete(`${API_BASE}/${id_insumo}`);
  return id_insumo;
};
