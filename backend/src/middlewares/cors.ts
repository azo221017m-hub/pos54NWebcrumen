// backend/src/middlewares/cors.ts
// Middleware CORS para POSWEBCrumen

import cors from 'cors'; // Importa cors
import type { CorsOptions } from 'cors'; // Importa tipos de cors

// Configuración de CORS para permitir conexiones desde el frontend
const corsOptions: CorsOptions = {
  // Origen permitido - URL del frontend (más permisivo para desarrollo)
  origin: [
    'https://pos54nwebcrumen.onrender.com'
  ],
  
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Headers permitidos en las peticiones
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  
  // Permite envío de cookies y credenciales
  credentials: true,
  
  // Tiempo de cache para preflight requests (en segundos)
  maxAge: 3600
};

// Crea y exporta el middleware CORS configurado
const corsMiddleware = cors(corsOptions);

console.log('🌐 Middleware CORS configurado para múltiples orígenes:'); // Log de configuración
console.log('   - Server Frontend URL');


export default corsMiddleware;