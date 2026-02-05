import { createPool } from 'mysql2/promise';
import { MEXICO_TIMEZONE_OFFSET } from '../utils/dateTime';

// Solo cargar dotenv en desarrollo, en producción usar variables de entorno del sistema
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config();
}

// Validación de variables de entorno críticas
if (!process.env.DB_HOST) {
  throw new Error('DB_HOST no definido');
}

// Configuración de conexión a MySQL
// Pool optimizado para manejar múltiples conexiones concurrentes
const dbConfig: any = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos_crumen',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 20, // Aumentado de 10 a 20 para mejor rendimiento
  queueLimit: 0,
  enableKeepAlive: true, // Mantener conexiones vivas
  keepAliveInitialDelay: 0,
  timezone: MEXICO_TIMEZONE_OFFSET // Configurar zona horaria de México (-06:00)
};

// Configuración SSL si está habilitada (por defecto en producción)
// Se puede deshabilitar en desarrollo con DB_SSL=false
const sslEnabled = process.env.DB_SSL !== 'false';
if (sslEnabled) {
  dbConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };
  
  // Soporte para certificado CA personalizado
  if (process.env.DB_SSL_CA) {
    dbConfig.ssl.ca = process.env.DB_SSL_CA;
  }
}

// Pool de conexiones
export const pool = createPool(dbConfig);

// Verificar conexión con reintentos
export const testConnection = async (maxRetries = 3, retryDelay = 2000) => {
  let lastError: Error | unknown = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento de conexión a MySQL (${attempt}/${maxRetries})...`);
      console.log(`   📍 Host: ${dbConfig.host}:${dbConfig.port}`);
      console.log(`   👤 Usuario: ${dbConfig.user}`);
      console.log(`   🗄️  Base de datos: ${dbConfig.database}`);
      
      const connection = await pool.getConnection();
      console.log('✅ Conexión exitosa a MySQL');
      connection.release();
      return true;
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Intento ${attempt} fallido:`, errorMessage);
      
      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        console.log(`⏳ Esperando ${retryDelay / 1000}s antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  console.error('\n❌ ERROR DE CONEXIÓN A MYSQL');
  console.error('═══════════════════════════════════════════════════════════');
  console.error('Detalles de la configuración intentada:');
  console.error(`  Host: ${dbConfig.host}`);
  console.error(`  Puerto: ${dbConfig.port}`);
  console.error(`  Usuario: ${dbConfig.user}`);
  console.error(`  Base de datos: ${dbConfig.database}`);
  console.error('═══════════════════════════════════════════════════════════');
  const errorCode = (lastError as any)?.code;
  const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  console.error('Error recibido:', errorCode || errorMessage);
  console.error('═══════════════════════════════════════════════════════════');
  
  if (dbConfig.host === 'localhost' || dbConfig.host === '127.0.0.1') {
    console.error('\n⚠️  ADVERTENCIA: Intentando conectar a "localhost"');
    console.error('   Si estás en producción, verifica que DB_HOST esté configurado');
    console.error('   con el host correcto del servidor MySQL.');
    console.error('   Ejemplo: DB_HOST=crumenprod01.mysql.database.azure.com');
  }
  
  if (errorCode === 'ECONNREFUSED') {
    console.error('\n💡 POSIBLES CAUSAS:');
    console.error('   1. MySQL no está corriendo en el host especificado');
    console.error('   2. El firewall está bloqueando la conexión');
    console.error('   3. El host o puerto son incorrectos');
    console.error('   4. En producción: verifica las variables de entorno en /etc/secrets/.env');
  } else if (errorCode === 'ER_ACCESS_DENIED_ERROR') {
    console.error('\n💡 POSIBLES CAUSAS:');
    console.error('   1. Usuario o contraseña incorrectos');
    console.error('   2. El usuario no tiene permisos para acceder a la base de datos');
  } else if (errorCode === 'ENOTFOUND') {
    console.error('\n💡 POSIBLES CAUSAS:');
    console.error('   1. El nombre del host es incorrecto o no existe');
    console.error('   2. Problemas de DNS o de red');
  }
  
  console.error('═══════════════════════════════════════════════════════════\n');
  
  return false;
};

export default pool;
