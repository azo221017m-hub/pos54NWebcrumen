import { Router } from 'express';
import {
  obtenerProductosWeb,
  obtenerProductoWebPorId,
  verificarNombreProducto,
  crearProductoWeb,
  actualizarProductoWeb,
  eliminarProductoWeb
} from '../controllers/productosWeb.controller';

const router = Router();

// Rutas para productos web
router.get('/negocio/:idnegocio', obtenerProductosWeb);
router.get('/verificar-nombre', verificarNombreProducto);
router.get('/:id', obtenerProductoWebPorId);
router.post('/', crearProductoWeb);
router.put('/:id', actualizarProductoWeb);
router.delete('/:id', eliminarProductoWeb);

export default router;
