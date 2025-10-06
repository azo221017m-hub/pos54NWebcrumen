// src/db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Función para probar conexión
export const probarConexion = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("Conexi0n a MySQL producción exitos4 ✅");
    conn.release();
  } catch (error) {
    console.error("Err0r al conect4r a MySQL producción:", error);
  }
};