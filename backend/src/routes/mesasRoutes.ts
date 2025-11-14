// backend/src/routes/mesasRoutes.ts
// Rutas para gestión de mesas

import { Router } from 'express';
import {
  getMesasController,
  createMesaController,
  updateMesaController,
  deleteMesaController
} from '../controllers/mesasController';

// Crear instancia del router
const router = Router();

// Definir rutas para mesas
router.get('/', getMesasController);           // GET /api/mesas
router.post('/', createMesaController);        // POST /api/mesas
router.put('/:id', updateMesaController);      // PUT /api/mesas/:id
router.delete('/:id', deleteMesaController);   // DELETE /api/mesas/:id

// Exportar el router
export default router;