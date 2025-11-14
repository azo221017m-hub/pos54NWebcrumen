// Soft delete: actualizar estatus a 0
export const deleteCategoriaModerador = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID requerido' });
  }
  try {
    await pool.execute(
      'UPDATE tblposcrumenwebmodref SET estatus = 0 WHERE idmodref = ?',
      [id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error });
  }
};
// Editar una categoría de moderador
// ...existing code...
export const updateCategoriaModerador = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombremodref } = req.body;
  if (!nombremodref || !id) {
    return res.status(400).json({ message: 'Nombre y ID requeridos' });
  }
  try {
    await pool.execute(
      'UPDATE tblposcrumenwebmodref SET nombremodref = ? WHERE idmodref = ?',
      [nombremodref, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría', error });
  }
};
import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthenticatedRequest } from '../types'; // Import the extended Request type

// Obtener solo categorías activas (estatus=1)
export const getCategoriasModeradores = async (req: Request, res: Response) => {
  console.log('📡 [GET] /api/categorias-moderadores - Obteniendo categorías de moderadores');
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebmodref WHERE estatus = 1 ORDER BY idmodref ASC'
    );
    console.log('✅ Categorías obtenidas:', rows);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// Crear una nueva categoría de moderador
export const createCategoriaModerador = async (req: AuthenticatedRequest, res: Response) => {
  console.log('📡 [POST] /api/categorias-moderadores - Creando nueva categoría:', req.body);
  const { nombremodref, idnegocio: idnegocioBody, moderadores } = req.body;
  const usuarioauditoria = req.user?.alias || 'unknown';
  // Prioriza el idnegocio del body, si existe, si no usa el del contexto
  const idnegocio = Number(idnegocioBody ?? req.user?.idNegocio);

  console.log('Payload recibido:', req.body);
  console.log('idnegocio usado:', idnegocio);

  if (!nombremodref || typeof nombremodref !== 'string' || idnegocio <= 0 || isNaN(idnegocio)) {
    console.error('❌ Nombre de categoría e idnegocio son requeridos o inválidos');
    return res.status(400).json({ message: 'Nombre de categoría e idnegocio son requeridos o inválidos' });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tblposcrumenwebmodref (nombremodref, fechaRegistroauditoria, usuarioauditoria, fehamodificacionauditoria, idnegocio, estatus, moderadores) VALUES (?, NOW(), ?, NOW(), ?, 1, ?)',
      [nombremodref, usuarioauditoria, idnegocio, moderadores || '']
    );
    console.log('✅ Categoría creada con ID:', result.insertId);
    res.json({ idmodref: result.insertId, nombremodref });
  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};