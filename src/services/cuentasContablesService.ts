import api from './api';
import type { CuentaContable } from '../types/cuentaContable.types';

/**
 * Obtener todas las cuentas contables
 */
export const obtenerCuentasContables = async (naturaleza?: CuentaContable['naturalezacuentacontable']): Promise<CuentaContable[]> => {
  try {
    const url = naturaleza 
      ? `/cuentas-contables?naturaleza=${encodeURIComponent(naturaleza)}`
      : '/cuentas-contables';
    const response = await api.get<CuentaContable[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuentas contables:', error);
    // Return empty array if service is not available
    return [];
  }
};
