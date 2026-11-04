import { Router } from 'express';
import { 
  login, 
  verifyToken, 
  checkLoginStatus, 
  unlockUser, 
  refreshToken,
  loginCliente,
  getClienteTokenForNegocio,
  registroClientePublico,
  getMisPedidos,
  enviarMensajePedido
} from '../controllers/auth.controller';
import { authMiddleware, soloSuperUsuario } from '../middlewares/auth';
import { strictLimiter, apiLimiter } from '../middlewares/rateLimit';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/login-cliente
 * @desc    Iniciar sesión como cliente del portal web
 * @access  Public
 */
router.post('/login-cliente', strictLimiter, loginCliente);

/**
 * @route   POST /api/auth/cliente-token-negocio
 * @desc    Obtener un token de cliente con el idNegocio del negocio seleccionado
 * @access  Private (requiere token de cliente válido)
 */
router.post('/cliente-token-negocio', apiLimiter, authMiddleware, getClienteTokenForNegocio);

/**
 * @route   GET /api/auth/mis-pedidos
 * @desc    Obtener pedidos activos del cliente autenticado (teléfono tomado de su cuenta)
 * @access  Private (requiere token de cliente válido)
 */
router.get('/mis-pedidos', apiLimiter, authMiddleware, getMisPedidos);

/**
 * @route   POST /api/auth/enviar-mensaje-pedido
 * @desc    Enviar mensaje del cliente autenticado en uno de sus pedidos en tránsito
 * @access  Private (requiere token de cliente válido)
 */
router.post('/enviar-mensaje-pedido', apiLimiter, authMiddleware, enviarMensajePedido);

/**
 * @route   POST /api/auth/registro-cliente
 * @desc    Registro público de nuevos clientes del portal web
 * @access  Public
 */
router.post('/registro-cliente', apiLimiter, registroClientePublico);

// POST /api/auth/register fue retirado: era público y permitía crear usuarios de
// personal en cualquier negocio y con cualquier rol (incluido el 99999). El
// personal se da de alta con POST /api/usuarios (requiere sesión).

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token JWT (sliding session)
 * @access  Private
 */
router.post('/refresh', authMiddleware, refreshToken);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT
 * @access  Private
 */
router.get('/verify', authMiddleware, verifyToken);

/**
 * @route   GET /api/auth/status/:alias
 * @desc    Verificar estado de bloqueo de un usuario (cualquier negocio)
 * @access  Private (solo superusuario)
 */
router.get('/status/:alias', authMiddleware, soloSuperUsuario, checkLoginStatus);

/**
 * @route   POST /api/auth/unlock/:alias
 * @desc    Desbloquear cuenta de usuario (cualquier negocio)
 * @access  Private (solo superusuario)
 */
router.post('/unlock/:alias', authMiddleware, soloSuperUsuario, unlockUser);

// POST /api/auth/ensure-superuser fue retirado: era público y restablecía la
// contraseña del superusuario a un valor fijo publicado en el repositorio.
// Para crear o restablecer el superusuario usar el script del servidor:
//   cd backend && npm run db:create-superuser

export default router;
