import apiClient from './api';
import type { Anuncio, AnuncioCreate, AnuncioUpdate } from '../types/anuncio.types';

const API_BASE = '/anuncios';

// Obtener todos los anuncios
export const obtenerAnuncios = async (): Promise<Anuncio[]> => {
  try {
    const response = await apiClient.get<Anuncio[]>(API_BASE);
    return response.data;
  } catch (error) {
    console.error('anunciosService: Error al obtener anuncios:', error);
    return [];
  }
};

// Obtener anuncios vigentes (fechaDeVigencia >= hoy o sin fecha) — público, sin autenticación
export const obtenerAnunciosVigentes = async (): Promise<Anuncio[]> => {
  try {
    const response = await apiClient.get<Anuncio[]>(`${API_BASE}/vigentes`);
    return response.data;
  } catch (error) {
    console.error('anunciosService: Error al obtener anuncios vigentes:', error);
    return [];
  }
};

// Obtener un anuncio por ID
export const obtenerAnuncioPorId = async (id: number): Promise<Anuncio | null> => {
  try {
    const response = await apiClient.get<Anuncio>(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('anunciosService: Error al obtener anuncio:', error);
    return null;
  }
};

// Crear un nuevo anuncio
export const crearAnuncio = async (anuncio: AnuncioCreate): Promise<Anuncio> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: Anuncio; mensaje: string }>(
      API_BASE,
      anuncio
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.mensaje || 'Error al crear anuncio');
  } catch (error: any) {
    const errorMessage = error.response?.data?.mensaje || error.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
};

// Actualizar un anuncio
export const actualizarAnuncio = async (id: number, anuncio: AnuncioUpdate): Promise<Anuncio> => {
  try {
    const response = await apiClient.put<{ success: boolean; data: Anuncio; mensaje: string }>(
      `${API_BASE}/${id}`,
      anuncio
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.mensaje || 'Error al actualizar anuncio');
  } catch (error: any) {
    const errorMessage = error.response?.data?.mensaje || error.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
};

// Eliminar un anuncio
export const eliminarAnuncio = async (id: number): Promise<number> => {
  try {
    await apiClient.delete(`${API_BASE}/${id}`);
    return id;
  } catch (error: any) {
    const errorMessage = error.response?.data?.mensaje || error.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
};
