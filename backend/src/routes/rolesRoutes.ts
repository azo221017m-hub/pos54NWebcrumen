// backend/src/routes/rolesRoutes.ts
// Rutas para gestión de roles de usuario

import { Router } from 'express'; // Importa Router de Express
import { 
  getRolesController, 
  createRolController,
  updateRolController,
  deleteRolController
} from '../controllers/rolesController'; // Importa controladores

// Crea el router de roles
const router = Router();

// Ruta para obtener todos los roles
router.get('/', getRolesController);

// Ruta para crear un nuevo rol
router.post('/', createRolController);

// Ruta para actualizar un rol existente
router.put('/:id', updateRolController);

// Ruta para eliminar (inactivar) un rol
router.delete('/:id', deleteRolController);

// Exporta el router
export default router;