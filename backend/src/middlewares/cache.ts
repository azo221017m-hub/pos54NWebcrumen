import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para configurar headers de caché para respuestas GET
 * Ayuda a que los 304 (Not Modified) se procesen más rápido
 */
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Solo aplicar a GET requests
  if (req.method === 'GET') {
    // Configurar Cache-Control para permitir validación con el servidor
    // max-age=0 fuerza validación, pero permite usar cache si no cambió (304)
    res.set('Cache-Control', 'private, max-age=0, must-revalidate');
    
    // Express genera ETags automáticamente, pero aseguramos que esté habilitado
    // El ETag ayuda al navegador a saber si el contenido cambió
  }
  
  next();
};
