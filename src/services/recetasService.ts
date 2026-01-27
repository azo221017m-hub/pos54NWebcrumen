import apiClient from './api';
import type { Receta, RecetaCreate, RecetaUpdate } from '../types/receta.types';

const API_BASE = '/recetas';

// Obtener todas las recetas por negocio
export const obtenerRecetas = async (idnegocio: number): Promise<Receta[]> => {
  try {
    console.log('🔵 recetasService: Obteniendo recetas para negocio:', idnegocio);
    const response = await apiClient.get<Receta[]>(`${API_BASE}/negocio/${idnegocio}`);
    console.log('🔵 recetasService: Recetas obtenidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('🔴 recetasService: Error al obtener recetas:', error);
    return [];
  }
};

// Obtener una receta por ID (con detalles)
export const obtenerRecetaPorId = async (id: number): Promise<Receta | null> => {
  try {
    console.log('🔵 recetasService: Obteniendo receta ID:', id);
    const response = await apiClient.get<Receta>(`${API_BASE}/${id}`);
    console.log('🔵 recetasService: Receta obtenida:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔴 recetasService: Error al obtener receta:', error);
    return null;
  }
};

// Crear nueva receta
export const crearReceta = async (receta: RecetaCreate): Promise<Receta> => {
  try {
    console.log('🔵 recetasService: Creando receta:', receta);
    const response = await apiClient.post<Receta>(API_BASE, receta);
    console.log('🔵 recetasService: Receta creada exitosamente');
    return response.data;
  } catch (error) {
    console.error('🔴 recetasService: Error al crear receta:', error);
    throw error;
  }
};

// Actualizar receta
export const actualizarReceta = async (id: number, receta: RecetaUpdate): Promise<Receta> => {
  try {
    console.log('🔵 recetasService: Actualizando receta ID:', id);
    const response = await apiClient.put<Receta>(`${API_BASE}/${id}`, receta);
    console.log('🔵 recetasService: Receta actualizada exitosamente');
    return response.data;
  } catch (error) {
    console.error('🔴 recetasService: Error al actualizar receta:', error);
    throw error;
  }
};

// Eliminar receta
export const eliminarReceta = async (id: number): Promise<number> => {
  try {
    console.log('🔵 recetasService: Eliminando receta ID:', id);
    await apiClient.delete(`${API_BASE}/${id}`);
    console.log('🔵 recetasService: Receta eliminada exitosamente');
    return id;
  } catch (error) {
    console.error('🔴 recetasService: Error al eliminar receta:', error);
    throw error;
  }
};
