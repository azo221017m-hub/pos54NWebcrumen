import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  cerrarTurnoActual,
} from '../../services/turnosService';
import type { TurnoUpdate } from '../../types/turno.types';

// Query keys - reuse from useDashboard but export for use in mutations
export const turnosKeys = {
  all: ['turnos'] as const,
  lists: () => [...turnosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...turnosKeys.lists(), { filters }] as const,
  details: () => [...turnosKeys.all, 'detail'] as const,
  detail: (id: number) => [...turnosKeys.details(), id] as const,
  verifyOpen: () => [...turnosKeys.all, 'verify-open'] as const,
};

// Constants - Automatic refresh interval for shifts list
const TURNOS_REFRESH_INTERVAL = 60000; // 60 seconds - shifts are operational data

/**
 * Hook para obtener todos los turnos
 * Con actualización automática cada 60 segundos (turnos son datos operacionales)
 */
export const useTurnosQuery = () => {
  return useQuery({
    queryKey: turnosKeys.lists(),
    queryFn: obtenerTurnos,
    // Actualizar lista de turnos automáticamente cada minuto
    refetchInterval: TURNOS_REFRESH_INTERVAL,
  });
};

/**
 * Hook para obtener un turno por ID
 */
export const useTurnoQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: turnosKeys.detail(id),
    queryFn: () => obtenerTurnoPorId(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook para crear un turno (iniciar turno)
 */
export const useCrearTurnoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ metaturno, fondoCaja }: { metaturno?: number | null; fondoCaja?: number | null }) => 
      crearTurno(metaturno, fondoCaja),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: turnosKeys.verifyOpen() });
    },
  });
};

/**
 * Hook para actualizar un turno
 */
export const useActualizarTurnoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TurnoUpdate }) => actualizarTurno(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: turnosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: turnosKeys.verifyOpen() });
    },
  });
};

/**
 * Hook para cerrar el turno actual
 */
export const useCerrarTurnoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datosFormulario?: any) => cerrarTurnoActual(datosFormulario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: turnosKeys.verifyOpen() });
      // Invalidar también las queries del dashboard al cerrar turno
      queryClient.invalidateQueries({ queryKey: ['resumenVentas'] });
      queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });
    },
  });
};

/**
 * Hook para eliminar un turno
 */
export const useEliminarTurnoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
    },
  });
};
