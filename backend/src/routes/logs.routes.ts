import { Router } from 'express';
import { registrarLog } from '../controllers/logs.controller';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

router.use(apiLimiter);
router.use(authMiddleware);

// POST /api/logs - Registrar evento de auditoría
router.post('/', registrarLog);

export default router;
