// backend/src/controllers/proveedoresController.ts
// Controlador para gestión de proveedores en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { Proveedor, CreateProveedorData, UpdateProveedorData, ApiResponse } from '../types'; // Importa tipos personalizados

// Controlador para obtener todos los proveedores
export const getProveedores = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🏪 Iniciando obtención de proveedores');
    
    // Ejecuta la consulta para obtener todos los proveedores
    const rows = await executeQuery(
      'SELECT * FROM tblposcrumenwebproveedores ORDER BY nombre ASC',
      []
    );

    console.log(`📊 Proveedores encontrados: ${rows ? rows.length : 0}`);
    
    // Mapea los resultados de la base de datos al formato esperado
    const proveedores: Proveedor[] = (rows || []).map((row: any): Proveedor => ({
      id_proveedor: row.id_proveedor,
      nombre: row.nombre || '',
      rfc: row.rfc || '',
      telefono: row.telefono || '',
      correo: row.correo || '',
      direccion: row.direccion || '',
      banco: row.banco || '',
      cuenta: row.cuenta || '',
      activo: Boolean(row.activo),
      fechaRegistroauditoria: new Date(row.fechaRegistroauditoria),
      usuarioauditoria: row.usuarioauditoria,
      fehamodificacionauditoria: row.fehamodificacionauditoria ? new Date(row.fehamodificacionauditoria) : undefined,
      idnegocio: row.idnegocio
    }));

    const response: ApiResponse<Proveedor[]> = {
      success: true,
      message: 'Proveedores obtenidos exitosamente',
      data: proveedores
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error obteniendo proveedores:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al obtener proveedores',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para crear un nuevo proveedor
export const createProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const proveedorData: CreateProveedorData = req.body;
    console.log('🏪 Iniciando creación de proveedor:', proveedorData.nombre);
    
    // Validaciones básicas
    if (!proveedorData.nombre?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El nombre del proveedor es obligatorio'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.rfc?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El RFC del proveedor es obligatorio'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.telefono?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El teléfono del proveedor es obligatorio'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.correo?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El correo del proveedor es obligatorio'
      };
      res.status(400).json(response);
      return;
    }

    // Validación de formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(proveedorData.correo)) {
      const response: ApiResponse = {
        success: false,
        message: 'El formato del correo electrónico no es válido'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.direccion?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'La dirección del proveedor es obligatoria'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.banco?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El banco del proveedor es obligatorio'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.cuenta?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'La cuenta del proveedor es obligatoria'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.usuarioauditoria?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El usuario de auditoría es obligatorio'
      };
      res.status(400).json(response);
      return;
    }

    if (!proveedorData.idnegocio || proveedorData.idnegocio <= 0) {
      const response: ApiResponse = {
        success: false,
        message: 'El ID del negocio es obligatorio'
      };
      res.status(400).json(response);
      return;
    }

    // Verificar si ya existe un proveedor con el mismo RFC
    const existingProveedor = await executeQuery(
      'SELECT id_proveedor FROM tblposcrumenwebproveedores WHERE rfc = ? AND idnegocio = ?',
      [proveedorData.rfc, proveedorData.idnegocio]
    );

    if (existingProveedor && existingProveedor.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Ya existe un proveedor con ese RFC en este negocio'
      };
      res.status(409).json(response);
      return;
    }

    // Insertar nuevo proveedor
    const result = await executeQuery(
      `INSERT INTO tblposcrumenwebproveedores 
       (nombre, rfc, telefono, correo, direccion, banco, cuenta, activo, fechaRegistroauditoria, usuarioauditoria, idnegocio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        proveedorData.nombre.trim(),
        proveedorData.rfc.trim(),
        proveedorData.telefono.trim(),
        proveedorData.correo.trim(),
        proveedorData.direccion.trim(),
        proveedorData.banco.trim(),
        proveedorData.cuenta.trim(),
        proveedorData.activo,
        proveedorData.usuarioauditoria,
        proveedorData.idnegocio
      ]
    );

    console.log('✅ Proveedor creado exitosamente con ID:', result.insertId);

    const response: ApiResponse = {
      success: true,
      message: `Proveedor "${proveedorData.nombre}" creado exitosamente`,
      data: { id: result.insertId }
    };
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Error creando proveedor:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al crear proveedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para actualizar un proveedor
export const updateProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const proveedorData: UpdateProveedorData = req.body;
    
    console.log(`🏪 Iniciando actualización de proveedor ID: ${id}`);

    if (!id || isNaN(Number(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de proveedor inválido'
      };
      res.status(400).json(response);
      return;
    }

    // Verificar si el proveedor existe
    const existingProveedor = await executeQuery(
      'SELECT id_proveedor FROM tblposcrumenwebproveedores WHERE id_proveedor = ?',
      [id]
    );

    if (!existingProveedor || existingProveedor.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Proveedor no encontrado'
      };
      res.status(404).json(response);
      return;
    }

    // Construir consulta de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (proveedorData.nombre !== undefined) {
      if (!proveedorData.nombre.trim()) {
        const response: ApiResponse = {
          success: false,
          message: 'El nombre del proveedor no puede estar vacío'
        };
        res.status(400).json(response);
        return;
      }
      updateFields.push('nombre = ?');
      updateValues.push(proveedorData.nombre.trim());
    }

    if (proveedorData.rfc !== undefined) {
      if (!proveedorData.rfc.trim()) {
        const response: ApiResponse = {
          success: false,
          message: 'El RFC del proveedor no puede estar vacío'
        };
        res.status(400).json(response);
        return;
      }
      
      // Verificar si ya existe otro proveedor con el mismo RFC
      const rfcCheck = await executeQuery(
        'SELECT id_proveedor FROM tblposcrumenwebproveedores WHERE rfc = ? AND id_proveedor != ?',
        [proveedorData.rfc.trim(), id]
      );

      if (rfcCheck && rfcCheck.length > 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Ya existe otro proveedor con ese RFC'
        };
        res.status(409).json(response);
        return;
      }

      updateFields.push('rfc = ?');
      updateValues.push(proveedorData.rfc.trim());
    }

    if (proveedorData.telefono !== undefined) {
      if (!proveedorData.telefono.trim()) {
        const response: ApiResponse = {
          success: false,
          message: 'El teléfono del proveedor no puede estar vacío'
        };
        res.status(400).json(response);
        return;
      }
      updateFields.push('telefono = ?');
      updateValues.push(proveedorData.telefono.trim());
    }

    if (proveedorData.correo !== undefined) {
      if (!proveedorData.correo.trim()) {
        const response: ApiResponse = {
          success: false,
          message: 'El correo del proveedor no puede estar vacío'
        };
        res.status(400).json(response);
        return;
      }

      // Validación de formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(proveedorData.correo)) {
        const response: ApiResponse = {
          success: false,
          message: 'El formato del correo electrónico no es válido'
        };
        res.status(400).json(response);
        return;
      }

      updateFields.push('correo = ?');
      updateValues.push(proveedorData.correo.trim());
    }

    if (proveedorData.direccion !== undefined) {
      if (!proveedorData.direccion.trim()) {
        const response: ApiResponse = {
          success: false,
          message: 'La dirección del proveedor no puede estar vacía'
        };
        res.status(400).json(response);
        return;
      }
      updateFields.push('direccion = ?');
      updateValues.push(proveedorData.direccion.trim());
    }

    if (proveedorData.banco !== undefined) {
      if (!proveedorData.banco.trim()) {
        const response: ApiResponse = {
          success: false,
          message: 'El banco del proveedor no puede estar vacío'
        };
        res.status(400).json(response);
        return;
      }
      updateFields.push('banco = ?');
      updateValues.push(proveedorData.banco.trim());
    }

    if (proveedorData.cuenta !== undefined) {
      if (!proveedorData.cuenta.trim()) {
        const response: ApiResponse = {
          success: false,
          message: 'La cuenta del proveedor no puede estar vacía'
        };
        res.status(400).json(response);
        return;
      }
      updateFields.push('cuenta = ?');
      updateValues.push(proveedorData.cuenta.trim());
    }

    if (proveedorData.activo !== undefined) {
      updateFields.push('activo = ?');
      updateValues.push(proveedorData.activo);
    }

    if (proveedorData.usuarioauditoria !== undefined) {
      updateFields.push('usuarioauditoria = ?');
      updateValues.push(proveedorData.usuarioauditoria);
    }

    // Siempre actualizar fecha de modificación
    updateFields.push('fehamodificacionauditoria = NOW()');

    if (updateFields.length === 1) { // Solo fehamodificacionauditoria
      const response: ApiResponse = {
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      };
      res.status(400).json(response);
      return;
    }

    // Agregar ID al final de los valores
    updateValues.push(id);

    // Ejecutar actualización
    const query = `UPDATE tblposcrumenwebproveedores SET ${updateFields.join(', ')} WHERE id_proveedor = ?`;
    await executeQuery(query, updateValues);

    console.log(`✅ Proveedor ID ${id} actualizado exitosamente`);

    const response: ApiResponse = {
      success: true,
      message: 'Proveedor actualizado exitosamente'
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error actualizando proveedor:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al actualizar proveedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};

// Controlador para eliminar un proveedor
export const deleteProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    console.log(`🏪 Iniciando eliminación de proveedor ID: ${id}`);

    if (!id || isNaN(Number(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de proveedor inválido'
      };
      res.status(400).json(response);
      return;
    }

    // Verificar si el proveedor existe
    const existingProveedor = await executeQuery(
      'SELECT id_proveedor, nombre FROM tblposcrumenwebproveedores WHERE id_proveedor = ?',
      [id]
    );

    if (!existingProveedor || existingProveedor.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Proveedor no encontrado'
      };
      res.status(404).json(response);
      return;
    }

    const nombreProveedor = existingProveedor[0].nombre;

    // Eliminar proveedor
    await executeQuery(
      'DELETE FROM tblposcrumenwebproveedores WHERE id_proveedor = ?',
      [id]
    );

    console.log(`✅ Proveedor "${nombreProveedor}" eliminado exitosamente`);

    const response: ApiResponse = {
      success: true,
      message: `Proveedor "${nombreProveedor}" eliminado exitosamente`
    };
    res.json(response);

  } catch (error) {
    console.error('❌ Error eliminando proveedor:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error del servidor al eliminar proveedor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    res.status(500).json(response);
  }
};