import type { Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import type { AuthRequest } from '../middlewares/auth';
import type {
  Compra,
  DetalleCompra,
  CompraCreate,
  CompraUpdate,
  CompraWithDetails,
  DetalleCompraUpdate
} from '../types/compras.types';

// Helper function to generate purchase folio
function generateFolioCompra(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `CPR${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

// Helper function to calculate totals
function calculateTotals(detalles: any[]) {
  let subtotal = 0;
  let descuentos = 0;
  let impuestos = 0;
  
  detalles.forEach(detalle => {
    const detalleSubtotal = detalle.cantidad * detalle.preciounitario;
    const detalleDescuento = detalle.descuento || 0;
    const detalleImpuesto = detalle.impuesto || 0;
    
    subtotal += detalleSubtotal;
    descuentos += detalleDescuento;
    impuestos += detalleImpuesto;
  });
  
  const totaldeventa = subtotal - descuentos + impuestos;
  
  return { subtotal, descuentos, impuestos, totaldeventa };
}

// GET /api/compras - Obtener todas las compras
export const obtenerCompras = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idNegocio } = req.user!;
    
    // Si es superusuario (idNegocio = 99999), obtener todas las compras
    // Si no, solo las del negocio del usuario
    const whereClause = idNegocio === 99999 
      ? 'WHERE 1=1' 
      : 'WHERE c.idnegocio = ?';
    const params = idNegocio === 99999 ? [] : [idNegocio];
    
    const [rows] = await pool.execute<(Compra & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebcompras c
       ${whereClause}
       ORDER BY c.fechaordendecompra DESC`,
      params
    );
    
    res.json({
      success: true,
      data: rows,
      message: 'Compras obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las compras',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// GET /api/compras/:id - Obtener una compra por ID con sus detalles
export const obtenerCompraPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { idNegocio } = req.user!;
    
    // Obtener la compra
    const whereClause = idNegocio === 99999 
      ? 'WHERE idcompra = ?' 
      : 'WHERE idcompra = ? AND idnegocio = ?';
    const params = idNegocio === 99999 ? [id] : [id, idNegocio];
    
    const [compraRows] = await pool.execute<(Compra & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebcompras ${whereClause}`,
      params
    );
    
    if (compraRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      });
      return;
    }
    
    // Obtener los detalles de la compra
    const [detalleRows] = await pool.execute<(DetalleCompra & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebdetallecompras 
       WHERE idcompra = ?
       ORDER BY iddetallecompra`,
      [id]
    );
    
    const compraWithDetails: CompraWithDetails = {
      ...compraRows[0],
      detalles: detalleRows
    };
    
    res.json({
      success: true,
      data: compraWithDetails,
      message: 'Compra obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// POST /api/compras - Crear una nueva compra
export const crearCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  let connection: PoolConnection | null = null;
  
  try {
    const compraData: CompraCreate = req.body;
    const { idNegocio, alias } = req.user!;
    
    // Validaciones
    if (!compraData.detalles || compraData.detalles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'La compra debe tener al menos un detalle'
      });
      return;
    }
    
    // Iniciar transacción
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Generar folio
    const foliocompra = generateFolioCompra();
    
    // Calcular totales
    const detallesConTotales = compraData.detalles.map(detalle => {
      const subtotal = detalle.cantidad * detalle.preciounitario;
      const descuento = 0;
      const impuesto = 0;
      const total = subtotal - descuento + impuesto;
      
      return {
        ...detalle,
        subtotal,
        descuento,
        impuesto,
        total
      };
    });
    
    const totales = calculateTotals(detallesConTotales);
    
    // Insertar la compra
    const [compraResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebcompras (
        tipodecompra, foliocompra, estadodecompra, fechaordendecompra,
        fechaprogramadacompra, subtotal, descuentos, impuestos, totaldeventa,
        direcciondeentrega, contactodeentrega, telefonodeentrega,
        importedepago, estatusdepago, referencia, detalledescuento,
        idnegocio, usuarioauditoria, fechamodificacionauditoria
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        compraData.tipodecompra,
        foliocompra,
        compraData.estadodecompra || 'ESPERAR',
        compraData.fechaprogramadacompra || null,
        totales.subtotal,
        totales.descuentos,
        totales.impuestos,
        totales.totaldeventa,
        compraData.direcciondeentrega || null,
        compraData.contactodeentrega || null,
        compraData.telefonodeentrega || null,
        totales.totaldeventa,
        compraData.estatusdepago || 'PENDIENTE',
        compraData.referencia || null,
        compraData.detalledescuento || null,
        idNegocio,
        alias
      ]
    );
    
    const idcompra = compraResult.insertId;
    
    // Insertar los detalles
    for (const detalle of detallesConTotales) {
      await connection.execute(
        `INSERT INTO tblposcrumenwebdetallecompras (
          idcompra, idproducto, nombreproducto, idreceta, cantidad,
          preciounitario, costounitario, subtotal, descuento, impuesto, total,
          afectainventario, tipoafectacion, inventarioprocesado,
          fechadetalleventa, estadodetalle, observaciones,
          idnegocio, usuarioauditoria, fechamodificacionauditoria
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW())`,
        [
          idcompra,
          detalle.idproducto,
          detalle.nombreproducto,
          detalle.idreceta || null,
          detalle.cantidad,
          detalle.preciounitario,
          detalle.costounitario,
          detalle.subtotal,
          detalle.descuento,
          detalle.impuesto,
          detalle.total,
          0, // afectainventario
          null, // tipoafectacion
          0, // inventarioprocesado
          compraData.estadodecompra || 'ESPERAR',
          detalle.observaciones || null,
          idNegocio,
          alias
        ]
      );
    }
    
    await connection.commit();
    
    // Obtener la compra creada con sus detalles
    const [compraCreada] = await pool.execute<(Compra & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebcompras WHERE idcompra = ?',
      [idcompra]
    );
    
    const [detallesCreados] = await pool.execute<(DetalleCompra & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebdetallecompras WHERE idcompra = ?',
      [idcompra]
    );
    
    const compraWithDetails: CompraWithDetails = {
      ...compraCreada[0],
      detalles: detallesCreados
    };
    
    res.status(201).json({
      success: true,
      data: compraWithDetails,
      message: 'Compra creada exitosamente'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error al crear compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// PUT /api/compras/:id - Actualizar una compra
export const actualizarCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const compraData: CompraUpdate = req.body;
    const { idNegocio, alias } = req.user!;
    
    // Verificar que la compra existe y pertenece al negocio
    const whereClause = idNegocio === 99999 
      ? 'WHERE idcompra = ?' 
      : 'WHERE idcompra = ? AND idnegocio = ?';
    const params = idNegocio === 99999 ? [id] : [id, idNegocio];
    
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      `SELECT idcompra FROM tblposcrumenwebcompras ${whereClause}`,
      params
    );
    
    if (existingRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      });
      return;
    }
    
    // Construir la consulta de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (compraData.estadodecompra !== undefined) {
      updateFields.push('estadodecompra = ?');
      updateValues.push(compraData.estadodecompra);
    }
    if (compraData.estatusdepago !== undefined) {
      updateFields.push('estatusdepago = ?');
      updateValues.push(compraData.estatusdepago);
    }
    if (compraData.fechaprogramadacompra !== undefined) {
      updateFields.push('fechaprogramadacompra = ?');
      updateValues.push(compraData.fechaprogramadacompra);
    }
    if (compraData.fechacompra !== undefined) {
      updateFields.push('fechacompra = ?');
      updateValues.push(compraData.fechacompra);
    }
    if (compraData.direcciondeentrega !== undefined) {
      updateFields.push('direcciondeentrega = ?');
      updateValues.push(compraData.direcciondeentrega);
    }
    if (compraData.contactodeentrega !== undefined) {
      updateFields.push('contactodeentrega = ?');
      updateValues.push(compraData.contactodeentrega);
    }
    if (compraData.telefonodeentrega !== undefined) {
      updateFields.push('telefonodeentrega = ?');
      updateValues.push(compraData.telefonodeentrega);
    }
    if (compraData.referencia !== undefined) {
      updateFields.push('referencia = ?');
      updateValues.push(compraData.referencia);
    }
    if (compraData.detalledescuento !== undefined) {
      updateFields.push('detalledescuento = ?');
      updateValues.push(compraData.detalledescuento);
    }
    
    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
      return;
    }
    
    // Agregar campos de auditoría
    updateFields.push('usuarioauditoria = ?', 'fechamodificacionauditoria = NOW()');
    updateValues.push(alias);
    
    // Agregar ID al final
    updateValues.push(id);
    if (idNegocio !== 99999) {
      updateValues.push(idNegocio);
    }
    
    await pool.execute(
      `UPDATE tblposcrumenwebcompras 
       SET ${updateFields.join(', ')} 
       ${whereClause}`,
      updateValues
    );
    
    // Obtener la compra actualizada
    const [updatedRows] = await pool.execute<(Compra & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebcompras WHERE idcompra = ?`,
      [id]
    );
    
    res.json({
      success: true,
      data: updatedRows[0],
      message: 'Compra actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// DELETE /api/compras/:id - Eliminar una compra (soft delete)
export const eliminarCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  let connection: PoolConnection | null = null;
  
  try {
    const { id } = req.params;
    const { idNegocio, alias } = req.user!;
    
    // Verificar que la compra existe y pertenece al negocio
    const whereClause = idNegocio === 99999 
      ? 'WHERE idcompra = ?' 
      : 'WHERE idcompra = ? AND idnegocio = ?';
    const params = idNegocio === 99999 ? [id] : [id, idNegocio];
    
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      `SELECT idcompra FROM tblposcrumenwebcompras ${whereClause}`,
      params
    );
    
    if (existingRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      });
      return;
    }
    
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Actualizar estado de la compra a ELIMINADA
    await connection.execute(
      `UPDATE tblposcrumenwebcompras 
       SET estadodecompra = 'ELIMINADA', 
           usuarioauditoria = ?, 
           fechamodificacionauditoria = NOW()
       WHERE idcompra = ?`,
      [alias, id]
    );
    
    // Actualizar estado de los detalles
    await connection.execute(
      `UPDATE tblposcrumenwebdetallecompras 
       SET estadodetalle = 'CANCELADA',
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE idcompra = ?`,
      [alias, id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Compra eliminada exitosamente'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error al eliminar compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// PUT /api/compras/:id/detalles/:iddetalle - Actualizar un detalle de compra
export const actualizarDetalleCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, iddetalle } = req.params;
    const detalleData: DetalleCompraUpdate = req.body;
    const { idNegocio, alias } = req.user!;
    
    // Verificar que el detalle existe y pertenece a la compra
    const whereClause = idNegocio === 99999
      ? 'WHERE iddetallecompra = ? AND idcompra = ?'
      : 'WHERE iddetallecompra = ? AND idcompra = ? AND idnegocio = ?';
    const params = idNegocio === 99999 
      ? [iddetalle, id] 
      : [iddetalle, id, idNegocio];
    
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      `SELECT iddetallecompra FROM tblposcrumenwebdetallecompras ${whereClause}`,
      params
    );
    
    if (existingRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Detalle de compra no encontrado'
      });
      return;
    }
    
    // Construir la consulta de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (detalleData.estadodetalle !== undefined) {
      updateFields.push('estadodetalle = ?');
      updateValues.push(detalleData.estadodetalle);
    }
    if (detalleData.cantidad !== undefined) {
      updateFields.push('cantidad = ?');
      updateValues.push(detalleData.cantidad);
    }
    if (detalleData.preciounitario !== undefined) {
      updateFields.push('preciounitario = ?');
      updateValues.push(detalleData.preciounitario);
    }
    if (detalleData.costounitario !== undefined) {
      updateFields.push('costounitario = ?');
      updateValues.push(detalleData.costounitario);
    }
    if (detalleData.observaciones !== undefined) {
      updateFields.push('observaciones = ?');
      updateValues.push(detalleData.observaciones);
    }
    
    // Si se actualizó cantidad o precios, recalcular totales
    if (detalleData.cantidad !== undefined || detalleData.preciounitario !== undefined) {
      // Obtener valores actuales si no se proporcionaron
      const [currentRows] = await pool.execute<RowDataPacket[]>(
        'SELECT cantidad, preciounitario FROM tblposcrumenwebdetallecompras WHERE iddetallecompra = ?',
        [iddetalle]
      );
      
      const cantidad = detalleData.cantidad ?? currentRows[0].cantidad;
      const preciounitario = detalleData.preciounitario ?? currentRows[0].preciounitario;
      
      const subtotal = cantidad * preciounitario;
      const total = subtotal; // sin descuentos ni impuestos por ahora
      
      updateFields.push('subtotal = ?', 'total = ?');
      updateValues.push(subtotal, total);
    }
    
    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
      return;
    }
    
    // Agregar campos de auditoría
    updateFields.push('usuarioauditoria = ?', 'fechamodificacionauditoria = NOW()');
    updateValues.push(alias);
    
    // Agregar ID al final
    updateValues.push(iddetalle);
    
    await pool.execute(
      `UPDATE tblposcrumenwebdetallecompras 
       SET ${updateFields.join(', ')} 
       WHERE iddetallecompra = ?`,
      updateValues
    );
    
    // Obtener el detalle actualizado
    const [updatedRows] = await pool.execute<(DetalleCompra & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebdetallecompras WHERE iddetallecompra = ?`,
      [iddetalle]
    );
    
    res.json({
      success: true,
      data: updatedRows[0],
      message: 'Detalle de compra actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar detalle de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el detalle de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
