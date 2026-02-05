import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import { MEXICO_TIMEZONE_OFFSET } from '../utils/dateTime';

dotenv.config();

// Configuración de conexión a MySQL
// Pool optimizado para manejar múltiples conexiones concurrentes
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
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

// Pool de conexiones
export const pool = createPool(dbConfig);

// Verificar conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error);
    return false;
  }
};

export default pool;
