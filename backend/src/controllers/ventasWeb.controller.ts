import type { Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import type { 
  VentaWeb, 
  DetalleVentaWeb, 
  VentaWebCreate, 
  VentaWebUpdate,
  VentaWebWithDetails,
  FormaDePago
} from '../types/ventasWeb.types';
import { getMexicoTime } from '../utils/dateTime';

// Constantes para validación
const FORMAS_DE_PAGO_VALIDAS: FormaDePago[] = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'sinFP'];
const ESTADO_ESPERAR = 'ESPERAR';
const ESTADO_ORDENADO = 'ORDENADO';
const TIPO_PRODUCTO_DEFAULT = 'Directo';

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
        claveturno, idnegocio, usuarioauditoria, fechamodificacionauditoria
      ) VALUES (?, ?, ?, NOW(), ?, NOW(), NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
        claveturno, // Clave de turno actual del usuario que hizo login
        idnegocio,
        usuarioauditoria
      ]
    );

    const ventaId = ventaResult.insertId;

    // Generar HHMMSS para el folio usando hora del servidor en zona horaria de México
    const now = getMexicoTime();
    const HH = String(now.getHours()).padStart(2, '0');
    const MM = String(now.getMinutes()).padStart(2, '0');
    const SS = String(now.getSeconds()).padStart(2, '0');
    const HHMMSS = `${HH}${MM}${SS}`;

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
          null // comensal = null
        ]
      );
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

    // Insertar nuevos detalles de la venta
    for (const detalle of detalles) {
      const detalleSubtotal = detalle.cantidad * detalle.preciounitario;
      const detalleDescuento = 0; // 0 al hacer insert desde botón ESPERAR o PRODUCIR
      const detalleImpuesto = 0; // 0 al hacer insert desde botón ESPERAR o PRODUCIR
      const detalleTotal = detalleSubtotal - detalleDescuento + detalleImpuesto;

      subtotalNuevo += detalleSubtotal;

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
          null // comensal = null
        ]
      );
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
