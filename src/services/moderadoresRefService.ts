import apiClient from './api';
import type { ModeradorRef } from '../types/moderadorRef.types';

const API_BASE = '/moderadores';

// Obtener todos los moderadores de referencia por negocio
export const obtenerModeradoresRef = async (idnegocio: number): Promise<ModeradorRef[]> => {
  try {
    console.log('🔵 moderadoresRefService: Obteniendo moderadores ref para negocio:', idnegocio);
    const response = await apiClient.get<ModeradorRef[]>(`${API_BASE}/ref/negocio/${idnegocio}`);
    console.log('🔵 moderadoresRefService: Moderadores ref obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('🔴 moderadoresRefService: Error al obtener moderadores ref:', error);
    return [];
  }
};
