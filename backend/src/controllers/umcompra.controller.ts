import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

// Obtener todas las unidades de medida de compra
export const obtenerUMCompras = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
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
      WHERE idnegocio = ?
      ORDER BY fechaRegistroauditoria DESC`,
      [idnegocio]
    );
    
    res.json({
      success: true,
      data: rows,
      message: 'Unidades de medida obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidades de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener una unidad de medida por ID
export const obtenerUMCompraPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
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
      WHERE idUmCompra = ? AND idnegocio = ?`,
      [id, idnegocio]
    );
    
    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
      return;
    }
    
    res.json({
      success: true,
      data: rows[0],
      message: 'Unidad de medida obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener unidad de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidad de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Crear una nueva unidad de medida
export const crearUMCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombreUmCompra,
      valor,
      umMatPrima,
      valorConvertido,
      usuarioauditoria
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    // Validaciones básicas
    if (!nombreUmCompra || !idnegocio) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida es obligatorio y el usuario debe estar autenticado'
      });
      return;
    }

    // Verificar si el nombre ya existe
    const [existente] = await pool.execute<RowDataPacket[]>(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE nombreUmCompra = ?',
      [nombreUmCompra]
    );

    if (existente.length > 0) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida ya existe'
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposrumenwebumcompra (
        nombreUmCompra,
        valor,
        umMatPrima,
        valorConvertido,
        fechaRegistroauditoria,
        usuarioauditoria,
        idnegocio
      ) VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [
        nombreUmCompra,
        valor || 0,
        umMatPrima || null,
        valorConvertido || 0,
        usuarioauditoria || 'sistema',
        idnegocio || null
      ]
    );

    res.status(201).json({
      success: true,
      data: { idUmCompra: result.insertId },
      message: 'Unidad de medida creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear unidad de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear unidad de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar una unidad de medida
export const actualizarUMCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      nombreUmCompra,
      valor,
      umMatPrima,
      valorConvertido,
      usuarioauditoria
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si existe y pertenece al mismo negocio
    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE idUmCompra = ? AND idnegocio = ?',
      [id, idnegocio]
    );

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
      return;
    }

    // Verificar si el nombre ya existe en otro registro del mismo negocio
    const [nombreExiste] = await pool.execute<RowDataPacket[]>(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE nombreUmCompra = ? AND idUmCompra != ? AND idnegocio = ?',
      [nombreUmCompra, id, idnegocio]
    );

    if (nombreExiste.length > 0) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida ya existe'
      });
      return;
    }

    await pool.execute(
      `UPDATE tblposrumenwebumcompra SET 
        nombreUmCompra = ?,
        valor = ?,
        umMatPrima = ?,
        valorConvertido = ?,
        usuarioauditoria = ?,
        fehamodificacionauditoria = NOW()
      WHERE idUmCompra = ? AND idnegocio = ?`,
      [
        nombreUmCompra,
        valor || 0,
        umMatPrima || null,
        valorConvertido || 0,
        usuarioauditoria || 'sistema',
        id,
        idnegocio
      ]
    );

    res.json({
      success: true,
      message: 'Unidad de medida actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar unidad de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar unidad de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar una unidad de medida
export const eliminarUMCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE idUmCompra = ? AND idnegocio = ?',
      [id, idnegocio]
    );

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
      return;
    }

    await pool.execute(
      'DELETE FROM tblposrumenwebumcompra WHERE idUmCompra = ? AND idnegocio = ?',
      [id, idnegocio]
    );

    res.json({
      success: true,
      message: 'Unidad de medida eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar unidad de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar unidad de medida',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Validar nombre único
export const validarNombreUnico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombreUmCompra, idUmCompra } = req.body;

    let query = 'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE nombreUmCompra = ?';
    const params: any[] = [nombreUmCompra];

    if (idUmCompra) {
      query += ' AND idUmCompra != ?';
      params.push(idUmCompra);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: { esUnico: rows.length === 0 }
    });
  } catch (error) {
    console.error('Error al validar nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar nombre',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
