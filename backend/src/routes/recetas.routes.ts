import { Router } from 'express';
import {
  obtenerRecetas,
  obtenerRecetaPorId,
  crearReceta,
  actualizarReceta,
  eliminarReceta
} from '../controllers/recetas.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Rutas para recetas - todas protegidas con autenticación
router.get('/negocio/:idnegocio', authMiddleware, obtenerRecetas);
router.get('/:id', authMiddleware, obtenerRecetaPorId);
router.post('/', authMiddleware, crearReceta);
router.put('/:id', authMiddleware, actualizarReceta);
router.delete('/:id', authMiddleware, eliminarReceta);

export default router;
