import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

// Fuera de producción (servidor local, LAN o túnel Cloudflare/ngrok) todo el
// tráfico llega a Express por localhost, por lo que el rate limiter -que
// cuenta por IP- ve una sola IP para todos los clientes reales. Se usa un
// límite mucho más holgado en ese caso; en producción no cambia nada.
const API_LIMITER_MAX = isProduction ? 100 : 1000;
const STRICT_LIMITER_MAX = isProduction ? 20 : 200;

/**
 * Rate limiter para rutas generales de API
 * Permite 100 peticiones por 15 minutos por IP en producción
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: API_LIMITER_MAX,
  message: {
    success: false,
    error: 'Demasiadas peticiones',
    message: 'Ha excedido el límite de peticiones. Por favor, intente más tarde.'
  },
  standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
});

/**
 * Rate limiter para imágenes (logotipos): cada tarjeta del portal o fila de una
 * lista pide su imagen por separado, así que no deben consumir el presupuesto
 * compartido de apiLimiter (100 peticiones por IP para TODAS sus rutas).
 */
const IMAGE_LIMITER_MAX = isProduction ? 1000 : 5000;

export const imageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: IMAGE_LIMITER_MAX,
  message: {
    success: false,
    error: 'Demasiadas peticiones',
    message: 'Ha excedido el límite de peticiones de imágenes. Por favor, intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estricto para operaciones sensibles
 * Permite 20 peticiones por 15 minutos por IP en producción
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: STRICT_LIMITER_MAX,
  message: {
    success: false,
    error: 'Demasiadas peticiones',
    message: 'Ha excedido el límite de peticiones para esta operación. Por favor, intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
