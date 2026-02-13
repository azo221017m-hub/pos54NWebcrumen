import { useMutation, useQueryClient } from '@tanstack/react-query';
import { procesarPagoSimple, procesarPagoMixto } from '../../services/pagosService';
import type { PagoSimpleRequest, PagoMixtoRequest } from '../../types/ventasWeb.types';
import { ventasWebKeys, dashboardKeys, pagosKeys } from '../../config/queryKeys';

/**
 * Helper function to invalidate all payment-related queries
 * This ensures all UI components refresh with the latest data after a payment
 */
const invalidatePaymentQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  idventa?: number,
  folioventa?: string
) => {
  // Invalidar lista de ventas web (comandas del día)
  queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
  
  // Invalidar resumen de ventas en dashboard
  queryClient.invalidateQueries({ queryKey: dashboardKeys.resumenVentas() });
  
  // Invalidar salud del negocio
  queryClient.invalidateQueries({ queryKey: dashboardKeys.saludNegocio() });
  
  // Si tenemos el ID de venta, invalidar también el detalle específico
  if (idventa) {
    queryClient.invalidateQueries({ queryKey: ventasWebKeys.detail(idventa) });
  }
  
  // Invalidar detalles de pagos si tenemos folioventa
  if (folioventa) {
    queryClient.invalidateQueries({ queryKey: pagosKeys.detail(folioventa) });
  }
};

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
        invalidatePaymentQueries(
          queryClient,
          result.data?.idventa,
          result.data?.folioventa
        );
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en mutación de pago simple:', errorMessage);
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
        invalidatePaymentQueries(
          queryClient,
          result.data?.idventa,
          result.data?.folioventa
        );
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error en mutación de pago mixto:', errorMessage);
    },
  });
};
