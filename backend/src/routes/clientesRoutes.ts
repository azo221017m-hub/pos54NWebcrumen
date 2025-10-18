// backend/src/routes/clientesRoutes.ts
// Rutas para gestión de clientes

import { Router } from 'express'; // Importa Router de Express
import { 
  getClientesController, 
  createClienteController 
} from '../controllers/clientesController'; // Importa controladores

// Crea el router de clientes
const router = Router();

// Ruta para obtener todos los clientes
router.get('/', getClientesController);

// Ruta para crear un nuevo cliente
router.post('/', createClienteController);

// Exporta el router
export default router;