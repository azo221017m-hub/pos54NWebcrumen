import { Router } from 'express';
import { login, register, verifyToken, checkLoginStatus, unlockUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

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
 * @access  Private (solo administradores)
 */
router.get('/status/:alias', authMiddleware, checkLoginStatus);

/**
 * @route   POST /api/auth/unlock/:alias
 * @desc    Desbloquear cuenta de usuario
 * @access  Private (solo administradores)
 */
router.post('/unlock/:alias', authMiddleware, unlockUser);

export default router;
