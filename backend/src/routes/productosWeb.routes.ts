import { Router } from 'express';
import {
  obtenerProductosWeb,
  obtenerProductoWebPorId,
  verificarNombreProducto,
  crearProductoWeb,
  actualizarProductoWeb,
  eliminarProductoWeb
} from '../controllers/productosWeb.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para productos web
router.get('/', obtenerProductosWeb);
router.get('/verificar-nombre', verificarNombreProducto);
router.get('/:id', obtenerProductoWebPorId);
router.post('/', crearProductoWeb);
router.put('/:id', actualizarProductoWeb);
router.delete('/:id', eliminarProductoWeb);

export default router;
