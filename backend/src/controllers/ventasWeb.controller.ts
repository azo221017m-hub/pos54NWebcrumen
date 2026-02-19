import type { Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import type { AuthRequest } from '../middlewares/auth';
import { evaluarMargen } from '../utils/margen.utils';
import type { 
  VentaWeb, 
  DetalleVentaWeb, 
  VentaWebCreate, 
  VentaWebUpdate,
  VentaWebWithDetails,
  FormaDePago
} from '../types/ventasWeb.types';
import { getMexicoTimeComponents } from '../utils/dateTime';

// Constantes para validación
const FORMAS_DE_PAGO_VALIDAS: FormaDePago[] = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'sinFP'];
const ESTADO_ESPERAR = 'ESPERAR';
const ESTADO_ORDENADO = 'ORDENADO';
const TIPO_PRODUCTO_DEFAULT = 'Directo';

// Helper function: Process inventory movements for recipe and inventory products
// This function creates inventory movement records for recipe-based and inventory-based sales
async function processRecipeInventoryMovements(
  connection: PoolConnection,
  idventa: number,
  iddetalleventa: number | null,
  idnegocio: number,
  usuarioalias: string
): Promise<void> {
  try {
    // Get all sale details that need processing:
    // - afectainventario = 1 (affects inventory)
    // - tipoafectacion = 'RECETA' OR 'INVENTARIO'
    // - inventarioprocesado = 0 (not yet processed)
    const whereClause = iddetalleventa 
      ? 'iddetalleventa = ? AND idventa = ?' 
      : 'idventa = ?';
    const params = iddetalleventa 
      ? [iddetalleventa, idventa] 
      : [idventa];

    const [detalleRows] = await connection.execute<(DetalleVentaWeb & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebdetalleventas 
       WHERE ${whereClause} 
         AND afectainventario = 1 
         AND (tipoafectacion = 'RECETA' OR tipoafectacion = 'INVENTARIO')
         AND inventarioprocesado = 0
         AND idnegocio = ?`,
      [...params, idnegocio]
    );

    if (detalleRows.length === 0) {
      return; // Nothing to process
    }

    // Process each detail that needs inventory movement
    for (const detalle of detalleRows) {
      if (!detalle.idreceta) {
        console.warn(`Sale detail ${detalle.iddetalleventa} has tipoafectacion='${detalle.tipoafectacion}' but no idreceta`);
        continue;
      }

      if (detalle.tipoafectacion === 'INVENTARIO') {
        // For INVENTARIO products, create movement directly from insumo
        // idreceta contains the id_insumo (from productos.idreferencia)
        const [insumoRows] = await connection.execute<RowDataPacket[]>(
          `SELECT 
             id_insumo as idinsumo,
             nombre as nombreinsumo,
             unidad_medida as unidadmedida,
             stock_actual,
             precio_venta,
             costo_promedio_ponderado
           FROM tblposcrumenwebinsumos
           WHERE id_insumo = ? AND idnegocio = ?`,
          [detalle.idreceta, idnegocio]
        );

        if (insumoRows.length === 0) {
          console.warn(`Insumo ${detalle.idreceta} not found for sale detail ${detalle.iddetalleventa}`);
          continue;
        }

        const insumo = insumoRows[0];
        // Quantity sold (negative for SALIDA)
        // Using -Math.abs() ensures the value is always negative, regardless of input
        const cantidadMovimiento = -Math.abs(detalle.cantidad);

        await connection.execute(
          `INSERT INTO tblposcrumenwebdetallemovimientos (
             idinsumo, nombreinsumo, tipoinsumo, tipomovimiento, motivomovimiento,
             cantidad, referenciastock, unidadmedida, precio, costo,
             idreferencia, fechamovimiento, observaciones, usuarioauditoria, 
             idnegocio, estatusmovimiento, fecharegistro, fechaauditoria
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW(), NOW())`,
          [
            insumo.idinsumo,
            insumo.nombreinsumo,
            'INVENTARIO', // tipoinsumo
            'SALIDA', // tipomovimiento
            'VENTA', // motivomovimiento
            cantidadMovimiento, // cantidad as negative value
            insumo.stock_actual ?? 0, // DECIMAL: default to 0 if not provided
            insumo.unidadmedida,
            insumo.precio_venta ?? 0, // DECIMAL: default to 0 if not provided
            insumo.costo_promedio_ponderado ?? 0, // DECIMAL: default to 0 if not provided
            detalle.idventa, // idreferencia = sale ID
            null, // observaciones
            usuarioalias, // user alias instead of user ID
            idnegocio,
            'PENDIENTE' // estatusmovimiento
          ]
        );
      } else if (detalle.tipoafectacion === 'RECETA') {
        // For RECETA products, get ingredients from recipe details
        const [recetaDetalles] = await connection.execute<RowDataPacket[]>(
          `SELECT 
             dr.idreferencia as idinsumo,
             dr.nombreinsumo,
             dr.umInsumo as unidadmedida,
             dr.cantidadUso,
             i.stock_actual,
             i.precio_venta,
             i.costo_promedio_ponderado
           FROM tblposcrumenwebdetallerecetas dr
           LEFT JOIN tblposcrumenwebinsumos i ON dr.idreferencia = i.id_insumo
           WHERE dr.dtlRecetaId = ? AND dr.idnegocio = ?`,
          [detalle.idreceta, idnegocio]
        );

        // Create a movement record for each ingredient in the recipe
        for (const ingrediente of recetaDetalles) {
          // Calculate total quantity needed (recipe quantity * sale quantity)
          const cantidadTotal = parseFloat(ingrediente.cantidadUso) * detalle.cantidad;
          // Convert to negative for SALIDA movements
          // Using -Math.abs() ensures the value is always negative, regardless of input
          // This is critical for the stock update logic in updateInventoryStockFromMovements()
          const cantidadMovimiento = -Math.abs(cantidadTotal);

          await connection.execute(
            `INSERT INTO tblposcrumenwebdetallemovimientos (
               idinsumo, nombreinsumo, tipoinsumo, tipomovimiento, motivomovimiento,
               cantidad, referenciastock, unidadmedida, precio, costo,
               idreferencia, fechamovimiento, observaciones, usuarioauditoria, 
               idnegocio, estatusmovimiento, fecharegistro, fechaauditoria
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW(), NOW())`,
            [
              ingrediente.idinsumo,
              ingrediente.nombreinsumo,
              'RECETA', // tipoinsumo
              'SALIDA', // tipomovimiento
              'VENTA', // motivomovimiento
              cantidadMovimiento, // cantidad as negative value
              ingrediente.stock_actual ?? 0, // DECIMAL: default to 0 if not provided
              ingrediente.unidadmedida,
              ingrediente.precio_venta ?? 0, // DECIMAL: default to 0 if not provided
              ingrediente.costo_promedio_ponderado ?? 0, // DECIMAL: default to 0 if not provided
              detalle.idventa, // idreferencia = sale ID
              null, // observaciones
              usuarioalias, // user alias instead of user ID
              idnegocio,
              'PENDIENTE' // estatusmovimiento
            ]
          );
        }
      } else {
        // Unexpected tipoafectacion value - log warning for debugging
        console.warn(
          `Sale detail ${detalle.iddetalleventa} has unexpected tipoafectacion='${detalle.tipoafectacion}' ` +
          `(expected 'INVENTARIO' or 'RECETA'). Skipping inventory movement processing.`
        );
        continue;
      }

      // Mark this sale detail as processed
      await connection.execute(
        `UPDATE tblposcrumenwebdetalleventas 
         SET inventarioprocesado = 1 
         WHERE iddetalleventa = ? AND idnegocio = ?`,
        [detalle.iddetalleventa, idnegocio]
      );
    }
  } catch (error) {
    console.error('Error processing recipe inventory movements:', error);
    throw error; // Re-throw to trigger transaction rollback
  }
}

// Helper function: Update inventory stock after pending movements
// This function updates stock_actual in tblposcrumenwebinsumos based on pending movements
async function updateInventoryStockFromMovements(
  connection: PoolConnection,
  idventa: number,
  idnegocio: number,
  usuarioalias: string
): Promise<void> {
  try {
    // Get all pending movements for this sale
    const [movementRows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM tblposcrumenwebdetallemovimientos 
       WHERE idreferencia = ? 
         AND idnegocio = ? 
         AND estatusmovimiento = 'PENDIENTE'`,
      [idventa, idnegocio]
    );

    if (movementRows.length === 0) {
      return; // Nothing to process
    }

    // Update inventory stock for each movement
    for (const movement of movementRows) {
      // Get current stock from inventory table
      const [stockRows] = await connection.execute<RowDataPacket[]>(
        `SELECT stock_actual FROM tblposcrumenwebinsumos 
         WHERE id_insumo = ? AND idnegocio = ?`,
        [movement.idinsumo, idnegocio]
      );
      
      const currentStock = stockRows.length > 0 ? (stockRows[0].stock_actual || 0) : 0;
      
      // Calculate new stock: current_stock + cantidad
      // Note: cantidad is negative for SALIDA movements (ensured in processRecipeInventoryMovements)
      // Convert to Number to ensure arithmetic operation instead of string concatenation
      const newStock = Number(currentStock) + Number(movement.cantidad);
      
      // Prevent negative stock (log warning but continue to maintain data consistency)
      if (newStock < 0) {
        console.warn(
          `Warning: Inventory for insumo ${movement.idinsumo} (${movement.nombreinsumo}) ` +
          `would become negative (${newStock}). Current: ${currentStock}, Movement: ${movement.cantidad}`
        );
      }

      await connection.execute(
        `UPDATE tblposcrumenwebinsumos 
         SET stock_actual = ?,
             usuarioauditoria = ?,
             fechamodificacionauditoria = NOW()
         WHERE id_insumo = ? AND idnegocio = ?`,
        [newStock, usuarioalias, movement.idinsumo, idnegocio]
      );

      // Mark the movement as PROCESADO (within transaction - will rollback if inventory update fails)
      await connection.execute(
        `UPDATE tblposcrumenwebdetallemovimientos 
         SET estatusmovimiento = 'PROCESADO'
         WHERE iddetallemovimiento = ?`,
        [movement.iddetallemovimiento]
      );
    }
  } catch (error) {
    console.error('Error updating inventory stock from movements:', error);
    throw error; // Re-throw to trigger transaction rollback
  }
}

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

    // Validar que formadepago sea un valor válido
    if (!FORMAS_DE_PAGO_VALIDAS.includes(ventaData.formadepago)) {
      res.status(400).json({ 
        success: false, 
        message: `Forma de pago inválida: "${ventaData.formadepago}". Debe ser uno de: ${FORMAS_DE_PAGO_VALIDAS.join(', ')}` 
      });
      return;
    }

    await connection.beginTransaction();

    // Obtener claveturno del turno abierto actual
    let claveturno: string | null = null;
    const [turnoRows] = await connection.execute<RowDataPacket[]>(
      `SELECT claveturno FROM tblposcrumenwebturnos 
       WHERE idnegocio = ? AND estatusturno = 'abierto'
       LIMIT 1`,
      [idnegocio]
    );
    
    if (turnoRows.length > 0) {
      claveturno = turnoRows[0].claveturno;
    }

    // Calcular totales
    let subtotal = 0;
    let descuentos = 0;
    let impuestos = 0;

    ventaData.detalles.forEach(detalle => {
      const detalleSubtotal = detalle.cantidad * detalle.preciounitario;
      subtotal += detalleSubtotal;
      // Los descuentos e impuestos son 0 al hacer insert desde botón ESPERAR o PRODUCIR
    });

    const totaldeventa = subtotal - descuentos + impuestos;

    // Insertar venta con folioventa vacío (se actualizará después con el formato completo)
    const folioventa = '';

    // Insertar venta con todos los campos requeridos
    const [ventaResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebventas (
        tipodeventa, folioventa, estadodeventa, fechadeventa, 
        fechaprogramadaentrega, fechapreparacion, fechaenvio, fechaentrega,
        subtotal, descuentos, impuestos, 
        totaldeventa, cliente, direcciondeentrega, contactodeentrega, 
        telefonodeentrega, propinadeventa, formadepago, estatusdepago, 
        descripcionmov, claveturno, idnegocio, usuarioauditoria, fechamodificacionauditoria
      ) VALUES (?, ?, ?, NOW(), ?, NOW(), NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        ventaData.tipodeventa,
        folioventa,
        ventaData.estadodeventa || 'SOLICITADO', // Estado inicial o proporcionado
        ventaData.fechaprogramadaentrega || null, // Fecha de entrega para DOMICILIO o LLEVAR
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
        ventaData.estatusdepago || 'PENDIENTE', // Estatus de pago proporcionado o inicial
        ventaData.descripcionmov || null, // Descripción del movimiento (e.g., 'VENTA')
        claveturno, // Clave de turno actual del usuario que hizo login
        idnegocio,
        usuarioauditoria
      ]
    );

    const ventaId = ventaResult.insertId;

    // Generar HHMMSS para el folio usando hora del servidor en zona horaria de México
    const time = getMexicoTimeComponents();
    const HHMMSS = `${time.hours}${time.minutes}${time.seconds}`;

    // Obtener la primera letra del tipo de venta (default 'V' si no hay tipo)
    const tipoVentaLetra = ventaData.tipodeventa?.charAt(0) || 'V';

    // Actualizar folioventa con formato: claveturno+HHMMSS+[primera letra del tipo de venta]+idventa
    // Si no hay claveturno (no hay turno abierto), usar solo HHMMSS+letra+idventa
    const folioFinal = claveturno ? `${claveturno}${HHMMSS}${tipoVentaLetra}${ventaId}` : `${HHMMSS}${tipoVentaLetra}${ventaId}`;
    await connection.execute(
      `UPDATE tblposcrumenwebventas 
       SET folioventa = ?
       WHERE idventa = ?`,
      [folioFinal, ventaId]
    );

    // Insertar detalles de la venta
    for (const detalle of ventaData.detalles) {
      const detalleSubtotal = detalle.cantidad * detalle.preciounitario;
      const detalleDescuento = 0; // 0 al hacer insert desde botón ESPERAR o PRODUCIR
      const detalleImpuesto = 0; // 0 al hacer insert desde botón ESPERAR o PRODUCIR
      const detalleTotal = detalleSubtotal - detalleDescuento + detalleImpuesto;

      // Determinar tipo de afectación y afectainventario basado en tipoproducto
      // Según los requerimientos:
      // - afectainventario = -1 SI tipoproducto = 'DIRECTO' O estadodetalle = 'ESPERAR'
      // - afectainventario = 1 SI tipoproducto = 'INVENTARIO' o 'RECETA' Y estadodetalle != 'ESPERAR'
      // - tipoafectacion = tipoproducto del producto de la comanda
      // - inventarioprocesado = -1 SI tipoafectacion='DIRECTO' O estadodetalle='ESPERAR'
      let tipoafectacion: 'DIRECTO' | 'INVENTARIO' | 'RECETA' = 'DIRECTO';
      let afectainventario = 0;
      let inventarioprocesado = 0;

      const tipoproducto = detalle.tipoproducto || TIPO_PRODUCTO_DEFAULT;
      const esEsperar = ventaData.estadodetalle === ESTADO_ESPERAR;
      
      if (tipoproducto === 'Receta') {
        tipoafectacion = 'RECETA';
        afectainventario = esEsperar ? -1 : 1;
        inventarioprocesado = esEsperar ? -1 : 0;
      } else if (tipoproducto === 'Inventario' || tipoproducto === 'Materia Prima') {
        tipoafectacion = 'INVENTARIO';
        afectainventario = esEsperar ? -1 : 1;
        inventarioprocesado = esEsperar ? -1 : 0;
      } else {
        // Directo
        tipoafectacion = 'DIRECTO';
        afectainventario = -1; // Siempre -1 para DIRECTO
        inventarioprocesado = -1; // Siempre -1 para DIRECTO
      }

      await connection.execute(
        `INSERT INTO tblposcrumenwebdetalleventas (
          idventa, idproducto, nombreproducto, idreceta,
          cantidad, preciounitario, costounitario, subtotal, descuento,
          impuesto, total, afectainventario, tipoafectacion, 
          inventarioprocesado, fechadetalleventa, estadodetalle, 
          observaciones, moderadores, idnegocio, usuarioauditoria, fechamodificacionauditoria, comensal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, NOW(), ?)`,
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
          inventarioprocesado,
          ventaData.estadodetalle || ESTADO_ORDENADO, // Estado inicial o proporcionado
          detalle.observaciones || null,
          detalle.moderadores || null,
          idnegocio,
          usuarioauditoria,
          detalle.comensal || null // Use comensal from detalle
        ]
      );
    }

    // Process recipe inventory movements after all details are inserted
    const usuarioAlias = req.user?.alias;
    if (usuarioAlias) {
      await processRecipeInventoryMovements(connection, ventaId, null, idnegocio, usuarioAlias);
      // Update inventory stock after movements are registered
      await updateInventoryStockFromMovements(connection, ventaId, idnegocio, usuarioAlias);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: { 
        idventa: ventaId,
        folioventa: folioFinal 
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear venta web:', error);
    
    // Provide more detailed error message for debugging
    let errorMessage = 'Error al registrar venta web';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide helpful message for specific database errors
      if (errorMessage.includes('Data truncated for column')) {
        const match = errorMessage.match(/column '(\w+)'/);
        const columnName = match ? match[1] : 'desconocida';
        
        if (columnName === 'formadepago') {
          errorMessage = `Forma de pago inválida. Por favor, contacte al administrador del sistema para verificar que el valor 'sinFP' esté habilitado en la base de datos.`;
        } else {
          errorMessage = `El valor proporcionado para el campo '${columnName}' es demasiado largo o inválido. Por favor, verifique los datos e intente nuevamente.`;
        }
      }
    }
    
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

    if (updateData.fechaprogramadaentrega !== undefined) {
      updates.push('fechaprogramadaentrega = ?');
      values.push(updateData.fechaprogramadaentrega);
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

// Add detalles to an existing venta
export const addDetallesToVenta = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
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

    const { detalles, estadodetalle } = req.body;

    // Validar campos requeridos
    if (!detalles || detalles.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No hay detalles para agregar' 
      });
      return;
    }

    await connection.beginTransaction();

    // Verificar que la venta existe y pertenece al negocio
    const [ventaRows] = await connection.execute<RowDataPacket[]>(
      'SELECT idventa, folioventa, subtotal, descuentos, impuestos, totaldeventa FROM tblposcrumenwebventas WHERE idventa = ? AND idnegocio = ?',
      [id, idnegocio]
    );

    if (ventaRows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Venta no encontrada' 
      });
      return;
    }

    const ventaActual = ventaRows[0];
    let subtotalNuevo = Number(ventaActual.subtotal) || 0;
    let descuentosNuevo = Number(ventaActual.descuentos) || 0;
    let impuestosNuevo = Number(ventaActual.impuestos) || 0;

    // Get existing ESPERAR detalles for this venta to check for updates
    const [existingDetalles] = await connection.execute<RowDataPacket[]>(
      `SELECT iddetalleventa, idproducto, cantidad, preciounitario, costounitario, 
              COALESCE(moderadores, '') as moderadores, 
              COALESCE(observaciones, '') as observaciones, 
              COALESCE(comensal, '') as comensal, 
              subtotal
       FROM tblposcrumenwebdetalleventas 
       WHERE idventa = ? AND idnegocio = ? AND estadodetalle = 'ESPERAR'`,
      [id, idnegocio]
    );

    // Create a map of existing ESPERAR items for quick lookup
    // Key: idproducto|moderadores|observaciones|comensal (using COALESCE to handle nulls consistently)
    const existingMap = new Map<string, RowDataPacket>();
    for (const existing of existingDetalles) {
      const key = `${existing.idproducto}|${existing.moderadores}|${existing.observaciones}|${existing.comensal}`;
      existingMap.set(key, existing);
    }

    // Process each detalle: update if exists, insert if new
    for (const detalle of detalles) {
      // Use nullish coalescing to handle null/undefined consistently (0 and false are valid values)
      const detalleKey = `${detalle.idproducto}|${detalle.moderadores ?? ''}|${detalle.observaciones ?? ''}|${detalle.comensal ?? ''}`;
      const existingDetalle = existingMap.get(detalleKey);

      // Determinar tipo de afectación y afectainventario basado en tipoproducto
      let tipoafectacion: 'DIRECTO' | 'INVENTARIO' | 'RECETA' = 'DIRECTO';
      let afectainventario = 0;
      let inventarioprocesado = 0;

      const tipoproducto = detalle.tipoproducto || TIPO_PRODUCTO_DEFAULT;
      const esEsperar = estadodetalle === ESTADO_ESPERAR;
      
      if (tipoproducto === 'Receta') {
        tipoafectacion = 'RECETA';
        afectainventario = esEsperar ? -1 : 1;
        inventarioprocesado = esEsperar ? -1 : 0;
      } else if (tipoproducto === 'Inventario' || tipoproducto === 'Materia Prima') {
        tipoafectacion = 'INVENTARIO';
        afectainventario = esEsperar ? -1 : 1;
        inventarioprocesado = esEsperar ? -1 : 0;
      } else {
        // Directo
        tipoafectacion = 'DIRECTO';
        afectainventario = -1; // Siempre -1 para DIRECTO
        inventarioprocesado = -1; // Siempre -1 para DIRECTO
      }

      if (existingDetalle) {
        // UPDATE existing ESPERAR item: add cantidad, recalculate subtotal/total, change estado to ORDENADO
        // Use existing price to maintain price consistency (prices shouldn't change mid-order)
        const precioUnitarioExistente = Number(existingDetalle.preciounitario);
        const nuevaCantidad = Number(existingDetalle.cantidad) + Number(detalle.cantidad);
        const nuevoSubtotal = nuevaCantidad * precioUnitarioExistente;
        const detalleDescuento = 0;
        const detalleImpuesto = 0;
        const nuevoTotal = nuevoSubtotal - detalleDescuento + detalleImpuesto;

        // Adjust venta total: subtract old subtotal and add new subtotal
        subtotalNuevo -= Number(existingDetalle.subtotal);
        subtotalNuevo += nuevoSubtotal;

        await connection.execute(
          `UPDATE tblposcrumenwebdetalleventas 
           SET cantidad = ?,
               subtotal = ?,
               total = ?,
               estadodetalle = ?,
               afectainventario = ?,
               tipoafectacion = ?,
               inventarioprocesado = ?,
               usuarioauditoria = ?,
               fechamodificacionauditoria = NOW()
           WHERE iddetalleventa = ? AND idventa = ? AND idnegocio = ?`,
          [
            nuevaCantidad,
            nuevoSubtotal,
            nuevoTotal,
            estadodetalle || ESTADO_ORDENADO,
            afectainventario,
            tipoafectacion,
            inventarioprocesado,
            usuarioauditoria,
            existingDetalle.iddetalleventa,
            id,
            idnegocio
          ]
        );
      } else {
        // INSERT new detalle (no matching ESPERAR item found)
        const detalleSubtotal = detalle.cantidad * detalle.preciounitario;
        const detalleDescuento = 0; // 0 al hacer insert desde botón ESPERAR o PRODUCIR
        const detalleImpuesto = 0; // 0 al hacer insert desde botón ESPERAR o PRODUCIR
        const detalleTotal = detalleSubtotal - detalleDescuento + detalleImpuesto;

        // Add new detalle subtotal to venta total
        subtotalNuevo += detalleSubtotal;

        await connection.execute(
          `INSERT INTO tblposcrumenwebdetalleventas (
            idventa, idproducto, nombreproducto, idreceta,
            cantidad, preciounitario, costounitario, subtotal, descuento,
            impuesto, total, afectainventario, tipoafectacion, 
            inventarioprocesado, fechadetalleventa, estadodetalle, 
            observaciones, moderadores, idnegocio, usuarioauditoria, fechamodificacionauditoria, comensal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, NOW(), ?)`,
          [
            id,
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
            inventarioprocesado,
            estadodetalle || ESTADO_ORDENADO, // Estado inicial o proporcionado
            detalle.observaciones || null,
            detalle.moderadores || null,
            idnegocio,
            usuarioauditoria,
            detalle.comensal || null // Use comensal from detalle
          ]
        );
      }
    }

    // Actualizar totales de la venta
    const totaldeventaNuevo = subtotalNuevo - descuentosNuevo + impuestosNuevo;
    await connection.execute(
      `UPDATE tblposcrumenwebventas 
       SET subtotal = ?, 
           totaldeventa = ?,
           usuarioauditoria = ?,
           fechamodificacionauditoria = NOW()
       WHERE idventa = ? AND idnegocio = ?`,
      [subtotalNuevo, totaldeventaNuevo, usuarioauditoria, id, idnegocio]
    );

    // Process recipe inventory movements after all details are inserted/updated
    const usuarioAlias = req.user?.alias;
    if (usuarioAlias) {
      await processRecipeInventoryMovements(connection, Number(id), null, idnegocio, usuarioAlias);
      // Update inventory stock after movements are registered
      await updateInventoryStockFromMovements(connection, Number(id), idnegocio, usuarioAlias);
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Detalles agregados exitosamente a la venta',
      data: { 
        idventa: Number(id),
        folioventa: ventaActual.folioventa 
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al agregar detalles a venta web:', error);
    
    let errorMessage = 'Error al agregar detalles a la venta';
    
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

// Obtener resumen de ventas del turno actual abierto
export const getSalesSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Obtener el turno abierto actual del negocio
    const [turnoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT claveturno, metaturno FROM tblposcrumenwebturnos 
       WHERE idnegocio = ? AND estatusturno = 'abierto'
       LIMIT 1`,
      [idnegocio]
    );

    if (turnoRows.length === 0) {
      // No hay turno abierto, retornar valores en 0
      res.json({
        success: true,
        data: {
          totalCobrado: 0,
          totalOrdenado: 0,
          totalVentasCobradas: 0,
          metaTurno: 0,
          hasTurnoAbierto: false,
          ventasPorFormaDePago: [],
          ventasPorTipoDeVenta: [],
          descuentosPorTipo: []
        }
      });
      return;
    }

    const turnoActual = turnoRows[0];
    const claveturno = turnoActual.claveturno;
    const metaturno = Number(turnoActual.metaturno) || 0;

    // Use single query with conditional aggregation for better performance
    const [salesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(CASE WHEN estadodeventa = 'COBRADO' THEN importedepago ELSE 0 END), 0) as totalCobrado,
        COALESCE(SUM(CASE WHEN estadodeventa = 'ORDENADO' THEN totaldeventa ELSE 0 END), 0) as totalOrdenado,
        COALESCE(SUM(CASE WHEN descripcionmov = 'VENTA' AND estadodeventa = 'COBRADO' THEN totaldeventa ELSE 0 END), 0) as totalVentasCobradas
       FROM tblposcrumenwebventas 
       WHERE claveturno = ? AND idnegocio = ?`,
      [claveturno, idnegocio]
    );

    const totalCobrado = Number(salesRows[0]?.totalCobrado) || 0;
    const totalOrdenado = Number(salesRows[0]?.totalOrdenado) || 0;
    const totalVentasCobradas = Number(salesRows[0]?.totalVentasCobradas) || 0;

    // Get sales grouped by formadepago (payment method)
    const [formaDePagoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        formadepago,
        COALESCE(SUM(totaldeventa), 0) as total
       FROM tblposcrumenwebventas 
       WHERE claveturno = ? AND idnegocio = ? AND estadodeventa = 'COBRADO'
       GROUP BY formadepago
       ORDER BY total DESC`,
      [claveturno, idnegocio]
    );

    // Get sales grouped by tipodeventa (sale type: MESA, DOMICILIO, LLEVAR, ONLINE)
    const [tipoDeVentaRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        tipodeventa,
        COALESCE(SUM(totaldeventa), 0) as total
       FROM tblposcrumenwebventas 
       WHERE claveturno = ? 
         AND idnegocio = ? 
         AND estadodeventa = 'COBRADO'
         AND tipodeventa IN ('MESA', 'DOMICILIO', 'ONLINE', 'LLEVAR')
       GROUP BY tipodeventa
       ORDER BY total DESC`,
      [claveturno, idnegocio]
    );

    // Get discounts grouped by type from tblposcrumenwebdescuentos
    const [descuentosRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(d.tipodescuento, 'SIN_TIPO') as tipodescuento,
        COUNT(*) as cantidad,
        COALESCE(SUM(v.descuentos), 0) as total
       FROM tblposcrumenwebventas v
       LEFT JOIN tblposcrumenwebdescuentos d 
         ON v.detalledescuento = d.nombre AND v.idnegocio = d.idnegocio
       WHERE v.claveturno = ? 
         AND v.idnegocio = ? 
         AND v.estadodeventa = 'COBRADO'
         AND v.descuentos > 0
       GROUP BY d.tipodescuento
       ORDER BY total DESC`,
      [claveturno, idnegocio]
    );

    // Format data for charts
    const ventasPorFormaDePago = formaDePagoRows.map(row => ({
      formadepago: row.formadepago || 'Sin especificar',
      total: Number(row.total) || 0
    }));

    const ventasPorTipoDeVenta = tipoDeVentaRows.map(row => ({
      tipodeventa: row.tipodeventa || 'Sin especificar',
      total: Number(row.total) || 0
    }));

    const descuentosPorTipo = descuentosRows.map(row => ({
      tipo: row.tipodescuento || 'SIN_TIPO',
      cantidad: Number(row.cantidad) || 0,
      total: Number(row.total) || 0
    }));

    res.json({
      success: true,
      data: {
        totalCobrado,
        totalOrdenado,
        totalVentasCobradas,
        metaTurno: metaturno,
        hasTurnoAbierto: true,
        ventasPorFormaDePago,
        ventasPorTipoDeVenta,
        descuentosPorTipo
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de ventas'
    });
  }
};

/**
 * Get business health dashboard data (Sales, Cost of Sales, Gross Margin for current month)
 * @route GET /api/ventas-web/dashboard/salud-negocio
 */
export const getBusinessHealth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Get current month's date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Format dates for MySQL (YYYY-MM-DD)
    const startDate = firstDayOfMonth.toISOString().split('T')[0];
    const endDate = lastDayOfMonth.toISOString().split('T')[0];

    // 1. Calculate VENTAS (Sales)
    // Sum of tblposcrumenwebventas.totaldeventa where motivomovimiento = 'VENTA'
    const [ventasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) as totalVentas
       FROM tblposcrumenwebventas 
       WHERE idnegocio = ? 
         AND DATE(fechadeventa) BETWEEN ? AND ?
         AND estadodeventa = 'COBRADO'
         AND descripcionmov = 'VENTA'`,
      [idnegocio, startDate, endDate]
    );

    const ventas = Number(ventasRows[0]?.totalVentas) || 0;

    // 2. Calculate COSTO DE VENTA (Cost of Sales)
    // Sum of cantidad * costo from tblposcrumenwebdetallemovimientos
    // where tipomovimiento = 'SALIDA' AND motivomovimiento IN ('VENTA', 'CONSUMO')
    // NOTA: cantidad está almacenada en negativo, por eso se multiplica por -1
    const [costoVentaRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(cantidad * costo * -1), 0) as costoVenta
       FROM tblposcrumenwebdetallemovimientos
       WHERE tipomovimiento = 'SALIDA'
         AND motivomovimiento IN ('VENTA', 'CONSUMO')
         AND estatusmovimiento = 'PROCESADO'
         AND DATE(fechamovimiento) BETWEEN ? AND ?
         AND idnegocio = ?`,
      [startDate, endDate, idnegocio]
    );

    const costoVenta = Number(costoVentaRows[0]?.costoVenta) || 0;

    // 3. Calculate MARGEN BRUTO (Gross Margin)
    // Margen Bruto = Ventas - Costo de Venta
    const margenBruto = ventas - costoVenta;

    // 4. Calculate % MARGEN (Margin Percentage)
    // % Margen = (Margen Bruto / Ventas) * 100
    const porcentajeMargen = ventas > 0 ? (margenBruto / ventas) * 100 : 0;

    // 5. Evaluate margin and get classification with alerts
    const evaluacion = evaluarMargen(Number(porcentajeMargen.toFixed(2)));

    // 6. Calculate GASTOS (Operating Expenses)
    // Sum of totaldeventa from tblposcrumenwebventas where referencia = 'GASTO'
    const [gastosRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) as totalGastos
       FROM tblposcrumenwebventas 
       WHERE idnegocio = ? 
         AND DATE(fechadeventa) BETWEEN ? AND ?
         AND referencia = 'GASTO'
         AND estadodeventa = 'COBRADO'`,
      [idnegocio, startDate, endDate]
    );

    const gastos = Number(gastosRows[0]?.totalGastos) || 0;

    // 7. Calculate UTILIDAD OPERATIVA (Operating Profit)
    // Utilidad Operativa = Margen Bruto + Gastos
    // NOTA: Los gastos están almacenados como valores negativos, por eso se suman
    const utilidadOperativa = margenBruto + gastos;

    // Get legacy data (compras) for backwards compatibility
    const [legacyRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(CASE WHEN referencia = 'COMPRA' AND estadodeventa = 'COBRADO' THEN totaldeventa ELSE 0 END), 0) as totalCompras
       FROM tblposcrumenwebventas 
       WHERE idnegocio = ? 
         AND DATE(fechadeventa) BETWEEN ? AND ?`,
      [idnegocio, startDate, endDate]
    );

    const totalCompras = Number(legacyRows[0]?.totalCompras) || 0;

    // 8. Calculate VALOR DEL INVENTARIO (Inventory Value)
    // Sum of (stock_actual * costo_promedio_ponderado) from tblposcrumenwebinsumos
    // where activo = 1 AND inventariable = 1
    const [inventarioRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(stock_actual * costo_promedio_ponderado), 0) as valorInventario
       FROM tblposcrumenwebinsumos
       WHERE idnegocio = ?
         AND activo = 1
         AND inventariable = 1`,
      [idnegocio]
    );

    const valorInventario = Number(inventarioRows[0]?.valorInventario) || 0;

    res.json({
      success: true,
      data: {
        // New business health metrics
        ventas,
        costoVenta,
        margenBruto,
        porcentajeMargen: Number(porcentajeMargen.toFixed(2)),
        gastos,
        utilidadOperativa,
        valorInventario,
        
        // Margin evaluation and classification
        clasificacion: evaluacion.clasificacion,
        descripcionMargen: evaluacion.descripcion,
        colorMargen: evaluacion.color,
        nivelAlerta: evaluacion.nivelAlerta,
        alertas: evaluacion.alertas,
        
        // Legacy metrics for backwards compatibility
        totalVentas: ventas,
        totalGastos: gastos,
        totalCompras,
        
        periodo: {
          inicio: startDate,
          fin: endDate,
          mes: now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener salud del negocio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de salud del negocio'
    });
  }
};
