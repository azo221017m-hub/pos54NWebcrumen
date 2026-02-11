import apiClient from './api';
import type { Gasto, GastoCreate, GastoUpdate } from '../types/gastos.types';

const API_BASE = '/gastos';

interface GastoResponse {
  success: boolean;
  data: Gasto;
  message: string;
}

interface GastosListResponse {
  success: boolean;
  data: Gasto[];
  message: string;
}

// Obtener todos los gastos
export const obtenerGastos = async (): Promise<Gasto[]> => {
  try {
    const response = await apiClient.get<GastosListResponse>(API_BASE);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    throw error;
  }
};

// Obtener un gasto por ID
export const obtenerGastoPorId = async (id: number): Promise<Gasto> => {
  try {
    const response = await apiClient.get<GastoResponse>(`${API_BASE}/${id}`);
    if (!response.data.data) {
      throw new Error('No se encontró el gasto');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener gasto:', error);
    throw error;
  }
};

// Crear un nuevo gasto
export const crearGasto = async (gasto: GastoCreate): Promise<Gasto> => {
  try {
    const response = await apiClient.post<GastoResponse>(API_BASE, gasto);
    if (!response.data.data) {
      throw new Error('No se pudo crear el gasto');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al crear gasto:', error);
    throw error;
  }
};

// Actualizar un gasto existente
export const actualizarGasto = async (id: number, gasto: GastoUpdate): Promise<Gasto> => {
  try {
    const response = await apiClient.put<GastoResponse>(`${API_BASE}/${id}`, gasto);
    if (!response.data.data) {
      throw new Error('No se pudo actualizar el gasto');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    throw error;
  }
};

// Eliminar un gasto
export const eliminarGasto = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_BASE}/${id}`);
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    throw error;
  }
};
