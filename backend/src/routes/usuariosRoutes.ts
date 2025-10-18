// backend/src/routes/usuariosRoutes.ts
// Rutas para gestión de usuarios en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { getAllUsuarios, createUsuario, updateUsuario } from '../controllers/usuariosController'; // Importa controladores

// Crea una instancia del router
const router = Router();

// Ruta GET para obtener todos los usuarios
// Endpoint: GET /api/usuarios
router.get('/', getAllUsuarios);

// Ruta POST para crear un nuevo usuario
// Endpoint: POST /api/usuarios
// Body: CreateUsuarioData
router.post('/', createUsuario);

// Ruta PUT para actualizar un usuario existente
// Endpoint: PUT /api/usuarios/:id
// Params: id (idUsuario)
// Body: Campos a actualizar
router.put('/:id', updateUsuario);

// Exporta el router para uso en app principal
export default router;