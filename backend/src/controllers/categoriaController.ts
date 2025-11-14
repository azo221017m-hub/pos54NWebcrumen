// Controlador base para categorías
import { Request, Response } from 'express';
import pool from '../config/database';
import path from 'path';

// CREATE
export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, estatus, usuarioauditoria, idnegocio } = req.body;
    if (!nombre || !usuarioauditoria || !idnegocio) {
      return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes.' });
    }
    let imagencategoria = null;
    if (req.file) {
      imagencategoria = `/uploads/${req.file.filename}`;
    }
    const fechaRegistroauditoria = new Date();
    const fechamodificacionauditoria = new Date();
    const [result] = await pool.execute(
      `INSERT INTO tblposcrumenwebcategorias (nombre, imagencategoria, descripcion, estatus, fechaRegistroauditoria, usuarioauditoria, fechamodificacionauditoria, idnegocio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, imagencategoria, descripcion, estatus, fechaRegistroauditoria, usuarioauditoria, fechamodificacionauditoria, idnegocio]
    );
    res.json({ success: true, message: 'Categoría creada', data: { idCategoria: (result as any).insertId, imagencategoria } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear categoría', error });
  }
};

// READ (GET ALL)
export const getCategorias = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tblposcrumenwebcategorias');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener categorías', error });
  }
};

// UPDATE
export const updateCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estatus, usuarioauditoria, idnegocio } = req.body;
    let imagencategoria = null;
    if (req.file) {
      imagencategoria = `/uploads/${req.file.filename}`;
    }
    const fechamodificacionauditoria = new Date();
    // Construir query dinámico para actualizar solo campos enviados
    let query = 'UPDATE tblposcrumenwebcategorias SET ';
    const fields = [];
    const values = [];
    if (nombre) { fields.push('nombre = ?'); values.push(nombre); }
    if (descripcion) { fields.push('descripcion = ?'); values.push(descripcion); }
    if (typeof estatus !== 'undefined') { fields.push('estatus = ?'); values.push(estatus); }
    if (usuarioauditoria) { fields.push('usuarioauditoria = ?'); values.push(usuarioauditoria); }
    if (idnegocio) { fields.push('idnegocio = ?'); values.push(idnegocio); }
    if (imagencategoria) { fields.push('imagencategoria = ?'); values.push(imagencategoria); }
    fields.push('fechamodificacionauditoria = ?'); values.push(fechamodificacionauditoria);
    query += fields.join(', ') + ' WHERE idCategoria = ?';
    values.push(id);
    const [result] = await pool.execute(query, values);
    res.json({ success: true, message: 'Categoría actualizada', data: { idCategoria: id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar categoría', error });
  }
};
