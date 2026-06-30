import { Router } from 'express';
import {
  getEstadoResultados,
  getReporteVentas,
  getReporteCompras,
  getReporteCostos,
  getReporteGastos,
  getReporteRentabilidad,
  getReporteFlujo,
  // Nuevos endpoints – Dashboard Reestructurado
  getSaludNegocio,
  getGastosDescuentos,
  getSugerenciaCompra,
  getStockActual,
  getStockBajoMinimo,
  getComprasPorProveedor,
  getRotacionInventario,
  getVentasHoy,
  getVentasPorTurno,
  getTopProductos,
  getVentasMensual,
  getRankingColaboradores,
  getCumplimientoMeta,
  getKpiColaboradores,
} from '../controllers/reportes.controller';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Aplicar rate limiting a todas las rutas (después de autenticación)
router.use(apiLimiter);

/**
 * @route   GET /api/reportes/estado-resultados
 * @desc    Estado de Resultados (Resumen Ejecutivo)
 * @access  Private
 */
router.get('/estado-resultados', getEstadoResultados);

/**
 * @route   GET /api/reportes/ventas
 * @desc    Reporte de Ventas Detallado
 * @access  Private
 */
router.get('/ventas', getReporteVentas);

/**
 * @route   GET /api/reportes/compras
 * @desc    Reporte de Compras
 * @access  Private
 */
router.get('/compras', getReporteCompras);

/**
 * @route   GET /api/reportes/costos
 * @desc    Reporte de Costos de Venta
 * @access  Private
 */
router.get('/costos', getReporteCostos);

/**
 * @route   GET /api/reportes/gastos
 * @desc    Reporte de Gastos
 * @access  Private
 */
router.get('/gastos', getReporteGastos);

/**
 * @route   GET /api/reportes/rentabilidad
 * @desc    Rentabilidad por Producto
 * @access  Private
 */
router.get('/rentabilidad', getReporteRentabilidad);

/**
 * @route   GET /api/reportes/flujo
 * @desc    Flujo de Caja (agrupado por día)
 * @access  Private
 */
router.get('/flujo', getReporteFlujo);

// ── Salud del Negocio ─────────────────────────────────────────────────────────
router.get('/salud/estado', getSaludNegocio);
router.get('/salud/gastos-descuentos', getGastosDescuentos);

// ── Inventario ────────────────────────────────────────────────────────────────
router.get('/inventario/sugerencia-compra', getSugerenciaCompra);
router.get('/inventario/stock', getStockActual);
router.get('/inventario/bajo-minimo', getStockBajoMinimo);
router.get('/inventario/compras-proveedor', getComprasPorProveedor);
router.get('/inventario/rotacion', getRotacionInventario);

// ── Ventas ────────────────────────────────────────────────────────────────────
router.get('/ventas/hoy', getVentasHoy);
router.get('/ventas/por-turno', getVentasPorTurno);
router.get('/ventas/top-productos', getTopProductos);
router.get('/ventas/mensual', getVentasMensual);

// ── Colaboradores ─────────────────────────────────────────────────────────────
router.get('/colaboradores/ranking', getRankingColaboradores);
router.get('/colaboradores/cumplimiento-meta', getCumplimientoMeta);
router.get('/colaboradores/kpi', getKpiColaboradores);

export default router;
