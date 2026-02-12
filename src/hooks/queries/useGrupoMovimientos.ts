import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerGrupoMovimientos,
  obtenerGrupoMovimiento,
  crearGrupoMovimientos,
  actualizarGrupoMovimientos,
  eliminarGrupoMovimientos,
} from '../../services/grupoMovimientosService';
import type { GrupoMovimientosCreate, GrupoMovimientosUpdate } from '../../types/grupoMovimientos.types';

// Query keys
export const grupoMovimientosKeys = {
  all: ['grupoMovimientos'] as const,
  lists: () => [...grupoMovimientosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...grupoMovimientosKeys.lists(), { filters }] as const,
  details: () => [...grupoMovimientosKeys.all, 'detail'] as const,
  detail: (id: number) => [...grupoMovimientosKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los grupos de movimientos
 */
export const useGrupoMovimientosQuery = () => {
  return useQuery({
    queryKey: grupoMovimientosKeys.lists(),
    queryFn: obtenerGrupoMovimientos,
  });
};

/**
 * Hook para obtener un grupo de movimientos por ID
 */
export const useGrupoMovimientoQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: grupoMovimientosKeys.detail(id),
    queryFn: () => obtenerGrupoMovimiento(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear un grupo de movimientos
 */
export const useCrearGrupoMovimientosMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GrupoMovimientosCreate) => crearGrupoMovimientos(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grupoMovimientosKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un grupo de movimientos
 */
export const useActualizarGrupoMovimientosMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GrupoMovimientosUpdate }) => 
      actualizarGrupoMovimientos(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: grupoMovimientosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: grupoMovimientosKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar un grupo de movimientos
 */
export const useEliminarGrupoMovimientosMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarGrupoMovimientos(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grupoMovimientosKeys.lists() });
    },
  });
};
