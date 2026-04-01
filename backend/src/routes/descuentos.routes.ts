import { Router } from 'express';
import {
  obtenerDescuentos,
  obtenerDescuentoPorId,
  crearDescuento,
  actualizarDescuento,
  eliminarDescuento,
  validarNombreDescuentoUnico,
  cambiarEstatusDescuento
} from '../controllers/descuentos.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas CRUD
router.get('/', obtenerDescuentos);
router.get('/validar/nombre-descuento', validarNombreDescuentoUnico);
router.get('/:id_descuento', obtenerDescuentoPorId);
router.post('/', crearDescuento);
router.put('/:id_descuento', actualizarDescuento);
router.delete('/:id_descuento', checkPrivilegio(5), eliminarDescuento);

// Rutas adicionales
router.patch('/:id_descuento/estatus', cambiarEstatusDescuento);

export default router;
