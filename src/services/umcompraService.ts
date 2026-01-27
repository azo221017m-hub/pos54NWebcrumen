import api from './api';
import type { UMCompra, UMCompraFormData, UMCompraResponse } from '../types/umcompra.types';

// Obtener todas las unidades de medida
export const obtenerUMCompras = async (): Promise<UMCompra[]> => {
  try {
    console.log('🔄 Obteniendo unidades de medida...');
    const response = await api.get<UMCompraResponse>('/umcompra');
    console.log('✅ Unidades de medida obtenidas:', response.data);
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('❌ Error al obtener unidades de medida:', error);
    throw error;
  }
};

// Obtener una unidad de medida por ID
export const obtenerUMCompraPorId = async (id: number): Promise<UMCompra | null> => {
  try {
    console.log(`🔄 Obteniendo unidad de medida ${id}...`);
    const response = await api.get<UMCompraResponse>(`/umcompra/${id}`);
    console.log('✅ Unidad de medida obtenida:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data as UMCompra;
    }
    return null;
  } catch (error) {
    console.error('❌ Error al obtener unidad de medida:', error);
    throw error;
  }
};

// Crear una nueva unidad de medida
export const crearUMCompra = async (umcompra: UMCompraFormData): Promise<UMCompra> => {
  try {
    console.log('🔄 Creando unidad de medida...', umcompra);
    const response = await api.post<UMCompraResponse>('/umcompra', umcompra);
    console.log('✅ Unidad de medida creada:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data as UMCompra;
    }
    throw new Error('Respuesta inválida del servidor');
  } catch (error) {
    console.error('❌ Error al crear unidad de medida:', error);
    throw error;
  }
};

// Actualizar una unidad de medida
export const actualizarUMCompra = async (id: number, umcompra: UMCompraFormData): Promise<UMCompra> => {
  try {
    console.log(`🔄 Actualizando unidad de medida ${id}...`, umcompra);
    const response = await api.put<UMCompraResponse>(`/umcompra/${id}`, umcompra);
    console.log('✅ Unidad de medida actualizada:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      return response.data.data as UMCompra;
    }
    throw new Error('Respuesta inválida del servidor');
  } catch (error) {
    console.error('❌ Error al actualizar unidad de medida:', error);
    throw error;
  }
};

// Eliminar una unidad de medida
export const eliminarUMCompra = async (id: number): Promise<number> => {
  try {
    console.log(`🔄 Eliminando unidad de medida ${id}...`);
    await api.delete(`/umcompra/${id}`);
    console.log('✅ Unidad de medida eliminada');
    return id;
  } catch (error) {
    console.error('❌ Error al eliminar unidad de medida:', error);
    throw error;
  }
};

// Validar si un nombre es único
export const validarNombreUnico = async (nombreUmCompra: string, idUmCompra?: number): Promise<boolean> => {
  try {
    console.log(`🔄 Validando nombre único: ${nombreUmCompra}...`);
    const response = await api.post<UMCompraResponse>('/umcompra/validar-nombre', {
      nombreUmCompra,
      idUmCompra
    });
    console.log('✅ Validación de nombre:', response.data);
    
    if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
      const data = response.data.data as { esUnico: boolean };
      return data.esUnico;
    }
    return false;
  } catch (error) {
    console.error('❌ Error al validar nombre:', error);
    throw error;
  }
};

export default {
  obtenerUMCompras,
  obtenerUMCompraPorId,
  crearUMCompra,
  actualizarUMCompra,
  eliminarUMCompra,
  validarNombreUnico
};
