import { Router } from 'express';
import {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../controllers/proveedores.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas CRUD
router.get('/', obtenerProveedores);
router.get('/:id_proveedor', obtenerProveedorPorId);
router.post('/', crearProveedor);
router.put('/:id_proveedor', actualizarProveedor);
router.delete('/:id_proveedor', eliminarProveedor);

export default router;
