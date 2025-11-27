import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  obtenerNegocios,
  obtenerNegocioPorId,
  crearNegocio,
  actualizarNegocio,
  eliminarNegocio,
  cambiarEstatusNegocio,
  validarNombreUnico,
  subirLogotipo,
  obtenerProximoNumeroNegocio,
} from '../controllers/negocios.controller';

const router = Router();

/**
 * @route   GET /api/negocios
 * @desc    Obtener todos los negocios
 * @access  Private
 */
router.get('/', authMiddleware, obtenerNegocios);

/**
 * @route   GET /api/negocios/proximo-numero
 * @desc    Obtener el próximo número de negocio disponible
 * @access  Private
 */
router.get('/proximo-numero', authMiddleware, obtenerProximoNumeroNegocio);

/**
 * @route   GET /api/negocios/:id
 * @desc    Obtener un negocio por ID con sus parámetros
 * @access  Private
 */
router.get('/:id', authMiddleware, obtenerNegocioPorId);

/**
 * @route   POST /api/negocios
 * @desc    Crear un nuevo negocio con sus parámetros
 * @access  Private
 */
router.post('/', authMiddleware, crearNegocio);

/**
 * @route   PUT /api/negocios/:id
 * @desc    Actualizar un negocio y sus parámetros
 * @access  Private
 */
router.put('/:id', authMiddleware, actualizarNegocio);

/**
 * @route   DELETE /api/negocios/:id
 * @desc    Eliminar un negocio (soft delete)
 * @access  Private
 */
router.delete('/:id', authMiddleware, eliminarNegocio);

/**
 * @route   PATCH /api/negocios/:id/estatus
 * @desc    Cambiar estatus de un negocio
 * @access  Private
 */
router.patch('/:id/estatus', authMiddleware, cambiarEstatusNegocio);

/**
 * @route   POST /api/negocios/validar-nombre
 * @desc    Validar que el nombre del negocio sea único
 * @access  Private
 */
router.post('/validar-nombre', authMiddleware, validarNombreUnico);

/**
 * @route   POST /api/negocios/:id/logotipo
 * @desc    Subir logotipo del negocio
 * @access  Private
 */
router.post('/:id/logotipo', authMiddleware, subirLogotipo);

export default router;
