import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Moderador extends RowDataPacket {
  idmoderador: number;
  nombremoderador: string;
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fehamodificacionauditoria: Date | null;
  idnegocio: number;
  estatus: number;
}

// Interface para tblposcrumenwebmodref
interface ModeradorRef extends RowDataPacket {
  idmoderadorref: number; // Mapeado desde idmodref
  nombremodref: string;
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fehamodificacionauditoria: Date | null;
  idnegocio: number;
  estatus: number;
  moderadores?: string; // Campo longtext de la tabla original
}

// Obtener todos los moderadores por negocio
export const obtenerModeradores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;
    
    const [rows] = await pool.query<Moderador[]>(
      `SELECT 
        idmoderador,
        nombremoderador,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio,
        estatus
      FROM tblposcrumenwebmoderadores
      WHERE idnegocio = ?
      ORDER BY nombremoderador ASC`,
      [idnegocio]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener moderadores:', error);
    res.status(500).json({ 
      message: 'Error al obtener moderadores', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener un moderador por ID
export const obtenerModerador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query<Moderador[]>(
      `SELECT 
        idmoderador,
        nombremoderador,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio,
        estatus
      FROM tblposcrumenwebmoderadores
      WHERE idmoderador = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Moderador no encontrado' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener moderador:', error);
    res.status(500).json({ 
      message: 'Error al obtener moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nuevo moderador
export const crearModerador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombremoderador,
      usuarioauditoria,
      estatus
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({ message: 'El usuario no está autenticado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebmoderadores (
        nombremoderador,
        fechaRegistroauditoria,
        usuarioauditoria,
        idnegocio,
        estatus
      ) VALUES (?, NOW(), ?, ?, ?)`,
      [
        nombremoderador,
        usuarioauditoria,
        idnegocio,
        estatus ?? 1
      ]
    );

    res.status(201).json({
      message: 'Moderador creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear moderador:', error);
    res.status(500).json({ 
      message: 'Error al crear moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar moderador
export const actualizarModerador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      nombremoderador,
      usuarioauditoria,
      estatus
    } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmoderadores 
       SET 
        nombremoderador = ?,
        fehamodificacionauditoria = NOW(),
        usuarioauditoria = ?,
        estatus = ?
       WHERE idmoderador = ?`,
      [
        nombremoderador,
        usuarioauditoria,
        estatus,
        id
      ]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Moderador no encontrado' });
      return;
    }

    res.json({ message: 'Moderador actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar moderador:', error);
    res.status(500).json({ 
      message: 'Error al actualizar moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar moderador
export const eliminarModerador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebmoderadores WHERE idmoderador = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Moderador no encontrado' });
      return;
    }

    res.json({ message: 'Moderador eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar moderador:', error);
    res.status(500).json({ 
      message: 'Error al eliminar moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener todos los moderadores de referencia por negocio
export const obtenerModeradoresRef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;
    
    console.log('🔵 Obteniendo moderadores de referencia para negocio:', idnegocio);
    
    // Usar directamente tblposcrumenwebmodref con los nombres de columna correctos
    const [rows] = await pool.query<ModeradorRef[]>(
      `SELECT 
        idmodref as idmoderadorref,
        nombremodref,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio,
        estatus
      FROM tblposcrumenwebmodref
      WHERE idnegocio = ? AND estatus = 1
      ORDER BY nombremodref ASC`,
      [idnegocio]
    );
    
    console.log('✅ Moderadores ref obtenidos de tblposcrumenwebmodref:', rows.length);
    
    res.json(rows);
  } catch (error) {
    console.error('🔴 Error al obtener moderadores de referencia:', error);
    res.status(500).json({ 
      message: 'Error al obtener moderadores de referencia', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
