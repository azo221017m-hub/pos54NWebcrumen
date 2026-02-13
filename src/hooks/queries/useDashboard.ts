import { useQuery } from '@tanstack/react-query';
import { verificarTurnoAbierto } from '../../services/turnosService';
import { obtenerResumenVentas, obtenerSaludNegocio } from '../../services/ventasWebService';
import { obtenerDetallesPagos } from '../../services/pagosService';
import { dashboardKeys, turnosKeys, pagosKeys } from '../../config/queryKeys';

/**
 * Hook para verificar si hay un turno abierto
 * Actualización automática mediante WebSocket (sin polling)
 */
export const useTurnoAbiertoQuery = () => {
  return useQuery({
    queryKey: turnosKeys.abierto(),
    queryFn: verificarTurnoAbierto,
    // NO usar refetchInterval - las actualizaciones vienen por WebSocket
  });
};

/**
 * Hook para obtener el resumen de ventas del turno actual
 * Actualización automática mediante WebSocket (sin polling)
 */
export const useResumenVentasQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.resumenVentas(),
    queryFn: obtenerResumenVentas,
    // NO usar refetchInterval - las actualizaciones vienen por WebSocket
  });
};

/**
 * Hook para obtener la salud del negocio
 * Actualización automática mediante WebSocket (sin polling)
 */
export const useSaludNegocioQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.saludNegocio(),
    queryFn: obtenerSaludNegocio,
    // NO usar refetchInterval - las actualizaciones vienen por WebSocket
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
