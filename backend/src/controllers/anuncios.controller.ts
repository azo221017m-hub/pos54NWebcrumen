import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Anuncio extends RowDataPacket {
  idAnuncio: number;
  tituloDeAnuncio: string;
  detalleAnuncio: string;
  imagen1Anuncio: Buffer | string | null;
  imagen2Anuncio: Buffer | string | null;
  imagen3Anuncio: Buffer | string | null;
  imagen4Anuncio: Buffer | string | null;
  imagen5Anuncio: Buffer | string | null;
  fechaDeVigencia: Date | string | null;
}

// Obtener todos los anuncios
export const obtenerAnuncios = async (_req: Request, res: Response): Promise<void> => {
  try {
    // NOTA: pool.query() se usa en lugar de pool.execute() para evitar
    // problemas con columnas LONGBLOB y el protocolo binario de mysql2
    const [rows] = await pool.query<Anuncio[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        TO_BASE64(imagen1Anuncio) AS imagen1Anuncio,
        TO_BASE64(imagen2Anuncio) AS imagen2Anuncio,
        TO_BASE64(imagen3Anuncio) AS imagen3Anuncio,
        TO_BASE64(imagen4Anuncio) AS imagen4Anuncio,
        TO_BASE64(imagen5Anuncio) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia
      FROM tblposcrumenwebanuncios
      ORDER BY idAnuncio DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    res.status(500).json({
      mensaje: 'Error al obtener anuncios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener un anuncio por ID
export const obtenerAnuncioPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<Anuncio[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        TO_BASE64(imagen1Anuncio) AS imagen1Anuncio,
        TO_BASE64(imagen2Anuncio) AS imagen2Anuncio,
        TO_BASE64(imagen3Anuncio) AS imagen3Anuncio,
        TO_BASE64(imagen4Anuncio) AS imagen4Anuncio,
        TO_BASE64(imagen5Anuncio) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia
      FROM tblposcrumenwebanuncios
      WHERE idAnuncio = ?`,
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ mensaje: 'Anuncio no encontrado' });
      return;
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    res.status(500).json({
      mensaje: 'Error al obtener anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Helper para convertir base64 a Buffer (o null si no viene)
const base64ToBuffer = (b64: string | null | undefined): Buffer | null => {
  if (!b64) return null;
  return Buffer.from(b64, 'base64');
};

// Crear un nuevo anuncio
export const crearAnuncio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      tituloDeAnuncio,
      detalleAnuncio,
      imagen1Anuncio,
      imagen2Anuncio,
      imagen3Anuncio,
      imagen4Anuncio,
      imagen5Anuncio,
      fechaDeVigencia
    } = req.body;

    if (!tituloDeAnuncio) {
      res.status(400).json({ success: false, mensaje: 'El título del anuncio es requerido' });
      return;
    }

    const img1 = base64ToBuffer(imagen1Anuncio);
    const img2 = base64ToBuffer(imagen2Anuncio);
    const img3 = base64ToBuffer(imagen3Anuncio);
    const img4 = base64ToBuffer(imagen4Anuncio);
    const img5 = base64ToBuffer(imagen5Anuncio);

    // NOTA: pool.query() para LONGBLOB
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebanuncios
        (tituloDeAnuncio, detalleAnuncio, imagen1Anuncio, imagen2Anuncio, imagen3Anuncio, imagen4Anuncio, imagen5Anuncio, fechaDeVigencia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tituloDeAnuncio,
        detalleAnuncio || null,
        img1,
        img2,
        img3,
        img4,
        img5,
        fechaDeVigencia || null
      ]
    );

    const [newRows] = await pool.query<Anuncio[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        TO_BASE64(imagen1Anuncio) AS imagen1Anuncio,
        TO_BASE64(imagen2Anuncio) AS imagen2Anuncio,
        TO_BASE64(imagen3Anuncio) AS imagen3Anuncio,
        TO_BASE64(imagen4Anuncio) AS imagen4Anuncio,
        TO_BASE64(imagen5Anuncio) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia
      FROM tblposcrumenwebanuncios
      WHERE idAnuncio = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      mensaje: 'Anuncio creado exitosamente',
      data: newRows[0]
    });
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar un anuncio
export const actualizarAnuncio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      tituloDeAnuncio,
      detalleAnuncio,
      imagen1Anuncio,
      imagen2Anuncio,
      imagen3Anuncio,
      imagen4Anuncio,
      imagen5Anuncio,
      fechaDeVigencia
    } = req.body;

    if (!tituloDeAnuncio) {
      res.status(400).json({ success: false, mensaje: 'El título del anuncio es requerido' });
      return;
    }

    // Verificar que exista
    const [exist] = await pool.query<RowDataPacket[]>(
      'SELECT idAnuncio FROM tblposcrumenwebanuncios WHERE idAnuncio = ?',
      [id]
    );
    if (exist.length === 0) {
      res.status(404).json({ success: false, mensaje: 'Anuncio no encontrado' });
      return;
    }

    // Construir query dinámicamente según si se envían imágenes
    let updateFields = `tituloDeAnuncio = ?, detalleAnuncio = ?, fechaDeVigencia = ?`;
    const params: (string | Buffer | null | number)[] = [
      tituloDeAnuncio,
      detalleAnuncio || null,
      fechaDeVigencia || null
    ];

    const imageFields = [
      { name: 'imagen1Anuncio', value: imagen1Anuncio },
      { name: 'imagen2Anuncio', value: imagen2Anuncio },
      { name: 'imagen3Anuncio', value: imagen3Anuncio },
      { name: 'imagen4Anuncio', value: imagen4Anuncio },
      { name: 'imagen5Anuncio', value: imagen5Anuncio }
    ];

    for (const field of imageFields) {
      if (field.value !== undefined) {
        updateFields += `, ${field.name} = ?`;
        params.push(base64ToBuffer(field.value));
      }
    }

    params.push(Number(id));

    // NOTA: pool.query() para LONGBLOB
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebanuncios SET ${updateFields} WHERE idAnuncio = ?`,
      params
    );

    if (result.affectedRows === 0) {
      res.status(500).json({ success: false, mensaje: 'No se pudo actualizar el anuncio' });
      return;
    }

    const [updatedRows] = await pool.query<Anuncio[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        TO_BASE64(imagen1Anuncio) AS imagen1Anuncio,
        TO_BASE64(imagen2Anuncio) AS imagen2Anuncio,
        TO_BASE64(imagen3Anuncio) AS imagen3Anuncio,
        TO_BASE64(imagen4Anuncio) AS imagen4Anuncio,
        TO_BASE64(imagen5Anuncio) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia
      FROM tblposcrumenwebanuncios
      WHERE idAnuncio = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      mensaje: 'Anuncio actualizado exitosamente',
      data: updatedRows[0]
    });
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar un anuncio
export const eliminarAnuncio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebanuncios WHERE idAnuncio = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ mensaje: 'Anuncio no encontrado' });
      return;
    }
    res.status(200).json({ success: true, mensaje: 'Anuncio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    res.status(500).json({
      mensaje: 'Error al eliminar anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
