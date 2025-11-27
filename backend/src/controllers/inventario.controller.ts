import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Inventario extends RowDataPacket {
  id: number;
  producto_id: number;
  cantidad: number;
  stock_minimo: number;
  ultima_actualizacion: Date;
  producto_nombre?: string;
  producto_precio?: number;
}

export const getInventario = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<Inventario[]>(
      `SELECT i.*, p.nombre as producto_nombre, p.precio as producto_precio
       FROM inventario i
       JOIN productos p ON i.producto_id = p.id
       WHERE p.activo = 1
       ORDER BY p.nombre ASC`
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener inventario' 
    });
  }
};

export const getInventarioByProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { producto_id } = req.params;

    const [rows] = await pool.execute<Inventario[]>(
      `SELECT i.*, p.nombre as producto_nombre, p.precio as producto_precio
       FROM inventario i
       JOIN productos p ON i.producto_id = p.id
       WHERE i.producto_id = ?`,
      [producto_id]
    );

    if (rows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Inventario no encontrado para este producto' 
      });
      return;
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener inventario' 
    });
  }
};

export const getProductosBajoStock = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<Inventario[]>(
      `SELECT i.*, p.nombre as producto_nombre, p.precio as producto_precio
       FROM inventario i
       JOIN productos p ON i.producto_id = p.id
       WHERE i.cantidad <= i.stock_minimo AND p.activo = 1
       ORDER BY i.cantidad ASC`
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener productos bajo stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener productos bajo stock' 
    });
  }
};

export const actualizarInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { producto_id } = req.params;
    const { cantidad, stock_minimo } = req.body;

    if (cantidad === undefined && stock_minimo === undefined) {
      res.status(400).json({ 
        success: false, 
        message: 'Debe proporcionar cantidad o stock_minimo' 
      });
      return;
    }

    // Verificar si existe el registro de inventario
    const [existing] = await pool.execute<Inventario[]>(
      'SELECT id FROM inventario WHERE producto_id = ?',
      [producto_id]
    );

    if (existing.length === 0) {
      // Crear nuevo registro de inventario
      await pool.execute<ResultSetHeader>(
        'INSERT INTO inventario (producto_id, cantidad, stock_minimo) VALUES (?, ?, ?)',
        [producto_id, cantidad || 0, stock_minimo || 10]
      );
    } else {
      // Actualizar registro existente
      const updates: string[] = [];
      const values: unknown[] = [];

      if (cantidad !== undefined) {
        updates.push('cantidad = ?');
        values.push(cantidad);
      }

      if (stock_minimo !== undefined) {
        updates.push('stock_minimo = ?');
        values.push(stock_minimo);
      }

      values.push(producto_id);

      await pool.execute<ResultSetHeader>(
        `UPDATE inventario SET ${updates.join(', ')} WHERE producto_id = ?`,
        values
      );
    }

    res.json({
      success: true,
      message: 'Inventario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar inventario' 
    });
  }
};

export const ajustarStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { producto_id } = req.params;
    const { cantidad, tipo } = req.body; // tipo: 'suma' o 'resta'

    if (!cantidad || !tipo) {
      res.status(400).json({ 
        success: false, 
        message: 'Cantidad y tipo son requeridos' 
      });
      return;
    }

    if (tipo !== 'suma' && tipo !== 'resta') {
      res.status(400).json({ 
        success: false, 
        message: 'Tipo debe ser "suma" o "resta"' 
      });
      return;
    }

    const operador = tipo === 'suma' ? '+' : '-';

    await pool.execute<ResultSetHeader>(
      `UPDATE inventario 
       SET cantidad = cantidad ${operador} ?
       WHERE producto_id = ?`,
      [cantidad, producto_id]
    );

    res.json({
      success: true,
      message: 'Stock ajustado exitosamente'
    });
  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al ajustar stock' 
    });
  }
};
