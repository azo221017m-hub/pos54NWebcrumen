// backend/src/routes/parametrosNegocioRoutes.ts
// Rutas para gestión de parámetros de negocio

import { Router } from 'express'; // Importa Router de Express
import { 
  getParametrosNegocioController, 
  createParametrosNegocioController,
  createNegocioCompletoController 
} from '../controllers/parametrosNegocioController'; // Importa controladores

// Crea el router de parámetros de negocio
const router = Router();

// Ruta para obtener parámetros de un negocio específico
router.get('/:idNegocio', getParametrosNegocioController);

// Ruta para crear parámetros de negocio
router.post('/', createParametrosNegocioController);

// Ruta para registro completo de negocio
router.post('/completo', createNegocioCompletoController);

// Exporta el router
export default router;