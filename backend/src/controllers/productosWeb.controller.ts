import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface ProductoWeb extends RowDataPacket {
  idProducto: number;
  idCategoria: number;
  nombreCategoria?: string;
  idreferencia: number | null;
  nombre: string;
  descripcion: string;
  precio: number;
  estatus: number;
  imagenProducto: Buffer | string | null;
  tipoproducto: string;
  costoproducto: number;
  fechaRegistroauditoria: Date;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date;
  idnegocio: number;
  nombreReceta?: string;
  costoReceta?: number;
  nombreInsumo?: string;
  costoInsumo?: number;
}

// Obtener todos los productos web por negocio
export const obtenerProductosWeb = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ mensaje: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    const [rows] = await pool.query<ProductoWeb[]>(
      `SELECT 
        p.idProducto,
        p.idCategoria,
        c.nombre AS nombreCategoria,
        p.idreferencia,
        p.nombre,
        p.descripcion,
        p.precio,
        p.estatus,
        TO_BASE64(p.imagenProducto) AS imagenProducto,
        p.tipoproducto,
        p.costoproducto,
        p.fechaRegistroauditoria,
        p.usuarioauditoria,
        p.fehamodificacionauditoria,
        p.idnegocio,
        CASE 
          WHEN p.tipoproducto = 'Receta' THEN r.nombreReceta
          ELSE NULL
        END AS nombreReceta,
        CASE 
          WHEN p.tipoproducto = 'Receta' THEN r.costoReceta
          ELSE NULL
        END AS costoReceta,
        CASE 
          WHEN p.tipoproducto = 'Inventario' THEN i.nombre
          ELSE NULL
        END AS nombreInsumo,
        CASE 
          WHEN p.tipoproducto = 'Inventario' THEN i.costo_promedio_ponderado
          ELSE NULL
        END AS costoInsumo
      FROM tblposcrumenwebproductos p
      LEFT JOIN tblposcrumenwebcategorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN tblposcrumenwebrecetas r ON p.tipoproducto = 'Receta' AND p.idreferencia = r.idReceta
      LEFT JOIN tblposcrumenwebinsumos i ON p.tipoproducto = 'Inventario' AND p.idreferencia = i.id_insumo
      WHERE p.idnegocio = ?
      ORDER BY p.nombre ASC`,
      [idnegocio]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener productos web:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener productos web', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener un producto web por ID
export const obtenerProductoWebPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<ProductoWeb[]>(
      `SELECT 
        p.idProducto,
        p.idCategoria,
        c.nombre AS nombreCategoria,
        p.idreferencia,
        p.nombre,
        p.descripcion,
        p.precio,
        p.estatus,
        TO_BASE64(p.imagenProducto) AS imagenProducto,
        p.tipoproducto,
        p.costoproducto,
        p.fechaRegistroauditoria,
        p.usuarioauditoria,
        p.fehamodificacionauditoria,
        p.idnegocio,
        CASE 
          WHEN p.tipoproducto = 'Receta' THEN r.nombreReceta
          ELSE NULL
        END AS nombreReceta,
        CASE 
          WHEN p.tipoproducto = 'Receta' THEN r.costoReceta
          ELSE NULL
        END AS costoReceta,
        CASE 
          WHEN p.tipoproducto = 'Inventario' THEN i.nombre
          ELSE NULL
        END AS nombreInsumo,
        CASE 
          WHEN p.tipoproducto = 'Inventario' THEN i.costo_promedio_ponderado
          ELSE NULL
        END AS costoInsumo
      FROM tblposcrumenwebproductos p
      LEFT JOIN tblposcrumenwebcategorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN tblposcrumenwebrecetas r ON p.tipoproducto = 'Receta' AND p.idreferencia = r.idReceta
      LEFT JOIN tblposcrumenwebinsumos i ON p.tipoproducto = 'Inventario' AND p.idreferencia = i.id_insumo
      WHERE p.idProducto = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ mensaje: 'Producto web no encontrado' });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener producto web:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener producto web', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Verificar si existe un producto con el mismo nombre
export const verificarNombreProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, idnegocio, idProducto } = req.query;

    let query = `SELECT COUNT(*) as count FROM tblposcrumenwebproductos WHERE nombre = ? AND idnegocio = ?`;
    const params: (string | number)[] = [nombre as string, Number(idnegocio)];

    // Si se proporciona idProducto, excluirlo de la verificación (para actualización)
    if (idProducto) {
      query += ` AND idProducto != ?`;
      params.push(Number(idProducto));
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    const existe = rows[0].count > 0;

    res.status(200).json({ existe });
  } catch (error) {
    console.error('Error al verificar nombre de producto:', error);
    res.status(500).json({ 
      mensaje: 'Error al verificar nombre de producto', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nuevo producto web
export const crearProductoWeb = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      idCategoria,
      idreferencia,
      nombre,
      descripcion,
      precio,
      estatus,
      imagenProducto,
      tipoproducto,
      costoproducto
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    // Validar campos requeridos
    if (!nombre || !idCategoria || precio === undefined || !tipoproducto || !idnegocio || !usuarioauditoria) {
      res.status(400).json({ mensaje: 'Faltan campos requeridos o el usuario no está autenticado' });
      return;
    }

    // Verificar si ya existe un producto con el mismo nombre
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM tblposcrumenwebproductos WHERE nombre = ? AND idnegocio = ?`,
      [nombre, idnegocio]
    );

    if (existing[0].count > 0) {
      res.status(400).json({ mensaje: 'Ya existe un producto con el mismo nombre' });
      return;
    }

    // Convertir imagen base64 a buffer si existe
    const imagenBuffer = imagenProducto ? Buffer.from(imagenProducto, 'base64') : null;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebproductos (
        idCategoria,
        idreferencia,
        nombre,
        descripcion,
        precio,
        estatus,
        imagenProducto,
        tipoproducto,
        costoproducto,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?)`,
      [
        idCategoria,
        idreferencia || null,
        nombre,
        descripcion || '',
        precio,
        estatus,
        imagenBuffer,
        tipoproducto,
        costoproducto || 0,
        usuarioauditoria,
        idnegocio
      ]
    );

    res.status(201).json({
      mensaje: 'Producto web creado exitosamente',
      idProducto: result.insertId
    });
  } catch (error) {
    console.error('Error al crear producto web:', error);
    res.status(500).json({ 
      mensaje: 'Error al crear producto web', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar producto web
export const actualizarProductoWeb = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      idCategoria,
      idreferencia,
      nombre,
      descripcion,
      precio,
      estatus,
      imagenProducto,
      tipoproducto,
      costoproducto,
      usuarioauditoria
    } = req.body;

    // Verificar si existe el producto
    const [exist] = await pool.query<RowDataPacket[]>(
      'SELECT idProducto FROM tblposcrumenwebproductos WHERE idProducto = ?',
      [id]
    );

    if (exist.length === 0) {
      res.status(404).json({ mensaje: 'Producto web no encontrado' });
      return;
    }

    // Verificar si ya existe otro producto con el mismo nombre
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM tblposcrumenwebproductos WHERE nombre = ? AND idProducto != ? AND idnegocio = (SELECT idnegocio FROM tblposcrumenwebproductos WHERE idProducto = ?)`,
      [nombre, id, id]
    );

    if (existing[0].count > 0) {
      res.status(400).json({ mensaje: 'Ya existe otro producto con el mismo nombre' });
      return;
    }

    // Convertir imagen base64 a buffer si existe y no es null
    let imagenBuffer = undefined;
    if (imagenProducto !== undefined) {
      imagenBuffer = imagenProducto ? Buffer.from(imagenProducto, 'base64') : null;
    }

    // Construir query de actualización dinámicamente
    let updateQuery = `UPDATE tblposcrumenwebproductos SET
      idCategoria = ?,
      idreferencia = ?,
      nombre = ?,
      descripcion = ?,
      precio = ?,
      estatus = ?,
      tipoproducto = ?,
      costoproducto = ?,
      usuarioauditoria = ?,
      fehamodificacionauditoria = NOW()`;

    const params: (string | number | Buffer | null)[] = [
      idCategoria,
      idreferencia || null,
      nombre,
      descripcion || '',
      precio,
      estatus,
      tipoproducto,
      costoproducto || 0,
      usuarioauditoria || null
    ];

    // Solo actualizar imagen si se proporcionó
    if (imagenBuffer !== undefined) {
      updateQuery += `, imagenProducto = ?`;
      params.push(imagenBuffer);
    }

    updateQuery += ` WHERE idProducto = ?`;
    params.push(Number(id));

    const [result] = await pool.query<ResultSetHeader>(updateQuery, params);

    if (result.affectedRows === 0) {
      res.status(500).json({ mensaje: 'No se pudo actualizar el producto web' });
      return;
    }

    res.status(200).json({ mensaje: 'Producto web actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto web:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar producto web', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar producto web (soft delete)
export const eliminarProductoWeb = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE tblposcrumenwebproductos SET estatus = 0 WHERE idProducto = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ mensaje: 'Producto web no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Producto web eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto web:', error);
    res.status(500).json({ 
      mensaje: 'Error al eliminar producto web', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
