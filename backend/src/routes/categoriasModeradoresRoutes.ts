// Ruta para eliminar una categoría de moderador
import { Router } from 'express';
import { deleteCategoriaModerador, getCategoriasModeradores, createCategoriaModerador, updateCategoriaModerador } from '../controllers/categoriasModeradoresController';

const router = Router();

router.delete('/categorias-moderadores/:id', deleteCategoriaModerador);

// Ruta para editar una categoría de moderador
router.put('/categorias-moderadores/:id', updateCategoriaModerador);

// Ruta para obtener todas las categorías de moderadores
router.get('/categorias-moderadores', getCategoriasModeradores);

// Ruta para crear una nueva categoría de moderador
router.post('/categorias-moderadores', createCategoriaModerador);

export default router;