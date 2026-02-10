import apiClient from './api';
import type { 
  VentaWebCreate, 
  VentaWebUpdate, 
  VentaWebWithDetails,
  DetalleVentaWeb,
  EstadoDetalle
} from '../types/ventasWeb.types';

const API_BASE = '/ventas-web';

// Obtener todas las ventas web del negocio
export const obtenerVentasWeb = async (): Promise<VentaWebWithDetails[]> => {
  try {
    console.log('🔵 ventasWebService: Obteniendo ventas web del negocio autenticado');
    const response = await apiClient.get<{ success: boolean; data: VentaWebWithDetails[] }>(API_BASE);
    console.log('🔵 ventasWebService: Ventas web obtenidas:', response.data.data.length);
    // Ensure detalles is always an array
    const ventasConDetalles = response.data.data.map(venta => ({
      ...venta,
      detalles: venta.detalles || []
    }));
    return ventasConDetalles;
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
    // Ensure detalles is always an array
    return {
      ...response.data.data,
      detalles: response.data.data.detalles || []
    };
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
  } catch (error: any) {
    console.error('🔴 ventasWebService: Error al crear venta web:', error);
    // Extract meaningful error message from API response
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Error desconocido al crear la venta';
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
  } catch (error: any) {
    console.error('🔴 ventasWebService: Error al actualizar venta web:', error);
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Error desconocido al actualizar la venta';
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

// Actualizar estado de un detalle de venta
export const actualizarEstadoDetalle = async (
  idVenta: number, 
  idDetalle: number, 
  estadodetalle: EstadoDetalle
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('🔵 ventasWebService: Actualizando estado del detalle:', { idVenta, idDetalle, estadodetalle });
    await apiClient.patch<{ success: boolean; message: string }>(
      `${API_BASE}/${idVenta}/detalles/${idDetalle}/estado`,
      { estadodetalle }
    );
    console.log('🔵 ventasWebService: Estado del detalle actualizado exitosamente');
    return { success: true };
  } catch (error: any) {
    console.error('🔴 ventasWebService: Error al actualizar estado del detalle:', error);
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Error desconocido al actualizar el estado del detalle';
    return { success: false, message: errorMessage };
  }
};

// Obtener detalles por estado (útil para vistas de cocina/producción)
export const obtenerDetallesPorEstado = async (estado: EstadoDetalle): Promise<DetalleVentaWeb[]> => {
  try {
    console.log('🔵 ventasWebService: Obteniendo detalles con estado:', estado);
    const response = await apiClient.get<{ success: boolean; data: DetalleVentaWeb[] }>(
      `${API_BASE}/detalles/estado/${estado}`
    );
    console.log('🔵 ventasWebService: Detalles obtenidos:', response.data.data.length);
    return response.data.data;
  } catch (error) {
    console.error('🔴 ventasWebService: Error al obtener detalles por estado:', error);
    return [];
  }
};

// Agregar detalles a una venta existente
export const agregarDetallesAVenta = async (
  idVenta: number,
  detalles: {
    idproducto: number;
    nombreproducto: string;
    idreceta?: number | null;
    tipoproducto?: string;
    cantidad: number;
    preciounitario: number;
    costounitario: number;
    observaciones?: string | null;
    moderadores?: string | null;
  }[],
  estadodetalle: EstadoDetalle
): Promise<{ 
  success: boolean; 
  idventa?: number; 
  folioventa?: string; 
  message?: string 
}> => {
  try {
    console.log('🔵 ventasWebService: Agregando detalles a venta ID:', idVenta);
    const response = await apiClient.post<{ 
      success: boolean; 
      message: string; 
      data: { idventa: number; folioventa: string } 
    }>(`${API_BASE}/${idVenta}/detalles`, { detalles, estadodetalle });
    console.log('🔵 ventasWebService: Detalles agregados exitosamente:', response.data.data);
    return { 
      success: true, 
      idventa: response.data.data.idventa,
      folioventa: response.data.data.folioventa
    };
  } catch (error: any) {
    console.error('🔴 ventasWebService: Error al agregar detalles a venta:', error);
    // Extract meaningful error message from API response
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Error desconocido al agregar detalles a la venta';
    return { success: false, message: errorMessage };
  }
};

// Obtener resumen de ventas del turno actual abierto
export interface ResumenVentas {
  totalCobrado: number;
  totalOrdenado: number;
  metaTurno: number;
  hasTurnoAbierto: boolean;
}

export const obtenerResumenVentas = async (): Promise<ResumenVentas> => {
  try {
    console.log('🔵 ventasWebService: Obteniendo resumen de ventas del turno actual');
    const response = await apiClient.get<{ success: boolean; data: ResumenVentas }>(
      `${API_BASE}/resumen/turno-actual`
    );
    console.log('🔵 ventasWebService: Resumen de ventas obtenido:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('🔴 ventasWebService: Error al obtener resumen de ventas:', error);
    // Return empty data on error
    return {
      totalCobrado: 0,
      totalOrdenado: 0,
      metaTurno: 0,
      hasTurnoAbierto: false
    };
  }
};

// Verificar si una mesa tiene ventas en estado ORDENADO
export const verificarMesaOcupada = async (nombremesa: string): Promise<boolean> => {
  try {
    console.log('🔵 ventasWebService: Verificando si mesa está ocupada:', nombremesa);
    
    // Get all sales for the business
    const ventas = await obtenerVentasWeb();
    
    // Check if any sale has:
    // - tipodeventa = 'MESA'
    // - estadodeventa = 'ORDENADO'
    // - cliente matches the table name exactly (e.g., "Mesa: Mesa 1")
    const mesaOcupada = ventas.some(venta => 
      venta.tipodeventa === 'MESA' && 
      venta.estadodeventa === 'ORDENADO' && 
      (venta.cliente === `Mesa: ${nombremesa}` || venta.cliente === nombremesa)
    );
    
    console.log('🔵 ventasWebService: Mesa ocupada:', mesaOcupada);
    return mesaOcupada;
  } catch (error) {
    console.error('🔴 ventasWebService: Error al verificar mesa ocupada:', error);
    return false;
  }
};

// Verificar múltiples mesas a la vez (optimizado para evitar N+1 queries)
export const verificarMesasOcupadas = async (mesas: { idmesa: number; nombremesa: string }[]): Promise<Map<string, boolean>> => {
  try {
    console.log('🔵 ventasWebService: Verificando estado de múltiples mesas');
    
    // Get all sales for the business once
    const ventas = await obtenerVentasWeb();
    
    // Filter to only MESA sales with ORDENADO status
    const ventasMesaOrdenadas = ventas.filter(venta => 
      venta.tipodeventa === 'MESA' && 
      venta.estadodeventa === 'ORDENADO'
    );
    
    // Create a map of mesa name to occupation status
    const mesasOcupadasMap = new Map<string, boolean>();
    
    mesas.forEach(mesa => {
      const tieneVentaOrdenada = ventasMesaOrdenadas.some(venta => 
        venta.cliente === `Mesa: ${mesa.nombremesa}` || venta.cliente === mesa.nombremesa
      );
      mesasOcupadasMap.set(mesa.nombremesa, tieneVentaOrdenada);
    });
    
    console.log('🔵 ventasWebService: Mesas validadas:', mesasOcupadasMap.size);
    return mesasOcupadasMap;
  } catch (error) {
    console.error('🔴 ventasWebService: Error al verificar mesas ocupadas:', error);
    return new Map<string, boolean>();
  }
};
