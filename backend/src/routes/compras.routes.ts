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

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas CRUD de compras
router.get('/', obtenerCompras);
router.get('/:id', obtenerCompraPorId);
router.post('/', crearCompra);
router.put('/:id', actualizarCompra);
router.delete('/:id', eliminarCompra);

// Rutas de detalles
router.put('/:id/detalles/:iddetalle', actualizarDetalleCompra);

export default router;
