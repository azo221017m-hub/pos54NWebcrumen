import { Router } from 'express';
import {
  obtenerAnuncios,
  obtenerAnunciosVigentes,
  obtenerAnuncioPorId,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio
} from '../controllers/anuncios.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

/**
 * @route   GET /api/anuncios/vigentes
 * @desc    Obtener anuncios con fechaDeVigencia >= hoy o sin fecha (sin autenticación)
 * @access  Public
 */
router.get('/vigentes', apiLimiter, obtenerAnunciosVigentes);

// Aplicar rate limiting y autenticación a todas las rutas restantes
router.use(apiLimiter);
router.use(authMiddleware);

// Rutas CRUD para anuncios (tblposcrumenwebanuncios)
router.get('/', obtenerAnuncios);
router.get('/:id', obtenerAnuncioPorId);
router.post('/', crearAnuncio);
router.put('/:id', actualizarAnuncio);
router.delete('/:id', checkPrivilegio(5), eliminarAnuncio);

export default router;
