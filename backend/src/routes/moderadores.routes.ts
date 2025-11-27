import { Router } from 'express';
import {
  obtenerModeradores,
  obtenerModerador,
  crearModerador,
  actualizarModerador,
  eliminarModerador,
  obtenerModeradoresRef
} from '../controllers/moderadores.controller';

const router = Router();

// Rutas
router.get('/ref/negocio/:idnegocio', obtenerModeradoresRef);
router.get('/negocio/:idnegocio', obtenerModeradores);
router.get('/:id', obtenerModerador);
router.post('/', crearModerador);
router.put('/:id', actualizarModerador);
router.delete('/:id', eliminarModerador);

export default router;
