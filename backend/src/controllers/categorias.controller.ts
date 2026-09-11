import { Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import { registrarCambioCatalogo } from '../services/catalogo.service';

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

// Helper function para obtener una categoría completa por ID
async function obtenerCategoriaCompleta(idCategoria: number, idnegocio?: number): Promise<Categoria | null> {
  const [rows] = await pool.query<Categoria[]>(
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
    WHERE idCategoria = ?${idnegocio !== undefined ? ' AND idnegocio = ?' : ''}`,
    idnegocio !== undefined ? [idCategoria, idnegocio] : [idCategoria]
  );
  return rows.length > 0 ? rows[0] : null;
}

// Obtener todas las categorías por negocio
export const obtenerCategorias = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({ mensaje: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

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
export const obtenerCategoriaPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Sólo registros del negocio del usuario: un id ajeno responde 404
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({ mensaje: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

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
      WHERE idCategoria = ? AND idnegocio = ?`,
      [id, idnegocio]
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
export const crearCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const {
      nombre,
      imagencategoria,
      descripcion,
      estatus,
      idmoderadordef,
      orden
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(400).json({ mensaje: 'El usuario no está autenticado' });
      return;
    }

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

    // Obtener la categoría completa creada
    const createdCategoria = await obtenerCategoriaCompleta(result.insertId);
    
    if (!createdCategoria) {
      await connection.rollback();
      res.status(500).json({ mensaje: 'Categoría creada pero no se pudo recuperar' });
      return;
    }

    // Versionar el catálogo para que las PWAs del negocio sincronicen el alta
    await registrarCambioCatalogo(idnegocio, {
      entidad: 'categoria',
      identidad: result.insertId,
      accion: 'CREATE'
    });

    res.status(201).json(createdCategoria);
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear categoría:', error);
    res.status(500).json({ mensaje: 'Error al crear categoría', error });
  } finally {
    connection.release();
  }
};

// Actualizar categoría
export const actualizarCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const {
      nombre,
      imagencategoria,
      descripcion,
      estatus,
      idmoderadordef,
      orden
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(400).json({ mensaje: 'El usuario no está autenticado' });
      return;
    }

    await connection.beginTransaction();

    // El filtro por idnegocio impide modificar categorías de otro negocio
    // aunque se envíe un idCategoria ajeno en la URL.
    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebcategorias 
      SET nombre = ?, 
          imagencategoria = ?, 
          descripcion = ?,
          estatus = ?,
          usuarioauditoria = ?,
          fechamodificacionauditoria = NOW(),
          idmoderadordef = ?,
          orden = ?
      WHERE idCategoria = ? AND idnegocio = ?`,
      [nombre, imagencategoria || '', descripcion, estatus, usuarioauditoria, 
       idmoderadordef, orden, id, idnegocio]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      res.status(404).json({ mensaje: 'Categoría no encontrada' });
      return;
    }

    await connection.commit();

    // Obtener la categoría completa actualizada
    const updatedCategoria = await obtenerCategoriaCompleta(Number(id), idnegocio);
    
    if (!updatedCategoria) {
      res.status(500).json({ mensaje: 'Categoría actualizada pero no se pudo recuperar' });
      return;
    }

    await registrarCambioCatalogo(idnegocio, {
      entidad: 'categoria',
      identidad: Number(id),
      accion: 'UPDATE'
    });

    res.status(200).json(updatedCategoria);
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error });
  } finally {
    connection.release();
  }
};

// Eliminar categoría (cambiar estatus a 0)
export const eliminarCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(400).json({ mensaje: 'El usuario no está autenticado' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebcategorias 
      SET estatus = 0, 
          fechamodificacionauditoria = NOW()
      WHERE idCategoria = ? AND idnegocio = ?`,
      [id, idnegocio]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ mensaje: 'Categoría no encontrada' });
      return;
    }

    // Baja lógica (estatus = 0): la fila sigue existiendo, por eso se propaga
    // como UPDATE y el cliente la conserva con estatus 0 en IndexedDB.
    await registrarCambioCatalogo(idnegocio, {
      entidad: 'categoria',
      identidad: Number(id),
      accion: 'UPDATE'
    });

    res.status(200).json({ mensaje: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error });
  }
};
