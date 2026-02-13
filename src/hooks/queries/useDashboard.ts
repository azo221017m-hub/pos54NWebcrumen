import { useQuery } from '@tanstack/react-query';
import { verificarTurnoAbierto } from '../../services/turnosService';
import { obtenerResumenVentas, obtenerSaludNegocio } from '../../services/ventasWebService';
import { obtenerDetallesPagos } from '../../services/pagosService';

// Import turnosKeys from useTurnos to avoid duplication
import { turnosKeys } from './useTurnos';

// Constants - Intervalos de actualización automática para dashboards e indicadores
const RESUMEN_VENTAS_REFRESH_INTERVAL = 30000; // 30 segundos
const TURNO_ABIERTO_REFRESH_INTERVAL = 60000; // 60 segundos - verificar estado del turno
const SALUD_NEGOCIO_REFRESH_INTERVAL = 45000; // 45 segundos - métricas de salud del negocio

// Query keys
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
 * Con actualización automática cada 60 segundos
 */
export const useTurnoAbiertoQuery = () => {
  return useQuery({
    queryKey: turnosKeys.verifyOpen(),
    queryFn: verificarTurnoAbierto,
    // Verificar estado del turno automáticamente cada minuto
    refetchInterval: TURNO_ABIERTO_REFRESH_INTERVAL,
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
 * Con actualización automática cada 45 segundos
 */
export const useSaludNegocioQuery = () => {
  return useQuery({
    queryKey: saludNegocioKeys.health(),
    queryFn: obtenerSaludNegocio,
    // Actualizar métricas de salud del negocio cada 45 segundos
    refetchInterval: SALUD_NEGOCIO_REFRESH_INTERVAL,
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
