import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Subreceta extends RowDataPacket {
  idSubReceta: number;
  nombreSubReceta: string;
  instruccionesSubr: Buffer | string;
  archivoInstruccionesSubr: string;
  costoSubReceta: number;
  estatusSubr: number;
  fechaRegistroauditoria: Date;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date;
  idnegocio: number;
}

interface DetalleSubreceta extends RowDataPacket {
  idDetalleSubReceta: number;
  dtlSubRecetaId: number;
  nombreInsumoSubr: string;
  umInsumoSubr: string;
  cantidadUsoSubr: number;
  costoInsumoSubr: number;
  estatus: number;
  fechaRegistroauditoria: Date;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date;
  idnegocio: number;
}

// Función auxiliar para calcular el costo total de una subreceta
const calcularCostoTotal = (detalles: any[]): number => {
  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return 0;
  }
  
  return detalles.reduce((total, detalle) => {
    const cantidad = parseFloat(detalle.cantidadUsoSubr) || 0;
    const costoUnitario = parseFloat(detalle.costoInsumoSubr) || 0;
    return total + (cantidad * costoUnitario);
  }, 0);
};

// Obtener todas las subrecetas por negocio
export const obtenerSubrecetas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;

    const [subrecetas] = await pool.query<Subreceta[]>(
      `SELECT 
        idSubReceta,
        nombreSubReceta,
        CAST(instruccionesSubr AS CHAR) as instruccionesSubr,
        archivoInstruccionesSubr,
        costoSubReceta,
        estatusSubr,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebsubrecetas 
      WHERE idnegocio = ?
      ORDER BY nombreSubReceta ASC`,
      [idnegocio]
    );

    // Obtener detalles para cada subreceta
    const subrecetasConDetalles = await Promise.all(
      subrecetas.map(async (subreceta) => {
        const [detalles] = await pool.query<DetalleSubreceta[]>(
          `SELECT * FROM tblposcrumenwebdetallesubrecetas 
           WHERE dtlSubRecetaId = ?
           ORDER BY nombreInsumoSubr ASC`,
          [subreceta.idSubReceta]
        );
        
        return {
          ...subreceta,
          detalles
        };
      })
    );

    res.status(200).json(subrecetasConDetalles);
  } catch (error) {
    console.error('Error al obtener subrecetas:', error);
    res.status(500).json({ mensaje: 'Error al obtener subrecetas', error });
  }
};

// Obtener una subreceta por ID con sus detalles
export const obtenerSubrecetaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [subrecetas] = await pool.query<Subreceta[]>(
      `SELECT 
        idSubReceta,
        nombreSubReceta,
        CAST(instruccionesSubr AS CHAR) as instruccionesSubr,
        archivoInstruccionesSubr,
        costoSubReceta,
        estatusSubr,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      FROM tblposcrumenwebsubrecetas 
      WHERE idSubReceta = ?`,
      [id]
    );

    if (subrecetas.length === 0) {
      res.status(404).json({ mensaje: 'Subreceta no encontrada' });
      return;
    }

    // Obtener detalles de la subreceta
    const [detalles] = await pool.query<DetalleSubreceta[]>(
      `SELECT * FROM tblposcrumenwebdetallesubrecetas 
       WHERE dtlSubRecetaId = ?
       ORDER BY nombreInsumoSubr ASC`,
      [id]
    );

    res.status(200).json({
      ...subrecetas[0],
      detalles
    });
  } catch (error) {
    console.error('Error al obtener subreceta:', error);
    res.status(500).json({ mensaje: 'Error al obtener subreceta', error });
  }
};

// Crear nueva subreceta con detalles
export const crearSubreceta = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const {
      nombreSubReceta,
      instruccionesSubr,
      archivoInstruccionesSubr,
      estatusSubr,
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
    const costoSubReceta = calcularCostoTotal(detalles);

    await connection.beginTransaction();

    // Insertar subreceta con el costo calculado
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebsubrecetas 
      (nombreSubReceta, instruccionesSubr, archivoInstruccionesSubr, costoSubReceta, 
       estatusSubr, fechaRegistroauditoria, usuarioauditoria, fehamodificacionauditoria, idnegocio)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
      [nombreSubReceta, instruccionesSubr, archivoInstruccionesSubr, costoSubReceta, 
       estatusSubr, usuarioauditoria, idnegocio]
    );

    const idSubReceta = result.insertId;

    // Insertar detalles si existen
    if (detalles && Array.isArray(detalles) && detalles.length > 0) {
      for (const detalle of detalles) {
        await connection.query(
          `INSERT INTO tblposcrumenwebdetallesubrecetas
          (dtlSubRecetaId, nombreInsumoSubr, umInsumoSubr, cantidadUsoSubr, 
           costoInsumoSubr, estatus, fechaRegistroauditoria, usuarioauditoria, 
           fehamodificacionauditoria, idnegocio)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
          [idSubReceta, detalle.nombreInsumoSubr, detalle.umInsumoSubr, 
           detalle.cantidadUsoSubr, detalle.costoInsumoSubr, detalle.estatus, 
           usuarioauditoria, idnegocio]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Subreceta creada exitosamente',
      idSubReceta
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear subreceta:', error);
    res.status(500).json({ mensaje: 'Error al crear subreceta', error });
  } finally {
    connection.release();
  }
};

// Actualizar subreceta con detalles
export const actualizarSubreceta = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const {
      nombreSubReceta,
      instruccionesSubr,
      archivoInstruccionesSubr,
      estatusSubr,
      usuarioauditoria,
      detalles
    } = req.body;

    // Calcular el costo total basado en los detalles
    const costoSubReceta = calcularCostoTotal(detalles);

    await connection.beginTransaction();

    // Actualizar subreceta con el costo calculado
    await connection.query(
      `UPDATE tblposcrumenwebsubrecetas 
      SET nombreSubReceta = ?, 
          instruccionesSubr = ?, 
          archivoInstruccionesSubr = ?,
          costoSubReceta = ?, 
          estatusSubr = ?,
          usuarioauditoria = ?, 
          fehamodificacionauditoria = NOW()
      WHERE idSubReceta = ?`,
      [nombreSubReceta, instruccionesSubr, archivoInstruccionesSubr, 
       costoSubReceta, estatusSubr, usuarioauditoria, id]
    );

    // Eliminar detalles existentes
    await connection.query(
      'DELETE FROM tblposcrumenwebdetallesubrecetas WHERE dtlSubRecetaId = ?',
      [id]
    );

    // Insertar nuevos detalles
    if (detalles && Array.isArray(detalles) && detalles.length > 0) {
      const idnegocio = req.body.idnegocio;
      
      for (const detalle of detalles) {
        await connection.query(
          `INSERT INTO tblposcrumenwebdetallesubrecetas
          (dtlSubRecetaId, nombreInsumoSubr, umInsumoSubr, cantidadUsoSubr, 
           costoInsumoSubr, estatus, fechaRegistroauditoria, usuarioauditoria, 
           fehamodificacionauditoria, idnegocio)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
          [id, detalle.nombreInsumoSubr, detalle.umInsumoSubr, 
           detalle.cantidadUsoSubr, detalle.costoInsumoSubr, detalle.estatus, 
           usuarioauditoria, idnegocio]
        );
      }
    }

    await connection.commit();

    res.status(200).json({ mensaje: 'Subreceta actualizada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar subreceta:', error);
    res.status(500).json({ mensaje: 'Error al actualizar subreceta', error });
  } finally {
    connection.release();
  }
};

// Eliminar subreceta y sus detalles
export const eliminarSubreceta = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Eliminar detalles primero (FK constraint)
    await connection.query(
      'DELETE FROM tblposcrumenwebdetallesubrecetas WHERE dtlSubRecetaId = ?',
      [id]
    );

    // Eliminar subreceta
    await connection.query(
      'DELETE FROM tblposcrumenwebsubrecetas WHERE idSubReceta = ?',
      [id]
    );

    await connection.commit();

    res.status(200).json({ mensaje: 'Subreceta eliminada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar subreceta:', error);
    res.status(500).json({ mensaje: 'Error al eliminar subreceta', error });
  } finally {
    connection.release();
  }
};
