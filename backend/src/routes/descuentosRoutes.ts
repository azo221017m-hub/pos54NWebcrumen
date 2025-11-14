// backend/src/routes/descuentosRoutes.ts
// Rutas para gestión de descuentos

import { Router } from 'express';
import {
  getDescuentosController,
  createDescuentoController,
  updateDescuentoController,
  deleteDescuentoController
} from '../controllers/descuentosController';

// Crear instancia del router
const router = Router();

// Definir rutas para descuentos
router.get('/', getDescuentosController);           // GET /api/descuentos
router.post('/', createDescuentoController);        // POST /api/descuentos
router.put('/:id', updateDescuentoController);      // PUT /api/descuentos/:id
router.delete('/:id', deleteDescuentoController);   // DELETE /api/descuentos/:id

// Exportar el router
export default router;