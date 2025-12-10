import { Router } from 'express';
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from '../controllers/categorias.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/categorias - Obtener todas las categorías
router.get('/', obtenerCategorias);

// GET /api/categorias/:id - Obtener una categoría por ID
router.get('/:id', obtenerCategoriaPorId);

// POST /api/categorias - Crear nueva categoría
router.post('/', crearCategoria);

// PUT /api/categorias/:id - Actualizar categoría
router.put('/:id', actualizarCategoria);

// DELETE /api/categorias/:id - Eliminar categoría (soft delete)
router.delete('/:id', eliminarCategoria);

export default router;
