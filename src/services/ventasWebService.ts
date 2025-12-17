import apiClient from './api';
import type { 
  VentaWebCreate, 
  VentaWebUpdate, 
  VentaWebWithDetails 
} from '../types/ventasWeb.types';

const API_BASE = '/ventas-web';

// Obtener todas las ventas web del negocio
export const obtenerVentasWeb = async (): Promise<VentaWebWithDetails[]> => {
  try {
    console.log('🔵 ventasWebService: Obteniendo ventas web del negocio autenticado');
    const response = await apiClient.get<{ success: boolean; data: VentaWebWithDetails[] }>(API_BASE);
    console.log('🔵 ventasWebService: Ventas web obtenidas:', response.data.data.length);
    return response.data.data;
  } catch (error) {
    console.error('🔴 ventasWebService: Error al obtener ventas web:', error);
    return [];
  }
};

// Obtener una venta web por ID con sus detalles
export const obtenerVentaWebPorId = async (id: number): Promise<VentaWebWithDetails | null> => {
  try {
    console.log('🔵 ventasWebService: Obteniendo venta web ID:', id);
    const response = await apiClient.get<{ success: boolean; data: VentaWebWithDetails }>(`${API_BASE}/${id}`);
    console.log('🔵 ventasWebService: Venta web obtenida:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('🔴 ventasWebService: Error al obtener venta web:', error);
    return null;
  }
};

// Crear nueva venta web con sus detalles
export const crearVentaWeb = async (venta: VentaWebCreate): Promise<{ 
  success: boolean; 
  idventa?: number; 
  folioventa?: string; 
  message?: string 
}> => {
  try {
    console.log('🔵 ventasWebService: Creando venta web:', venta);
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string; 
      data: { idventa: number; folioventa: string } 
    }>(API_BASE, venta);
    console.log('🔵 ventasWebService: Venta web creada exitosamente:', response.data.data);
    return { 
      success: true, 
      idventa: response.data.data.idventa,
      folioventa: response.data.data.folioventa
    };
  } catch (error) {
    console.error('🔴 ventasWebService: Error al crear venta web:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: errorMessage };
  }
};

// Actualizar venta web
export const actualizarVentaWeb = async (id: number, venta: VentaWebUpdate): Promise<{ 
  success: boolean; 
  message?: string 
}> => {
  try {
    console.log('🔵 ventasWebService: Actualizando venta web ID:', id);
    await apiClient.put<{ success: boolean; message: string }>(`${API_BASE}/${id}`, venta);
    console.log('🔵 ventasWebService: Venta web actualizada exitosamente');
    return { success: true };
  } catch (error) {
    console.error('🔴 ventasWebService: Error al actualizar venta web:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: errorMessage };
  }
};

// Cancelar venta web
export const cancelarVentaWeb = async (id: number): Promise<boolean> => {
  try {
    console.log('🔵 ventasWebService: Cancelando venta web ID:', id);
    await apiClient.delete<{ success: boolean; message: string }>(`${API_BASE}/${id}`);
    console.log('🔵 ventasWebService: Venta web cancelada exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 ventasWebService: Error al cancelar venta web:', error);
    return false;
  }
};
