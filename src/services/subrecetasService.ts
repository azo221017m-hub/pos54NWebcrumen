import axios from 'axios';
import type { Subreceta, SubrecetaCreate, SubrecetaUpdate } from '../types/subreceta.types';

const API_BASE = '/api/subrecetas';

// Función para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Obtener todas las subrecetas por negocio
export const obtenerSubrecetas = async (idnegocio: number): Promise<Subreceta[]> => {
  try {
    console.log('🔵 subrecetasService: Obteniendo subrecetas para negocio:', idnegocio);
    const response = await axios.get<Subreceta[]>(
      `${API_BASE}/negocio/${idnegocio}`,
      getAuthHeaders()
    );
    console.log('🔵 subrecetasService: Subrecetas obtenidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('🔴 subrecetasService: Error al obtener subrecetas:', error);
    return [];
  }
};

// Obtener una subreceta por ID (con detalles)
export const obtenerSubrecetaPorId = async (id: number): Promise<Subreceta | null> => {
  try {
    console.log('🔵 subrecetasService: Obteniendo subreceta ID:', id);
    const response = await axios.get<Subreceta>(
      `${API_BASE}/${id}`,
      getAuthHeaders()
    );
    console.log('🔵 subrecetasService: Subreceta obtenida:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔴 subrecetasService: Error al obtener subreceta:', error);
    return null;
  }
};

// Crear nueva subreceta
export const crearSubreceta = async (subreceta: SubrecetaCreate): Promise<{ success: boolean; idSubReceta?: number }> => {
  try {
    console.log('🔵 subrecetasService: Creando subreceta:', subreceta);
    const response = await axios.post(
      API_BASE,
      subreceta,
      getAuthHeaders()
    );
    console.log('🔵 subrecetasService: Subreceta creada exitosamente');
    return { success: true, idSubReceta: response.data.idSubReceta };
  } catch (error) {
    console.error('🔴 subrecetasService: Error al crear subreceta:', error);
    return { success: false };
  }
};

// Actualizar subreceta
export const actualizarSubreceta = async (id: number, subreceta: SubrecetaUpdate): Promise<boolean> => {
  try {
    console.log('🔵 subrecetasService: Actualizando subreceta ID:', id);
    await axios.put(
      `${API_BASE}/${id}`,
      subreceta,
      getAuthHeaders()
    );
    console.log('🔵 subrecetasService: Subreceta actualizada exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 subrecetasService: Error al actualizar subreceta:', error);
    return false;
  }
};

// Eliminar subreceta
export const eliminarSubreceta = async (id: number): Promise<boolean> => {
  try {
    console.log('🔵 subrecetasService: Eliminando subreceta ID:', id);
    await axios.delete(
      `${API_BASE}/${id}`,
      getAuthHeaders()
    );
    console.log('🔵 subrecetasService: Subreceta eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 subrecetasService: Error al eliminar subreceta:', error);
    return false;
  }
};
