import { Router } from 'express';
import {
  obtenerCatModeradores,
  obtenerCatModeradorPorId,
  crearCatModerador,
  actualizarCatModerador,
  eliminarCatModerador
} from '../controllers/catModeradores.controller';

const router = Router();

// Rutas para Categorías Moderador (tblposcrumenwebmodref)
router.get('/negocio/:idnegocio', obtenerCatModeradores);
router.get('/:id', obtenerCatModeradorPorId);
router.post('/', crearCatModerador);
router.put('/:id', actualizarCatModerador);
router.delete('/:id', eliminarCatModerador);

export default router;
