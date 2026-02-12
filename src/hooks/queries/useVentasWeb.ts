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

// Query keys
export const ventasWebKeys = {
  all: ['ventasWeb'] as const,
  lists: () => [...ventasWebKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...ventasWebKeys.lists(), { filters }] as const,
  details: () => [...ventasWebKeys.all, 'detail'] as const,
  detail: (id: number) => [...ventasWebKeys.details(), id] as const,
};

/**
 * Hook para obtener todas las ventas web
 */
export const useVentasWebQuery = () => {
  return useQuery({
    queryKey: ventasWebKeys.lists(),
    queryFn: obtenerVentasWeb,
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
      // Invalidar la lista de ventas web para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
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
      // Invalidar la lista y el detalle específico
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.detail(variables.id) });
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
      // Invalidar la lista de ventas web
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
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
      // Invalidar la lista y el detalle específico
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.detail(variables.idventa) });
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
      // Invalidar toda la lista de ventas web
      queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
    },
  });
};
