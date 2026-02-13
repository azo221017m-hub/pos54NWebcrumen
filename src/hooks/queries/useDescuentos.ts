import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerDescuentos,
  obtenerDescuentoPorId,
  crearDescuento,
  actualizarDescuento,
  eliminarDescuento,
} from '../../services/descuentosService';
import type { DescuentoCreate, DescuentoUpdate } from '../../types/descuento.types';
import { invalidateSalesRelatedQueries } from './queryInvalidation';

// Query keys
export const descuentosKeys = {
  all: ['descuentos'] as const,
  lists: () => [...descuentosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...descuentosKeys.lists(), { filters }] as const,
  details: () => [...descuentosKeys.all, 'detail'] as const,
  detail: (id: number) => [...descuentosKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los descuentos
 */
export const useDescuentosQuery = () => {
  return useQuery({
    queryKey: descuentosKeys.lists(),
    queryFn: obtenerDescuentos,
  });
};

/**
 * Hook para obtener un descuento por ID
 */
export const useDescuentoQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: descuentosKeys.detail(id),
    queryFn: () => obtenerDescuentoPorId(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear un descuento
 */
export const useCrearDescuentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DescuentoCreate) => crearDescuento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: descuentosKeys.lists() });
      // Invalidar queries del dashboard que dependen de descuentos
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar un descuento
 */
export const useActualizarDescuentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DescuentoUpdate }) => actualizarDescuento(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: descuentosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: descuentosKeys.detail(variables.id) });
      // Invalidar queries del dashboard que dependen de descuentos
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar un descuento
 */
export const useEliminarDescuentoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarDescuento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: descuentosKeys.lists() });
      // Invalidar queries del dashboard que dependen de descuentos
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};
