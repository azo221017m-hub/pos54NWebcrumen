import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

// Interface para tblposcrumenwebmodref
interface CatModerador extends RowDataPacket {
  idmodref: number;
  nombremodref: string;
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date | null;
  idnegocio: number;
  estatus: number;
  moderadores: string; // longtext - IDs separados por comas
}

// Obtener todas las categorías moderador por negocio
export const obtenerCatModeradores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;

    console.log('🔵 Obteniendo categorías moderador para negocio:', idnegocio);

    const [rows] = await pool.query<CatModerador[]>(
      `SELECT 
        idmodref,
        nombremodref,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio,
        estatus,
        moderadores
      FROM tblposcrumenwebmodref
      WHERE idnegocio = ?
      ORDER BY nombremodref ASC`,
      [idnegocio]
    );

    console.log('✅ Categorías moderador obtenidas:', rows.length);
    res.status(200).json(rows);
  } catch (error) {
    console.error('🔴 Error al obtener categorías moderador:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener categorías moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener una categoría moderador por ID
export const obtenerCatModeradorPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('🔵 Obteniendo categoría moderador ID:', id);

    const [rows] = await pool.query<CatModerador[]>(
      `SELECT 
        idmodref,
        nombremodref,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio,
        estatus,
        moderadores
      FROM tblposcrumenwebmodref
      WHERE idmodref = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ mensaje: 'Categoría moderador no encontrada' });
      return;
    }

    console.log('✅ Categoría moderador obtenida:', rows[0].nombremodref);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('🔴 Error al obtener categoría moderador:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener categoría moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nueva categoría moderador
export const crearCatModerador = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    const {
      nombremodref,
      usuarioauditoria,
      estatus,
      moderadores
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({ mensaje: 'Usuario no autenticado' });
      return;
    }

    console.log('🔵 Creando categoría moderador:', nombremodref);

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebmodref
      (nombremodref, fechaRegistroauditoria, usuarioauditoria, 
       fehamodificacionauditoria, idnegocio, estatus, moderadores)
      VALUES (?, NOW(), ?, NOW(), ?, ?, ?)`,
      [nombremodref, usuarioauditoria, idnegocio, estatus, moderadores || '']
    );

    await connection.commit();

    console.log('✅ Categoría moderador creada con ID:', result.insertId);
    res.status(201).json({
      mensaje: 'Categoría moderador creada exitosamente',
      idmodref: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('🔴 Error al crear categoría moderador:', error);
    res.status(500).json({ 
      mensaje: 'Error al crear categoría moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  } finally {
    connection.release();
  }
};

// Actualizar categoría moderador
export const actualizarCatModerador = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      nombremodref,
      usuarioauditoria,
      estatus,
      moderadores
    } = req.body;

    console.log('🔵 Actualizando categoría moderador ID:', id);

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmodref 
      SET nombremodref = ?,
          fehamodificacionauditoria = NOW(),
          usuarioauditoria = ?,
          estatus = ?,
          moderadores = ?
      WHERE idmodref = ?`,
      [nombremodref, usuarioauditoria, estatus, moderadores || '', id]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      res.status(404).json({ mensaje: 'Categoría moderador no encontrada' });
      return;
    }

    console.log('✅ Categoría moderador actualizada');
    res.status(200).json({ mensaje: 'Categoría moderador actualizada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('🔴 Error al actualizar categoría moderador:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar categoría moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  } finally {
    connection.release();
  }
};

// Eliminar categoría moderador (soft delete)
export const eliminarCatModerador = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    console.log('🔵 Eliminando categoría moderador ID:', id);

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmodref 
      SET estatus = 0,
          fehamodificacionauditoria = NOW()
      WHERE idmodref = ?`,
      [id]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      res.status(404).json({ mensaje: 'Categoría moderador no encontrada' });
      return;
    }

    console.log('✅ Categoría moderador eliminada');
    res.status(200).json({ mensaje: 'Categoría moderador eliminada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('🔴 Error al eliminar categoría moderador:', error);
    res.status(500).json({ 
      mensaje: 'Error al eliminar categoría moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  } finally {
    connection.release();
  }
};
