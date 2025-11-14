// backend/src/controllers/clientesController.ts
// Controlador para gestión de clientes

import { Request, Response } from 'express';
import { RowDataPacket, OkPacket } from 'mysql2';
import pool from '../config/database';
import type { 
  Cliente, 
  CreateClienteData, 
  UpdateClienteData,
  ApiResponse,
  CategoriaCliente,
  EstatusSeguimiento,
  MedioContacto
} from '../types';

// Obtener todos los clientes
export const getClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 [ClientesController] Obteniendo lista de clientes...');
    
    const query = `
      SELECT 
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
      ORDER BY fecharegistroauditoria DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query);
    
    console.log(`✅ [ClientesController] ${rows.length} clientes encontrados`);
    
    const response: ApiResponse<Cliente[]> = {
      success: true,
      message: `${rows.length} clientes encontrados exitosamente`,
      data: rows as Cliente[]
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ [ClientesController] Error al obtener clientes:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al obtener clientes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
};

// Obtener cliente por ID
export const getClienteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`🔍 [ClientesController] Obteniendo cliente con ID: ${id}`);

    if (!id || isNaN(Number(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de cliente inválido'
      };
      res.status(400).json(response);
      return;
    }

    const query = `
      SELECT 
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
      WHERE idCliente = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: `No se encontró cliente con ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }

    console.log(`✅ [ClientesController] Cliente encontrado: ${rows[0].nombre}`);
    
    const response: ApiResponse<Cliente> = {
      success: true,
      message: 'Cliente encontrado exitosamente',
      data: rows[0] as Cliente
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ [ClientesController] Error al obtener cliente por ID:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al obtener cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
};

// Crear nuevo cliente
export const createCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📝 [ClientesController] Creando nuevo cliente...');
    console.log('📦 [ClientesController] Datos recibidos:', req.body);

    const clienteData: CreateClienteData = req.body;

    // Validaciones básicas
    if (!clienteData.nombre?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El nombre del cliente es requerido'
      };
      res.status(400).json(response);
      return;
    }

    if (!clienteData.telefono?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El teléfono del cliente es requerido'
      };
      res.status(400).json(response);
      return;
    }

    if (!clienteData.email?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El email del cliente es requerido'
      };
      res.status(400).json(response);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clienteData.email)) {
      const response: ApiResponse = {
        success: false,
        message: 'El formato del email no es válido'
      };
      res.status(400).json(response);
      return;
    }

    // Verificar si el email ya existe
    const checkEmailQuery = 'SELECT idCliente FROM tblposcrumenwebclientes WHERE email = ? AND idnegocio = ?';
    const [existingEmail] = await pool.execute<RowDataPacket[]>(checkEmailQuery, [clienteData.email, clienteData.idnegocio]);

    if (existingEmail.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Ya existe un cliente con ese email'
      };
      res.status(409).json(response);
      return;
    }

    const now = new Date();
    const currentDate = now.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:mm:ss

    const query = `
      INSERT INTO tblposcrumenwebclientes (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      clienteData.nombre.trim(),
      clienteData.referencia?.trim() || '',
      clienteData.cumple,
      clienteData.categoriacliente || 'NUEVO',
      clienteData.satisfaccion || 0,
      clienteData.comentarios?.trim() || '',
      clienteData.puntosfidelidad || 0,
      clienteData.estatus_seguimiento || 'NINGUNO',
      clienteData.responsable_seguimiento?.trim() || '',
      clienteData.medio_contacto || 'WHATSAPP',
      clienteData.observacionesseguimiento?.trim() || '',
      clienteData.fechaultimoseguimiento || currentDate,
      clienteData.telefono.trim(),
      clienteData.email.trim(),
      clienteData.direccion?.trim() || '',
      clienteData.estatus !== undefined ? clienteData.estatus : 1,
      currentDate, // fecharegistroauditoria
      clienteData.usuarioauditoria,
      currentDate, // fehamodificacionauditoria
      clienteData.idnegocio
    ];

    const [result] = await pool.execute<OkPacket>(query, values);

    console.log(`✅ [ClientesController] Cliente creado exitosamente con ID: ${result.insertId}`);
    
    const response: ApiResponse<{id: number}> = {
      success: true,
      message: 'Cliente creado exitosamente',
      data: { id: result.insertId }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ [ClientesController] Error al crear cliente:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al crear cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
};

// Actualizar cliente
export const updateCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`📝 [ClientesController] Actualizando cliente con ID: ${id}`);
    console.log('📦 [ClientesController] Datos recibidos:', req.body);

    if (!id || isNaN(Number(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de cliente inválido'
      };
      res.status(400).json(response);
      return;
    }

    const clienteData: UpdateClienteData = req.body;

    // Verificar si el cliente existe
    const checkQuery = 'SELECT idCliente FROM tblposcrumenwebclientes WHERE idCliente = ?';
    const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [id]);

    if (existing.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: `No se encontró cliente con ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }

    // Validar email si se proporciona
    if (clienteData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteData.email)) {
        const response: ApiResponse = {
          success: false,
          message: 'El formato del email no es válido'
        };
        res.status(400).json(response);
        return;
      }

      // Verificar si el email ya existe en otro cliente
      const checkEmailQuery = 'SELECT idCliente FROM tblposcrumenwebclientes WHERE email = ? AND idCliente != ?';
      const [existingEmail] = await pool.execute<RowDataPacket[]>(checkEmailQuery, [clienteData.email, id]);

      if (existingEmail.length > 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Ya existe otro cliente con ese email'
        };
        res.status(409).json(response);
        return;
      }
    }

    // Construir query dinámico
    const updateFields: string[] = [];
    const values: any[] = [];

    if (clienteData.nombre !== undefined) {
      updateFields.push('nombre = ?');
      values.push(clienteData.nombre.trim());
    }

    if (clienteData.referencia !== undefined) {
      updateFields.push('referencia = ?');
      values.push(clienteData.referencia.trim());
    }

    if (clienteData.cumple !== undefined) {
      updateFields.push('cumple = ?');
      values.push(clienteData.cumple);
    }

    if (clienteData.categoriacliente !== undefined) {
      updateFields.push('categoriacliente = ?');
      values.push(clienteData.categoriacliente);
    }

    if (clienteData.satisfaccion !== undefined) {
      updateFields.push('satisfaccion = ?');
      values.push(clienteData.satisfaccion);
    }

    if (clienteData.comentarios !== undefined) {
      updateFields.push('comentarios = ?');
      values.push(clienteData.comentarios.trim());
    }

    if (clienteData.puntosfidelidad !== undefined) {
      updateFields.push('puntosfidelidad = ?');
      values.push(clienteData.puntosfidelidad);
    }

    if (clienteData.estatus_seguimiento !== undefined) {
      updateFields.push('estatus_seguimiento = ?');
      values.push(clienteData.estatus_seguimiento);
    }

    if (clienteData.responsable_seguimiento !== undefined) {
      updateFields.push('responsable_seguimiento = ?');
      values.push(clienteData.responsable_seguimiento.trim());
    }

    if (clienteData.medio_contacto !== undefined) {
      updateFields.push('medio_contacto = ?');
      values.push(clienteData.medio_contacto);
    }

    if (clienteData.observacionesseguimiento !== undefined) {
      updateFields.push('observacionesseguimiento = ?');
      values.push(clienteData.observacionesseguimiento.trim());
    }

    if (clienteData.fechaultimoseguimiento !== undefined) {
      updateFields.push('fechaultimoseguimiento = ?');
      values.push(clienteData.fechaultimoseguimiento);
    }

    if (clienteData.telefono !== undefined) {
      updateFields.push('telefono = ?');
      values.push(clienteData.telefono.trim());
    }

    if (clienteData.email !== undefined) {
      updateFields.push('email = ?');
      values.push(clienteData.email.trim());
    }

    if (clienteData.direccion !== undefined) {
      updateFields.push('direccion = ?');
      values.push(clienteData.direccion.trim());
    }

    if (clienteData.estatus !== undefined) {
      updateFields.push('estatus = ?');
      values.push(clienteData.estatus);
    }

    if (updateFields.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      };
      res.status(400).json(response);
      return;
    }

    // Agregar campos de auditoría
    updateFields.push('fehamodificacionauditoria = ?', 'usuarioauditoria = ?');
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    values.push(currentDate, clienteData.usuarioauditoria);

    // Agregar ID al final
    values.push(id);

    const query = `UPDATE tblposcrumenwebclientes SET ${updateFields.join(', ')} WHERE idCliente = ?`;

    const [result] = await pool.execute<OkPacket>(query, values);

    if (result.affectedRows === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'No se pudo actualizar el cliente'
      };
      res.status(500).json(response);
      return;
    }

    console.log(`✅ [ClientesController] Cliente actualizado exitosamente`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Cliente actualizado exitosamente'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ [ClientesController] Error al actualizar cliente:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al actualizar cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
};

// Eliminar cliente (soft delete)
export const deleteCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`🗑️ [ClientesController] Eliminando cliente con ID: ${id}`);

    if (!id || isNaN(Number(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de cliente inválido'
      };
      res.status(400).json(response);
      return;
    }

    // Verificar si el cliente existe
    const checkQuery = 'SELECT idCliente, nombre FROM tblposcrumenwebclientes WHERE idCliente = ?';
    const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [id]);

    if (existing.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: `No se encontró cliente con ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }

    // Soft delete - cambiar estatus a 0
    const query = `
      UPDATE tblposcrumenwebclientes 
      SET estatus = 0, 
          fehamodificacionauditoria = ?
      WHERE idCliente = ?
    `;

    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.execute<OkPacket>(query, [currentDate, id]);

    if (result.affectedRows === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'No se pudo eliminar el cliente'
      };
      res.status(500).json(response);
      return;
    }

    console.log(`✅ [ClientesController] Cliente eliminado exitosamente: ${existing[0].nombre}`);
    
    const response: ApiResponse = {
      success: true,
      message: `Cliente "${existing[0].nombre}" eliminado exitosamente`
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ [ClientesController] Error al eliminar cliente:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al eliminar cliente',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
};