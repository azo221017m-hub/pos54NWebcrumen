// backend/src/config/database.ts
// Configuración y conexión a la base de datos MySQL para POSWEBCrumen

import mysql from 'mysql2/promise'; // Importa el cliente MySQL con soporte para promesas
import dotenv from 'dotenv'; // Importa dotenv para cargar variables de entorno

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Configuración de la conexión a MySQL usando variables de entorno
const dbConfig = {
  host: process.env.DB_HOST, // Host del servidor MySQL
  user: process.env.DB_USER, // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  database: process.env.DB_NAME, // Nombre de la base de datos
  port: parseInt(process.env.DB_PORT || '3306'), // Puerto de MySQL (por defecto 3306)
  ssl: {
    rejectUnauthorized: false // Permite conexiones SSL no verificadas (para Azure)
  },
  connectTimeout: 30000 // Timeout de conexión en milisegundos
};

// Pool de conexiones para optimizar el rendimiento
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión a la base de datos
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Probando conexión a la base de datos...'); // Log de inicio de prueba
    const connection = await pool.getConnection(); // Obtiene una conexión del pool
    console.log('✅ Conexión a MySQL exitosa'); // Log de éxito
    connection.release(); // Libera la conexión de vuelta al pool
    return true; // Retorna true si la conexión es exitosa
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error); // Log de error
    return false; // Retorna false si hay error en la conexión
  }
};

// Función para ejecutar consultas SQL
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    console.log('🔍 Ejecutando consulta SQL:', query); // Log de la consulta
    console.log('📝 Parámetros:', params); // Log de los parámetros
    const [results] = await pool.execute(query, params); // Ejecuta la consulta
    console.log('✅ Consulta ejecutada exitosamente'); // Log de éxito
    return results; // Retorna los resultados
  } catch (error) {
    console.error('❌ Error ejecutando consulta:', error); // Log de error
    throw error; // Propaga el error
  }
};

// Función específica para comandos de transacción (no soportan prepared statements)
export const executeTransaction = async (command: string): Promise<any> => {
  try {
    console.log('🔄 Ejecutando comando de transacción:', command); // Log del comando
    const [results] = await pool.query(command); // Usa query() en lugar de execute()
    console.log('✅ Comando de transacción ejecutado exitosamente'); // Log de éxito
    return results; // Retorna los resultados
  } catch (error) {
    console.error('❌ Error ejecutando comando de transacción:', error); // Log de error
    throw error; // Propaga el error
  }
};

// Exporta el pool para uso directo si es necesario
export default pool;