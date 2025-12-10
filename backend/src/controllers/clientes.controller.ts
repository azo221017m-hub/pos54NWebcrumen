import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Cliente extends RowDataPacket {
  idCliente: number;
  nombre: string;
  referencia: string | null;
  cumple: Date | null;
  categoriacliente: 'NUEVO' | 'RECURRENTE' | 'FRECUENTE' | 'VIP' | 'INACTIVO';
  satisfaccion: number | null;
  comentarios: string | null;
  puntosfidelidad: number;
  estatus_seguimiento: 'NINGUNO' | 'EN_PROSPECCIÓN' | 'EN_NEGOCIACIÓN' | 'CERRADO' | 'PERDIDO';
  responsable_seguimiento: string | null;
  medio_contacto: 'WHATSAPP' | 'LLAMADA' | 'EMAIL' | 'OTRO';
  observacionesseguimiento: string | null;
  fechaultimoseguimiento: Date | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estatus: number;
  fecharegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fehamodificacionauditoria: Date | null;
  idnegocio: number;
}

// Obtener todos los clientes por negocio
export const obtenerClientes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
    const [rows] = await pool.query<Cliente[]>(
      `SELECT 
        idCliente,
        nombre,
        referencia,
        cumple,
        categoriacliente,
        satisfaccion,
        comentarios,
        puntosfidelidad,
        estatus_seguimiento,
        responsable_seguimiento,
        medio_contacto,
        observacionesseguimiento,
        fechaultimoseguimiento,
        telefono,
        email,
        direccion,
        estatus,
        fecharegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebclientes
      WHERE idnegocio = ?
      ORDER BY nombre ASC`,
      [idnegocio]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener clientes', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener un cliente por ID
export const obtenerClientePorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idCliente } = req.params;
    
    const [rows] = await pool.query<Cliente[]>(
      `SELECT 
        idCliente,
        nombre,
        referencia,
        cumple,
        categoriacliente,
        satisfaccion,
        comentarios,
        puntosfidelidad,
        estatus_seguimiento,
        responsable_seguimiento,
        medio_contacto,
        observacionesseguimiento,
        fechaultimoseguimiento,
        telefono,
        email,
        direccion,
        estatus,
        fecharegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebclientes
      WHERE idCliente = ?`,
      [idCliente]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ 
      message: 'Error al obtener cliente', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nuevo cliente
export const crearCliente = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      referencia,
      cumple,
      categoriacliente,
      satisfaccion,
      comentarios,
      puntosfidelidad,
      estatus_seguimiento,
      responsable_seguimiento,
      medio_contacto,
      observacionesseguimiento,
      fechaultimoseguimiento,
      telefono,
      email,
      direccion,
      estatus,
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
      `INSERT INTO tblposcrumenwebclientes (
        nombre,
        referencia,
        cumple,
        categoriacliente,
        satisfaccion,
        comentarios,
        puntosfidelidad,
        estatus_seguimiento,
        responsable_seguimiento,
        medio_contacto,
        observacionesseguimiento,
        fechaultimoseguimiento,
        telefono,
        email,
        direccion,
        estatus,
        fecharegistroauditoria,
        usuarioauditoria,
        idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        nombre,
        referencia || null,
        cumple || null,
        categoriacliente || 'NUEVO',
        satisfaccion || null,
        comentarios || null,
        puntosfidelidad || 0,
        estatus_seguimiento || 'NINGUNO',
        responsable_seguimiento || null,
        medio_contacto || 'WHATSAPP',
        observacionesseguimiento || null,
        fechaultimoseguimiento || null,
        telefono || null,
        email || null,
        direccion || null,
        estatus !== undefined ? estatus : 1,
        usuarioauditoria || null,
        idnegocio
      ]
    );

    res.status(201).json({ 
      message: 'Cliente creado exitosamente', 
      idCliente: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ 
      message: 'Error al crear cliente', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar cliente
export const actualizarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idCliente } = req.params;
    const {
      nombre,
      referencia,
      cumple,
      categoriacliente,
      satisfaccion,
      comentarios,
      puntosfidelidad,
      estatus_seguimiento,
      responsable_seguimiento,
      medio_contacto,
      observacionesseguimiento,
      fechaultimoseguimiento,
      telefono,
      email,
      direccion,
      estatus,
      usuarioauditoria
    } = req.body;

    // Verificar si existe el cliente
    const [exist] = await pool.query<RowDataPacket[]>(
      'SELECT idCliente FROM tblposcrumenwebclientes WHERE idCliente = ?',
      [idCliente]
    );
    
    if (exist.length === 0) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebclientes SET
        nombre = ?,
        referencia = ?,
        cumple = ?,
        categoriacliente = ?,
        satisfaccion = ?,
        comentarios = ?,
        puntosfidelidad = ?,
        estatus_seguimiento = ?,
        responsable_seguimiento = ?,
        medio_contacto = ?,
        observacionesseguimiento = ?,
        fechaultimoseguimiento = ?,
        telefono = ?,
        email = ?,
        direccion = ?,
        estatus = ?,
        fehamodificacionauditoria = NOW(),
        usuarioauditoria = ?
      WHERE idCliente = ?`,
      [
        nombre,
        referencia || null,
        cumple || null,
        categoriacliente,
        satisfaccion || null,
        comentarios || null,
        puntosfidelidad,
        estatus_seguimiento,
        responsable_seguimiento || null,
        medio_contacto,
        observacionesseguimiento || null,
        fechaultimoseguimiento || null,
        telefono || null,
        email || null,
        direccion || null,
        estatus,
        usuarioauditoria || null,
        idCliente
      ]
    );

    if (result.affectedRows === 0) {
      res.status(500).json({ message: 'No se pudo actualizar el cliente' });
      return;
    }

    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ 
      message: 'Error al actualizar cliente', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar cliente
export const eliminarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idCliente } = req.params;
    
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebclientes WHERE idCliente = ?',
      [idCliente]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ 
      message: 'Error al eliminar cliente', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
