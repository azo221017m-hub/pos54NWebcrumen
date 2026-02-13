import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  obtenerProductosWeb, 
  crearProductoWeb, 
  actualizarProductoWeb, 
  eliminarProductoWeb 
} from '../../services/productosWebService';
import { 
  obtenerCategorias, 
  crearCategoria, 
  actualizarCategoria, 
  eliminarCategoria 
} from '../../services/categoriasService';
import { 
  obtenerModeradores, 
  crearModerador, 
  actualizarModerador, 
  eliminarModerador 
} from '../../services/moderadoresService';
import { obtenerModeradoresRef } from '../../services/moderadoresRefService';
import type { ProductoWebCreate, ProductoWebUpdate } from '../../types/productoWeb.types';
import type { CategoriaCreate, CategoriaUpdate } from '../../types/categoria.types';
import type { ModeradorCreate, ModeradorUpdate } from '../../types/moderador.types';
import { invalidateSalesRelatedQueries } from './queryInvalidation';

// Query keys for productos
export const productosWebKeys = {
  all: ['productosWeb'] as const,
  lists: () => [...productosWebKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...productosWebKeys.lists(), { filters }] as const,
};

// Query keys for categorias
export const categoriasKeys = {
  all: ['categorias'] as const,
  lists: () => [...categoriasKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...categoriasKeys.lists(), { filters }] as const,
};

// Query keys for moderadores
export const moderadoresKeys = {
  all: ['moderadores'] as const,
  lists: () => [...moderadoresKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...moderadoresKeys.lists(), { filters }] as const,
};

// Query keys for moderadores ref
export const moderadoresRefKeys = {
  all: ['moderadoresRef'] as const,
  lists: () => [...moderadoresRefKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...moderadoresRefKeys.lists(), { filters }] as const,
};

/**
 * Hook para obtener todos los productos web
 */
export const useProductosWebQuery = () => {
  return useQuery({
    queryKey: productosWebKeys.lists(),
    queryFn: obtenerProductosWeb,
  });
};

/**
 * Hook para obtener todas las categorías
 */
export const useCategoriasQuery = () => {
  return useQuery({
    queryKey: categoriasKeys.lists(),
    queryFn: obtenerCategorias,
  });
};

/**
 * Hook para obtener todos los moderadores
 * @param idnegocio - ID del negocio (obtenido del usuario autenticado)
 */
export const useModeradoresQuery = (idnegocio: number) => {
  return useQuery({
    queryKey: [...moderadoresKeys.lists(), idnegocio],
    queryFn: () => obtenerModeradores(idnegocio),
    enabled: !!idnegocio,
  });
};

/**
 * Hook para obtener todos los moderadores ref (categorías de moderadores)
 * @param idnegocio - ID del negocio (obtenido del usuario autenticado)
 */
export const useModeradoresRefQuery = (idnegocio: number) => {
  return useQuery({
    queryKey: [...moderadoresRefKeys.lists(), idnegocio],
    queryFn: () => obtenerModeradoresRef(idnegocio),
    enabled: !!idnegocio,
  });
};

// ========== MUTATIONS ==========

/**
 * Hook para crear un producto web
 */
export const useCrearProductoWebMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductoWebCreate) => crearProductoWeb(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosWebKeys.lists() });
      // Invalidar queries del dashboard que dependen de productos
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar un producto web
 */
export const useActualizarProductoWebMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoWebUpdate }) => actualizarProductoWeb(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosWebKeys.lists() });
      // Invalidar queries del dashboard que dependen de productos
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar un producto web
 */
export const useEliminarProductoWebMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarProductoWeb(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosWebKeys.lists() });
      // Invalidar queries del dashboard que dependen de productos
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para crear una categoría
 */
export const useCrearCategoriaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriaCreate) => crearCategoria(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() });
      // Invalidar queries del dashboard que dependen de categorías
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar una categoría
 */
export const useActualizarCategoriaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) => actualizarCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() });
      // Invalidar queries del dashboard que dependen de categorías
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar una categoría
 */
export const useEliminarCategoriaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() });
      // Invalidar queries del dashboard que dependen de categorías
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para crear un moderador
 */
export const useCrearModeradorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ModeradorCreate) => crearModerador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderadoresKeys.lists() });
      // Invalidar queries del dashboard que dependen de moderadores
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar un moderador
 */
export const useActualizarModeradorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModeradorUpdate }) => actualizarModerador(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderadoresKeys.lists() });
      // Invalidar queries del dashboard que dependen de moderadores
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar un moderador
 */
export const useEliminarModeradorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarModerador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderadoresKeys.lists() });
      // Invalidar queries del dashboard que dependen de moderadores
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};
