import { Router } from 'express';
import {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientesPorTelefono
} from '../controllers/clientes.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas CRUD
router.get('/buscar-por-telefono', buscarClientesPorTelefono);
router.get('/', obtenerClientes);
router.get('/:idCliente', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:idCliente', actualizarCliente);
router.delete('/:idCliente', checkPrivilegio(5), eliminarCliente);

export default router;
