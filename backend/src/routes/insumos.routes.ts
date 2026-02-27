import { Router } from 'express';
import {
  obtenerInsumos,
  obtenerInsumosInventariables,
  obtenerInsumoPorId,
  crearInsumo,
  actualizarInsumo,
  eliminarInsumo,
  validarNombreInsumo
} from '../controllers/insumos.controller';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);
router.use(apiLimiter);

// Rutas CRUD
router.get('/negocio/:idnegocio/inventariables', obtenerInsumosInventariables);
router.get('/negocio/:idnegocio', obtenerInsumos);
router.get('/validar-nombre/:nombre', validarNombreInsumo);
router.get('/:id_insumo', obtenerInsumoPorId);
router.post('/', crearInsumo);
router.put('/:id_insumo', actualizarInsumo);
router.delete('/:id_insumo', eliminarInsumo);

export default router;
