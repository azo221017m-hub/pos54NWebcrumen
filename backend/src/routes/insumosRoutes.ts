// backend/src/routes/insumosRoutes.ts
// Rutas para la gestión de insumos

import { Router } from 'express';
import {
  getInsumosController,
  createInsumoController,
  updateInsumoController,
  deleteInsumoController,
  buscarInsumosController
} from '../controllers/insumosController';

// Crear router de Express
const router = Router();

// Rutas para insumos
router.get('/', getInsumosController); // GET /api/insumos - Obtener todos los insumos
router.get('/buscar/:filtro', buscarInsumosController); // GET /api/insumos/buscar/:filtro - Buscar insumos por filtro
router.get('/buscar', buscarInsumosController); // GET /api/insumos/buscar?busqueda=texto&tipo=CONSUMO - Buscar insumos con query params
router.post('/', createInsumoController); // POST /api/insumos - Crear nuevo insumo
router.put('/:id', updateInsumoController); // PUT /api/insumos/:id - Actualizar insumo
router.delete('/:id', deleteInsumoController); // DELETE /api/insumos/:id - Eliminar insumo

// Exportar el router
export default router;