// backend/src/routes/usuariosRoutes.ts
// Rutas para gestión de usuarios en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getNegociosDropdown,
  getRolesDropdown
} from '../controllers/usuariosController';

// Crea una instancia del router
const router = Router();

// Ruta GET para obtener todos los usuarios
// Endpoint: GET /api/usuarios
router.get('/', getUsuarios);

// Ruta POST para crear un nuevo usuario
// Endpoint: POST /api/usuarios
// Body: CreateUsuarioSistemaData
router.post('/', createUsuario);

// Ruta PUT para actualizar un usuario existente
// Endpoint: PUT /api/usuarios/:id
// Body: UpdateUsuarioSistemaData
router.put('/:id', updateUsuario);

// Ruta DELETE para eliminar un usuario (soft delete)
// Endpoint: DELETE /api/usuarios/:id
router.delete('/:id', deleteUsuario);

// Rutas para dropdowns
// Endpoint: GET /api/usuarios/negocios/dropdown
router.get('/negocios/dropdown', getNegociosDropdown);

// Endpoint: GET /api/usuarios/roles/dropdown
router.get('/roles/dropdown', getRolesDropdown);

// Exporta el router para uso en app principal
export default router;