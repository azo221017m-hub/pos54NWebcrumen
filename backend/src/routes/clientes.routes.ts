import { Router } from 'express';
import {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../controllers/clientes.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas CRUD
router.get('/negocio/:idnegocio', obtenerClientes);
router.get('/:idCliente', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:idCliente', actualizarCliente);
router.delete('/:idCliente', eliminarCliente);

export default router;
