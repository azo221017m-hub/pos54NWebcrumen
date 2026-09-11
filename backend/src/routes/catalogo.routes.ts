import { Router } from 'express';
import {
  obtenerVersion,
  sincronizar,
  obtenerCompleto,
  reconstruir
} from '../controllers/catalogo.controller';
import { authMiddleware, checkPrivilegio } from '../middlewares/auth';

const router = Router();

// Todas las rutas requieren JWT válido. El negocio se deriva del token,
// nunca de parámetros enviados por el cliente.
router.use(authMiddleware);

// GET /api/catalogo/version - versión actual del catálogo del negocio
router.get('/version', obtenerVersion);

// GET /api/catalogo/sync?since=N - cambios incrementales (o snapshot completo)
router.get('/sync', sincronizar);

// GET /api/catalogo/full - snapshot completo (reconstrucción local)
router.get('/full', obtenerCompleto);

// POST /api/catalogo/rebuild - fuerza reconstrucción en todos los dispositivos del negocio
router.post('/rebuild', checkPrivilegio(5), reconstruir);

export default router;
