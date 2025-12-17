import { Router } from 'express';
import { 
  getVentasWeb, 
  getVentaWebById, 
  createVentaWeb,
  updateVentaWeb,
  deleteVentaWeb
} from '../controllers/ventasWeb.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

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

export default router;
