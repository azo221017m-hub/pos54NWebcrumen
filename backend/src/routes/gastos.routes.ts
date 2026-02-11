import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import {
  obtenerGastos,
  obtenerGastoPorId,
  crearGasto,
  actualizarGasto,
  eliminarGasto
} from '../controllers/gastos.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/gastos - Obtener todos los gastos
router.get('/', obtenerGastos);

// GET /api/gastos/:id - Obtener un gasto por ID
router.get('/:id', obtenerGastoPorId);

// POST /api/gastos - Crear un nuevo gasto
router.post('/', crearGasto);

// PUT /api/gastos/:id - Actualizar un gasto
router.put('/:id', actualizarGasto);

// DELETE /api/gastos/:id - Eliminar un gasto
router.delete('/:id', eliminarGasto);

export default router;
