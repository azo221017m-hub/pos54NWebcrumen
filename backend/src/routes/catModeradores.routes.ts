import { Router } from 'express';
import {
  obtenerCatModeradores,
  obtenerCatModeradorPorId,
  crearCatModerador,
  actualizarCatModerador,
  eliminarCatModerador
} from '../controllers/catModeradores.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para Categorías Moderador (tblposcrumenwebmodref)
router.get('/', obtenerCatModeradores);
router.get('/:id', obtenerCatModeradorPorId);
router.post('/', crearCatModerador);
router.put('/:id', actualizarCatModerador);
router.delete('/:id', eliminarCatModerador);

export default router;
