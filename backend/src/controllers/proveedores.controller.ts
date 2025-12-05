import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Proveedor extends RowDataPacket {
  id_proveedor: number;
  nombre: string;
  rfc: string;
  telefono: string;
  correo: string;
  direccion: string;
  banco: string;
  cuenta: string;
  activo: number;
  fechaRegistroauditoria: Date;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date;
  idnegocio: number;
}

// Obtener todos los proveedores por negocio
export const obtenerProveedores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;
    
    const [rows] = await pool.query<Proveedor[]>(
      `SELECT 
        id_proveedor,
        nombre,
        rfc,
        telefono,
        correo,
        direccion,
        banco,
        cuenta,
        activo,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebproveedores
      WHERE idnegocio = ?
      ORDER BY nombre ASC`,
      [idnegocio]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ 
      message: 'Error al obtener proveedores', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener un proveedor por ID
export const obtenerProveedorPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_proveedor } = req.params;
    
    const [rows] = await pool.query<Proveedor[]>(
      `SELECT 
        id_proveedor,
        nombre,
        rfc,
        telefono,
        correo,
        direccion,
        banco,
        cuenta,
        activo,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebproveedores
      WHERE id_proveedor = ?`,
      [id_proveedor]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Proveedor no encontrado' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ 
      message: 'Error al obtener proveedor', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nuevo proveedor
export const crearProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      rfc,
      telefono,
      correo,
      direccion,
      banco,
      cuenta,
      activo,
      usuarioauditoria,
      idnegocio
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !idnegocio) {
      res.status(400).json({ message: 'Nombre e idnegocio son requeridos' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebproveedores (
        nombre,
        rfc,
        telefono,
        correo,
        direccion,
        banco,
        cuenta,
        activo,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
      [
        nombre,
        rfc || null,
        telefono || null,
        correo || null,
        direccion || null,
        banco || null,
        cuenta || null,
        activo !== undefined ? activo : 1,
        usuarioauditoria || null,
        idnegocio
      ]
    );

    res.status(201).json({ 
      message: 'Proveedor creado exitosamente', 
      id_proveedor: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ 
      message: 'Error al crear proveedor', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar proveedor
export const actualizarProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_proveedor } = req.params;
    const {
      nombre,
      rfc,
      telefono,
      correo,
      direccion,
      banco,
      cuenta,
      activo,
      usuarioauditoria
    } = req.body;

    // Verificar si existe el proveedor
    const [exist] = await pool.query<RowDataPacket[]>(
      'SELECT id_proveedor FROM tblposcrumenwebproveedores WHERE id_proveedor = ?',
      [id_proveedor]
    );
    
    if (exist.length === 0) {
      res.status(404).json({ message: 'Proveedor no encontrado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebproveedores SET
        nombre = ?,
        rfc = ?,
        telefono = ?,
        correo = ?,
        direccion = ?,
        banco = ?,
        cuenta = ?,
        activo = ?,
        fehamodificacionauditoria = NOW(),
        usuarioauditoria = ?
      WHERE id_proveedor = ?`,
      [
        nombre,
        rfc || null,
        telefono || null,
        correo || null,
        direccion || null,
        banco || null,
        cuenta || null,
        activo,
        usuarioauditoria || null,
        id_proveedor
      ]
    );

    if (result.affectedRows === 0) {
      res.status(500).json({ message: 'No se pudo actualizar el proveedor' });
      return;
    }

    res.json({ message: 'Proveedor actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ 
      message: 'Error al actualizar proveedor', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar proveedor
export const eliminarProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_proveedor } = req.params;
    
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebproveedores WHERE id_proveedor = ?',
      [id_proveedor]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Proveedor no encontrado' });
      return;
    }
    
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ 
      message: 'Error al eliminar proveedor', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
