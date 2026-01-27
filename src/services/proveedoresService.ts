import apiClient from './api';
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '../types/proveedor.types';

const API_BASE = '/proveedores';

// Obtener todos los proveedores de un negocio
export const obtenerProveedores = async (): Promise<Proveedor[]> => {
  try {
    console.log('🔵 proveedoresService - Solicitando proveedores del negocio autenticado');
    const response = await apiClient.get<Proveedor[]>(`${API_BASE}`);
    console.log('✅ proveedoresService - Respuesta recibida:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('⚠️ proveedoresService - La respuesta no es un array, devolviendo []');
    return [];
  } catch (error) {
    console.error('❌ proveedoresService - Error al obtener proveedores:', error);
    return [];
  }
};

// Obtener un proveedor por ID
export const obtenerProveedor = async (id_proveedor: number): Promise<Proveedor | null> => {
  try {
    const response = await apiClient.get<Proveedor>(`${API_BASE}/${id_proveedor}`);
    return response.data;
  } catch (error) {
    console.error('proveedoresService - Error al obtener proveedor:', error);
    return null;
  }
};

// Crear un nuevo proveedor
export const crearProveedor = async (proveedor: ProveedorCreate): Promise<Proveedor> => {
  const response = await apiClient.post<Proveedor>(API_BASE, proveedor);
  return response.data;
};

// Actualizar un proveedor
export const actualizarProveedor = async (id_proveedor: number, proveedor: ProveedorUpdate): Promise<Proveedor> => {
  const response = await apiClient.put<Proveedor>(`${API_BASE}/${id_proveedor}`, proveedor);
  return response.data;
};

// Eliminar un proveedor
export const eliminarProveedor = async (id_proveedor: number): Promise<number> => {
  await apiClient.delete(`${API_BASE}/${id_proveedor}`);
  return id_proveedor;
};
