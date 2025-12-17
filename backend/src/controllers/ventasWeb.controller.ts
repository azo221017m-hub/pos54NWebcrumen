import type { Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import type { 
  VentaWeb, 
  DetalleVentaWeb, 
  VentaWebCreate, 
  VentaWebUpdate,
  VentaWebWithDetails
} from '../types/ventasWeb.types';

// Obtener todas las ventas web del negocio
export const getVentasWeb = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const [rows] = await pool.execute<(VentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebventas 
       WHERE idnegocio = ? 
       ORDER BY fechadeventa DESC
       LIMIT 100`,
      [idnegocio]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener ventas web:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener ventas web' 
    });
  }
};

// Obtener una venta web por ID con sus detalles
export const getVentaWebById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Obtener la venta
    const [ventaRows] = await pool.execute<(VentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebventas 
       WHERE idventa = ? AND idnegocio = ?`,
      [id, idnegocio]
    );

    if (ventaRows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Venta no encontrada' 
      });
      return;
    }

    // Obtener los detalles de la venta
    const [detallesRows] = await pool.execute<(DetalleVentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebdetalleventas 
       WHERE idventa = ? AND idnegocio = ?
       ORDER BY iddetalleventa ASC`,
      [id, idnegocio]
    );

    const ventaWithDetails: VentaWebWithDetails = {
      ...ventaRows[0],
      detalles: detallesRows
    };

    res.json({
      success: true,
      data: ventaWithDetails
    });
  } catch (error) {
    console.error('Error al obtener venta web:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener venta web' 
    });
  }
};

// Crear una nueva venta web con sus detalles
export const createVentaWeb = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const ventaData: VentaWebCreate = req.body;

    // Validar campos requeridos
    if (!ventaData.tipodeventa || !ventaData.cliente || !ventaData.formadepago || 
        !ventaData.detalles || ventaData.detalles.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos o no hay detalles en la venta' 
      });
      return;
    }

    await connection.beginTransaction();

    // Calcular totales
    let subtotal = 0;
    let descuentos = 0;
    let impuestos = 0;

    ventaData.detalles.forEach(detalle => {
      const detalleSubtotal = detalle.cantidad * detalle.preciounitario;
      subtotal += detalleSubtotal;
      // Por ahora, descuentos e impuestos por detalle serían 0
      // Pero se pueden calcular según la lógica de negocio
    });

    const totaldeventa = subtotal - descuentos + impuestos;

    // Generar folio único de venta (timestamp + random)
    const folioventa = `V${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Insertar venta
    const [ventaResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebventas (
        tipodeventa, folioventa, estadodeventa, fechadeventa, 
        fechaprogramadaventa, subtotal, descuentos, impuestos, 
        totaldeventa, cliente, direcciondeentrega, contactodeentrega, 
        telefonodeentrega, propinadeventa, formadepago, estatusdepago, 
        idnegocio, usuarioauditoria, fechamodificacionauditoria
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        ventaData.tipodeventa,
        folioventa,
        'SOLICITADO', // Estado inicial
        ventaData.fechaprogramadaventa || null,
        subtotal,
        descuentos,
        impuestos,
        totaldeventa,
        ventaData.cliente,
        ventaData.direcciondeentrega || null,
        ventaData.contactodeentrega || null,
        ventaData.telefonodeentrega || null,
        0, // propina inicial
        ventaData.formadepago,
        'PENDIENTE', // Estatus de pago inicial
        idnegocio,
        usuarioauditoria
      ]
    );

    const ventaId = ventaResult.insertId;

    // Insertar detalles de la venta
    for (const detalle of ventaData.detalles) {
      const detalleSubtotal = detalle.cantidad * detalle.preciounitario;
      const detalleDescuento = 0; // Por defecto
      const detalleImpuesto = 0; // Por defecto
      const detalleTotal = detalleSubtotal - detalleDescuento + detalleImpuesto;

      // Determinar tipo de afectación basado en el producto
      let tipoafectacion: 'DIRECTO' | 'RECETA' | 'NO_APLICA' = 'NO_APLICA';
      let afectainventario = 0;

      if (detalle.idreceta) {
        tipoafectacion = 'RECETA';
        afectainventario = 1;
      } else if (detalle.idproducto) {
        tipoafectacion = 'DIRECTO';
        afectainventario = 1;
      }

      await connection.execute(
        `INSERT INTO tblposcrumenwebdetalleventas (
          idventa, idproducto, nombreproducto, idreceta, nombrereceta,
          cantidad, preciounitario, costounitario, subtotal, descuento,
          impuesto, total, afectainventario, tipoafectacion, 
          inventarioprocesado, fechadetalleventa, estadodetalle, 
          observaciones, idnegocio, usuarioauditoria, fechamodificacionauditoria
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW())`,
        [
          ventaId,
          detalle.idproducto,
          detalle.nombreproducto,
          detalle.idreceta || null,
          detalle.nombrereceta || null,
          detalle.cantidad,
          detalle.preciounitario,
          detalle.costounitario,
          detalleSubtotal,
          detalleDescuento,
          detalleImpuesto,
          detalleTotal,
          afectainventario,
          tipoafectacion,
          0, // inventario no procesado inicialmente
          'ORDENADO', // Estado inicial
          detalle.observaciones || null,
          idnegocio,
          usuarioauditoria
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: { 
        idventa: ventaId,
        folioventa: folioventa 
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear venta web:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar venta web' 
    });
  } finally {
    connection.release();
  }
};

// Actualizar una venta web
export const updateVentaWeb = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const updateData: VentaWebUpdate = req.body;

    // Verificar que la venta existe y pertenece al negocio
    const [ventaRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idventa FROM tblposcrumenwebventas WHERE idventa = ? AND idnegocio = ?',
      [id, idnegocio]
    );

    if (ventaRows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Venta no encontrada' 
      });
      return;
    }

    // Construir query de actualización dinámicamente
    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.estadodeventa) {
      updates.push('estadodeventa = ?');
      values.push(updateData.estadodeventa);
    }

    if (updateData.estatusdepago) {
      updates.push('estatusdepago = ?');
      values.push(updateData.estatusdepago);
    }

    if (updateData.fechaprogramadaventa !== undefined) {
      updates.push('fechaprogramadaventa = ?');
      values.push(updateData.fechaprogramadaventa);
    }

    if (updateData.fechapreparacion !== undefined) {
      updates.push('fechapreparacion = ?');
      values.push(updateData.fechapreparacion);
    }

    if (updateData.fechaenvio !== undefined) {
      updates.push('fechaenvio = ?');
      values.push(updateData.fechaenvio);
    }

    if (updateData.fechaentrega !== undefined) {
      updates.push('fechaentrega = ?');
      values.push(updateData.fechaentrega);
    }

    if (updateData.propinadeventa !== undefined) {
      updates.push('propinadeventa = ?');
      values.push(updateData.propinadeventa);
    }

    if (updates.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No hay campos para actualizar' 
      });
      return;
    }

    // Agregar campos de auditoría
    updates.push('usuarioauditoria = ?');
    values.push(usuarioauditoria);
    updates.push('fechamodificacionauditoria = NOW()');

    // Agregar condiciones WHERE
    values.push(id);
    values.push(idnegocio);

    const query = `UPDATE tblposcrumenwebventas SET ${updates.join(', ')} WHERE idventa = ? AND idnegocio = ?`;

    await pool.execute(query, values);

    res.json({
      success: true,
      message: 'Venta actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar venta web:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar venta web' 
    });
  }
};

// Eliminar (cancelar) una venta web
export const deleteVentaWeb = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar que la venta existe
    const [ventaRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idventa FROM tblposcrumenwebventas WHERE idventa = ? AND idnegocio = ?',
      [id, idnegocio]
    );

    if (ventaRows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Venta no encontrada' 
      });
      return;
    }

    // En lugar de eliminar, cambiar estado a CANCELADO (soft delete)
    await pool.execute(
      `UPDATE tblposcrumenwebventas 
       SET estadodeventa = 'CANCELADO', 
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE idventa = ? AND idnegocio = ?`,
      [usuarioauditoria, id, idnegocio]
    );

    // También cancelar todos los detalles
    await pool.execute(
      `UPDATE tblposcrumenwebdetalleventas 
       SET estadodetalle = 'CANCELADO',
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE idventa = ? AND idnegocio = ?`,
      [usuarioauditoria, id, idnegocio]
    );

    res.json({
      success: true,
      message: 'Venta cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar venta web:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cancelar venta web' 
    });
  }
};
