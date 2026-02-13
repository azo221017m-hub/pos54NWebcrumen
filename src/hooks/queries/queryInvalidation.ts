import { QueryClient } from '@tanstack/react-query';

/**
 * Utilidad centralizada para invalidación de queries relacionadas
 * 
 * Este archivo proporciona funciones helper para invalidar múltiples queries
 * que están relacionadas entre sí, asegurando que los dashboards, indicadores
 * y listas se actualicen automáticamente después de operaciones CRUD.
 */

/**
 * Invalida las queries del dashboard (resumen de ventas y salud del negocio)
 * Usar cuando las operaciones CRUD afectan métricas del dashboard
 */
export const invalidateDashboardQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['resumenVentas'] });
  queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });
};

/**
 * Invalida solo la query de salud del negocio
 * Usar cuando las operaciones afectan costos, inventario o métricas operativas
 */
export const invalidateSaludNegocioQuery = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });
};

/**
 * Invalida solo la query de resumen de ventas
 * Usar cuando las operaciones afectan directamente las ventas
 */
export const invalidateResumenVentasQuery = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['resumenVentas'] });
};

/**
 * Invalida queries relacionadas con operaciones de inventario
 * Usar para operaciones de insumos, recetas, proveedores
 */
export const invalidateInventoryRelatedQueries = (queryClient: QueryClient) => {
  invalidateSaludNegocioQuery(queryClient);
};

/**
 * Invalida queries relacionadas con operaciones de ventas
 * Usar para operaciones de productos, clientes, descuentos, mesas, moderadores
 */
export const invalidateSalesRelatedQueries = (queryClient: QueryClient) => {
  invalidateDashboardQueries(queryClient);
};
