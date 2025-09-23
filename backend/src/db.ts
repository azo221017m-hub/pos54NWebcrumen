import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
});

export const probarConexion = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Conexión a MySQL exitos4');
    conn.release();
  } catch (error) {
    console.error('Error al conectar a MySQL:', error);
  }
};
