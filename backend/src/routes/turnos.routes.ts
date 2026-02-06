import { Router } from 'express';
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  cerrarTurnoActual,
  verificarComandasAbiertas,
  obtenerFondoCaja
} from '../controllers/turnos.controller';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Aplicar rate limiting a todas las rutas (después de autenticación)
router.use(apiLimiter);

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

// Ruta para obtener fondo de caja de un turno
router.get('/fondo-caja/:claveturno', obtenerFondoCaja);

export default router;
