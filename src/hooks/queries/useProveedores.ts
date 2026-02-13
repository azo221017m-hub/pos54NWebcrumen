import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from '../../services/proveedoresService';
import type { ProveedorCreate, ProveedorUpdate } from '../../types/proveedor.types';
import { invalidateInventoryRelatedQueries } from './queryInvalidation';

// Query keys
export const proveedoresKeys = {
  all: ['proveedores'] as const,
  lists: () => [...proveedoresKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...proveedoresKeys.lists(), { filters }] as const,
  details: () => [...proveedoresKeys.all, 'detail'] as const,
  detail: (id: number) => [...proveedoresKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los proveedores
 */
export const useProveedoresQuery = () => {
  return useQuery({
    queryKey: proveedoresKeys.lists(),
    queryFn: obtenerProveedores,
  });
};

/**
 * Hook para obtener un proveedor por ID
 */
export const useProveedorQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: proveedoresKeys.detail(id),
    queryFn: () => obtenerProveedor(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear un proveedor
 */
export const useCrearProveedorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProveedorCreate) => crearProveedor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.lists() });
      // Invalidar queries del dashboard que dependen de proveedores
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar un proveedor
 */
export const useActualizarProveedorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProveedorUpdate }) => actualizarProveedor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.detail(variables.id) });
      // Invalidar queries del dashboard que dependen de proveedores
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar un proveedor
 */
export const useEliminarProveedorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarProveedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proveedoresKeys.lists() });
      // Invalidar queries del dashboard que dependen de proveedores
      invalidateInventoryRelatedQueries(queryClient);
    },
  });
};
