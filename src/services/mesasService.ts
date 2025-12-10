import apiClient from './api';
import type { Mesa, MesaCreate, MesaUpdate } from '../types/mesa.types';

const API_BASE = '/mesas';

// Obtener todas las mesas de un negocio
export const obtenerMesas = async (): Promise<Mesa[]> => {
  try {
    console.log('Servicio: Obteniendo mesas del negocio autenticado');
    const response = await apiClient.get<Mesa[]>(API_BASE);
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
    const response = await apiClient.get<Mesa>(`${API_BASE}/${idmesa}`);
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
    const response = await apiClient.post<{ message: string; idmesa: number }>(API_BASE, mesa);
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
    const response = await apiClient.put<{ message: string }>(`${API_BASE}/${idmesa}`, mesa);
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
    const response = await apiClient.delete<{ message: string }>(`${API_BASE}/${idmesa}`);
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
    
    const response = await apiClient.get<{ esUnico: boolean }>(`${API_BASE}/validar/numero-mesa`, { params });
    
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
    const response = await apiClient.patch<{ message: string }>(
      `${API_BASE}/${idmesa}/estatus`,
      { estatusmesa, UsuarioModifico: usuarioModifico }
    );
    console.log('Servicio: Estatus de mesa cambiado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio cambiarEstatusMesa:', error);
    throw error;
  }
};
