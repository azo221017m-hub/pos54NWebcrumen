import axios from 'axios';
import type {
  MovimientoConDetalles,
  MovimientoCreate,
  MovimientoUpdate,
  MovimientoResponse,
  MovimientosListResponse,
  UltimaCompraData
} from '../types/movimientos.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios con el token JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Obtener todos los movimientos
export const obtenerMovimientos = async (): Promise<MovimientoConDetalles[]> => {
  try {
    const response = await axios.get<MovimientosListResponse>(
      `${API_URL}/movimientos`,
      getAuthHeaders()
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error;
  }
};

// Obtener un movimiento por ID
export const obtenerMovimientoPorId = async (id: number): Promise<MovimientoConDetalles> => {
  try {
    const response = await axios.get<MovimientoResponse>(
      `${API_URL}/movimientos/${id}`,
      getAuthHeaders()
    );
    if (!response.data.data) {
      throw new Error('No se encontró el movimiento');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    throw error;
  }
};

// Crear un nuevo movimiento
export const crearMovimiento = async (movimiento: MovimientoCreate): Promise<MovimientoConDetalles> => {
  try {
    const response = await axios.post<MovimientoResponse>(
      `${API_URL}/movimientos`,
      movimiento,
      getAuthHeaders()
    );
    if (!response.data.data) {
      throw new Error('No se pudo crear el movimiento');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    throw error;
  }
};

// Actualizar un movimiento
export const actualizarMovimiento = async (
  id: number,
  movimiento: MovimientoUpdate
): Promise<MovimientoConDetalles> => {
  try {
    const response = await axios.put<MovimientoResponse>(
      `${API_URL}/movimientos/${id}`,
      movimiento,
      getAuthHeaders()
    );
    if (!response.data.data) {
      throw new Error('No se pudo actualizar el movimiento');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    throw error;
  }
};

// Eliminar un movimiento (soft delete)
export const eliminarMovimiento = async (id: number): Promise<void> => {
  try {
    await axios.delete(
      `${API_URL}/movimientos/${id}`,
      getAuthHeaders()
    );
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    throw error;
  }
};

// Procesar un movimiento pendiente
export const procesarMovimiento = async (id: number): Promise<MovimientoConDetalles> => {
  try {
    const response = await axios.patch<MovimientoResponse>(
      `${API_URL}/movimientos/${id}/procesar`,
      {},
      getAuthHeaders()
    );
    if (!response.data.data) {
      throw new Error('No se pudo procesar el movimiento');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al procesar movimiento:', error);
    throw error;
  }
};

// Obtener datos de última compra de un insumo
export const obtenerUltimaCompra = async (idInsumo: number): Promise<UltimaCompraData> => {
  try {
    const response = await axios.get<{ success: boolean; data: UltimaCompraData }>(
      `${API_URL}/movimientos/insumo/${idInsumo}/ultima-compra`,
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error al obtener última compra:', error);
    
    // If 404 or any other error, return default values as per requirements:
    // 0 for int/decimal, empty string for varchar/string variables
    console.log('No se encontró información de última compra, aplicando valores por defecto');
    return {
      existencia: 0,
      costoUltimoPonderado: 0,
      unidadMedida: '',
      cantidadUltimaCompra: 0,
      proveedorUltimaCompra: '',
      costoUltimaCompra: 0
    };
  }
};
