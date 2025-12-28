import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { 
  verificarBloqueo, 
  registrarIntentoFallido, 
  registrarLoginExitoso,
  desbloquearCuenta
} from '../services/loginAudit.service';

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

    // PASO 1: Verificar si el usuario existe
    const [rows] = await pool.execute<Usuario[]>(
      'SELECT * FROM tblposcrumenwebusuarios WHERE alias = ?',
      [email]
    );

    // Si el usuario NO existe, no revelar esta información
    if (rows.length === 0) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
      return;
    }

    const usuario = rows[0];

    // PASO 2: Verificar si el usuario está bloqueado
    const estadoBloqueo = await verificarBloqueo(email);
    
    if (!estadoBloqueo.permitido || estadoBloqueo.bloqueado) {
      res.status(403).json({ 
        success: false, 
        message: estadoBloqueo.mensaje,
        bloqueado: true,
        fechaBloqueado: estadoBloqueo.fechaBloqueado
      });
      return;
    }

    // PASO 3: Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      // AUDITORÍA: Registrar intento fallido
      await registrarIntentoFallido(email, usuario.idNegocio, req);
      
      // Obtener intentos restantes
      const estadoActualizado = await verificarBloqueo(email);
      
      res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos',
        intentosRestantes: estadoActualizado.intentosRestantes,
        advertencia: estadoActualizado.intentosRestantes && estadoActualizado.intentosRestantes <= 1 
          ? 'Atención: Su cuenta será bloqueada si falla nuevamente'
          : undefined
      });
      return;
    }

    // PASO 4: Verificar que el usuario esté activo (después de verificar contraseña)
    if (usuario.estatus !== 1) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario inactivo. Contacte al administrador' 
      });
      return;
    }

    // PASO 5: Login exitoso - Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.idUsuario, 
        alias: usuario.alias,
        nombre: usuario.nombre,
        idNegocio: usuario.idNegocio,
        idRol: usuario.idRol
      },
      process.env.JWT_SECRET || 'secret_key_pos54nwebcrumen_2024',
      { expiresIn: '8h' } // Token válido por 8 horas
    );

    // AUDITORÍA: Registrar login exitoso
    await registrarLoginExitoso(email, usuario.idNegocio, req);

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
          idRol: usuario.idRol,
          estatus: usuario.estatus
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

export const checkLoginStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alias } = req.params;

    if (!alias) {
      res.status(400).json({ 
        success: false, 
        message: 'Alias de usuario es requerido' 
      });
      return;
    }

    const estadoBloqueo = await verificarBloqueo(alias);
    
    res.json({
      success: true,
      data: {
        alias,
        bloqueado: estadoBloqueo.bloqueado || false,
        permitido: estadoBloqueo.permitido,
        mensaje: estadoBloqueo.mensaje,
        intentosRestantes: estadoBloqueo.intentosRestantes,
        fechaBloqueado: estadoBloqueo.fechaBloqueado
      }
    });
  } catch (error) {
    console.error('Error al verificar estado de login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};

export const unlockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alias } = req.params;

    if (!alias) {
      res.status(400).json({ 
        success: false, 
        message: 'Alias de usuario es requerido' 
      });
      return;
    }

    await desbloquearCuenta(alias);
    
    res.json({
      success: true,
      message: `Usuario ${alias} desbloqueado exitosamente`
    });
  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
};

export const ensureSuperuser = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Credenciales predefinidas según requisitos del sistema
    const superuserAlias = 'Crumen';
    const superuserPassword = 'Crumen.*';
    
    console.log('🔄 Verificando usuario SUPERUSUARIO...');
    
    // Buscar si el usuario ya existe
    const [usuarios] = await pool.execute<Usuario[]>(
      'SELECT idUsuario, alias, nombre, estatus, password FROM tblposcrumenwebusuarios WHERE alias = ?',
      [superuserAlias]
    );
    
    const hashedPassword = await bcrypt.hash(superuserPassword, 10);
    
    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      console.log('✅ SUPERUSUARIO encontrado, actualizando...');
      
      // Actualizar la contraseña y asegurar que esté activo
      await pool.execute(
        'UPDATE tblposcrumenwebusuarios SET password = ?, estatus = 1 WHERE alias = ?',
        [hashedPassword, superuserAlias]
      );
      
      // Limpiar intentos de login fallidos
      await desbloquearCuenta(superuserAlias);
      
      res.json({
        success: true,
        message: 'SUPERUSUARIO actualizado y cuenta desbloqueada exitosamente',
        data: {
          alias: superuserAlias,
          id: usuario.idUsuario,
          action: 'updated'
        }
      });
    } else {
      console.log('⚠️  SUPERUSUARIO no encontrado. Creándolo...');
      
      // Crear el SUPERUSUARIO con rol de administrador
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebusuarios 
         (idNegocio, idRol, nombre, alias, password, telefono, estatus, fechaRegistroauditoria, usuarioauditoria) 
         VALUES (1, 1, 'SUPERUSUARIO', ?, ?, '', 1, NOW(), 'system')`,
        [superuserAlias, hashedPassword]
      );
      
      res.json({
        success: true,
        message: 'SUPERUSUARIO creado exitosamente',
        data: {
          alias: superuserAlias,
          id: result.insertId,
          action: 'created'
        }
      });
    }
  } catch (error) {
    console.error('❌ Error al crear/actualizar SUPERUSUARIO:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la solicitud del SUPERUSUARIO' 
    });
  }
};

/**
 * Verifica si la tabla tblposcrumenwebusuarios está vacía
 */
export const checkUsersTableEmpty = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM tblposcrumenwebusuarios'
    );
    
    const isEmpty = rows[0].count === 0;
    
    res.json({
      success: true,
      data: {
        isEmpty,
        count: rows[0].count
      }
    });
  } catch (error) {
    console.error('❌ Error al verificar tabla de usuarios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar el estado de la tabla de usuarios' 
    });
  }
};

/**
 * Auto-login cuando la tabla está vacía
 * Crea una sesión temporal de 2 minutos con credenciales del sistema
 */
export const autoLogin = async (_req: Request, res: Response): Promise<void> => {
  try {
    // PASO 1: Verificar si la tabla está vacía
    const [countRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM tblposcrumenwebusuarios'
    );
    
    if (countRows[0].count > 0) {
      res.status(403).json({ 
        success: false, 
        message: 'Auto-login solo disponible cuando la tabla de usuarios está vacía' 
      });
      return;
    }

    // PASO 2: Datos del usuario temporal del sistema
    const systemUser = {
      idUsuario: 99999,
      alias: 'crumensys',
      nombre: 'adminsistemas',
      idNegocio: 99999,
      idRol: 1, // Rol de administrador
      estatus: 1
    };

    // PASO 3: Generar token JWT temporal de 2 minutos
    const token = jwt.sign(
      { 
        id: systemUser.idUsuario, 
        alias: systemUser.alias,
        nombre: systemUser.nombre,
        idNegocio: systemUser.idNegocio,
        idRol: systemUser.idRol
      },
      process.env.JWT_SECRET || 'secret_key_pos54nwebcrumen_2024',
      { expiresIn: '2m' } // Token válido por 2 minutos
    );

    console.log('🔓 Auto-login realizado - Sesión temporal de 2 minutos');

    res.json({
      success: true,
      message: 'Auto-login exitoso - Sesión temporal de 2 minutos',
      data: {
        token,
        usuario: systemUser,
        isTemporary: true,
        expiresIn: '2m'
      }
    });
  } catch (error) {
    console.error('❌ Error en auto-login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el auto-login' 
    });
  }
};
