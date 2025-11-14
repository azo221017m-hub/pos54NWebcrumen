// backend/src/routes/authRoutes.ts
// Rutas para autenticación en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { loginController } from '../controllers/authController'; // Importa controlador de auth

// Crea una instancia del router
const router = Router();

// Ruta POST para login de usuarios
// Endpoint: POST /api/auth/login
// Body: { usuario: string, password: string }
router.post('/login', loginController);

// Exporta el router para uso en app principal
export default router;