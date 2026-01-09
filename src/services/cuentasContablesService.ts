import api from './api';
import type { CuentaContable } from '../types/cuentaContable.types';

/**
 * Obtener todas las cuentas contables
 */
export const obtenerCuentasContables = async (): Promise<CuentaContable[]> => {
  try {
    const response = await api.get<CuentaContable[]>('/cuentascontables');
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuentas contables:', error);
    // Return empty array if service is not available
    return [];
  }
};
