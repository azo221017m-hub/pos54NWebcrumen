import type { Response } from 'express';
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
export const obtenerCatModeradores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ mensaje: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

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
export const obtenerCatModeradorPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Sólo registros del negocio del usuario: un id ajeno responde 404
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({ mensaje: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

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
      WHERE idmodref = ? AND idnegocio = ?`,
      [id, idnegocio]
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
      estatus,
      moderadores
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(400).json({ mensaje: 'El usuario no está autenticado' });
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

    // Obtener el registro completo creado
    const [createdRows] = await pool.query<CatModerador[]>(
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
      [result.insertId]
    );

    console.log('✅ Categoría moderador creada con ID:', result.insertId);

    res.status(201).json(createdRows[0]);
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
export const actualizarCatModerador = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      nombremodref,
      estatus,
      moderadores
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(400).json({ mensaje: 'El usuario no está autenticado' });
      return;
    }

    console.log('🔵 Actualizando categoría moderador ID:', id);

    await connection.beginTransaction();

    // Acotado al negocio del usuario: una categoría ajena responde 404
    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmodref 
      SET nombremodref = ?,
          fehamodificacionauditoria = NOW(),
          usuarioauditoria = ?,
          estatus = ?,
          moderadores = ?
      WHERE idmodref = ? AND idnegocio = ?`,
      [nombremodref, usuarioauditoria, estatus, moderadores || '', id, idnegocio]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      res.status(404).json({ mensaje: 'Categoría moderador no encontrada' });
      return;
    }

    // Obtener el registro completo actualizado
    const [updatedRows] = await pool.query<CatModerador[]>(
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

    console.log('✅ Categoría moderador actualizada');

    res.status(200).json(updatedRows[0]);
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
export const eliminarCatModerador = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({ mensaje: 'El usuario no está autenticado' });
      return;
    }

    console.log('🔵 Eliminando categoría moderador ID:', id);

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmodref 
      SET estatus = 0,
          fehamodificacionauditoria = NOW()
      WHERE idmodref = ? AND idnegocio = ?`,
      [id, idnegocio]
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
