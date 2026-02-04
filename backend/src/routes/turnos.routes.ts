import { Router } from 'express';
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  cerrarTurnoActual,
  verificarComandasAbiertas
} from '../controllers/turnos.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas CRUD
router.get('/', obtenerTurnos);
router.get('/:idturno', obtenerTurnoPorId);
router.post('/', crearTurno);
router.put('/:idturno', actualizarTurno);
router.delete('/:idturno', eliminarTurno);

// Ruta adicional para cerrar turno actual
router.post('/cerrar-actual', cerrarTurnoActual);

// Ruta para verificar comandas abiertas en un turno
router.get('/verificar-comandas/:claveturno', verificarComandasAbiertas);

export default router;
