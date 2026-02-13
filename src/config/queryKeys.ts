/**
 * Centralized Query Keys Configuration
 * 
 * Este archivo define todas las query keys utilizadas en la aplicación.
 * Mantener las keys centralizadas permite:
 * - Consistencia en toda la aplicación
 * - Fácil invalidación desde WebSocket listeners
 * - Mejor mantenibilidad y debugging
 * - Evitar duplicación de keys
 */

/**
 * Query keys para ventas web (comandas)
 */
export const ventasWebKeys = {
  all: ['ventasWeb'] as const,
  lists: () => [...ventasWebKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...ventasWebKeys.lists(), { filters }] as const,
  details: () => [...ventasWebKeys.all, 'detail'] as const,
  detail: (id: number) => [...ventasWebKeys.details(), id] as const,
};

/**
 * Query keys para dashboard (métricas y resúmenes)
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  resumenVentas: () => ['resumenVentas'] as const,
  saludNegocio: () => ['saludNegocio'] as const,
};

/**
 * Query keys para turnos
 */
export const turnosKeys = {
  all: ['turnos'] as const,
  lists: () => [...turnosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...turnosKeys.lists(), { filters }] as const,
  details: () => [...turnosKeys.all, 'detail'] as const,
  detail: (id: number) => [...turnosKeys.details(), id] as const,
  abierto: () => [...turnosKeys.all, 'abierto'] as const,
};

/**
 * Query keys para pagos
 */
export const pagosKeys = {
  all: ['pagos'] as const,
  lists: () => [...pagosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...pagosKeys.lists(), { filters }] as const,
  details: () => [...pagosKeys.all, 'detail'] as const,
  detail: (id: number) => [...pagosKeys.details(), id] as const,
};

/**
 * Query keys para gastos
 */
export const gastosKeys = {
  all: ['gastos'] as const,
  lists: () => [...gastosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...gastosKeys.lists(), { filters }] as const,
  details: () => [...gastosKeys.all, 'detail'] as const,
  detail: (id: number) => [...gastosKeys.details(), id] as const,
};

/**
 * Query keys para movimientos de inventario
 */
export const movimientosKeys = {
  all: ['movimientos'] as const,
  lists: () => [...movimientosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...movimientosKeys.lists(), { filters }] as const,
  details: () => [...movimientosKeys.all, 'detail'] as const,
  detail: (id: number) => [...movimientosKeys.details(), id] as const,
};

/**
 * Query keys para inventario
 */
export const inventarioKeys = {
  all: ['inventario'] as const,
  lists: () => [...inventarioKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...inventarioKeys.lists(), { filters }] as const,
};

/**
 * Query keys para productos
 */
export const productosKeys = {
  all: ['productos'] as const,
  lists: () => [...productosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...productosKeys.lists(), { filters }] as const,
  details: () => [...productosKeys.all, 'detail'] as const,
  detail: (id: number) => [...productosKeys.details(), id] as const,
};

/**
 * Query keys para insumos
 */
export const insumosKeys = {
  all: ['insumos'] as const,
  lists: () => [...insumosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...insumosKeys.lists(), { filters }] as const,
  details: () => [...insumosKeys.all, 'detail'] as const,
  detail: (id: number) => [...insumosKeys.details(), id] as const,
};

/**
 * Query keys para moderadores
 */
export const moderadoresKeys = {
  all: ['moderadores'] as const,
  lists: () => [...moderadoresKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...moderadoresKeys.lists(), { filters }] as const,
};

/**
 * Query keys para usuarios
 */
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...usuariosKeys.lists(), { filters }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: number) => [...usuariosKeys.details(), id] as const,
};

/**
 * Query keys para proveedores
 */
export const proveedoresKeys = {
  all: ['proveedores'] as const,
  lists: () => [...proveedoresKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...proveedoresKeys.lists(), { filters }] as const,
  details: () => [...proveedoresKeys.all, 'detail'] as const,
  detail: (id: number) => [...proveedoresKeys.details(), id] as const,
};

/**
 * Query keys para clientes
 */
export const clientesKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...clientesKeys.lists(), { filters }] as const,
};

/**
 * Query keys para mesas
 */
export const mesasKeys = {
  all: ['mesas'] as const,
  lists: () => [...mesasKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...mesasKeys.lists(), { filters }] as const,
};

/**
 * Query keys para descuentos
 */
export const descuentosKeys = {
  all: ['descuentos'] as const,
  lists: () => [...descuentosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...descuentosKeys.lists(), { filters }] as const,
};

/**
 * Query keys para categorías
 */
export const categoriasKeys = {
  all: ['categorias'] as const,
  lists: () => [...categoriasKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...categoriasKeys.lists(), { filters }] as const,
};

/**
 * Query keys para recetas
 */
export const recetasKeys = {
  all: ['recetas'] as const,
  lists: () => [...recetasKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...recetasKeys.lists(), { filters }] as const,
  details: () => [...recetasKeys.all, 'detail'] as const,
  detail: (id: number) => [...recetasKeys.details(), id] as const,
};

/**
 * Query keys para subrecetas
 */
export const subrecetasKeys = {
  all: ['subrecetas'] as const,
  lists: () => [...subrecetasKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...subrecetasKeys.lists(), { filters }] as const,
};

/**
 * Query keys para catálogos generales
 */
export const catalogosKeys = {
  all: ['catalogos'] as const,
  negocio: () => [...catalogosKeys.all, 'negocio'] as const,
  roles: () => [...catalogosKeys.all, 'roles'] as const,
  umcompra: () => [...catalogosKeys.all, 'umcompra'] as const,
  catModeradores: () => [...catalogosKeys.all, 'catModeradores'] as const,
  grupoMovimientos: () => [...catalogosKeys.all, 'grupoMovimientos'] as const,
  cuentasContables: () => [...catalogosKeys.all, 'cuentasContables'] as const,
};
