import { Router } from 'express';
import { authMiddleware, checkPrivilegio, soloSuperUsuario, soloSuNegocio } from '../middlewares/auth';
import { apiLimiter, imageLimiter } from '../middlewares/rateLimit';
import {
  obtenerNegocios,
  obtenerNegociosPublico,
  obtenerNegocioPorId,
  crearNegocio,
  actualizarNegocio,
  eliminarNegocio,
  cambiarEstatusNegocio,
  toggleAbiertoAhoraWeb,
  validarNombreUnico,
  subirLogotipo,
  obtenerLogotipo,
  obtenerLogotipoPublico,
  obtenerProximoNumeroNegocio,
} from '../controllers/negocios.controller';

const router = Router();

// Imágenes: van ANTES de router.use(apiLimiter) para usar su propio límite
// (cada tarjeta o fila pide su logotipo por separado).

/**
 * @route   GET /api/negocios/publico/:id/logotipo
 * @desc    Logotipo de un negocio activo como imagen binaria cacheable (portal de clientes)
 * @access  Public
 */
router.get('/publico/:id/logotipo', imageLimiter, obtenerLogotipoPublico);

/**
 * @route   GET /api/negocios/:id/logotipo
 * @desc    Obtener el logotipo de un negocio (la lista GET /api/negocios no lo incluye)
 * @access  Private (su negocio o superusuario)
 */
router.get('/:id/logotipo', imageLimiter, authMiddleware, soloSuNegocio(), obtenerLogotipo);

router.use(apiLimiter);

/**
 * @route   GET /api/negocios/publico
 * @desc    Obtener negocios activos para el portal de clientes (sin autenticación)
 * @access  Public
 */
router.get('/publico', obtenerNegociosPublico);

/**
 * @route   GET /api/negocios
 * @desc    Obtener negocios (superusuario: todos; resto: solo el suyo)
 * @access  Private
 */
router.get('/', authMiddleware, obtenerNegocios);

/**
 * @route   GET /api/negocios/proximo-numero
 * @desc    Obtener el próximo número de negocio disponible
 * @access  Private
 */
router.get('/proximo-numero', authMiddleware, soloSuperUsuario, obtenerProximoNumeroNegocio);

/**
 * @route   GET /api/negocios/:id
 * @desc    Obtener un negocio por ID con sus parámetros
 * @access  Private
 */
router.get('/:id', authMiddleware, soloSuNegocio(), obtenerNegocioPorId);

/**
 * @route   POST /api/negocios
 * @desc    Crear un nuevo negocio con sus parámetros
 * @access  Private
 */
router.post('/', authMiddleware, soloSuperUsuario, crearNegocio);

/**
 * @route   PUT /api/negocios/:id
 * @desc    Actualizar un negocio y sus parámetros
 * @access  Private
 */
router.put('/:id', authMiddleware, soloSuperUsuario, actualizarNegocio);

/**
 * @route   DELETE /api/negocios/:id
 * @desc    Eliminar un negocio (soft delete)
 * @access  Private
 */
router.delete('/:id', authMiddleware, soloSuperUsuario, checkPrivilegio(5), eliminarNegocio);

/**
 * @route   PATCH /api/negocios/:id/estatus
 * @desc    Cambiar estatus de un negocio
 * @access  Private
 */
router.patch('/:id/estatus', authMiddleware, soloSuperUsuario, cambiarEstatusNegocio);

/**
 * @route   PATCH /api/negocios/:id/abiertoahoraweb
 * @desc    Activar/desactivar canal de pedidos WEB
 * @access  Private
 */
router.patch('/:id/abiertoahoraweb', authMiddleware, soloSuNegocio(), toggleAbiertoAhoraWeb);

/**
 * @route   POST /api/negocios/validar-nombre
 * @desc    Validar que el nombre del negocio sea único
 * @access  Private
 */
router.post('/validar-nombre', authMiddleware, soloSuperUsuario, validarNombreUnico);

/**
 * @route   POST /api/negocios/:id/logotipo
 * @desc    Subir logotipo del negocio
 * @access  Private
 */
router.post('/:id/logotipo', authMiddleware, soloSuperUsuario, subirLogotipo);

export default router;
