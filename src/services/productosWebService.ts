import apiClient from './api';
import type { ProductoWeb, ProductoWebCreate, ProductoWebUpdate } from '../types/productoWeb.types';

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
export const crearProductoWeb = async (producto: ProductoWebCreate): Promise<{ success: boolean; idProducto?: number; message?: string }> => {
  try {
    console.log('🔵 productosWebService: Creando producto web:', producto);
    const response = await apiClient.post(API_BASE, producto);
    console.log('🔵 productosWebService: Producto web creado exitosamente');
    return { success: true, idProducto: response.data.idProducto };
  } catch (error) {
    console.error('🔴 productosWebService: Error al crear producto web:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: errorMessage };
  }
};

// Actualizar producto web
export const actualizarProductoWeb = async (id: number, producto: ProductoWebUpdate): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log('🔵 productosWebService: Actualizando producto web ID:', id);
    await apiClient.put(`${API_BASE}/${id}`, producto);
    console.log('🔵 productosWebService: Producto web actualizado exitosamente');
    return { success: true };
  } catch (error) {
    console.error('🔴 productosWebService: Error al actualizar producto web:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: errorMessage };
  }
};

// Eliminar producto web (soft delete)
export const eliminarProductoWeb = async (id: number): Promise<boolean> => {
  try {
    console.log('🔵 productosWebService: Eliminando producto web ID:', id);
    await apiClient.delete(`${API_BASE}/${id}`);
    console.log('🔵 productosWebService: Producto web eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 productosWebService: Error al eliminar producto web:', error);
    return false;
  }
};
