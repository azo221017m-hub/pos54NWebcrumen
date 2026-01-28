import apiClient from './api';
import type { 
  PagoSimpleRequest, 
  PagoMixtoRequest,
  DetallePago
} from '../types/ventasWeb.types';

const API_BASE = '/pagos';

// Process simple payment (EFECTIVO or TRANSFERENCIA)
export const procesarPagoSimple = async (pagoData: PagoSimpleRequest): Promise<{ 
  success: boolean; 
  message?: string;
  data?: {
    idventa: number;
    folioventa: string;
    totaldeventa: number;
    importedepago: number;
    cambio: number;
  }
}> => {
  try {
    console.log('🔵 pagosService: Procesando pago simple:', pagoData);
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string; 
      data: {
        idventa: number;
        folioventa: string;
        totaldeventa: number;
        importedepago: number;
        cambio: number;
      }
    }>(`${API_BASE}/simple`, pagoData);
    console.log('🔵 pagosService: Pago simple procesado:', response.data);
    return { 
      success: true, 
      data: response.data.data
    };
  } catch (error: any) {
    console.error('🔴 pagosService: Error al procesar pago simple:', error);
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Error desconocido al procesar el pago';
    return { success: false, message: errorMessage };
  }
};

// Process mixed payment
export const procesarPagoMixto = async (pagoData: PagoMixtoRequest): Promise<{ 
  success: boolean; 
  message?: string;
  data?: {
    idventa: number;
    folioventa: string;
    totaldeventa: number;
    totalPagado: number;
    estatusdepago: string;
    pendiente: number;
  }
}> => {
  try {
    console.log('🔵 pagosService: Procesando pago mixto:', pagoData);
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string; 
      data: {
        idventa: number;
        folioventa: string;
        totaldeventa: number;
        totalPagado: number;
        estatusdepago: string;
        pendiente: number;
      }
    }>(`${API_BASE}/mixto`, pagoData);
    console.log('🔵 pagosService: Pago mixto procesado:', response.data);
    return { 
      success: true, 
      message: response.data.message,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('🔴 pagosService: Error al procesar pago mixto:', error);
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Error desconocido al procesar el pago mixto';
    return { success: false, message: errorMessage };
  }
};

// Get payment details for a sale
export const obtenerDetallesPagos = async (folioventa: string): Promise<DetallePago[]> => {
  try {
    console.log('🔵 pagosService: Obteniendo detalles de pagos para folio:', folioventa);
    const response = await apiClient.get<{ success: boolean; data: DetallePago[] }>(
      `${API_BASE}/detalles/${folioventa}`
    );
    console.log('🔵 pagosService: Detalles de pagos obtenidos:', response.data.data.length);
    return response.data.data;
  } catch (error) {
    console.error('🔴 pagosService: Error al obtener detalles de pagos:', error);
    return [];
  }
};
