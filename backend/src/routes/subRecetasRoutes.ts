// backend/src/routes/subRecetasRoutes.ts
// Rutas para sub-recetas

import express from 'express';
import {
  obtenerSubRecetas,
  obtenerSubRecetaPorId,
  crearSubReceta,
  actualizarSubReceta,
  eliminarSubReceta,
  buscarInsumosConsumo
} from '../controllers/subRecetasController';

const router = express.Router();

// 🔍 Rutas de búsqueda (deben ir antes de las rutas con parámetros)
router.get('/insumos-consumo/buscar/:filtro', buscarInsumosConsumo);

// 📋 Rutas CRUD para sub-recetas
router.get('/', obtenerSubRecetas);           // GET /api/sub-recetas
router.get('/:id', obtenerSubRecetaPorId);    // GET /api/sub-recetas/:id
router.post('/', crearSubReceta);             // POST /api/sub-recetas
router.put('/:id', actualizarSubReceta);      // PUT /api/sub-recetas/:id
router.delete('/:id', eliminarSubReceta);     // DELETE /api/sub-recetas/:id

export default router;