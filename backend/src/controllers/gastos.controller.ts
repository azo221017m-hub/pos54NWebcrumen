import type { Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import type { Gasto, GastoCreate, GastoUpdate } from '../types/gastos.types';

// Helper function to generate folio in format AAAAMMDDHHMMSS
function generarFolioGasto(): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// GET /api/gastos - Obtener todos los gastos del negocio
export async function obtenerGastos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({
        success: false,
        message: 'ID de negocio no encontrado'
      });
      return;
    }

    const [rows] = await pool.execute<(Gasto & RowDataPacket)[]>(
      `SELECT 
        v.idventa,
        v.folioventa,
        v.fechadeventa,
        v.subtotal,
        v.totaldeventa,
        v.referencia,
        v.descripcionmov,
        v.idnegocio,
        v.usuarioauditoria,
        v.fechamodificacionauditoria
      FROM tblposcrumenwebventas v
      INNER JOIN tblposcrumenwebcuentacontable c 
        ON v.descripcionmov COLLATE utf8mb4_unicode_ci = c.nombrecuentacontable COLLATE utf8mb4_unicode_ci
        AND c.naturalezacuentacontable = 'GASTO'
        AND c.idnegocio = v.idnegocio
      WHERE v.tipodeventa = 'MOVIMIENTO'
        AND v.idnegocio = ?
      ORDER BY v.fechadeventa DESC`,
      [idnegocio]
    );

    res.json({
      success: true,
      data: rows,
      message: 'Gastos obtenidos correctamente'
    });

  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gastos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// GET /api/gastos/:id - Obtener un gasto por ID
export async function obtenerGastoPorId(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({
        success: false,
        message: 'ID de negocio no encontrado'
      });
      return;
    }

    const [rows] = await pool.execute<(Gasto & RowDataPacket)[]>(
      `SELECT 
        idventa,
        folioventa,
        fechadeventa,
        subtotal,
        totaldeventa,
        referencia,
        descripcionmov,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria
      FROM tblposcrumenwebventas
      WHERE idventa = ?
        AND tipodeventa = 'MOVIMIENTO'
        AND idnegocio = ?`,
      [id, idnegocio]
    );

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: rows[0],
      message: 'Gasto obtenido correctamente'
    });

  } catch (error) {
    console.error('Error al obtener gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener gasto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// POST /api/gastos - Crear un nuevo gasto
export async function crearGasto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { importegasto, tipodegasto } = req.body as GastoCreate;
    const idnegocio = req.user?.idNegocio;
    const usuarioalias = req.user?.alias;

    // Validaciones
    if (!idnegocio || !usuarioalias) {
      res.status(400).json({
        success: false,
        message: 'Información de usuario no encontrada'
      });
      return;
    }

    if (!importegasto || importegasto <= 0) {
      res.status(400).json({
        success: false,
        message: 'El importe del gasto debe ser mayor a 0'
      });
      return;
    }

    if (!tipodegasto || tipodegasto.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'El tipo de gasto es requerido'
      });
      return;
    }

    // Generar folio
    const folioventa = generarFolioGasto();

    // Insertar el gasto (venta de tipo MOVIMIENTO)
    // Nota: folioventa se usa tanto para folioventa como para claveturno
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebventas (
        tipodeventa,
        folioventa,
        estadodeventa,
        fechadeventa,
        fechaprogramadaentrega,
        fechapreparacion,
        fechaenvio,
        fechaentrega,
        subtotal,
        descuentos,
        impuestos,
        totaldeventa,
        cliente,
        direcciondeentrega,
        contactodeentrega,
        telefonodeentrega,
        propinadeventa,
        formadepago,
        importedepago,
        estatusdepago,
        referencia,
        tiempototaldeventa,
        claveturno,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria,
        detalledescuento,
        descripcionmov
      ) VALUES (
        'MOVIMIENTO',
        ?,
        'COBRADO',
        NOW(),
        NULL,
        NULL,
        NULL,
        NULL,
        ?,
        0,
        0,
        ?,
        NULL,
        NULL,
        NULL,
        NULL,
        0,
        'EFECTIVO',
        0,
        'PAGADO',
        'GASTO',
        NULL,
        ?,
        ?,
        ?,
        NOW(),
        0,
        ?
      )`,
      // Orden de parámetros: folioventa, subtotal, totaldeventa, claveturno, idnegocio, usuarioauditoria, descripcionmov
      [folioventa, importegasto, importegasto, folioventa, idnegocio, usuarioalias, tipodegasto]
    );

    // Obtener el gasto creado
    const [gastoCreado] = await pool.execute<(Gasto & RowDataPacket)[]>(
      `SELECT 
        idventa,
        folioventa,
        fechadeventa,
        subtotal,
        totaldeventa,
        referencia,
        descripcionmov,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria
      FROM tblposcrumenwebventas
      WHERE idventa = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: gastoCreado[0],
      message: 'Gasto creado correctamente'
    });

  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear gasto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// PUT /api/gastos/:id - Actualizar un gasto
export async function actualizarGasto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { importegasto, tipodegasto } = req.body as GastoUpdate;
    const idnegocio = req.user?.idNegocio;
    const usuarioalias = req.user?.alias;

    if (!idnegocio || !usuarioalias) {
      res.status(400).json({
        success: false,
        message: 'Información de usuario no encontrada'
      });
      return;
    }

    // Verificar que el gasto existe y pertenece al negocio
    const [gastoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT idventa FROM tblposcrumenwebventas 
       WHERE idventa = ? AND tipodeventa = 'MOVIMIENTO' AND idnegocio = ?`,
      [id, idnegocio]
    );

    if (gastoRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
      return;
    }

    // Construir la actualización dinámicamente
    const updates: string[] = [];
    const values: any[] = [];

    if (importegasto !== undefined) {
      if (importegasto <= 0) {
        res.status(400).json({
          success: false,
          message: 'El importe del gasto debe ser mayor a 0'
        });
        return;
      }
      updates.push('subtotal = ?', 'totaldeventa = ?');
      values.push(importegasto, importegasto);
    }

    if (tipodegasto !== undefined) {
      if (tipodegasto.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'El tipo de gasto no puede estar vacío'
        });
        return;
      }
      updates.push('descripcionmov = ?');
      values.push(tipodegasto);
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
      return;
    }

    // Actualizar usuarioauditoria, fechamodificacionauditoria y detalledescuento
    updates.push('usuarioauditoria = ?', 'fechamodificacionauditoria = NOW()', 'detalledescuento = 0');
    values.push(usuarioalias);

    // Añadir el id al final
    values.push(id);

    await pool.execute(
      `UPDATE tblposcrumenwebventas 
       SET ${updates.join(', ')} 
       WHERE idventa = ?`,
      values
    );

    // Obtener el gasto actualizado
    const [gastoActualizado] = await pool.execute<(Gasto & RowDataPacket)[]>(
      `SELECT 
        idventa,
        folioventa,
        fechadeventa,
        subtotal,
        totaldeventa,
        referencia,
        descripcionmov,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria
      FROM tblposcrumenwebventas
      WHERE idventa = ?`,
      [id]
    );

    res.json({
      success: true,
      data: gastoActualizado[0],
      message: 'Gasto actualizado correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar gasto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// DELETE /api/gastos/:id - Eliminar un gasto
export async function eliminarGasto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({
        success: false,
        message: 'ID de negocio no encontrado'
      });
      return;
    }

    // Verificar que el gasto existe y pertenece al negocio
    const [gastoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT idventa FROM tblposcrumenwebventas 
       WHERE idventa = ? AND tipodeventa = 'MOVIMIENTO' AND idnegocio = ?`,
      [id, idnegocio]
    );

    if (gastoRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
      return;
    }

    // Eliminar el gasto
    await pool.execute(
      'DELETE FROM tblposcrumenwebventas WHERE idventa = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Gasto eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar gasto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
