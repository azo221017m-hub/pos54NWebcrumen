// backend/src/controllers/cuentaContableController.ts
// Controlador para gestión de cuentas contables en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import pool from '../config/database'; // Importa pool de conexión a MySQL
import type { 
  CuentaContable, 
  CreateCuentaContableData, 
  UpdateCuentaContableData, 
  ApiResponse,
  NaturalezaCuentaContable,
  TipoCuentaContable
} from '../types'; // Importa tipos personalizados
import type { RowDataPacket, ResultSetHeader } from 'mysql2'; // Importa tipos de MySQL2

// Controlador para obtener todas las cuentas contables
export const getCuentasContables = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('💰 Iniciando obtención de cuentas contables');
    
    // Ejecutar consulta para obtener todas las cuentas contables
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebcuentacontable ORDER BY nombrecuentacontable ASC'
    );
    
    console.log(`📊 Cuentas contables encontradas: ${rows.length}`);
    
    // Convertir los resultados al tipo CuentaContable
    const cuentasContables: CuentaContable[] = rows.map((row: any) => ({
      id_cuentacontable: row.id_cuentacontable,
      naturalezacuentacontable: row.naturalezacuentacontable as NaturalezaCuentaContable,
      nombrecuentacontable: row.nombrecuentacontable,
      tipocuentacontable: row.tipocuentacontable as TipoCuentaContable,
      fechaRegistroauditoria: new Date(row.fechaRegistroauditoria),
      usuarioauditoria: row.usuarioauditoria,
      fechamodificacionauditoria: row.fechamodificacionauditoria ? new Date(row.fechamodificacionauditoria) : undefined,
      idnegocio: row.idnegocio
    }));

    const response: ApiResponse<CuentaContable[]> = {
      success: true,
      message: 'Cuentas contables obtenidas exitosamente',
      data: cuentasContables
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo cuentas contables:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al obtener cuentas contables',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para crear una nueva cuenta contable
export const createCuentaContable = async (req: Request, res: Response): Promise<void> => {
  try {
    const cuentaData: CreateCuentaContableData = req.body;
    console.log('💰 Iniciando creación de cuenta contable:', cuentaData.nombrecuentacontable);
    
    // Validaciones básicas
    if (!cuentaData.nombrecuentacontable || !cuentaData.nombrecuentacontable.trim()) {
      console.log('❌ Nombre de cuenta contable requerido');
      res.status(400).json({
        success: false,
        message: 'El nombre de la cuenta contable es requerido'
      });
      return;
    }
    
    if (!cuentaData.naturalezacuentacontable || !cuentaData.naturalezacuentacontable.trim()) {
      console.log('❌ Naturaleza de cuenta contable requerida');
      res.status(400).json({
        success: false,
        message: 'La naturaleza de la cuenta contable es requerida'
      });
      return;
    }

    // Validar que la naturaleza sea una de las opciones permitidas
    const naturalezasPermitidas: string[] = ['COMPRA', 'GASTO'];
    if (!naturalezasPermitidas.includes(cuentaData.naturalezacuentacontable)) {
      console.log('❌ Naturaleza de cuenta contable no válida:', cuentaData.naturalezacuentacontable);
      res.status(400).json({
        success: false,
        message: 'La naturaleza de cuenta contable debe ser: COMPRA o GASTO'
      });
      return;
    }

    if (!cuentaData.tipocuentacontable || !cuentaData.tipocuentacontable.trim()) {
      console.log('❌ Tipo de cuenta contable requerido');
      res.status(400).json({
        success: false,
        message: 'El tipo de cuenta contable es requerido'
      });
      return;
    }

    // Validar que el tipo de cuenta sea compatible con la naturaleza
    const tiposCompra = ['Inventario', 'Activo Fijo', 'Servicio', 'Administrativa', 'Eventual'];
    const tiposGasto = ['Operativo', 'Financiero', 'Eventual'];
    
    if (cuentaData.naturalezacuentacontable === 'COMPRA' && !tiposCompra.includes(cuentaData.tipocuentacontable)) {
      console.log('❌ Tipo de cuenta no válido para COMPRA:', cuentaData.tipocuentacontable);
      res.status(400).json({
        success: false,
        message: 'Para COMPRA, el tipo debe ser: Inventario, Activo Fijo, Servicio, Administrativa o Eventual'
      });
      return;
    }

    if (cuentaData.naturalezacuentacontable === 'GASTO' && !tiposGasto.includes(cuentaData.tipocuentacontable)) {
      console.log('❌ Tipo de cuenta no válido para GASTO:', cuentaData.tipocuentacontable);
      res.status(400).json({
        success: false,
        message: 'Para GASTO, el tipo debe ser: Operativo, Financiero o Eventual'
      });
      return;
    }
    
    // Verificar si ya existe una cuenta contable con el mismo nombre
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_cuentacontable FROM tblposcrumenwebcuentacontable WHERE nombrecuentacontable = ? AND idnegocio = ?',
      [cuentaData.nombrecuentacontable.trim(), cuentaData.idnegocio]
    );
    
    if (existingRows.length > 0) {
      console.log('❌ Ya existe una cuenta contable con ese nombre');
      res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta contable con ese nombre'
      });
      return;
    }
    
    // Crear la cuenta contable
    const insertQuery = `
      INSERT INTO tblposcrumenwebcuentacontable 
      (naturalezacuentacontable, nombrecuentacontable, tipocuentacontable, fechaRegistroauditoria, usuarioauditoria, idnegocio)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
    
    const insertValues = [
      cuentaData.naturalezacuentacontable,
      cuentaData.nombrecuentacontable.trim(),
      cuentaData.tipocuentacontable,
      cuentaData.usuarioauditoria,
      cuentaData.idnegocio
    ];
    
    const [result] = await pool.execute<ResultSetHeader>(insertQuery, insertValues);
    
    console.log('✅ Cuenta contable creada exitosamente con ID:', result.insertId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Cuenta contable creada exitosamente',
      data: { id: result.insertId }
    };
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Error creando cuenta contable:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al crear cuenta contable',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para actualizar una cuenta contable
export const updateCuentaContable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cuentaData: UpdateCuentaContableData = req.body;
    
    console.log('💰 Iniciando actualización de cuenta contable:', id);
    
    // Verificar que la cuenta contable existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_cuentacontable FROM tblposcrumenwebcuentacontable WHERE id_cuentacontable = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Cuenta contable no encontrada');
      res.status(404).json({
        success: false,
        message: 'Cuenta contable no encontrada'
      });
      return;
    }
    
    // Construir query dinámico basado en campos proporcionados
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (cuentaData.nombrecuentacontable !== undefined) {
      if (!cuentaData.nombrecuentacontable.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la cuenta contable no puede estar vacío'
        });
        return;
      }
      updateFields.push('nombrecuentacontable = ?');
      updateValues.push(cuentaData.nombrecuentacontable.trim());
    }
    
    if (cuentaData.naturalezacuentacontable !== undefined) {
      if (!cuentaData.naturalezacuentacontable.trim()) {
        res.status(400).json({
          success: false,
          message: 'La naturaleza de cuenta contable no puede estar vacía'
        });
        return;
      }

      // Validar que la naturaleza sea una de las opciones permitidas
      const naturalezasPermitidas: string[] = ['COMPRA', 'GASTO'];
      if (!naturalezasPermitidas.includes(cuentaData.naturalezacuentacontable.trim())) {
        res.status(400).json({
          success: false,
          message: 'La naturaleza de cuenta contable debe ser: COMPRA o GASTO'
        });
        return;
      }

      updateFields.push('naturalezacuentacontable = ?');
      updateValues.push(cuentaData.naturalezacuentacontable.trim());
    }
    
    if (cuentaData.tipocuentacontable !== undefined) {
      if (!cuentaData.tipocuentacontable.trim()) {
        res.status(400).json({
          success: false,
          message: 'El tipo de cuenta contable no puede estar vacío'
        });
        return;
      }

      // Para validación completa necesitamos la naturaleza actual o la nueva
      let naturalezaParaValidar = cuentaData.naturalezacuentacontable;
      if (!naturalezaParaValidar) {
        // Si no se está actualizando la naturaleza, obtener la actual
        const [currentRow] = await pool.execute<RowDataPacket[]>(
          'SELECT naturalezacuentacontable FROM tblposcrumenwebcuentacontable WHERE id_cuentacontable = ?',
          [id]
        );
        naturalezaParaValidar = currentRow[0]?.naturalezacuentacontable;
      }

      // Validar que el tipo de cuenta sea compatible con la naturaleza
      const tiposCompra = ['Inventario', 'Activo Fijo', 'Servicio', 'Administrativa', 'Eventual'];
      const tiposGasto = ['Operativo', 'Financiero', 'Eventual'];
      
      if (naturalezaParaValidar === 'COMPRA' && !tiposCompra.includes(cuentaData.tipocuentacontable.trim())) {
        res.status(400).json({
          success: false,
          message: 'Para COMPRA, el tipo debe ser: Inventario, Activo Fijo, Servicio, Administrativa o Eventual'
        });
        return;
      }

      if (naturalezaParaValidar === 'GASTO' && !tiposGasto.includes(cuentaData.tipocuentacontable.trim())) {
        res.status(400).json({
          success: false,
          message: 'Para GASTO, el tipo debe ser: Operativo, Financiero o Eventual'
        });
        return;
      }

      updateFields.push('tipocuentacontable = ?');
      updateValues.push(cuentaData.tipocuentacontable.trim());
    }
    
    if (cuentaData.usuarioauditoria !== undefined) {
      updateFields.push('usuarioauditoria = ?');
      updateValues.push(cuentaData.usuarioauditoria);
    }
    
    // Agregar fecha de modificación
    updateFields.push('fechamodificacionauditoria = NOW()');
    
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
      UPDATE tblposcrumenwebcuentacontable 
      SET ${updateFields.join(', ')}
      WHERE id_cuentacontable = ?
    `;
    
    await pool.execute(updateQuery, updateValues);
    
    console.log('✅ Cuenta contable actualizada exitosamente');
    
    const response: ApiResponse = {
      success: true,
      message: 'Cuenta contable actualizada exitosamente'
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error actualizando cuenta contable:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al actualizar cuenta contable',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para eliminar una cuenta contable
export const deleteCuentaContable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('💰 Iniciando eliminación de cuenta contable:', id);
    
    // Verificar que la cuenta contable existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_cuentacontable, nombrecuentacontable FROM tblposcrumenwebcuentacontable WHERE id_cuentacontable = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Cuenta contable no encontrada');
      res.status(404).json({
        success: false,
        message: 'Cuenta contable no encontrada'
      });
      return;
    }

    const cuenta = existingRows[0];
    console.log('🗑️ Eliminando cuenta contable:', cuenta.nombrecuentacontable);
    
    // Eliminar la cuenta contable
    await pool.execute(
      'DELETE FROM tblposcrumenwebcuentacontable WHERE id_cuentacontable = ?',
      [id]
    );
    
    console.log('✅ Cuenta contable eliminada exitosamente');
    
    const response: ApiResponse = {
      success: true,
      message: 'Cuenta contable eliminada exitosamente'
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error eliminando cuenta contable:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al eliminar cuenta contable',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};