// backend/src/controllers/umedidaController.ts
// Controlador para gestión de Unidades de Medida de Compra

import { Request, Response } from 'express'; // Importa tipos de Express
import { RowDataPacket, OkPacket } from 'mysql2'; // Importa tipos de MySQL2
import pool from '../config/database'; // Importa pool de conexiones
import type { 
  ApiResponse, 
  UMedida, 
  CreateUMedidaData, 
  UpdateUMedidaData 
} from '../types'; // Importa tipos

// Controlador para obtener todas las unidades de medida
export const getUMedidas = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📏 Iniciando consulta de unidades de medida');
    
    // Query con información completa
    const query = `
      SELECT 
        idUmCompra,
        nombreUmCompra,
        valor,
        umMatPrima,
        valorConvertido,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposrumenwebumcompra
      ORDER BY nombreUmCompra ASC
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    console.log(`✅ Se encontraron ${rows.length} unidades de medida en el sistema`);
    
    // Transformar fechas a formato Date
    const umedidas: UMedida[] = rows.map(row => ({
      idUmCompra: row.idUmCompra,
      nombreUmCompra: row.nombreUmCompra,
      valor: parseFloat(row.valor),
      umMatPrima: row.umMatPrima,
      valorConvertido: parseFloat(row.valorConvertido),
      fechaRegistroauditoria: new Date(row.fechaRegistroauditoria),
      usuarioauditoria: row.usuarioauditoria,
      fehamodificacionauditoria: row.fehamodificacionauditoria ? new Date(row.fehamodificacionauditoria) : undefined,
      idnegocio: row.idnegocio
    }));
    
    const response: ApiResponse<UMedida[]> = {
      success: true,
      message: 'Unidades de medida obtenidas correctamente',
      data: umedidas
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error al obtener unidades de medida:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al obtener unidades de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para crear una nueva unidad de medida
export const createUMedida = async (req: Request, res: Response): Promise<void> => {
  try {
    const umedidaData: CreateUMedidaData = req.body;
    console.log('📏 Iniciando creación de unidad de medida:', umedidaData.nombreUmCompra);
    
    // Validaciones básicas
    if (!umedidaData.nombreUmCompra || !umedidaData.nombreUmCompra.trim()) {
      console.log('❌ Nombre de unidad de medida requerido');
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida es requerido'
      });
      return;
    }
    
    if (!umedidaData.umMatPrima || !umedidaData.umMatPrima.trim()) {
      console.log('❌ Unidad de materia prima requerida');
      res.status(400).json({
        success: false,
        message: 'La unidad de materia prima es requerida'
      });
      return;
    }

    // Validar que la unidad de materia prima sea una de las opciones permitidas
    const unidadesPermitidas: string[] = ['Kg', 'Lt', 'Pza'];
    if (!unidadesPermitidas.includes(umedidaData.umMatPrima)) {
      console.log('❌ Unidad de materia prima no válida:', umedidaData.umMatPrima);
      res.status(400).json({
        success: false,
        message: 'La unidad de materia prima debe ser: Kg, Lt o Pza'
      });
      return;
    }
    
    if (umedidaData.valor <= 0) {
      console.log('❌ Valor debe ser mayor a 0');
      res.status(400).json({
        success: false,
        message: 'El valor debe ser mayor a 0'
      });
      return;
    }
    
    if (umedidaData.valorConvertido <= 0) {
      console.log('❌ Valor convertido debe ser mayor a 0');
      res.status(400).json({
        success: false,
        message: 'El valor convertido debe ser mayor a 0'
      });
      return;
    }
    
    // Verificar si ya existe una unidad de medida con el mismo nombre
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE nombreUmCompra = ? AND idnegocio = ?',
      [umedidaData.nombreUmCompra.trim(), umedidaData.idnegocio]
    );
    
    if (existingRows.length > 0) {
      console.log('❌ Ya existe una unidad de medida con ese nombre');
      res.status(400).json({
        success: false,
        message: 'Ya existe una unidad de medida con ese nombre'
      });
      return;
    }
    
    // Crear la unidad de medida
    const insertQuery = `
      INSERT INTO tblposrumenwebumcompra 
      (nombreUmCompra, valor, umMatPrima, valorConvertido, fechaRegistroauditoria, usuarioauditoria, idnegocio)
      VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `;
    
    const [result] = await pool.execute<OkPacket>(insertQuery, [
      umedidaData.nombreUmCompra.trim(),
      umedidaData.valor,
      umedidaData.umMatPrima.trim(),
      umedidaData.valorConvertido,
      umedidaData.usuarioauditoria,
      umedidaData.idnegocio
    ]);
    
    console.log('✅ Unidad de medida creada con ID:', result.insertId);
    
    const response: ApiResponse<{ idUmCompra: number }> = {
      success: true,
      message: 'Unidad de medida creada correctamente',
      data: { idUmCompra: result.insertId }
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Error al crear unidad de medida:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al crear unidad de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para actualizar una unidad de medida existente
export const updateUMedida = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const umedidaData: UpdateUMedidaData = req.body;
    
    console.log('📏 Iniciando actualización de unidad de medida:', id);
    
    // Verificar que la unidad de medida existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE idUmCompra = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Unidad de medida no encontrada');
      res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
      return;
    }
    
    // Construir query dinámico basado en campos proporcionados
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (umedidaData.nombreUmCompra !== undefined) {
      if (!umedidaData.nombreUmCompra.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la unidad de medida no puede estar vacío'
        });
        return;
      }
      updateFields.push('nombreUmCompra = ?');
      updateValues.push(umedidaData.nombreUmCompra.trim());
    }
    
    if (umedidaData.valor !== undefined) {
      if (umedidaData.valor <= 0) {
        res.status(400).json({
          success: false,
          message: 'El valor debe ser mayor a 0'
        });
        return;
      }
      updateFields.push('valor = ?');
      updateValues.push(umedidaData.valor);
    }
    
    if (umedidaData.umMatPrima !== undefined) {
      if (!umedidaData.umMatPrima.trim()) {
        res.status(400).json({
          success: false,
          message: 'La unidad de materia prima no puede estar vacía'
        });
        return;
      }

      // Validar que la unidad de materia prima sea una de las opciones permitidas
      const unidadesPermitidas: string[] = ['Kg', 'Lt', 'Pza'];
      if (!unidadesPermitidas.includes(umedidaData.umMatPrima.trim())) {
        res.status(400).json({
          success: false,
          message: 'La unidad de materia prima debe ser: Kg, Lt o Pza'
        });
        return;
      }

      updateFields.push('umMatPrima = ?');
      updateValues.push(umedidaData.umMatPrima.trim());
    }
    
    if (umedidaData.valorConvertido !== undefined) {
      if (umedidaData.valorConvertido <= 0) {
        res.status(400).json({
          success: false,
          message: 'El valor convertido debe ser mayor a 0'
        });
        return;
      }
      updateFields.push('valorConvertido = ?');
      updateValues.push(umedidaData.valorConvertido);
    }
    
    if (umedidaData.usuarioauditoria !== undefined) {
      updateFields.push('usuarioauditoria = ?');
      updateValues.push(umedidaData.usuarioauditoria);
    }
    
    // Agregar fecha de modificación
    updateFields.push('fehamodificacionauditoria = NOW()');
    
    // Agregar ID al final para la condición WHERE
    updateValues.push(id);
    
    if (updateFields.length === 1) { // Solo la fecha de modificación
      console.log('❌ No hay campos para actualizar');
      res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
      return;
    }
    
    const updateQuery = `
      UPDATE tblposrumenwebumcompra 
      SET ${updateFields.join(', ')}
      WHERE idUmCompra = ?
    `;
    
    const [result] = await pool.execute<OkPacket>(updateQuery, updateValues);
    
    if (result.affectedRows === 0) {
      console.log('❌ No se pudo actualizar la unidad de medida');
      res.status(404).json({
        success: false,
        message: 'No se pudo actualizar la unidad de medida'
      });
      return;
    }
    
    console.log('✅ Unidad de medida actualizada correctamente:', id);
    
    const response: ApiResponse<{ idUmCompra: number }> = {
      success: true,
      message: 'Unidad de medida actualizada correctamente',
      data: { idUmCompra: parseInt(id) }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error al actualizar unidad de medida:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al actualizar unidad de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para eliminar una unidad de medida (eliminación física)
export const deleteUMedida = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    console.log('📏 Iniciando eliminación de unidad de medida:', id);
    
    // Verificar que la unidad de medida existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idUmCompra, nombreUmCompra FROM tblposrumenwebumcompra WHERE idUmCompra = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Unidad de medida no encontrada');
      res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
      return;
    }
    
    const umedida = existingRows[0];
    
    // Eliminar la unidad de medida (eliminación física)
    const deleteQuery = 'DELETE FROM tblposrumenwebumcompra WHERE idUmCompra = ?';
    const [result] = await pool.execute<OkPacket>(deleteQuery, [id]);
    
    if (result.affectedRows === 0) {
      console.log('❌ No se pudo eliminar la unidad de medida');
      res.status(404).json({
        success: false,
        message: 'No se pudo eliminar la unidad de medida'
      });
      return;
    }
    
    console.log('✅ Unidad de medida eliminada correctamente:', umedida.nombreUmCompra);
    
    const response: ApiResponse = {
      success: true,
      message: `Unidad de medida "${umedida.nombreUmCompra}" eliminada correctamente`
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error al eliminar unidad de medida:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al eliminar unidad de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};