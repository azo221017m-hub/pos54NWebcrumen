import { Router } from 'express';
import {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientesPorTelefono,
  buscarClientesPorReferencia
} from '../controllers/clientes.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);
router.use(apiLimiter);

// Rutas CRUD
router.get('/buscar-por-telefono', buscarClientesPorTelefono);
router.get('/buscar-por-referencia', buscarClientesPorReferencia);
router.get('/', obtenerClientes);
router.get('/:idCliente', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:idCliente', actualizarCliente);
router.delete('/:idCliente', checkPrivilegio(5), eliminarCliente);

export default router;
