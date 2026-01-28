import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { 
  procesarPagoSimple, 
  procesarPagoMixto,
  obtenerDetallesPagos
} from '../controllers/pagos.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/pagos/simple - Process simple payment (EFECTIVO or TRANSFERENCIA)
router.post('/simple', procesarPagoSimple);

// POST /api/pagos/mixto - Process mixed payment
router.post('/mixto', procesarPagoMixto);

// GET /api/pagos/detalles/:folioventa - Get payment details for a sale
router.get('/detalles/:folioventa', obtenerDetallesPagos);

export default router;
