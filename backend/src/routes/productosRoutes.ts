// backend/src/routes/productosRoutes.ts
// Rutas para gestión de productos

import { Router } from 'express'; // Importa Router de Express
import multer, { FileFilterCallback } from 'multer'; // Importa multer para manejo de archivos
import type { Request } from 'express'; // Importa Request para tipos
import {
  getProductosController,
  getProductosByNegocioController,
  getProductoImagenController,
  createProductoController,
  updateProductoController,
  deleteProductoController
} from '../controllers/productosController'; // Importa controladores

const router = Router(); // Crea instancia del router

// Configuración de multer para manejo de imágenes
const storage = multer.memoryStorage(); // Usar memoria para almacenar temporalmente
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB por archivo
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Validar que el archivo sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false); // Rechazar el archivo sin error
    }
  }
});

// Ruta para obtener todos los productos
// GET /api/productos
router.get('/', getProductosController);

// Ruta para obtener productos por negocio
// GET /api/productos/negocio/:idNegocio
router.get('/negocio/:idNegocio', getProductosByNegocioController);

// Ruta para obtener imagen de un producto
// GET /api/productos/:id/imagen
router.get('/:id/imagen', getProductoImagenController);

// Ruta para crear un nuevo producto (con imagen opcional)
// POST /api/productos
router.post('/', upload.single('imagenProducto'), createProductoController);

// Ruta para actualizar un producto existente (con imagen opcional)
// PUT /api/productos/:id
router.put('/:id', upload.single('imagenProducto'), updateProductoController);

// Ruta para eliminar (desactivar) un producto
// DELETE /api/productos/:id
router.delete('/:id', deleteProductoController);

export default router; // Exporta el router