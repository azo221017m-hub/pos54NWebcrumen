import { Router } from 'express';
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  cerrarTurnoNuevo,
  verificarComandasAbiertas,
  obtenerFondoCaja,
  obtenerTurnoAbierto,
  obtenerCorteFinTurno
} from '../controllers/turnos.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Aplicar rate limiting a todas las rutas (después de autenticación)
router.use(apiLimiter);

// Rutas CRUD
router.get('/', obtenerTurnos);
router.get('/turno-abierto', obtenerTurnoAbierto); // Must be before /:idturno
router.get('/:idturno', obtenerTurnoPorId);
router.post('/', crearTurno);
router.put('/:idturno', actualizarTurno);
router.delete('/:idturno', checkPrivilegio(5), eliminarTurno);

// Ruta para cerrar un turno por clave de turno (actualiza estatusturno y fechafinturno)
router.post('/cerrar/:claveturno', cerrarTurnoNuevo);

// Ruta para verificar comandas abiertas en un turno
router.get('/verificar-comandas/:claveturno', verificarComandasAbiertas);

// Ruta para obtener fondo de caja de un turno
router.get('/fondo-caja/:claveturno', obtenerFondoCaja);

// Ruta para obtener todos los datos del Ticket de Fin de Turno
router.get('/corte/:claveturno', obtenerCorteFinTurno);

export default router;
