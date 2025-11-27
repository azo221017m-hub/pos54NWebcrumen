import axios from 'axios';
import type { Moderador, ModeradorCreate, ModeradorUpdate } from '../types/moderador.types';

const API_BASE = '/api/moderadores';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obtener todos los moderadores de un negocio
export const obtenerModeradores = async (idnegocio: number): Promise<Moderador[]> => {
  try {
    console.log('🔵 moderadoresService - Solicitando moderadores del negocio:', idnegocio);
    const response = await axios.get<Moderador[]>(`${API_BASE}/negocio/${idnegocio}`, getAuthHeaders());
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
    const response = await axios.get<Moderador>(`${API_BASE}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener moderador:', error);
    return null;
  }
};

// Crear nuevo moderador
export const crearModerador = async (moderador: ModeradorCreate): Promise<void> => {
  await axios.post(API_BASE, moderador, getAuthHeaders());
};

// Actualizar moderador
export const actualizarModerador = async (id: number, moderador: ModeradorUpdate): Promise<void> => {
  await axios.put(`${API_BASE}/${id}`, moderador, getAuthHeaders());
};

// Eliminar moderador
export const eliminarModerador = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
};
