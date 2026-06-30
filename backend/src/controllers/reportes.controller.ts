import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { pool } from '../config/db';
import type { RowDataPacket } from 'mysql2';

// ── Shared helpers ────────────────────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}


const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
  };
}

function resolveDateRange(req: AuthRequest): { startDate: string; endDate: string } {
  const defaults = getDefaultDateRange();
  const startDate =
    typeof req.query.fechaInicio === 'string' && DATE_REGEX.test(req.query.fechaInicio)
      ? req.query.fechaInicio
      : defaults.startDate;
  const endDate =
    typeof req.query.fechaFin === 'string' && DATE_REGEX.test(req.query.fechaFin)
      ? req.query.fechaFin
      : defaults.endDate;
  return { startDate, endDate };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/reportes/estado-resultados – Estado de Resultados (Resumen Ejecutivo)
// ─────────────────────────────────────────────────────────────────────────────
export const getEstadoResultados = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    const { startDate, endDate } = resolveDateRange(req);

    // Ventas Totales (excluye CANCELADO y DEVUELTO)
    const [ventasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(dv.total), 0) AS ventas_totales
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO', 'DEVUELTO')`,
      [idnegocio, startDate, endDate]
    );

    const ventas_totales = Number(ventasRows[0]?.ventas_totales) || 0;

    // Costo de Ventas
    const [costoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(dv.cantidad * dv.costounitario), 0) AS costo_ventas
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO', 'DEVUELTO')`,
      [idnegocio, startDate, endDate]
    );

    const costo_ventas = Number(costoRows[0]?.costo_ventas) || 0;
    const utilidad_bruta = ventas_totales - costo_ventas;

    // Gastos Operativos
    const [gastosRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(costo), 0) AS gastos
       FROM tblposcrumenwebdetallemovimientos
       WHERE idnegocio = ?
         AND tipomovimiento = 'SALIDA'
         AND motivomovimiento IN ('MERMA', 'AJUSTE_MANUAL', 'CONSUMO')
         AND estatusmovimiento = 'PROCESADO'
         AND DATE(fechamovimiento) BETWEEN ? AND ?`,
      [idnegocio, startDate, endDate]
    );

    const gastos = Number(gastosRows[0]?.gastos) || 0;
    const utilidad_neta = utilidad_bruta - gastos;

    res.json({
      success: true,
      data: {
        ventas_totales,
        costo_ventas,
        utilidad_bruta,
        gastos,
        utilidad_neta,
        periodo: { inicio: startDate, fin: endDate },
      },
    });
  } catch (error) {
    console.error('Error al obtener estado de resultados:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estado de resultados' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/reportes/ventas – Reporte de Ventas Detallado
// ─────────────────────────────────────────────────────────────────────────────
export const getReporteVentas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    const { startDate, endDate } = resolveDateRange(req);
    const producto = req.query.producto ? `%${req.query.producto}%` : null;
    const comensal = req.query.comensal ? `%${req.query.comensal}%` : null;

    const params: (string | number)[] = [idnegocio, startDate, endDate];
    let whereExtra = '';

    if (producto) {
      whereExtra += ' AND dv.nombreproducto LIKE ?';
      params.push(producto);
    }
    if (comensal) {
      whereExtra += ' AND dv.comensal LIKE ?';
      params.push(comensal);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE(dv.fechadetalleventa)   AS fechadetalleventa,
         COALESCE(dv.nombreproducto, '') AS nombreproducto,
         COALESCE(dv.cantidad, 0)        AS cantidad,
         COALESCE(dv.preciounitario, 0)  AS preciounitario,
         COALESCE(dv.total, 0)           AS total,
         COALESCE(dv.usuarioauditoria, '') AS usuarioauditoria
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO', 'DEVUELTO')
         ${whereExtra}
       ORDER BY dv.fechadetalleventa DESC, dv.iddetalleventa DESC`,
      params
    );

    res.json({ success: true, data: rows, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error al obtener reporte de ventas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reporte de ventas' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/reportes/compras – Reporte de Compras
// ─────────────────────────────────────────────────────────────────────────────
export const getReporteCompras = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(dm.proveedor, '')      AS proveedor,
         COALESCE(dm.nombreinsumo, '')   AS nombreinsumo,
         COALESCE(dm.cantidad, 0)        AS cantidad,
         COALESCE(dm.costo, 0)           AS costo,
         COALESCE(dm.cantidad * dm.costo, 0) AS total,
         DATE(dm.fechamovimiento)        AS fechamovimiento
       FROM tblposcrumenwebdetallemovimientos dm
       WHERE dm.idnegocio = ?
         AND dm.tipomovimiento = 'ENTRADA'
         AND dm.motivomovimiento = 'COMPRA'
         AND dm.estatusmovimiento = 'PROCESADO'
         AND DATE(dm.fechamovimiento) BETWEEN ? AND ?
       ORDER BY dm.fechamovimiento DESC, dm.iddetallemovimiento DESC`,
      [idnegocio, startDate, endDate]
    );

    res.json({ success: true, data: rows, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error al obtener reporte de compras:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reporte de compras' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /api/reportes/costos – Reporte de Costos de Venta
// ─────────────────────────────────────────────────────────────────────────────
export const getReporteCostos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(dv.nombreproducto, '')            AS nombreproducto,
         COALESCE(dv.costounitario, 0)              AS costounitario,
         COALESCE(dv.cantidad, 0)                   AS cantidad,
         COALESCE(dv.cantidad * dv.costounitario, 0) AS total_costo
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO', 'DEVUELTO')
       ORDER BY total_costo DESC`,
      [idnegocio, startDate, endDate]
    );

    res.json({ success: true, data: rows, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error al obtener reporte de costos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reporte de costos' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /api/reportes/gastos – Reporte de Gastos
// ─────────────────────────────────────────────────────────────────────────────
export const getReporteGastos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(dm.motivomovimiento, '') AS categoria,
         COALESCE(dm.costo, 0)            AS costo,
         DATE(dm.fechamovimiento)          AS fechamovimiento,
         COALESCE(dm.usuarioauditoria, '') AS usuarioauditoria
       FROM tblposcrumenwebdetallemovimientos dm
       WHERE dm.idnegocio = ?
         AND dm.tipomovimiento = 'SALIDA'
         AND dm.motivomovimiento NOT IN ('VENTA')
         AND dm.estatusmovimiento = 'PROCESADO'
         AND DATE(dm.fechamovimiento) BETWEEN ? AND ?
       ORDER BY dm.fechamovimiento DESC, dm.iddetallemovimiento DESC`,
      [idnegocio, startDate, endDate]
    );

    res.json({ success: true, data: rows, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error al obtener reporte de gastos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reporte de gastos' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET /api/reportes/rentabilidad – Rentabilidad por Producto
// ─────────────────────────────────────────────────────────────────────────────
export const getReporteRentabilidad = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(dv.nombreproducto, '')             AS nombreproducto,
         COALESCE(SUM(dv.total), 0)                  AS ventas,
         COALESCE(SUM(dv.cantidad * dv.costounitario), 0) AS costos,
         COALESCE(SUM(dv.total) - SUM(dv.cantidad * dv.costounitario), 0) AS utilidad,
         CASE
           WHEN COALESCE(SUM(dv.total), 0) > 0
           THEN ROUND(
             (COALESCE(SUM(dv.total) - SUM(dv.cantidad * dv.costounitario), 0)
              / COALESCE(SUM(dv.total), 1)) * 100, 2)
           ELSE 0
         END AS margen
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO', 'DEVUELTO')
       GROUP BY dv.nombreproducto
       ORDER BY utilidad DESC`,
      [idnegocio, startDate, endDate]
    );

    res.json({ success: true, data: rows, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error al obtener rentabilidad por producto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener rentabilidad por producto' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET /api/reportes/flujo – Flujo de Caja (agrupado por día)
// ─────────────────────────────────────────────────────────────────────────────
export const getReporteFlujo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    const { startDate, endDate } = resolveDateRange(req);

    // Entradas: ventas por día
    const [entradasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE(dv.fechadetalleventa) AS fecha,
         COALESCE(SUM(dv.total), 0) AS entradas
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO', 'DEVUELTO')
       GROUP BY DATE(dv.fechadetalleventa)`,
      [idnegocio, startDate, endDate]
    );

    // Salidas: compras (ENTRADA) + gastos (SALIDA) por día
    // For ENTRADA (compras): cantidad is positive, costo is unit cost → total = cantidad * costo
    // For SALIDA (gastos): cantidad is stored negative → ABS(cantidad) * costo
    const [salidasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE(dm.fechamovimiento) AS fecha,
         COALESCE(SUM(
           CASE
             WHEN dm.tipomovimiento = 'ENTRADA' AND dm.motivomovimiento = 'COMPRA'
               THEN dm.cantidad * dm.costo
             WHEN dm.tipomovimiento = 'SALIDA' AND dm.motivomovimiento IN ('MERMA', 'AJUSTE_MANUAL', 'CONSUMO')
               THEN ABS(dm.cantidad) * dm.costo
             ELSE 0
           END
         ), 0) AS salidas
       FROM tblposcrumenwebdetallemovimientos dm
       WHERE dm.idnegocio = ?
         AND dm.estatusmovimiento = 'PROCESADO'
         AND DATE(dm.fechamovimiento) BETWEEN ? AND ?
       GROUP BY DATE(dm.fechamovimiento)`,
      [idnegocio, startDate, endDate]
    );

    // Merge by date
    const entradasMap = new Map<string, number>();
    for (const row of entradasRows as RowDataPacket[]) {
      entradasMap.set(String(row.fecha), Number(row.entradas) || 0);
    }

    const salidasMap = new Map<string, number>();
    for (const row of salidasRows as RowDataPacket[]) {
      salidasMap.set(String(row.fecha), Number(row.salidas) || 0);
    }

    const allDates = new Set([...entradasMap.keys(), ...salidasMap.keys()]);
    const flujo = Array.from(allDates)
      .sort()
      .map((fecha) => {
        const entradas = entradasMap.get(fecha) ?? 0;
        const salidas = salidasMap.get(fecha) ?? 0;
        return { fecha, entradas, salidas, balance: entradas - salidas };
      });

    res.json({ success: true, data: flujo, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error al obtener flujo de caja:', error);
    res.status(500).json({ success: false, message: 'Error al obtener flujo de caja' });
  }
};

// =============================================================================
// NUEVOS ENDPOINTS – DASHBOARD REESTRUCTURADO
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// SALUD DEL NEGOCIO
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/reportes/salud/estado
// Resumen ejecutivo: ventas, costos, gastos, descuentos, compras + punto de equilibrio y semáforo.
// Fórmulas:
//   margen_contribucion = (ventas - costo_ventas) / ventas
//   punto_equilibrio    = gastos_totales / margen_contribucion
//   semáforo: UTILIDAD si utilidad_neta>0, EQUILIBRIO si =0, PERDIDA si <0
export const getSaludNegocio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    // Ventas totales y costo de ventas
    const [ventasRow] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(SUM(dv.total), 0) AS ventas_totales,
         COALESCE(SUM(dv.cantidad * dv.costounitario), 0) AS costo_ventas,
         COUNT(DISTINCT dv.idventa) AS total_tickets
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO','DEVUELTO')`,
      [idnegocio, startDate, endDate]
    );
    const ventas_totales = Number(ventasRow[0]?.ventas_totales) || 0;
    const costo_ventas   = Number(ventasRow[0]?.costo_ventas)   || 0;
    const total_tickets  = Number(ventasRow[0]?.total_tickets)  || 0;

    // Descuentos totales (ventas reales, no MOVIMIENTOs)
    const [descRow] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(descuentos), 0) AS total_descuentos
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND DATE(fechadeventa) BETWEEN ? AND ?`,
      [idnegocio, startDate, endDate]
    );
    const descuentos_totales = Number(descRow[0]?.total_descuentos) || 0;

    // Gastos del turno (referencia='GASTO' en ventas-MOVIMIENTO)
    const [gastosVentasRow] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) AS gastos_turno
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND tipodeventa = 'MOVIMIENTO' AND referencia = 'GASTO'
         AND DATE(fechadeventa) BETWEEN ? AND ?`,
      [idnegocio, startDate, endDate]
    );
    // Gastos de movimientos de inventario (SALIDA/MERMA etc.)
    const [gastosMovRow] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(ABS(cantidad) * costo), 0) AS gastos_mov
       FROM tblposcrumenwebdetallemovimientos
       WHERE idnegocio = ? AND tipomovimiento = 'SALIDA'
         AND motivomovimiento NOT IN ('VENTA')
         AND estatusmovimiento = 'PROCESADO'
         AND DATE(fechamovimiento) BETWEEN ? AND ?`,
      [idnegocio, startDate, endDate]
    );
    const gastos_operativos =
      (Number(gastosVentasRow[0]?.gastos_turno) || 0) +
      (Number(gastosMovRow[0]?.gastos_mov) || 0);

    // Compras del periodo
    const [comprasRow] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(cantidad * costo), 0) AS compras_totales
       FROM tblposcrumenwebdetallemovimientos
       WHERE idnegocio = ? AND tipomovimiento = 'ENTRADA' AND motivomovimiento = 'COMPRA'
         AND estatusmovimiento = 'PROCESADO'
         AND DATE(fechamovimiento) BETWEEN ? AND ?`,
      [idnegocio, startDate, endDate]
    );
    const compras_totales = Number(comprasRow[0]?.compras_totales) || 0;

    const utilidad_bruta = ventas_totales - costo_ventas;
    const utilidad_neta  = utilidad_bruta - gastos_operativos;

    // margen_contribucion = (ventas - costo_ventas) / ventas
    const margen_contribucion = ventas_totales > 0 ? (utilidad_bruta / ventas_totales) : 0;

    // punto_equilibrio_monto = gastos_operativos / margen_contribucion
    const punto_equilibrio_monto = margen_contribucion > 0
      ? Math.round((gastos_operativos / margen_contribucion) * 100) / 100
      : 0;

    const ticket_promedio = total_tickets > 0 ? ventas_totales / total_tickets : 0;

    // punto_equilibrio_tickets = PE_monto / ticket_promedio
    const punto_equilibrio_tickets = ticket_promedio > 0
      ? Math.ceil(punto_equilibrio_monto / ticket_promedio)
      : 0;

    const semaforo: 'UTILIDAD' | 'EQUILIBRIO' | 'PERDIDA' =
      utilidad_neta > 0 ? 'UTILIDAD' : utilidad_neta === 0 ? 'EQUILIBRIO' : 'PERDIDA';

    res.json({
      success: true,
      data: {
        ventas_totales, costo_ventas, utilidad_bruta, gastos_operativos,
        descuentos_totales, compras_totales, utilidad_neta,
        margen_contribucion: Math.round(margen_contribucion * 10000) / 100,
        punto_equilibrio_monto, punto_equilibrio_tickets, ticket_promedio,
        semaforo, periodo: { inicio: startDate, fin: endDate },
      },
    });
  } catch (error) {
    console.error('Error getSaludNegocio:', error);
    res.status(500).json({ success: false, message: 'Error al obtener salud del negocio' });
  }
};

// GET /api/reportes/salud/gastos-descuentos
// Gastos agrupados por categoría + descuentos por nombre/colaborador.
export const getGastosDescuentos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    // Gastos de turno agrupados por descripcionmov (categoría)
    const [gastosRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(NULLIF(descripcionmov,''), 'Sin categoría') AS categoria,
         COUNT(*) AS cantidad,
         COALESCE(SUM(totaldeventa), 0) AS total
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND tipodeventa = 'MOVIMIENTO' AND referencia = 'GASTO'
         AND DATE(fechadeventa) BETWEEN ? AND ?
       GROUP BY COALESCE(NULLIF(descripcionmov,''), 'Sin categoría')
       ORDER BY total DESC`,
      [idnegocio, startDate, endDate]
    );

    // Gastos de movimientos de inventario agrupados por motivomovimiento
    const [gastosMovRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         motivomovimiento AS categoria,
         COUNT(*) AS cantidad,
         COALESCE(SUM(ABS(cantidad) * costo), 0) AS total
       FROM tblposcrumenwebdetallemovimientos
       WHERE idnegocio = ? AND tipomovimiento = 'SALIDA'
         AND motivomovimiento NOT IN ('VENTA')
         AND estatusmovimiento = 'PROCESADO'
         AND DATE(fechamovimiento) BETWEEN ? AND ?
       GROUP BY motivomovimiento
       ORDER BY total DESC`,
      [idnegocio, startDate, endDate]
    );

    // Combinar gastos de ambas fuentes
    const gastosMap = new Map<string, { total: number; cantidad: number }>();
    for (const r of [...gastosRows, ...gastosMovRows] as RowDataPacket[]) {
      const cat = String(r.categoria);
      const prev = gastosMap.get(cat) ?? { total: 0, cantidad: 0 };
      gastosMap.set(cat, { total: prev.total + Number(r.total), cantidad: prev.cantidad + Number(r.cantidad) });
    }
    const gastos_por_categoria = Array.from(gastosMap.entries())
      .map(([categoria, { total, cantidad }]) => ({ categoria, total, cantidad }))
      .sort((a, b) => b.total - a.total);

    const total_gastos = gastos_por_categoria.reduce((s, g) => s + g.total, 0);

    // Descuentos agrupados por nombre + colaborador
    const [descRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(NULLIF(TRIM(detalledescuento),''), 'Sin nombre') AS nombre,
         COALESCE(usuarioauditoria, 'Desconocido') AS colaborador,
         COUNT(*) AS operaciones,
         COALESCE(SUM(descuentos), 0) AS monto
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descuentos > 0
         AND DATE(fechadeventa) BETWEEN ? AND ?
       GROUP BY nombre, colaborador
       ORDER BY monto DESC`,
      [idnegocio, startDate, endDate]
    );
    const total_descuentos = (descRows as RowDataPacket[]).reduce((s, r) => s + Number(r.monto), 0);

    res.json({
      success: true,
      data: {
        gastos_por_categoria,
        descuentos_por_nombre: descRows,
        total_gastos,
        total_descuentos,
        periodo: { inicio: startDate, fin: endDate },
      },
    });
  } catch (error) {
    console.error('Error getGastosDescuentos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gastos y descuentos' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/reportes/inventario/sugerencia-compra
// Para cada insumo con stock_actual <= stock_minimo * 1.2:
//   - Obtiene las últimas 10 compras del insumo en detallemovimientos
//   - Calcula promedio de días entre compras (frecuencia) y cantidad promedio por compra
//   - cantidad_sugerida = deficit + promedio_compra
//   - Ordena por urgencia (CRITICA > stock_actual <= 0; ALTA > stock_actual < stock_minimo; MEDIA > stock_actual < stock_minimo*1.2)
export const getSugerenciaCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    // Insumos con stock bajo (actual <= minimo*1.2)
    const [insumosRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id_insumo, nombre, unidad_medida, stock_actual, stock_minimo,
              costo_promedio_ponderado, idproveedor
       FROM tblposcrumenwebinsumos
       WHERE idnegocio = ? AND activo = 1
         AND stock_actual <= stock_minimo * 1.2
       ORDER BY (stock_minimo - stock_actual) DESC`,
      [idnegocio]
    );

    const generado_en = new Date().toISOString();
    let total_estimado = 0;

    const items = await Promise.all(
      (insumosRows as RowDataPacket[]).map(async (ins) => {
        // Últimas 10 compras del insumo
        const [comprasRows] = await pool.execute<RowDataPacket[]>(
          `SELECT cantidad, fechamovimiento
           FROM tblposcrumenwebdetallemovimientos
           WHERE idnegocio = ? AND tipomovimiento = 'ENTRADA' AND motivomovimiento = 'COMPRA'
             AND estatusmovimiento = 'PROCESADO'
             AND LOWER(nombreinsumo) = LOWER(?)
           ORDER BY fechamovimiento DESC
           LIMIT 10`,
          [idnegocio, ins.nombre]
        );

        let promedio_compra = 0;
        let frecuencia_dias: number | null = null;
        let ultima_compra: string | null = null;
        let dias_desde_ultima_compra: number | null = null;

        if (comprasRows.length > 0) {
          const cantidades = (comprasRows as RowDataPacket[]).map(r => Number(r.cantidad));
          promedio_compra = cantidades.reduce((s, c) => s + c, 0) / cantidades.length;
          ultima_compra = String(comprasRows[0].fechamovimiento).split('T')[0];
          dias_desde_ultima_compra = Math.floor(
            (Date.now() - new Date(ultima_compra).getTime()) / 86400000
          );

          // Frecuencia promedio entre compras
          if (comprasRows.length >= 2) {
            let totalDias = 0;
            for (let i = 0; i < comprasRows.length - 1; i++) {
              const d1 = new Date(String((comprasRows as RowDataPacket[])[i].fechamovimiento));
              const d2 = new Date(String((comprasRows as RowDataPacket[])[i + 1].fechamovimiento));
              totalDias += Math.abs(d1.getTime() - d2.getTime()) / 86400000;
            }
            frecuencia_dias = Math.round(totalDias / (comprasRows.length - 1));
          }
        }

        const stock_actual = Number(ins.stock_actual);
        const stock_minimo = Number(ins.stock_minimo);
        const deficit = Math.max(0, stock_minimo - stock_actual);
        const cantidad_sugerida = Math.ceil(deficit + (promedio_compra || stock_minimo));

        const urgencia: 'CRITICA' | 'ALTA' | 'MEDIA' =
          stock_actual <= 0 ? 'CRITICA' :
          stock_actual < stock_minimo ? 'ALTA' : 'MEDIA';

        total_estimado += cantidad_sugerida * Number(ins.costo_promedio_ponderado || 0);

        return {
          id_insumo: ins.id_insumo,
          nombre: ins.nombre,
          unidad_medida: ins.unidad_medida,
          stock_actual,
          stock_minimo,
          deficit,
          cantidad_sugerida,
          promedio_compra: Math.round(promedio_compra * 100) / 100,
          proveedor_habitual: ins.idproveedor || null,
          ultima_compra,
          dias_desde_ultima_compra,
          frecuencia_dias,
          urgencia,
        };
      })
    );

    res.json({ success: true, data: { items, total_estimado: Math.round(total_estimado * 100) / 100, generado_en } });
  } catch (error) {
    console.error('Error getSugerenciaCompra:', error);
    res.status(500).json({ success: false, message: 'Error al obtener sugerencia de compra' });
  }
};

// GET /api/reportes/inventario/stock
// Stock actual de todos los insumos activos con valor de inventario.
export const getStockActual = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id_insumo, nombre, unidad_medida, stock_actual, stock_minimo,
              costo_promedio_ponderado,
              ROUND(stock_actual * costo_promedio_ponderado, 2) AS valor_inventario,
              idproveedor AS proveedor
       FROM tblposcrumenwebinsumos
       WHERE idnegocio = ? AND activo = 1
       ORDER BY nombre ASC`,
      [idnegocio]
    );

    const items = (rows as RowDataPacket[]).map(r => ({
      ...r,
      estado: Number(r.stock_actual) <= 0 ? 'CRITICO' :
              Number(r.stock_actual) <= Number(r.stock_minimo) ? 'CRITICO' :
              Number(r.stock_actual) <= Number(r.stock_minimo) * 1.2 ? 'ADVERTENCIA' : 'OPTIMO',
    }));

    // RowDataPacket pierde el index signature al hacer spread, leemos valor_inventario del rows original
    const valor_total = (rows as RowDataPacket[]).reduce((s, r) => s + Number(r['valor_inventario']), 0);
    const items_criticos = items.filter(i => i.estado === 'CRITICO').length;
    const items_advertencia = items.filter(i => i.estado === 'ADVERTENCIA').length;

    res.json({ success: true, data: { items, total_items: items.length, valor_total, items_criticos, items_advertencia } });
  } catch (error) {
    console.error('Error getStockActual:', error);
    res.status(500).json({ success: false, message: 'Error al obtener stock actual' });
  }
};

// GET /api/reportes/inventario/bajo-minimo
// Insumos donde stock_actual <= stock_minimo, ordenados por déficit descendente.
export const getStockBajoMinimo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id_insumo, nombre, unidad_medida, stock_actual, stock_minimo,
              ROUND(stock_minimo - stock_actual, 2) AS deficit,
              idproveedor AS proveedor
       FROM tblposcrumenwebinsumos
       WHERE idnegocio = ? AND activo = 1 AND stock_actual <= stock_minimo
       ORDER BY (stock_minimo - stock_actual) DESC`,
      [idnegocio]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getStockBajoMinimo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener stock bajo mínimo' });
  }
};

// GET /api/reportes/inventario/compras-proveedor
// Historial de compras agrupado por proveedor.
export const getComprasPorProveedor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(NULLIF(TRIM(proveedor),''), 'Sin proveedor') AS proveedor,
         ROUND(SUM(cantidad * costo), 2) AS total_monto,
         COUNT(*) AS total_operaciones,
         GROUP_CONCAT(DISTINCT nombreinsumo ORDER BY nombreinsumo SEPARATOR ', ') AS productos,
         MAX(DATE(fechamovimiento)) AS ultima_compra,
         MIN(DATE(fechamovimiento)) AS primera_compra
       FROM tblposcrumenwebdetallemovimientos
       WHERE idnegocio = ? AND tipomovimiento = 'ENTRADA' AND motivomovimiento = 'COMPRA'
         AND estatusmovimiento = 'PROCESADO'
         AND DATE(fechamovimiento) BETWEEN ? AND ?
       GROUP BY COALESCE(NULLIF(TRIM(proveedor),''), 'Sin proveedor')
       ORDER BY total_monto DESC`,
      [idnegocio, startDate, endDate]
    );

    const data = (rows as RowDataPacket[]).map(r => ({
      ...r,
      productos: String(r.productos || '').split(', ').filter(Boolean),
    }));

    res.json({ success: true, data, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error getComprasPorProveedor:', error);
    res.status(500).json({ success: false, message: 'Error al obtener compras por proveedor' });
  }
};

// GET /api/reportes/inventario/rotacion
// Rotación de inventario: cantidad_vendida / stock_actual (proxy sin historial de stock).
export const getRotacionInventario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    // Unidades vendidas por producto en el periodo
    const [ventasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT dv.nombreproducto AS nombre,
              COALESCE(SUM(dv.cantidad), 0) AS cantidad_vendida
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO','DEVUELTO')
       GROUP BY dv.nombreproducto
       ORDER BY cantidad_vendida DESC`,
      [idnegocio, startDate, endDate]
    );

    // Stock actual para cruzar (join por nombre)
    const [stockRows] = await pool.execute<RowDataPacket[]>(
      `SELECT nombre, stock_actual FROM tblposcrumenwebinsumos WHERE idnegocio = ? AND activo = 1`,
      [idnegocio]
    );
    const stockMap = new Map<string, number>();
    for (const s of stockRows as RowDataPacket[]) stockMap.set(String(s.nombre).toLowerCase(), Number(s.stock_actual));

    const data = (ventasRows as RowDataPacket[]).map(r => {
      const stock = stockMap.get(String(r.nombre).toLowerCase()) ?? 0;
      const indice_rotacion = stock > 0 ? Math.round((Number(r.cantidad_vendida) / stock) * 100) / 100 : 0;
      const nivel: 'ALTA' | 'MEDIA' | 'BAJA' =
        indice_rotacion >= 2 ? 'ALTA' : indice_rotacion >= 0.5 ? 'MEDIA' : 'BAJA';
      return { nombre: r.nombre, cantidad_vendida: Number(r.cantidad_vendida), stock_actual: stock, indice_rotacion, nivel };
    });

    res.json({ success: true, data, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error getRotacionInventario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener rotación de inventario' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VENTAS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/reportes/ventas/hoy
// Ventas del día actual: total, tickets, ticket promedio, formas de pago, por turno.
// También calcula el periodo anterior equivalente (ayer) para comparativo.
export const getVentasHoy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const hoy = getToday();

    const [resumenRow] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(SUM(totaldeventa), 0) AS total_cobrado,
         COUNT(*) AS total_tickets,
         COALESCE(SUM(descuentos), 0) AS total_descuentos
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND DATE(fechadeventa) = ?`,
      [idnegocio, hoy]
    );
    const total_cobrado   = Number(resumenRow[0]?.total_cobrado)   || 0;
    const total_tickets   = Number(resumenRow[0]?.total_tickets)   || 0;
    const total_descuentos = Number(resumenRow[0]?.total_descuentos) || 0;
    const ticket_promedio = total_tickets > 0 ? total_cobrado / total_tickets : 0;

    // Por forma de pago
    const [fpRows] = await pool.execute<RowDataPacket[]>(
      `SELECT formadepago, COALESCE(SUM(totaldeventa), 0) AS total, COUNT(*) AS cantidad
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND DATE(fechadeventa) = ? AND formadepago != 'MIXTO'
       GROUP BY formadepago ORDER BY total DESC`,
      [idnegocio, hoy]
    );

    // Por turno
    const [turnoRows] = await pool.execute<RowDataPacket[]>(
      `SELECT t.claveturno, t.usuarioturno, t.metaturno, t.logrometa,
              COALESCE(SUM(v.totaldeventa), 0) AS total,
              COUNT(v.idventa) AS tickets
       FROM tblposcrumenwebturnos t
       LEFT JOIN tblposcrumenwebventas v
         ON v.claveturno = t.claveturno AND v.descripcionmov = 'VENTA'
            AND v.estadodeventa = 'COBRADO' AND v.estatusdepago = 'PAGADO'
            AND DATE(v.fechadeventa) = ?
       WHERE t.idnegocio = ? AND DATE(t.fechainicioturno) = ?
       GROUP BY t.claveturno, t.usuarioturno, t.metaturno, t.logrometa`,
      [hoy, idnegocio, hoy]
    );

    // Comparativo con ayer
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const [ayerRow] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) AS total
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND DATE(fechadeventa) = ?`,
      [idnegocio, ayer]
    );
    const total_ayer = Number(ayerRow[0]?.total) || 0;
    const variacion_pct = total_ayer > 0
      ? Math.round(((total_cobrado - total_ayer) / total_ayer) * 10000) / 100
      : null;

    res.json({
      success: true,
      data: {
        fecha: hoy,
        total_cobrado, total_tickets, ticket_promedio, total_descuentos,
        por_forma_pago: fpRows,
        por_turno: (turnoRows as RowDataPacket[]).map(r => ({
          claveturno: r.claveturno, usuarioturno: r.usuarioturno,
          total: Number(r.total), tickets: Number(r.tickets),
          metaturno: r.metaturno ? Number(r.metaturno) : null,
          logrometa: r.logrometa ? Number(r.logrometa) : null,
        })),
        periodo_anterior: total_ayer > 0 ? { total: total_ayer, variacion_pct } : null,
      },
    });
  } catch (error) {
    console.error('Error getVentasHoy:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ventas del día' });
  }
};

// GET /api/reportes/ventas/por-turno
// Ventas agrupadas por turno en el rango de fechas, con meta y % cumplimiento.
export const getVentasPorTurno = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         t.claveturno, t.usuarioturno, t.fechainicioturno, t.fechafinturno,
         t.estatusturno, t.metaturno, t.logrometa,
         COALESCE(SUM(v.totaldeventa), 0) AS total_ventas,
         COUNT(v.idventa) AS total_tickets,
         COALESCE(SUM(v.descuentos), 0) AS total_descuentos
       FROM tblposcrumenwebturnos t
       LEFT JOIN tblposcrumenwebventas v
         ON v.claveturno = t.claveturno AND v.descripcionmov = 'VENTA'
            AND v.estadodeventa = 'COBRADO' AND v.estatusdepago = 'PAGADO'
       WHERE t.idnegocio = ?
         AND DATE(t.fechainicioturno) BETWEEN ? AND ?
       GROUP BY t.idturno, t.claveturno, t.usuarioturno, t.fechainicioturno,
                t.fechafinturno, t.estatusturno, t.metaturno, t.logrometa
       ORDER BY t.fechainicioturno DESC`,
      [idnegocio, startDate, endDate]
    );

    const data = (rows as RowDataPacket[]).map(r => {
      const total_ventas = Number(r.total_ventas);
      const ticket_promedio = Number(r.total_tickets) > 0 ? total_ventas / Number(r.total_tickets) : 0;
      const meta = r.metaturno ? Number(r.metaturno) : null;
      const logro = r.logrometa ? Number(r.logrometa) : null;
      const semaforo = meta && logro
        ? (logro >= 100 ? 'SUPERO' : logro >= 90 ? 'CUMPLIO' : 'NO_CUMPLIO')
        : null;
      return {
        claveturno: r.claveturno, usuarioturno: r.usuarioturno,
        fechainicioturno: r.fechainicioturno, fechafinturno: r.fechafinturno,
        estatusturno: r.estatusturno, total_ventas, total_tickets: Number(r.total_tickets),
        ticket_promedio, total_descuentos: Number(r.total_descuentos),
        metaturno: meta, logrometa: logro, semaforo,
      };
    });

    res.json({ success: true, data, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error getVentasPorTurno:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ventas por turno' });
  }
};

// GET /api/reportes/ventas/top-productos
// Top productos vendidos por cantidad y monto en el rango.
export const getTopProductos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);
    const limit = Math.min(parseInt(String(req.query.limit || '20')), 50);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         dv.nombreproducto,
         COALESCE(SUM(dv.cantidad), 0) AS cantidad_vendida,
         COALESCE(SUM(dv.total), 0) AS total_ventas
       FROM tblposcrumenwebdetalleventas dv
       INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
       WHERE dv.idnegocio = ?
         AND DATE(dv.fechadetalleventa) BETWEEN ? AND ?
         AND v.estadodeventa NOT IN ('CANCELADO','DEVUELTO')
       GROUP BY dv.nombreproducto
       ORDER BY total_ventas DESC
       LIMIT ?`,
      [idnegocio, startDate, endDate, limit]
    );

    const total_global = (rows as RowDataPacket[]).reduce((s, r) => s + Number(r.total_ventas), 0);
    const data = (rows as RowDataPacket[]).map((r, i) => ({
      nombreproducto: r.nombreproducto,
      cantidad_vendida: Number(r.cantidad_vendida),
      total_ventas: Number(r.total_ventas),
      ticket_promedio: Number(r.cantidad_vendida) > 0
        ? Math.round((Number(r.total_ventas) / Number(r.cantidad_vendida)) * 100) / 100 : 0,
      porcentaje_ventas: total_global > 0
        ? Math.round((Number(r.total_ventas) / total_global) * 10000) / 100 : 0,
      posicion: i + 1,
    }));

    res.json({ success: true, data, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error getTopProductos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener top productos' });
  }
};

// GET /api/reportes/ventas/mensual
// Ventas totales por mes del año especificado (default: año actual).
export const getVentasMensual = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const anio = parseInt(String(req.query.anio || new Date().getFullYear()));
    if (isNaN(anio) || anio < 2020 || anio > 2100) {
      res.status(400).json({ success: false, message: 'Año inválido' }); return;
    }

    const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE_FORMAT(fechadeventa, '%Y-%m') AS mes,
         COALESCE(SUM(totaldeventa), 0) AS total,
         COUNT(*) AS tickets
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND YEAR(fechadeventa) = ?
       GROUP BY DATE_FORMAT(fechadeventa, '%Y-%m')
       ORDER BY mes ASC`,
      [idnegocio, anio]
    );

    // Rellenar todos los meses
    const dataMap = new Map<string, RowDataPacket>();
    for (const r of rows as RowDataPacket[]) dataMap.set(String(r.mes), r);

    const data = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0');
      const key = `${anio}-${m}`;
      const r = dataMap.get(key);
      const total = r ? Number(r.total) : 0;
      const tickets = r ? Number(r.tickets) : 0;
      return {
        mes: key,
        mes_nombre: `${MESES[i]} ${anio}`,
        total,
        tickets,
        ticket_promedio: tickets > 0 ? Math.round((total / tickets) * 100) / 100 : 0,
      };
    });

    res.json({ success: true, data, anio });
  } catch (error) {
    console.error('Error getVentasMensual:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ventas mensuales' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COLABORADORES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/reportes/colaboradores/ranking
// Ranking de ventas por colaborador (usuarioauditoria) en el rango.
export const getRankingColaboradores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(usuarioauditoria,'Desconocido') AS colaborador,
         COALESCE(SUM(totaldeventa), 0) AS total_ventas,
         COUNT(*) AS total_tickets,
         COALESCE(SUM(descuentos), 0) AS total_descuentos
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND DATE(fechadeventa) BETWEEN ? AND ?
       GROUP BY colaborador
       ORDER BY total_ventas DESC`,
      [idnegocio, startDate, endDate]
    );

    const data = (rows as RowDataPacket[]).map((r, i) => ({
      colaborador: r.colaborador,
      total_ventas: Number(r.total_ventas),
      total_tickets: Number(r.total_tickets),
      ticket_promedio: Number(r.total_tickets) > 0
        ? Math.round((Number(r.total_ventas) / Number(r.total_tickets)) * 100) / 100 : 0,
      total_descuentos: Number(r.total_descuentos),
      posicion: i + 1,
    }));

    res.json({ success: true, data, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error getRankingColaboradores:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ranking de colaboradores' });
  }
};

// GET /api/reportes/colaboradores/cumplimiento-meta
// Meta asignada (metaturno) vs venta real por turno/colaborador en el rango.
export const getCumplimientoMeta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         t.usuarioturno AS colaborador,
         t.claveturno,
         t.fechainicioturno AS fecha_turno,
         t.metaturno AS meta,
         t.logrometa AS logrometa_precalculado,
         COALESCE(SUM(v.totaldeventa), 0) AS venta_real
       FROM tblposcrumenwebturnos t
       LEFT JOIN tblposcrumenwebventas v
         ON v.claveturno = t.claveturno AND v.descripcionmov = 'VENTA'
            AND v.estadodeventa = 'COBRADO' AND v.estatusdepago = 'PAGADO'
       WHERE t.idnegocio = ? AND t.metaturno IS NOT NULL AND t.metaturno > 0
         AND DATE(t.fechainicioturno) BETWEEN ? AND ?
       GROUP BY t.idturno, t.usuarioturno, t.claveturno, t.fechainicioturno, t.metaturno, t.logrometa
       ORDER BY t.fechainicioturno DESC`,
      [idnegocio, startDate, endDate]
    );

    const data = (rows as RowDataPacket[]).map(r => {
      const meta = Number(r.meta);
      const venta_real = Number(r.venta_real);
      // Usar logrometa precalculado si existe, sino calcularlo en tiempo real
      const cumplimiento_pct = r.logrometa_precalculado
        ? Number(r.logrometa_precalculado)
        : (meta > 0 ? Math.round((venta_real / meta) * 10000) / 100 : 0);
      const semaforo: 'SUPERO' | 'CUMPLIO' | 'NO_CUMPLIO' =
        cumplimiento_pct >= 100 ? 'SUPERO' : cumplimiento_pct >= 90 ? 'CUMPLIO' : 'NO_CUMPLIO';
      return {
        colaborador: r.colaborador, claveturno: r.claveturno,
        fecha_turno: r.fecha_turno, meta, venta_real, cumplimiento_pct, semaforo,
      };
    });

    res.json({ success: true, data, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error getCumplimientoMeta:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cumplimiento de meta' });
  }
};

// GET /api/reportes/colaboradores/kpi
// KPI completo por colaborador: ventas, tickets, descuentos, devoluciones, turnos trabajados.
export const getKpiColaboradores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    if (!idnegocio) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }

    const { startDate, endDate } = resolveDateRange(req);

    // Ventas + descuentos por colaborador
    const [ventasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(usuarioauditoria,'Desconocido') AS colaborador,
         COALESCE(SUM(CASE WHEN estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO' THEN totaldeventa ELSE 0 END), 0) AS total_ventas,
         COUNT(CASE WHEN estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO' THEN 1 END) AS total_tickets,
         COALESCE(SUM(CASE WHEN estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO' THEN descuentos ELSE 0 END), 0) AS total_descuentos,
         COUNT(CASE WHEN estadodeventa = 'DEVUELTO' THEN 1 END) AS total_devoluciones,
         COALESCE(SUM(CASE WHEN estadodeventa = 'DEVUELTO' THEN totaldeventa ELSE 0 END), 0) AS monto_devoluciones
       FROM tblposcrumenwebventas
       WHERE idnegocio = ? AND descripcionmov = 'VENTA'
         AND DATE(fechadeventa) BETWEEN ? AND ?
       GROUP BY colaborador
       ORDER BY total_ventas DESC`,
      [idnegocio, startDate, endDate]
    );

    // Turnos trabajados por colaborador
    const [turnosRows] = await pool.execute<RowDataPacket[]>(
      `SELECT usuarioturno AS colaborador, COUNT(*) AS turnos_trabajados
       FROM tblposcrumenwebturnos
       WHERE idnegocio = ? AND DATE(fechainicioturno) BETWEEN ? AND ?
       GROUP BY usuarioturno`,
      [idnegocio, startDate, endDate]
    );
    const turnosMap = new Map<string, number>();
    for (const r of turnosRows as RowDataPacket[]) turnosMap.set(String(r.colaborador), Number(r.turnos_trabajados));

    const data = (ventasRows as RowDataPacket[]).map(r => ({
      colaborador: r.colaborador,
      total_ventas: Number(r.total_ventas),
      total_tickets: Number(r.total_tickets),
      ticket_promedio: Number(r.total_tickets) > 0
        ? Math.round((Number(r.total_ventas) / Number(r.total_tickets)) * 100) / 100 : 0,
      total_descuentos: Number(r.total_descuentos),
      total_devoluciones: Number(r.total_devoluciones),
      monto_devoluciones: Number(r.monto_devoluciones),
      turnos_trabajados: turnosMap.get(String(r.colaborador)) ?? 0,
    }));

    res.json({ success: true, data, periodo: { inicio: startDate, fin: endDate } });
  } catch (error) {
    console.error('Error getKpiColaboradores:', error);
    res.status(500).json({ success: false, message: 'Error al obtener KPI de colaboradores' });
  }
};
