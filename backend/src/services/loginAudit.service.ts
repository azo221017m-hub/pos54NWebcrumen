import type { Request } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { 
  IntentoLogin, 
  LoginMetadata, 
  LoginAuditResponse 
} from '../types/intentoLogin.types';

// Constantes
const MAX_INTENTOS_PERMITIDOS = 3;
const TIEMPO_BLOQUEO_MINUTOS = 30; // Tiempo de bloqueo después de exceder intentos

/**
 * Extraer metadata del request para auditoría
 */
export const extraerMetadata = (req: Request, exito: boolean, mensaje?: string): LoginMetadata => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.socket.remoteAddress || '';
  
  return {
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    navegador: extraerNavegador(userAgent),
    sistemaOperativo: extraerSO(userAgent),
    dispositivo: extraerDispositivo(userAgent),
    exito,
    mensaje: mensaje || (exito ? 'Login exitoso' : 'Login fallido'),
    tokenGenerado: exito,
    sessionId: generarSessionId()
  };
};

/**
 * Extraer información del navegador desde user agent
 */
const extraerNavegador = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Desconocido';
};

/**
 * Extraer sistema operativo desde user agent
 */
const extraerSO = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Desconocido';
};

/**
 * Extraer tipo de dispositivo desde user agent
 */
const extraerDispositivo = (userAgent: string): string => {
  if (userAgent.includes('Mobile')) return 'Móvil';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
};

/**
 * Generar ID de sesión único
 */
const generarSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

/**
 * Verificar si un usuario está bloqueado
 */
export const verificarBloqueo = async (aliasusuario: string): Promise<LoginAuditResponse> => {
  try {
    const [rows] = await pool.query<(IntentoLogin & RowDataPacket)[]>(
      `SELECT * FROM tblposcrumenwebintentoslogin 
       WHERE aliasusuario = ? 
       ORDER BY id DESC LIMIT 1`,
      [aliasusuario]
    );

    if (rows.length === 0) {
      return {
        permitido: true,
        bloqueado: false,
        mensaje: 'Usuario sin intentos previos'
      };
    }

    const registro = rows[0];

    // Si tiene fecha de bloqueo
    if (registro.fechabloqueado) {
      const tiempoBloqueo = new Date(registro.fechabloqueado);
      const ahora = new Date();
      const minutosTranscurridos = (ahora.getTime() - tiempoBloqueo.getTime()) / 60000;

      // Si aún está en período de bloqueo
      if (minutosTranscurridos < TIEMPO_BLOQUEO_MINUTOS) {
        return {
          permitido: false,
          bloqueado: true,
          mensaje: `Cuenta bloqueada. Intente de nuevo en ${Math.ceil(TIEMPO_BLOQUEO_MINUTOS - minutosTranscurridos)} minutos`,
          fechaBloqueado: tiempoBloqueo
        };
      } else {
        // El bloqueo ha expirado, resetear intentos
        await resetearIntentos(aliasusuario);
        return {
          permitido: true,
          bloqueado: false,
          mensaje: 'Bloqueo expirado, intentos reseteados'
        };
      }
    }

    // Verificar cantidad de intentos
    if (registro.intentos >= MAX_INTENTOS_PERMITIDOS) {
      // Bloquear la cuenta
      await bloquearCuenta(aliasusuario);
      return {
        permitido: false,
        bloqueado: true,
        mensaje: 'Cuenta bloqueada por exceder intentos permitidos',
        fechaBloqueado: new Date()
      };
    }

    // Usuario puede intentar login
    return {
      permitido: true,
      bloqueado: false,
      intentosRestantes: MAX_INTENTOS_PERMITIDOS - registro.intentos,
      mensaje: 'Login permitido'
    };

  } catch (error) {
    console.error('Error al verificar bloqueo:', error);
    throw error;
  }
};

/**
 * Registrar intento de login fallido
 */
export const registrarIntentoFallido = async (
  aliasusuario: string,
  idnegocio: number,
  req: Request
): Promise<void> => {
  try {
    const metadata = extraerMetadata(req, false, 'Contraseña incorrecta');

    // Buscar registro existente
    const [rows] = await pool.query<(IntentoLogin & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ? ORDER BY id DESC LIMIT 1',
      [aliasusuario]
    );

    if (rows.length === 0) {
      // Crear nuevo registro
      await pool.query<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebintentoslogin 
         (aliasusuario, intentos, idnegocio, metaaud) 
         VALUES (?, 1, ?, ?)`,
        [aliasusuario, idnegocio, JSON.stringify(metadata)]
      );
    } else {
      // Actualizar registro existente
      const intentosActuales = rows[0].intentos;
      const nuevosIntentos = intentosActuales + 1;

      // Si alcanza o supera el límite, bloquear
      if (nuevosIntentos >= MAX_INTENTOS_PERMITIDOS) {
        await pool.query<ResultSetHeader>(
          `UPDATE tblposcrumenwebintentoslogin 
           SET intentos = ?, fechabloqueado = NOW(), metaaud = ? 
           WHERE id = ?`,
          [nuevosIntentos, JSON.stringify(metadata), rows[0].id]
        );
      } else {
        await pool.query<ResultSetHeader>(
          `UPDATE tblposcrumenwebintentoslogin 
           SET intentos = ?, metaaud = ? 
           WHERE id = ?`,
          [nuevosIntentos, JSON.stringify(metadata), rows[0].id]
        );
      }
    }

  } catch (error) {
    console.error('Error al registrar intento fallido:', error);
    throw error;
  }
};

/**
 * Registrar login exitoso
 */
export const registrarLoginExitoso = async (
  aliasusuario: string,
  idnegocio: number,
  req: Request
): Promise<void> => {
  try {
    const metadata = extraerMetadata(req, true, 'Login exitoso');

    // Resetear intentos y registrar login exitoso
    const [rows] = await pool.query<(IntentoLogin & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ? ORDER BY id DESC LIMIT 1',
      [aliasusuario]
    );

    if (rows.length === 0) {
      // Crear nuevo registro con login exitoso
      await pool.query<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebintentoslogin 
         (aliasusuario, intentos, ultimologin, idnegocio, metaaud) 
         VALUES (?, 0, NOW(), ?, ?)`,
        [aliasusuario, idnegocio, JSON.stringify(metadata)]
      );
    } else {
      // Actualizar: resetear intentos, quitar bloqueo, actualizar último login
      await pool.query<ResultSetHeader>(
        `UPDATE tblposcrumenwebintentoslogin 
         SET intentos = 0, 
             ultimologin = NOW(), 
             fechabloqueado = NULL, 
             metaaud = ? 
         WHERE id = ?`,
        [JSON.stringify(metadata), rows[0].id]
      );
    }

  } catch (error) {
    console.error('Error al registrar login exitoso:', error);
    throw error;
  }
};

/**
 * Bloquear cuenta de usuario
 */
const bloquearCuenta = async (aliasusuario: string): Promise<void> => {
  try {
    await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebintentoslogin 
       SET fechabloqueado = NOW() 
       WHERE aliasusuario = ? 
       ORDER BY id DESC LIMIT 1`,
      [aliasusuario]
    );
  } catch (error) {
    console.error('Error al bloquear cuenta:', error);
    throw error;
  }
};

/**
 * Resetear intentos de login
 */
const resetearIntentos = async (aliasusuario: string): Promise<void> => {
  try {
    await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebintentoslogin 
       SET intentos = 0, fechabloqueado = NULL 
       WHERE aliasusuario = ? 
       ORDER BY id DESC LIMIT 1`,
      [aliasusuario]
    );
  } catch (error) {
    console.error('Error al resetear intentos:', error);
    throw error;
  }
};

/**
 * Obtener historial de intentos de un usuario
 */
export const obtenerHistorialIntentos = async (aliasusuario: string): Promise<IntentoLogin[]> => {
  try {
    const [rows] = await pool.query<(IntentoLogin & RowDataPacket)[]>(
      'SELECT * FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ? ORDER BY id DESC LIMIT 10',
      [aliasusuario]
    );
    return rows;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};
