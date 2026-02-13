import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from '../../services/clientesService';
import type { ClienteCreate, ClienteUpdate } from '../../types/cliente.types';
import { invalidateSalesRelatedQueries } from './queryInvalidation';

// Query keys
export const clientesKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...clientesKeys.lists(), { filters }] as const,
  details: () => [...clientesKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientesKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los clientes
 */
export const useClientesQuery = () => {
  return useQuery({
    queryKey: clientesKeys.lists(),
    queryFn: obtenerClientes,
  });
};

/**
 * Hook para obtener un cliente por ID
 */
export const useClienteQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: clientesKeys.detail(id),
    queryFn: () => obtenerCliente(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear un cliente
 */
export const useCrearClienteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteCreate) => crearCliente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
      // Invalidar queries del dashboard que dependen de clientes
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para actualizar un cliente
 */
export const useActualizarClienteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteUpdate }) => actualizarCliente(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientesKeys.detail(variables.id) });
      // Invalidar queries del dashboard que dependen de clientes
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};

/**
 * Hook para eliminar un cliente
 */
export const useEliminarClienteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
      // Invalidar queries del dashboard que dependen de clientes
      invalidateSalesRelatedQueries(queryClient);
    },
  });
};
