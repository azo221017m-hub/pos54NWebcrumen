// backend/src/controllers/subRecetasController.ts
// Controlador para gestión de sub-recetas y detalles

import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interfaces para sub-recetas
interface SubReceta {
  idSubReceta?: number;
  nombreSubReceta: string;
  instruccionesSubr: string;
  archivoInstruccionesSubr?: string;
  costoSubReceta: number;
  estatusSubr: number;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  usuario: string;
  idNegocio: number;
}

interface DetalleSubReceta {
  idDetalleSubReceta?: number;
  dtlSubRecetaId: number;
  nombreInsumoSubr: string;
  umInsumoSubr: string;
  cantidadUsoSubr: number;
  costoInsumoSubr: number;
  estatus: number;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  usuario: string;
  idNegocio: number;
}

interface SubRecetaCompleta {
  subReceta: Omit<SubReceta, 'idSubReceta' | 'fechaRegistro' | 'fechaActualizacion'>;
  detalles: Omit<DetalleSubReceta, 'idDetalleSubReceta' | 'dtlSubRecetaId' | 'fechaRegistro' | 'fechaActualizacion'>[];
}

// Obtener todas las sub-recetas
export const obtenerSubRecetas = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Obteniendo sub-recetas...');

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        sr.*,
        COUNT(dsr.idDetalleSubReceta) as totalInsumos
      FROM tblposcrumenwebsubrecetas sr
      LEFT JOIN tblposcrumenwebdetallesubrecetas dsr ON sr.idSubReceta = dsr.dtlSubRecetaId
      WHERE sr.estatusSubr = 1
      GROUP BY sr.idSubReceta
      ORDER BY sr.fechaRegistro DESC
    `);

    res.json({
      success: true,
      message: 'Sub-recetas obtenidas exitosamente',
      data: rows
    });

    console.log('✅ Sub-recetas obtenidas:', rows.length);
  } catch (error) {
    console.error('❌ Error al obtener sub-recetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Obtener sub-receta por ID con detalles
export const obtenerSubRecetaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('🔍 Obteniendo sub-receta por ID:', id);

    // Obtener sub-receta
    const [subRecetaRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebsubrecetas WHERE idSubReceta = ?',
      [id]
    );

    if (subRecetaRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Sub-receta no encontrada'
      });
      return;
    }

    // Obtener detalles
    const [detallesRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebdetallesubrecetas WHERE dtlSubRecetaId = ? AND estatus = 1',
      [id]
    );

    res.json({
      success: true,
      message: 'Sub-receta obtenida exitosamente',
      data: {
        subReceta: subRecetaRows[0],
        detalles: detallesRows
      }
    });

    console.log('✅ Sub-receta obtenida con', detallesRows.length, 'detalles');
  } catch (error) {
    console.error('❌ Error al obtener sub-receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Crear nueva sub-receta
export const crearSubReceta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subReceta, detalles }: SubRecetaCompleta = req.body;
    console.log('💾 Creando nueva sub-receta:', subReceta.nombreSubReceta);

    // Validaciones
    if (!subReceta.nombreSubReceta?.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la sub-receta es obligatorio'
      });
      return;
    }

    if (!subReceta.instruccionesSubr?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Las instrucciones son obligatorias'
      });
      return;
    }

    if (!detalles || detalles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Debe agregar al menos un insumo'
      });
      return;
    }

    // Validar detalles
    const detallesValidos = detalles.filter(detalle => 
      detalle.nombreInsumoSubr?.trim() && 
      detalle.cantidadUsoSubr > 0 && 
      detalle.costoInsumoSubr > 0
    );

    if (detallesValidos.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Debe agregar al menos un insumo válido'
      });
      return;
    }

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insertar sub-receta
      const [subRecetaResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebsubrecetas 
         (nombreSubReceta, instruccionesSubr, archivoInstruccionesSubr, costoSubReceta, 
          estatusSubr, fechaRegistro, usuario, idNegocio) 
         VALUES (?, ?, ?, ?, 1, NOW(), ?, ?)`,
        [
          subReceta.nombreSubReceta.trim(),
          subReceta.instruccionesSubr.trim(),
          subReceta.archivoInstruccionesSubr?.trim() || null,
          subReceta.costoSubReceta,
          subReceta.usuario,
          subReceta.idNegocio
        ]
      );

      const idSubReceta = subRecetaResult.insertId;

      // Insertar detalles
      for (const detalle of detallesValidos) {
        await connection.execute(
          `INSERT INTO tblposcrumenwebdetallesubrecetas 
           (dtlSubRecetaId, nombreInsumoSubr, umInsumoSubr, cantidadUsoSubr, 
            costoInsumoSubr, estatus, fechaRegistro, usuario, idNegocio) 
           VALUES (?, ?, ?, ?, ?, 1, NOW(), ?, ?)`,
          [
            idSubReceta,
            detalle.nombreInsumoSubr.trim(),
            detalle.umInsumoSubr,
            detalle.cantidadUsoSubr,
            detalle.costoInsumoSubr,
            detalle.usuario,
            detalle.idNegocio
          ]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Sub-receta creada exitosamente',
        data: { idSubReceta }
      });

      console.log('✅ Sub-receta creada con ID:', idSubReceta);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error al crear sub-receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Actualizar sub-receta
export const actualizarSubReceta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subReceta, detalles }: SubRecetaCompleta = req.body;
    console.log('📝 Actualizando sub-receta ID:', id);

    // Validaciones
    if (!subReceta.nombreSubReceta?.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la sub-receta es obligatorio'
      });
      return;
    }

    // Validar detalles
    const detallesValidos = detalles?.filter(detalle => 
      detalle.nombreInsumoSubr?.trim() && 
      detalle.cantidadUsoSubr > 0 && 
      detalle.costoInsumoSubr > 0
    ) || [];

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Actualizar sub-receta
      await connection.execute(
        `UPDATE tblposcrumenwebsubrecetas 
         SET nombreSubReceta = ?, instruccionesSubr = ?, archivoInstruccionesSubr = ?, 
             costoSubReceta = ?, fechaActualizacion = NOW() 
         WHERE idSubReceta = ?`,
        [
          subReceta.nombreSubReceta.trim(),
          subReceta.instruccionesSubr?.trim() || '',
          subReceta.archivoInstruccionesSubr?.trim() || null,
          subReceta.costoSubReceta,
          id
        ]
      );

      // Eliminar detalles existentes
      await connection.execute(
        'UPDATE tblposcrumenwebdetallesubrecetas SET estatus = 0, fechaActualizacion = NOW() WHERE dtlSubRecetaId = ?',
        [id]
      );

      // Insertar nuevos detalles
      for (const detalle of detallesValidos) {
        await connection.execute(
          `INSERT INTO tblposcrumenwebdetallesubrecetas 
           (dtlSubRecetaId, nombreInsumoSubr, umInsumoSubr, cantidadUsoSubr, 
            costoInsumoSubr, estatus, fechaRegistro, usuario, idNegocio) 
           VALUES (?, ?, ?, ?, ?, 1, NOW(), ?, ?)`,
          [
            id,
            detalle.nombreInsumoSubr.trim(),
            detalle.umInsumoSubr,
            detalle.cantidadUsoSubr,
            detalle.costoInsumoSubr,
            detalle.usuario,
            detalle.idNegocio
          ]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Sub-receta actualizada exitosamente'
      });

      console.log('✅ Sub-receta actualizada exitosamente');
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error al actualizar sub-receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Eliminar sub-receta (soft delete)
export const eliminarSubReceta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { usuario } = req.body;
    console.log('🗑️ Eliminando sub-receta ID:', id);

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Eliminar sub-receta (soft delete)
      await connection.execute(
        'UPDATE tblposcrumenwebsubrecetas SET estatusSubr = 0, fechaActualizacion = NOW() WHERE idSubReceta = ?',
        [id]
      );

      // Eliminar detalles (soft delete)
      await connection.execute(
        'UPDATE tblposcrumenwebdetallesubrecetas SET estatus = 0, fechaActualizacion = NOW() WHERE dtlSubRecetaId = ?',
        [id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Sub-receta eliminada exitosamente'
      });

      console.log('✅ Sub-receta eliminada exitosamente');
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error al eliminar sub-receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Buscar insumos de tipo CONSUMO
export const buscarInsumosConsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filtro } = req.params;
    console.log('🔍 Buscando insumos de consumo con filtro:', filtro);

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT idInsumo, nomInsumo, umInsumo, costoPromPond, existencia
      FROM tblposcrumenwebinsumos 
      WHERE tipoInsumo = 'CONSUMO' 
        AND nomInsumo LIKE ? 
      ORDER BY nomInsumo ASC
      LIMIT 20
    `, [`%${filtro}%`]);

    res.json({
      success: true,
      message: 'Búsqueda completada',
      data: rows
    });

    console.log('✅ Insumos de consumo encontrados:', rows.length);
  } catch (error) {
    console.error('❌ Error al buscar insumos de consumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};