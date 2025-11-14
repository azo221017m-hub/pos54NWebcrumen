// backend/src/controllers/rolesController.ts
// Controlador para gestión de roles de usuario en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { RolUsuario, CreateRolUsuarioData, UpdateRolUsuarioData, ApiResponse } from '../types'; // Importa tipos personalizados

// Controlador para obtener todos los roles de usuario
export const getRolesController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👤 [rolesController] Obteniendo todos los roles de usuario'); // Log de inicio
    
    // Ejecuta la consulta para obtener todos los roles
    const roles = await executeQuery(
      'SELECT * FROM tblposcrumenwebrolesdeusuario ORDER BY nombreRol ASC',
      []
    );

    console.log(`📊 [rolesController] Roles encontrados: ${roles ? roles.length : 0}`); // Log de resultados
    
    res.json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles || []
    } as ApiResponse<RolUsuario[]>);

  } catch (error) {
    console.error('❌ [rolesController] Error obteniendo roles:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear un nuevo rol de usuario
export const createRolController = async (req: Request, res: Response): Promise<void> => {
  try {
    const rolData: CreateRolUsuarioData = req.body; // Obtiene los datos del rol
    
    console.log('👤 [rolesController] Creando nuevo rol:', rolData); // Log de datos recibidos

    // Validaciones básicas
    if (!rolData.nombreRol || !rolData.descripcion) {
      res.status(400).json({
        success: false,
        message: 'El nombre y descripción del rol son obligatorios'
      } as ApiResponse);
      return;
    }

    // Verificar que no exista otro rol con el mismo nombre
    const existingRol = await executeQuery(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE nombreRol = ?',
      [rolData.nombreRol.trim()]
    );

    if (existingRol.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      } as ApiResponse);
      return;
    }

    // Preparar datos para inserción con campos de auditoría
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const usuarioAuditoria = rolData.usuarioauditoria || 'SISTEMA';
    const idNegocio = rolData.idnegocio || 1;

    console.log('💾 [rolesController] Insertando rol en la base de datos');
    
    // Ejecuta la consulta de inserción
    const result = await executeQuery(
      `INSERT INTO tblposcrumenwebrolesdeusuario 
       (nombreRol, descripcion, privilegio, estatus, 
        fechaRegistroauditoria, usuarioauditoria, fehamodificacionauditoria, idnegocio) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rolData.nombreRol.trim(),
        rolData.descripcion.trim(),
        rolData.privilegio,
        rolData.estatus,
        fechaActual,
        usuarioAuditoria,
        fechaActual,
        idNegocio
      ]
    );

    console.log('✅ [rolesController] Rol creado exitosamente');
    
    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: {
        idRol: result.insertId,
        nombreRol: rolData.nombreRol.trim(),
        descripcion: rolData.descripcion.trim(),
        privilegio: rolData.privilegio,
        estatus: rolData.estatus
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('❌ [rolesController] Error creando rol:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar un rol existente
export const updateRolController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Obtiene el ID del rol de los parámetros
    const updateData: UpdateRolUsuarioData = req.body; // Obtiene los datos de actualización
    
    console.log(`🔄 [rolesController] Actualizando rol ID: ${id}`, updateData);

    // Validar que el ID sea un número válido
    const rolId = parseInt(id);
    if (isNaN(rolId) || rolId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de rol no válido'
      } as ApiResponse);
      return;
    }

    // Verificar que el rol existe
    const existingRol = await executeQuery(
      'SELECT * FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [rolId]
    );

    if (existingRol.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      } as ApiResponse);
      return;
    }

    // Verificar nombre único si se está actualizando
    if (updateData.nombreRol) {
      const duplicateRol = await executeQuery(
        'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE nombreRol = ? AND idRol != ?',
        [updateData.nombreRol.trim(), rolId]
      );

      if (duplicateRol.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Ya existe otro rol con ese nombre'
        } as ApiResponse);
        return;
      }
    }

    // Construir consulta de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updateData.nombreRol !== undefined) {
      updateFields.push('nombreRol = ?');
      updateValues.push(updateData.nombreRol.trim());
    }

    if (updateData.descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(updateData.descripcion.trim());
    }

    if (updateData.privilegio !== undefined) {
      updateFields.push('privilegio = ?');
      updateValues.push(updateData.privilegio);
    }

    if (updateData.estatus !== undefined) {
      updateFields.push('estatus = ?');
      updateValues.push(updateData.estatus);
    }

    // Agregar campos de auditoría
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const usuarioAuditoria = updateData.usuarioauditoria || 'SISTEMA';

    updateFields.push('fehamodificacionauditoria = ?', 'usuarioauditoria = ?');
    updateValues.push(fechaActual, usuarioAuditoria);

    // Agregar el ID al final para la cláusula WHERE
    updateValues.push(rolId);

    // Ejecutar la actualización si hay campos para actualizar
    if (updateFields.length > 2) { // Solo campos de auditoría no cuentan como actualización
      console.log('💾 [rolesController] Ejecutando actualización en la base de datos');
      
      await executeQuery(
        `UPDATE tblposcrumenwebrolesdeusuario SET ${updateFields.join(', ')} WHERE idRol = ?`,
        updateValues
      );

      console.log('✅ [rolesController] Rol actualizado exitosamente');
    }

    // Obtener el rol actualizado
    const updatedRol = await executeQuery(
      'SELECT * FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [rolId]
    );

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: updatedRol[0]
    } as ApiResponse<RolUsuario>);

  } catch (error) {
    console.error('❌ [rolesController] Error actualizando rol:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para eliminar (inactivar) un rol
export const deleteRolController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Obtiene el ID del rol
    const { usuarioauditoria } = req.body; // Usuario que realiza la eliminación
    
    console.log(`🗑️ [rolesController] Eliminando rol ID: ${id}`);

    // Validar que el ID sea un número válido
    const rolId = parseInt(id);
    if (isNaN(rolId) || rolId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de rol no válido'
      } as ApiResponse);
      return;
    }

    // Verificar que el rol existe
    const existingRol = await executeQuery(
      'SELECT * FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [rolId]
    );

    if (existingRol.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      } as ApiResponse);
      return;
    }

    // Inactivar el rol (no eliminar físicamente)
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const usuarioAudit = usuarioauditoria || 'SISTEMA';
    
    await executeQuery(
      `UPDATE tblposcrumenwebrolesdeusuario 
       SET estatus = 0, 
           fehamodificacionauditoria = ?, 
           usuarioauditoria = ? 
       WHERE idRol = ?`,
      [fechaActual, usuarioAudit, rolId]
    );

    console.log('✅ [rolesController] Rol eliminado (inactivado) exitosamente');

    res.json({
      success: true,
      message: 'Rol eliminado exitosamente',
      data: null
    } as ApiResponse);

  } catch (error) {
    console.error('❌ [rolesController] Error eliminando rol:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};