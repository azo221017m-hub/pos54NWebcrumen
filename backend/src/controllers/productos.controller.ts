import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Producto extends RowDataPacket {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  codigo_barras: string;
  categoria_id: number;
  categoria_nombre?: string;
  stock_actual?: number;
  activo: boolean;
}

export const getProductos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<Producto[]>(
      `SELECT p.*, c.nombre as categoria_nombre, i.cantidad as stock_actual
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       LEFT JOIN inventario i ON p.id = i.producto_id
       WHERE p.activo = 1
       ORDER BY p.nombre ASC`
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener productos' 
    });
  }
};

export const getProductoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute<Producto[]>(
      `SELECT p.*, c.nombre as categoria_nombre, i.cantidad as stock_actual
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       LEFT JOIN inventario i ON p.id = i.producto_id
       WHERE p.id = ? AND p.activo = 1`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener producto' 
    });
  }
};

export const createProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, precio, costo, codigo_barras, categoria_id } = req.body;

    if (!nombre || !precio || !categoria_id) {
      res.status(400).json({ 
        success: false, 
        message: 'Nombre, precio y categoría son requeridos' 
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO productos (nombre, descripcion, precio, costo, codigo_barras, categoria_id, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nombre, descripcion || null, precio, costo || 0, codigo_barras || null, categoria_id]
    );

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear producto' 
    });
  }
};

export const updateProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, costo, codigo_barras, categoria_id } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE productos 
       SET nombre = COALESCE(?, nombre),
           descripcion = COALESCE(?, descripcion),
           precio = COALESCE(?, precio),
           costo = COALESCE(?, costo),
           codigo_barras = COALESCE(?, codigo_barras),
           categoria_id = COALESCE(?, categoria_id)
       WHERE id = ? AND activo = 1`,
      [nombre, descripcion, precio, costo, codigo_barras, categoria_id, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar producto' 
    });
  }
};

export const deleteProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE productos SET activo = 0 WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar producto' 
    });
  }
};
