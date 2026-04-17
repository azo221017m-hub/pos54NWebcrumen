import { Router } from 'express';
import {
  getEstadoResultados,
  getReporteVentas,
  getReporteCompras,
  getReporteCostos,
  getReporteGastos,
  getReporteRentabilidad,
  getReporteFlujo,
} from '../controllers/reportes.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

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

export default router;
