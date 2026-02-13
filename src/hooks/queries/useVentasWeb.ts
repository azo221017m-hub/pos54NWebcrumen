import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  obtenerVentasWeb, 
  obtenerVentaWebPorId,
  crearVentaWeb, 
  actualizarVentaWeb, 
  cancelarVentaWeb,
  agregarDetallesAVenta,
  actualizarEstadoDetalle
} from '../../services/ventasWebService';
import type { VentaWebCreate, VentaWebUpdate, EstadoDetalle } from '../../types/ventasWeb.types';
import { ventasWebKeys, dashboardKeys } from '../../config/queryKeys';

/**
 * Hook para obtener todas las ventas web
 * Actualización automática mediante WebSocket (sin polling)
 */
export const useVentasWebQuery = () => {
  return useQuery({
    queryKey: ventasWebKeys.lists(),
    queryFn: obtenerVentasWeb,
    // NO usar refetchInterval - las actualizaciones vienen por WebSocket
  });
};

/**
 * Hook para obtener una venta web específica por ID
 */
export const useVentaWebQuery = (id: number | null) => {
  return useQuery({
    queryKey: ventasWebKeys.detail(id!),
    queryFn: () => obtenerVentaWebPorId(id!),
    enabled: !!id,
  });
};

/**
 * Hook para crear una nueva venta web
 */
export const useCrearVentaWebMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VentaWebCreate) => crearVentaWeb(data),
    onSuccess: () => {
      // Las queries se invalidarán automáticamente por WebSocket
      // No es necesario invalidar manualmente aquí
      // Pero lo dejamos como fallback por si WebSocket falla
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    },
  });
};

/**
 * Hook para actualizar una venta web existente
 */
export const useActualizarVentaWebMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VentaWebUpdate }) => actualizarVentaWeb(id, data),
    onSuccess: (_, variables) => {
      // Las queries se invalidarán automáticamente por WebSocket
      // Esto es solo un fallback
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    },
  });
};

/**
 * Hook para cancelar una venta web
 */
export const useCancelarVentaWebMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelarVentaWeb(id),
    onSuccess: () => {
      // Las queries se invalidarán automáticamente por WebSocket
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    },
  });
};

/**
 * Hook para agregar detalles a una venta web
 */
export const useAgregarDetallesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      idventa, 
      detalles, 
      estadodetalle 
    }: { 
      idventa: number; 
      detalles: Array<{
        idproducto: number;
        nombreproducto: string;
        idreceta?: number | null;
        tipoproducto?: string;
        cantidad: number;
        preciounitario: number;
        costounitario: number;
        observaciones?: string | null;
        moderadores?: string | null;
      }>; 
      estadodetalle: EstadoDetalle;
    }) => agregarDetallesAVenta(idventa, detalles, estadodetalle),
    onSuccess: (_, variables) => {
      // Las queries se invalidarán automáticamente por WebSocket
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.detail(variables.idventa) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    },
  });
};

/**
 * Hook para actualizar el estado de un detalle de venta
 */
export const useActualizarEstadoDetalleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      idVenta, 
      idDetalle, 
      estadodetalle 
    }: { 
      idVenta: number; 
      idDetalle: number; 
      estadodetalle: EstadoDetalle;
    }) => actualizarEstadoDetalle(idVenta, idDetalle, estadodetalle),
    onSuccess: () => {
      // Las queries se invalidarán automáticamente por WebSocket
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
    },
  });
};
