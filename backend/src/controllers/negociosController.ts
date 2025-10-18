// backend/src/controllers/negociosController.ts
// Controlador para gestión de negocios en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { CreateNegocioData, Negocio, ApiResponse } from '../types'; // Importa tipos personalizados

// Controlador para obtener todos los negocios
export const getAllNegocios = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🏢 Obteniendo todos los negocios'); // Log de inicio
    
    // Consulta todos los negocios
    const negocios = await executeQuery(`
      SELECT * FROM tblposcrumenwebnegocio 
      ORDER BY fechaRegistro DESC
    `);

    console.log(`✅ Se encontraron ${negocios.length} negocios`); // Log de resultado
    
    res.json({
      success: true,
      message: 'Negocios obtenidos exitosamente',
      data: negocios
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo negocios:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo negocios',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear un nuevo negocio
export const createNegocio = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🏢 Creando nuevo negocio'); // Log de inicio
    const negocioData: CreateNegocioData = req.body; // Extrae datos del cuerpo

    // Valida campos requeridos
    const requiredFields = ['numerocliente', 'nombreNegocio', 'rfc', 'direccion', 'telefono'];
    const missingFields = requiredFields.filter(field => !negocioData[field as keyof CreateNegocioData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Faltan campos requeridos:', missingFields); // Log de error
      res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        error: 'MISSING_FIELDS'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe un negocio con el mismo RFC
    const existingNegocio = await executeQuery(
      'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE rfc = ?',
      [negocioData.rfc]
    );

    if (existingNegocio.length > 0) {
      console.log('❌ Negocio con RFC ya existe'); // Log de error
      res.status(409).json({
        success: false,
        message: 'Ya existe un negocio con ese RFC',
        error: 'RFC_EXISTS'
      } as ApiResponse);
      return;
    }

    // Inserta el nuevo negocio
    const result = await executeQuery(`
      INSERT INTO tblposcrumenwebnegocio 
      (numerocliente, nombreNegocio, rfc, direccion, telefono, estatusCliente, fechaRegistro, fechaActualizacion, usuario)
      VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW(), ?)
    `, [
      negocioData.numerocliente,
      negocioData.nombreNegocio,
      negocioData.rfc,
      negocioData.direccion,
      negocioData.telefono,
      negocioData.usuario || 'system'
    ]);

    console.log('✅ Negocio creado exitosamente'); // Log de éxito
    
    res.status(201).json({
      success: true,
      message: 'Negocio creado exitosamente',
      data: { 
        idNegocio: (result as any).insertId,
        nombreNegocio: negocioData.nombreNegocio 
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando negocio:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando negocio',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar un negocio
export const updateNegocio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Obtiene ID de los parámetros
    const updateData = req.body; // Obtiene datos a actualizar
    
    console.log(`🏢 Actualizando negocio ID: ${id}`); // Log de inicio

    // Verifica si el negocio existe
    const existingNegocio = await executeQuery(
      'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE idNegocio = ?',
      [id]
    );

    if (existingNegocio.length === 0) {
      console.log('❌ Negocio no encontrado'); // Log de error
      res.status(404).json({
        success: false,
        message: 'Negocio no encontrado',
        error: 'NEGOCIO_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Construye la consulta de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Campos actualizables
    const allowedFields = ['numerocliente', 'nombreNegocio', 'rfc', 'direccion', 'telefono', 'estatusCliente'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }

    // Agrega campos de auditoría
    updateFields.push('fechaActualizacion = NOW()');
    if (updateData.usuario) {
      updateFields.push('usuario = ?');
      updateValues.push(updateData.usuario);
    }

    // Agrega el ID al final para la condición WHERE
    updateValues.push(id);

    // Ejecuta la actualización
    await executeQuery(
      `UPDATE tblposcrumenwebnegocio SET ${updateFields.join(', ')} WHERE idNegocio = ?`,
      updateValues
    );

    console.log('✅ Negocio actualizado exitosamente'); // Log de éxito
    
    res.json({
      success: true,
      message: 'Negocio actualizado exitosamente',
      data: { idNegocio: id }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error actualizando negocio:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error actualizando negocio',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};