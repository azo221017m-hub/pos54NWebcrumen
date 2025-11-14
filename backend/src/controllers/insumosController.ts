// backend/src/controllers/insumosController.ts
// Controlador para gestión de insumos en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import pool from '../config/database'; // Importa pool de conexión a MySQL
import type { 
  InsumoWeb, 
  CreateInsumoWebData, 
  UpdateInsumoWebData, 
  ApiResponse,
  UnidadMedidaInsumo 
} from '../types'; // Importa tipos personalizados
import type { RowDataPacket, ResultSetHeader } from 'mysql2'; // Importa tipos de MySQL2

// Controlador para obtener todos los insumos
export const getInsumos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📦 Iniciando obtención de insumos');
    
    // Ejecutar consulta para obtener todos los insumos
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebinsumos ORDER BY nombre ASC'
    );
    
    console.log(`📊 Insumos encontrados: ${rows.length}`);
    
    // Convertir los resultados al tipo InsumoWeb
    const insumos: InsumoWeb[] = rows.map((row: any) => ({
      id_insumo: row.id_insumo,
      nombre: row.nombre,
      unidad_medida: row.unidad_medida as UnidadMedidaInsumo,
      stock_actual: parseFloat(row.stock_actual),
      stock_minimo: parseFloat(row.stock_minimo),
      costo_promedio_ponderado: parseFloat(row.costo_promedio_ponderado || 0),
      precio_venta: parseFloat(row.precio_venta || 0),
      idinocuidad: row.idinocuidad || '',
      id_cuentacontable_insumo: row.id_cuentacontable || '',
      activo: Boolean(row.activo),
      inventariable: Boolean(row.inventariable),
      fechaRegistroauditoria: new Date(row.fechaRegistroauditoria),
      usuarioauditoria: row.usuarioauditoria,
      fehamodificacionauditoria: row.fehamodificacionauditoria ? new Date(row.fehamodificacionauditoria) : undefined,
      idnegocio: row.idnegocio
    }));

    const response: ApiResponse<InsumoWeb[]> = {
      success: true,
      message: 'Insumos obtenidos exitosamente',
      data: insumos
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo insumos:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al obtener insumos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para crear un nuevo insumo
export const createInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const insumoData: CreateInsumoWebData = req.body;
    console.log('📦 Iniciando creación de insumo:', insumoData.nombre);
    
    // Validaciones básicas
    if (!insumoData.nombre || !insumoData.nombre.trim()) {
      console.log('❌ Nombre de insumo requerido');
      res.status(400).json({
        success: false,
        message: 'El nombre del insumo es requerido'
      });
      return;
    }
    
    if (!insumoData.unidad_medida || !insumoData.unidad_medida.trim()) {
      console.log('❌ Unidad de medida requerida');
      res.status(400).json({
        success: false,
        message: 'La unidad de medida es requerida'
      });
      return;
    }

    // Validar que la unidad de medida sea una de las opciones permitidas
    const unidadesPermitidas: string[] = ['Kg', 'Lt', 'Pza'];
    if (!unidadesPermitidas.includes(insumoData.unidad_medida)) {
      console.log('❌ Unidad de medida no válida:', insumoData.unidad_medida);
      res.status(400).json({
        success: false,
        message: 'La unidad de medida debe ser: Kg, Lt o Pza'
      });
      return;
    }
    
    if (insumoData.stock_actual < 0) {
      console.log('❌ Stock actual debe ser mayor o igual a 0');
      res.status(400).json({
        success: false,
        message: 'El stock actual debe ser mayor o igual a 0'
      });
      return;
    }
    
    if (insumoData.stock_minimo < 0) {
      console.log('❌ Stock mínimo debe ser mayor o igual a 0');
      res.status(400).json({
        success: false,
        message: 'El stock mínimo debe ser mayor o igual a 0'
      });
      return;
    }
    
    // Verificar si ya existe un insumo con el mismo nombre
    const idnegocio = req.session?.idNegocio;

    // Verificar si ya existe un insumo con el mismo nombre para el negocio actual
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE nombre = ? AND idnegocio = ?',
      [insumoData.nombre.trim(), idnegocio]
    );
    
    if (existingRows.length > 0) {
      console.log('❌ Ya existe un insumo con ese nombre');
      res.status(400).json({
        success: false,
        message: 'Ya existe un insumo con ese nombre'
      });
      return;
    }
    
    // Extraer datos de auditoría de la sesión
    const usuarioauditoria = req.session?.usuarioAuditoria;

    if (!idnegocio || !usuarioauditoria) {
      console.log('❌ idNegocio o usuarioAuditoria faltantes en la sesión');
      res.status(403).json({
        success: false,
        message: 'No se puede realizar la operación. Falta información de auditoría.'
      });
      return;
    }

    const fechaRegistroauditoria = new Date();

    // Insertar el nuevo insumo en la base de datos
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebinsumos (
        nombre, unidad_medida, stock_actual, stock_minimo, costo_promedio_ponderado,
        precio_venta, idinocuidad, id_cuentacontable, activo, inventariable,
        fechaRegistroauditoria, usuarioauditoria, idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insumoData.nombre,
        insumoData.unidad_medida,
        insumoData.stock_actual,
        insumoData.stock_minimo,
        insumoData.costo_promedio_ponderado || 0,
        insumoData.precio_venta || 0,
        insumoData.idinocuidad || null,
        insumoData.id_cuentacontable || null,
        insumoData.activo ? 1 : 0,
        insumoData.inventariable ? 1 : 0,
        fechaRegistroauditoria,
        usuarioauditoria,
        idnegocio
      ]
    );

    console.log('✅ Insumo creado exitosamente con ID:', result.insertId);
    res.status(201).json({
      success: true,
      message: 'Insumo creado exitosamente',
      data: { id_insumo: result.insertId }
    });

  } catch (error) {
    console.error('❌ Error creando insumo:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al crear insumo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para actualizar un insumo
export const updateInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const insumoData: UpdateInsumoWebData = req.body;
    
    console.log('📦 Iniciando actualización de insumo:', id);
    
    // Verificar que el insumo existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Insumo no encontrado');
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }
    
    // Construir query dinámico basado en campos proporcionados
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (insumoData.nombre !== undefined) {
      if (!insumoData.nombre.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre del insumo no puede estar vacío'
        });
        return;
      }
      updateFields.push('nombre = ?');
      updateValues.push(insumoData.nombre.trim());
    }
    
    if (insumoData.unidad_medida !== undefined) {
      if (!insumoData.unidad_medida.trim()) {
        res.status(400).json({
          success: false,
          message: 'La unidad de medida no puede estar vacía'
        });
        return;
      }

      // Validar que la unidad de medida sea una de las opciones permitidas
      const unidadesPermitidas: string[] = ['Kg', 'Lt', 'Pza'];
      if (!unidadesPermitidas.includes(insumoData.unidad_medida.trim())) {
        res.status(400).json({
          success: false,
          message: 'La unidad de medida debe ser: Kg, Lt o Pza'
        });
        return;
      }

      updateFields.push('unidad_medida = ?');
      updateValues.push(insumoData.unidad_medida.trim());
    }
    
    if (insumoData.stock_actual !== undefined) {
      if (insumoData.stock_actual < 0) {
        res.status(400).json({
          success: false,
          message: 'El stock actual debe ser mayor o igual a 0'
        });
        return;
      }
      updateFields.push('stock_actual = ?');
      updateValues.push(insumoData.stock_actual);
    }
    
    if (insumoData.stock_minimo !== undefined) {
      if (insumoData.stock_minimo < 0) {
        res.status(400).json({
          success: false,
          message: 'El stock mínimo debe ser mayor o igual a 0'
        });
        return;
      }
      updateFields.push('stock_minimo = ?');
      updateValues.push(insumoData.stock_minimo);
    }
    
    if (insumoData.id_cuentacontable_insumo !== undefined) {
      updateFields.push('id_cuentacontable = ?');
      updateValues.push(insumoData.id_cuentacontable_insumo);
    }
    
    if (insumoData.activo !== undefined) {
      updateFields.push('activo = ?');
      updateValues.push(insumoData.activo ? 1 : 0);
    }
    
    if (insumoData.inventariable !== undefined) {
      updateFields.push('inventariable = ?');
      updateValues.push(insumoData.inventariable);
    }
    
    if (insumoData.usuarioauditoria !== undefined) {
      updateFields.push('usuarioauditoria = ?');
      updateValues.push(insumoData.usuarioauditoria);
    }
    
    // Agregar fecha de modificación
    updateFields.push('fehamodificacionauditoria = NOW()');
    
    // Agregar ID al final para la condición WHERE
    updateValues.push(id);
    
    if (updateFields.length === 1) { // Solo la fecha de modificación
      console.log('❌ No hay campos para actualizar');
      res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
      return;
    }
    
    const updateQuery = `
      UPDATE tblposcrumenwebinsumos 
      SET ${updateFields.join(', ')}
      WHERE id_insumo = ?
    `;
    
    await pool.execute(updateQuery, updateValues);
    
    console.log('✅ Insumo actualizado exitosamente');
    
    const response: ApiResponse = {
      success: true,
      message: 'Insumo actualizado exitosamente'
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error actualizando insumo:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al actualizar insumo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para eliminar un insumo
export const deleteInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('📦 Iniciando eliminación de insumo:', id);
    
    // Verificar que el insumo existe
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_insumo, nombre FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      console.log('❌ Insumo no encontrado');
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }

    const insumo = existingRows[0];
    console.log('🗑️ Eliminando insumo:', insumo.nombre);
    
    // Eliminar el insumo
    await pool.execute(
      'DELETE FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [id]
    );
    
    console.log('✅ Insumo eliminado exitosamente');
    
    const response: ApiResponse = {
      success: true,
      message: 'Insumo eliminado exitosamente'
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error eliminando insumo:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al eliminar insumo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};