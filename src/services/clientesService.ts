import apiClient from './api';
import type { Cliente, ClienteCreate, ClienteUpdate } from '../types/cliente.types';

const API_BASE = '/clientes';

// Obtener todos los clientes de un negocio
export const obtenerClientes = async (): Promise<Cliente[]> => {
  try {
    console.log('🔵 clientesService - Solicitando clientes del negocio autenticado');
    console.log('🔵 URL completa:', API_BASE);
    const response = await apiClient.get<Cliente[]>(API_BASE);
    console.log('✅ clientesService - Respuesta recibida:', response.data);
    
    // Validación: asegurarse de devolver siempre un array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('⚠️ clientesService - La respuesta no es un array, devolviendo []');
    return [];
  } catch (error) {
    console.error('❌ clientesService - Error al obtener clientes:', error);
    return [];
  }
};

// Obtener un cliente por ID
export const obtenerCliente = async (idCliente: number): Promise<Cliente | null> => {
  try {
    const response = await apiClient.get<Cliente>(`${API_BASE}/${idCliente}`);
    return response.data;
  } catch (error) {
    console.error('clientesService - Error al obtener cliente:', error);
    return null;
  }
};

// Crear un nuevo cliente
export const crearCliente = async (cliente: ClienteCreate): Promise<Cliente> => {
  const response = await apiClient.post<Cliente>(API_BASE, cliente);
  return response.data;
};

// Actualizar un cliente
export const actualizarCliente = async (idCliente: number, cliente: ClienteUpdate): Promise<Cliente> => {
  const response = await apiClient.put<Cliente>(`${API_BASE}/${idCliente}`, cliente);
  return response.data;
};

// Eliminar un cliente
export const eliminarCliente = async (idCliente: number): Promise<number> => {
  await apiClient.delete(`${API_BASE}/${idCliente}`);
  return idCliente;
};
