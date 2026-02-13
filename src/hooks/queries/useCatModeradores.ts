import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerCatModeradores,
  obtenerCatModeradorPorId,
  crearCatModerador,
  actualizarCatModerador,
  eliminarCatModerador,
} from '../../services/catModeradoresService';
import type { CatModeradorCreate, CatModeradorUpdate } from '../../types/catModerador.types';
import { invalidateSalesRelatedQueries } from './queryInvalidation';

// Query keys
export const catModeradoresKeys = {
  all: ['catModeradores'] as const,
  lists: () => [...catModeradoresKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...catModeradoresKeys.lists(), { filters }] as const,
  details: () => [...catModeradoresKeys.all, 'detail'] as const,
  detail: (id: number) => [...catModeradoresKeys.details(), id] as const,
};

/**
 * Hook para obtener todas las categorías de moderadores
 */
export const useCatModeradoresQuery = () => {
  return useQuery({
    queryKey: catModeradoresKeys.lists(),
    queryFn: obtenerCatModeradores,
  });
};

/**
 * Hook para obtener una categoría de moderador por ID
 */
export const useCatModeradorQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: catModeradoresKeys.detail(id),
    queryFn: () => obtenerCatModeradorPorId(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear una categoría de moderador
 */
export const useCrearCatModeradorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CatModeradorCreate) => crearCatModerador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catModeradoresKeys.lists() });
      // Invalidar queries del dashboard que dependen de moderadores
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar una categoría de moderador
 */
export const useActualizarCatModeradorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CatModeradorUpdate) => actualizarCatModerador(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catModeradoresKeys.lists() });
      if (data.idmodref) {
        queryClient.invalidateQueries({ queryKey: catModeradoresKeys.detail(data.idmodref) });
      }
      // Invalidar queries del dashboard que dependen de moderadores
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar una categoría de moderador
 */
export const useEliminarCatModeradorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarCatModerador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catModeradoresKeys.lists() });
      // Invalidar queries del dashboard que dependen de moderadores
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};
