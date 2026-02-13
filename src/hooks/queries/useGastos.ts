import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  obtenerGastos, 
  crearGasto, 
  actualizarGasto, 
  eliminarGasto,
  obtenerGastoPorId 
} from '../../services/gastosService';
import type { GastoCreate, GastoUpdate } from '../../types/gastos.types';

// Query keys
export const gastosKeys = {
  all: ['gastos'] as const,
  lists: () => [...gastosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...gastosKeys.lists(), { filters }] as const,
  details: () => [...gastosKeys.all, 'detail'] as const,
  detail: (id: number) => [...gastosKeys.details(), id] as const,
};

// Constants - Automatic refresh interval for expenses list
const GASTOS_REFRESH_INTERVAL = 45000; // 45 seconds

/**
 * Hook para obtener todos los gastos
 * Con actualización automática cada 45 segundos
 */
export const useGastosQuery = () => {
  return useQuery({
    queryKey: gastosKeys.lists(),
    queryFn: obtenerGastos,
    // Actualizar lista de gastos automáticamente cada 45 segundos
    refetchInterval: GASTOS_REFRESH_INTERVAL,
  });
};

/**
 * Hook para obtener un gasto específico por ID
 */
export const useGastoQuery = (id: number) => {
  return useQuery({
    queryKey: gastosKeys.detail(id),
    queryFn: () => obtenerGastoPorId(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear un nuevo gasto
 */
export const useCrearGastoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GastoCreate) => crearGasto(data),
    onSuccess: () => {
      // Invalidar la lista de gastos para refrescar los datos
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      // Invalidar también las queries del dashboard que dependen de gastos
      queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });
    },
  });
};

/**
 * Hook para actualizar un gasto existente
 */
export const useActualizarGastoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GastoUpdate }) => actualizarGasto(id, data),
    onSuccess: (_, variables) => {
      // Invalidar la lista y el detalle específico
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gastosKeys.detail(variables.id) });
      // Invalidar también las queries del dashboard que dependen de gastos
      queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });
    },
  });
};

/**
 * Hook para eliminar un gasto
 */
export const useEliminarGastoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eliminarGasto(id),
    onSuccess: () => {
      // Invalidar la lista de gastos
      queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
      // Invalidar también las queries del dashboard que dependen de gastos
      queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });
    },
  });
};
