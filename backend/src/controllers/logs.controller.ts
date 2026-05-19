import { Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

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
        usuario ?? null,
        accion ?? null,
        modulo ?? null,
        tabla_afectada ?? null,
        idregistro !== undefined && idregistro !== null ? String(idregistro) : null,
        descripcion ?? null,
        ip,
        equipo ? String(equipo).substring(0, 150) : null,
      ]
    );

    res.status(201).json({ success: true, data: { idlog: result.insertId } });
  } catch (error) {
    console.error('Error al registrar log:', error);
    res.status(500).json({ success: false, message: 'Error al registrar log' });
  }
};
