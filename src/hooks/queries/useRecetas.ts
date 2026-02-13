import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerRecetas,
  obtenerRecetaPorId,
  crearReceta,
  actualizarReceta,
  eliminarReceta,
} from '../../services/recetasService';
import type { RecetaCreate, RecetaUpdate } from '../../types/receta.types';
import { invalidateInventoryRelatedQueries } from './queryInvalidation';

// Query keys
export const recetasKeys = {
  all: ['recetas'] as const,
  lists: () => [...recetasKeys.all, 'list'] as const,
  list: (idnegocio: number, filters?: Record<string, unknown>) => [...recetasKeys.lists(), idnegocio, { filters }] as const,
  details: () => [...recetasKeys.all, 'detail'] as const,
  detail: (id: number) => [...recetasKeys.details(), id] as const,
};

/**
 * Hook para obtener todas las recetas de un negocio
 */
export const useRecetasQuery = (idnegocio: number) => {
  return useQuery({
    queryKey: recetasKeys.list(idnegocio),
    queryFn: () => obtenerRecetas(idnegocio),
    enabled: !!idnegocio,
  });
};

/**
 * Hook para obtener una receta por ID
 */
export const useRecetaQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: recetasKeys.detail(id),
    queryFn: () => obtenerRecetaPorId(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear una receta
 */
export const useCrearRecetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecetaCreate) => crearReceta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recetasKeys.lists() });
      // Invalidar queries del dashboard que dependen de recetas
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar una receta
 */
export const useActualizarRecetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecetaUpdate }) => actualizarReceta(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recetasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recetasKeys.detail(variables.id) });
      // Invalidar queries del dashboard que dependen de recetas
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar una receta
 */
export const useEliminarRecetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarReceta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recetasKeys.lists() });
      // Invalidar queries del dashboard que dependen de recetas
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};
