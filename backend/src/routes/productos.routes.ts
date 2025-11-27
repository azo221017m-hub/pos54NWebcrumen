import { Router } from 'express';
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} from '../controllers/productos.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/productos
 * @desc    Obtener todos los productos
 * @access  Private
 */
router.get('/', getProductos);

/**
 * @route   GET /api/productos/:id
 * @desc    Obtener un producto por ID
 * @access  Private
 */
router.get('/:id', getProductoById);

/**
 * @route   POST /api/productos
 * @desc    Crear un nuevo producto
 * @access  Private
 */
router.post('/', createProducto);

/**
 * @route   PUT /api/productos/:id
 * @desc    Actualizar un producto
 * @access  Private
 */
router.put('/:id', updateProducto);

/**
 * @route   DELETE /api/productos/:id
 * @desc    Eliminar un producto (soft delete)
 * @access  Private
 */
router.delete('/:id', deleteProducto);

export default router;
