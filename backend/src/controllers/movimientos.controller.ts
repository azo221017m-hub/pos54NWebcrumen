import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import {
  Movimiento,
  MovimientoConDetalles,
  MovimientoCreate,
  MovimientoUpdate,
  DetalleMovimiento
} from '../types/movimientos.types';

// GET /api/movimientos - Obtener todos los movimientos
export const obtenerMovimientos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idNegocio = req.user?.idNegocio;

    // Si es superusuario (idNegocio = 99999), obtener todos los movimientos
    const isSuperuser = idNegocio === 99999;
    const whereClause = isSuperuser
      ? 'WHERE m.fecharegistro IS NOT NULL'
      : 'WHERE m.idnegocio = ?';

    const params = isSuperuser ? [] : [idNegocio];

    const [movimientos] = await pool.query<(Movimiento & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebmovimientos m
       ${whereClause}
       ORDER BY m.fechamovimiento DESC, m.idmovimiento DESC`,
      params
    );

    // Cargar detalles para cada movimiento
    const movimientosConDetalles: MovimientoConDetalles[] = await Promise.all(
      movimientos.map(async (mov: Movimiento & RowDataPacket) => {
        const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
          'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ? ORDER BY iddetallemovimiento',
          [mov.idmovimiento]
        );
        return { ...mov, detalles };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Movimientos obtenidos exitosamente',
      data: movimientosConDetalles
    });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los movimientos',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/movimientos/:id - Obtener un movimiento por ID
export const obtenerMovimientoPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idNegocio = req.user?.idNegocio;
    const isSuperuser = idNegocio === 99999;

    const whereClause = isSuperuser
      ? 'WHERE idmovimiento = ?'
      : 'WHERE idmovimiento = ? AND idnegocio = ?';

    const params = isSuperuser ? [id] : [id, idNegocio];

    const [movimientos] = await pool.query<(Movimiento & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebmovimientos ${whereClause}`,
      params
    );

    if (movimientos.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
      return;
    }

    const movimiento = movimientos[0];

    // Obtener detalles
    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ? ORDER BY iddetallemovimiento',
      [movimiento.idmovimiento]
    );

    const movimientoConDetalles: MovimientoConDetalles = {
      ...movimiento,
      detalles
    };

    res.status(200).json({
      success: true,
      data: movimientoConDetalles
    });
  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el movimiento',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/movimientos - Crear un nuevo movimiento
export const crearMovimiento = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idNegocio = req.user?.idNegocio;
    const usuarioAuditoria = req.user?.alias || req.user?.nombre || 'Sistema';
    const movimientoData: MovimientoCreate = req.body;

    if (!movimientoData.detalles || movimientoData.detalles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un detalle de movimiento'
      });
      return;
    }

    // Get the claveturno from the open turno of the logged-in user
    const [turnosAbiertos] = await pool.query<RowDataPacket[]>(
      `SELECT claveturno FROM tblposcrumenwebturnos 
       WHERE usuarioturno = ? AND idnegocio = ? AND estatusturno = 'abierto'
       LIMIT 1`,
      [usuarioAuditoria, idNegocio]
    );

    let idreferencia: string | null = null;
    if (turnosAbiertos.length > 0) {
      idreferencia = turnosAbiertos[0].claveturno;
    }

    // Insertar movimiento principal
    const [resultMovimiento] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebmovimientos (
        tipomovimiento, motivomovimiento, idreferencia, fechamovimiento, observaciones,
        usuarioauditoria, idnegocio, estatusmovimiento, fecharegistro, fechaauditoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        movimientoData.tipomovimiento,
        movimientoData.motivomovimiento,
        idreferencia,
        movimientoData.fechamovimiento,
        movimientoData.observaciones || null,
        usuarioAuditoria,
        idNegocio,
        movimientoData.estatusmovimiento
      ]
    );

    const idMovimiento = resultMovimiento.insertId;

    // Obtener stock actual de cada insumo
    for (const detalle of movimientoData.detalles) {
      const [stockResult] = await pool.query<RowDataPacket[]>(
        'SELECT stock_actual FROM tblposcrumenwebinsumos WHERE id_insumo = ? AND idnegocio = ?',
        [detalle.idinsumo, idNegocio]
      );

      const referenciaStock = stockResult.length > 0 ? stockResult[0].stock_actual : 0;

      // Insertar detalle
      await pool.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebdetallemovimientos (
          idinsumo, nombreinsumo, tipoinsumo, tipomovimiento, motivomovimiento,
          cantidad, referenciastock, unidadmedida, precio, costo, idreferencia,
          fechamovimiento, observaciones, proveedor, usuarioauditoria, idnegocio,
          estatusmovimiento, fecharegistro, fechaauditoria
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          detalle.idinsumo,
          detalle.nombreinsumo,
          detalle.tipoinsumo,
          movimientoData.tipomovimiento,
          movimientoData.motivomovimiento,
          detalle.cantidad,
          referenciaStock,
          detalle.unidadmedida,
          detalle.precio || null,
          detalle.costo || null,
          idMovimiento,
          movimientoData.fechamovimiento,
          detalle.observaciones || null,
          detalle.proveedor || null,
          usuarioAuditoria,
          idNegocio,
          movimientoData.estatusmovimiento
        ]
      );
    }

    // Obtener el movimiento completo creado
    const [movimientoCreado] = await pool.query<(Movimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebmovimientos WHERE idmovimiento = ?',
      [idMovimiento]
    );

    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [idMovimiento]
    );

    const movimientoConDetalles: MovimientoConDetalles = {
      ...movimientoCreado[0],
      detalles
    };

    res.status(201).json({
      success: true,
      message: 'Movimiento creado exitosamente',
      data: movimientoConDetalles
    });
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el movimiento',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PUT /api/movimientos/:id - Actualizar un movimiento
export const actualizarMovimiento = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idNegocio = req.user?.idNegocio;
    const isSuperuser = idNegocio === 99999;
    const movimientoData: MovimientoUpdate = req.body;

    // Verificar que el movimiento existe y pertenece al negocio
    const whereClause = isSuperuser
      ? 'WHERE idmovimiento = ?'
      : 'WHERE idmovimiento = ? AND idnegocio = ?';

    const params = isSuperuser ? [id] : [id, idNegocio];

    const [movimientos] = await pool.query<(Movimiento & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebmovimientos ${whereClause}`,
      params
    );

    if (movimientos.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
      return;
    }

    // Actualizar solo campos permitidos
    const updates: string[] = [];
    const values: any[] = [];

    if (movimientoData.motivomovimiento !== undefined) {
      updates.push('motivomovimiento = ?');
      values.push(movimientoData.motivomovimiento);
    }

    if (movimientoData.observaciones !== undefined) {
      updates.push('observaciones = ?');
      values.push(movimientoData.observaciones);
    }

    if (movimientoData.estatusmovimiento !== undefined) {
      updates.push('estatusmovimiento = ?');
      values.push(movimientoData.estatusmovimiento);
    }

    updates.push('fechaauditoria = NOW()');
    values.push(id);

    await pool.execute<ResultSetHeader>(
      `UPDATE tblposcrumenwebmovimientos SET ${updates.join(', ')} WHERE idmovimiento = ?`,
      values
    );

    // Obtener el movimiento actualizado
    const [movimientoActualizado] = await pool.query<(Movimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebmovimientos WHERE idmovimiento = ?',
      [id]
    );

    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [id]
    );

    const movimientoConDetalles: MovimientoConDetalles = {
      ...movimientoActualizado[0],
      detalles
    };

    res.status(200).json({
      success: true,
      message: 'Movimiento actualizado exitosamente',
      data: movimientoConDetalles
    });
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el movimiento',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// DELETE /api/movimientos/:id - Eliminar un movimiento (soft delete)
export const eliminarMovimiento = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idNegocio = req.user?.idNegocio;
    const isSuperuser = idNegocio === 99999;

    const whereClause = isSuperuser
      ? 'WHERE idmovimiento = ?'
      : 'WHERE idmovimiento = ? AND idnegocio = ?';

    const params = isSuperuser ? [id] : [id, idNegocio];

    const [movimientos] = await pool.query<(Movimiento & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebmovimientos ${whereClause}`,
      params
    );

    if (movimientos.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
      return;
    }

    // Eliminar detalles
    await pool.execute<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [id]
    );

    // Eliminar movimiento
    await pool.execute<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebmovimientos WHERE idmovimiento = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Movimiento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el movimiento',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PATCH /api/movimientos/:id/procesar - Procesar un movimiento pendiente
export const procesarMovimiento = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idNegocio = req.user?.idNegocio;
    const isSuperuser = idNegocio === 99999;

    const whereClause = isSuperuser
      ? 'WHERE idmovimiento = ?'
      : 'WHERE idmovimiento = ? AND idnegocio = ?';

    const params = isSuperuser ? [id] : [id, idNegocio];

    const [movimientos] = await pool.query<(Movimiento & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebmovimientos ${whereClause}`,
      params
    );

    if (movimientos.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
      return;
    }

    const movimiento = movimientos[0];

    if (movimiento.estatusmovimiento === 'PROCESADO') {
      res.status(400).json({
        success: false,
        message: 'El movimiento ya ha sido procesado'
      });
      return;
    }

    // Obtener detalles del movimiento
    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [id]
    );

    // Actualizar inventario según tipo de movimiento
    for (const detalle of detalles) {
      if (movimiento.tipomovimiento === 'ENTRADA') {
        // Incrementar stock_actual
        await pool.execute<ResultSetHeader>(
          'UPDATE tblposcrumenwebinsumos SET stock_actual = stock_actual + ? WHERE id_insumo = ? AND idnegocio = ?',
          [detalle.cantidad, detalle.idinsumo, idNegocio]
        );
      } else if (movimiento.tipomovimiento === 'SALIDA') {
        // Decrementar stock_actual
        await pool.execute<ResultSetHeader>(
          'UPDATE tblposcrumenwebinsumos SET stock_actual = stock_actual - ? WHERE id_insumo = ? AND idnegocio = ?',
          [detalle.cantidad, detalle.idinsumo, idNegocio]
        );
      }
    }

    // Actualizar estatus del movimiento y detalles
    await pool.execute<ResultSetHeader>(
      'UPDATE tblposcrumenwebmovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idmovimiento = ?',
      ['PROCESADO', id]
    );

    await pool.execute<ResultSetHeader>(
      'UPDATE tblposcrumenwebdetallemovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idreferencia = ?',
      ['PROCESADO', id]
    );

    // Obtener movimiento actualizado
    const [movimientoActualizado] = await pool.query<(Movimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebmovimientos WHERE idmovimiento = ?',
      [id]
    );

    const [detallesActualizados] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [id]
    );

    const movimientoConDetalles: MovimientoConDetalles = {
      ...movimientoActualizado[0],
      detalles: detallesActualizados
    };

    res.status(200).json({
      success: true,
      message: 'Movimiento procesado exitosamente',
      data: movimientoConDetalles
    });
  } catch (error) {
    console.error('Error al procesar movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el movimiento',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/movimientos/insumo/:idinsumo/ultima-compra - Get last purchase data for an insumo
export const obtenerUltimaCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idinsumo } = req.params;
    const idNegocio = req.user?.idNegocio;
    const isSuperuser = idNegocio === 99999;

    if (!idNegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Get insumo data first
    const [insumos] = await pool.query<RowDataPacket[]>(
      'SELECT stock_actual, costo_promedio_ponderado, unidad_medida FROM tblposcrumenwebinsumos WHERE id_insumo = ? AND idnegocio = ?',
      [idinsumo, idNegocio]
    );

    if (insumos.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }

    const insumo = insumos[0];

    // Get last purchase (COMPRA movement) for this insumo
    const whereClause = isSuperuser
      ? 'WHERE idinsumo = ? AND motivomovimiento = ?'
      : 'WHERE idinsumo = ? AND idnegocio = ? AND motivomovimiento = ?';

    const params = isSuperuser 
      ? [idinsumo, 'COMPRA'] 
      : [idinsumo, idNegocio, 'COMPRA'];

    const [ultimaCompra] = await pool.query<RowDataPacket[]>(
      `SELECT cantidad, proveedor, costo 
       FROM tblposcrumenwebdetallemovimientos 
       ${whereClause}
       ORDER BY fechamovimiento DESC, iddetallemovimiento DESC
       LIMIT 1`,
      params
    );

    res.status(200).json({
      success: true,
      data: {
        existencia: insumo.stock_actual || 0,
        costoUltimoPonderado: insumo.costo_promedio_ponderado || 0,
        unidadMedida: insumo.unidad_medida || '',
        cantidadUltimaCompra: ultimaCompra.length > 0 ? (ultimaCompra[0].cantidad || 0) : 0,
        proveedorUltimaCompra: ultimaCompra.length > 0 ? (ultimaCompra[0].proveedor || '') : '',
        costoUltimaCompra: ultimaCompra.length > 0 ? (ultimaCompra[0].costo || 0) : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener última compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de última compra',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
