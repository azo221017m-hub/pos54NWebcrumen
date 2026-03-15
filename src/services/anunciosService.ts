import apiClient from './api';
import type { Anuncio, AnuncioCreate, AnuncioUpdate } from '../types/anuncio.types';

const API_BASE = '/anuncios';

interface AnuncioResponse {
  success: boolean;
  data: Anuncio;
  message: string;
}

interface AnunciosListResponse {
  success: boolean;
  data: Anuncio[];
  message: string;
}

// Obtener todos los anuncios
export const obtenerAnuncios = async (): Promise<Anuncio[]> => {
  try {
    const response = await apiClient.get<AnunciosListResponse>(API_BASE);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    throw error;
  }
};

// Obtener un anuncio por ID
export const obtenerAnuncioPorId = async (id: number): Promise<Anuncio> => {
  try {
    const response = await apiClient.get<AnuncioResponse>(`${API_BASE}/${id}`);
    if (!response.data.data) {
      throw new Error('No se encontró el anuncio');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    throw error;
  }
};

// Crear un nuevo anuncio
export const crearAnuncio = async (anuncio: AnuncioCreate): Promise<Anuncio> => {
  try {
    const response = await apiClient.post<AnuncioResponse>(API_BASE, anuncio);
    if (!response.data.data) {
      throw new Error('No se pudo crear el anuncio');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    throw error;
  }
};

// Actualizar un anuncio existente
export const actualizarAnuncio = async (id: number, anuncio: AnuncioUpdate): Promise<Anuncio> => {
  try {
    const response = await apiClient.put<AnuncioResponse>(`${API_BASE}/${id}`, anuncio);
    if (!response.data.data) {
      throw new Error('No se pudo actualizar el anuncio');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    throw error;
  }
};

// Eliminar un anuncio
export const eliminarAnuncio = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_BASE}/${id}`);
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    throw error;
  }
};
