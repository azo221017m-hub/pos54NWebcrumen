// Rutas base para categorías
import { Router } from 'express';
import { createCategoria, getCategorias, updateCategoria } from '../controllers/categoriaController';
import uploadCategoria from '../middlewares/multerCategoria';

const router = Router();

router.post('/categorias', uploadCategoria.single('imagencategoria'), createCategoria);
router.get('/categorias', getCategorias);
router.put('/categorias/:id', uploadCategoria.single('imagencategoria'), updateCategoria);

export default router;
