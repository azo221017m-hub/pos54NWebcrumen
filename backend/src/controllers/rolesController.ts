// backend/src/controllers/rolesController.ts
// Controlador para gestión de roles de usuario

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { ApiResponse, CreateRolData } from '../types'; // Importa tipos personalizados

// Controlador para obtener roles para dropdowns (solo activos)
export const getRolesController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👥 Obteniendo lista de roles para dropdown'); // Log de inicio

    // Consulta roles activos para dropdowns
    const roles = await executeQuery(
      'SELECT idRol, nombreRol FROM tblposcrumenwebrolesdeusuario WHERE estatus = 1 ORDER BY nombreRol',
      []
    );

    console.log(`✅ ${roles.length} roles activos encontrados`); // Log de resultados

    // Retorna la lista de roles
    res.json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo roles:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para obtener todos los roles completos (para gestión)
export const getRolesCompleteController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👥 Obteniendo lista completa de roles'); // Log de inicio

    // Consulta todos los roles con información completa
    const roles = await executeQuery(
      'SELECT idRol, nombreRol, descripcion, estatus, fechaRegistro, fechaActualizacion, usuario FROM tblposcrumenwebrolesdeusuario ORDER BY fechaRegistro DESC',
      []
    );

    console.log(`✅ ${roles.length} roles encontrados`); // Log de resultados

    // Retorna la lista completa de roles
    res.json({
      success: true,
      message: 'Roles completos obtenidos exitosamente',
      data: roles
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo roles completos:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear un nuevo rol
export const createRolController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👥 Creando nuevo rol'); // Log de inicio
    const rolData: CreateRolData = req.body; // Extrae datos del cuerpo

    // Valida campos requeridos
    const requiredFields = ['nombreRol', 'descripcion'];
    const missingFields = requiredFields.filter(field => !rolData[field as keyof CreateRolData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Faltan campos requeridos:', missingFields); // Log de error
      res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        error: 'MISSING_FIELDS'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe un rol con el mismo nombre
    const existingRol = await executeQuery(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE nombreRol = ?',
      [rolData.nombreRol]
    );

    if (existingRol.length > 0) {
      console.log('❌ Rol ya existe'); // Log de error
      res.status(409).json({
        success: false,
        message: 'Ya existe un rol con ese nombre',
        error: 'ROLE_EXISTS'
      } as ApiResponse);
      return;
    }

    // Inserta el nuevo rol
    const result = await executeQuery(`
      INSERT INTO tblposcrumenwebrolesdeusuario 
      (nombreRol, descripcion, estatus, fechaRegistro, fechaActualizacion, usuario)
      VALUES (?, ?, ?, NOW(), NOW(), ?)
    `, [
      rolData.nombreRol,
      rolData.descripcion,
      rolData.estatus || 1, // Por defecto activo
      rolData.usuario || 'system'
    ]);

    console.log('✅ Rol creado exitosamente'); // Log de éxito
    
    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: { 
        idRol: (result as any).insertId,
        nombreRol: rolData.nombreRol 
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando rol:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando rol',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};