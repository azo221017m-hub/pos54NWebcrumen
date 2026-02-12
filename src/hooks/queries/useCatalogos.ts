import { useQuery } from '@tanstack/react-query';
import { obtenerProductosWeb } from '../../services/productosWebService';
import { obtenerCategorias } from '../../services/categoriasService';
import { obtenerModeradores } from '../../services/moderadoresService';
import { obtenerModeradoresRef } from '../../services/moderadoresRefService';

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
