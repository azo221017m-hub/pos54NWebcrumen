// src/controllers/recetasController.ts
// Controlador para gestión de recetas y sus detalles

import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interfaz para Receta
interface Receta {
  idReceta?: number;
  nombreReceta: string;
  dtlRecetaId?: number;
  instrucciones: string;
  archivoInstrucciones?: string;
  costoReceta: number;
  estatus: number;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  usuario: string;
  idNegocio: number;
}

// Interfaz para Detalle de Receta
interface DetalleReceta {
  idDetalleReceta?: number;
  dtlRecetaId: number;
  nombreInsumo: string;
  umInsumo: string;
  cantidadUso: number;
  costoInsumo: number;
  estatus: number;
  fechaRegistro?: Date;
  fechaActualizacion?: Date;
  usuario: string;
  idNegocio: number;
}

// Interfaz para datos completos de receta
interface RecetaCompleta {
  receta: Omit<Receta, 'dtlRecetaId'>;
  detalles: Omit<DetalleReceta, 'dtlRecetaId' | 'idDetalleReceta'>[];
}

/**
 * Obtener todas las recetas
 */
export const obtenerRecetas = async (req: Request, res: Response): Promise<void> => {
  console.log('📋 Obteniendo todas las recetas');
  
  try {
    const query = `
      SELECT 
        r.idReceta,
        r.nombreReceta,
        r.dtlRecetaId,
        r.instrucciones,
        r.archivoInstrucciones,
        r.costoReceta,
        r.estatus,
        r.fechaRegistro,
        r.fechaActualizacion,
        r.usuario,
        r.idNegocio,
        COUNT(dr.idDetalleReceta) as totalInsumos
      FROM tblposcrumenwebrecetas r
      LEFT JOIN tblposcrumenwebdetallerecetas dr ON r.dtlRecetaId = dr.dtlRecetaId
      WHERE r.estatus = 1
      GROUP BY r.idReceta
      ORDER BY r.fechaRegistro DESC
    `;

    console.log('🔍 Ejecutando consulta SQL:', query);
    
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    
    console.log('✅ Consulta ejecutada exitosamente');
    console.log(`✅ ${rows.length} recetas encontradas`);
    
    res.status(200).json({
      success: true,
      data: rows,
      message: `${rows.length} recetas encontradas`
    });

  } catch (error) {
    console.error('❌ Error al obtener recetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener recetas',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * Obtener detalles de una receta específica
 */
export const obtenerDetallesReceta = async (req: Request, res: Response): Promise<void> => {
  console.log('📋 Obteniendo detalles de receta');
  
  try {
    const { idReceta } = req.params;
    
    if (!idReceta) {
      res.status(400).json({
        success: false,
        message: 'ID de receta es requerido'
      });
      return;
    }

    // Obtener información de la receta
    const recetaQuery = `
      SELECT * FROM tblposcrumenwebrecetas 
      WHERE idReceta = ? AND estatus = 1
    `;

    const [recetaRows] = await pool.execute<RowDataPacket[]>(recetaQuery, [idReceta]);
    
    if (recetaRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
      return;
    }

    const receta = recetaRows[0];

    // Obtener detalles de la receta
    const detallesQuery = `
      SELECT * FROM tblposcrumenwebdetallerecetas 
      WHERE dtlRecetaId = ? AND estatus = 1
      ORDER BY fechaRegistro ASC
    `;

    const [detallesRows] = await pool.execute<RowDataPacket[]>(detallesQuery, [receta.dtlRecetaId]);
    
    console.log('✅ Receta y detalles obtenidos exitosamente');
    
    res.status(200).json({
      success: true,
      data: {
        receta,
        detalles: detallesRows
      },
      message: 'Detalles de receta obtenidos exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener detalles de receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener detalles de receta',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * Crear nueva receta con sus detalles
 */
export const crearReceta = async (req: Request, res: Response): Promise<void> => {
  console.log('📝 Creando nueva receta');
  console.log('📊 Datos recibidos:', req.body);
  
  try {
    const { receta, detalles }: RecetaCompleta = req.body;
    
    // Validar datos principales
    if (!receta.nombreReceta || !receta.instrucciones || !receta.costoReceta) {
      res.status(400).json({
        success: false,
        message: 'Datos de receta incompletos. Se requiere: nombreReceta, instrucciones, costoReceta'
      });
      return;
    }

    // Validar que tenga al menos un insumo
    if (!detalles || detalles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'La receta debe tener al menos un insumo'
      });
      return;
    }

    // Validar máximo 40 insumos
    if (detalles.length > 40) {
      res.status(400).json({
        success: false,
        message: 'Máximo 40 insumos permitidos por receta'
      });
      return;
    }

    // Validar datos de detalles
    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i];
      if (!detalle.nombreInsumo || !detalle.umInsumo || !detalle.cantidadUso || !detalle.costoInsumo) {
        res.status(400).json({
          success: false,
          message: `Datos incompletos en insumo ${i + 1}. Se requiere: nombreInsumo, umInsumo, cantidadUso, costoInsumo`
        });
        return;
      }
    }

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insertar receta principal (sin dtlRecetaId inicialmente)
      const insertRecetaQuery = `
        INSERT INTO tblposcrumenwebrecetas 
        (nombreReceta, instrucciones, archivoInstrucciones, costoReceta, estatus, fechaRegistro, fechaActualizacion, usuario, idNegocio)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
      `;

      const recetaValues = [
        receta.nombreReceta,
        receta.instrucciones,
        receta.archivoInstrucciones || null,
        receta.costoReceta,
        receta.estatus || 1,
        receta.usuario,
        receta.idNegocio || 1
      ];

      console.log('🔍 Insertando receta:', insertRecetaQuery);
      console.log('📝 Valores:', recetaValues);

      const [recetaResult] = await connection.execute<ResultSetHeader>(insertRecetaQuery, recetaValues);
      const idReceta = recetaResult.insertId;

      console.log('✅ Receta insertada con ID:', idReceta);

      // 2. Usar el idReceta como dtlRecetaId
      const dtlRecetaId = idReceta;

      // 3. Actualizar la receta con el dtlRecetaId
      const updateRecetaQuery = `
        UPDATE tblposcrumenwebrecetas 
        SET dtlRecetaId = ?, fechaActualizacion = NOW()
        WHERE idReceta = ?
      `;

      await connection.execute(updateRecetaQuery, [dtlRecetaId, idReceta]);

      console.log('✅ Receta actualizada con dtlRecetaId:', dtlRecetaId);

      // 4. Insertar detalles de la receta
      const insertDetalleQuery = `
        INSERT INTO tblposcrumenwebdetallerecetas 
        (dtlRecetaId, nombreInsumo, umInsumo, cantidadUso, costoInsumo, estatus, fechaRegistro, fechaActualizacion, usuario, idNegocio)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
      `;

      for (let i = 0; i < detalles.length; i++) {
        const detalle = detalles[i];
        const detalleValues = [
          dtlRecetaId,
          detalle.nombreInsumo,
          detalle.umInsumo,
          detalle.cantidadUso,
          detalle.costoInsumo,
          detalle.estatus || 1,
          detalle.usuario,
          detalle.idNegocio || 1
        ];

        console.log(`🔍 Insertando detalle ${i + 1}:`, detalleValues);
        await connection.execute(insertDetalleQuery, detalleValues);
      }

      console.log(`✅ ${detalles.length} detalles insertados exitosamente`);

      // Confirmar transacción
      await connection.commit();
      connection.release();

      console.log('✅ Receta creada exitosamente');

      res.status(201).json({
        success: true,
        data: {
          idReceta,
          dtlRecetaId,
          nombreReceta: receta.nombreReceta,
          totalInsumos: detalles.length
        },
        message: 'Receta creada exitosamente'
      });

    } catch (transactionError) {
      // Revertir transacción en caso de error
      await connection.rollback();
      connection.release();
      throw transactionError;
    }

  } catch (error) {
    console.error('❌ Error al crear receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear receta',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * Actualizar receta existente
 */
export const actualizarReceta = async (req: Request, res: Response): Promise<void> => {
  console.log('📝 Actualizando receta');
  
  try {
    const { idReceta } = req.params;
    const { receta, detalles }: RecetaCompleta = req.body;
    
    if (!idReceta) {
      res.status(400).json({
        success: false,
        message: 'ID de receta es requerido'
      });
      return;
    }

    // Validar que la receta existe
    const checkQuery = 'SELECT dtlRecetaId FROM tblposcrumenwebrecetas WHERE idReceta = ? AND estatus = 1';
    const [checkRows] = await pool.execute<RowDataPacket[]>(checkQuery, [idReceta]);
    
    if (checkRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
      return;
    }

    const dtlRecetaId = checkRows[0].dtlRecetaId;

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Actualizar datos principales de la receta
      const updateRecetaQuery = `
        UPDATE tblposcrumenwebrecetas 
        SET nombreReceta = ?, instrucciones = ?, archivoInstrucciones = ?, 
            costoReceta = ?, fechaActualizacion = NOW(), usuario = ?
        WHERE idReceta = ?
      `;

      await connection.execute(updateRecetaQuery, [
        receta.nombreReceta,
        receta.instrucciones,
        receta.archivoInstrucciones || null,
        receta.costoReceta,
        receta.usuario,
        idReceta
      ]);

      // 2. Eliminar detalles existentes
      const deleteDetallesQuery = 'DELETE FROM tblposcrumenwebdetallerecetas WHERE dtlRecetaId = ?';
      await connection.execute(deleteDetallesQuery, [dtlRecetaId]);

      // 3. Insertar nuevos detalles
      const insertDetalleQuery = `
        INSERT INTO tblposcrumenwebdetallerecetas 
        (dtlRecetaId, nombreInsumo, umInsumo, cantidadUso, costoInsumo, estatus, fechaRegistro, fechaActualizacion, usuario, idNegocio)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
      `;

      for (const detalle of detalles) {
        await connection.execute(insertDetalleQuery, [
          dtlRecetaId,
          detalle.nombreInsumo,
          detalle.umInsumo,
          detalle.cantidadUso,
          detalle.costoInsumo,
          detalle.estatus || 1,
          detalle.usuario,
          detalle.idNegocio || 1
        ]);
      }

      await connection.commit();
      connection.release();

      console.log('✅ Receta actualizada exitosamente');

      res.status(200).json({
        success: true,
        message: 'Receta actualizada exitosamente'
      });

    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }

  } catch (error) {
    console.error('❌ Error al actualizar receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar receta',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * Eliminar receta (soft delete)
 */
export const eliminarReceta = async (req: Request, res: Response): Promise<void> => {
  console.log('🗑️ Eliminando receta');
  
  try {
    const { idReceta } = req.params;
    const { usuario } = req.body;
    
    if (!idReceta) {
      res.status(400).json({
        success: false,
        message: 'ID de receta es requerido'
      });
      return;
    }

    const query = `
      UPDATE tblposcrumenwebrecetas 
      SET estatus = 0, fechaActualizacion = NOW(), usuario = ?
      WHERE idReceta = ?
    `;

    console.log('🔍 Ejecutando eliminación:', query);
    console.log('📝 Valores:', [usuario, idReceta]);

    const [result] = await pool.execute<ResultSetHeader>(query, [usuario, idReceta]);
    
    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
      return;
    }

    console.log('✅ Receta eliminada exitosamente');

    res.status(200).json({
      success: true,
      message: 'Receta eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar receta',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};