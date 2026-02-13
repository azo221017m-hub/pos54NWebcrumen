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
import { turnosKeys, dashboardKeys } from '../../config/queryKeys';

/**
 * Hook para obtener todos los turnos
 * Actualización automática mediante WebSocket (sin polling)
 */
export const useTurnosQuery = () => {
  return useQuery({
    queryKey: turnosKeys.lists(),
    queryFn: obtenerTurnos,
    // NO usar refetchInterval - las actualizaciones vienen por WebSocket
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
      // Las queries se invalidarán automáticamente por WebSocket
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: turnosKeys.abierto() });
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
      // Las queries se invalidarán automáticamente por WebSocket
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: turnosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: turnosKeys.abierto() });
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
      // Las queries se invalidarán automáticamente por WebSocket
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: turnosKeys.abierto() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
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
      // Las queries se invalidarán automáticamente por WebSocket
      queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
    },
  });
};
