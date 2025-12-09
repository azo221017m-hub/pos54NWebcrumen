import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Receta extends RowDataPacket {
  idReceta: number;
  nombreReceta: string;
  instrucciones: Buffer | string;
  archivoInstrucciones: string;
  costoReceta: number;
  estatus: number;
  fechaRegistroauditoria: Date;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date;
  idnegocio: number;
}

interface DetalleReceta extends RowDataPacket {
  idDetalleReceta: number;
  dtlRecetaId: number;
  umInsumo: string;
  cantidadUso: number;
  costoInsumo: number;
  estatus: number;
  idreferencia: string;
  fechaRegistroauditoria: Date;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date;
  idnegocio: number;
}

// Función auxiliar para calcular el costo total de una receta
const calcularCostoTotal = (detalles: any[]): number => {
  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return 0;
  }
  
  return detalles.reduce((total, detalle) => {
    const cantidad = parseFloat(detalle.cantidadUso) || 0;
    const costoUnitario = parseFloat(detalle.costoInsumo) || 0;
    return total + (cantidad * costoUnitario);
  }, 0);
};

// Obtener todas las recetas por negocio
export const obtenerRecetas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;

    const [recetas] = await pool.query<Receta[]>(
      `SELECT 
        idReceta,
        nombreReceta,
        CAST(instrucciones AS CHAR) as instrucciones,
        CAST(archivoInstrucciones AS CHAR) as archivoInstrucciones,
        costoReceta,
        estatus,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebrecetas 
      WHERE idnegocio = ?
      ORDER BY nombreReceta ASC`,
      [idnegocio]
    );

    // Obtener detalles para cada receta
    const recetasConDetalles = await Promise.all(
      recetas.map(async (receta) => {
        const [detalles] = await pool.query<DetalleReceta[]>(
          `SELECT 
            idDetalleReceta,
            dtlRecetaId,
            nombreinsumo,
            umInsumo,
            cantidadUso,
            costoInsumo,
            estatus,
            idreferencia,
            fechaRegistroauditoria,
            usuarioauditoria,
            fehamodificacionauditoria,
            idnegocio
           FROM tblposcrumenwebdetallerecetas 
           WHERE dtlRecetaId = ?
           ORDER BY idreferencia ASC`,
          [receta.idReceta]
        );
        
        return {
          ...receta,
          detalles
        };
      })
    );

    res.status(200).json(recetasConDetalles);
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    res.status(500).json({ mensaje: 'Error al obtener recetas', error });
  }
};

// Obtener una receta por ID con sus detalles
export const obtenerRecetaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [recetas] = await pool.query<Receta[]>(
      `SELECT 
        idReceta,
        nombreReceta,
        CAST(instrucciones AS CHAR) as instrucciones,
        CAST(archivoInstrucciones AS CHAR) as archivoInstrucciones,
        costoReceta,
        estatus,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebrecetas 
      WHERE idReceta = ?`,
      [id]
    );

    if (recetas.length === 0) {
      res.status(404).json({ mensaje: 'Receta no encontrada' });
      return;
    }

    // Obtener detalles de la receta
    const [detalles] = await pool.query<DetalleReceta[]>(
      `SELECT 
        idDetalleReceta,
        dtlRecetaId,
        nombreinsumo,
        umInsumo,
        cantidadUso,
        costoInsumo,
        estatus,
        idreferencia,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
       FROM tblposcrumenwebdetallerecetas 
       WHERE dtlRecetaId = ?
       ORDER BY idreferencia ASC`,
      [id]
    );

    res.status(200).json({
      ...recetas[0],
      detalles
    });
  } catch (error) {
    console.error('Error al obtener receta:', error);
    res.status(500).json({ mensaje: 'Error al obtener receta', error });
  }
};

// Crear nueva receta con detalles
export const crearReceta = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const {
      nombreReceta,
      instrucciones,
      archivoInstrucciones,
      estatus,
      usuarioauditoria,
      detalles
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({ mensaje: 'Usuario no autenticado' });
      return;
    }

    // Calcular el costo total basado en los detalles
    const costoReceta = calcularCostoTotal(detalles);

    await connection.beginTransaction();

    // Insertar receta con el costo calculado
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebrecetas 
      (nombreReceta, instrucciones, archivoInstrucciones, costoReceta, 
       estatus, fechaRegistroauditoria, usuarioauditoria, fehamodificacionauditoria, idnegocio)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
      [nombreReceta, instrucciones, archivoInstrucciones, costoReceta, 
       estatus, usuarioauditoria, idnegocio]
    );

    const idReceta = result.insertId;

    // Insertar detalles si existen
    if (detalles && Array.isArray(detalles) && detalles.length > 0) {
      for (const detalle of detalles) {
        await connection.query(
          `INSERT INTO tblposcrumenwebdetallerecetas
          (dtlRecetaId, nombreinsumo, umInsumo, cantidadUso, costoInsumo, estatus, 
           idreferencia, fechaRegistroauditoria, usuarioauditoria, 
           fehamodificacionauditoria, idnegocio)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
          [idReceta, detalle.nombreinsumo || '', detalle.umInsumo, detalle.cantidadUso, 
           detalle.costoInsumo, detalle.estatus, detalle.idreferencia,
           usuarioauditoria, idnegocio]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Receta creada exitosamente',
      idReceta
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear receta:', error);
    res.status(500).json({ mensaje: 'Error al crear receta', error });
  } finally {
    connection.release();
  }
};

// Actualizar receta con detalles
export const actualizarReceta = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const {
      nombreReceta,
      instrucciones,
      archivoInstrucciones,
      estatus,
      usuarioauditoria,
      detalles
    } = req.body;

    // Calcular el costo total basado en los detalles
    const costoReceta = calcularCostoTotal(detalles);

    await connection.beginTransaction();

    // Actualizar receta con el costo calculado
    await connection.query(
      `UPDATE tblposcrumenwebrecetas 
      SET nombreReceta = ?, 
          instrucciones = ?, 
          archivoInstrucciones = ?,
          costoReceta = ?, 
          estatus = ?,
          usuarioauditoria = ?, 
          fehamodificacionauditoria = NOW()
      WHERE idReceta = ?`,
      [nombreReceta, instrucciones, archivoInstrucciones, 
       costoReceta, estatus, usuarioauditoria, id]
    );

    // Eliminar detalles existentes
    await connection.query(
      'DELETE FROM tblposcrumenwebdetallerecetas WHERE dtlRecetaId = ?',
      [id]
    );

    // Insertar nuevos detalles
    if (detalles && Array.isArray(detalles) && detalles.length > 0) {
      const idnegocio = req.body.idnegocio;
      
      for (const detalle of detalles) {
        await connection.query(
          `INSERT INTO tblposcrumenwebdetallerecetas
          (dtlRecetaId, nombreinsumo, umInsumo, cantidadUso, costoInsumo, estatus, 
           idreferencia, fechaRegistroauditoria, usuarioauditoria, 
           fehamodificacionauditoria, idnegocio)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
          [id, detalle.nombreinsumo || '', detalle.umInsumo, detalle.cantidadUso, 
           detalle.costoInsumo, detalle.estatus, detalle.idreferencia,
           usuarioauditoria, idnegocio]
        );
      }
    }

    await connection.commit();

    res.status(200).json({ mensaje: 'Receta actualizada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar receta:', error);
    res.status(500).json({ mensaje: 'Error al actualizar receta', error });
  } finally {
    connection.release();
  }
};

// Eliminar receta (soft delete)
export const eliminarReceta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE tblposcrumenwebrecetas SET estatus = 0 WHERE idReceta = ?',
      [id]
    );

    res.status(200).json({ mensaje: 'Receta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar receta:', error);
    res.status(500).json({ mensaje: 'Error al eliminar receta', error });
  }
};
