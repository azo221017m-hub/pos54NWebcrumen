// backend/src/controllers/categoriasController.ts
// Controlador para gestión de categorías de productos

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { ApiResponse, CreateCategoriaData } from '../types'; // Importa tipos personalizados

// Controlador para obtener todas las categorías
export const getCategoriasController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📂 Obteniendo todas las categorías'); // Log de inicio
    
    // Consulta SQL para obtener todas las categorías con todos los campos
    let categorias = await executeQuery(`
      SELECT 
        idCategoria, 
        nombre, 
        imagencategoria, 
        descripcion, 
        estatus, 
        fechaRegistroauditoria, 
        usuarioauditoria, 
        fechamodificacionauditoria, 
        idnegocio
      FROM tblposcrumenwebcategorias 
      ORDER BY nombre ASC
    `, []);

    // Convertir imagencategoria Buffer a base64 string si existe y evitar doble codificación
    categorias = categorias.map((cat: any) => {
      if (cat.imagencategoria) {
        if (Buffer.isBuffer(cat.imagencategoria)) {
          cat.imagencategoria = cat.imagencategoria.toString('base64');
        } else if (typeof cat.imagencategoria === 'string' && cat.imagencategoria.startsWith('data:image/')) {
          // Ya es una imagen válida, no modificar
        } else if (typeof cat.imagencategoria === 'object') {
          // Si es un objeto tipo JSON, ignora o corrige
          cat.imagencategoria = null;
        }
      }
      return cat;
    });

    console.log(`✅ ${categorias.length} categorías encontradas`); // Log de éxito

    res.status(200).json({
      success: true,
      message: `${categorias.length} categorías encontradas`,
      data: categorias
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para obtener categorías para dropdown (id y nombre solamente)
export const getCategoriasDropdownController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Obteniendo categorías para dropdown'); // Log de inicio
    
    // Consulta SQL para obtener solo id y nombre de categorías activas
    const categorias = await executeQuery(`
      SELECT idCategoria, nombre 
      FROM tblposcrumenwebcategorias 
      WHERE estatus = 1 
      ORDER BY nombre ASC
    `, []);

    console.log(`✅ ${categorias.length} categorías activas encontradas`); // Log de éxito

    res.status(200).json({
      success: true,
      message: 'Categorías para dropdown obtenidas',
      data: categorias
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo categorías para dropdown:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías para dropdown',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear una nueva categoría
export const createCategoriaController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📂 Creando nueva categoría'); // Log de inicio
    const { 
      nombre, 
      descripcion, 
      estatus = 1, 
      usuarioauditoria = 'system', 
      idnegocio = 1 
    } = req.body;

    // Procesar imagen si se subió archivo
    let imagenCategoriaFinal: string | null = null;
    if (req.file) {
      // Guardar ruta relativa del archivo
      imagenCategoriaFinal = `/uploads/categorias/${req.file.filename}`;
    } else if (req.body.imagencategoria) {
      imagenCategoriaFinal = req.body.imagencategoria;
    }

    // Validación de datos requeridos
    if (!nombre) {
      res.status(400).json({
        success: false,
        message: 'Nombre es requerido',
        error: 'VALIDATION_ERROR'
      } as ApiResponse);
      return;
    }

    // Verificar si ya existe una categoría con el mismo nombre
    console.log('🔍 Verificando si ya existe categoría con nombre:', nombre); // Log de verificación
    const existingCategoria = await executeQuery(`
      SELECT idCategoria FROM tblposcrumenwebcategorias WHERE nombre = ?
    `, [nombre]);

    if (existingCategoria.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre',
        error: 'CATEGORIA_EXISTS'
      } as ApiResponse);
      return;
    }

    // Insertar nueva categoría
    const result = await executeQuery(`
      INSERT INTO tblposcrumenwebcategorias 
      (nombre, imagencategoria, descripcion, estatus, fechaRegistroauditoria, usuarioauditoria, fechamodificacionauditoria, idnegocio)
      VALUES (?, ?, ?, ?, NOW(), ?, NOW(), ?)
    `, [nombre, imagenCategoriaFinal, descripcion, estatus, usuarioauditoria, idnegocio]);

    console.log('✅ Categoría creada exitosamente'); // Log de éxito

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { idCategoria: (result as any).insertId }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando categoría:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando categoría',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar una categoría existente
export const updateCategoriaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      imagencategoria, 
      descripcion, 
      estatus, 
      usuarioauditoria = 'system' 
    } = req.body;

    // Validación de ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de categoría inválido',
        error: 'VALIDATION_ERROR'
      } as ApiResponse);
      return;
    }

    // Verificar si la categoría existe
    const existingCategoria = await executeQuery(`
      SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ?
    `, [id]);

    if (existingCategoria.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
        error: 'CATEGORIA_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Verificar si ya existe otra categoría con el mismo nombre
    if (nombre) {
      const duplicateCategoria = await executeQuery(`
        SELECT idCategoria FROM tblposcrumenwebcategorias 
        WHERE nombre = ? AND idCategoria != ?
      `, [nombre, id]);

      if (duplicateCategoria.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Ya existe otra categoría con ese nombre',
          error: 'CATEGORIA_EXISTS'
        } as ApiResponse);
        return;
      }
    }

    // Construir consulta de actualización dinámica
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (nombre) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }
    if (imagencategoria !== undefined) {
      updateFields.push('imagencategoria = ?');
      updateValues.push(imagencategoria);
    }
    if (descripcion) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }
    if (estatus !== undefined) {
      updateFields.push('estatus = ?');
      updateValues.push(estatus);
    }
    
    updateFields.push('fechamodificacionauditoria = NOW()');
    updateFields.push('usuarioauditoria = ?');
    updateValues.push(usuarioauditoria, id);

    // Ejecutar actualización
    await executeQuery(`
      UPDATE tblposcrumenwebcategorias 
      SET ${updateFields.join(', ')}
      WHERE idCategoria = ?
    `, updateValues);

    console.log('✅ Categoría actualizada exitosamente'); // Log de éxito

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { idCategoria: Number(id) }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error actualizando categoría:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error actualizando categoría',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para eliminar (desactivar) una categoría
export const deleteCategoriaController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📂 Desactivando categoría'); // Log de inicio
    const { id } = req.params;
    const { usuario = 'system' } = req.body;

    // Validación de ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de categoría inválido',
        error: 'VALIDATION_ERROR'
      } as ApiResponse);
      return;
    }

    // Verificar si la categoría existe
    const existingCategoria = await executeQuery(`
      SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ?
    `, [id]);

    if (existingCategoria.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
        error: 'CATEGORIA_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Verificar si hay productos asociados a esta categoría
    const productosAsociados = await executeQuery(`
      SELECT idProducto FROM tblposcrumenwebproductos 
      WHERE idCategoria = ? AND estatus = 1
    `, [id]);

    if (productosAsociados.length > 0) {
      res.status(409).json({
        success: false,
        message: `No se puede eliminar la categoría. Tiene ${productosAsociados.length} productos asociados`,
        error: 'CATEGORIA_HAS_PRODUCTS'
      } as ApiResponse);
      return;
    }

    // Desactivar categoría (cambiar estatus a 0)
    await executeQuery(`
      UPDATE tblposcrumenwebcategorias 
      SET estatus = 0, fechaActualizacion = NOW(), usuario = ?
      WHERE idCategoria = ?
    `, [usuario, id]);

    console.log('✅ Categoría desactivada exitosamente'); // Log de éxito

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      data: { idCategoria: Number(id) }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error eliminando categoría:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error eliminando categoría',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};