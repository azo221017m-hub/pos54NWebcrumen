import axios from 'axios';
import type { Mesa, MesaCreate, MesaUpdate } from '../types/mesa.types';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3000/api';
const API_URL = `${API_BASE_URL}/mesas`;

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obtener todas las mesas de un negocio
export const obtenerMesas = async (idnegocio: number): Promise<Mesa[]> => {
  try {
    console.log('Servicio: Obteniendo mesas del negocio', idnegocio);
    const response = await axios.get<Mesa[]>(
      `${API_URL}/negocio/${idnegocio}`,
      getAuthHeaders()
    );
    console.log('Servicio: Mesas obtenidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error en servicio obtenerMesas:', error);
    throw error;
  }
};

// Obtener una mesa por ID
export const obtenerMesaPorId = async (idmesa: number): Promise<Mesa> => {
  try {
    console.log('Servicio: Obteniendo mesa con ID', idmesa);
    const response = await axios.get<Mesa>(
      `${API_URL}/${idmesa}`,
      getAuthHeaders()
    );
    console.log('Servicio: Mesa obtenida:', response.data.nombremesa);
    return response.data;
  } catch (error) {
    console.error('Error en servicio obtenerMesaPorId:', error);
    throw error;
  }
};

// Crear una nueva mesa
export const crearMesa = async (mesa: MesaCreate): Promise<{ message: string; idmesa: number }> => {
  try {
    console.log('Servicio: Creando nueva mesa:', mesa.nombremesa);
    const response = await axios.post<{ message: string; idmesa: number }>(
      API_URL,
      mesa,
      getAuthHeaders()
    );
    console.log('Servicio: Mesa creada con ID:', response.data.idmesa);
    return response.data;
  } catch (error) {
    console.error('Error en servicio crearMesa:', error);
    throw error;
  }
};

// Actualizar una mesa
export const actualizarMesa = async (idmesa: number, mesa: MesaUpdate): Promise<{ message: string }> => {
  try {
    console.log('Servicio: Actualizando mesa ID:', idmesa);
    const response = await axios.put<{ message: string }>(
      `${API_URL}/${idmesa}`,
      mesa,
      getAuthHeaders()
    );
    console.log('Servicio: Mesa actualizada');
    return response.data;
  } catch (error) {
    console.error('Error en servicio actualizarMesa:', error);
    throw error;
  }
};

// Eliminar una mesa
export const eliminarMesa = async (idmesa: number): Promise<{ message: string }> => {
  try {
    console.log('Servicio: Eliminando mesa ID:', idmesa);
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/${idmesa}`,
      getAuthHeaders()
    );
    console.log('Servicio: Mesa eliminada');
    return response.data;
  } catch (error) {
    console.error('Error en servicio eliminarMesa:', error);
    throw error;
  }
};

// Validar que el número de mesa sea único en el negocio
export const validarNumeroMesaUnico = async (
  numeromesa: number,
  idnegocio: number,
  idmesa?: number
): Promise<boolean> => {
  try {
    console.log('Servicio: Validando número de mesa único:', numeromesa);
    const params: Record<string, number> = { numeromesa, idnegocio };
    if (idmesa) {
      params.idmesa = idmesa;
    }
    
    const response = await axios.get<{ esUnico: boolean }>(
      `${API_URL}/validar/numero-mesa`,
      { ...getAuthHeaders(), params }
    );
    
    console.log('Servicio: Número de mesa es único:', response.data.esUnico);
    return response.data.esUnico;
  } catch (error) {
    console.error('Error en servicio validarNumeroMesaUnico:', error);
    throw error;
  }
};

// Cambiar estatus de mesa
export const cambiarEstatusMesa = async (
  idmesa: number,
  estatusmesa: string,
  usuarioModifico: string
): Promise<{ message: string }> => {
  try {
    console.log('Servicio: Cambiando estatus de mesa ID:', idmesa, 'a:', estatusmesa);
    const response = await axios.patch<{ message: string }>(
      `${API_URL}/${idmesa}/estatus`,
      { estatusmesa, UsuarioModifico: usuarioModifico },
      getAuthHeaders()
    );
    console.log('Servicio: Estatus de mesa cambiado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio cambiarEstatusMesa:', error);
    throw error;
  }
};
