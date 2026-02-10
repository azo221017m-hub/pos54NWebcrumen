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
import { formatMySQLDateTime } from '../utils/dateTime';

// GET /api/movimientos - Obtener todos los movimientos
export const obtenerMovimientos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idNegocio = req.user?.idNegocio;

    // Si es superusuario (idNegocio = 99999), obtener todos los movimientos
    const isSuperuser = idNegocio === 99999;
    const whereClause = isSuperuser
      ? "WHERE m.fecharegistro IS NOT NULL AND m.estatusmovimiento IN ('PENDIENTE', 'PROCESADO')"
      : "WHERE m.idnegocio = ? AND m.estatusmovimiento IN ('PENDIENTE', 'PROCESADO')";

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
        // Use idreferencia from movimiento if it exists, otherwise fall back to idmovimiento for old records
        const refQuery = mov.idreferencia || mov.idmovimiento;
        const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
          'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ? ORDER BY iddetallemovimiento',
          [refQuery]
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
    // Use idreferencia from movimiento if it exists, otherwise fall back to idmovimiento for old records
    const refQuery = movimiento.idreferencia || movimiento.idmovimiento;
    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ? ORDER BY iddetallemovimiento',
      [refQuery]
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

    // Validate observaciones is required for AJUSTE_MANUAL
    if (movimientoData.motivomovimiento === 'AJUSTE_MANUAL' && !movimientoData.observaciones?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Las observaciones son requeridas para movimientos de tipo AJUSTE MANUAL'
      });
      return;
    }

    // Get the current idnegocio to use as the claveturno placeholder
    // Note: No longer requiring an open turno for inventory movements
    // We'll store the folio format in the main movimientos table's idreferencia field
    const idreferenciaPlaceholder = idNegocio;

    // Convert fechamovimiento from ISO format to MySQL datetime format
    const fechaMovimientoMySQL = formatMySQLDateTime(new Date(movimientoData.fechamovimiento));

    // Insertar movimiento principal
    const [resultMovimiento] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebmovimientos (
        tipomovimiento, motivomovimiento, idreferencia, fechamovimiento, observaciones,
        usuarioauditoria, idnegocio, estatusmovimiento, fecharegistro, fechaauditoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        movimientoData.tipomovimiento,
        movimientoData.motivomovimiento,
        idreferenciaPlaceholder,  // Placeholder, will update later with folio
        fechaMovimientoMySQL,
        movimientoData.observaciones || null,
        usuarioAuditoria,
        idNegocio,
        movimientoData.estatusmovimiento
      ]
    );

    const idMovimiento = resultMovimiento.insertId;

    // Generate new folio format for idreferencia: YYYYMMDDHHMMSSidmovimiento
    // Example: 202609022314053101 (year=2026, month=09, day=02, hour=23, minute=14, second=05, idmovimiento=3101)
    // 
    // IMPORTANT: JavaScript MAX_SAFE_INTEGER limitation
    // The YYYYMMDDHHMMSS format uses 14 digits, leaving only 2 digits for safe integer operations
    // in JavaScript (MAX_SAFE_INTEGER = 9,007,199,254,740,991 = 16 digits).
    // - Safe for idMovimiento < 100 (e.g., 202602100516311 to 20260210051631|99)
    // - Unsafe for idMovimiento >= 100 (will cause precision loss in JavaScript)
    // 
    // The database (MySQL BIGINT) can store these values correctly, but JavaScript
    // operations may lose precision when reading/comparing values.
    // 
    // Future improvement: Consider using string-based storage or BigInt if IDs exceed 99.
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const folioReferenciaStr = `${year}${month}${day}${hour}${minute}${second}${idMovimiento}`;
    const folioReferencia = Number(folioReferenciaStr);

    // Update the movimiento's idreferencia with the folio format
    await pool.execute(
      'UPDATE tblposcrumenwebmovimientos SET idreferencia = ? WHERE idmovimiento = ?',
      [folioReferencia, idMovimiento]
    );

    // Obtener stock actual de cada insumo
    for (const detalle of movimientoData.detalles) {
      const [stockResult] = await pool.query<RowDataPacket[]>(
        'SELECT stock_actual FROM tblposcrumenwebinsumos WHERE id_insumo = ? AND idnegocio = ?',
        [detalle.idinsumo, idNegocio]
      );

      const referenciaStock = stockResult.length > 0 ? stockResult[0].stock_actual : 0;

      // Insertar detalle
      // Fields not stored in FormularioMovimientos are filled with defaults based on type:
      // - DECIMAL fields (precio, costo): default to 0
      // - VARCHAR fields (observaciones, proveedor): default to null
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
          detalle.precio ?? 0,  // DECIMAL: default to 0 if not provided
          detalle.costo ?? 0,   // DECIMAL: default to 0 if not provided
          folioReferencia,      // Use new folio format instead of idMovimiento
          fechaMovimientoMySQL,
          detalle.observaciones ?? null,  // TEXT: default to null if not provided
          detalle.proveedor ?? null,      // VARCHAR: default to null if not provided
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
      [folioReferencia]
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

    // Use idreferencia from movimiento if it exists, otherwise fall back to id (idmovimiento) for old records
    const refQuery = movimientoActualizado[0].idreferencia || id;
    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [refQuery]
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

    const movimiento = movimientos[0];

    // Only allow deletion of PENDIENTE records
    if (movimiento.estatusmovimiento !== 'PENDIENTE') {
      res.status(400).json({
        success: false,
        message: 'Solo se pueden eliminar movimientos con estatus PENDIENTE'
      });
      return;
    }

    // Use idreferencia from movimiento if it exists, otherwise fall back to id (idmovimiento) for old records
    const refQuery = movimiento.idreferencia || id;

    // Soft delete: Update estatusmovimiento to 'ELIMINADO' in both tables
    await pool.execute<ResultSetHeader>(
      'UPDATE tblposcrumenwebmovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idmovimiento = ?',
      ['ELIMINADO', id]
    );

    await pool.execute<ResultSetHeader>(
      'UPDATE tblposcrumenwebdetallemovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idreferencia = ?',
      ['ELIMINADO', refQuery]
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

    // Use idreferencia from movimiento if it exists, otherwise fall back to id (idmovimiento) for old records
    const refQuery = movimiento.idreferencia || id;

    // Obtener detalles del movimiento
    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [refQuery]
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
      ['PROCESADO', refQuery]
    );

    // Obtener movimiento actualizado
    const [movimientoActualizado] = await pool.query<(Movimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebmovimientos WHERE idmovimiento = ?',
      [id]
    );

    const refQueryUpdated = movimientoActualizado[0].idreferencia || id;
    const [detallesActualizados] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [refQueryUpdated]
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

// PATCH /api/movimientos/:id/aplicar - Aplicar un movimiento pendiente con actualizaciones de inventario
export const aplicarMovimiento = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idNegocio = req.user?.idNegocio;
    const usuarioAuditoria = req.user?.alias || req.user?.nombre || 'Sistema';
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

    // Use idreferencia from movimiento if it exists, otherwise fall back to id (idmovimiento) for old records
    const refQuery = movimiento.idreferencia || id;

    // Obtener detalles del movimiento
    const [detalles] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [refQuery]
    );

    // Procesar cada detalle según el motivo de movimiento
    for (const detalle of detalles) {
      // Special handling for AJUSTE_MANUAL and INV_INICIAL: Set absolute values instead of relative changes
      if (movimiento.motivomovimiento === 'AJUSTE_MANUAL' || movimiento.motivomovimiento === 'INV_INICIAL') {
        // Buscar el insumo por nombre y negocio (según requisito)
        // Use movimiento.idnegocio instead of user's idNegocio to support superuser operations
        const [insumos] = await pool.query<RowDataPacket[]>(
          'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE nombre = ? AND idnegocio = ?',
          [detalle.nombreinsumo, movimiento.idnegocio]
        );

        if (insumos.length === 0) {
          console.error(`${movimiento.motivomovimiento}: Insumo no encontrado: ${detalle.nombreinsumo} para negocio ${movimiento.idnegocio}`);
          throw new Error(`Insumo no encontrado: ${detalle.nombreinsumo}`);
        }

        const insumoId = insumos[0].id_insumo;
        
        // For AJUSTE_MANUAL and INV_INICIAL: Set absolute values (not relative)
        // stock_actual = valor INPUT.cantidad (not stock_actual + cantidad)
        // costo_promedio_ponderado = valor INPUT.costo (absolute value)
        // proveedor = valor INPUT.proveedor
        await pool.execute<ResultSetHeader>(
          `UPDATE tblposcrumenwebinsumos 
           SET stock_actual = ?,
               costo_promedio_ponderado = ?,
               idproveedor = ?,
               fechamodificacionauditoria = NOW(),
               usuarioauditoria = ?
           WHERE id_insumo = ? AND idnegocio = ?`,
          [
            detalle.cantidad,         // Absolute value for stock
            detalle.costo ?? 0,       // Absolute value for cost
            detalle.proveedor || null,
            usuarioAuditoria,
            insumoId,
            movimiento.idnegocio
          ]
        );
      }
      // Para COMPRA, MERMA, y CONSUMO, actualizar el inventario
      else if (['COMPRA', 'MERMA', 'CONSUMO'].includes(movimiento.motivomovimiento)) {
        // Buscar el insumo por nombre y negocio (según requisito)
        // Use movimiento.idnegocio instead of user's idNegocio to support superuser operations
        const [insumos] = await pool.query<RowDataPacket[]>(
          'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE nombre = ? AND idnegocio = ?',
          [detalle.nombreinsumo, movimiento.idnegocio]
        );

        if (insumos.length > 0) {
          const insumoId = insumos[0].id_insumo;
          
          // Actualizar stock_actual, idproveedor, fechamodificacionauditoria, usuarioauditoria
          // Para COMPRA: sumar cantidad (ya está positiva en la BD)
          // Para MERMA y CONSUMO: la cantidad ya viene negativa en la BD
          await pool.execute<ResultSetHeader>(
            `UPDATE tblposcrumenwebinsumos 
             SET stock_actual = stock_actual + ?,
                 idproveedor = ?,
                 fechamodificacionauditoria = NOW(),
                 usuarioauditoria = ?
             WHERE id_insumo = ? AND idnegocio = ?`,
            [
              detalle.cantidad, // Ya tiene el signo correcto (positivo para COMPRA, negativo para MERMA/CONSUMO)
              detalle.proveedor || null,
              usuarioAuditoria,
              insumoId,
              movimiento.idnegocio
            ]
          );
        }
      } else {
        // Para otros tipos de movimiento, solo actualizar stock sin cambiar proveedor
        if (movimiento.tipomovimiento === 'ENTRADA') {
          await pool.execute<ResultSetHeader>(
            'UPDATE tblposcrumenwebinsumos SET stock_actual = stock_actual + ? WHERE id_insumo = ? AND idnegocio = ?',
            [detalle.cantidad, detalle.idinsumo, movimiento.idnegocio]
          );
        } else if (movimiento.tipomovimiento === 'SALIDA') {
          await pool.execute<ResultSetHeader>(
            'UPDATE tblposcrumenwebinsumos SET stock_actual = stock_actual - ? WHERE id_insumo = ? AND idnegocio = ?',
            [detalle.cantidad, detalle.idinsumo, movimiento.idnegocio]
          );
        }
      }
    }

    // Actualizar estatus del movimiento y detalles a PROCESADO
    await pool.execute<ResultSetHeader>(
      'UPDATE tblposcrumenwebmovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idmovimiento = ?',
      ['PROCESADO', id]
    );

    await pool.execute<ResultSetHeader>(
      'UPDATE tblposcrumenwebdetallemovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idreferencia = ?',
      ['PROCESADO', refQuery]
    );

    // Obtener movimiento actualizado
    const [movimientoActualizado] = await pool.query<(Movimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebmovimientos WHERE idmovimiento = ?',
      [id]
    );

    const refQueryUpdated = movimientoActualizado[0].idreferencia || id;
    const [detallesActualizados] = await pool.query<(DetalleMovimiento & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallemovimientos WHERE idreferencia = ?',
      [refQueryUpdated]
    );

    const movimientoConDetalles: MovimientoConDetalles = {
      ...movimientoActualizado[0],
      detalles: detallesActualizados
    };

    res.status(200).json({
      success: true,
      message: 'Movimiento aplicado exitosamente',
      data: movimientoConDetalles
    });
  } catch (error) {
    console.error('Error al aplicar movimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aplicar el movimiento',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
