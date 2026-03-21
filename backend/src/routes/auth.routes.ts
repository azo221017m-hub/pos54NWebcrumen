import { Router } from 'express';
import { 
  login, 
  register, 
  verifyToken, 
  checkLoginStatus, 
  unlockUser, 
  ensureSuperuser,
  refreshToken,
  loginCliente,
  getClienteTokenForNegocio,
  registroClientePublico,
  getMisPedidos,
  enviarMensajePedido
} from '../controllers/auth.controller';
import { authMiddleware, checkRole } from '../middlewares/auth';
import { strictLimiter, apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Constantes de roles
const ADMIN_ROLE = 1;

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
 * @desc    Obtener pedidos activos del cliente autenticado
 * @access  Private (requiere token de cliente válido)
 */
router.get('/mis-pedidos', apiLimiter, authMiddleware, getMisPedidos);

/**
 * @route   POST /api/auth/enviar-mensaje-pedido
 * @desc    Enviar mensaje del cliente en un pedido en tránsito
 * @access  Private (requiere token de cliente válido)
 */
router.post('/enviar-mensaje-pedido', apiLimiter, authMiddleware, enviarMensajePedido);

/**
 * @route   POST /api/auth/registro-cliente
 * @desc    Registro público de nuevos clientes del portal web
 * @access  Public
 */
router.post('/registro-cliente', apiLimiter, registroClientePublico);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', register);

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
 * @desc    Verificar estado de bloqueo de un usuario
 * @access  Private (solo administradores - idRol: 1)
 */
router.get('/status/:alias', authMiddleware, checkRole(ADMIN_ROLE), checkLoginStatus);

/**
 * @route   POST /api/auth/unlock/:alias
 * @desc    Desbloquear cuenta de usuario
 * @access  Private (solo administradores - idRol: 1)
 */
router.post('/unlock/:alias', authMiddleware, checkRole(ADMIN_ROLE), unlockUser);

/**
 * @route   POST /api/auth/ensure-superuser
 * @desc    Crear o actualizar el SUPERUSUARIO del sistema (Crumen)
 * @access  Public (para inicialización del sistema)
 * @note    Este endpoint crea/actualiza el usuario "Crumen" con la contraseña "Crumen.*"
 *          y desbloquea la cuenta si está bloqueada. Uso recomendado: inicialización del sistema.
 */
router.post('/ensure-superuser', ensureSuperuser);

export default router;
