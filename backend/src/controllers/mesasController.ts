// backend/src/controllers/mesasController.ts
// Controlador para gestión de mesas

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { Mesa, CreateMesaData, UpdateMesaData } from '../types';

// Controlador para obtener todas las mesas
export const getMesasController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🍽️ Obteniendo lista de mesas');

    // Query para obtener todas las mesas
    const query = `
      SELECT 
        idmesa,
        nombremesa,
        numeromesa,
        cantcomensales,
        estatusmesa,
        tiempodeinicio,
        tiempoactual,
        estatustiempo,
        creado_en,
        actualizado_en,
        creado_por,
        actualizado_por
      FROM tblposcrumenwebmesas
      ORDER BY numeromesa ASC
    `;

    const mesas = await executeQuery(query);
    console.log(`✅ ${mesas.length} mesas encontradas`);

    res.status(200).json({
      success: true,
      message: `${mesas.length} mesas encontradas`,
      data: mesas
    });

  } catch (error) {
    console.error('❌ Error al obtener mesas:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener mesas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Controlador para crear una nueva mesa
export const createMesaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const mesaData: CreateMesaData = req.body;
    console.log('🍽️ Creando nueva mesa:', mesaData);

    // Validaciones básicas
    if (!mesaData.nombremesa?.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la mesa es obligatorio'
      });
      return;
    }

    if (!mesaData.numeromesa || isNaN(Number(mesaData.numeromesa)) || Number(mesaData.numeromesa) <= 0) {
      res.status(400).json({
        success: false,
        message: 'El número de mesa debe ser un número válido mayor a 0'
      });
      return;
    }

    if (!mesaData.cantcomensales || isNaN(Number(mesaData.cantcomensales)) || Number(mesaData.cantcomensales) <= 0) {
      res.status(400).json({
        success: false,
        message: 'La cantidad de comensales debe ser un número válido mayor a 0'
      });
      return;
    }

    if (!mesaData.estatusmesa || !['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'INACTIVA'].includes(mesaData.estatusmesa)) {
      res.status(400).json({
        success: false,
        message: 'El estatus de la mesa debe ser DISPONIBLE, OCUPADA, RESERVADA o INACTIVA'
      });
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
      });
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
        creado_en,
        actualizado_en,
        creado_por,
        actualizado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      mesaData.nombremesa.trim(),
      Number(mesaData.numeromesa),
      Number(mesaData.cantcomensales),
      mesaData.estatusmesa,
      fechaActual,
      fechaActual,
      mesaData.creado_por || 'sistema',
      mesaData.creado_por || 'sistema'
    ];

    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', params);

    const result = await executeQuery(query, params);
    console.log('✅ Mesa creada exitosamente. ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Mesa creada exitosamente',
      data: {
        idmesa: result.insertId,
        ...mesaData
      }
    });

  } catch (error) {
    console.error('❌ Error al crear mesa:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Controlador para actualizar una mesa
export const updateMesaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const idmesa = parseInt(req.params.id);
    const mesaData: UpdateMesaData = req.body;
    
    console.log(`🔄 Actualizando mesa ID: ${idmesa}`, mesaData);

    // Validar ID de mesa
    if (isNaN(idmesa)) {
      res.status(400).json({
        success: false,
        message: 'ID de mesa inválido'
      });
      return;
    }

    // Verificar que la mesa existe
    const existingMesa = await executeQuery(
      'SELECT idmesa FROM tblposcrumenwebmesas WHERE idmesa = ?',
      [idmesa]
    );

    if (existingMesa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada'
      });
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
        });
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
        });
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
        });
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
        });
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
        });
        return;
      }
      updateFields.push('estatusmesa = ?');
      updateValues.push(mesaData.estatusmesa);
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
      return;
    }

    // Agregar campos de auditoría
    updateFields.push('actualizado_en = ?', 'actualizado_por = ?');
    updateValues.push(new Date(), mesaData.actualizado_por || 'sistema');

    const query = `UPDATE tblposcrumenwebmesas SET ${updateFields.join(', ')} WHERE idmesa = ?`;
    updateValues.push(idmesa);

    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', updateValues);

    const result = await executeQuery(query, updateValues);

    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada para actualizar'
      });
      return;
    }

    console.log('✅ Mesa actualizada exitosamente');

    res.status(200).json({
      success: true,
      message: 'Mesa actualizada exitosamente',
      data: {
        idmesa,
        ...mesaData
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar mesa:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Controlador para eliminar una mesa (cambiar a inactiva)
export const deleteMesaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const idmesa = parseInt(req.params.id);
    const { actualizado_por } = req.body;
    
    console.log(`🗑️ Inactivando mesa ID: ${idmesa}`);

    // Validar ID de mesa
    if (isNaN(idmesa)) {
      res.status(400).json({
        success: false,
        message: 'ID de mesa inválido'
      });
      return;
    }

    // Verificar que la mesa existe
    const existingMesa = await executeQuery(
      'SELECT idmesa, estatusmesa FROM tblposcrumenwebmesas WHERE idmesa = ?',
      [idmesa]
    );

    if (existingMesa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada'
      });
      return;
    }

    // Cambiar estatus a INACTIVA
    const query = `
      UPDATE tblposcrumenwebmesas 
      SET estatusmesa = 'INACTIVA', actualizado_en = ?, actualizado_por = ? 
      WHERE idmesa = ?
    `;

    const result = await executeQuery(query, [new Date(), actualizado_por || 'sistema', idmesa]);

    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Mesa no encontrada para eliminar'
      });
      return;
    }

    console.log('✅ Mesa inactivada exitosamente');

    res.status(200).json({
      success: true,
      message: 'Mesa eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar mesa:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};