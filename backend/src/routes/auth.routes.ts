import { Router } from 'express';
import { 
  login, 
  register, 
  verifyToken, 
  checkLoginStatus, 
  unlockUser, 
  ensureSuperuser
} from '../controllers/auth.controller';
import { authMiddleware, checkRole } from '../middlewares/auth';

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
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', register);

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
