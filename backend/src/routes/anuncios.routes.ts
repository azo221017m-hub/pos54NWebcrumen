import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  obtenerAnuncios,
  obtenerAnuncioPorId,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio
} from '../controllers/anuncios.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/anuncios - Obtener todos los anuncios
router.get('/', obtenerAnuncios);

// GET /api/anuncios/:id - Obtener un anuncio por ID
router.get('/:id', obtenerAnuncioPorId);

// POST /api/anuncios - Crear un nuevo anuncio
router.post('/', crearAnuncio);

// PUT /api/anuncios/:id - Actualizar un anuncio
router.put('/:id', actualizarAnuncio);

// DELETE /api/anuncios/:id - Eliminar un anuncio
router.delete('/:id', eliminarAnuncio);

export default router;
