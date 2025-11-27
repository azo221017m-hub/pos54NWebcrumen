import axios from 'axios';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria.types';

const API_BASE = '/api/categorias';

// Función para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Obtener todas las categorías por negocio
export const obtenerCategorias = async (idnegocio: number): Promise<Categoria[]> => {
  try {
    console.log('🔵 categoriasService: Obteniendo categorías para negocio:', idnegocio);
    const response = await axios.get<Categoria[]>(
      `${API_BASE}/negocio/${idnegocio}`,
      getAuthHeaders()
    );
    console.log('🔵 categoriasService: Categorías obtenidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('🔴 categoriasService: Error al obtener categorías:', error);
    return [];
  }
};

// Obtener una categoría por ID
export const obtenerCategoriaPorId = async (id: number): Promise<Categoria | null> => {
  try {
    console.log('🔵 categoriasService: Obteniendo categoría ID:', id);
    const response = await axios.get<Categoria>(
      `${API_BASE}/${id}`,
      getAuthHeaders()
    );
    console.log('🔵 categoriasService: Categoría obtenida:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔴 categoriasService: Error al obtener categoría:', error);
    return null;
  }
};

// Crear nueva categoría
export const crearCategoria = async (categoria: CategoriaCreate): Promise<{ success: boolean; idCategoria?: number }> => {
  try {
    console.log('🔵 categoriasService: Creando categoría:', categoria);
    const response = await axios.post(
      API_BASE,
      categoria,
      getAuthHeaders()
    );
    console.log('🔵 categoriasService: Categoría creada exitosamente');
    return { success: true, idCategoria: response.data.idCategoria };
  } catch (error) {
    console.error('🔴 categoriasService: Error al crear categoría:', error);
    return { success: false };
  }
};

// Actualizar categoría
export const actualizarCategoria = async (id: number, categoria: CategoriaUpdate): Promise<boolean> => {
  try {
    console.log('🔵 categoriasService: Actualizando categoría ID:', id);
    await axios.put(
      `${API_BASE}/${id}`,
      categoria,
      getAuthHeaders()
    );
    console.log('🔵 categoriasService: Categoría actualizada exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 categoriasService: Error al actualizar categoría:', error);
    return false;
  }
};

// Eliminar categoría (soft delete)
export const eliminarCategoria = async (id: number): Promise<boolean> => {
  try {
    console.log('🔵 categoriasService: Eliminando categoría ID:', id);
    await axios.delete(
      `${API_BASE}/${id}`,
      getAuthHeaders()
    );
    console.log('🔵 categoriasService: Categoría eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('🔴 categoriasService: Error al eliminar categoría:', error);
    return false;
  }
};
