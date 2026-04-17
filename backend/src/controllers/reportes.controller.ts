import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { pool } from '../config/db';
import type { RowDataPacket } from 'mysql2';

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
         AND dm.motivomovimiento NOT IN ('VENTA', 'CONSUMO')
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

    // Salidas: compras + gastos por día
    const [salidasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE(dm.fechamovimiento) AS fecha,
         COALESCE(SUM(dm.cantidad * dm.costo), 0) AS salidas
       FROM tblposcrumenwebdetallemovimientos dm
       WHERE dm.idnegocio = ?
         AND dm.tipomovimiento IN ('ENTRADA', 'SALIDA')
         AND dm.motivomovimiento IN ('COMPRA', 'MERMA', 'AJUSTE_MANUAL', 'CONSUMO')
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
