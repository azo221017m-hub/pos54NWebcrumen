import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import type { RowDataPacket } from 'mysql2';

// Interface extendida del Request con información del usuario autenticado
export interface AuthRequest extends Request {
  user?: {
    id: number;
    alias: string;
    nombre: string;
    idNegocio: number;
    idRol: number;
  };
}

interface Usuario extends RowDataPacket {
  idUsuario: number;
  estatus: number;
}

/**
 * Middleware principal de autenticación JWT
 * Verifica que el token sea válido y que el usuario esté activo
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación',
        message: 'Debe incluir el token en el header Authorization como: Bearer <token>'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de autenticación inválido'
      });
      return;
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret_key_pos54nwebcrumen_2024'
    ) as {
      id: number;
      alias: string;
      nombre: string;
      idNegocio: number;
      idRol: number;
    };

    // Verificar que el usuario aún existe y está activo
    const [rows] = await pool.execute<Usuario[]>(
      'SELECT idUsuario, estatus FROM tblposcrumenwebusuarios WHERE idUsuario = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
        message: 'El usuario asociado a este token ya no existe'
      });
      return;
    }

    const usuario = rows[0];

    if (usuario.estatus !== 1) {
      res.status(401).json({
        success: false,
        error: 'Usuario inactivo',
        message: 'Su cuenta ha sido desactivada. Contacte al administrador'
      });
      return;
    }

    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      alias: decoded.alias,
      nombre: decoded.nombre,
      idNegocio: decoded.idNegocio,
      idRol: decoded.idRol
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado',
        message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente',
        expired: true
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
      return;
    }

    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * Debe usarse DESPUÉS de authMiddleware
 */
export const checkRole = (...rolesPermitidos: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
      return;
    }

    if (!rolesPermitidos.includes(req.user.idRol)) {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado',
        message: 'No tiene permisos suficientes para realizar esta acción'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario pertenece a un negocio específico
 * Debe usarse DESPUÉS de authMiddleware
 */
export const checkNegocio = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Usuario no autenticado'
    });
    return;
  }

  const negocioParam = req.params.idnegocio || req.body.idnegocio || req.query.idnegocio;

  if (negocioParam && parseInt(negocioParam as string) !== req.user.idNegocio) {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado',
      message: 'No tiene acceso a los datos de este negocio'
    });
    return;
  }

  next();
};

/**
 * Middleware opcional - No requiere autenticación pero agrega info si existe
 * Útil para endpoints públicos que pueden personalizar respuesta si hay usuario
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'secret_key_pos54nwebcrumen_2024'
      ) as {
        id: number;
        alias: string;
        nombre: string;
        idNegocio: number;
        idRol: number;
      };

      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario autenticado
    next();
  }
};
