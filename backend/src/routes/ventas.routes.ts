import { Router } from 'express';
import { 
  getVentas, 
  getVentaById, 
  createVenta,
  getVentasDelDia
} from '../controllers/ventas.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/ventas
 * @desc    Obtener todas las ventas
 * @access  Private
 */
router.get('/', getVentas);

/**
 * @route   GET /api/ventas/dia
 * @desc    Obtener estadísticas del día
 * @access  Private
 */
router.get('/dia', getVentasDelDia);

/**
 * @route   GET /api/ventas/:id
 * @desc    Obtener una venta por ID
 * @access  Private
 */
router.get('/:id', getVentaById);

/**
 * @route   POST /api/ventas
 * @desc    Registrar una nueva venta
 * @access  Private
 */
router.post('/', createVenta);

export default router;
