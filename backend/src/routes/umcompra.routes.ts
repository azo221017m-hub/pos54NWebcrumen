import { Router } from 'express';
import {
  obtenerUMCompras,
  obtenerUMCompraPorId,
  crearUMCompra,
  actualizarUMCompra,
  eliminarUMCompra,
  validarNombreUnico
} from '../controllers/umcompra.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas CRUD
router.get('/', obtenerUMCompras);
router.get('/:id', obtenerUMCompraPorId);
router.post('/', crearUMCompra);
router.put('/:id', actualizarUMCompra);
router.delete('/:id', eliminarUMCompra);

// Validación
router.post('/validar-nombre', validarNombreUnico);

export default router;
