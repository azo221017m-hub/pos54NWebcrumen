import { Router } from 'express';
import {
  obtenerRecetas,
  obtenerRecetaPorId,
  crearReceta,
  actualizarReceta,
  eliminarReceta
} from '../controllers/recetas.controller';

const router = Router();

// Rutas para recetas
router.get('/negocio/:idnegocio', obtenerRecetas);
router.get('/:id', obtenerRecetaPorId);
router.post('/', crearReceta);
router.put('/:id', actualizarReceta);
router.delete('/:id', eliminarReceta);

export default router;
