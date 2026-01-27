import apiClient from './api';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../types/descuento.types';

const API_BASE = '/descuentos';

// Obtener todos los descuentos de un negocio
export const obtenerDescuentos = async (): Promise<Descuento[]> => {
  try {
    console.log('Servicio: Obteniendo descuentos del negocio autenticado');
    const response = await apiClient.get<Descuento[]>(API_BASE);
    console.log('Servicio: Descuentos obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error en servicio obtenerDescuentos:', error);
    throw error;
  }
};

// Obtener un descuento por ID
export const obtenerDescuentoPorId = async (id_descuento: number): Promise<Descuento> => {
  try {
    console.log('Servicio: Obteniendo descuento con ID', id_descuento);
    const response = await apiClient.get<Descuento>(`${API_BASE}/${id_descuento}`);
    console.log('Servicio: Descuento obtenido:', response.data.nombre);
    return response.data;
  } catch (error) {
    console.error('Error en servicio obtenerDescuentoPorId:', error);
    throw error;
  }
};

// Crear un nuevo descuento
export const crearDescuento = async (descuento: DescuentoCreate): Promise<Descuento> => {
  try {
    console.log('Servicio: Creando nuevo descuento:', descuento.nombre);
    const response = await apiClient.post<Descuento>(API_BASE, descuento);
    console.log('Servicio: Descuento creado con ID:', response.data.id_descuento);
    return response.data;
  } catch (error) {
    console.error('Error en servicio crearDescuento:', error);
    throw error;
  }
};

// Actualizar un descuento
export const actualizarDescuento = async (id_descuento: number, descuento: DescuentoUpdate): Promise<Descuento> => {
  try {
    console.log('Servicio: Actualizando descuento ID:', id_descuento);
    const response = await apiClient.put<Descuento>(`${API_BASE}/${id_descuento}`, descuento);
    console.log('Servicio: Descuento actualizado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio actualizarDescuento:', error);
    throw error;
  }
};

// Eliminar un descuento
export const eliminarDescuento = async (id_descuento: number): Promise<number> => {
  try {
    console.log('Servicio: Eliminando descuento ID:', id_descuento);
    await apiClient.delete(`${API_BASE}/${id_descuento}`);
    console.log('Servicio: Descuento eliminado');
    return id_descuento;
  } catch (error) {
    console.error('Error en servicio eliminarDescuento:', error);
    throw error;
  }
};

// Validar que el nombre del descuento sea único en el negocio
export const validarNombreDescuentoUnico = async (
  nombre: string,
  idnegocio: number,
  id_descuento?: number
): Promise<boolean> => {
  try {
    console.log('Servicio: Validando nombre de descuento único:', nombre);
    const params: Record<string, string | number> = { nombre, idnegocio };
    if (id_descuento) {
      params.id_descuento = id_descuento;
    }
    
    const response = await apiClient.get<{ esUnico: boolean }>(`${API_BASE}/validar/nombre-descuento`, { params });
    
    console.log('Servicio: Nombre de descuento es único:', response.data.esUnico);
    return response.data.esUnico;
  } catch (error) {
    console.error('Error en servicio validarNombreDescuentoUnico:', error);
    throw error;
  }
};

// Cambiar estatus de descuento
export const cambiarEstatusDescuento = async (
  id_descuento: number,
  estatusdescuento: string,
  usuarioModifico: string
): Promise<{ message: string }> => {
  try {
    console.log('Servicio: Cambiando estatus de descuento ID:', id_descuento, 'a:', estatusdescuento);
    const response = await apiClient.patch<{ message: string }>(
      `${API_BASE}/${id_descuento}/estatus`,
      { estatusdescuento, UsuarioModifico: usuarioModifico }
    );
    console.log('Servicio: Estatus de descuento cambiado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio cambiarEstatusDescent:', error);
    throw error;
  }
};
