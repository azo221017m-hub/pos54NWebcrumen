// backend/src/controllers/mesasController.ts
// Controlador para gestión de mesas en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { Mesa, CreateMesaData, ApiResponse } from '../types'; // Importa tipos personalizados

// Interfaz para datos de actualización de mesa
interface UpdateMesaData {
  nombremesa?: string;
  numeromesa?: number;
  cantcomensales?: number;
  estatusmesa?: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA';
  tiempodeinicio?: string;
  tiempoactual?: string;
  estatustiempo?: 'ACTIVO' | 'PAUSADO' | 'FINALIZADO';
  usuarioauditoria?: string;
  idnegocio?: number;
}

// Controlador para obtener todas las mesas
export const getMesasController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 [mesasController] Obteniendo todas las mesas'); // Log de inicio
    
    // Ejecuta la consulta para obtener todas las mesas
    const mesas = await executeQuery(
      'SELECT * FROM tblposcrumenwebmesas ORDER BY numeromesa ASC',
      []
    );

    console.log(`📊 [mesasController] Mesas encontradas: ${mesas ? mesas.length : 0}`); // Log de resultados
    
    res.json({
      success: true,
      message: 'Mesas obtenidas exitosamente',
      data: mesas || []
    } as ApiResponse<Mesa[]>);

  } catch (error) {
    console.error('❌ [mesasController] Error obteniendo mesas:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear una nueva mesa
export const createMesaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mesaData: CreateMesaData = req.body;
    console.log('🍽️ [mesasController] Creando nueva mesa:', mesaData);

    // Validaciones básicas
    if (!mesaData.nombremesa?.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la mesa es obligatorio'
      } as ApiResponse);
      return;
    }

    if (!mesaData.numeromesa || isNaN(Number(mesaData.numeromesa)) || Number(mesaData.numeromesa) <= 0) {
      res.status(400).json({
        success: false,
        message: 'El número de mesa debe ser un número válido mayor a 0'
      } as ApiResponse);
      return;
    }

    if (!mesaData.cantcomensales || isNaN(Number(mesaData.cantcomensales)) || Number(mesaData.cantcomensales) <= 0) {
      res.status(400).json({
        success: false,
        message: 'La cantidad de comensales debe ser un número válido mayor a 0'
      } as ApiResponse);
      return;
    }

    if (!mesaData.estatusmesa || !['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'INACTIVA'].includes(mesaData.estatusmesa)) {
      res.status(400).json({
        success: false,
        message: 'El estatus de la mesa debe ser DISPONIBLE, OCUPADA, RESERVADA o INACTIVA'
      } as ApiResponse);
      return;
    }

    // Verificar que no exista otra mesa con el mismo número
    const existingMesa = await executeQuery(
      'SELECT idmesa FROM tblposcrumenwebmesas WHERE numeromesa = ?',
      [mesaData.numeromesa]
    );

    if (existingMesa.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya existe una mesa con ese número'
      } as ApiResponse);
      return;
    }

    // Preparar datos para inserción
    const fechaActual = new Date();
    
    const query = `
      INSERT INTO tblposcrumenwebmesas (
        nombremesa,
        numeromesa,
        cantcomensales,
        estatusmesa,
        tiempodeinicio,
        tiempoactual,
        estatustiempo,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      mesaData.nombremesa.trim(),
      Number(mesaData.numeromesa),
      Number(mesaData.cantcomensales),
      mesaData.estatusmesa,
      null, // tiempodeinicio
      null, // tiempoactual
      null, // estatustiempo por defecto (null para evitar truncamiento)
      fechaActual,
      mesaData.usuarioauditoria || 'sistema',
      fechaActual,
      mesaData.idnegocio || 1
    ];

    console.log('🔍 [mesasController] Ejecutando query:', query);
    console.log('📝 [mesasController] Parámetros:', params);

    const result = await executeQuery(query, params);
    console.log('✅ [mesasController] Mesa creada exitosamente. ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Mesa creada exitosamente',
      data: {
        idmesa: result.insertId,
        ...mesaData
      }
    } as ApiResponse<Mesa>);

  } catch (error) {
    console.error('❌ [mesasController] Error al crear mesa:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as ApiResponse);
  }
};

// Controlador para actualizar una mesa
export const updateMesaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const idmesa = parseInt(req.params.id);
    const mesaData: UpdateMesaData = req.body;
    
    console.log(`🔄 [mesasController] Actualizando mesa ID: ${idmesa}`, mesaData);

    // Validar ID de mesa
    if (isNaN(idmesa)) {
      res.status(400).json({
        success: false,
        message: 'ID de mesa inválido'
      } as ApiResponse);
      return;
    }

    // Verificar que la mesa exists
    const existingMesa = await executeQuery(
      'SELECT idmesa FROM tblposcrumenwebmesas WHERE idmesa = ?',
      [idmesa]
    );

    if (existingMesa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada'
      } as ApiResponse);
      return;
    }

    // Construir query dinámico
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (mesaData.nombremesa !== undefined) {
      if (!mesaData.nombremesa.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la mesa no puede estar vacío'
        } as ApiResponse);
        return;
      }
      updateFields.push('nombremesa = ?');
      updateValues.push(mesaData.nombremesa.trim());
    }

    if (mesaData.numeromesa !== undefined) {
      if (isNaN(Number(mesaData.numeromesa)) || Number(mesaData.numeromesa) <= 0) {
        res.status(400).json({
          success: false,
          message: 'El número de mesa debe ser un número válido mayor a 0'
        } as ApiResponse);
        return;
      }

      // Verificar que no exista otra mesa con el mismo número
      const existingNumber = await executeQuery(
        'SELECT idmesa FROM tblposcrumenwebmesas WHERE numeromesa = ? AND idmesa != ?',
        [mesaData.numeromesa, idmesa]
      );

      if (existingNumber.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Ya existe otra mesa con ese número'
        } as ApiResponse);
        return;
      }

      updateFields.push('numeromesa = ?');
      updateValues.push(Number(mesaData.numeromesa));
    }

    if (mesaData.cantcomensales !== undefined) {
      if (isNaN(Number(mesaData.cantcomensales)) || Number(mesaData.cantcomensales) <= 0) {
        res.status(400).json({
          success: false,
          message: 'La cantidad de comensales debe ser un número válido mayor a 0'
        } as ApiResponse);
        return;
      }
      updateFields.push('cantcomensales = ?');
      updateValues.push(Number(mesaData.cantcomensales));
    }

    if (mesaData.estatusmesa !== undefined) {
      if (!['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'INACTIVA'].includes(mesaData.estatusmesa)) {
        res.status(400).json({
          success: false,
          message: 'El estatus de la mesa debe ser DISPONIBLE, OCUPADA, RESERVADA o INACTIVA'
        } as ApiResponse);
        return;
      }
      updateFields.push('estatusmesa = ?');
      updateValues.push(mesaData.estatusmesa);
    }

    if (mesaData.tiempodeinicio !== undefined) {
      updateFields.push('tiempodeinicio = ?');
      updateValues.push(mesaData.tiempodeinicio);
    }

    if (mesaData.tiempoactual !== undefined) {
      updateFields.push('tiempoactual = ?');
      updateValues.push(mesaData.tiempoactual);
    }

    if (mesaData.estatustiempo !== undefined) {
      if (!['ACTIVO', 'PAUSADO', 'FINALIZADO'].includes(mesaData.estatustiempo)) {
        res.status(400).json({
          success: false,
          message: 'El estatus de tiempo debe ser ACTIVO, PAUSADO o FINALIZADO'
        } as ApiResponse);
        return;
      }
      updateFields.push('estatustiempo = ?');
      updateValues.push(mesaData.estatustiempo);
    }

    if (mesaData.idnegocio !== undefined) {
      updateFields.push('idnegocio = ?');
      updateValues.push(Number(mesaData.idnegocio));
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      } as ApiResponse);
      return;
    }

    // Agregar campos de auditoría
    updateFields.push('fehamodificacionauditoria = ?', 'usuarioauditoria = ?');
    updateValues.push(new Date(), mesaData.usuarioauditoria || 'sistema');

    const query = `UPDATE tblposcrumenwebmesas SET ${updateFields.join(', ')} WHERE idmesa = ?`;
    updateValues.push(idmesa);

    console.log('🔍 [mesasController] Ejecutando query:', query);
    console.log('📝 [mesasController] Parámetros:', updateValues);

    const result = await executeQuery(query, updateValues);

    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada para actualizar'
      } as ApiResponse);
      return;
    }

    console.log('✅ [mesasController] Mesa actualizada exitosamente');

    res.status(200).json({
      success: true,
      message: 'Mesa actualizada exitosamente',
      data: {
        idmesa,
        ...mesaData
      }
    } as ApiResponse<any>);

  } catch (error) {
    console.error('❌ [mesasController] Error al actualizar mesa:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as ApiResponse);
  }
};

// Controlador para eliminar una mesa (cambiar a inactiva)
export const deleteMesaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const idmesa = parseInt(req.params.id);
    const { usuarioauditoria } = req.body;
    
    console.log(`🗑️ [mesasController] Inactivando mesa ID: ${idmesa}`);

    // Validar ID de mesa
    if (isNaN(idmesa)) {
      res.status(400).json({
        success: false,
        message: 'ID de mesa inválido'
      } as ApiResponse);
      return;
    }

    // Verificar que la mesa exists
    const existingMesa = await executeQuery(
      'SELECT idmesa, estatusmesa FROM tblposcrumenwebmesas WHERE idmesa = ?',
      [idmesa]
    );

    if (existingMesa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada'
      } as ApiResponse);
      return;
    }

    // Cambiar estatus a INACTIVA
    const query = `
      UPDATE tblposcrumenwebmesas 
      SET estatusmesa = 'INACTIVA', fehamodificacionauditoria = ?, usuarioauditoria = ? 
      WHERE idmesa = ?
    `;

    const result = await executeQuery(query, [new Date(), usuarioauditoria || 'sistema', idmesa]);

    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada para eliminar'
      } as ApiResponse);
      return;
    }

    console.log('✅ [mesasController] Mesa inactivada exitosamente');

    res.status(200).json({
      success: true,
      message: 'Mesa eliminada exitosamente'
    } as ApiResponse);

  } catch (error) {
    console.error('❌ [mesasController] Error al eliminar mesa:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    } as ApiResponse);
  }
};