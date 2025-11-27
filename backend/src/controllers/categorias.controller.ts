import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Categoria extends RowDataPacket {
  idCategoria: number;
  nombre: string;
  imagencategoria: Buffer | string;
  descripcion: string;
  estatus: number;
  fechaRegistroauditoria: Date;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date;
  idnegocio: number;
  idmoderadordef: number;
  orden: number;
}

// Obtener todas las categorías por negocio
export const obtenerCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;

    const [categorias] = await pool.query<Categoria[]>(
      `SELECT 
        idCategoria,
        nombre,
        CAST(imagencategoria AS CHAR) as imagencategoria,
        descripcion,
        estatus,
        fechaRegistroauditoria,
        usuarioauditoria,
        fechamodificacionauditoria,
        idnegocio,
        idmoderadordef,
        orden
      FROM tblposcrumenwebcategorias 
      WHERE idnegocio = ?
      ORDER BY orden ASC, nombre ASC`,
      [idnegocio]
    );

    res.status(200).json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ mensaje: 'Error al obtener categorías', error });
  }
};

// Obtener una categoría por ID
export const obtenerCategoriaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [categorias] = await pool.query<Categoria[]>(
      `SELECT 
        idCategoria,
        nombre,
        CAST(imagencategoria AS CHAR) as imagencategoria,
        descripcion,
        estatus,
        fechaRegistroauditoria,
        usuarioauditoria,
        fechamodificacionauditoria,
        idnegocio,
        idmoderadordef,
        orden
      FROM tblposcrumenwebcategorias 
      WHERE idCategoria = ?`,
      [id]
    );

    if (categorias.length === 0) {
      res.status(404).json({ mensaje: 'Categoría no encontrada' });
      return;
    }

    res.status(200).json(categorias[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ mensaje: 'Error al obtener categoría', error });
  }
};

// Crear nueva categoría
export const crearCategoria = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const {
      nombre,
      imagencategoria,
      descripcion,
      estatus,
      usuarioauditoria,
      idnegocio,
      idmoderadordef,
      orden
    } = req.body;

    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebcategorias
      (nombre, imagencategoria, descripcion, estatus, fechaRegistroauditoria, 
       usuarioauditoria, fechamodificacionauditoria, idnegocio, idmoderadordef, orden)
      VALUES (?, ?, ?, ?, NOW(), ?, NOW(), ?, ?, ?)`,
      [nombre, imagencategoria || '', descripcion, estatus, usuarioauditoria, 
       idnegocio, idmoderadordef, orden]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Categoría creada exitosamente',
      idCategoria: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear categoría:', error);
    res.status(500).json({ mensaje: 'Error al crear categoría', error });
  } finally {
    connection.release();
  }
};

// Actualizar categoría
export const actualizarCategoria = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const {
      nombre,
      imagencategoria,
      descripcion,
      estatus,
      usuarioauditoria,
      idmoderadordef,
      orden
    } = req.body;

    await connection.beginTransaction();

    await connection.query(
      `UPDATE tblposcrumenwebcategorias 
      SET nombre = ?, 
          imagencategoria = ?, 
          descripcion = ?,
          estatus = ?,
          usuarioauditoria = ?,
          fechamodificacionauditoria = NOW(),
          idmoderadordef = ?,
          orden = ?
      WHERE idCategoria = ?`,
      [nombre, imagencategoria || '', descripcion, estatus, usuarioauditoria, 
       idmoderadordef, orden, id]
    );

    await connection.commit();

    res.status(200).json({ mensaje: 'Categoría actualizada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error });
  } finally {
    connection.release();
  }
};

// Eliminar categoría (cambiar estatus a 0)
export const eliminarCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE tblposcrumenwebcategorias 
      SET estatus = 0, 
          fechamodificacionauditoria = NOW()
      WHERE idCategoria = ?`,
      [id]
    );

    res.status(200).json({ mensaje: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error });
  }
};
