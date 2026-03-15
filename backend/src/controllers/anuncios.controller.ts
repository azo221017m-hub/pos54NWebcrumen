import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import type { Anuncio, AnuncioCreate, AnuncioUpdate } from '../types/anuncios.types';

// GET /api/anuncios/publico - Obtener anuncios vigentes (sin autenticación)
export async function obtenerAnunciosPublico(_req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await pool.execute<(Anuncio & RowDataPacket)[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        CAST(imagen1Anuncio AS CHAR) AS imagen1Anuncio,
        CAST(imagen2Anuncio AS CHAR) AS imagen2Anuncio,
        CAST(imagen3Anuncio AS CHAR) AS imagen3Anuncio,
        CAST(imagen4Anuncio AS CHAR) AS imagen4Anuncio,
        CAST(imagen5Anuncio AS CHAR) AS imagen5Anuncio
      FROM tblposcrumenwebanuncios
      WHERE (fechaDeVigencia IS NULL OR fechaDeVigencia >= CURDATE())
      ORDER BY idAnuncio DESC`
    );

    res.json({
      success: true,
      data: rows,
      message: 'Anuncios públicos obtenidos correctamente'
    });
  } catch (error) {
    console.error('Error al obtener anuncios públicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener anuncios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// GET /api/anuncios - Obtener todos los anuncios
export async function obtenerAnuncios(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const [rows] = await pool.execute<(Anuncio & RowDataPacket)[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        CAST(imagen1Anuncio AS CHAR) AS imagen1Anuncio,
        CAST(imagen2Anuncio AS CHAR) AS imagen2Anuncio,
        CAST(imagen3Anuncio AS CHAR) AS imagen3Anuncio,
        CAST(imagen4Anuncio AS CHAR) AS imagen4Anuncio,
        CAST(imagen5Anuncio AS CHAR) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia,
        usuarioauditoria,
        fechamodificacionauditoria
      FROM tblposcrumenwebanuncios
      ORDER BY idAnuncio DESC`
    );

    res.json({
      success: true,
      data: rows,
      message: 'Anuncios obtenidos correctamente'
    });
  } catch (error) {
    const mysqlCode = (error as any)?.code;
    // If the table does not exist yet, return an empty list instead of a 500 error
    if (mysqlCode === 'ER_NO_SUCH_TABLE') {
      console.warn('Tabla tblposcrumenwebanuncios no encontrada. Retornando lista vacía.');
      res.json({
        success: true,
        data: [],
        message: 'No hay anuncios registrados'
      });
      return;
    }
    console.error('Error al obtener anuncios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener anuncios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// GET /api/anuncios/:id - Obtener un anuncio por ID
export async function obtenerAnuncioPorId(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute<(Anuncio & RowDataPacket)[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        CAST(imagen1Anuncio AS CHAR) AS imagen1Anuncio,
        CAST(imagen2Anuncio AS CHAR) AS imagen2Anuncio,
        CAST(imagen3Anuncio AS CHAR) AS imagen3Anuncio,
        CAST(imagen4Anuncio AS CHAR) AS imagen4Anuncio,
        CAST(imagen5Anuncio AS CHAR) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia,
        usuarioauditoria,
        fechamodificacionauditoria
      FROM tblposcrumenwebanuncios
      WHERE idAnuncio = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Anuncio no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: rows[0],
      message: 'Anuncio obtenido correctamente'
    });
  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// POST /api/anuncios - Crear un nuevo anuncio
export async function crearAnuncio(req: AuthRequest, res: Response): Promise<void> {
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
    } = req.body as AnuncioCreate;

    const usuarioauditoria = req.user?.alias;

    if (!usuarioauditoria) {
      res.status(400).json({
        success: false,
        message: 'Información de usuario no encontrada'
      });
      return;
    }

    if (!tituloDeAnuncio || tituloDeAnuncio.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'El título del anuncio es requerido'
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebanuncios (
        tituloDeAnuncio,
        detalleAnuncio,
        imagen1Anuncio,
        imagen2Anuncio,
        imagen3Anuncio,
        imagen4Anuncio,
        imagen5Anuncio,
        fechaDeVigencia,
        usuarioauditoria,
        fechamodificacionauditoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        tituloDeAnuncio.trim(),
        detalleAnuncio || null,
        imagen1Anuncio || null,
        imagen2Anuncio || null,
        imagen3Anuncio || null,
        imagen4Anuncio || null,
        imagen5Anuncio || null,
        fechaDeVigencia || null,
        usuarioauditoria
      ]
    );

    const [anuncioCreado] = await pool.execute<(Anuncio & RowDataPacket)[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        CAST(imagen1Anuncio AS CHAR) AS imagen1Anuncio,
        CAST(imagen2Anuncio AS CHAR) AS imagen2Anuncio,
        CAST(imagen3Anuncio AS CHAR) AS imagen3Anuncio,
        CAST(imagen4Anuncio AS CHAR) AS imagen4Anuncio,
        CAST(imagen5Anuncio AS CHAR) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia,
        usuarioauditoria,
        fechamodificacionauditoria
      FROM tblposcrumenwebanuncios
      WHERE idAnuncio = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: anuncioCreado[0],
      message: 'Anuncio creado correctamente'
    });
  } catch (error) {
    const mysqlCode = (error as any)?.code;
    const IMAGE_FIELD_PREFIX = 'imagen';
    console.error('Error al crear anuncio:', error);
    console.error('  → Código MySQL:', mysqlCode || 'N/A');
    console.error('  → Usuario auditoria:', req.user?.alias || 'no disponible');
    console.error('  → Campos recibidos:', Object.keys(req.body || {}).filter(k => !k.startsWith(IMAGE_FIELD_PREFIX)).join(', ') || 'ninguno');
    res.status(500).json({
      success: false,
      message: 'Error al crear anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// PUT /api/anuncios/:id - Actualizar un anuncio
export async function actualizarAnuncio(req: AuthRequest, res: Response): Promise<void> {
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
    } = req.body as AnuncioUpdate;

    const usuarioauditoria = req.user?.alias;

    if (!usuarioauditoria) {
      res.status(400).json({
        success: false,
        message: 'Información de usuario no encontrada'
      });
      return;
    }

    const [anuncioRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idAnuncio FROM tblposcrumenwebanuncios WHERE idAnuncio = ?',
      [id]
    );

    if (anuncioRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Anuncio no encontrado'
      });
      return;
    }

    if (!tituloDeAnuncio || tituloDeAnuncio.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'El título del anuncio es requerido'
      });
      return;
    }

    await pool.execute(
      `UPDATE tblposcrumenwebanuncios SET
        tituloDeAnuncio = ?,
        detalleAnuncio = ?,
        imagen1Anuncio = ?,
        imagen2Anuncio = ?,
        imagen3Anuncio = ?,
        imagen4Anuncio = ?,
        imagen5Anuncio = ?,
        fechaDeVigencia = ?,
        usuarioauditoria = ?,
        fechamodificacionauditoria = NOW()
      WHERE idAnuncio = ?`,
      [
        tituloDeAnuncio.trim(),
        detalleAnuncio || null,
        imagen1Anuncio || null,
        imagen2Anuncio || null,
        imagen3Anuncio || null,
        imagen4Anuncio || null,
        imagen5Anuncio || null,
        fechaDeVigencia || null,
        usuarioauditoria,
        id
      ]
    );

    const [anuncioActualizado] = await pool.execute<(Anuncio & RowDataPacket)[]>(
      `SELECT
        idAnuncio,
        tituloDeAnuncio,
        detalleAnuncio,
        CAST(imagen1Anuncio AS CHAR) AS imagen1Anuncio,
        CAST(imagen2Anuncio AS CHAR) AS imagen2Anuncio,
        CAST(imagen3Anuncio AS CHAR) AS imagen3Anuncio,
        CAST(imagen4Anuncio AS CHAR) AS imagen4Anuncio,
        CAST(imagen5Anuncio AS CHAR) AS imagen5Anuncio,
        DATE_FORMAT(fechaDeVigencia, '%Y-%m-%d') AS fechaDeVigencia,
        usuarioauditoria,
        fechamodificacionauditoria
      FROM tblposcrumenwebanuncios
      WHERE idAnuncio = ?`,
      [id]
    );

    res.json({
      success: true,
      data: anuncioActualizado[0],
      message: 'Anuncio actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// DELETE /api/anuncios/:id - Eliminar un anuncio
export async function eliminarAnuncio(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const [anuncioRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idAnuncio FROM tblposcrumenwebanuncios WHERE idAnuncio = ?',
      [id]
    );

    if (anuncioRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Anuncio no encontrado'
      });
      return;
    }

    await pool.execute(
      'DELETE FROM tblposcrumenwebanuncios WHERE idAnuncio = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Anuncio eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar anuncio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
