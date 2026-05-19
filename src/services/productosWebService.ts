import apiClient from './api';
import type { ProductoWeb, ProductoWebCreate, ProductoWebUpdate } from '../types/productoWeb.types';
import { registrarLog } from './logService';

const API_BASE = '/productos-web';

// Obtener todos los productos web por negocio
export const obtenerProductosWeb = async (): Promise<ProductoWeb[]> => {
  try {
    console.log('🔵 productosWebService: Obteniendo productos web del negocio autenticado');
    const response = await apiClient.get<ProductoWeb[]>(`${API_BASE}`);
    console.log('🔵 productosWebService: Productos web obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('🔴 productosWebService: Error al obtener productos web:', error);
    return [];
  }
};

// Obtener un producto web por ID
export const obtenerProductoWebPorId = async (id: number): Promise<ProductoWeb | null> => {
  try {
    console.log('🔵 productosWebService: Obteniendo producto web ID:', id);
    const response = await apiClient.get<ProductoWeb>(`${API_BASE}/${id}`);
    console.log('🔵 productosWebService: Producto web obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔴 productosWebService: Error al obtener producto web:', error);
    return null;
  }
};

// Verificar si existe un producto con el mismo nombre
export const verificarNombreProducto = async (nombre: string, idnegocio: number, idProducto?: number): Promise<boolean> => {
  try {
    console.log('🔵 productosWebService: Verificando nombre de producto:', nombre);
    const response = await apiClient.get<{ existe: boolean }>(`${API_BASE}/verificar-nombre`, {
      params: { nombre, idnegocio, idProducto }
    });
    return response.data.existe;
  } catch (error) {
    console.error('🔴 productosWebService: Error al verificar nombre:', error);
    return false;
  }
};

// Crear nuevo producto web
export const crearProductoWeb = async (producto: ProductoWebCreate): Promise<ProductoWeb> => {
  try {
    console.log('🔵 productosWebService: Creando producto web:', producto);
    const response = await apiClient.post<{ success: boolean; data: ProductoWeb; mensaje: string }>(API_BASE, producto);
    console.log('🔵 productosWebService: Producto web creado exitosamente');
    if (response.data.success && response.data.data) {
      registrarLog('Configuración Negocio', 'Productos', 'CREATE', { tabla_afectada: 'tblposcrumenwebproductos', idregistro: response.data.data.idProducto });
      return response.data.data;
    }
    throw new Error(response.data.mensaje || 'Error al crear producto');
  } catch (error: any) {
    console.error('🔴 productosWebService: Error al crear producto web:', error);
    const errorMessage = error.response?.data?.mensaje || error.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
};

// Actualizar producto web
export const actualizarProductoWeb = async (id: number, producto: ProductoWebUpdate): Promise<ProductoWeb> => {
  try {
    console.log('🔵 productosWebService: Actualizando producto web ID:', id);
    const response = await apiClient.put<{ success: boolean; data: ProductoWeb; mensaje: string }>(`${API_BASE}/${id}`, producto);
    console.log('🔵 productosWebService: Producto web actualizado exitosamente');
    if (response.data.success && response.data.data) {
      registrarLog('Configuración Negocio', 'Productos', 'UPDATE', { tabla_afectada: 'tblposcrumenwebproductos', idregistro: id });
      return response.data.data;
    }
    throw new Error(response.data.mensaje || 'Error al actualizar producto');
  } catch (error: any) {
    console.error('🔴 productosWebService: Error al actualizar producto web:', error);
    const errorMessage = error.response?.data?.mensaje || error.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
};

// Eliminar producto web (soft delete)
export const eliminarProductoWeb = async (id: number): Promise<number> => {
  try {
    console.log('🔵 productosWebService: Eliminando producto web ID:', id);
    await apiClient.delete(`${API_BASE}/${id}`);
    console.log('🔵 productosWebService: Producto web eliminado exitosamente');
    registrarLog('Configuración Negocio', 'Productos', 'DELETE', { tabla_afectada: 'tblposcrumenwebproductos', idregistro: id });
    return id;
  } catch (error) {
    console.error('🔴 productosWebService: Error al eliminar producto web:', error);
    throw error;
  }
};
