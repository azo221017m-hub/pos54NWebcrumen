// backend/src/routes/rolesRoutes.ts
// Rutas para gestión de roles de usuario

import { Router } from 'express'; // Importa Router de Express
import { 
  getRolesController, 
  getRolesCompleteController, 
  createRolController,
  updateRolController
} from '../controllers/rolesController'; // Importa controladores

// Crea el router de roles
const router = Router();

// Ruta para obtener roles activos (para dropdowns)
router.get('/', getRolesController);

// Ruta para obtener todos los roles completos (para gestión)
router.get('/complete', getRolesCompleteController);

// Ruta para crear un nuevo rol
router.post('/', createRolController);

// Ruta para actualizar un rol existente
router.put('/:id', updateRolController);

// Exporta el router
export default router;