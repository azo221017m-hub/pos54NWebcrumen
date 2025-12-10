import apiClient from './api';
import type { CatModerador, CatModeradorCreate, CatModeradorUpdate } from '../types/catModerador.types';

// Obtener todas las categorías moderador por negocio
export const obtenerCatModeradores = async (): Promise<CatModerador[]> => {
  try {
    const response = await apiClient.get(`/cat-moderadores`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías moderador:', error);
    throw error;
  }
};

// Obtener una categoría moderador por ID
export const obtenerCatModeradorPorId = async (id: number): Promise<CatModerador> => {
  try {
    const response = await apiClient.get(`/cat-moderadores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener categoría moderador:', error);
    throw error;
  }
};

// Crear nueva categoría moderador
export const crearCatModerador = async (catModerador: CatModeradorCreate): Promise<{ mensaje: string; idmodref: number }> => {
  try {
    const response = await apiClient.post(`/cat-moderadores`, catModerador);
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría moderador:', error);
    throw error;
  }
};

// Actualizar categoría moderador
export const actualizarCatModerador = async (catModerador: CatModeradorUpdate): Promise<{ mensaje: string }> => {
  try {
    const response = await apiClient.put(`/cat-moderadores/${catModerador.idmodref}`, catModerador);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar categoría moderador:', error);
    throw error;
  }
};

// Eliminar categoría moderador
export const eliminarCatModerador = async (id: number): Promise<{ mensaje: string }> => {
  try {
    const response = await apiClient.delete(`/cat-moderadores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar categoría moderador:', error);
    throw error;
  }
};
