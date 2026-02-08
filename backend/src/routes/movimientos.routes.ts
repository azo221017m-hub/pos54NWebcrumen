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

// Rutas específicas (deben ir antes de las rutas con :id)
router.get('/insumo/:idinsumo/ultima-compra', obtenerUltimaCompra);

// Rutas CRUD de movimientos
router.get('/', obtenerMovimientos);
router.get('/:id', obtenerMovimientoPorId);
router.post('/', crearMovimiento);
router.put('/:id', actualizarMovimiento);
router.delete('/:id', eliminarMovimiento);

// Ruta especial para procesar movimientos
router.patch('/:id/procesar', procesarMovimiento);

export default router;
