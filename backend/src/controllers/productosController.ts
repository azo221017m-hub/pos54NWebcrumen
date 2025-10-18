// backend/src/controllers/productosController.ts
// Controlador para gestión de productos

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { ApiResponse, CreateProductoData } from '../types'; // Importa tipos personalizados

// Extender Request para incluir el file de multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Controlador para obtener todos los productos
export const getProductosController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📦 Obteniendo todos los productos'); // Log de inicio
    
    // Consulta SQL para obtener productos con información de categoría
    const productos = await executeQuery(`
      SELECT 
        p.idProducto, p.idCategoria, p.idReceta, p.nombre, p.descripcion, 
        p.precio, p.existencia, p.estatus, p.fechaRegistro, p.fechaActualizacion, 
        p.usuario, p.idNegocio,
        c.nombre as nombreCategoria
      FROM tblposcrumenwebproductos p
      LEFT JOIN tblposcrumenwebcategorias c ON p.idCategoria = c.idCategoria
      WHERE p.estatus = 1
      ORDER BY p.fechaRegistro DESC
    `, []);

    console.log(`✅ ${productos.length} productos encontrados`); // Log de éxito

    res.status(200).json({
      success: true,
      message: `${productos.length} productos encontrados`,
      data: productos
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo productos:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para obtener productos por negocio
export const getProductosByNegocioController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idNegocio } = req.params;
    console.log(`📦 Obteniendo productos del negocio: ${idNegocio}`); // Log de inicio
    
    // Consulta SQL para obtener productos de un negocio específico
    const productos = await executeQuery(`
      SELECT 
        p.idProducto, p.idCategoria, p.idReceta, p.nombre, p.descripcion, 
        p.precio, p.existencia, p.estatus, p.fechaRegistro, p.fechaActualizacion, 
        p.usuario, p.idNegocio,
        c.nombre as nombreCategoria
      FROM tblposcrumenwebproductos p
      LEFT JOIN tblposcrumenwebcategorias c ON p.idCategoria = c.idCategoria
      WHERE p.idNegocio = ? AND p.estatus = 1
      ORDER BY p.fechaRegistro DESC
    `, [idNegocio]);

    console.log(`✅ ${productos.length} productos encontrados para el negocio ${idNegocio}`); // Log de éxito

    res.status(200).json({
      success: true,
      message: `${productos.length} productos encontrados`,
      data: productos
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo productos por negocio:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para obtener imagen de un producto
export const getProductoImagenController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`🖼️ Obteniendo imagen del producto: ${id}`); // Log de inicio
    
    // Consulta SQL para obtener solo la imagen del producto
    const resultado = await executeQuery(`
      SELECT imagenProducto FROM tblposcrumenwebproductos WHERE idProducto = ?
    `, [id]);

    if (resultado.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        error: 'PRODUCTO_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    const imagenProducto = resultado[0].imagenProducto;
    
    if (!imagenProducto) {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada para este producto',
        error: 'IMAGE_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Establecer headers para imagen
    res.setHeader('Content-Type', 'image/jpeg'); // Asumiendo que las imágenes son JPEG
    res.setHeader('Content-Length', imagenProducto.length);
    
    // Enviar la imagen como buffer
    res.send(imagenProducto);

  } catch (error) {
    console.error('❌ Error obteniendo imagen del producto:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo imagen del producto',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear un nuevo producto
export const createProductoController = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    console.log('📦 Creando nuevo producto'); // Log de inicio
    const { 
      idCategoria, 
      idReceta, 
      nombre, 
      descripcion, 
      precio, 
      existencia, 
      estatus = 1, 
      usuario = 'system', 
      idNegocio 
    }: CreateProductoData = req.body;

    // Validación de datos requeridos
    if (!idCategoria || !nombre || !descripcion || precio === undefined || existencia === undefined || !idNegocio) {
      res.status(400).json({
        success: false,
        message: 'Categoría, nombre, descripción, precio, existencia e ID del negocio son requeridos',
        error: 'VALIDATION_ERROR'
      } as ApiResponse);
      return;
    }

    // Verificar si ya existe un producto con el mismo nombre en el mismo negocio
    console.log('🔍 Verificando si ya existe producto con nombre:', nombre); // Log de verificación
    const existingProducto = await executeQuery(`
      SELECT idProducto FROM tblposcrumenwebproductos 
      WHERE nombre = ? AND idNegocio = ?
    `, [nombre, idNegocio]);

    if (existingProducto.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un producto con ese nombre en este negocio',
        error: 'PRODUCTO_EXISTS'
      } as ApiResponse);
      return;
    }

    // Verificar que la categoría existe
    const categoriaExists = await executeQuery(`
      SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ? AND estatus = 1
    `, [idCategoria]);

    if (categoriaExists.length === 0) {
      res.status(400).json({
        success: false,
        message: 'La categoría especificada no existe o está inactiva',
        error: 'CATEGORIA_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Manejar imagen si se proporciona
    let imagenProducto = null;
    if (req.file) {
      imagenProducto = req.file.buffer; // Multer proporciona el buffer de la imagen
      console.log(`🖼️ Imagen recibida: ${req.file.size} bytes`); // Log de imagen
    }

    // Insertar nuevo producto
    const result = await executeQuery(`
      INSERT INTO tblposcrumenwebproductos 
      (idCategoria, idReceta, nombre, descripcion, precio, existencia, estatus, 
       fechaRegistro, fechaActualizacion, usuario, idNegocio, imagenProducto)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?)
    `, [idCategoria, idReceta || null, nombre, descripcion, precio, existencia, estatus, usuario, idNegocio, imagenProducto]);

    console.log('✅ Producto creado exitosamente'); // Log de éxito

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { idProducto: (result as any).insertId }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando producto:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando producto',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar un producto existente
export const updateProductoController = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    console.log('📦 Actualizando producto'); // Log de inicio
    const { id } = req.params;
    const { 
      idCategoria, 
      idReceta, 
      nombre, 
      descripcion, 
      precio, 
      existencia, 
      estatus, 
      usuario = 'system' 
    }: CreateProductoData = req.body;

    // Validación de ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
        error: 'VALIDATION_ERROR'
      } as ApiResponse);
      return;
    }

    // Verificar si el producto existe
    const existingProducto = await executeQuery(`
      SELECT idProducto, idNegocio FROM tblposcrumenwebproductos WHERE idProducto = ?
    `, [id]);

    if (existingProducto.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        error: 'PRODUCTO_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Verificar si ya existe otro producto con el mismo nombre en el mismo negocio
    if (nombre) {
      const duplicateProducto = await executeQuery(`
        SELECT idProducto FROM tblposcrumenwebproductos 
        WHERE nombre = ? AND idNegocio = ? AND idProducto != ?
      `, [nombre, existingProducto[0].idNegocio, id]);

      if (duplicateProducto.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Ya existe otro producto con ese nombre en este negocio',
          error: 'PRODUCTO_EXISTS'
        } as ApiResponse);
        return;
      }
    }

    // Verificar que la categoría existe si se está actualizando
    if (idCategoria) {
      const categoriaExists = await executeQuery(`
        SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ? AND estatus = 1
      `, [idCategoria]);

      if (categoriaExists.length === 0) {
        res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe o está inactiva',
          error: 'CATEGORIA_NOT_FOUND'
        } as ApiResponse);
        return;
      }
    }

    // Construir consulta de actualización dinámica
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (idCategoria) {
      updateFields.push('idCategoria = ?');
      updateValues.push(idCategoria);
    }
    if (idReceta !== undefined) {
      updateFields.push('idReceta = ?');
      updateValues.push(idReceta);
    }
    if (nombre) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }
    if (descripcion) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }
    if (precio !== undefined) {
      updateFields.push('precio = ?');
      updateValues.push(precio);
    }
    if (existencia !== undefined) {
      updateFields.push('existencia = ?');
      updateValues.push(existencia);
    }
    if (estatus !== undefined) {
      updateFields.push('estatus = ?');
      updateValues.push(estatus);
    }

    // Manejar imagen si se proporciona
    if (req.file) {
      updateFields.push('imagenProducto = ?');
      updateValues.push(req.file.buffer);
      console.log(`🖼️ Nueva imagen recibida: ${req.file.size} bytes`); // Log de imagen
    }
    
    updateFields.push('fechaActualizacion = NOW()');
    updateFields.push('usuario = ?');
    updateValues.push(usuario, id);

    // Ejecutar actualización
    await executeQuery(`
      UPDATE tblposcrumenwebproductos 
      SET ${updateFields.join(', ')}
      WHERE idProducto = ?
    `, updateValues);

    console.log('✅ Producto actualizado exitosamente'); // Log de éxito

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { idProducto: Number(id) }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error actualizando producto:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error actualizando producto',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para eliminar (desactivar) un producto
export const deleteProductoController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📦 Desactivando producto'); // Log de inicio
    const { id } = req.params;
    const { usuario = 'system' } = req.body;

    // Validación de ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
        error: 'VALIDATION_ERROR'
      } as ApiResponse);
      return;
    }

    // Verificar si el producto existe
    const existingProducto = await executeQuery(`
      SELECT idProducto FROM tblposcrumenwebproductos WHERE idProducto = ?
    `, [id]);

    if (existingProducto.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        error: 'PRODUCTO_NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Desactivar producto (cambiar estatus a 0)
    await executeQuery(`
      UPDATE tblposcrumenwebproductos 
      SET estatus = 0, fechaActualizacion = NOW(), usuario = ?
      WHERE idProducto = ?
    `, [usuario, id]);

    console.log('✅ Producto desactivado exitosamente'); // Log de éxito

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente',
      data: { idProducto: Number(id) }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error eliminando producto:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error eliminando producto',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};