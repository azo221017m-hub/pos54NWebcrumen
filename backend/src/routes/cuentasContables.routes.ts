import { Router } from 'express';
import {
  obtenerCuentasContables,
  obtenerCuentaContable,
  crearCuentaContable,
  actualizarCuentaContable,
  eliminarCuentaContable
} from '../controllers/cuentasContables.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas
router.get('/', obtenerCuentasContables);
router.get('/:id', obtenerCuentaContable);
router.post('/', crearCuentaContable);
router.put('/:id', actualizarCuentaContable);
router.delete('/:id', checkPrivilegio(5), eliminarCuentaContable);

export default router;
