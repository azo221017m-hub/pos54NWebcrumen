// Eliminar (soft delete) un moderador
export async function deleteModerador(req: Request, res: Response) {
  const { id } = req.params;
  console.log('🔄 [DELETE] Intentando eliminar moderador id:', id);
  if (!id) {
    return res.status(400).json({ success: false, message: 'Falta el id del moderador' });
  }
  try {
    // Soft delete: actualizar estatus a 0
    const result = await pool.execute(
      'UPDATE tblposcrumenwebmoderadores SET estatus = 0 WHERE idmoderador = ?',
      [id]
    );
    const affectedRows = (result[0] as ResultSetHeader).affectedRows;
    console.log('🔍 [DELETE] affectedRows:', affectedRows);
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Moderador no encontrado', id });
    }
    res.json({ success: true, message: 'Moderador eliminado correctamente', id });
  } catch (error) {
    console.error('❌ [DELETE] Error al eliminar moderador:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar moderador', error: String(error), id });
  }
}
import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { ResultSetHeader } from 'mysql2';

export async function getCategoriasModerador(_req: Request, res: Response) {
  console.log('📡 [moderadoresController] Endpoint /api/moderadores/categorias was called');
  try {
    console.log('🔍 Ejecutando consulta SQL: SELECT * FROM tblposcrumenwebmodref');
    const categorias = await executeQuery('SELECT * FROM tblposcrumenwebmodref', []);
    console.log('✅ Categorías obtenidas exitosamente');
    res.status(200).json({ success: true, data: categorias });
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
}

export async function createCategoriaModerador(req: Request, res: Response) {
  try {
    const { nombremodref } = req.body;
    if (!nombremodref) {
      res.status(400).json({ success: false, message: 'El nombre de la categoría es obligatorio' });
      return;
    }
    console.log('🔍 Ejecutando consulta SQL: INSERT INTO tblposcrumenwebmodref (nombremodref) VALUES (?)');
    const result = await executeQuery('INSERT INTO tblposcrumenwebmodref (nombremodref) VALUES (?)', [nombremodref]);
    console.log('✅ Categoría creada exitosamente');
    res.status(201).json({ success: true, data: { id: result.insertId, nombremodref } });
  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    res.status(500).json({ success: false, message: 'Error al crear categoría' });
  }
}

export async function updateCategoriaModerador(_req: Request, res: Response) {
  res.status(410).json({ success: false, message: 'Endpoint removed' });
}

export async function getModeradores(_req: Request, res: Response) {
  try {
    console.log('🔍 Ejecutando consulta SQL: SELECT * FROM tblposcrumenwebmoderadores');
    const moderadores = await executeQuery('SELECT * FROM tblposcrumenwebmoderadores', []);
    console.log('✅ Consulta ejecutada exitosamente');
    res.status(200).json({ success: true, data: moderadores });
  } catch (error) {
    console.error('❌ Error al obtener moderadores:', error);
    res.status(500).json({ success: false, message: 'Error al obtener moderadores' });
  }
}

export async function createModerador(req: Request, res: Response) {
  try {
    const idNegocioDefault = 1; // Default value for idNegocio
    const usuarioAuditoriaDefault = 'crumen'; // Default value for usuarioAuditoria

    const idnegocioFinal = req.body.idnegocio || idNegocioDefault;
    const usuarioauditoriaFinal = req.body.usuarioauditoria || usuarioAuditoriaDefault;

    const { nombremoderador: nombremoderadorInput } = req.body;
    const nombremoderadorFinal = nombremoderadorInput || 'Moderador por defecto'; // Default value for nombremoderador

    console.log('📥 Datos recibidos en el backend:', req.body);
    console.log('idnegocioFinal:', idnegocioFinal);
    console.log('usuarioauditoriaFinal:', usuarioauditoriaFinal);
    console.log('nombremoderadorFinal:', nombremoderadorFinal);

    console.log('🔍 Ejecutando consulta SQL: INSERT INTO tblposcrumenwebmoderadores (nombremoderador, idnegocio, usuarioauditoria) VALUES (?, ?, ?)');
    const result = await executeQuery(
      'INSERT INTO tblposcrumenwebmoderadores (nombremoderador, idnegocio, usuarioauditoria) VALUES (?, ?, ?)',
      [nombremoderadorFinal, idnegocioFinal, usuarioauditoriaFinal]
    );
    console.log('✅ Moderador creado exitosamente');
    res.status(201).json({ success: true, data: { id: result.insertId, nombremoderadorFinal, idnegocioFinal, usuarioauditoriaFinal } });
  } catch (error) {
    console.error('❌ Error al crear moderador:', error);
    res.status(500).json({ success: false, message: 'Error al crear moderador' });
  }
}

export async function updateModerador(req: Request, res: Response) {
  const { id } = req.params;
  const { nombremoderador, idnegocio, usuarioauditoria } = req.body;

  if (!id || !nombremoderador || !idnegocio || !usuarioauditoria) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos para actualizar el moderador.',
    });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE tblposcrumenwebmoderadores SET nombremoderador = ?, idnegocio = ?, usuarioauditoria = ?, fehamodificacionauditoria = NOW() WHERE idmoderador = ?',
      [nombremoderador, idnegocio, usuarioauditoria, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Moderador no encontrado.',
      });
    }

    res.json({
      success: true,
      message: 'Moderador actualizado correctamente.',
    });
  } catch (error) {
    console.error('❌ Error al actualizar el moderador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
}
