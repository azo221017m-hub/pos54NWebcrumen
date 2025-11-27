import apiClient from './api';
import type { CuentaContable, CuentaContableCreate, CuentaContableUpdate } from '../types/cuentaContable.types';

const API_BASE = '/cuentas-contables';

// Obtener todas las cuentas contables de un negocio
export const obtenerCuentasContables = async (idnegocio: number): Promise<CuentaContable[]> => {
  try {
    console.log('🔵 cuentasContablesService - Solicitando cuentas del negocio:', idnegocio);
    const response = await apiClient.get<CuentaContable[]>(`${API_BASE}/negocio/${idnegocio}`);
    console.log('✅ cuentasContablesService - Respuesta recibida:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('⚠️ cuentasContablesService - La respuesta no es un array, devolviendo []');
    return [];
  } catch (error) {
    console.error('❌ cuentasContablesService - Error al obtener cuentas:', error);
    return [];
  }
};

// Obtener una cuenta contable por ID
export const obtenerCuentaContable = async (id: number): Promise<CuentaContable | null> => {
  try {
    const response = await apiClient.get<CuentaContable>(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuenta contable:', error);
    return null;
  }
};

// Crear nueva cuenta contable
export const crearCuentaContable = async (cuenta: CuentaContableCreate): Promise<void> => {
  await apiClient.post(API_BASE, cuenta);
};

// Actualizar cuenta contable
export const actualizarCuentaContable = async (id: number, cuenta: CuentaContableUpdate): Promise<void> => {
  await apiClient.put(`${API_BASE}/${id}`, cuenta);
};

// Eliminar cuenta contable
export const eliminarCuentaContable = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_BASE}/${id}`);
};
