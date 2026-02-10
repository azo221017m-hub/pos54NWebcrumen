import apiClient from './api';
import type {
  MovimientoConDetalles,
  MovimientoCreate,
  MovimientoUpdate,
  MovimientoResponse,
  MovimientosListResponse,
  UltimaCompraData
} from '../types/movimientos.types';

const API_BASE = '/movimientos';

// Obtener todos los movimientos
export const obtenerMovimientos = async (): Promise<MovimientoConDetalles[]> => {
  try {
    const response = await apiClient.get<MovimientosListResponse>(API_BASE);
    return response.data.data || [];
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error;
  }
};

// Obtener un movimiento por ID
export const obtenerMovimientoPorId = async (id: number): Promise<MovimientoConDetalles> => {
  try {
    const response = await apiClient.get<MovimientoResponse>(`${API_BASE}/${id}`);
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
    const response = await apiClient.post<MovimientoResponse>(API_BASE, movimiento);
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
    const response = await apiClient.put<MovimientoResponse>(`${API_BASE}/${id}`, movimiento);
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
    await apiClient.delete(`${API_BASE}/${id}`);
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    throw error;
  }
};

// Procesar un movimiento pendiente
export const procesarMovimiento = async (id: number): Promise<MovimientoConDetalles> => {
  try {
    const response = await apiClient.patch<MovimientoResponse>(`${API_BASE}/${id}/procesar`, {});
    if (!response.data.data) {
      throw new Error('No se pudo procesar el movimiento');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al procesar movimiento:', error);
    throw error;
  }
};

// Aplicar un movimiento pendiente con actualizaciones de inventario
export const aplicarMovimiento = async (id: number): Promise<MovimientoConDetalles> => {
  try {
    const response = await apiClient.patch<MovimientoResponse>(`${API_BASE}/${id}/aplicar`, {});
    if (!response.data.data) {
      throw new Error('No se pudo aplicar el movimiento');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error al aplicar movimiento:', error);
    throw error;
  }
};

// Obtener datos de última compra de un insumo
export const obtenerUltimaCompra = async (idInsumo: number): Promise<UltimaCompraData> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: UltimaCompraData }>(
      `${API_BASE}/insumo/${idInsumo}/ultima-compra`
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
