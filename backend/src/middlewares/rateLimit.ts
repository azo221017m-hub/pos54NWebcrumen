import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para rutas generales de API
 * Permite 100 peticiones por 15 minutos por IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  message: {
    success: false,
    error: 'Demasiadas peticiones',
    message: 'Ha excedido el límite de peticiones. Por favor, intente más tarde.'
  },
  standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
});

/**
 * Rate limiter estricto para operaciones sensibles
 * Permite 20 peticiones por 15 minutos por IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Límite de 20 peticiones por ventana
  message: {
    success: false,
    error: 'Demasiadas peticiones',
    message: 'Ha excedido el límite de peticiones para esta operación. Por favor, intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
