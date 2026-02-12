import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../../services/usuariosService';
import type { UsuarioFormData } from '../../types/usuario.types';

// Query keys
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...usuariosKeys.lists(), { filters }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: number) => [...usuariosKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los usuarios
 */
export const useUsuariosQuery = () => {
  return useQuery({
    queryKey: usuariosKeys.lists(),
    queryFn: obtenerUsuarios,
  });
};

/**
 * Hook para obtener un usuario por ID
 */
export const useUsuarioQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => obtenerUsuarioPorId(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear un usuario
 */
export const useCrearUsuarioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UsuarioFormData) => crearUsuario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un usuario
 */
export const useActualizarUsuarioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioFormData }) => actualizarUsuario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar un usuario
 */
export const useEliminarUsuarioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
};
