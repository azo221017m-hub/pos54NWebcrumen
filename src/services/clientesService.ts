import apiClient from './api';
import type { Cliente, ClienteCreate, ClienteUpdate } from '../types/cliente.types';

const API_BASE = '/clientes';

// Obtener todos los clientes de un negocio
export const obtenerClientes = async (idnegocio: number): Promise<Cliente[]> => {
  try {
    console.log('🔵 clientesService - Solicitando clientes del negocio:', idnegocio);
    console.log('🔵 URL completa:', `${API_BASE}/negocio/${idnegocio}`);
    const response = await apiClient.get<Cliente[]>(`${API_BASE}/negocio/${idnegocio}`);
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
export const crearCliente = async (cliente: ClienteCreate): Promise<void> => {
  await apiClient.post(API_BASE, cliente);
};

// Actualizar un cliente
export const actualizarCliente = async (idCliente: number, cliente: ClienteUpdate): Promise<void> => {
  await apiClient.put(`${API_BASE}/${idCliente}`, cliente);
};

// Eliminar un cliente
export const eliminarCliente = async (idCliente: number): Promise<void> => {
  await apiClient.delete(`${API_BASE}/${idCliente}`);
};
