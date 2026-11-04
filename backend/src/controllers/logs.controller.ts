import { Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

const EQUIPO_MAX_LENGTH = 150;

// Longitudes de las columnas varchar de tblposcrumenweblogs. La BD corre con
// STRICT_TRANS_TABLES: un valor más largo hace fallar el INSERT (500), p. ej.
// accion = 'Configuración Sistema' (21 caracteres) en una columna varchar(20).
const ACCION_MAX_LENGTH = 20;
const USUARIO_MAX_LENGTH = 100;
const MODULO_MAX_LENGTH = 100;
const TABLA_AFECTADA_MAX_LENGTH = 100;
const IDREGISTRO_MAX_LENGTH = 50;

const recortar = (valor: unknown, max: number): string | null =>
  valor !== undefined && valor !== null ? String(valor).substring(0, max) : null;

// Registrar un evento en tblposcrumenweblogs
export const registrarLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      idnegocio,
      idusuario,
      usuario,
      accion,
      modulo,
      tabla_afectada,
      idregistro,
      descripcion,
      equipo,
    } = req.body;

    if (!accion || !modulo) {
      res.status(400).json({ success: false, message: 'Los campos accion y modulo son requeridos' });
      return;
    }

    // Obtener IP real del cliente (considera proxy reverso en producción)
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.ip ||
      null;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenweblogs
        (idnegocio, idusuario, usuario, accion, modulo, tabla_afectada, idregistro, descripcion, ip, equipo, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        idnegocio ?? null,
        idusuario ?? null,
        recortar(usuario, USUARIO_MAX_LENGTH),
        recortar(accion, ACCION_MAX_LENGTH),
        recortar(modulo, MODULO_MAX_LENGTH),
        recortar(tabla_afectada, TABLA_AFECTADA_MAX_LENGTH),
        recortar(idregistro, IDREGISTRO_MAX_LENGTH),
        descripcion ?? null,
        ip,
        equipo ? String(equipo).substring(0, EQUIPO_MAX_LENGTH) : null,
      ]
    );

    res.status(201).json({ success: true, data: { idlog: result.insertId } });
  } catch (error) {
    console.error('Error al registrar log:', error);
    res.status(500).json({ success: false, message: 'Error al registrar log' });
  }
};
