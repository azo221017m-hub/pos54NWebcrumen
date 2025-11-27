import axios from 'axios';
import type { Insumo, InsumoCreate, InsumoUpdate } from '../types/insumo.types';

const API_BASE = '/api/insumos';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obtener todos los insumos de un negocio
export const obtenerInsumos = async (idnegocio: number): Promise<Insumo[]> => {
  try {
    console.log('🔵 insumosService - Solicitando insumos del negocio:', idnegocio);
    console.log('🔵 URL completa:', `${API_BASE}/negocio/${idnegocio}`);
    const response = await axios.get<Insumo[]>(`${API_BASE}/negocio/${idnegocio}`, getAuthHeaders());
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

// Obtener un insumo por ID
export const obtenerInsumo = async (id_insumo: number): Promise<Insumo> => {
  const response = await axios.get<Insumo>(`${API_BASE}/${id_insumo}`, getAuthHeaders());
  return response.data;
};

// Crear un nuevo insumo
export const crearInsumo = async (insumo: InsumoCreate): Promise<void> => {
  await axios.post(API_BASE, insumo, getAuthHeaders());
};

// Actualizar un insumo
export const actualizarInsumo = async (id_insumo: number, insumo: InsumoUpdate): Promise<void> => {
  await axios.put(`${API_BASE}/${id_insumo}`, insumo, getAuthHeaders());
};

// Eliminar un insumo
export const eliminarInsumo = async (id_insumo: number): Promise<void> => {
  await axios.delete(`${API_BASE}/${id_insumo}`, getAuthHeaders());
};
