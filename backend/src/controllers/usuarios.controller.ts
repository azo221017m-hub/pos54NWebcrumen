import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

// Obtener todos los usuarios
export const obtenerUsuarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
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
      FROM tblposcrumenwebusuarios
      ORDER BY fechaRegistroauditoria DESC`
    );
    
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
export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
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
      WHERE idUsuario = ?`,
      [id]
    );
    
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
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
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

    // Validaciones básicas
    if (!nombre || !alias || !password) {
      res.status(400).json({
        success: false,
        message: 'Nombre, alias y password son obligatorios'
      });
      return;
    }

    // Verificar si el alias ya existe
    const [existente] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ?',
      [alias]
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
        idNegocio || null,
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
export const actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
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

    // Verificar si el usuario existe
    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [id]
    );

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Verificar si el alias ya existe en otro usuario
    const [aliasExiste] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ? AND idUsuario != ?',
      [alias, id]
    );

    if (aliasExiste.length > 0) {
      res.status(400).json({
        success: false,
        message: 'El alias ya está en uso por otro usuario'
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
export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [id]
    );

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    await pool.execute(
      'UPDATE tblposcrumenwebusuarios SET estatus = 0, fehamodificacionauditoria = NOW() WHERE idUsuario = ?',
      [id]
    );

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
export const cambiarEstatusUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estatus } = req.body;

    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [id]
    );

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    await pool.execute(
      'UPDATE tblposcrumenwebusuarios SET estatus = ?, fehamodificacionauditoria = NOW() WHERE idUsuario = ?',
      [estatus, id]
    );

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
export const validarAliasUnico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alias, idUsuario } = req.body;

    let query = 'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ?';
    const params: any[] = [alias];

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
export const actualizarImagenUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tipoImagen, imagen } = req.body; // tipoImagen: 'fotoine' | 'fotopersona' | 'fotoavatar'

    if (!['fotoine', 'fotopersona', 'fotoavatar'].includes(tipoImagen)) {
      res.status(400).json({
        success: false,
        message: 'Tipo de imagen inválido'
      });
      return;
    }

    const [existe] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [id]
    );

    if (existe.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    await pool.execute(
      `UPDATE tblposcrumenwebusuarios SET ${tipoImagen} = ?, fehamodificacionauditoria = NOW() WHERE idUsuario = ?`,
      [imagen, id]
    );

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
export const obtenerImagenUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, tipo } = req.params;

    // Validar tipo de imagen
    const tiposValidos = ['fotoine', 'fotopersona', 'fotoavatar'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({
        success: false,
        message: 'Tipo de imagen no válido'
      });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${tipo} FROM tblposcrumenwebusuarios WHERE idUsuario = ?`,
      [id]
    );

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
export const eliminarImagenUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, tipo } = req.params;

    // Validar tipo de imagen
    const tiposValidos = ['fotoine', 'fotopersona', 'fotoavatar'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({
        success: false,
        message: 'Tipo de imagen no válido'
      });
      return;
    }

    await pool.execute(
      `UPDATE tblposcrumenwebusuarios SET ${tipo} = NULL, fehamodificacionauditoria = NOW() WHERE idUsuario = ?`,
      [id]
    );

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
