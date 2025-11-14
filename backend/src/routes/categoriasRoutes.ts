// backend/src/routes/categoriasRoutes.ts
// Rutas para gestión de categorías de productos

import { Router } from 'express'; // Importa Router de Express
import {
  getCategoriasController,
  getCategoriasDropdownController,
  createCategoriaController,
  updateCategoriaController,
  deleteCategoriaController
} from '../controllers/categoriasController'; // Importa controladores
import uploadCategoriaImage from '../middlewares/multerCategorias';

const router = Router(); // Crea instancia del router

// Ruta para obtener todas las categorías
// GET /api/categorias
router.get('/', getCategoriasController);

// Ruta para obtener categorías para dropdown (solo id y nombre)
// GET /api/categorias/dropdown
router.get('/dropdown', getCategoriasDropdownController);

// Ruta para crear una nueva categoría (con imagen)
// POST /api/categorias
router.post('/', uploadCategoriaImage.single('imagencategoria'), createCategoriaController);

// Ruta para actualizar una categoría existente
// PUT /api/categorias/:id
router.put('/:id', updateCategoriaController);

// Ruta para eliminar (desactivar) una categoría
// DELETE /api/categorias/:id
router.delete('/:id', deleteCategoriaController);

export default router; // Exporta el router