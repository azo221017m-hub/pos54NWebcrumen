import { Router } from 'express';
import {
  obtenerMesas,
  obtenerMesaPorId,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
  validarNumeroMesaUnico,
  cambiarEstatusMesa
} from '../controllers/mesas.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas CRUD
router.get('/', obtenerMesas);
router.get('/validar/numero-mesa', validarNumeroMesaUnico);
router.get('/:idmesa', obtenerMesaPorId);
router.post('/', crearMesa);
router.put('/:idmesa', actualizarMesa);
router.delete('/:idmesa', eliminarMesa);

// Rutas adicionales
router.patch('/:idmesa/estatus', cambiarEstatusMesa);

export default router;
