import { Router } from 'express';
import {
  obtenerSubrecetas,
  obtenerSubrecetaPorId,
  crearSubreceta,
  actualizarSubreceta,
  eliminarSubreceta
} from '../controllers/subrecetas.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas protegidas con autenticación
router.get('/negocio/:idnegocio', authMiddleware, obtenerSubrecetas);
router.get('/:id', authMiddleware, obtenerSubrecetaPorId);
router.post('/', authMiddleware, crearSubreceta);
router.put('/:id', authMiddleware, actualizarSubreceta);
router.delete('/:id', authMiddleware, eliminarSubreceta);

export default router;
