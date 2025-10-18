// backend/src/app.ts
// Aplicación principal del servidor POSWEBCrumen

import express from 'express'; // Importa Express para crear el servidor
import dotenv from 'dotenv'; // Importa dotenv para variables de entorno
import { testConnection } from './config/database'; // Importa función de prueba de BD
import corsMiddleware from './middlewares/cors'; // Importa middleware CORS

// Importa las rutas de la aplicación
import authRoutes from './routes/authRoutes'; // Rutas de autenticación
import usuariosRoutes from './routes/usuariosRoutes'; // Rutas de usuarios
import negociosRoutes from './routes/negociosRoutes'; // Rutas de negocios
import rolesRoutes from './routes/rolesRoutes'; // Rutas de roles
import clientesRoutes from './routes/clientesRoutes'; // Rutas de clientes
import parametrosNegocioRoutes from './routes/parametrosNegocioRoutes'; // Rutas de parámetros
import categoriasRoutes from './routes/categoriasRoutes'; // Rutas de categorías
import productosRoutes from './routes/productosRoutes'; // Rutas de productos
import insumosRoutes from './routes/insumosRoutes'; // Rutas de insumos

// Carga las variables de entorno
dotenv.config();

// Crea la aplicación Express
const app = express();

// Define el puerto del servidor
const PORT = process.env.PORT || 4000;

// Middleware global para parsear JSON
app.use(express.json({ limit: '10mb' })); // Permite JSON hasta 10MB

// Middleware global para parsear datos de formularios
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Aplica middleware CORS
app.use(corsMiddleware);

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log(`📊 ${req.method} ${req.url} - ${new Date().toISOString()}`); // Log de petición
  next(); // Continúa al siguiente middleware
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  console.log('💊 Health check solicitado'); // Log de health check
  res.json({
    success: true,
    message: 'Servidor POSWEBCrumen funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/usuarios', usuariosRoutes); // Rutas de usuarios
app.use('/api/negocios', negociosRoutes); // Rutas de negocios
app.use('/api/roles', rolesRoutes); // Rutas de roles
app.use('/api/clientes', clientesRoutes); // Rutas de clientes
app.use('/api/parametros-negocio', parametrosNegocioRoutes); // Rutas de parámetros
app.use('/api/categorias', categoriasRoutes); // Rutas de categorías
app.use('/api/productos', productosRoutes); // Rutas de productos
app.use('/api/insumos', insumosRoutes); // Rutas de insumos

// Ruta de bienvenida
app.get('/', (req, res) => {
  console.log('🏠 Ruta raíz accedida'); // Log de acceso
  res.json({
    success: true,
    message: '🚀 Bienvenido a POSWEBCrumen API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios', 
      negocios: '/api/negocios',
      health: '/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  console.log('❌ Ruta no encontrada:', req.originalUrl); // Log de ruta no encontrada
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    error: 'NOT_FOUND'
  });
});

// Middleware global de manejo de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Error no manejado:', error); // Log de error
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_ERROR'
  });
});

// Función para iniciar el servidor
const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Iniciando servidor POSWEBCrumen...'); // Log de inicio
    
    // Prueba la conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos'); // Log de error BD
      process.exit(1); // Termina el proceso si no hay conexión a BD
    }
    
    // Inicia el servidor
    app.listen(PORT, () => {
      console.log('✅ Servidor iniciado exitosamente'); // Log de éxito
      console.log(`🌐 Servidor corriendo en puerto: ${PORT}`); // Log de puerto
      console.log(`📡 URL del servidor: http://localhost:${PORT}`); // Log de URL
      console.log(`💾 Base de datos: ${process.env.DB_NAME}`); // Log de BD
      console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`); // Log de frontend
      console.log('📋 Endpoints disponibles:'); // Log de endpoints
      console.log('   - GET  /health'); // Health check
      console.log('   - POST /api/auth/login'); // Login
      console.log('   - GET  /api/usuarios'); // Obtener usuarios
      console.log('   - POST /api/usuarios'); // Crear usuario
      console.log('   - PUT  /api/usuarios/:id'); // Actualizar usuario
      console.log('   - GET  /api/negocios'); // Obtener negocios
      console.log('   - POST /api/negocios'); // Crear negocio
      console.log('   - PUT  /api/negocios/:id'); // Actualizar negocio
      console.log('   - GET  /api/categorias'); // Obtener categorías
      console.log('   - POST /api/categorias'); // Crear categoría
      console.log('   - GET  /api/categorias/dropdown'); // Dropdown categorías
      console.log('   - GET  /api/insumos'); // Obtener insumos
      console.log('   - POST /api/insumos'); // Crear insumo
    });
    
  } catch (error) {
    console.error('💥 Error iniciando servidor:', error); // Log de error fatal
    process.exit(1); // Termina el proceso en caso de error
  }
};

// Manejo de señales del sistema para cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...'); // Log de cierre
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...'); // Log de cierre
  process.exit(0);
});

// Inicia el servidor
startServer();