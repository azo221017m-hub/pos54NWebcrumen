import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Helper function to detect image MIME type from buffer
const detectImageMimeType = (buffer: Buffer): string => {
  // Check the magic bytes (file signature) to detect image type
  const magicBytes = buffer.slice(0, 4);
  
  // PNG: 89 50 4E 47
  if (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47) {
    return 'image/png';
  }
  
  // JPEG: FF D8 FF
  if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // GIF: 47 49 46 38 (GIF8)
  if (magicBytes[0] === 0x47 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x38) {
    return 'image/gif';
  }
  
  // WebP: 52 49 46 46 (RIFF) - need to check further bytes
  if (magicBytes[0] === 0x52 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x46) {
    const webpCheck = buffer.slice(8, 12);
    if (webpCheck[0] === 0x57 && webpCheck[1] === 0x45 && webpCheck[2] === 0x42 && webpCheck[3] === 0x50) {
      return 'image/webp';
    }
  }
  
  // BMP: 42 4D
  if (magicBytes[0] === 0x42 && magicBytes[1] === 0x4D) {
    return 'image/bmp';
  }
  
  // Default to PNG if unable to detect
  return 'image/png';
};

// Obtener todos los negocios
export const obtenerNegocios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [negocios] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebnegocio ORDER BY nombreNegocio ASC'
    );

    // Convert logotipo Buffer to Base64 string for frontend consumption
    const negociosConLogotipo = (negocios as any[]).map(negocio => ({
      ...negocio,
      logotipo: negocio.logotipo ? (() => {
        const buffer = negocio.logotipo as Buffer;
        const mimeType = detectImageMimeType(buffer);
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
      })() : null
    }));

    res.json({
      success: true,
      message: 'Negocios obtenidos exitosamente',
      data: negociosConLogotipo,
    });
  } catch (error) {
    console.error('Error al obtener negocios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener negocios',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// Obtener un negocio por ID con sus parámetros
export const obtenerNegocioPorId = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Obtener negocio
    const [negocios] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebnegocio WHERE idNegocio = ?',
      [id]
    );

    if (negocios.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Negocio no encontrado',
      });
      return;
    }

    // Obtener parámetros
    const [parametros] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebparametrosnegocio WHERE idNegocio = ?',
      [id]
    );

    // Convert logotipo Buffer to Base64 string for frontend consumption
    const negocio = negocios[0];
    const negocioConLogotipo = {
      ...negocio,
      logotipo: negocio.logotipo ? (() => {
        const buffer = negocio.logotipo as Buffer;
        const mimeType = detectImageMimeType(buffer);
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
      })() : null
    };

    res.json({
      success: true,
      message: 'Negocio obtenido exitosamente',
      data: {
        negocio: negocioConLogotipo,
        parametros: parametros[0] || null,
      },
    });
  } catch (error) {
    console.error('Error al obtener negocio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener negocio',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// Crear un nuevo negocio con sus parámetros
export const crearNegocio = async (req: Request, res: Response): Promise<void> => {
  const { negocio, parametros } = req.body;

  const conn = await pool.getConnection();

  try {
    // Validar que el nombre sea único
    const [negociosExistentes] = await conn.execute<RowDataPacket[]>(
      'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE nombreNegocio = ?',
      [negocio.nombreNegocio]
    );

    if (negociosExistentes.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un negocio con ese nombre',
      });
      conn.release();
      return;
    }

    // Iniciar transacción
    await conn.beginTransaction();

    try {
      // Insertar negocio con numeronegocio temporal
      const [resultNegocio] = await conn.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebnegocio 
        (numeronegocio, nombreNegocio, rfcnegocio, direccionfiscalnegocio, contactonegocio, 
         logotipo, telefonocontacto, estatusnegocio, fechaRegistroauditoria, usuarioauditoria)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          'TEMP', // Valor temporal que será actualizado inmediatamente
          negocio.nombreNegocio,
          negocio.rfcnegocio,
          negocio.direccionfiscalnegocio,
          negocio.contactonegocio,
          negocio.logotipo || null,
          negocio.telefonocontacto,
          negocio.estatusnegocio,
          negocio.usuarioauditoria || 'sistema',
        ]
      );

      const idNegocio = resultNegocio.insertId;

      // Generar número de negocio automáticamente basado en el ID
      const numeronegocio = `NEG${String(idNegocio).padStart(3, '0')}`;
      
      // Actualizar el número de negocio con el valor correcto
      await conn.execute(
        'UPDATE tblposcrumenwebnegocio SET numeronegocio = ? WHERE idNegocio = ?',
        [numeronegocio, idNegocio]
      );

      // Insertar parámetros
      await conn.execute(
        `INSERT INTO tblposcrumenwebparametrosnegocio
        (idNegocio, telefonoNegocio, telefonoPedidos, ubicacion, tipoNegocio, 
         impresionRecibo, impresionTablero, envioWhats, encabezado, pie, 
         impresionComanda, envioMensaje, estatus, fechaRegistroauditoria, usuarioauditoria)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          idNegocio,
          parametros.telefonoNegocio,
          parametros.telefonoPedidos,
          parametros.ubicacion,
          parametros.tipoNegocio,
          parametros.impresionRecibo,
          parametros.impresionTablero,
          parametros.envioWhats,
          parametros.encabezado,
          parametros.pie,
          parametros.impresionComanda,
          parametros.envioMensaje,
          parametros.estatus,
          parametros.usuarioAuditoria || 'sistema',
        ]
      );

      // Confirmar transacción
      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Negocio creado exitosamente',
        data: { idNegocio },
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await conn.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al crear negocio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear negocio',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    conn.release();
  }
};

// Actualizar un negocio y sus parámetros
export const actualizarNegocio = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { negocio, parametros } = req.body;

  const conn = await pool.getConnection();

  try {
    // Validar que el nombre sea único (excepto para el negocio actual)
    const [negociosExistentes] = await conn.execute<RowDataPacket[]>(
      'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE nombreNegocio = ? AND idNegocio != ?',
      [negocio.nombreNegocio, id]
    );

    if (negociosExistentes.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya existe otro negocio con ese nombre',
      });
      conn.release();
      return;
    }

    // Iniciar transacción
    await conn.beginTransaction();

    try {
      // Actualizar negocio
      await conn.execute(
        `UPDATE tblposcrumenwebnegocio 
        SET numeronegocio = ?, nombreNegocio = ?, rfcnegocio = ?, 
            direccionfiscalnegocio = ?, contactonegocio = ?, logotipo = ?,
            telefonocontacto = ?, estatusnegocio = ?, 
            fehamodificacionauditoria = NOW(), usuarioauditoria = ?
        WHERE idNegocio = ?`,
        [
          negocio.numeronegocio,
          negocio.nombreNegocio,
          negocio.rfcnegocio,
          negocio.direccionfiscalnegocio,
          negocio.contactonegocio,
          negocio.logotipo || null,
          negocio.telefonocontacto,
          negocio.estatusnegocio,
          negocio.usuarioauditoria || 'sistema',
          id,
        ]
      );

      // Actualizar parámetros
      await conn.execute(
        `UPDATE tblposcrumenwebparametrosnegocio
        SET telefonoNegocio = ?, telefonoPedidos = ?, ubicacion = ?, tipoNegocio = ?,
            impresionRecibo = ?, impresionTablero = ?, envioWhats = ?, 
            encabezado = ?, pie = ?, impresionComanda = ?, envioMensaje = ?,
            estatus = ?, fechamodificacionauditoria = NOW(), usuarioauditoria = ?
        WHERE idNegocio = ?`,
        [
          parametros.telefonoNegocio,
          parametros.telefonoPedidos,
          parametros.ubicacion,
          parametros.tipoNegocio,
          parametros.impresionRecibo,
          parametros.impresionTablero,
          parametros.envioWhats,
          parametros.encabezado,
          parametros.pie,
          parametros.impresionComanda,
          parametros.envioMensaje,
          parametros.estatus,
          parametros.usuarioAuditoria || 'sistema',
          id,
        ]
      );

      // Confirmar transacción
      await conn.commit();

      res.json({
        success: true,
        message: 'Negocio actualizado exitosamente',
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await conn.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar negocio',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    conn.release();
  }
};

// Eliminar un negocio (soft delete)
export const eliminarNegocio = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await pool.execute(
      'UPDATE tblposcrumenwebnegocio SET estatusnegocio = 0, fehamodificacionauditoria = NOW() WHERE idNegocio = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Negocio eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar negocio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar negocio',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// Cambiar estatus de un negocio
export const cambiarEstatusNegocio = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estatus } = req.body;

  try {
    await pool.execute(
      'UPDATE tblposcrumenwebnegocio SET estatusnegocio = ?, fehamodificacionauditoria = NOW() WHERE idNegocio = ?',
      [estatus, id]
    );

    res.json({
      success: true,
      message: 'Estatus actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al cambiar estatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estatus',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// Validar que el nombre sea único
export const validarNombreUnico = async (req: Request, res: Response): Promise<void> => {
  const { nombreNegocio, idNegocio } = req.body;

  try {
    let query = 'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE nombreNegocio = ?';
    const params: (string | number)[] = [nombreNegocio];

    if (idNegocio) {
      query += ' AND idNegocio != ?';
      params.push(idNegocio);
    }

    const [negocios] = await pool.execute<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      disponible: negocios.length === 0,
    });
  } catch (error) {
    console.error('Error al validar nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar nombre',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// Subir logotipo
export const subirLogotipo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const { logotipo } = req.body;

    await pool.execute(
      'UPDATE tblposcrumenwebnegocio SET logotipo = ?, fehamodificacionauditoria = NOW() WHERE idNegocio = ?',
      [logotipo, id]
    );

    res.json({
      success: true,
      message: 'Logotipo actualizado exitosamente',
      data: { logotipo },
    });
  } catch (error) {
    console.error('Error al subir logotipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir logotipo',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// Obtener el próximo número de negocio
export const obtenerProximoNumeroNegocio = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT MAX(idNegocio) as maxId FROM tblposcrumenwebnegocio'
    );

    const maxId = rows[0]?.maxId || 0;
    const proximoId = maxId + 1;
    const proximoNumero = `NEG${String(proximoId).padStart(3, '0')}`;

    res.json({
      success: true,
      message: 'Próximo número obtenido exitosamente',
      data: { proximoNumero, proximoId },
    });
  } catch (error) {
    console.error('Error al obtener próximo número:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener próximo número',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
