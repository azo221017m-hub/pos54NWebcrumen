// backend/src/controllers/negociosController.ts
// Controlador para operaciones CRUD de negocios y parámetros de negocio

import type { Request, Response } from 'express';
import type { 
  ApiResponse, 
  NegocioConfiguracion,
  ParametrosNegocioCompletos,
  NegocioConfiguracionCompleto,
  CreateNegocioConfiguracionData,
  UpdateNegocioConfiguracionData,
  CreateParametrosNegocioCompletosData,
  UpdateParametrosNegocioCompletosData
} from '../types/index';
import pool from '../config/database';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

// Obtener negocios con sus parámetros
export const getNegocios = async (req: Request, res: Response): Promise<void> => {
  console.log('🏢 Iniciando obtención de negocios...');
  
  try {
    // Consulta para obtener negocios con sus parámetros
    const query = `
      SELECT 
        n.idNegocio,
        n.numeronegocio,
        n.nombreNegocio,
        n.rfcnegocio,
        n.direccionfiscalnegocio,
        n.contactonegocio,
        n.logotipo,
        n.telefonocontacto,
        n.estatusnegocio,
        n.fechaRegistroauditoria,
        n.usuarioauditoria,
        n.fehamodificacionauditoria,
        p.idParametro,
        p.telefonoNegocio,
        p.telefonoPedidos,
        p.ubicacion,
        p.tipoNegocio,
        p.impresionRecibo,
        p.impresionTablero,
        p.envioWhats,
        p.encabezado,
        p.pie,
        p.impresionComanda,
        p.envioMensaje,
        p.estatus as parametrosEstatus,
        p.fechaRegistroAuditoria as parametrosFechaRegistro,
        p.usuarioAuditoria as parametrosUsuario,
        p.fechaModificacionAuditoria as parametrosFechaModificacion
      FROM tblposcrumenwebnegocio n
      LEFT JOIN tblposcrumenwebparametrosnegocio p ON n.idNegocio = p.idNegocio
      ORDER BY n.idNegocio
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    console.log(`✅ Consulta ejecutada. ${rows.length} registros encontrados`);
    
    // Agrupar datos por negocio
    const negociosMap = new Map<number, NegocioConfiguracionCompleto>();
    
    rows.forEach((row: any) => {
      const negocioId = row.idNegocio;
      
      if (!negociosMap.has(negocioId)) {
        // Crear negocio base
        const negocio: NegocioConfiguracionCompleto = {
          idNegocio: row.idNegocio,
          numeronegocio: row.numeronegocio,
          nombreNegocio: row.nombreNegocio,
          rfcnegocio: row.rfcnegocio,
          direccionfiscalnegocio: row.direccionfiscalnegocio,
          contactonegocio: row.contactonegocio,
          logotipo: row.logotipo,
          telefonocontacto: row.telefonocontacto,
          estatusnegocio: Boolean(row.estatusnegocio),
          fechaRegistroauditoria: row.fechaRegistroauditoria,
          usuarioauditoria: row.usuarioauditoria,
          fehamodificacionauditoria: row.fehamodificacionauditoria
        };
        
        // Agregar parámetros si existen
        if (row.idParametro) {
          negocio.parametros = {
            idParametro: row.idParametro,
            idNegocio: row.idNegocio,
            telefonoNegocio: row.telefonoNegocio,
            telefonoPedidos: row.telefonoPedidos,
            ubicacion: row.ubicacion,
            tipoNegocio: row.tipoNegocio,
            impresionRecibo: Boolean(row.impresionRecibo),
            impresionTablero: Boolean(row.impresionTablero),
            envioWhats: Boolean(row.envioWhats),
            encabezado: row.encabezado,
            pie: row.pie,
            impresionComanda: Boolean(row.impresionComanda),
            envioMensaje: Boolean(row.envioMensaje),
            estatus: Boolean(row.parametrosEstatus),
            fechaRegistroAuditoria: row.parametrosFechaRegistro,
            usuarioAuditoria: row.parametrosUsuario,
            fechaModificacionAuditoria: row.parametrosFechaModificacion
          };
        }
        
        negociosMap.set(negocioId, negocio);
      }
    });
    
    const negocios = Array.from(negociosMap.values());
    console.log(`✅ ${negocios.length} negocios procesados correctamente`);
    
    const response: ApiResponse<NegocioConfiguracionCompleto[]> = {
      success: true,
      message: 'Negocios obtenidos correctamente',
      data: negocios
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Error obteniendo negocios:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al obtener negocios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    
    res.status(500).json(response);
  }
};

// Crear nuevo negocio
export const createNegocio = async (req: Request, res: Response): Promise<void> => {
  console.log('🏢 Iniciando creación de negocio...');
  
  try {
    const negocioData: CreateNegocioConfiguracionData = req.body;
    console.log('📝 Datos recibidos:', { ...negocioData, logotipo: negocioData.logotipo ? '[BLOB DATA]' : null });
    
    // Validaciones
    if (!negocioData.numeronegocio?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El número de negocio es requerido'
      };
      res.status(400).json(response);
      return;
    }
    
    if (!negocioData.nombreNegocio?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El nombre del negocio es requerido'
      };
      res.status(400).json(response);
      return;
    }
    
    if (!negocioData.rfcnegocio?.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'El RFC del negocio es requerido'
      };
      res.status(400).json(response);
      return;
    }
    
    // Verificar si el RFC ya existe
    console.log('🔍 Verificando si el RFC ya existe...');
    const checkRfcQuery = 'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE rfcnegocio = ?';
    const [existingRfc] = await pool.execute<RowDataPacket[]>(checkRfcQuery, [negocioData.rfcnegocio]);
    
    if (existingRfc.length > 0) {
      console.log('⚠️ RFC ya existe:', negocioData.rfcnegocio);
      const response: ApiResponse = {
        success: false,
        message: 'Ya existe un negocio con este RFC'
      };
      res.status(400).json(response);
      return;
    }
    
    // Insertar negocio
    const insertQuery = `
      INSERT INTO tblposcrumenwebnegocio (
        numeronegocio, nombreNegocio, rfcnegocio, direccionfiscalnegocio,
        contactonegocio, logotipo, telefonocontacto, estatusnegocio,
        fechaRegistroauditoria, usuarioauditoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const insertValues = [
      negocioData.numeronegocio.trim(),
      negocioData.nombreNegocio.trim(),
      negocioData.rfcnegocio.trim(),
      negocioData.direccionfiscalnegocio?.trim() || '',
      negocioData.contactonegocio?.trim() || '',
      negocioData.logotipo || null,
      negocioData.telefonocontacto?.trim() || '',
      negocioData.estatusnegocio ? 1 : 0,
      negocioData.usuarioauditoria
    ];
    
    console.log('💾 Insertando negocio...');
    const [result] = await pool.execute<ResultSetHeader>(insertQuery, insertValues);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudo insertar el negocio');
    }
    
    console.log(`✅ Negocio creado con ID: ${result.insertId}`);
    
    const response: ApiResponse<{ idNegocio: number }> = {
      success: true,
      message: 'Negocio creado correctamente',
      data: { idNegocio: result.insertId }
    };
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('❌ Error creando negocio:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al crear negocio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    
    res.status(500).json(response);
  }
};

// Actualizar negocio
export const updateNegocio = async (req: Request, res: Response): Promise<void> => {
  console.log('🏢 Iniciando actualización de negocio...');
  
  try {
    const idNegocio = parseInt(req.params.id);
    const negocioData: UpdateNegocioConfiguracionData = req.body;
    
    console.log('📝 Datos recibidos:', { idNegocio, ...negocioData, logotipo: negocioData.logotipo ? '[BLOB DATA]' : null });
    
    if (isNaN(idNegocio)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de negocio inválido'
      };
      res.status(400).json(response);
      return;
    }
    
    // Verificar si el negocio existe
    console.log('🔍 Verificando si el negocio existe...');
    const checkQuery = 'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE idNegocio = ?';
    const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [idNegocio]);
    
    if (existing.length === 0) {
      console.log('⚠️ Negocio no encontrado:', idNegocio);
      const response: ApiResponse = {
        success: false,
        message: 'Negocio no encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    // Verificar RFC único si se está actualizando
    if (negocioData.rfcnegocio) {
      console.log('🔍 Verificando RFC único...');
      const checkRfcQuery = 'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE rfcnegocio = ? AND idNegocio != ?';
      const [existingRfc] = await pool.execute<RowDataPacket[]>(checkRfcQuery, [negocioData.rfcnegocio, idNegocio]);
      
      if (existingRfc.length > 0) {
        console.log('⚠️ RFC ya existe para otro negocio:', negocioData.rfcnegocio);
        const response: ApiResponse = {
          success: false,
          message: 'Ya existe otro negocio con este RFC'
        };
        res.status(400).json(response);
        return;
      }
    }
    
    // Construir query de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (negocioData.numeronegocio !== undefined) {
      updateFields.push('numeronegocio = ?');
      updateValues.push(negocioData.numeronegocio.trim());
    }
    if (negocioData.nombreNegocio !== undefined) {
      updateFields.push('nombreNegocio = ?');
      updateValues.push(negocioData.nombreNegocio.trim());
    }
    if (negocioData.rfcnegocio !== undefined) {
      updateFields.push('rfcnegocio = ?');
      updateValues.push(negocioData.rfcnegocio.trim());
    }
    if (negocioData.direccionfiscalnegocio !== undefined) {
      updateFields.push('direccionfiscalnegocio = ?');
      updateValues.push(negocioData.direccionfiscalnegocio.trim());
    }
    if (negocioData.contactonegocio !== undefined) {
      updateFields.push('contactonegocio = ?');
      updateValues.push(negocioData.contactonegocio.trim());
    }
    if (negocioData.logotipo !== undefined) {
      updateFields.push('logotipo = ?');
      updateValues.push(negocioData.logotipo);
    }
    if (negocioData.telefonocontacto !== undefined) {
      updateFields.push('telefonocontacto = ?');
      updateValues.push(negocioData.telefonocontacto.trim());
    }
    if (negocioData.estatusnegocio !== undefined) {
      updateFields.push('estatusnegocio = ?');
      updateValues.push(negocioData.estatusnegocio ? 1 : 0);
    }
    if (negocioData.usuarioauditoria !== undefined) {
      updateFields.push('usuarioauditoria = ?');
      updateValues.push(negocioData.usuarioauditoria);
    }
    
    // Siempre actualizar fecha de modificación
    updateFields.push('fehamodificacionauditoria = NOW()');
    updateValues.push(idNegocio);
    
    if (updateFields.length === 1) { // Solo fecha de modificación
      const response: ApiResponse = {
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      };
      res.status(400).json(response);
      return;
    }
    
    const updateQuery = `
      UPDATE tblposcrumenwebnegocio 
      SET ${updateFields.join(', ')} 
      WHERE idNegocio = ?
    `;
    
    console.log('💾 Actualizando negocio...');
    const [result] = await pool.execute<ResultSetHeader>(updateQuery, updateValues);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el negocio');
    }
    
    console.log(`✅ Negocio actualizado correctamente: ${idNegocio}`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Negocio actualizado correctamente'
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Error actualizando negocio:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al actualizar negocio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    
    res.status(500).json(response);
  }
};

// Eliminar negocio (soft delete)
export const deleteNegocio = async (req: Request, res: Response): Promise<void> => {
  console.log('🏢 Iniciando eliminación de negocio...');
  
  try {
    const idNegocio = parseInt(req.params.id);
    
    if (isNaN(idNegocio)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de negocio inválido'
      };
      res.status(400).json(response);
      return;
    }
    
    // Verificar si el negocio existe
    console.log('🔍 Verificando si el negocio existe...');
    const checkQuery = 'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE idNegocio = ?';
    const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [idNegocio]);
    
    if (existing.length === 0) {
      console.log('⚠️ Negocio no encontrado:', idNegocio);
      const response: ApiResponse = {
        success: false,
        message: 'Negocio no encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    // Soft delete - cambiar estatus a inactivo
    console.log('💾 Desactivando negocio...');
    const updateQuery = `
      UPDATE tblposcrumenwebnegocio 
      SET estatusnegocio = 0, fehamodificacionauditoria = NOW() 
      WHERE idNegocio = ?
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(updateQuery, [idNegocio]);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudo desactivar el negocio');
    }
    
    console.log(`✅ Negocio desactivado correctamente: ${idNegocio}`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Negocio desactivado correctamente'
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Error eliminando negocio:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al eliminar negocio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    
    res.status(500).json(response);
  }
};

// Crear parámetros de negocio
export const createParametrosNegocio = async (req: Request, res: Response): Promise<void> => {
  console.log('⚙️ Iniciando creación de parámetros de negocio...');
  
  try {
    const parametrosData: CreateParametrosNegocioCompletosData = req.body;
    console.log('📝 Datos recibidos:', parametrosData);
    
    // Validaciones
    if (!parametrosData.idNegocio) {
      const response: ApiResponse = {
        success: false,
        message: 'El ID del negocio es requerido'
      };
      res.status(400).json(response);
      return;
    }
    
    // Verificar si el negocio existe
    console.log('🔍 Verificando si el negocio existe...');
    const checkNegocioQuery = 'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE idNegocio = ?';
    const [existingNegocio] = await pool.execute<RowDataPacket[]>(checkNegocioQuery, [parametrosData.idNegocio]);
    
    if (existingNegocio.length === 0) {
      console.log('⚠️ Negocio no encontrado:', parametrosData.idNegocio);
      const response: ApiResponse = {
        success: false,
        message: 'El negocio especificado no existe'
      };
      res.status(404).json(response);
      return;
    }
    
    // Verificar si ya existen parámetros para este negocio
    console.log('🔍 Verificando parámetros existentes...');
    const checkParametrosQuery = 'SELECT idParametro FROM tblposcrumenwebparametrosnegocio WHERE idNegocio = ?';
    const [existingParametros] = await pool.execute<RowDataPacket[]>(checkParametrosQuery, [parametrosData.idNegocio]);
    
    if (existingParametros.length > 0) {
      console.log('⚠️ Ya existen parámetros para el negocio:', parametrosData.idNegocio);
      const response: ApiResponse = {
        success: false,
        message: 'Ya existen parámetros para este negocio'
      };
      res.status(400).json(response);
      return;
    }
    
    // Insertar parámetros
    const insertQuery = `
      INSERT INTO tblposcrumenwebparametrosnegocio (
        idNegocio, telefonoNegocio, telefonoPedidos, ubicacion, tipoNegocio,
        impresionRecibo, impresionTablero, envioWhats, encabezado, pie,
        impresionComanda, envioMensaje, estatus, fechaRegistroAuditoria, usuarioAuditoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    
    const insertValues = [
      parametrosData.idNegocio,
      parametrosData.telefonoNegocio?.trim() || '',
      parametrosData.telefonoPedidos?.trim() || '',
      parametrosData.ubicacion?.trim() || '',
      parametrosData.tipoNegocio?.trim() || '',
      parametrosData.impresionRecibo ? 1 : 0,
      parametrosData.impresionTablero ? 1 : 0,
      parametrosData.envioWhats ? 1 : 0,
      parametrosData.encabezado?.trim() || '',
      parametrosData.pie?.trim() || '',
      parametrosData.impresionComanda ? 1 : 0,
      parametrosData.envioMensaje ? 1 : 0,
      parametrosData.estatus ? 1 : 0,
      parametrosData.usuarioAuditoria
    ];
    
    console.log('💾 Insertando parámetros de negocio...');
    const [result] = await pool.execute<ResultSetHeader>(insertQuery, insertValues);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudieron insertar los parámetros del negocio');
    }
    
    console.log(`✅ Parámetros creados con ID: ${result.insertId}`);
    
    const response: ApiResponse<{ idParametro: number }> = {
      success: true,
      message: 'Parámetros de negocio creados correctamente',
      data: { idParametro: result.insertId }
    };
    
    res.status(201).json(response);
    
  } catch (error) {
    console.error('❌ Error creando parámetros de negocio:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al crear parámetros de negocio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    
    res.status(500).json(response);
  }
};

// Actualizar parámetros de negocio
export const updateParametrosNegocio = async (req: Request, res: Response): Promise<void> => {
  console.log('⚙️ Iniciando actualización de parámetros de negocio...');
  
  try {
    const idNegocio = parseInt(req.params.id);
    const parametrosData: UpdateParametrosNegocioCompletosData = req.body;
    
    console.log('📝 Datos recibidos:', { idNegocio, ...parametrosData });
    
    if (isNaN(idNegocio)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de negocio inválido'
      };
      res.status(400).json(response);
      return;
    }
    
    // Verificar si existen parámetros para este negocio
    console.log('🔍 Verificando parámetros existentes...');
    const checkQuery = 'SELECT idParametro FROM tblposcrumenwebparametrosnegocio WHERE idNegocio = ?';
    const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [idNegocio]);
    
    if (existing.length === 0) {
      console.log('⚠️ Parámetros no encontrados para el negocio:', idNegocio);
      const response: ApiResponse = {
        success: false,
        message: 'No se encontraron parámetros para este negocio'
      };
      res.status(404).json(response);
      return;
    }
    
    // Construir query de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (parametrosData.telefonoNegocio !== undefined) {
      updateFields.push('telefonoNegocio = ?');
      updateValues.push(parametrosData.telefonoNegocio.trim());
    }
    if (parametrosData.telefonoPedidos !== undefined) {
      updateFields.push('telefonoPedidos = ?');
      updateValues.push(parametrosData.telefonoPedidos.trim());
    }
    if (parametrosData.ubicacion !== undefined) {
      updateFields.push('ubicacion = ?');
      updateValues.push(parametrosData.ubicacion.trim());
    }
    if (parametrosData.tipoNegocio !== undefined) {
      updateFields.push('tipoNegocio = ?');
      updateValues.push(parametrosData.tipoNegocio.trim());
    }
    if (parametrosData.impresionRecibo !== undefined) {
      updateFields.push('impresionRecibo = ?');
      updateValues.push(parametrosData.impresionRecibo ? 1 : 0);
    }
    if (parametrosData.impresionTablero !== undefined) {
      updateFields.push('impresionTablero = ?');
      updateValues.push(parametrosData.impresionTablero ? 1 : 0);
    }
    if (parametrosData.envioWhats !== undefined) {
      updateFields.push('envioWhats = ?');
      updateValues.push(parametrosData.envioWhats ? 1 : 0);
    }
    if (parametrosData.encabezado !== undefined) {
      updateFields.push('encabezado = ?');
      updateValues.push(parametrosData.encabezado.trim());
    }
    if (parametrosData.pie !== undefined) {
      updateFields.push('pie = ?');
      updateValues.push(parametrosData.pie.trim());
    }
    if (parametrosData.impresionComanda !== undefined) {
      updateFields.push('impresionComanda = ?');
      updateValues.push(parametrosData.impresionComanda ? 1 : 0);
    }
    if (parametrosData.envioMensaje !== undefined) {
      updateFields.push('envioMensaje = ?');
      updateValues.push(parametrosData.envioMensaje ? 1 : 0);
    }
    if (parametrosData.estatus !== undefined) {
      updateFields.push('estatus = ?');
      updateValues.push(parametrosData.estatus ? 1 : 0);
    }
    if (parametrosData.usuarioAuditoria !== undefined) {
      updateFields.push('usuarioAuditoria = ?');
      updateValues.push(parametrosData.usuarioAuditoria);
    }
    
    // Siempre actualizar fecha de modificación
    updateFields.push('fechaModificacionAuditoria = NOW()');
    updateValues.push(idNegocio);
    
    if (updateFields.length === 1) { // Solo fecha de modificación
      const response: ApiResponse = {
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      };
      res.status(400).json(response);
      return;
    }
    
    const updateQuery = `
      UPDATE tblposcrumenwebparametrosnegocio 
      SET ${updateFields.join(', ')} 
      WHERE idNegocio = ?
    `;
    
    console.log('💾 Actualizando parámetros de negocio...');
    const [result] = await pool.execute<ResultSetHeader>(updateQuery, updateValues);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudieron actualizar los parámetros del negocio');
    }
    
    console.log(`✅ Parámetros actualizados correctamente para negocio: ${idNegocio}`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Parámetros de negocio actualizados correctamente'
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Error actualizando parámetros de negocio:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al actualizar parámetros de negocio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    
    res.status(500).json(response);
  }
};