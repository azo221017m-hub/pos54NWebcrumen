// backend/src/routes/negociosRoutes.ts
// Rutas para gestión de negocios en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { getAllNegocios, createNegocio, updateNegocio } from '../controllers/negociosController'; // Importa controladores

// Crea una instancia del router
const router = Router();

// Ruta GET para obtener todos los negocios
// Endpoint: GET /api/negocios
router.get('/', getAllNegocios);

// Ruta POST para crear un nuevo negocio
// Endpoint: POST /api/negocios
// Body: CreateNegocioData
router.post('/', createNegocio);

// Ruta PUT para actualizar un negocio existente
// Endpoint: PUT /api/negocios/:id
// Params: id (idNegocio)
// Body: Campos a actualizar
router.put('/:id', updateNegocio);

// Exporta el router para uso en app principal
export default router;