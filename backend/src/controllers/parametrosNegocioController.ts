// backend/src/controllers/parametrosNegocioController.ts
// Controlador para gestión de parámetros de negocio

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery, executeTransaction } from '../config/database'; // Importa funciones para ejecutar consultas
import type { ApiResponse, CreateParametrosNegocioData } from '../types'; // Importa tipos personalizados

// Controlador para obtener parámetros de un negocio
export const getParametrosNegocioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idNegocio } = req.params; // Obtiene ID del negocio
    console.log('⚙️ Obteniendo parámetros del negocio:', idNegocio); // Log de inicio

    // Consulta parámetros del negocio específico
    const parametros = await executeQuery(
      'SELECT * FROM tblposcrumenwebparametrosnegocio WHERE idNegocio = ? ORDER BY fechaRegistro DESC',
      [idNegocio]
    );

    console.log(`✅ ${parametros.length} parámetros encontrados`); // Log de resultados

    // Retorna los parámetros
    res.json({
      success: true,
      message: 'Parámetros obtenidos exitosamente',
      data: parametros
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo parámetros:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear parámetros de negocio
export const createParametrosNegocioController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('⚙️ Creando parámetros de negocio'); // Log de inicio
    const parametrosData: CreateParametrosNegocioData = req.body; // Extrae datos del cuerpo

    // Valida campos requeridos
    const requiredFields = ['idNegocio', 'tipoNegocio', 'encabezado', 'pie', 'tipoRecibo'];
    const missingFields = requiredFields.filter(field => !parametrosData[field as keyof CreateParametrosNegocioData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Faltan campos requeridos:', missingFields); // Log de error
      res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        error: 'MISSING_FIELDS'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existen parámetros para este negocio
    const existingParametros = await executeQuery(
      'SELECT idParametro FROM tblposcrumenwebparametrosnegocio WHERE idNegocio = ?',
      [parametrosData.idNegocio]
    );

    if (existingParametros.length > 0) {
      console.log('❌ Ya existen parámetros para este negocio'); // Log de error
      res.status(409).json({
        success: false,
        message: 'Ya existen parámetros para este negocio',
        error: 'PARAMETERS_EXISTS'
      } as ApiResponse);
      return;
    }

    // Inserta los nuevos parámetros
    const result = await executeQuery(`
      INSERT INTO tblposcrumenwebparametrosnegocio 
      (idNegocio, tipoNegocio, impresionRecibo, encabezado, pie, tipoRecibo, envioMensaje, estatus, fechaRegistro, fechaActualizacion, usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `, [
      parametrosData.idNegocio,
      parametrosData.tipoNegocio,
      parametrosData.impresionRecibo || 1,
      parametrosData.encabezado,
      parametrosData.pie,
      parametrosData.tipoRecibo,
      parametrosData.envioMensaje || 0,
      parametrosData.estatus || 1,
      parametrosData.usuario || 'system'
    ]);

    console.log('✅ Parámetros creados exitosamente'); // Log de éxito
    
    res.status(201).json({
      success: true,
      message: 'Parámetros creados exitosamente',
      data: { 
        idParametro: (result as any).insertId,
        idNegocio: parametrosData.idNegocio 
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando parámetros:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando parámetros',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para registro completo de negocio (cliente + negocio + parámetros)
export const createNegocioCompletoController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🏢 Iniciando registro completo de negocio'); // Log de inicio
    const { cliente, negocio, parametros } = req.body;

    // Inicia transacción
    await executeTransaction('START TRANSACTION');

    try {
      // Paso 1: Registrar cliente
      console.log('👤 Registrando cliente...'); // Log de paso
      const clienteResult = await executeQuery(`
        INSERT INTO tblposcrumenwebclientes 
        (nombre, telefono, email, direccion, estatus, fechaRegistro, fechaActualizacion, usuario)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)
      `, [
        cliente.nombre,
        cliente.telefono,
        cliente.email,
        cliente.direccion,
        cliente.estatus || 1,
        cliente.usuario || 'system'
      ]);

      const idCliente = (clienteResult as any).insertId;
      console.log('✅ Cliente registrado con ID:', idCliente); // Log de éxito

      // Paso 2: Registrar negocio con idCliente como numerocliente
      console.log('🏢 Registrando negocio...'); // Log de paso
      const negocioResult = await executeQuery(`
        INSERT INTO tblposcrumenwebnegocio 
        (numerocliente, nombreNegocio, rfc, direccion, telefono, estatusCliente, fechaRegistro, fechaActualizacion, usuario)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
      `, [
        idCliente.toString(), // Usar idCliente como numerocliente
        negocio.nombreNegocio,
        negocio.rfc,
        negocio.direccion,
        negocio.telefono,
        negocio.estatusCliente || 1,
        negocio.usuario || 'system'
      ]);

      const idNegocio = (negocioResult as any).insertId;
      console.log('✅ Negocio registrado con ID:', idNegocio); // Log de éxito

      // Paso 3: Registrar parámetros del negocio
      console.log('⚙️ Registrando parámetros...'); // Log de paso
      await executeQuery(`
        INSERT INTO tblposcrumenwebparametrosnegocio 
        (idNegocio, tipoNegocio, impresionRecibo, encabezado, pie, tipoRecibo, envioMensaje, estatus, fechaRegistro, fechaActualizacion, usuario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
      `, [
        idNegocio,
        parametros.tipoNegocio,
        parametros.impresionRecibo || 1,
        parametros.encabezado,
        parametros.pie,
        parametros.tipoRecibo,
        parametros.envioMensaje || 0,
        parametros.estatus || 1,
        parametros.usuario || 'system'
      ]);

      // Confirma transacción
      await executeTransaction('COMMIT');
      console.log('✅ Registro completo exitoso'); // Log de éxito total

      res.status(201).json({
        success: true,
        message: 'Negocio registrado completamente',
        data: { 
          idCliente,
          idNegocio,
          numerocliente: idCliente.toString()
        }
      } as ApiResponse);

    } catch (error) {
      // Revierte transacción en caso de error
      await executeTransaction('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error en registro completo:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error en registro completo de negocio',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};