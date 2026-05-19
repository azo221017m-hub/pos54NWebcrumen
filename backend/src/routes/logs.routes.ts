import { Router } from 'express';
import { registrarLog } from '../controllers/logs.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// POST /api/logs - Registrar evento de auditoría
router.post('/', authMiddleware, registrarLog);

export default router;
