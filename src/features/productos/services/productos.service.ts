import { api } from '../../../services/api';
import config from '../../../config/api.config';
import type { Producto, CreateProductoDto, UpdateProductoDto } from '../types';
import type { ApiResponse } from '../../../types/global';

/**
 * Servicio para gestionar productos
 */
export const productosService = {
  /**
   * Obtener lista de productos
   */
  async getAll(params?: { search?: string; page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<Producto[]>>(
      config.endpoints.productos.list,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener un producto por ID
   */
  async getById(id: number) {
    const response = await api.get<ApiResponse<Producto>>(
      `${config.endpoints.productos.list}/${id}`
    );
    return response.data;
  },

  /**
   * Crear nuevo producto
   */
  async create(data: CreateProductoDto) {
    const response = await api.post<ApiResponse<Producto>>(
      config.endpoints.productos.create,
      data
    );
    return response.data;
  },

  /**
   * Actualizar producto
   */
  async update(id: number, data: Partial<UpdateProductoDto>) {
    const response = await api.put<ApiResponse<Producto>>(
      config.endpoints.productos.update(id),
      data
    );
    return response.data;
  },

  /**
   * Eliminar producto
   */
  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      config.endpoints.productos.delete(id)
    );
    return response.data;
  },
};

export default productosService;
