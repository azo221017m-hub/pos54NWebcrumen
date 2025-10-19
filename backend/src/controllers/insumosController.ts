// backend/src/controllers/insumosController.ts
// Controlador para gestión de insumos

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { Insumo, CreateInsumoData } from '../types';

// Controlador para obtener todos los insumos
export const getInsumosController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📦 Obteniendo lista de insumos');

    // Query para obtener insumos con información de categoría
    const query = `
      SELECT 
        i.idInsumo,
        i.nomInsumo,
        i.costoPromPond,
        i.umInsumo,
        i.tipoInsumo,
        i.existencia,
        i.stockMinimo,
        i.precioVta,
        i.idCategoria,
        i.fechaRegistro,
        i.fechaActualizacion,
        i.usuario,
        c.nombre as nombreCategoria
      FROM tblposcrumenwebinsumos i
      LEFT JOIN tblposcrumenwebcategorias c ON i.idCategoria = c.idCategoria
      ORDER BY i.fechaRegistro DESC
    `;

    const insumos = await executeQuery(query);
    console.log(`✅ ${insumos.length} insumos encontrados`);

    res.status(200).json({
      success: true,
      message: `${insumos.length} insumos encontrados`,
      data: insumos
    });

  } catch (error) {
    console.error('❌ Error al obtener insumos:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener insumos',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para crear un nuevo insumo
export const createInsumoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const insumoData: CreateInsumoData = req.body;
    console.log('📦 Creando nuevo insumo:', insumoData);

    // Validaciones básicas
    if (!insumoData.nomInsumo || !insumoData.nomInsumo.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre del insumo es obligatorio'
      });
      return;
    }

    if (!insumoData.umInsumo || !insumoData.umInsumo.trim()) {
      res.status(400).json({
        success: false,
        message: 'La unidad de medida es obligatoria'
      });
      return;
    }

    if (!insumoData.tipoInsumo || !['PIEZA', 'CONSUMO'].includes(insumoData.tipoInsumo)) {
      res.status(400).json({
        success: false,
        message: 'El tipo de insumo debe ser PIEZA o CONSUMO'
      });
      return;
    }

    if (!insumoData.idCategoria || isNaN(Number(insumoData.idCategoria))) {
      res.status(400).json({
        success: false,
        message: 'La categoría es obligatoria y debe ser un número válido'
      });
      return;
    }

    if (isNaN(Number(insumoData.costoPromPond)) || Number(insumoData.costoPromPond) < 0) {
      res.status(400).json({
        success: false,
        message: 'El costo promedio ponderado debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    if (isNaN(Number(insumoData.existencia)) || Number(insumoData.existencia) < 0) {
      res.status(400).json({
        success: false,
        message: 'La existencia debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    if (isNaN(Number(insumoData.stockMinimo)) || Number(insumoData.stockMinimo) < 0) {
      res.status(400).json({
        success: false,
        message: 'El stock mínimo debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    if (isNaN(Number(insumoData.precioVta)) || Number(insumoData.precioVta) < 0) {
      res.status(400).json({
        success: false,
        message: 'El precio de venta debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    // Verificar que la categoría existe
    const categoriaExists = await executeQuery(
      'SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ? AND estatus = 1',
      [insumoData.idCategoria]
    );

    if (categoriaExists.length === 0) {
      res.status(400).json({
        success: false,
        message: 'La categoría especificada no existe o está inactiva'
      });
      return;
    }

    // Verificar que no existe un insumo con el mismo nombre
    const insumoExists = await executeQuery(
      'SELECT idInsumo FROM tblposcrumenwebinsumos WHERE nomInsumo = ?',
      [insumoData.nomInsumo.trim()]
    );

    if (insumoExists.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un insumo con este nombre'
      });
      return;
    }

    // Preparar datos para inserción
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO tblposcrumenwebinsumos (
        nomInsumo,
        costoPromPond,
        umInsumo,
        tipoInsumo,
        existencia,
        stockMinimo,
        precioVta,
        idCategoria,
        fechaRegistro,
        fechaActualizacion,
        usuario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      insumoData.nomInsumo.trim(),
      Number(insumoData.costoPromPond),
      insumoData.umInsumo.trim(),
      insumoData.tipoInsumo,
      Number(insumoData.existencia),
      Number(insumoData.stockMinimo),
      Number(insumoData.precioVta),
      Number(insumoData.idCategoria),
      fechaActual,
      fechaActual,
      insumoData.usuario || 'sistema'
    ];

    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', params);

    const result = await executeQuery(query, params);
    console.log('✅ Insumo creado exitosamente. ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Insumo creado exitosamente',
      data: { idInsumo: result.insertId }
    });

  } catch (error) {
    console.error('❌ Error al crear insumo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear insumo',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para actualizar un insumo
export const updateInsumoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const insumoData: Partial<CreateInsumoData> = req.body;
    
    console.log('📦 Actualizando insumo ID:', id, 'Datos:', insumoData);

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de insumo inválido'
      });
      return;
    }

    // Verificar que el insumo existe
    const insumoExists = await executeQuery(
      'SELECT idInsumo FROM tblposcrumenwebinsumos WHERE idInsumo = ?',
      [Number(id)]
    );

    if (insumoExists.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }

    // Construir query de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (insumoData.nomInsumo !== undefined) {
      if (!insumoData.nomInsumo.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre del insumo no puede estar vacío'
        });
        return;
      }
      updateFields.push('nomInsumo = ?');
      updateValues.push(insumoData.nomInsumo.trim());
    }

    if (insumoData.costoPromPond !== undefined) {
      if (isNaN(Number(insumoData.costoPromPond)) || Number(insumoData.costoPromPond) < 0) {
        res.status(400).json({
          success: false,
          message: 'El costo promedio ponderado debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('costoPromPond = ?');
      updateValues.push(Number(insumoData.costoPromPond));
    }

    if (insumoData.umInsumo !== undefined) {
      if (!insumoData.umInsumo.trim()) {
        res.status(400).json({
          success: false,
          message: 'La unidad de medida no puede estar vacía'
        });
        return;
      }
      updateFields.push('umInsumo = ?');
      updateValues.push(insumoData.umInsumo.trim());
    }

    if (insumoData.tipoInsumo !== undefined) {
      if (!['PIEZA', 'CONSUMO'].includes(insumoData.tipoInsumo)) {
        res.status(400).json({
          success: false,
          message: 'El tipo de insumo debe ser PIEZA o CONSUMO'
        });
        return;
      }
      updateFields.push('tipoInsumo = ?');
      updateValues.push(insumoData.tipoInsumo);
    }

    if (insumoData.existencia !== undefined) {
      if (isNaN(Number(insumoData.existencia)) || Number(insumoData.existencia) < 0) {
        res.status(400).json({
          success: false,
          message: 'La existencia debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('existencia = ?');
      updateValues.push(Number(insumoData.existencia));
    }

    if (insumoData.stockMinimo !== undefined) {
      if (isNaN(Number(insumoData.stockMinimo)) || Number(insumoData.stockMinimo) < 0) {
        res.status(400).json({
          success: false,
          message: 'El stock mínimo debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('stockMinimo = ?');
      updateValues.push(Number(insumoData.stockMinimo));
    }

    if (insumoData.precioVta !== undefined) {
      if (isNaN(Number(insumoData.precioVta)) || Number(insumoData.precioVta) < 0) {
        res.status(400).json({
          success: false,
          message: 'El precio de venta debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('precioVta = ?');
      updateValues.push(Number(insumoData.precioVta));
    }

    if (insumoData.idCategoria !== undefined) {
      if (isNaN(Number(insumoData.idCategoria))) {
        res.status(400).json({
          success: false,
          message: 'La categoría debe ser un número válido'
        });
        return;
      }

      // Verificar que la categoría existe
      const categoriaExists = await executeQuery(
        'SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ? AND estatus = 1',
        [insumoData.idCategoria]
      );

      if (categoriaExists.length === 0) {
        res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe o está inactiva'
        });
        return;
      }

      updateFields.push('idCategoria = ?');
      updateValues.push(Number(insumoData.idCategoria));
    }

    if (insumoData.usuario !== undefined) {
      updateFields.push('usuario = ?');
      updateValues.push(insumoData.usuario);
    }

    // Siempre actualizar la fecha de actualización
    updateFields.push('fechaActualizacion = ?');
    updateValues.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

    if (updateFields.length === 1) { // Solo fechaActualizacion
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
      return;
    }

    const query = `UPDATE tblposcrumenwebinsumos SET ${updateFields.join(', ')} WHERE idInsumo = ?`;
    updateValues.push(Number(id));

    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', updateValues);

    await executeQuery(query, updateValues);
    console.log('✅ Insumo actualizado exitosamente');

    res.status(200).json({
      success: true,
      message: 'Insumo actualizado exitosamente',
      data: { idInsumo: Number(id) }
    });

  } catch (error) {
    console.error('❌ Error al actualizar insumo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar insumo',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para eliminar un insumo
export const deleteInsumoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { usuario } = req.body;
    
    console.log('🗑️ Eliminando insumo ID:', id, 'Usuario:', usuario);

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de insumo inválido'
      });
      return;
    }

    // Verificar que el insumo existe
    const insumoExists = await executeQuery(
      'SELECT idInsumo, nomInsumo FROM tblposcrumenwebinsumos WHERE idInsumo = ?',
      [Number(id)]
    );

    if (insumoExists.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }

    // Eliminar el insumo
    const query = 'DELETE FROM tblposcrumenwebinsumos WHERE idInsumo = ?';
    
    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', [Number(id)]);

    await executeQuery(query, [Number(id)]);
    console.log('✅ Insumo eliminado exitosamente');

    res.status(200).json({
      success: true,
      message: `Insumo "${insumoExists[0].nomInsumo}" eliminado exitosamente`,
      data: { idInsumo: Number(id) }
    });

  } catch (error) {
    console.error('❌ Error al eliminar insumo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar insumo',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para buscar insumos por filtro de nombre
export const buscarInsumosController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Soportar tanto parámetros de ruta como query parameters
    const filtroParam = req.params.filtro;
    const { busqueda, tipo } = req.query;
    
    const filtro = filtroParam || busqueda as string;
    
    console.log('🔍 Buscando insumos con filtro:', filtro, 'Tipo:', tipo);

    // Validar que el filtro no esté vacío
    if (!filtro || filtro.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'El filtro debe tener al menos 2 caracteres',
        data: []
      });
      return;
    }

    // Construir query dinámicamente según los filtros
    let query = `
      SELECT 
        idInsumo,
        nomInsumo,
        umInsumo,
        costoPromPond,
        tipoInsumo,
        existencia,
        idCategoria
      FROM tblposcrumenwebinsumos
      WHERE nomInsumo LIKE ?
    `;
    
    const queryParams: any[] = [`%${filtro.trim()}%`];
    
    // Agregar filtro por tipo si se especifica
    if (tipo && tipo !== 'ALL') {
      query += ' AND tipoInsumo = ?';
      queryParams.push(tipo);
    }
    
    query += ' ORDER BY nomInsumo LIMIT 20';

    const insumos = await executeQuery(query, queryParams);
    
    console.log(`✅ ${insumos.length} insumos encontrados con filtro "${filtro}" ${tipo ? `tipo "${tipo}"` : ''}`);

    res.status(200).json({
      success: true,
      message: `${insumos.length} insumos encontrados`,
      data: insumos
    });

  } catch (error) {
    console.error('❌ Error al buscar insumos:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar insumos',
      data: [],
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};