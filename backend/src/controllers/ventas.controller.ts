import type { Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Venta extends RowDataPacket {
  id: number;
  usuario_id: number;
  cliente_id: number | null;
  total: number;
  metodo_pago: string;
  fecha: Date;
  cliente_nombre?: string;
  usuario_nombre?: string;
  idnegocio?: number;
}

interface VentaItem {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export const getVentas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const [rows] = await pool.execute<Venta[]>(
      `SELECT v.*, 
              u.nombre as usuario_nombre,
              c.nombre as cliente_nombre
       FROM ventas v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       LEFT JOIN clientes c ON v.cliente_id = c.id
       WHERE v.idnegocio = ?
       ORDER BY v.fecha DESC
       LIMIT 100`,
      [idnegocio]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener ventas' 
    });
  }
};

export const getVentaById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const [ventaRows] = await pool.execute<Venta[]>(
      `SELECT v.*, 
              u.nombre as usuario_nombre,
              c.nombre as cliente_nombre
       FROM ventas v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       LEFT JOIN clientes c ON v.cliente_id = c.id
       WHERE v.id = ? AND v.idnegocio = ?`,
      [id, idnegocio]
    );

    if (ventaRows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Venta no encontrada' 
      });
      return;
    }

    // Obtener items de la venta
    const [itemsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT vi.*, p.nombre as producto_nombre
       FROM ventas_items vi
       JOIN productos p ON vi.producto_id = p.id
       WHERE vi.venta_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...ventaRows[0],
        items: itemsRows
      }
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener venta' 
    });
  }
};

export const createVenta = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { usuario_id, cliente_id, items, metodo_pago = 'efectivo' } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!usuario_id || !items || items.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Usuario e items son requeridos' 
      });
      return;
    }

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    await connection.beginTransaction();

    // Calcular total
    const total = items.reduce((sum: number, item: VentaItem) => sum + item.subtotal, 0);

    // Insertar venta
    const [ventaResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO ventas (usuario_id, cliente_id, total, metodo_pago, idnegocio) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, cliente_id || null, total, metodo_pago, idnegocio]
    );

    const ventaId = ventaResult.insertId;

    // Insertar items de la venta
    for (const item of items) {
      await connection.execute(
        'INSERT INTO ventas_items (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [ventaId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
      );

      // Actualizar inventario explícitamente (sin usar triggers de base de datos)
      await connection.execute(
        'UPDATE inventario SET cantidad = cantidad - ? WHERE producto_id = ? AND idnegocio = ?',
        [item.cantidad, item.producto_id, idnegocio]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: { id: ventaId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear venta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar venta' 
    });
  } finally {
    connection.release();
  }
};

export const getVentasDelDia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         COUNT(*) as total_ventas,
         SUM(total) as total_vendido,
         AVG(total) as promedio_venta
       FROM ventas
       WHERE DATE(fecha) = CURDATE() AND idnegocio = ?`,
      [idnegocio]
    );

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error al obtener ventas del día:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas' 
    });
  }
};
