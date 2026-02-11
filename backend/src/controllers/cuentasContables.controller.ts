import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface CuentaContable extends RowDataPacket {
  id_cuentacontable: number;
  naturalezacuentacontable: 'COMPRA' | 'GASTO';
  nombrecuentacontable: string;
  tipocuentacontable: string;
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fechamodificacionauditoria: Date | null;
  idnegocio: number;
}

// Obtener todas las cuentas contables por negocio
export const obtenerCuentasContables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    const naturaleza = req.query.naturaleza as string | undefined;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
    // Construir query con filtro opcional por naturaleza
    let query = `SELECT 
        id_cuentacontable,
        naturalezacuentacontable,
        nombrecuentacontable,
        tipocuentacontable,
        fechaRegistroauditoria,
        usuarioauditoria,
        fechamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebcuentacontable
      WHERE idnegocio = ?`;
    
    const params: any[] = [idnegocio];
    
    if (naturaleza) {
      query += ` AND naturalezacuentacontable = ?`;
      params.push(naturaleza);
    }
    
    query += ` ORDER BY nombrecuentacontable ASC`;
    
    const [rows] = await pool.query<CuentaContable[]>(query, params);
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener cuentas contables:', error);
    res.status(500).json({ 
      message: 'Error al obtener cuentas contables', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener una cuenta contable por ID
export const obtenerCuentaContable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query<CuentaContable[]>(
      `SELECT 
        id_cuentacontable,
        naturalezacuentacontable,
        nombrecuentacontable,
        tipocuentacontable,
        fechaRegistroauditoria,
        usuarioauditoria,
        fechamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebcuentacontable
      WHERE id_cuentacontable = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Cuenta contable no encontrada' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener cuenta contable:', error);
    res.status(500).json({ 
      message: 'Error al obtener cuenta contable', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nueva cuenta contable
export const crearCuentaContable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      naturalezacuentacontable,
      nombrecuentacontable,
      tipocuentacontable
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(400).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebcuentacontable (
        naturalezacuentacontable,
        nombrecuentacontable,
        tipocuentacontable,
        fechaRegistroauditoria,
        usuarioauditoria,
        idnegocio
      ) VALUES (?, ?, ?, NOW(), ?, ?)`,
      [
        naturalezacuentacontable,
        nombrecuentacontable,
        tipocuentacontable,
        usuarioauditoria,
        idnegocio
      ]
    );

    res.status(201).json({
      message: 'Cuenta contable creada exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear cuenta contable:', error);
    res.status(500).json({ 
      message: 'Error al crear cuenta contable', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar cuenta contable
export const actualizarCuentaContable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      naturalezacuentacontable,
      nombrecuentacontable,
      tipocuentacontable
    } = req.body;

    // Usar alias del usuario autenticado para usuarioauditoria
    const usuarioauditoria = req.user?.alias;

    if (!usuarioauditoria) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebcuentacontable 
       SET 
        naturalezacuentacontable = ?,
        nombrecuentacontable = ?,
        tipocuentacontable = ?,
        fechamodificacionauditoria = NOW(),
        usuarioauditoria = ?
       WHERE id_cuentacontable = ?`,
      [
        naturalezacuentacontable,
        nombrecuentacontable,
        tipocuentacontable,
        usuarioauditoria,
        id
      ]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Cuenta contable no encontrada' });
      return;
    }

    res.json({ message: 'Cuenta contable actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cuenta contable:', error);
    res.status(500).json({ 
      message: 'Error al actualizar cuenta contable', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar cuenta contable
export const eliminarCuentaContable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebcuentacontable WHERE id_cuentacontable = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Cuenta contable no encontrada' });
      return;
    }

    res.json({ message: 'Cuenta contable eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cuenta contable:', error);
    res.status(500).json({ 
      message: 'Error al eliminar cuenta contable', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
