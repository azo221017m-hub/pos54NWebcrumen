import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerSubrecetas,
  obtenerSubrecetaPorId,
  crearSubreceta,
  actualizarSubreceta,
  eliminarSubreceta,
} from '../../services/subrecetasService';
import type { SubrecetaCreate, SubrecetaUpdate } from '../../types/subreceta.types';

// Query keys
export const subrecetasKeys = {
  all: ['subrecetas'] as const,
  lists: () => [...subrecetasKeys.all, 'list'] as const,
  list: (idnegocio: number, filters?: Record<string, unknown>) => [...subrecetasKeys.lists(), idnegocio, { filters }] as const,
  details: () => [...subrecetasKeys.all, 'detail'] as const,
  detail: (id: number) => [...subrecetasKeys.details(), id] as const,
};

/**
 * Hook para obtener todas las subrecetas de un negocio
 */
export const useSubrecetasQuery = (idnegocio: number) => {
  return useQuery({
    queryKey: subrecetasKeys.list(idnegocio),
    queryFn: () => obtenerSubrecetas(idnegocio),
    enabled: !!idnegocio,
  });
};

/**
 * Hook para obtener una subreceta por ID
 */
export const useSubrecetaQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: subrecetasKeys.detail(id),
    queryFn: () => obtenerSubrecetaPorId(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear una subreceta
 */
export const useCrearSubrecetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubrecetaCreate) => crearSubreceta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subrecetasKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar una subreceta
 */
export const useActualizarSubrecetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubrecetaUpdate }) => actualizarSubreceta(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subrecetasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subrecetasKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar una subreceta
 */
export const useEliminarSubrecetaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarSubreceta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subrecetasKeys.lists() });
    },
  });
};
