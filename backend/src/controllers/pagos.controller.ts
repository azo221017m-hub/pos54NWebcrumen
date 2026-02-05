import type { Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import type { 
  PagoSimpleRequest, 
  PagoMixtoRequest,
  VentaWeb
} from '../types/ventasWeb.types';

/**
 * Helper function to extract table name from cliente field for MESA sales
 * The cliente field stores the table name in format "Mesa: {nombremesa}"
 * This function extracts just the table name, handling case variations
 * @param cliente The cliente field value
 * @returns The extracted table name or empty string if not found
 */
const extractTableName = (cliente: string): string => {
  // Use case-insensitive regex to remove "Mesa:" prefix with optional whitespace
  return cliente.replace(/^mesa:\s*/i, '').trim();
};

// Process simple payment (EFECTIVO or TRANSFERENCIA)
export const procesarPagoSimple = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const pagoData: PagoSimpleRequest = req.body;

    // Validate required fields
    if (!pagoData.idventa || !pagoData.formadepago || pagoData.importedepago === undefined) {
      res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos (idventa, formadepago, importedepago)' 
      });
      return;
    }

    // Validate payment method
    if (!['EFECTIVO', 'TRANSFERENCIA'].includes(pagoData.formadepago)) {
      res.status(400).json({ 
        success: false, 
        message: 'Forma de pago inválida. Debe ser EFECTIVO o TRANSFERENCIA' 
      });
      return;
    }

    // Validate reference for TRANSFERENCIA
    if (pagoData.formadepago === 'TRANSFERENCIA' && !pagoData.referencia) {
      res.status(400).json({ 
        success: false, 
        message: 'El número de referencia es requerido para pagos con TRANSFERENCIA' 
      });
      return;
    }

    await connection.beginTransaction();

    // Get the sale
    const [ventaRows] = await connection.execute<(VentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebventas 
       WHERE idventa = ? AND idnegocio = ?`,
      [pagoData.idventa, idnegocio]
    );

    if (ventaRows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Venta no encontrada' 
      });
      return;
    }

    const venta = ventaRows[0];

    // Calculate amounts
    const subtotal = Number(venta.subtotal);
    const descuento = pagoData.descuento || 0;
    const totaldeventa = subtotal - descuento;
    const detalledescuento = pagoData.detalledescuento || null;

    // Validate payment amount
    if (pagoData.importedepago < totaldeventa) {
      res.status(400).json({ 
        success: false, 
        message: 'El importe de pago no puede ser menor al total de la venta' 
      });
      return;
    }

    // Update the sale with payment information
    await connection.execute(
      `UPDATE tblposcrumenwebventas 
       SET estadodeventa = 'COBRADO',
           subtotal = ?,
           descuentos = ?,
           totaldeventa = ?,
           formadepago = ?,
           importedepago = ?,
           estatusdepago = 'PAGADO',
           detalledescuento = ?,
           tiempototaldeventa = NOW(),
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE idventa = ? AND idnegocio = ?`,
      [
        subtotal,
        descuento,
        totaldeventa,
        pagoData.formadepago,
        pagoData.importedepago,
        detalledescuento,
        usuarioauditoria,
        pagoData.idventa,
        idnegocio
      ]
    );

    // Update all details to COBRADO status
    await connection.execute(
      `UPDATE tblposcrumenwebdetalleventas 
       SET estadodetalle = 'COBRADO',
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE idventa = ? AND idnegocio = ? AND estadodetalle != 'CANCELADO'`,
      [usuarioauditoria, pagoData.idventa, idnegocio]
    );

    // If it's a MESA sale, update table status to DISPONIBLE
    if (venta.tipodeventa === 'MESA' && venta.cliente) {
      const nombreMesa = extractTableName(venta.cliente);
      
      // Only update if we have a valid table name after extraction
      if (nombreMesa) {
        await connection.execute(
          `UPDATE tblposcrumenwebmesas 
           SET estatusmesa = 'DISPONIBLE',
               usuarioauditoria = ?,
               fechamodificacionauditoria = NOW()
           WHERE nombremesa = ? AND idnegocio = ?`,
          [usuarioauditoria, nombreMesa, idnegocio]
        );
      }
    }

    await connection.commit();

    // Calculate change for EFECTIVO
    const cambio = pagoData.formadepago === 'EFECTIVO' && pagoData.montorecibido 
      ? pagoData.montorecibido - totaldeventa 
      : 0;

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: { 
        idventa: pagoData.idventa,
        folioventa: venta.folioventa,
        totaldeventa,
        importedepago: pagoData.importedepago,
        cambio
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al procesar pago simple:', error);
    
    let errorMessage = 'Error al procesar el pago';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  } finally {
    connection.release();
  }
};

// Process mixed payment (MIXTO)
export const procesarPagoMixto = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const pagoData: PagoMixtoRequest = req.body;

    // Validate required fields
    if (!pagoData.idventa || !pagoData.detallesPagos || pagoData.detallesPagos.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos (idventa, detallesPagos)' 
      });
      return;
    }

    // Validate payment details
    for (const detalle of pagoData.detallesPagos) {
      if (!detalle.formadepagodetalle || detalle.totaldepago === undefined) {
        res.status(400).json({ 
          success: false, 
          message: 'Cada detalle de pago debe tener formadepagodetalle y totaldepago' 
        });
        return;
      }

      if (!['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(detalle.formadepagodetalle)) {
        res.status(400).json({ 
          success: false, 
          message: 'Forma de pago detalle inválida. Debe ser EFECTIVO, TARJETA o TRANSFERENCIA' 
        });
        return;
      }

      // Validate reference for TRANSFERENCIA
      if (detalle.formadepagodetalle === 'TRANSFERENCIA' && !detalle.referencia) {
        res.status(400).json({ 
          success: false, 
          message: 'El número de referencia es requerido para pagos con TRANSFERENCIA' 
        });
        return;
      }
    }

    await connection.beginTransaction();

    // Get the sale
    const [ventaRows] = await connection.execute<(VentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebventas 
       WHERE idventa = ? AND idnegocio = ?`,
      [pagoData.idventa, idnegocio]
    );

    if (ventaRows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Venta no encontrada' 
      });
      return;
    }

    const venta = ventaRows[0];

    // Calculate amounts
    const subtotal = Number(venta.subtotal);
    const descuento = pagoData.descuento || 0;
    const totaldeventa = subtotal - descuento;
    const detalledescuento = pagoData.detalledescuento || null;

    // Calculate total paid
    const totalPagado = pagoData.detallesPagos.reduce((sum, detalle) => sum + detalle.totaldepago, 0);

    // Get existing payments for this sale
    const [pagosPrevios] = await connection.execute<RowDataPacket[]>(
      `SELECT SUM(totaldepago) as totalPagadoPrevio
       FROM tblposcrumenwebdetallepagos 
       WHERE idfolioventa = ? AND idnegocio = ?`,
      [venta.folioventa, idnegocio]
    );

    const totalPagadoPrevio = Number(pagosPrevios[0]?.totalPagadoPrevio || 0);
    const totalPagadoAcumulado = totalPagadoPrevio + totalPagado;

    // Determine payment status
    let estatusdepago: 'PENDIENTE' | 'PAGADO' = 'PENDIENTE';
    let estadodeventa: 'COBRADO' | 'ORDENADO' = 'ORDENADO';

    if (totalPagadoAcumulado >= totaldeventa) {
      estatusdepago = 'PAGADO';
      estadodeventa = 'COBRADO';
    } else if (totalPagadoAcumulado > 0) {
      estatusdepago = 'PENDIENTE';
    }

    // Insert payment details into tblposcrumenwebdetallepagos FIRST
    for (const detalle of pagoData.detallesPagos) {
      await connection.execute(
        `INSERT INTO tblposcrumenwebdetallepagos (
          idfolioventa, totaldepago, formadepagodetalle,
          referencia, claveturno, idnegocio, usuarioauditoria
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          venta.folioventa,
          detalle.totaldepago,
          detalle.formadepagodetalle,
          detalle.referencia || null,
          venta.claveturno,
          idnegocio,
          usuarioauditoria
        ]
      );
    }

    // Now get the last payment timestamp (after inserting current payments)
    const [ultimaFecha] = await connection.execute<RowDataPacket[]>(
      `SELECT MAX(fechadepago) as ultimoPagoFecha
       FROM tblposcrumenwebdetallepagos 
       WHERE idfolioventa = ? AND idnegocio = ?`,
      [venta.folioventa, idnegocio]
    );

    const ultimoPagoFecha = ultimaFecha[0]?.ultimoPagoFecha;

    // Update the sale with payment information
    // For MIXTO payments, tiempototaldeventa should be set to the last payment timestamp when fully paid
    await connection.execute(
      `UPDATE tblposcrumenwebventas 
       SET estadodeventa = ?,
           subtotal = ?,
           descuentos = ?,
           totaldeventa = ?,
           formadepago = 'MIXTO',
           importedepago = ?,
           estatusdepago = ?,
           detalledescuento = ?,
           tiempototaldeventa = IF(? = 'COBRADO' AND tiempototaldeventa IS NULL, 
                                   ?, 
                                   tiempototaldeventa),
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE idventa = ? AND idnegocio = ?`,
      [
        estadodeventa,
        subtotal,
        descuento,
        totaldeventa,
        totalPagadoAcumulado,
        estatusdepago,
        detalledescuento,
        estadodeventa,
        ultimoPagoFecha,
        usuarioauditoria,
        pagoData.idventa,
        idnegocio
      ]
    );

    // Update details status if fully paid
    if (estatusdepago === 'PAGADO') {
      await connection.execute(
        `UPDATE tblposcrumenwebdetalleventas 
         SET estadodetalle = 'COBRADO',
             usuarioauditoria = ?,
             fechamodificacionauditoria = NOW()
         WHERE idventa = ? AND idnegocio = ? AND estadodetalle != 'CANCELADO'`,
        [usuarioauditoria, pagoData.idventa, idnegocio]
      );

      // If it's a MESA sale, update table status to DISPONIBLE
      if (venta.tipodeventa === 'MESA' && venta.cliente) {
        const nombreMesa = extractTableName(venta.cliente);
        
        // Only update if we have a valid table name after extraction
        if (nombreMesa) {
          await connection.execute(
            `UPDATE tblposcrumenwebmesas 
             SET estatusmesa = 'DISPONIBLE',
                 usuarioauditoria = ?,
                 fechamodificacionauditoria = NOW()
             WHERE nombremesa = ? AND idnegocio = ?`,
            [usuarioauditoria, nombreMesa, idnegocio]
          );
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: estatusdepago === 'PAGADO' 
        ? 'Pago completado exitosamente' 
        : 'Pago parcial registrado exitosamente',
      data: { 
        idventa: pagoData.idventa,
        folioventa: venta.folioventa,
        totaldeventa,
        totalPagado: totalPagadoAcumulado,
        estatusdepago,
        pendiente: Math.max(0, totaldeventa - totalPagadoAcumulado)
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al procesar pago mixto:', error);
    
    let errorMessage = 'Error al procesar el pago mixto';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  } finally {
    connection.release();
  }
};

// Get payment details for a sale
export const obtenerDetallesPagos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { folioventa } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const [detallesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM tblposcrumenwebdetallepagos 
       WHERE idfolioventa = ? AND idnegocio = ?
       ORDER BY fechadepago ASC`,
      [folioventa, idnegocio]
    );

    res.json({
      success: true,
      data: detallesRows
    });
  } catch (error) {
    console.error('Error al obtener detalles de pagos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener detalles de pagos' 
    });
  }
};
