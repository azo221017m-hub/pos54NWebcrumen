import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

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
export const obtenerProveedores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
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

// Helper function to get full proveedor details by ID
const obtenerProveedorCompleto = async (id_proveedor: number): Promise<Proveedor | null> => {
  // Validate id_proveedor
  if (!id_proveedor || id_proveedor <= 0) {
    return null;
  }
  
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
  
  return rows.length > 0 ? rows[0] : null;
};

// Crear nuevo proveedor
export const crearProveedor = async (req: AuthRequest, res: Response): Promise<void> => {
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
      usuarioauditoria
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    // Validar campos requeridos
    if (!nombre || !idnegocio) {
      res.status(400).json({ message: 'El nombre es requerido y el usuario debe estar autenticado' });
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

    // Fetch the complete created proveedor to return to frontend
    const createdProveedor = await obtenerProveedorCompleto(result.insertId);
    
    if (!createdProveedor) {
      res.status(500).json({ 
        message: `Error: No se pudo recuperar el proveedor creado con ID ${result.insertId}` 
      });
      return;
    }

    res.status(201).json(createdProveedor);
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

    // Fetch the complete updated proveedor to return to frontend
    const updatedProveedor = await obtenerProveedorCompleto(Number(id_proveedor));
    
    if (!updatedProveedor) {
      res.status(500).json({ 
        message: `Error: No se pudo recuperar el proveedor actualizado con ID ${id_proveedor}` 
      });
      return;
    }

    res.json(updatedProveedor);
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
