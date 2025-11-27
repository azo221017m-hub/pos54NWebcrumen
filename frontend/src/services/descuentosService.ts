import axios from 'axios';
import type { Descuento, DescuentoCreate, DescuentoUpdate } from '../types/descuento.types';

const API_URL = 'http://localhost:3000/api/descuentos';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Obtener todos los descuentos de un negocio
export const obtenerDescuentos = async (idnegocio: number): Promise<Descuento[]> => {
  try {
    console.log('Servicio: Obteniendo descuentos del negocio', idnegocio);
    const response = await axios.get<Descuento[]>(
      `${API_URL}/negocio/${idnegocio}`,
      getAuthHeaders()
    );
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
    const response = await axios.get<Descuento>(
      `${API_URL}/${id_descuento}`,
      getAuthHeaders()
    );
    console.log('Servicio: Descuento obtenido:', response.data.nombre);
    return response.data;
  } catch (error) {
    console.error('Error en servicio obtenerDescuentoPorId:', error);
    throw error;
  }
};

// Crear un nuevo descuento
export const crearDescuento = async (descuento: DescuentoCreate): Promise<{ message: string; id_descuento: number }> => {
  try {
    console.log('Servicio: Creando nuevo descuento:', descuento.nombre);
    const response = await axios.post<{ message: string; id_descuento: number }>(
      API_URL,
      descuento,
      getAuthHeaders()
    );
    console.log('Servicio: Descuento creado con ID:', response.data.id_descuento);
    return response.data;
  } catch (error) {
    console.error('Error en servicio crearDescuento:', error);
    throw error;
  }
};

// Actualizar un descuento
export const actualizarDescuento = async (id_descuento: number, descuento: DescuentoUpdate): Promise<{ message: string }> => {
  try {
    console.log('Servicio: Actualizando descuento ID:', id_descuento);
    const response = await axios.put<{ message: string }>(
      `${API_URL}/${id_descuento}`,
      descuento,
      getAuthHeaders()
    );
    console.log('Servicio: Descuento actualizado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio actualizarDescuento:', error);
    throw error;
  }
};

// Eliminar un descuento
export const eliminarDescuento = async (id_descuento: number): Promise<{ message: string }> => {
  try {
    console.log('Servicio: Eliminando descuento ID:', id_descuento);
    const response = await axios.delete<{ message: string }>(
      `${API_URL}/${id_descuento}`,
      getAuthHeaders()
    );
    console.log('Servicio: Descuento eliminado');
    return response.data;
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
    
    const response = await axios.get<{ esUnico: boolean }>(
      `${API_URL}/validar/nombre-descuento`,
      { ...getAuthHeaders(), params }
    );
    
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
    const response = await axios.patch<{ message: string }>(
      `${API_URL}/${id_descuento}/estatus`,
      { estatusdescuento, UsuarioModifico: usuarioModifico },
      getAuthHeaders()
    );
    console.log('Servicio: Estatus de descuento cambiado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio cambiarEstatusDescuento:', error);
    throw error;
  }
};
