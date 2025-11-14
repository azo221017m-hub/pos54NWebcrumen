// backend/src/controllers/descuentosController.ts
// Controlador para gestión de descuentos en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { Descuento, CreateDescuentoData, UpdateDescuentoData, ApiResponse } from '../types'; // Importa tipos personalizados

// Controlador para obtener todos los descuentos
export const getDescuentosController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('💰 [descuentosController] Obteniendo todos los descuentos'); // Log de inicio
    
    // Ejecuta la consulta para obtener todos los descuentos
    const descuentos = await executeQuery(
      'SELECT * FROM tblposcrumenwebdescuentos ORDER BY nombre ASC',
      []
    );

    console.log(`📊 [descuentosController] Descuentos encontrados: ${descuentos ? descuentos.length : 0}`); // Log de resultados
    
    res.json({
      success: true,
      message: 'Descuentos obtenidos exitosamente',
      data: descuentos || []
    } as ApiResponse<Descuento[]>);

  } catch (error) {
    console.error('❌ [descuentosController] Error obteniendo descuentos:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear un nuevo descuento
export const createDescuentoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const descuentoData: CreateDescuentoData = req.body;
    console.log('💰 [descuentosController] Creando nuevo descuento:', descuentoData);

    // Validaciones básicas
    if (!descuentoData.nombre?.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre del descuento es obligatorio'
      } as ApiResponse);
      return;
    }

    if (!descuentoData.tipodescuento || !['$', '%'].includes(descuentoData.tipodescuento)) {
      res.status(400).json({
        success: false,
        message: 'El tipo de descuento debe ser $ o %'
      } as ApiResponse);
      return;
    }

    if (!descuentoData.valor || isNaN(Number(descuentoData.valor)) || Number(descuentoData.valor) <= 0) {
      res.status(400).json({
        success: false,
        message: 'El valor del descuento debe ser un número válido mayor a 0'
      } as ApiResponse);
      return;
    }

    // Validar que si es porcentaje, no sea mayor a 100
    if (descuentoData.tipodescuento === '%' && Number(descuentoData.valor) > 100) {
      res.status(400).json({
        success: false,
        message: 'El porcentaje de descuento no puede ser mayor a 100%'
      } as ApiResponse);
      return;
    }

    if (!descuentoData.estatusdescuento || !['ACTIVO', 'INACTIVO'].includes(descuentoData.estatusdescuento)) {
      res.status(400).json({
        success: false,
        message: 'El estatus del descuento debe ser ACTIVO o INACTIVO'
      } as ApiResponse);
      return;
    }

    if (!descuentoData.requiereautorizacion || !['SI', 'NO'].includes(descuentoData.requiereautorizacion)) {
      res.status(400).json({
        success: false,
        message: 'El campo requiere autorización debe ser SI o NO'
      } as ApiResponse);
      return;
    }

    // Verificar que no exista otro descuento con el mismo nombre
    const existingDescuento = await executeQuery(
      'SELECT id_descuento FROM tblposcrumenwebdescuentos WHERE nombre = ?',
      [descuentoData.nombre.trim()]
    );

    if (existingDescuento.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un descuento con ese nombre'
      } as ApiResponse);
      return;
    }

    // Preparar datos para inserción con campos de auditoría
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const usuarioAuditoria = descuentoData.usuarioauditoria || 'SISTEMA';
    const idNegocio = descuentoData.idnegocio || 1;

    console.log('💾 [descuentosController] Insertando descuento en la base de datos');
    
    // Ejecuta la consulta de inserción
    const result = await executeQuery(
      `INSERT INTO tblposcrumenwebdescuentos 
       (nombre, tipodescuento, valor, estatusdescuento, requiereautorizacion, 
        fechaRegistroauditoria, usuarioauditoria, fehamodificacionauditoria, idnegocio) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        descuentoData.nombre.trim(),
        descuentoData.tipodescuento,
        Number(descuentoData.valor),
        descuentoData.estatusdescuento,
        descuentoData.requiereautorizacion,
        fechaActual,
        usuarioAuditoria,
        fechaActual,
        idNegocio
      ]
    );

    console.log('✅ [descuentosController] Descuento creado exitosamente');
    
    res.status(201).json({
      success: true,
      message: 'Descuento creado exitosamente',
      data: {
        id_descuento: result.insertId,
        nombre: descuentoData.nombre.trim(),
        tipodescuento: descuentoData.tipodescuento,
        valor: Number(descuentoData.valor),
        estatusdescuento: descuentoData.estatusdescuento,
        requiereautorizacion: descuentoData.requiereautorizacion
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('❌ [descuentosController] Error creando descuento:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar un descuento existente
export const updateDescuentoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Obtiene el ID del descuento de los parámetros
    const updateData: UpdateDescuentoData = req.body; // Obtiene los datos de actualización
    
    console.log(`🔄 [descuentosController] Actualizando descuento ID: ${id}`, updateData);

    // Validar que el ID sea un número válido
    const descuentoId = parseInt(id);
    if (isNaN(descuentoId) || descuentoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de descuento no válido'
      } as ApiResponse);
      return;
    }

    // Verificar que el descuento existe
    const existingDescuento = await executeQuery(
      'SELECT * FROM tblposcrumenwebdescuentos WHERE id_descuento = ?',
      [descuentoId]
    );

    if (existingDescuento.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Descuento no encontrado'
      } as ApiResponse);
      return;
    }

    // Validaciones de los campos que se van a actualizar
    if (updateData.nombre !== undefined) {
      if (!updateData.nombre.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre del descuento no puede estar vacío'
        } as ApiResponse);
        return;
      }

      // Verificar que no exista otro descuento con el mismo nombre (excluyendo el actual)
      const duplicateDescuento = await executeQuery(
        'SELECT id_descuento FROM tblposcrumenwebdescuentos WHERE nombre = ? AND id_descuento != ?',
        [updateData.nombre.trim(), descuentoId]
      );

      if (duplicateDescuento.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Ya existe otro descuento con ese nombre'
        } as ApiResponse);
        return;
      }
    }

    if (updateData.tipodescuento !== undefined && !['$', '%'].includes(updateData.tipodescuento)) {
      res.status(400).json({
        success: false,
        message: 'El tipo de descuento debe ser $ o %'
      } as ApiResponse);
      return;
    }

    if (updateData.valor !== undefined) {
      const valor = Number(updateData.valor);
      if (isNaN(valor) || valor <= 0) {
        res.status(400).json({
          success: false,
          message: 'El valor del descuento debe ser un número válido mayor a 0'
        } as ApiResponse);
        return;
      }

      // Validar que si es porcentaje, no sea mayor a 100
      const tipoDescuento = updateData.tipodescuento || existingDescuento[0].tipodescuento;
      if (tipoDescuento === '%' && valor > 100) {
        res.status(400).json({
          success: false,
          message: 'El porcentaje de descuento no puede ser mayor a 100%'
        } as ApiResponse);
        return;
      }
    }

    if (updateData.estatusdescuento !== undefined && !['ACTIVO', 'INACTIVO'].includes(updateData.estatusdescuento)) {
      res.status(400).json({
        success: false,
        message: 'El estatus del descuento debe ser ACTIVO o INACTIVO'
      } as ApiResponse);
      return;
    }

    if (updateData.requiereautorizacion !== undefined && !['SI', 'NO'].includes(updateData.requiereautorizacion)) {
      res.status(400).json({
        success: false,
        message: 'El campo requiere autorización debe ser SI o NO'
      } as ApiResponse);
      return;
    }

    // Construir la consulta de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updateData.nombre !== undefined) {
      updateFields.push('nombre = ?');
      updateValues.push(updateData.nombre.trim());
    }

    if (updateData.tipodescuento !== undefined) {
      updateFields.push('tipodescuento = ?');
      updateValues.push(updateData.tipodescuento);
    }

    if (updateData.valor !== undefined) {
      updateFields.push('valor = ?');
      updateValues.push(Number(updateData.valor));
    }

    if (updateData.estatusdescuento !== undefined) {
      updateFields.push('estatusdescuento = ?');
      updateValues.push(updateData.estatusdescuento);
    }

    if (updateData.requiereautorizacion !== undefined) {
      updateFields.push('requiereautorizacion = ?');
      updateValues.push(updateData.requiereautorizacion);
    }

    // Agregar campos de auditoría
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const usuarioAuditoria = updateData.usuarioauditoria || 'SISTEMA';

    updateFields.push('fehamodificacionauditoria = ?', 'usuarioauditoria = ?');
    updateValues.push(fechaActual, usuarioAuditoria);

    // Agregar el ID al final para la cláusula WHERE
    updateValues.push(descuentoId);

    // Ejecutar la actualización si hay campos para actualizar
    if (updateFields.length > 2) { // Solo campos de auditoría no cuentan como actualización
      console.log('💾 [descuentosController] Ejecutando actualización en la base de datos');
      
      await executeQuery(
        `UPDATE tblposcrumenwebdescuentos SET ${updateFields.join(', ')} WHERE id_descuento = ?`,
        updateValues
      );

      console.log('✅ [descuentosController] Descuento actualizado exitosamente');
    }

    // Obtener el descuento actualizado
    const updatedDescuento = await executeQuery(
      'SELECT * FROM tblposcrumenwebdescuentos WHERE id_descuento = ?',
      [descuentoId]
    );

    res.json({
      success: true,
      message: 'Descuento actualizado exitosamente',
      data: updatedDescuento[0]
    } as ApiResponse<Descuento>);

  } catch (error) {
    console.error('❌ [descuentosController] Error actualizando descuento:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para eliminar (inactivar) un descuento
export const deleteDescuentoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Obtiene el ID del descuento
    const { usuarioauditoria } = req.body; // Obtiene el usuario de auditoría
    
    console.log(`🗑️ [descuentosController] Eliminando descuento ID: ${id}`);

    // Validar que el ID sea un número válido
    const descuentoId = parseInt(id);
    if (isNaN(descuentoId) || descuentoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de descuento no válido'
      } as ApiResponse);
      return;
    }

    // Verificar que el descuento existe
    const existingDescuento = await executeQuery(
      'SELECT * FROM tblposcrumenwebdescuentos WHERE id_descuento = ?',
      [descuentoId]
    );

    if (existingDescuento.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Descuento no encontrado'
      } as ApiResponse);
      return;
    }

    // Verificar si ya está inactivo
    if (existingDescuento[0].estatusdescuento === 'INACTIVO') {
      res.status(400).json({
        success: false,
        message: 'El descuento ya está inactivo'
      } as ApiResponse);
      return;
    }

    // Cambiar el estatus a INACTIVO (eliminación lógica)
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const usuarioAudit = usuarioauditoria || 'SISTEMA';

    console.log('💾 [descuentosController] Cambiando estatus a INACTIVO');
    
    await executeQuery(
      `UPDATE tblposcrumenwebdescuentos 
       SET estatusdescuento = 'INACTIVO', 
           fehamodificacionauditoria = ?, 
           usuarioauditoria = ? 
       WHERE id_descuento = ?`,
      [fechaActual, usuarioAudit, descuentoId]
    );

    console.log('✅ [descuentosController] Descuento eliminado (inactivado) exitosamente');

    res.json({
      success: true,
      message: 'Descuento eliminado exitosamente',
      data: {
        id_descuento: descuentoId,
        estatusdescuento: 'INACTIVO'
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('❌ [descuentosController] Error eliminando descuento:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Exportar todos los controladores
export default {
  getDescuentosController,
  createDescuentoController,
  updateDescuentoController,
  deleteDescuentoController
};