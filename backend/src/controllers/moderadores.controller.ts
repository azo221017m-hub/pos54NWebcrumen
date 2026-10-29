import type { Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

/**
 * IMPORTANTE: Los moderadores son opciones de modificación para productos
 * (ej: "Sin picante", "Extra queso", "Sin cebolla", "Término medio")
 * NO deben confundirse con usuarios del sistema.
 */
interface Moderador extends RowDataPacket {
  idmoderador: number;
  nombremoderador: string; // Nombre de la opción de modificación (ej: "Sin picante")
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fehamodificacionauditoria: Date | null;
  idnegocio: number;
  estatus: number;
}

// Interface para tblposcrumenwebmodref (Categorías de moderadores)
interface ModeradorRef extends RowDataPacket {
  idmoderadorref: number; // Mapeado desde idmodref
  nombremodref: string; // Nombre de la categoría (ej: "Ingredientes", "Punto de cocción")
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fehamodificacionauditoria: Date | null;
  idnegocio: number;
  estatus: number;
  moderadores?: string; // IDs separados por comas de los moderadores en esta categoría
}

// Obtener todos los moderadores por negocio
// NOTA: Los moderadores son opciones de modificación para productos (ej: "Sin picante", "Extra queso", "Sin cebolla")
// NO deben ser nombres de usuarios del sistema
export const obtenerModeradores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
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
export const obtenerModerador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Sólo registros del negocio del usuario: un id ajeno responde 404
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
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
      WHERE idmoderador = ? AND idnegocio = ?`,
      [id, idnegocio]
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
// NOTA: Los moderadores son opciones de modificación para productos (ej: "Sin picante", "Extra queso")
// NO deben ser nombres de usuarios. Validar que el nombre sea una opción de modificación válida.
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

    // Obtener el registro completo creado
    const [createdRows] = await pool.query<Moderador[]>(
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
      [result.insertId]
    );

    res.status(201).json(createdRows[0]);
  } catch (error) {
    console.error('Error al crear moderador:', error);
    res.status(500).json({ 
      message: 'Error al crear moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar moderador
export const actualizarModerador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      nombremoderador,
      usuarioauditoria,
      estatus
    } = req.body;

    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({ message: 'El usuario no está autenticado' });
      return;
    }

    // Acotado al negocio del usuario: un moderador ajeno responde 404
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmoderadores 
       SET 
        nombremoderador = ?,
        fehamodificacionauditoria = NOW(),
        usuarioauditoria = ?,
        estatus = ?
       WHERE idmoderador = ? AND idnegocio = ?`,
      [
        nombremoderador,
        usuarioauditoria,
        estatus,
        id,
        idnegocio
      ]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Moderador no encontrado' });
      return;
    }

    // Obtener el registro completo actualizado
    const [updatedRows] = await pool.query<Moderador[]>(
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

    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error al actualizar moderador:', error);
    res.status(500).json({ 
      message: 'Error al actualizar moderador', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar moderador
export const eliminarModerador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({ message: 'El usuario no está autenticado' });
      return;
    }

    // Borrado físico: el filtro por negocio es lo único que impide eliminar
    // de forma irreversible un moderador de otro negocio.
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebmoderadores WHERE idmoderador = ? AND idnegocio = ?',
      [id, idnegocio]
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
export const obtenerModeradoresRef = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
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
        estatus,
        moderadores
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
