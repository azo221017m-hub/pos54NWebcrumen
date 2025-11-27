import { Router } from 'express';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstatusUsuario,
  validarAliasUnico,
  actualizarImagenUsuario,
  obtenerImagenUsuario,
  eliminarImagenUsuario
} from '../controllers/usuarios.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas CRUD
router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

// Rutas adicionales
router.patch('/:id/estatus', cambiarEstatusUsuario);
router.post('/validar-alias', validarAliasUnico);

// Rutas de imágenes
router.patch('/:id/imagen', actualizarImagenUsuario);
router.get('/:id/imagen/:tipo', obtenerImagenUsuario);
router.delete('/:id/imagen/:tipo', eliminarImagenUsuario);

export default router;
