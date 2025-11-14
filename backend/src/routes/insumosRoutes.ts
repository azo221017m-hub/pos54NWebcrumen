// backend/src/routes/insumosRoutes.ts
// Rutas para gestión de insumos

import { Router } from 'express';
import {
  getInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo
} from '../controllers/insumosController';

// Crear instancia del router
const router = Router();

// Definir rutas para insumos
router.get('/', getInsumos);           // GET /api/insumos
router.post('/', createInsumo);        // POST /api/insumos
router.put('/:id', updateInsumo);      // PUT /api/insumos/:id
router.delete('/:id', deleteInsumo);   // DELETE /api/insumos/:id

// Exportar el router
export default router;