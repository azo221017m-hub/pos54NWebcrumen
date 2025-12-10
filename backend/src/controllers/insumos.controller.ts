import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Insumo extends RowDataPacket {
  id_insumo: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  costo_promedio_ponderado: number;
  precio_venta: number;
  idinocuidad: string | null;
  id_cuentacontable: string | null;
  nombrecuentacontable?: string | null; // Nombre de la cuenta contable (JOIN)
  activo: number;
  inventariable: number;
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fechamodificacionauditoria: Date | null;
  idnegocio: number;
  idproveedor: number | null;
}

// Obtener todos los insumos por negocio
export const obtenerInsumos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
    const [rows] = await pool.query<Insumo[]>(
      `SELECT 
        i.id_insumo,
        i.nombre,
        i.unidad_medida,
        i.stock_actual,
        i.stock_minimo,
        i.costo_promedio_ponderado,
        i.precio_venta,
        i.idinocuidad,
        i.id_cuentacontable,
        cc.nombrecuentacontable,
        i.activo,
        i.inventariable,
        i.fechaRegistroauditoria,
        i.usuarioauditoria,
        i.fechamodificacionauditoria,
        i.idnegocio,
        i.idproveedor
      FROM tblposcrumenwebinsumos i
      LEFT JOIN tblposcrumenwebcuentacontable cc ON i.id_cuentacontable = cc.id_cuentacontable
      WHERE i.idnegocio = ?
      ORDER BY i.nombre ASC`,
      [idnegocio]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener insumos:', error);
    res.status(500).json({ 
      message: 'Error al obtener insumos', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener un insumo por ID
export const obtenerInsumoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_insumo } = req.params;
    
    const [rows] = await pool.query<Insumo[]>(
      `SELECT 
        i.id_insumo,
        i.nombre,
        i.unidad_medida,
        i.stock_actual,
        i.stock_minimo,
        i.costo_promedio_ponderado,
        i.precio_venta,
        i.idinocuidad,
        i.id_cuentacontable,
        cc.nombrecuentacontable,
        i.activo,
        i.inventariable,
        i.fechaRegistroauditoria,
        i.usuarioauditoria,
        i.fechamodificacionauditoria,
        i.idnegocio,
        i.idproveedor
      FROM tblposcrumenwebinsumos i
      LEFT JOIN tblposcrumenwebcuentacontable cc ON i.id_cuentacontable = cc.id_cuentacontable
      WHERE i.id_insumo = ?`,
      [id_insumo]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Insumo no encontrado' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener insumo:', error);
    res.status(500).json({ 
      message: 'Error al obtener insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nuevo insumo
export const crearInsumo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_promedio_ponderado,
      precio_venta,
      idinocuidad,
      id_cuentacontable,
      activo,
      inventariable,
      usuarioauditoria,
      idproveedor
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    // Validar campos requeridos
    if (!nombre || !unidad_medida || stock_actual === undefined || 
        stock_minimo === undefined || costo_promedio_ponderado === undefined || 
        precio_venta === undefined || activo === undefined || 
        inventariable === undefined || !idnegocio) {
      res.status(400).json({ message: 'Faltan campos requeridos o el usuario no está autenticado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebinsumos (
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        idinocuidad,
        id_cuentacontable,
        activo,
        inventariable,
        fechaRegistroauditoria,
        usuarioauditoria,
        idnegocio,
        idproveedor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        idinocuidad || null,
        id_cuentacontable || null,
        activo,
        inventariable,
        usuarioauditoria || null,
        idnegocio,
        idproveedor || null
      ]
    );

    res.status(201).json({ 
      message: 'Insumo creado exitosamente', 
      id_insumo: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear insumo:', error);
    res.status(500).json({ 
      message: 'Error al crear insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar insumo
export const actualizarInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_insumo } = req.params;
    const {
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_promedio_ponderado,
      precio_venta,
      idinocuidad,
      id_cuentacontable,
      activo,
      inventariable,
      usuarioauditoria,
      idproveedor
    } = req.body;

    // Verificar si existe el insumo
    const [exist] = await pool.query<RowDataPacket[]>(
      'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [id_insumo]
    );
    
    if (exist.length === 0) {
      res.status(404).json({ message: 'Insumo no encontrado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebinsumos SET
        nombre = ?,
        unidad_medida = ?,
        stock_actual = ?,
        stock_minimo = ?,
        costo_promedio_ponderado = ?,
        precio_venta = ?,
        idinocuidad = ?,
        id_cuentacontable = ?,
        activo = ?,
        inventariable = ?,
        fechamodificacionauditoria = NOW(),
        usuarioauditoria = ?,
        idproveedor = ?
      WHERE id_insumo = ?`,
      [
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        idinocuidad || null,
        id_cuentacontable || null,
        activo,
        inventariable,
        usuarioauditoria || null,
        idproveedor || null,
        id_insumo
      ]
    );

    if (result.affectedRows === 0) {
      res.status(500).json({ message: 'No se pudo actualizar el insumo' });
      return;
    }

    res.json({ message: 'Insumo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar insumo:', error);
    res.status(500).json({ 
      message: 'Error al actualizar insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar insumo
export const eliminarInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_insumo } = req.params;
    
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [id_insumo]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Insumo no encontrado' });
      return;
    }
    
    res.json({ message: 'Insumo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar insumo:', error);
    res.status(500).json({ 
      message: 'Error al eliminar insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
