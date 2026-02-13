import { useMutation, useQueryClient } from '@tanstack/react-query';
import { procesarPagoSimple, procesarPagoMixto } from '../../services/pagosService';
import type { PagoSimpleRequest, PagoMixtoRequest } from '../../types/ventasWeb.types';
import { ventasWebKeys, dashboardKeys, pagosKeys } from '../../config/queryKeys';

/**
 * Hook para procesar pagos simples (EFECTIVO o TRANSFERENCIA)
 * Invalida automáticamente las queries relevantes tras un pago exitoso
 */
export const useProcesarPagoSimpleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pagoData: PagoSimpleRequest) => procesarPagoSimple(pagoData),
    onSuccess: (result) => {
      if (result.success) {
        console.log('✅ Pago simple exitoso, invalidando queries...');
        
        // Invalidar lista de ventas web (comandas del día)
        queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
        
        // Invalidar resumen de ventas en dashboard
        queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
        
        // Invalidar salud del negocio
        queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
        
        // Si tenemos el ID de venta, invalidar también el detalle específico
        if (result.data?.idventa) {
          queryClient.invalidateQueries({ queryKey: ventasWebKeys.detail(result.data.idventa) });
        }
        
        // Invalidar detalles de pagos si tenemos folioventa
        if (result.data?.folioventa) {
          queryClient.invalidateQueries({ queryKey: pagosKeys.detail(result.data.folioventa) });
        }
      }
    },
    onError: (error: any) => {
      console.error('❌ Error en mutación de pago simple:', error);
    },
  });
};

/**
 * Hook para procesar pagos mixtos
 * Invalida automáticamente las queries relevantes tras un pago exitoso
 */
export const useProcesarPagoMixtoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pagoData: PagoMixtoRequest) => procesarPagoMixto(pagoData),
    onSuccess: (result) => {
      if (result.success) {
        console.log('✅ Pago mixto exitoso, invalidando queries...');
        
        // Invalidar lista de ventas web (comandas del día)
        queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
        
        // Invalidar resumen de ventas en dashboard
        queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
        
        // Invalidar salud del negocio
        queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
        
        // Si tenemos el ID de venta, invalidar también el detalle específico
        if (result.data?.idventa) {
          queryClient.invalidateQueries({ queryKey: ventasWebKeys.detail(result.data.idventa) });
        }
        
        // Invalidar detalles de pagos si tenemos folioventa
        if (result.data?.folioventa) {
          queryClient.invalidateQueries({ queryKey: pagosKeys.detail(result.data.folioventa) });
        }
      }
    },
    onError: (error: any) => {
      console.error('❌ Error en mutación de pago mixto:', error);
    },
  });
};
