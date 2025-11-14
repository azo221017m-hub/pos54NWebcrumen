// backend/src/routes/cuentaContableRoutes.ts
// Rutas para gestión de cuentas contables

import { Router } from 'express';
import {
  getCuentasContables,
  createCuentaContable,
  updateCuentaContable,
  deleteCuentaContable
} from '../controllers/cuentaContableController';

// Crear instancia del router
const router = Router();

// Definir rutas para cuentas contables
router.get('/', getCuentasContables);           // GET /api/cuentas-contables
router.post('/', createCuentaContable);         // POST /api/cuentas-contables
router.put('/:id', updateCuentaContable);       // PUT /api/cuentas-contables/:id
router.delete('/:id', deleteCuentaContable);    // DELETE /api/cuentas-contables/:id

// Exportar el router
export default router;