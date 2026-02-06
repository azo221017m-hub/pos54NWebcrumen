import apiClient from './api';
import type {
  CompraCreate,
  CompraUpdate,
  CompraWithDetails,
  DetalleCompraUpdate
} from '../types/compras.types';

const API_BASE = '/compras';

// Helper function to ensure detalles is always an array
const ensureDetalles = <T extends { detalles?: any }>(item: T): T => ({
  ...item,
  detalles: item.detalles || []
});

// Obtener todas las compras del negocio
export const obtenerCompras = async (): Promise<CompraWithDetails[]> => {
  try {
    console.log('🔵 comprasService: Obteniendo compras del negocio autenticado');
    const response = await apiClient.get<{ success: boolean; data: CompraWithDetails[] }>(API_BASE);
    console.log('🔵 comprasService: Compras obtenidas:', response.data.data.length);
    return response.data.data.map(ensureDetalles);
  } catch (error) {
    console.error('🔴 comprasService: Error al obtener compras:', error);
    return [];
  }
};

// Obtener una compra por ID con sus detalles
export const obtenerCompraPorId = async (id: number): Promise<CompraWithDetails | null> => {
  try {
    console.log('🔵 comprasService: Obteniendo compra ID:', id);
    const response = await apiClient.get<{ success: boolean; data: CompraWithDetails }>(`${API_BASE}/${id}`);
    console.log('🔵 comprasService: Compra obtenida:', response.data.data);
    return ensureDetalles(response.data.data);
  } catch (error) {
    console.error('🔴 comprasService: Error al obtener compra:', error);
    return null;
  }
};

// Crear nueva compra con sus detalles
export const crearCompra = async (compra: CompraCreate): Promise<{
  success: boolean;
  idcompra?: number;
  foliocompra?: string;
  message?: string
}> => {
  try {
    console.log('🔵 comprasService: Creando compra:', compra);
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: CompraWithDetails
    }>(API_BASE, compra);
    console.log('🔵 comprasService: Compra creada exitosamente:', response.data.data);
    return {
      success: true,
      idcompra: response.data.data.idcompra,
      foliocompra: response.data.data.foliocompra
    };
  } catch (error: any) {
    console.error('🔴 comprasService: Error al crear compra:', error);
    // Extract meaningful error message from API response
    const errorMessage = error?.response?.data?.message ||
      error?.message ||
      'Error desconocido al crear la compra';
    return { success: false, message: errorMessage };
  }
};

// Actualizar compra
export const actualizarCompra = async (id: number, compra: CompraUpdate): Promise<{
  success: boolean;
  message?: string
}> => {
  try {
    console.log('🔵 comprasService: Actualizando compra ID:', id);
    await apiClient.put<{ success: boolean; message: string }>(`${API_BASE}/${id}`, compra);
    console.log('🔵 comprasService: Compra actualizada exitosamente');
    return { success: true };
  } catch (error: any) {
    console.error('🔴 comprasService: Error al actualizar compra:', error);
    const errorMessage = error?.response?.data?.message ||
      error?.message ||
      'Error desconocido al actualizar la compra';
    return { success: false, message: errorMessage };
  }
};

// Eliminar compra (soft delete)
export const eliminarCompra = async (id: number): Promise<boolean> => {
  try {
    console.log('🔵 comprasService: Eliminando compra ID:', id);
    await apiClient.delete<{ success: boolean; message: string }>(`${API_BASE}/${id}`);
    console.log('🔵 comprasService: Compra eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 comprasService: Error al eliminar compra:', error);
    return false;
  }
};

// Actualizar detalle de compra
export const actualizarDetalleCompra = async (
  idcompra: number,
  iddetalle: number,
  detalle: DetalleCompraUpdate
): Promise<{
  success: boolean;
  message?: string
}> => {
  try {
    console.log('🔵 comprasService: Actualizando detalle de compra:', { idcompra, iddetalle });
    await apiClient.put<{ success: boolean; message: string }>(
      `${API_BASE}/${idcompra}/detalles/${iddetalle}`,
      detalle
    );
    console.log('🔵 comprasService: Detalle de compra actualizado exitosamente');
    return { success: true };
  } catch (error: any) {
    console.error('🔴 comprasService: Error al actualizar detalle de compra:', error);
    const errorMessage = error?.response?.data?.message ||
      error?.message ||
      'Error desconocido al actualizar el detalle';
    return { success: false, message: errorMessage };
  }
};
