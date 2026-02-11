import { Router } from 'express';
import { 
  getVentasWeb, 
  getVentaWebById, 
  createVentaWeb,
  updateVentaWeb,
  deleteVentaWeb,
  updateDetalleEstado,
  getDetallesByEstado,
  addDetallesToVenta,
  getSalesSummary,
  getBusinessHealth
} from '../controllers/ventasWeb.controller';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Aplicar rate limiting a todas las rutas (después de autenticación)
router.use(apiLimiter);

/**
 * @route   GET /api/ventas-web
 * @desc    Obtener todas las ventas web del negocio
 * @access  Private
 */
router.get('/', getVentasWeb);

/**
 * @route   GET /api/ventas-web/:id
 * @desc    Obtener una venta web por ID con sus detalles
 * @access  Private
 */
router.get('/:id', getVentaWebById);

/**
 * @route   POST /api/ventas-web
 * @desc    Crear una nueva venta web con sus detalles
 * @access  Private
 */
router.post('/', createVentaWeb);

/**
 * @route   PUT /api/ventas-web/:id
 * @desc    Actualizar una venta web
 * @access  Private
 */
router.put('/:id', updateVentaWeb);

/**
 * @route   DELETE /api/ventas-web/:id
 * @desc    Cancelar una venta web (soft delete)
 * @access  Private
 */
router.delete('/:id', deleteVentaWeb);

/**
 * @route   POST /api/ventas-web/:id/detalles
 * @desc    Add detalles to an existing venta web
 * @access  Private
 */
router.post('/:id/detalles', addDetallesToVenta);

/**
 * @route   PATCH /api/ventas-web/:id/detalles/:iddetalle/estado
 * @desc    Actualizar el estado de un detalle de venta específico
 * @access  Private
 */
router.patch('/:id/detalles/:iddetalle/estado', updateDetalleEstado);

/**
 * @route   GET /api/ventas-web/detalles/estado/:estado
 * @desc    Obtener todos los detalles de ventas con un estado específico (ESPERAR, ORDENADO, PREPARACION, etc.)
 * @access  Private
 */
router.get('/detalles/estado/:estado', getDetallesByEstado);

/**
 * @route   GET /api/ventas-web/resumen/turno-actual
 * @desc    Obtener resumen de ventas del turno actual abierto
 * @access  Private
 */
router.get('/resumen/turno-actual', getSalesSummary);

/**
 * @route   GET /api/ventas-web/dashboard/salud-negocio
 * @desc    Obtener datos de salud del negocio (Ventas vs Gastos del mes actual)
 * @access  Private
 */
router.get('/dashboard/salud-negocio', getBusinessHealth);

export default router;
