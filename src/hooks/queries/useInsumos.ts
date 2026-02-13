import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerInsumos,
  obtenerInsumo,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo,
} from '../../services/insumosService';
import type { InsumoCreate, InsumoUpdate } from '../../types/insumo.types';
import { invalidateInventoryRelatedQueries } from './queryInvalidation';

// Query keys
export const insumosKeys = {
  all: ['insumos'] as const,
  lists: () => [...insumosKeys.all, 'list'] as const,
  list: (idnegocio: number, filters?: Record<string, unknown>) => [...insumosKeys.lists(), idnegocio, { filters }] as const,
  details: () => [...insumosKeys.all, 'detail'] as const,
  detail: (id: number) => [...insumosKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los insumos de un negocio
 */
export const useInsumosQuery = (idnegocio: number) => {
  return useQuery({
    queryKey: insumosKeys.list(idnegocio),
    queryFn: () => obtenerInsumos(idnegocio),
    enabled: !!idnegocio,
  });
};

/**
 * Hook para obtener un insumo por ID
 */
export const useInsumoQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: insumosKeys.detail(id),
    queryFn: () => obtenerInsumo(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear un insumo
 */
export const useCrearInsumoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsumoCreate) => crearInsumo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insumosKeys.lists() });
      // Invalidar queries del dashboard que dependen de insumos
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar un insumo
 */
export const useActualizarInsumoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsumoUpdate }) => actualizarInsumo(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: insumosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: insumosKeys.detail(variables.id) });
      // Invalidar queries del dashboard que dependen de insumos
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar un insumo
 */
export const useEliminarInsumoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarInsumo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insumosKeys.lists() });
      // Invalidar queries del dashboard que dependen de insumos
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};
