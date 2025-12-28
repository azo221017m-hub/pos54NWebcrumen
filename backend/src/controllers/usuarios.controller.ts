import { Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import type { AuthRequest } from '../middlewares/auth';

// Obtener todos los usuarios
export const obtenerUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioAlias = req.user?.alias;
    const usuarioNombre = req.user?.nombre;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Log de producción para depuración (requerido por especificaciones del sistema)
    // Este log es intencional para rastrear accesos a usuarios y depurar problemas de filtrado
    console.log(`📋 [USUARIOS] Mostrando usuarios con idNegocio: ${idnegocio} | Usuario: ${usuarioNombre} (${usuarioAlias}) | Timestamp: ${new Date().toISOString()}`);

    // Si idnegocio == 99999, mostrar todos los usuarios
    // Si idnegocio != 99999, mostrar solo usuarios con el mismo idnegocio
    let query = `SELECT 
        idUsuario, 
        idNegocio, 
        idRol, 
        nombre, 
        alias, 
        telefono, 
        cumple, 
        frasepersonal, 
        desempeno, 
        popularidad, 
        estatus, 
        fechaRegistroauditoria, 
        usuarioauditoria, 
        fehamodificacionauditoria,
        LENGTH(fotoine) as fotoine_size,
        LENGTH(fotopersona) as fotopersona_size,
        LENGTH(fotoavatar) as fotoavatar_size,
        fotoavatar
      FROM tblposcrumenwebusuarios`;
    
    const params: any[] = [];
    
    if (idnegocio !== 99999) {
      query += ` WHERE idNegocio = ?`;
      params.push(idnegocio);
    }
    
    query += ` ORDER BY fechaRegistroauditoria DESC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    
    // Log adicional con resultados
    console.log(`✅ [USUARIOS] Encontrados ${rows.length} usuarios para idNegocio: ${idnegocio}`);
    
    // Convertir fotoavatar de Buffer a Base64
    const usuariosConAvatares = rows.map(usuario => ({
      ...usuario,
      fotoavatar: usuario.fotoavatar ? (usuario.fotoavatar as Buffer).toString('base64') : null
    }));
    
    res.json({
      success: true,
      data: usuariosConAvatares,
      message: 'Usuarios obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    // Si idnegocio == 99999, permitir ver cualquier usuario
    // Si idnegocio != 99999, solo ver usuarios del mismo negocio
    let query = `SELECT 
        idUsuario, 
        idNegocio, 
        idRol, 
        nombre, 
        alias, 
        telefono, 
        cumple, 
        frasepersonal, 
        desempeno, 
        popularidad, 
        estatus, 
        fechaRegistroauditoria, 
        usuarioauditoria, 
        fehamodificacionauditoria,
        fotoine,
        fotopersona,
        fotoavatar
      FROM tblposcrumenwebusuarios 
      WHERE idUsuario = ?`;
    
    const params: any[] = [id];
    
    if (idnegocio !== 99999) {
      query += ` AND idNegocio = ?`;
      params.push(idnegocio);
    }
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    
    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    res.json({
      success: true,
      data: rows[0],
      message: 'Usuario obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Crear un nuevo usuario
export const crearUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      idNegocio,
      idRol,
      nombre,
      alias,
      password,
      telefono,
      cumple,
      frasepersonal,
      desempeno,
      popularidad,
      estatus,
      usuarioauditoria,
      fotoine,
      fotopersona,
      fotoavatar
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const userIdNegocio = req.user?.idNegocio;

    if (!userIdNegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Si no se proporciona idNegocio, usar el del usuario autenticado
    const finalIdNegocio = idNegocio ?? userIdNegocio;

    // Validar que el idNegocio proporcionado coincida con el del usuario autenticado
    // (a menos que sea superusuario con idNegocio = 99999)
    if (userIdNegocio !== 99999 && finalIdNegocio !== userIdNegocio) {
      res.status(403).json({
        success: false,
        message: 'No tiene permiso para crear usuarios en otro negocio'
      });
      return;
    }

    // Validaciones básicas
    if (!nombre || !alias || !password) {
      res.status(400).json({
        success: false,
        message: 'Nombre, alias y password son obligatorios'
      });
      return;
    }

    // Verificar si el alias ya existe en el mismo negocio
    const [existente] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ? AND idNegocio = ?',
      [alias, finalIdNegocio]
    );

    if (existente.length > 0) {
      res.status(400).json({
        success: false,
        message: 'El alias ya está en uso'
      });
      return;
    }

    // Formatear fecha de cumpleaños si existe
    let cumpleFormatted = cumple;
    if (cumple) {
      const fecha = new Date(cumple);
      if (!isNaN(fecha.getTime())) {
        // Convertir a formato YYYY-MM-DD
        cumpleFormatted = fecha.toISOString().split('T')[0];
      }
    }

    // Convertir imágenes base64 a Buffer si están presentes
    const fotoineBuffer = fotoine ? Buffer.from(fotoine, 'base64') : null;
    const fotopersonaBuffer = fotopersona ? Buffer.from(fotopersona, 'base64') : null;
    const fotoavatarBuffer = fotoavatar ? Buffer.from(fotoavatar, 'base64') : null;

    // Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebusuarios (
        idNegocio, 
        idRol, 
        nombre, 
        alias, 
        password, 
        telefono, 
        cumple, 
        frasepersonal, 
        desempeno, 
        popularidad, 
        estatus, 
        fotoine,
        fotopersona,
        fotoavatar,
        fechaRegistroauditoria, 
        usuarioauditoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        finalIdNegocio,
        idRol || null,
        nombre,
        alias,
        hashedPassword,
        telefono || null,
        cumpleFormatted || null,
        frasepersonal || null,
        desempeno || 0,
        popularidad || 0,
        estatus !== undefined ? estatus : 1,
        fotoineBuffer,
        fotopersonaBuffer,
        fotoavatarBuffer,
        usuarioauditoria || 'sistema'
      ]
    );

    res.status(201).json({
      success: true,
      data: { idUsuario: result.insertId },
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      idNegocio,
      idRol,
      nombre,
      alias,
      password,
      telefono,
      cumple,
      frasepersonal,
      desempeno,
      popularidad,
      estatus,
      usuarioauditoria,
      fotoine,
      fotopersona,
      fotoavatar
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const userIdNegocio = req.user?.idNegocio;

    if (!userIdNegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si el usuario existe y obtener su idNegocio actual
    // Si idnegocio == 99999, permitir editar cualquier usuario
    // Si idnegocio != 99999, solo editar usuarios del mismo negocio
    let queryExiste = 'SELECT idUsuario, idNegocio FROM tblposcrumenwebusuarios WHERE idUsuario = ?';
    const paramsExiste: any[] = [id];
    
    if (userIdNegocio !== 99999) {
      queryExiste += ' AND idNegocio = ?';
      paramsExiste.push(userIdNegocio);
    }
    
    const [existe] = await pool.execute<RowDataPacket[]>(queryExiste, paramsExiste);

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    const usuarioActual = existe[0];

    // Verificar si el alias ya existe en otro usuario del mismo negocio
    const [aliasExiste] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ? AND idUsuario != ? AND idNegocio = ?',
      [alias, id, userIdNegocio]
    );

    if (aliasExiste.length > 0) {
      res.status(400).json({
        success: false,
        message: 'El alias ya está en uso por otro usuario'
      });
      return;
    }

    // Validar que el idNegocio no pueda ser cambiado por usuarios no-superusuarios
    // Si se intenta cambiar el idNegocio y el usuario no es superusuario, rechazar
    if (idNegocio !== undefined && idNegocio !== null && userIdNegocio !== 99999) {
      if (usuarioActual.idNegocio !== idNegocio) {
        res.status(403).json({
          success: false,
          message: 'No tiene permiso para cambiar el negocio de un usuario'
        });
        return;
      }
    }

    // Formatear fecha de cumpleaños si existe
    let cumpleFormatted = cumple;
    if (cumple) {
      const fecha = new Date(cumple);
      if (!isNaN(fecha.getTime())) {
        // Convertir a formato YYYY-MM-DD
        cumpleFormatted = fecha.toISOString().split('T')[0];
      }
    }

    // Construir query dinámicamente
    let query = `UPDATE tblposcrumenwebusuarios SET 
      idNegocio = ?,
      idRol = ?,
      nombre = ?,
      alias = ?,
      telefono = ?,
      cumple = ?,
      frasepersonal = ?,
      desempeno = ?,
      popularidad = ?,
      estatus = ?,
      usuarioauditoria = ?,
      fehamodificacionauditoria = NOW()`;
    
    let params: any[] = [
      idNegocio || null,
      idRol || null,
      nombre,
      alias,
      telefono || null,
      cumpleFormatted || null,
      frasepersonal || null,
      desempeno || 0,
      popularidad || 0,
      estatus !== undefined ? estatus : 1,
      usuarioauditoria || 'sistema'
    ];

    // Si se proporciona password, hash y actualizarlo
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    // Actualizar imágenes si se proporcionan
    if (fotoine !== undefined) {
      query += ', fotoine = ?';
      params.push(fotoine ? Buffer.from(fotoine, 'base64') : null);
    }

    if (fotopersona !== undefined) {
      query += ', fotopersona = ?';
      params.push(fotopersona ? Buffer.from(fotopersona, 'base64') : null);
    }

    if (fotoavatar !== undefined) {
      query += ', fotoavatar = ?';
      params.push(fotoavatar ? Buffer.from(fotoavatar, 'base64') : null);
    }

    query += ' WHERE idUsuario = ?';
    params.push(id);
    
    if (userIdNegocio !== 99999) {
      query += ' AND idNegocio = ?';
      params.push(userIdNegocio);
    }

    await pool.execute(query, params);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar un usuario (soft delete)
export const eliminarUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si el usuario existe
    // Si idnegocio == 99999, permitir eliminar cualquier usuario
    // Si idnegocio != 99999, solo eliminar usuarios del mismo negocio
    let queryExiste = 'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?';
    const paramsExiste: any[] = [id];
    
    if (idnegocio !== 99999) {
      queryExiste += ' AND idNegocio = ?';
      paramsExiste.push(idnegocio);
    }
    
    const [existe] = await pool.execute<RowDataPacket[]>(queryExiste, paramsExiste);

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Construir query de eliminación
    let queryDelete = 'UPDATE tblposcrumenwebusuarios SET estatus = 0, fehamodificacionauditoria = NOW() WHERE idUsuario = ?';
    const paramsDelete: any[] = [id];
    
    if (idnegocio !== 99999) {
      queryDelete += ' AND idNegocio = ?';
      paramsDelete.push(idnegocio);
    }
    
    await pool.execute(queryDelete, paramsDelete);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Cambiar estatus de un usuario
export const cambiarEstatusUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estatus } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si el usuario existe
    // Si idnegocio == 99999, permitir cambiar estatus de cualquier usuario
    // Si idnegocio != 99999, solo cambiar estatus de usuarios del mismo negocio
    let queryExiste = 'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?';
    const paramsExiste: any[] = [id];
    
    if (idnegocio !== 99999) {
      queryExiste += ' AND idNegocio = ?';
      paramsExiste.push(idnegocio);
    }
    
    const [existe] = await pool.execute<RowDataPacket[]>(queryExiste, paramsExiste);

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Construir query de actualización
    let queryUpdate = 'UPDATE tblposcrumenwebusuarios SET estatus = ?, fehamodificacionauditoria = NOW() WHERE idUsuario = ?';
    const paramsUpdate: any[] = [estatus, id];
    
    if (idnegocio !== 99999) {
      queryUpdate += ' AND idNegocio = ?';
      paramsUpdate.push(idnegocio);
    }
    
    await pool.execute(queryUpdate, paramsUpdate);

    res.json({
      success: true,
      message: 'Estatus actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar estatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estatus',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Validar si un alias es único
export const validarAliasUnico = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alias, idUsuario } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si el alias es único dentro del negocio
    let query = 'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ?';
    const params: any[] = [alias];

    // Si idnegocio != 99999, filtrar por negocio
    if (idnegocio !== 99999) {
      query += ' AND idNegocio = ?';
      params.push(idnegocio);
    }

    if (idUsuario) {
      query += ' AND idUsuario != ?';
      params.push(idUsuario);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: { esUnico: rows.length === 0 }
    });
  } catch (error) {
    console.error('Error al validar alias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar alias',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar imagen de usuario
export const actualizarImagenUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tipoImagen, imagen } = req.body; // tipoImagen: 'fotoine' | 'fotopersona' | 'fotoavatar'

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!['fotoine', 'fotopersona', 'fotoavatar'].includes(tipoImagen)) {
      res.status(400).json({
        success: false,
        message: 'Tipo de imagen inválido'
      });
      return;
    }

    // Verificar si el usuario existe
    // Si idnegocio == 99999, permitir actualizar imagen de cualquier usuario
    // Si idnegocio != 99999, solo actualizar imagen de usuarios del mismo negocio
    let queryExiste = 'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?';
    const paramsExiste: any[] = [id];
    
    if (idnegocio !== 99999) {
      queryExiste += ' AND idNegocio = ?';
      paramsExiste.push(idnegocio);
    }
    
    const [existe] = await pool.execute<RowDataPacket[]>(queryExiste, paramsExiste);

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Construir query de actualización
    let queryUpdate = `UPDATE tblposcrumenwebusuarios SET ${tipoImagen} = ?, fehamodificacionauditoria = NOW() WHERE idUsuario = ?`;
    const paramsUpdate: any[] = [imagen, id];
    
    if (idnegocio !== 99999) {
      queryUpdate += ' AND idNegocio = ?';
      paramsUpdate.push(idnegocio);
    }
    
    await pool.execute(queryUpdate, paramsUpdate);

    res.json({
      success: true,
      message: 'Imagen actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar imagen',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener imagen de usuario por tipo
export const obtenerImagenUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, tipo } = req.params;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Validar tipo de imagen
    const tiposValidos = ['fotoine', 'fotopersona', 'fotoavatar'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({
        success: false,
        message: 'Tipo de imagen no válido'
      });
      return;
    }

    // Si idnegocio == 99999, permitir obtener imagen de cualquier usuario
    // Si idnegocio != 99999, solo obtener imagen de usuarios del mismo negocio
    let query = `SELECT ${tipo} FROM tblposcrumenwebusuarios WHERE idUsuario = ?`;
    const params: any[] = [id];
    
    if (idnegocio !== 99999) {
      query += ' AND idNegocio = ?';
      params.push(idnegocio);
    }
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    if (rows.length === 0 || !rows[0][tipo]) {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
      return;
    }

    // Convertir Buffer a Base64
    const imagenBuffer = rows[0][tipo] as Buffer;
    const imagenBase64 = imagenBuffer.toString('base64');

    res.json({
      success: true,
      data: {
        imagen: imagenBase64,
        tipo: tipo
      },
      message: 'Imagen obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener imagen',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar imagen de usuario
export const eliminarImagenUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, tipo } = req.params;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Validar tipo de imagen
    const tiposValidos = ['fotoine', 'fotopersona', 'fotoavatar'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({
        success: false,
        message: 'Tipo de imagen no válido'
      });
      return;
    }

    // Si idnegocio == 99999, permitir eliminar imagen de cualquier usuario
    // Si idnegocio != 99999, solo eliminar imagen de usuarios del mismo negocio
    let query = `UPDATE tblposcrumenwebusuarios SET ${tipo} = NULL, fehamodificacionauditoria = NOW() WHERE idUsuario = ?`;
    const params: any[] = [id];
    
    if (idnegocio !== 99999) {
      query += ' AND idNegocio = ?';
      params.push(idnegocio);
    }
    
    await pool.execute(query, params);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
