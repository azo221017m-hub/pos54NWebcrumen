// backend/src/routes/proveedoresRoutes.ts
// Rutas para gestión de proveedores

import { Router } from 'express';
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor
} from '../controllers/proveedoresController';

// Crear instancia del router
const router = Router();

// Definir rutas para proveedores
router.get('/', getProveedores);           // GET /api/proveedores
router.post('/', createProveedor);        // POST /api/proveedores
router.put('/:id', updateProveedor);      // PUT /api/proveedores/:id
router.delete('/:id', deleteProveedor);   // DELETE /api/proveedores/:id

// Exportar el router
export default router;