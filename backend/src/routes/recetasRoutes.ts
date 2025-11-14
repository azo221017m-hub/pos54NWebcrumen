// src/routes/recetasRoutes.ts
// Rutas para gestión de recetas

import { Router } from 'express';
import {
  obtenerRecetas,
  obtenerDetallesReceta,
  crearReceta,
  actualizarReceta,
  eliminarReceta
} from '../controllers/recetasController';

const router = Router();

// 📋 GET /api/recetas - Obtener todas las recetas
router.get('/', obtenerRecetas);

// 📋 GET /api/recetas/:idReceta - Obtener detalles de una receta específica
router.get('/:idReceta', obtenerDetallesReceta);

// 📝 POST /api/recetas - Crear nueva receta con detalles
router.post('/', crearReceta);

// ✏️ PUT /api/recetas/:idReceta - Actualizar receta existente
router.put('/:idReceta', actualizarReceta);

// 🗑️ DELETE /api/recetas/:idReceta - Eliminar receta (soft delete)
router.delete('/:idReceta', eliminarReceta);

export default router;