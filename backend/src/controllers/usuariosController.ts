// backend/src/controllers/usuariosController.ts
// Controlador para gestión de usuarios en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { CreateUsuarioData, Usuario, ApiResponse } from '../types'; // Importa tipos personalizados
import bcrypt from 'bcrypt'; // Importa bcrypt para hash de contraseñas

// Controlador para obtener todos los usuarios
export const getAllUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👥 Obteniendo todos los usuarios'); // Log de inicio
    
    // Consulta todos los usuarios sin incluir las contraseñas
    const usuarios = await executeQuery(`
      SELECT 
        idUsuario, idNegocio, idRol, nombre, usuario, email, estatus, 
        fechaRegistro, fechaActualizacion, usuarioAuditoria 
      FROM tblposcrumenwebusuarios 
      ORDER BY fechaRegistro DESC
    `);

    console.log(`✅ Se encontraron ${usuarios.length} usuarios`); // Log de resultado
    
    res.json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: usuarios
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear un nuevo usuario
export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👤 Creando nuevo usuario'); // Log de inicio
    const userData: CreateUsuarioData = req.body; // Extrae datos del cuerpo

    // Valida campos requeridos
    const requiredFields = ['idNegocio', 'idRol', 'nombre', 'usuario', 'password', 'email'];
    const missingFields = requiredFields.filter(field => !userData[field as keyof CreateUsuarioData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Faltan campos requeridos:', missingFields); // Log de error
      res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        error: 'MISSING_FIELDS'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe un usuario con el mismo nombre de usuario
    const existingUser = await executeQuery(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE usuario = ?',
      [userData.usuario]
    );

    if (existingUser.length > 0) {
      console.log('❌ Usuario ya existe'); // Log de error
      res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con ese nombre de usuario',
        error: 'USER_EXISTS'
      } as ApiResponse);
      return;
    }

    // Encripta la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log('🔐 Contraseña encriptada'); // Log de encriptación

    // Inserta el nuevo usuario
    const result = await executeQuery(`
      INSERT INTO tblposcrumenwebusuarios 
      (idNegocio, idRol, nombre, usuario, password, email, estatus, fechaRegistro, fechaActualizacion, usuarioAuditoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `, [
      userData.idNegocio,
      userData.idRol,
      userData.nombre,
      userData.usuario,
      hashedPassword,
      userData.email,
      userData.activo || 1, // Usa el valor del formulario o 1 por defecto
      userData.usuarioAuditoria || 'system'
    ]);

    console.log('✅ Usuario creado exitosamente'); // Log de éxito
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: { 
        idUsuario: (result as any).insertId,
        usuario: userData.usuario 
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando usuario:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando usuario',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar un usuario
export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Obtiene ID de los parámetros
    const updateData = req.body; // Obtiene datos a actualizar
    
    console.log(`👤 Actualizando usuario ID: ${id}`); // Log de inicio

    // Verifica si el usuario existe
    const existingUser = await executeQuery(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [id]
    );

    if (existingUser.length === 0) {
      console.log('❌ Usuario no encontrado'); // Log de error
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Construye la consulta de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Campos actualizables
    const allowedFields = ['idNegocio', 'idRol', 'nombre', 'usuario', 'email', 'estatus'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }

    // Si hay una nueva contraseña, la encripta
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
      console.log('🔐 Nueva contraseña encriptada'); // Log de encriptación
    }

    // Agrega campos de auditoría
    updateFields.push('fechaActualizacion = NOW()');
    if (updateData.usuarioAuditoria) {
      updateFields.push('usuarioAuditoria = ?');
      updateValues.push(updateData.usuarioAuditoria);
    }

    // Agrega el ID al final para la condición WHERE
    updateValues.push(id);

    // Ejecuta la actualización
    await executeQuery(
      `UPDATE tblposcrumenwebusuarios SET ${updateFields.join(', ')} WHERE idUsuario = ?`,
      updateValues
    );

    console.log('✅ Usuario actualizado exitosamente'); // Log de éxito
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { idUsuario: id }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error actualizando usuario:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error actualizando usuario',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};