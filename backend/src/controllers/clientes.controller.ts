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

// Helper function para obtener un cliente completo por ID
async function obtenerClienteCompleto(idCliente: number): Promise<Cliente | null> {
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
  return rows.length > 0 ? rows[0] : null;
}

// Obtener todos los clientes por negocio
// Si el usuario es SUPERUSUARIO (nombre='SUPERUSUARIO') o tiene idNegocio=99999,
// se muestran todos los clientes de todos los negocios.
export const obtenerClientes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    const usuarioNombre = req.user?.nombre;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    // Si es SUPERUSUARIO o idNegocio=99999, mostrar todos los clientes
    // Si no, mostrar solo clientes del mismo negocio
    const isSuperUsuario = usuarioNombre === 'SUPERUSUARIO' || idnegocio === 99999;

    let query = `SELECT 
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
      FROM tblposcrumenwebclientes`;

    const params: number[] = [];

    if (!isSuperUsuario) {
      query += ` WHERE idnegocio = ?`;
      params.push(idnegocio);
    }

    query += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query<Cliente[]>(query, params);
    
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
      estatus
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    // Validar campos requeridos
    if (!nombre || !idnegocio || !usuarioauditoria) {
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
        fehamodificacionauditoria,
        idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
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
        usuarioauditoria,
        idnegocio
      ]
    );

    // Obtener el cliente completo creado
    const createdCliente = await obtenerClienteCompleto(result.insertId);
    
    if (!createdCliente) {
      res.status(500).json({ message: 'Cliente creado pero no se pudo recuperar' });
      return;
    }

    res.status(201).json(createdCliente);
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

    // Obtener el cliente completo actualizado
    const updatedCliente = await obtenerClienteCompleto(Number(idCliente));
    
    if (!updatedCliente) {
      res.status(500).json({ message: 'Cliente actualizado pero no se pudo recuperar' });
      return;
    }

    res.json(updatedCliente);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ 
      message: 'Error al actualizar cliente', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Buscar clientes por teléfono (búsqueda parcial)
export const buscarClientesPorTelefono = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    const telefono = req.query.telefono;
    if (!telefono || typeof telefono !== 'string' || telefono.trim().length === 0) {
      res.json([]);
      return;
    }

    const [rows] = await pool.query<Cliente[]>(
      `SELECT idCliente, nombre, referencia, cumple, puntosfidelidad, telefono, direccion
       FROM tblposcrumenwebclientes
       WHERE idnegocio = ? AND telefono LIKE ?
       ORDER BY nombre ASC
       LIMIT 10`,
      [idnegocio, `%${telefono.trim()}%`]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al buscar clientes por teléfono:', error);
    res.status(500).json({
      message: 'Error al buscar clientes por teléfono',
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
