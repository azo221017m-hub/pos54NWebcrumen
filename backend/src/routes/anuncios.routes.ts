import { Router } from 'express';
import {
  obtenerAnuncios,
  obtenerAnuncioPorId,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio
} from '../controllers/anuncios.controller';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Aplicar rate limiting y autenticación a todas las rutas
router.use(apiLimiter);
router.use(authMiddleware);

// Rutas CRUD para anuncios (tblposcrumenwebanuncios)
router.get('/', obtenerAnuncios);
router.get('/:id', obtenerAnuncioPorId);
router.post('/', crearAnuncio);
router.put('/:id', actualizarAnuncio);
router.delete('/:id', eliminarAnuncio);

export default router;
