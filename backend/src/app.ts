import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { cacheMiddleware } from './middlewares/cache';

// Importar rutas
import productosRoutes from './routes/productos.routes';
import ventasRoutes from './routes/ventas.routes';
import inventarioRoutes from './routes/inventario.routes';
import authRoutes from './routes/auth.routes';
import negociosRoutes from './routes/negocios.routes';
import rolesRoutes from './routes/roles.routes';
import usuariosRoutes from './routes/usuarios.routes';
import umcompraRoutes from './routes/umcompra.routes';
import mesasRoutes from './routes/mesas.routes';
import descuentosRoutes from './routes/descuentos.routes';
import insumosRoutes from './routes/insumos.routes';
import clientesRoutes from './routes/clientes.routes';
import cuentasContablesRoutes from './routes/cuentasContables.routes';
import moderadoresRoutes from './routes/moderadores.routes';
import subrecetasRoutes from './routes/subrecetas.routes';
import recetasRoutes from './routes/recetas.routes';
import categoriasRoutes from './routes/categorias.routes';
import catModeradoresRoutes from './routes/catModeradores.routes';
import productosWebRoutes from './routes/productosWeb.routes';
import proveedoresRoutes from './routes/proveedores.routes';
import ventasWebRoutes from './routes/ventasWeb.routes';
import turnosRoutes from './routes/turnos.routes';
import pagosRoutes from './routes/pagos.routes';

// Cargar dotenv según el ambiente
// En desarrollo: desde el directorio del proyecto
// En producción: desde /etc/secrets/
const dotenv = require('dotenv');
const fs = require('fs');

if (process.env.NODE_ENV === 'production') {
  // En producción, cargar desde /etc/secrets/
  const envPath = path.join('/etc/secrets', '.env');
  
  // Verificar que el archivo existe antes de intentar cargarlo
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.error(`❌ Error al cargar variables de entorno desde ${envPath}:`, result.error);
      process.exit(1);
    }
    console.log(`✅ Variables de entorno cargadas desde: ${envPath}`);
  } else {
    console.error(`❌ ERROR FATAL: No se encuentra el archivo .env en ${envPath}`);
    console.error('Por favor, configure el archivo .env en /etc/secrets/ antes de iniciar el servidor');
    process.exit(1);
  }
} else {
  // En desarrollo, cargar desde el directorio del proyecto
  const result = dotenv.config();
  if (result.error) {
    console.warn('⚠️  No se encontró archivo .env en el directorio del proyecto');
  } else {
    console.log('✅ Variables de entorno cargadas desde el directorio del proyecto');
  }
}

// Validación de variables de entorno críticas
const requiredEnvVars = {
  JWT_SECRET: process.env.JWT_SECRET,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT
};

const missingVars: string[] = [];
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    missingVars.push(key);
  }
}

if (missingVars.length > 0) {
  console.error('❌ ERROR FATAL: Las siguientes variables de entorno críticas no están configuradas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPor favor, configure estas variables en el archivo .env antes de iniciar el servidor');
  if (process.env.NODE_ENV === 'production') {
    console.error('Ubicación esperada: /etc/secrets/.env');
  }
  process.exit(1);
}

// Validación adicional del puerto de base de datos
const dbPort = parseInt(requiredEnvVars.DB_PORT || '');
if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
  console.error('❌ ERROR FATAL: DB_PORT debe ser un número válido entre 1 y 65535');
  console.error(`   Valor actual: ${process.env.DB_PORT}`);
  process.exit(1);
}

console.log('✅ Variables de entorno validadas correctamente');

const app: Application = express();

// Configuración de CORS para producción
const allowedOrigins = [
  'http://localhost:5173', // Desarrollo local
  process.env.FRONTEND_URL || 'https://pos54nwebcrumen.onrender.com' // Producción
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir peticiones sin origin (como Postman) o desde orígenes permitidos
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares globales
app.use(helmet()); // Seguridad
app.use(cors(corsOptions)); // CORS configurado

// Configuración de logging mejorada
// Usar formato 'combined' en producción y 'dev' en desarrollo
// Skip logging de 304 responses para reducir ruido en consola
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  skip: (_req, res) => {
    // Skip 304 responses para reducir mensajes en consola
    return res.statusCode === 304;
  }
}));

// Middleware de caché para optimizar respuestas 304
app.use(cacheMiddleware);

app.use(express.json({ limit: '10mb' })); // Parser JSON con límite aumentado
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos desde la carpeta public
app.use('/public', express.static(path.join(__dirname, '../public')));

// Ruta raíz - Información de la API
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    success: true,
    message: 'API POS Crumen - Bienvenido',
    version: '2.5.B12',
    docs: 'Use /api/health para verificar el estado del servidor',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      productos: '/api/productos',
      ventas: '/api/ventas'
    },
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'API POS Crumen funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/negocios', negociosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/umcompra', umcompraRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/descuentos', descuentosRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/cuentas-contables', cuentasContablesRoutes);
app.use('/api/moderadores', moderadoresRoutes);
app.use('/api/subrecetas', subrecetasRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/cat-moderadores', catModeradoresRoutes);
app.use('/api/productos-web', productosWebRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/ventas-web', ventasWebRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/pagos', pagosRoutes);

// Manejo de rutas no encontradas (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: _req.originalUrl
  });
});

export default app;
