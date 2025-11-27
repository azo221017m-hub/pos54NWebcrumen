import axios from 'axios';
import type { Cliente, ClienteCreate, ClienteUpdate } from '../types/cliente.types';

const API_BASE = '/api/clientes';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obtener todos los clientes de un negocio
export const obtenerClientes = async (idnegocio: number): Promise<Cliente[]> => {
  try {
    console.log('🔵 clientesService - Solicitando clientes del negocio:', idnegocio);
    console.log('🔵 URL completa:', `${API_BASE}/negocio/${idnegocio}`);
    const response = await axios.get<Cliente[]>(`${API_BASE}/negocio/${idnegocio}`, getAuthHeaders());
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
    const response = await axios.get<Cliente>(`${API_BASE}/${idCliente}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('clientesService - Error al obtener cliente:', error);
    return null;
  }
};

// Crear un nuevo cliente
export const crearCliente = async (cliente: ClienteCreate): Promise<void> => {
  await axios.post(API_BASE, cliente, getAuthHeaders());
};

// Actualizar un cliente
export const actualizarCliente = async (idCliente: number, cliente: ClienteUpdate): Promise<void> => {
  await axios.put(`${API_BASE}/${idCliente}`, cliente, getAuthHeaders());
};

// Eliminar un cliente
export const eliminarCliente = async (idCliente: number): Promise<void> => {
  await axios.delete(`${API_BASE}/${idCliente}`, getAuthHeaders());
};
