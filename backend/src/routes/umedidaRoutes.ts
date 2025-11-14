// backend/src/routes/umedidaRoutes.ts
// Rutas para gestión de Unidades de Medida de Compra

import { Router } from 'express'; // Importa Router de Express
import {
  getUMedidas,
  createUMedida,
  updateUMedida,
  deleteUMedida
} from '../controllers/umedidaController';

// Crea una instancia del router
const router = Router();

// Ruta GET para obtener todas las unidades de medida
// Endpoint: GET /api/umedidas
router.get('/', getUMedidas);

// Ruta POST para crear una nueva unidad de medida
// Endpoint: POST /api/umedidas
// Body: CreateUMedidaData
router.post('/', createUMedida);

// Ruta PUT para actualizar una unidad de medida existente
// Endpoint: PUT /api/umedidas/:id
// Body: UpdateUMedidaData
router.put('/:id', updateUMedida);

// Ruta DELETE para eliminar una unidad de medida
// Endpoint: DELETE /api/umedidas/:id
router.delete('/:id', deleteUMedida);

// Exporta el router para uso en app principal
export default router;