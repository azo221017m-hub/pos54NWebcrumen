import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para configurar headers de caché para respuestas GET
 * Mejora el rendimiento de las respuestas 304 (Not Modified)
 */
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Solo aplicar a GET requests
  if (req.method === 'GET') {
    // Configurar Cache-Control para permitir cache durante 5 minutos
    // Después de ese tiempo, el navegador validará con el servidor (puede recibir 304)
    res.set('Cache-Control', 'private, max-age=300, must-revalidate');
    
    // Express genera ETags automáticamente por defecto
    // El ETag se usa para validación cuando el cache expira
  }
  
  next();
};
