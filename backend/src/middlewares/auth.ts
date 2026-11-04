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
    esCliente?: boolean; // true para tokens de clientes web (portal /clientes)
  };
}

/** idNegocio reservado del superusuario: administra todos los negocios */
export const ID_NEGOCIO_SUPERUSUARIO = 99999;

/** idRol que se asigna a los tokens de clientes web */
export const ID_ROL_CLIENTE_WEB = 99;

/**
 * Superusuario = usuario de personal (no cliente web) con idNegocio 99999.
 * No usar el nombre del usuario para esto: cualquiera puede llamarse 'SUPERUSUARIO'.
 */
export const esSuperUsuario = (req: AuthRequest): boolean =>
  !!req.user && !req.user.esCliente && req.user.idNegocio === ID_NEGOCIO_SUPERUSUARIO;

/**
 * Rutas permitidas a un token de cliente web. Un cliente solo arma y envía su
 * pedido en /ventas: lee el catálogo del negocio elegido, consulta el turno,
 * crea su venta y le agrega productos. Todo lo demás (usuarios, ventas del
 * negocio, reportes, clientes, configuración...) es exclusivo del personal.
 * Cualquier ruta nueva queda bloqueada para clientes hasta agregarla aquí.
 */
const RUTAS_CLIENTE_WEB: ReadonlyArray<{ metodo: string; ruta: RegExp }> = [
  { metodo: 'GET', ruta: /^\/api\/negocios\/\d+$/ }, // solo su negocio (se valida abajo)
  { metodo: 'GET', ruta: /^\/api\/productos-web$/ },
  { metodo: 'GET', ruta: /^\/api\/categorias$/ },
  { metodo: 'GET', ruta: /^\/api\/moderadores\/(ref\/)?negocio\/\d+$/ },
  { metodo: 'GET', ruta: /^\/api\/cat-moderadores$/ },
  { metodo: 'GET', ruta: /^\/api\/turnos\/turno-abierto$/ },
  { metodo: 'POST', ruta: /^\/api\/ventas-web$/ },
  { metodo: 'POST', ruta: /^\/api\/ventas-web\/\d+\/detalles$/ }, // solo sus pedidos (se valida en el controlador)
  { metodo: 'POST', ruta: /^\/api\/logs$/ },
  { metodo: 'POST', ruta: /^\/api\/auth\/cliente-token-negocio$/ },
  { metodo: 'GET', ruta: /^\/api\/auth\/mis-pedidos$/ },
  { metodo: 'POST', ruta: /^\/api\/auth\/enviar-mensaje-pedido$/ },
  { metodo: 'GET', ruta: /^\/api\/auth\/verify$/ },
];

const clientePuedeAcceder = (req: Request, idNegocioToken: number): boolean => {
  const ruta = `${req.baseUrl}${req.path}`.replace(/\/+$/, '');
  const permitida = RUTAS_CLIENTE_WEB.some(r => r.metodo === req.method && r.ruta.test(ruta));
  if (!permitida) return false;

  // Datos del negocio: solo el negocio que el cliente seleccionó
  const negocio = ruta.match(/^\/api\/negocios\/(\d+)$/);
  if (negocio) return Number(negocio[1]) === idNegocioToken;

  return true;
};

interface Usuario extends RowDataPacket {
  idUsuario: number;
  estatus: number;
}

interface ClienteWebRow extends RowDataPacket {
  idCliente: number;
  estatus: number;
}

/**
 * Middleware principal de autenticación JWT
 * Verifica que el token sea válido y que el usuario esté activo.
 * Soporta tanto tokens de usuarios normales como tokens de clientes web (isCliente: true).
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
      id?: number;
      clientId?: number;
      alias: string;
      nombre: string;
      idNegocio: number;
      idRol: number;
      isCliente?: boolean;
    };

    // --- Client token path ---
    if (decoded.isCliente && decoded.clientId) {
      const [clientRows] = await pool.execute<ClienteWebRow[]>(
        'SELECT idCliente, estatus FROM tblposcrumenwebclientes WHERE idCliente = ? AND estatus = 1',
        [decoded.clientId]
      );

      if (clientRows.length === 0) {
        res.status(401).json({
          success: false,
          error: 'Cliente no encontrado o inactivo',
          message: 'El cliente asociado a este token no existe o está inactivo'
        });
        return;
      }

      if (!clientePuedeAcceder(req, Number(decoded.idNegocio))) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'Esta operación no está disponible para clientes'
        });
        return;
      }

      req.user = {
        id: decoded.clientId,
        alias: decoded.alias,
        nombre: decoded.nombre,
        idNegocio: decoded.idNegocio,
        idRol: ID_ROL_CLIENTE_WEB,
        esCliente: true
      };

      next();
      return;
    }

    // Un token con isCliente pero sin clientId no es válido como token de personal
    if (decoded.isCliente || !decoded.id) {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
      return;
    }

    // --- Regular user token path ---
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
      id: decoded.id!,
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
 * Middleware para operaciones exclusivas del superusuario (idNegocio 99999):
 * datos globales del sistema como negocios, roles y anuncios.
 * Debe usarse DESPUÉS de authMiddleware.
 */
export const soloSuperUsuario = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!esSuperUsuario(req)) {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado',
      message: 'Solo el superusuario puede realizar esta acción'
    });
    return;
  }

  next();
};

/**
 * Middleware para rutas /:param que identifican un negocio: el usuario solo
 * puede operar sobre su propio negocio; el superusuario, sobre cualquiera.
 * Debe usarse DESPUÉS de authMiddleware.
 */
export const soloSuNegocio = (param = 'id') =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (esSuperUsuario(req) || Number(req.params[param]) === req.user?.idNegocio) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Acceso denegado',
      message: 'No tiene acceso a los datos de este negocio'
    });
  };

/**
 * Middleware para verificar privilegio mínimo del rol del usuario.
 * Consulta el privilegio del rol en la BD y verifica que sea >= minPrivilegio.
 * Debe usarse DESPUÉS de authMiddleware.
 */
export const checkPrivilegio = (minPrivilegio: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
        message: 'Debe estar autenticado para realizar esta acción'
      });
      return;
    }

    try {
      const [rolRows] = await pool.execute<RowDataPacket[]>(
        'SELECT privilegio FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
        [req.user.idRol]
      );

      if (rolRows.length === 0) {
        res.status(403).json({
          success: false,
          error: 'Rol no encontrado',
          message: 'No se pudo verificar el nivel de privilegio'
        });
        return;
      }

      const privilegio = Number(rolRows[0].privilegio) || 0;

      if (privilegio < minPrivilegio) {
        res.status(403).json({
          success: false,
          error: 'Privilegios insuficientes',
          message: 'No tiene privilegios suficientes para realizar esta acción'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error al verificar privilegio:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar privilegios'
      });
    }
  };
};
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
