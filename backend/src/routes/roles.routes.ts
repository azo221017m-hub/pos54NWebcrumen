import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  obtenerRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol,
  cambiarEstatusRol,
  validarNombreUnico,
} from '../controllers/roles.controller';

const router = Router();

/**
 * @route   GET /api/roles
 * @desc    Obtener todos los roles
 * @access  Private
 */
router.get('/', authMiddleware, obtenerRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    Obtener un rol por ID
 * @access  Private
 */
router.get('/:id', authMiddleware, obtenerRolPorId);

/**
 * @route   POST /api/roles
 * @desc    Crear un nuevo rol
 * @access  Private
 */
router.post('/', authMiddleware, crearRol);

/**
 * @route   PUT /api/roles/:id
 * @desc    Actualizar un rol
 * @access  Private
 */
router.put('/:id', authMiddleware, actualizarRol);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Eliminar un rol (soft delete)
 * @access  Private
 */
router.delete('/:id', authMiddleware, eliminarRol);

/**
 * @route   PATCH /api/roles/:id/estatus
 * @desc    Cambiar estatus del rol
 * @access  Private
 */
router.patch('/:id/estatus', authMiddleware, cambiarEstatusRol);

/**
 * @route   POST /api/roles/validar-nombre
 * @desc    Validar si el nombre del rol es único
 * @access  Private
 */
router.post('/validar-nombre', authMiddleware, validarNombreUnico);

export default router;
