// backend/src/routes/negociosRoutes.ts
// Rutas para operaciones CRUD de negocios y sus parámetros

import express from 'express';
import {
  getNegocios,
  createNegocio,
  updateNegocio,
  deleteNegocio,
  createParametrosNegocio,
  updateParametrosNegocio
} from '../controllers/negociosController';

const router = express.Router();

// Ruta para obtener todos los negocios con sus parámetros
// GET /api/negocios
router.get('/', getNegocios);

// Ruta para crear un nuevo negocio
// POST /api/negocios
router.post('/', createNegocio);

// Ruta para actualizar un negocio existente
// PUT /api/negocios/:id
router.put('/:id', updateNegocio);

// Ruta para eliminar (desactivar) un negocio
// DELETE /api/negocios/:id
router.delete('/:id', deleteNegocio);

// Ruta para crear parámetros de negocio
// POST /api/negocios/parametros
router.post('/parametros', createParametrosNegocio);

// Ruta para actualizar parámetros de negocio
// PUT /api/negocios/:id/parametros
router.put('/:id/parametros', updateParametrosNegocio);

export default router;