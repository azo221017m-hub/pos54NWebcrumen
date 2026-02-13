import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerMesas,
  obtenerMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
} from '../../services/mesasService';
import type { MesaCreate, MesaUpdate } from '../../types/mesa.types';
import { invalidateSalesRelatedQueries } from './queryInvalidation';

// Query keys
export const mesasKeys = {
  all: ['mesas'] as const,
  lists: () => [...mesasKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...mesasKeys.lists(), { filters }] as const,
  details: () => [...mesasKeys.all, 'detail'] as const,
  detail: (id: number) => [...mesasKeys.details(), id] as const,
};

/**
 * Hook para obtener todas las mesas
 */
export const useMesasQuery = () => {
  return useQuery({
    queryKey: mesasKeys.lists(),
    queryFn: obtenerMesas,
  });
};

/**
 * Hook para obtener una mesa por ID
 */
export const useMesaQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: mesasKeys.detail(id),
    queryFn: () => obtenerMesaPorId(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear una mesa
 */
export const useCrearMesaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MesaCreate) => crearMesa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mesasKeys.lists() });
      // Invalidar queries del dashboard que dependen de mesas
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar una mesa
 */
export const useActualizarMesaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MesaUpdate }) => actualizarMesa(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: mesasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mesasKeys.detail(variables.id) });
      // Invalidar queries del dashboard que dependen de mesas
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar una mesa
 */
export const useEliminarMesaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarMesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mesasKeys.lists() });
      // Invalidar queries del dashboard que dependen de mesas
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};
