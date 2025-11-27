import axios from 'axios';
import type { ModeradorRef } from '../types/moderadorRef.types';

const API_BASE = '/api/moderadores';

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

// Obtener todos los moderadores de referencia por negocio
export const obtenerModeradoresRef = async (idnegocio: number): Promise<ModeradorRef[]> => {
  try {
    console.log('🔵 moderadoresRefService: Obteniendo moderadores ref para negocio:', idnegocio);
    const response = await axios.get<ModeradorRef[]>(
      `${API_BASE}/ref/negocio/${idnegocio}`,
      getAuthHeaders()
    );
    console.log('🔵 moderadoresRefService: Moderadores ref obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('🔴 moderadoresRefService: Error al obtener moderadores ref:', error);
    return [];
  }
};
