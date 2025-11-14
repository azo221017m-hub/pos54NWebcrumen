// Controlador para gestión de usuarios del sistema
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type {
  UsuarioSistema,
  CreateUsuarioSistemaData,
  UpdateUsuarioSistemaData,
  NegocioDropdown,
  RolDropdown
} from '../types';

// Obtener todos los usuarios del sistema con información de negocio y rol
export const getUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('� Iniciando obtención de usuarios del sistema...');
    
    // Query con JOIN para obtener información completa
    const query = `
      SELECT 
        u.idUsuario,
        u.idNegocio,
        u.idRol,
        u.nombre,
        u.alias,
        u.telefono,
        u.cumple,
        u.frasepersonal,
        u.fotoine,
        u.fotopersona,
        u.fotoavatar,
        u.desempeno,
        u.popularidad,
        u.estatus,
        u.fechaRegistroauditoria,
        u.usuarioauditoria,
        u.fehamodificacionauditoria,
        n.nombreNegocio,
        r.nombreRol
      FROM tblposcrumenwebusuarios u
      LEFT JOIN tblposcrumenwebnegocio n ON u.idNegocio = n.idNegocio
      LEFT JOIN tblposcrumenwebrolesdeusuario r ON u.idRol = r.idRol
      ORDER BY u.nombre ASC
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    console.log(`✅ Se encontraron ${rows.length} usuarios en el sistema`);
    
    // Convertir Buffer a string para las imágenes
    const usuarios: UsuarioSistema[] = rows.map((row: any) => ({
      idUsuario: row.idUsuario,
      idNegocio: row.idNegocio,
      idRol: row.idRol,
      nombre: row.nombre,
      alias: row.alias,
      telefono: row.telefono,
      cumple: row.cumple,
      frasepersonal: row.frasepersonal,
      fotoine: row.fotoine ? row.fotoine.toString() : undefined,
      fotopersona: row.fotopersona ? row.fotopersona.toString() : undefined,
      fotoavatar: row.fotoavatar ? row.fotoavatar.toString() : undefined,
      desempeno: parseFloat(row.desempeno) || 0,
      popularidad: parseFloat(row.popularidad) || 0,
      estatus: row.estatus,
      fechaRegistroauditoria: row.fechaRegistroauditoria,
      usuarioauditoria: row.usuarioauditoria,
      fehamodificacionauditoria: row.fehamodificacionauditoria,
      nombreNegocio: row.nombreNegocio,
      nombreRol: row.nombreRol
    }));
    
    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos correctamente',
      data: usuarios
    });
    
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener usuarios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Crear nuevo usuario del sistema
export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🆕 Iniciando creación de nuevo usuario...');
    const userData: CreateUsuarioSistemaData = req.body;
    
    // Validar campos requeridos
    if (!userData.idNegocio || !userData.idRol || !userData.nombre || 
        !userData.alias || !userData.password || !userData.telefono || !userData.cumple) {
      console.log('❌ Faltan campos requeridos para crear usuario');
      res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben ser proporcionados'
      });
      return;
    }
    
    // Verificar que el negocio existe
    const [negocioRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE idNegocio = ?',
      [userData.idNegocio]
    );
    
    if (negocioRows.length === 0) {
      console.log('❌ El negocio especificado no existe');
      res.status(400).json({
        success: false,
        message: 'El negocio especificado no existe'
      });
      return;
    }
    
    // Verificar que el rol existe
    const [rolRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [userData.idRol]
    );
    
    if (rolRows.length === 0) {
      console.log('❌ El rol especificado no existe');
      res.status(400).json({
        success: false,
        message: 'El rol especificado no existe'
      });
      return;
    }
    
    // Verificar que el alias no existe
    const [aliasRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ?',
      [userData.alias]
    );
    
    if (aliasRows.length > 0) {
      console.log('❌ El alias ya existe');
      res.status(400).json({
        success: false,
        message: 'El alias ya está en uso'
      });
      return;
    }
    
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    console.log('🔐 Contraseña hasheada correctamente');
    
    // Preparar datos para inserción
    const fechaActual = new Date();
    
    const query = `
      INSERT INTO tblposcrumenwebusuarios (
        idNegocio, idRol, nombre, alias, password, telefono, cumple,
        frasepersonal, fotoine, fotopersona, fotoavatar, desempeno, popularidad,
        estatus, fechaRegistroauditoria, usuarioauditoria, fehamodificacionauditoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userData.idNegocio,
      userData.idRol,
      userData.nombre,
      userData.alias,
      hashedPassword,
      userData.telefono,
      userData.cumple,
      userData.frasepersonal || '',
      userData.fotoine && typeof userData.fotoine === 'string' ? Buffer.from(userData.fotoine, 'base64') : null,
      userData.fotopersona && typeof userData.fotopersona === 'string' ? Buffer.from(userData.fotopersona, 'base64') : null,
      userData.fotoavatar && typeof userData.fotoavatar === 'string' ? Buffer.from(userData.fotoavatar, 'base64') : null,
      userData.desempeno || 0,
      userData.popularidad || 0,
      userData.estatus ?? 1,
      fechaActual,
      userData.usuarioauditoria || 'system',
      fechaActual
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    
    console.log(`✅ Usuario creado con ID: ${result.insertId}`);
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: {
        idUsuario: result.insertId,
        ...userData,
        password: undefined // No devolver la contraseña
      }
    });
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar usuario existente
export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userData: UpdateUsuarioSistemaData = req.body;
    
    console.log(`� Iniciando actualización de usuario ID: ${id}`);
    
    // Verificar que el usuario existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Usuario no encontrado');
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    // Construir query dinámico
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (userData.idNegocio !== undefined) {
      // Verificar que el negocio existe
      const [negocioRows] = await pool.execute<RowDataPacket[]>(
        'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE idNegocio = ?',
        [userData.idNegocio]
      );
      
      if (negocioRows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'El negocio especificado no existe'
        });
        return;
      }
      
      updateFields.push('idNegocio = ?');
      values.push(userData.idNegocio);
    }
    
    if (userData.idRol !== undefined) {
      // Verificar que el rol existe
      const [rolRows] = await pool.execute<RowDataPacket[]>(
        'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
        [userData.idRol]
      );
      
      if (rolRows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'El rol especificado no existe'
        });
        return;
      }
      
      updateFields.push('idRol = ?');
      values.push(userData.idRol);
    }
    
    if (userData.nombre !== undefined) {
      updateFields.push('nombre = ?');
      values.push(userData.nombre);
    }
    
    if (userData.alias !== undefined) {
      // Verificar que el alias no existe en otro usuario
      const [aliasRows] = await pool.execute<RowDataPacket[]>(
        'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ? AND idUsuario != ?',
        [userData.alias, id]
      );
      
      if (aliasRows.length > 0) {
        res.status(400).json({
          success: false,
          message: 'El alias ya está en uso'
        });
        return;
      }
      
      updateFields.push('alias = ?');
      values.push(userData.alias);
    }
    
    if (userData.password !== undefined) {
      // Hashear la nueva contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      updateFields.push('password = ?');
      values.push(hashedPassword);
      console.log('🔐 Nueva contraseña hasheada');
    }
    
    if (userData.telefono !== undefined) {
      updateFields.push('telefono = ?');
      values.push(userData.telefono);
    }
    
    if (userData.cumple !== undefined) {
      updateFields.push('cumple = ?');
      values.push(userData.cumple);
    }
    
    if (userData.frasepersonal !== undefined) {
      updateFields.push('frasepersonal = ?');
      values.push(userData.frasepersonal);
    }
    
    if (userData.fotoine !== undefined) {
      updateFields.push('fotoine = ?');
      values.push(userData.fotoine && typeof userData.fotoine === 'string' ? Buffer.from(userData.fotoine, 'base64') : null);
    }
    
    if (userData.fotopersona !== undefined) {
      updateFields.push('fotopersona = ?');
      values.push(userData.fotopersona && typeof userData.fotopersona === 'string' ? Buffer.from(userData.fotopersona, 'base64') : null);
    }
    
    if (userData.fotoavatar !== undefined) {
      updateFields.push('fotoavatar = ?');
      values.push(userData.fotoavatar && typeof userData.fotoavatar === 'string' ? Buffer.from(userData.fotoavatar, 'base64') : null);
    }
    
    if (userData.desempeno !== undefined) {
      updateFields.push('desempeno = ?');
      values.push(userData.desempeno);
    }
    
    if (userData.popularidad !== undefined) {
      updateFields.push('popularidad = ?');
      values.push(userData.popularidad);
    }
    
    if (userData.estatus !== undefined) {
      updateFields.push('estatus = ?');
      values.push(userData.estatus);
    }
    
    // Campos de auditoría
    updateFields.push('fehamodificacionauditoria = ?');
    values.push(new Date());
    
    if (userData.usuarioauditoria !== undefined) {
      updateFields.push('usuarioauditoria = ?');
      values.push(userData.usuarioauditoria);
    }
    
    if (updateFields.length === 1) { // Solo fecha de modificación
      console.log('❌ No hay campos para actualizar');
      res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
      return;
    }
    
    const query = `UPDATE tblposcrumenwebusuarios SET ${updateFields.join(', ')} WHERE idUsuario = ?`;
    values.push(id);
    
    await pool.execute(query, values);
    
    console.log(`✅ Usuario ID: ${id} actualizado correctamente`);
    
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: { idUsuario: parseInt(id) }
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar usuario (soft delete)
export const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Iniciando eliminación de usuario ID: ${id}`);
    
    // Verificar que el usuario existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario, estatus FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Usuario no encontrado');
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    // Soft delete - cambiar estatus a 0 (inactivo)
    const query = `
      UPDATE tblposcrumenwebusuarios 
      SET estatus = 0, fehamodificacionauditoria = ?
      WHERE idUsuario = ?
    `;
    
    await pool.execute(query, [new Date(), id]);
    
    console.log(`✅ Usuario ID: ${id} eliminado correctamente (soft delete)`);
    
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente',
      data: { idUsuario: parseInt(id) }
    });
    
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener negocios para dropdown
export const getNegociosDropdown = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Obteniendo negocios para dropdown...');
    
    const query = `
      SELECT idNegocio, nombreNegocio
      FROM tblposcrumenwebnegocio
      WHERE estatusnegocio = 1
      ORDER BY nombreNegocio ASC
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    
    const negocios: NegocioDropdown[] = rows.map((row: any) => ({
      idNegocio: row.idNegocio,
      nombreNegocio: row.nombreNegocio
    }));
    
    console.log(`✅ Se encontraron ${negocios.length} negocios activos`);
    
    res.status(200).json({
      success: true,
      message: 'Negocios obtenidos correctamente',
      data: negocios
    });
    
  } catch (error) {
    console.error('❌ Error al obtener negocios para dropdown:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener negocios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener roles para dropdown
export const getRolesDropdown = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Obteniendo roles para dropdown...');
    
    const query = `
      SELECT idRol, nombreRol
      FROM tblposcrumenwebrolesdeusuario
      WHERE estatus = 1
      ORDER BY nombreRol ASC
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    
    const roles: RolDropdown[] = rows.map((row: any) => ({
      idRol: row.idRol,
      nombreRol: row.nombreRol
    }));
    
    console.log(`✅ Se encontraron ${roles.length} roles activos`);
    
    res.status(200).json({
      success: true,
      message: 'Roles obtenidos correctamente',
      data: roles
    });
    
  } catch (error) {
    console.error('❌ Error al obtener roles para dropdown:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener roles',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};