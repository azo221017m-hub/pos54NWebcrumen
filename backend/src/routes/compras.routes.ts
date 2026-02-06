import { Router } from 'express';
import {
  obtenerCompras,
  obtenerCompraPorId,
  crearCompra,
  actualizarCompra,
  eliminarCompra,
  actualizarDetalleCompra
} from '../controllers/compras.controller';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Aplicar rate limiting a todas las rutas (después de autenticación)
router.use(apiLimiter);

// Rutas CRUD de compras
router.get('/', obtenerCompras);
router.get('/:id', obtenerCompraPorId);
router.post('/', crearCompra);
router.put('/:id', actualizarCompra);
router.delete('/:id', eliminarCompra);

// Rutas de detalles
router.put('/:id/detalles/:iddetalle', actualizarDetalleCompra);

export default router;
