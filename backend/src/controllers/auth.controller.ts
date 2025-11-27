import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import type { RowDataPacket } from 'mysql2';

interface Usuario extends RowDataPacket {
  idUsuario: number;
  idNegocio: number;
  idRol: number;
  nombre: string;
  alias: string;
  password: string;
  telefono: string;
  estatus: number;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
      return;
    }

    // Buscar usuario por alias (username) en la tabla real
    const [rows] = await pool.execute<Usuario[]>(
      'SELECT * FROM tblposcrumenwebusuarios WHERE alias = ? AND estatus = 1',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
      return;
    }

    const usuario = rows[0];

    // Verificar contraseña
    // Si la contraseña está hasheada en la BD, usar bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password);

    // Si las contraseñas NO están hasheadas en la BD (comparación directa)
    // const passwordValida = password === usuario.password;

    if (!passwordValida) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
      return;
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.idUsuario, 
        alias: usuario.alias,
        nombre: usuario.nombre,
        idNegocio: usuario.idNegocio,
        idRol: usuario.idRol
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id: usuario.idUsuario,
          nombre: usuario.nombre,
          alias: usuario.alias,
          telefono: usuario.telefono,
          idNegocio: usuario.idNegocio,
          idRol: usuario.idRol
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      nombre, 
      alias, 
      password, 
      idNegocio = 1, 
      idRol = 2, 
      telefono = '' 
    } = req.body;

    if (!nombre || !alias || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Nombre, alias (usuario) y contraseña son requeridos' 
      });
      return;
    }

    // Verificar si el alias (username) ya existe
    const [existingUsers] = await pool.execute<Usuario[]>(
      'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ?',
      [alias]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({ 
        success: false, 
        message: 'El nombre de usuario ya está registrado' 
      });
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    await pool.execute(
      `INSERT INTO tblposcrumenwebusuarios 
       (idNegocio, idRol, nombre, alias, password, telefono, estatus, fechaRegistroauditoria, usuarioauditoria) 
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), ?)`,
      [idNegocio, idRol, nombre, alias, hashedPassword, telefono, alias]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        usuario: req.body.usuario
      }
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};
