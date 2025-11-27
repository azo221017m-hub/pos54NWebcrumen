import { Router } from 'express';
import { 
  getInventario, 
  getInventarioByProducto, 
  getProductosBajoStock,
  actualizarInventario,
  ajustarStock
} from '../controllers/inventario.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/inventario
 * @desc    Obtener todo el inventario
 * @access  Private
 */
router.get('/', getInventario);

/**
 * @route   GET /api/inventario/bajo-stock
 * @desc    Obtener productos con bajo stock
 * @access  Private
 */
router.get('/bajo-stock', getProductosBajoStock);

/**
 * @route   GET /api/inventario/producto/:producto_id
 * @desc    Obtener inventario de un producto
 * @access  Private
 */
router.get('/producto/:producto_id', getInventarioByProducto);

/**
 * @route   PUT /api/inventario/producto/:producto_id
 * @desc    Actualizar inventario de un producto
 * @access  Private
 */
router.put('/producto/:producto_id', actualizarInventario);

/**
 * @route   POST /api/inventario/producto/:producto_id/ajustar
 * @desc    Ajustar stock (sumar o restar)
 * @access  Private
 */
router.post('/producto/:producto_id/ajustar', ajustarStock);

export default router;
