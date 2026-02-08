import { Router } from 'express';
import {
  obtenerMovimientos,
  obtenerMovimientoPorId,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
  procesarMovimiento,
  obtenerUltimaCompra
} from '../controllers/movimientos.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas CRUD de movimientos
router.get('/', obtenerMovimientos);
router.get('/:id', obtenerMovimientoPorId);
router.post('/', crearMovimiento);
router.put('/:id', actualizarMovimiento);
router.delete('/:id', eliminarMovimiento);

// Ruta especial para procesar movimientos
router.patch('/:id/procesar', procesarMovimiento);

// Ruta para obtener datos de última compra de un insumo
router.get('/insumo/:idinsumo/ultima-compra', obtenerUltimaCompra);

export default router;
