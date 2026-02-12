import { useQuery } from '@tanstack/react-query';
import { verificarTurnoAbierto } from '../../services/turnosService';
import { obtenerResumenVentas, obtenerSaludNegocio } from '../../services/ventasWebService';
import { obtenerDetallesPagos } from '../../services/pagosService';

// Constants
const RESUMEN_VENTAS_REFRESH_INTERVAL = 30000; // 30 segundos

// Query keys
export const turnosKeys = {
  all: ['turnos'] as const,
  verifyOpen: () => [...turnosKeys.all, 'verify-open'] as const,
};

export const resumenVentasKeys = {
  all: ['resumenVentas'] as const,
  summary: () => [...resumenVentasKeys.all, 'summary'] as const,
};

export const saludNegocioKeys = {
  all: ['saludNegocio'] as const,
  health: () => [...saludNegocioKeys.all, 'health'] as const,
};

export const pagosKeys = {
  all: ['pagos'] as const,
  details: () => [...pagosKeys.all, 'details'] as const,
  detail: (folioventa: string) => [...pagosKeys.details(), folioventa] as const,
};

/**
 * Hook para verificar si hay un turno abierto
 */
export const useTurnoAbiertoQuery = () => {
  return useQuery({
    queryKey: turnosKeys.verifyOpen(),
    queryFn: verificarTurnoAbierto,
  });
};

/**
 * Hook para obtener el resumen de ventas del turno actual
 */
export const useResumenVentasQuery = () => {
  return useQuery({
    queryKey: resumenVentasKeys.summary(),
    queryFn: obtenerResumenVentas,
    // Refetch cada 30 segundos para mantener datos actualizados
    refetchInterval: RESUMEN_VENTAS_REFRESH_INTERVAL,
  });
};

/**
 * Hook para obtener la salud del negocio
 */
export const useSaludNegocioQuery = () => {
  return useQuery({
    queryKey: saludNegocioKeys.health(),
    queryFn: obtenerSaludNegocio,
  });
};

/**
 * Hook para obtener los detalles de pagos de un folio específico
 */
export const useDetallesPagosQuery = (folioventa: string, enabled = true) => {
  return useQuery({
    queryKey: pagosKeys.detail(folioventa),
    queryFn: () => obtenerDetallesPagos(folioventa),
    enabled: enabled && !!folioventa,
  });
};
