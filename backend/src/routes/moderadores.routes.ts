import { Router } from 'express';
import {
  obtenerModeradores,
  obtenerModerador,
  crearModerador,
  actualizarModerador,
  eliminarModerador,
  obtenerModeradoresRef
} from '../controllers/moderadores.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas
router.get('/ref/negocio/:idnegocio', obtenerModeradoresRef);
router.get('/negocio/:idnegocio', obtenerModeradores);
router.get('/:id', obtenerModerador);
router.post('/', crearModerador);
router.put('/:id', actualizarModerador);
router.delete('/:id', checkPrivilegio(5), eliminarModerador);

export default router;
