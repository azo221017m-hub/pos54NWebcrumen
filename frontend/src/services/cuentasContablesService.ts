import axios from 'axios';
import type { CuentaContable, CuentaContableCreate, CuentaContableUpdate } from '../types/cuentaContable.types';

const API_BASE = '/api/cuentas-contables';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obtener todas las cuentas contables de un negocio
export const obtenerCuentasContables = async (idnegocio: number): Promise<CuentaContable[]> => {
  try {
    console.log('🔵 cuentasContablesService - Solicitando cuentas del negocio:', idnegocio);
    const response = await axios.get<CuentaContable[]>(`${API_BASE}/negocio/${idnegocio}`, getAuthHeaders());
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
    const response = await axios.get<CuentaContable>(`${API_BASE}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuenta contable:', error);
    return null;
  }
};

// Crear nueva cuenta contable
export const crearCuentaContable = async (cuenta: CuentaContableCreate): Promise<void> => {
  await axios.post(API_BASE, cuenta, getAuthHeaders());
};

// Actualizar cuenta contable
export const actualizarCuentaContable = async (id: number, cuenta: CuentaContableUpdate): Promise<void> => {
  await axios.put(`${API_BASE}/${id}`, cuenta, getAuthHeaders());
};

// Eliminar cuenta contable
export const eliminarCuentaContable = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
};
