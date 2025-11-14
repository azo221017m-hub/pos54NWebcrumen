// backend/src/routes/clientesRoutes.ts
// Rutas para gestión de clientes

import { Router } from 'express';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/clientesController';

// Crear router
const router = Router();

// Rutas para clientes
console.log('🚀 [ClientesRoutes] Configurando rutas de clientes...');

// GET /api/clientes - Obtener todos los clientes
router.get('/', getClientes);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', getClienteById);

// POST /api/clientes - Crear nuevo cliente
router.post('/', createCliente);

// PUT /api/clientes/:id - Actualizar cliente
router.put('/:id', updateCliente);

// DELETE /api/clientes/:id - Eliminar cliente (soft delete)
router.delete('/:id', deleteCliente);

console.log('✅ [ClientesRoutes] Rutas de clientes configuradas exitosamente');

export default router;