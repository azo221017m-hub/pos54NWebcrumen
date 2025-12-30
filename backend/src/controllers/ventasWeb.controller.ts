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

// Obtener todas las ventas web del negocio con sus detalles
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

    // Obtener todas las ventas
    const [ventasRows] = await pool.execute<(VentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebventas 
       WHERE idnegocio = ? 
       ORDER BY fechadeventa DESC
       LIMIT 100`,
      [idnegocio]
    );

    if (ventasRows.length === 0) {
      res.json({
        success: true,
        data: []
      });
      return;
    }

    // Obtener todos los IDs de ventas
    const ventaIds = ventasRows.map(v => v.idventa);

    // Obtener todos los detalles en una sola query
    const placeholders = ventaIds.map(() => '?').join(',');
    const [allDetallesRows] = await pool.execute<(DetalleVentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebdetalleventas 
       WHERE idventa IN (${placeholders}) AND idnegocio = ?
       ORDER BY idventa, iddetalleventa ASC`,
      [...ventaIds, idnegocio]
    );

    // Agrupar detalles por idventa
    const detallesPorVenta = new Map<number, DetalleVentaWeb[]>();
    allDetallesRows.forEach(detalle => {
      if (!detallesPorVenta.has(detalle.idventa)) {
        detallesPorVenta.set(detalle.idventa, []);
      }
      detallesPorVenta.get(detalle.idventa)!.push(detalle);
    });

    // Combinar ventas con sus detalles
    const ventasConDetalles: VentaWebWithDetails[] = ventasRows.map(venta => ({
      ...venta,
      detalles: detallesPorVenta.get(venta.idventa) || []
    }));

    res.json({
      success: true,
      data: ventasConDetalles
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
      // TODO: Implementar lógica de descuentos e impuestos según reglas de negocio
      // Los cálculos de descuentos e impuestos deberán ser implementados según
      // las reglas específicas del negocio (porcentajes, montos fijos, etc.)
    });

    const totaldeventa = subtotal - descuentos + impuestos;

    // Generar folio único de venta (timestamp + idnegocio + random)
    // Formato: V{timestamp}{idnegocio}{random} para mayor unicidad
    const folioventa = `V${Date.now()}${idnegocio}${Math.floor(Math.random() * 1000)}`;

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
        ventaData.estadodeventa || 'SOLICITADO', // Estado inicial o proporcionado
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
      // RECETA: Productos elaborados con receta (afecta insumos de la receta)
      // DIRECTO: Productos terminados sin receta (afecta inventario del producto directamente)
      // INVENTARIO: Insumos/materias primas vendidos directamente (sin elaboración)
      let tipoafectacion: 'DIRECTO' | 'INVENTARIO' | 'RECETA' = 'DIRECTO';
      let afectainventario = 1; // Por defecto sí afecta inventario

      if (detalle.idreceta && detalle.idreceta > 0) {
        // Si tiene receta, el tipo es RECETA
        tipoafectacion = 'RECETA';
      } else {
        // Si no tiene receta, es un producto directo
        // (INVENTARIO se usaría para materias primas, requiere info adicional del producto)
        tipoafectacion = 'DIRECTO';
      }

      await connection.execute(
        `INSERT INTO tblposcrumenwebdetalleventas (
          idventa, idproducto, nombreproducto, idreceta,
          cantidad, preciounitario, costounitario, subtotal, descuento,
          impuesto, total, afectainventario, tipoafectacion, 
          inventarioprocesado, fechadetalleventa, estadodetalle, 
          observaciones, moderadores, idnegocio, usuarioauditoria, fechamodificacionauditoria
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, NOW())`,
        [
          ventaId,
          detalle.idproducto,
          detalle.nombreproducto,
          detalle.idreceta || null,
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
          ventaData.estadodetalle || 'ORDENADO', // Estado inicial o proporcionado
          detalle.observaciones || null,
          detalle.moderadores || null,
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
    
    // Provide more detailed error message for debugging
    const errorMessage = error instanceof Error 
      ? `Error al registrar venta web: ${error.message}` 
      : 'Error al registrar venta web';
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage
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

// Actualizar el estado de un detalle de venta
export const updateDetalleEstado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, iddetalle } = req.params;
    const { estadodetalle } = req.body;
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!estadodetalle) {
      res.status(400).json({
        success: false,
        message: 'El campo estadodetalle es requerido'
      });
      return;
    }

    // Validar que el estado sea válido
    const estadosValidos = ['ESPERAR', 'ORDENADO', 'CANCELADO', 'DEVUELTO', 'PREPARACION', 'COBRADO'];
    if (!estadosValidos.includes(estadodetalle)) {
      res.status(400).json({
        success: false,
        message: 'Estado de detalle inválido'
      });
      return;
    }

    // Verificar que el detalle existe y pertenece a la venta y al negocio
    const [detalleRows] = await pool.execute<RowDataPacket[]>(
      `SELECT d.iddetalleventa 
       FROM tblposcrumenwebdetalleventas d
       INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
       WHERE d.iddetalleventa = ? AND d.idventa = ? AND d.idnegocio = ? AND v.idnegocio = ?`,
      [iddetalle, id, idnegocio, idnegocio]
    );

    if (detalleRows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Detalle de venta no encontrado'
      });
      return;
    }

    // Actualizar el estado del detalle
    await pool.execute(
      `UPDATE tblposcrumenwebdetalleventas 
       SET estadodetalle = ?,
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE iddetalleventa = ? AND idventa = ? AND idnegocio = ?`,
      [estadodetalle, usuarioauditoria, iddetalle, id, idnegocio]
    );

    res.json({
      success: true,
      message: 'Estado del detalle actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar estado del detalle:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del detalle'
    });
  }
};

// Obtener detalles de ventas por estado (útil para cocina/producción)
export const getDetallesByEstado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { estado } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Validar que el estado sea válido
    const estadosValidos = ['ESPERAR', 'ORDENADO', 'CANCELADO', 'DEVUELTO', 'PREPARACION', 'COBRADO'];
    if (!estadosValidos.includes(estado.toUpperCase())) {
      res.status(400).json({
        success: false,
        message: 'Estado de detalle inválido'
      });
      return;
    }

    // Obtener detalles con información de la venta
    const [detallesRows] = await pool.execute<(DetalleVentaWeb & RowDataPacket)[]>(
      `SELECT d.*, v.folioventa, v.cliente, v.tipodeventa, v.fechadeventa
       FROM tblposcrumenwebdetalleventas d
       INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
       WHERE d.estadodetalle = ? AND d.idnegocio = ? AND v.idnegocio = ?
       ORDER BY d.fechadetalleventa DESC
       LIMIT 100`,
      [estado.toUpperCase(), idnegocio, idnegocio]
    );

    res.json({
      success: true,
      data: detallesRows
    });
  } catch (error) {
    console.error('Error al obtener detalles por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles por estado'
    });
  }
};
