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
import type { AuthRequest } from '../middlewares/auth';

interface Usuario extends RowDataPacket {
  idUsuario: number;
  idNegocio: number;
  idRol: number;
  nombre: string;
  alias: string;
  password: string;
  telefono: string;
  estatus: number;
  frasepersonal?: string;
}

interface ClienteWeb extends RowDataPacket {
  idCliente: number;
  nombre: string;
  referencia: string | null;
  telefono: string;
  password: string;
  estatus: number;
  idnegocio: number;
  direccion: string | null;
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
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET no configurado');
    }
    
    const token = jwt.sign(
      { 
        id: usuario.idUsuario, 
        alias: usuario.alias,
        nombre: usuario.nombre,
        idNegocio: usuario.idNegocio,
        idRol: usuario.idRol
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token válido por 1 hora
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
          estatus: usuario.estatus,
          frasepersonal: usuario.frasepersonal
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
 * Endpoint para renovar el token JWT
 * Permite extender la sesión del usuario sin necesidad de volver a autenticarse
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // El token actual viene en el header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
      return;
    }

    const currentToken = authHeader.split(' ')[1];
    
    // Validar que JWT_SECRET esté configurado
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
      return;
    }
    
    // Verificar y decodificar el token actual
    const decoded = jwt.verify(
      currentToken,
      JWT_SECRET
    ) as { id: number; alias: string; nombre: string; idNegocio: number; idRol: number };

    // Verificar que el usuario todavía esté activo en la base de datos
    const [rows] = await pool.execute<Usuario[]>(
      'SELECT idUsuario, idNegocio, idRol, nombre, alias, estatus FROM tblposcrumenwebusuarios WHERE idUsuario = ? AND estatus = 1',
      [decoded.id]
    );

    if (rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
      return;
    }

    const usuario = rows[0];

    // Generar un nuevo token con los mismos datos pero con nueva expiración
    const newToken = jwt.sign(
      {
        id: usuario.idUsuario,
        alias: usuario.alias,
        nombre: usuario.nombre,
        idNegocio: usuario.idNegocio,
        idRol: usuario.idRol
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token válido por 1 hora
    );

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    } else {
      console.error('Error al renovar token:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  }
};

/**
 * Login para clientes del portal web
 * Valida contra tblposcrumenwebclientes usando telefono + password
 */
export const loginCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telefono, password } = req.body;

    if (!telefono || !password) {
      res.status(400).json({
        success: false,
        message: 'Teléfono y contraseña son requeridos'
      });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Error de configuración del servidor' });
      return;
    }

    const [rows] = await pool.execute<ClienteWeb[]>(
      'SELECT idCliente, nombre, referencia, telefono, password, estatus, idnegocio, direccion FROM tblposcrumenwebclientes WHERE telefono = ? AND estatus = 1 LIMIT 1',
      [telefono]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Teléfono o contraseña incorrectos' });
      return;
    }

    const cliente = rows[0];

    // Validate password: try bcrypt first (for future hashed passwords), then plain text for
    // backwards compatibility with existing records that may not yet be hashed.
    let passwordValida = false;
    try {
      passwordValida = await bcrypt.compare(password, cliente.password);
    } catch {
      // Not a bcrypt hash – fall back to plain text comparison
    }
    if (!passwordValida) {
      passwordValida = cliente.password === password;
    }

    if (!passwordValida) {
      res.status(401).json({ success: false, message: 'Teléfono o contraseña incorrectos' });
      return;
    }

    // Issue a client JWT with idNegocio=0 (no business selected yet)
    const token = jwt.sign(
      {
        clientId: cliente.idCliente,
        nombre: cliente.nombre,
        alias: cliente.telefono,
        isCliente: true,
        idNegocio: 0,
        idRol: 99
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        cliente: {
          idCliente: cliente.idCliente,
          nombre: cliente.nombre,
          referencia: cliente.referencia || undefined,
          telefono: cliente.telefono,
          direccion: cliente.direccion || undefined
        }
      }
    });
  } catch (error) {
    console.error('Error en loginCliente:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

/**
 * Registro público de nuevos clientes del portal web
 * Inserta en tblposcrumenwebclientes sin requerir autenticación
 */
export const registroClientePublico = async (req: Request, res: Response): Promise<void> => {
  try {
    // Solo se usan los campos del formulario modal "Únirme a la Comunidad"
    const {
      referencia,
      telefono,
      cumple,
      direccion,
      password
    } = req.body;

    if (!referencia || !password) {
      res.status(400).json({ success: false, message: 'Los campos referencia y contraseña son obligatorios' });
      return;
    }

    // Verificar si ya existe un cliente con el mismo teléfono
    if (telefono) {
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT idCliente FROM tblposcrumenwebclientes WHERE telefono = ? LIMIT 1',
        [telefono]
      );
      if ((existing as RowDataPacket[]).length > 0) {
        res.status(409).json({ success: false, message: 'Ya existe un cliente registrado con ese número de teléfono' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar sólo los campos del formulario modal; los demás se completan con
    // 'default' (varchar/text), idnegocio=0, usuarioauditoria='web', fechas con NOW()
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebclientes (
        nombre,
        referencia,
        cumple,
        categoriacliente,
        satisfaccion,
        comentarios,
        puntosfidelidad,
        estatus_seguimiento,
        responsable_seguimiento,
        medio_contacto,
        observacionesseguimiento,
        fechaultimoseguimiento,
        telefono,
        email,
        direccion,
        estatus,
        password,
        fecharegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio
      ) VALUES ('default', ?, ?, 'NUEVO', 0, 'default', 0, 'EN_PROSPECCIÓN', 'default', 'OTRO', 'default', NOW(), ?, 'default', ?, 1, ?, NOW(), 'web', NOW(), 0)`,
      [
        referencia,
        cumple || null,
        telefono || null,
        direccion || null,
        hashedPassword
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Ahora puedes iniciar sesión.',
      data: { idCliente: result.insertId }
    });
  } catch (error: any) {
    console.error('Error en registroClientePublico:', error);
    const mensaje = error?.code === 'ER_DUP_ENTRY'
      ? 'Ya existe un cliente con esos datos. Intenta iniciar sesión.'
      : 'Error en el servidor al registrar el cliente';
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ success: false, message: mensaje });
  }
};

/**
 * Emite un nuevo token de cliente con el idNegocio del negocio seleccionado.
 * Requiere que el cliente esté autenticado (token de cliente válido).
 */
export const getClienteTokenForNegocio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idNegocio } = req.body;

    if (!idNegocio) {
      res.status(400).json({ success: false, message: 'idNegocio es requerido' });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Error de configuración del servidor' });
      return;
    }

    // Verify the negocio exists and is active
    const [negocioRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idNegocio FROM tblposcrumenwebnegocio WHERE idNegocio = ? AND estatusnegocio = 1',
      [idNegocio]
    );

    if (negocioRows.length === 0) {
      res.status(404).json({ success: false, message: 'Negocio no encontrado o inactivo' });
      return;
    }

    // Re-issue JWT with the selected negocio's idNegocio
    const token = jwt.sign(
      {
        clientId: req.user?.id,
        nombre: req.user?.nombre,
        alias: req.user?.alias,
        isCliente: true,
        idNegocio: Number(idNegocio),
        idRol: 99
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, data: { token } });
  } catch (error) {
    console.error('Error en getClienteTokenForNegocio:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

/**
 * Extracts the client phone (alias) from a JWT in the Authorization header.
 * Returns the phone string if valid, or empty string on any failure.
 * This is a "soft auth" helper: it never throws.
 */
function extractPhoneFromJWT(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return '';
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return '';
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { alias?: string };
    return (decoded.alias || '').trim();
  } catch {
    return '';
  }
}

/**
 * Obtener pedidos activos del cliente desde tblposcrumenwebpedidoswebtransito.
 * Filtra por teléfono del cliente y retorna los pedidos más recientes.
 * Incluye logotipo y contactonegocio de tblposcrumenwebnegocio.
 * Filtra solo registros con estadopedidowebtransito=1.
 * Ordena por idnegocio y luego por fecha de creación.
 *
 * Obtención del teléfono (prioridad):
 *   1. JWT token (Authorization header) → req.user.alias  (más fiable)
 *   2. Query param ?telefono=…                            (fallback)
 */
export const getMisPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Try to extract phone from JWT (soft auth – does not fail on invalid token)
    let telefono = extractPhoneFromJWT(req);

    // 2. Fallback to query param
    if (!telefono) {
      telefono = typeof req.query.telefono === 'string' ? req.query.telefono.trim() : '';
    }

    if (!telefono) {
      res.status(400).json({ success: false, message: 'Teléfono del cliente es obligatorio.' });
      return;
    }

    // Validate phone format (7-15 digits)
    if (!/^\d{7,15}$/.test(telefono)) {
      res.status(400).json({ success: false, message: 'Formato de teléfono inválido.' });
      return;
    }

    // Prevent caching so the client always gets fresh data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');

    // pool.query() instead of pool.execute() because logotipo is LONGBLOB
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.idpedidowebtransito, t.folioventa, t.idnegocio, t.totalpedido,
        t.fechahorapedidosolicitado,
        t.fechahorapedidosolicitado AS fechahorapedidowebtransito, -- alias for frontend compatibility
        t.telefonocliente, t.referenciacliente,
        t.detalleproductos, t.estatuspedidotransito, t.detallesclientepedidostransito,
        t.observacionesnegociopedidostransito,
        t.puntosobtenidospedidostransito, t.puntosusadospedidostransito, t.saldopuntospedidostransito,
        t.mensajeclientepedidostransito, t.mensajenegociopedidostransito,
        t.fecha_creacion, t.fecha_actualizacion, t.estadopedidowebtransito,
        n.logotipo AS negocio_logotipo,
        n.contactonegocio AS negocio_contacto
      FROM tblposcrumenwebpedidoswebtransito t
      LEFT JOIN tblposcrumenwebnegocio n ON n.idNegocio = t.idnegocio
      WHERE t.telefonocliente = ?
        AND t.estadopedidowebtransito = 1
      ORDER BY t.idnegocio, t.fecha_creacion DESC
      LIMIT 50`,
      [telefono]
    );

    // Convert logotipo Buffer to data URI for frontend
    const rowsProcessed = rows.map((row: RowDataPacket) => {
      let logotipoUri: string | null = null;
      if (row.negocio_logotipo) {
        if (typeof row.negocio_logotipo === 'string') {
          logotipoUri = row.negocio_logotipo.startsWith('data:image/') ? row.negocio_logotipo : null;
        } else if (Buffer.isBuffer(row.negocio_logotipo)) {
          // Detect MIME type from magic bytes
          let mime = 'image/png';
          if (row.negocio_logotipo[0] === 0xFF && row.negocio_logotipo[1] === 0xD8) mime = 'image/jpeg';
          else if (row.negocio_logotipo[0] === 0x47 && row.negocio_logotipo[1] === 0x49) mime = 'image/gif';
          else if (row.negocio_logotipo[0] === 0x52 && row.negocio_logotipo[1] === 0x49) mime = 'image/webp';
          logotipoUri = `data:${mime};base64,${row.negocio_logotipo.toString('base64')}`;
        }
      }
      return {
        ...row,
        negocio_logotipo: logotipoUri
      };
    });

    res.json({ success: true, data: rowsProcessed });
  } catch (error: unknown) {
    console.error('Error en getMisPedidos:', error);
    // Handle "table doesn't exist" (ER_NO_SUCH_TABLE / errno 1146) gracefully
    // so the client sees an empty list instead of a 500 error.
    const sqlError = error as { code?: string; errno?: number };
    if (sqlError.code === 'ER_NO_SUCH_TABLE' || sqlError.errno === 1146) {
      console.warn('getMisPedidos: La tabla tblposcrumenwebpedidoswebtransito no existe. Ejecute el script create_pedidoswebtransito_table.sql');
      res.json({ success: true, data: [] });
      return;
    }
    // Handle unknown column errors gracefully (e.g. column doesn't exist in production)
    if (sqlError.code === 'ER_BAD_FIELD_ERROR' || sqlError.errno === 1054) {
      console.error('getMisPedidos: Columna no encontrada en la tabla. Verifique el esquema de tblposcrumenwebpedidoswebtransito y tblposcrumenwebnegocio.');
      res.json({ success: true, data: [] });
      return;
    }
    res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
  }
};

/**
 * Enviar mensaje del cliente en un pedido en tránsito.
 * Actualiza mensajeclientepedidostransito en tblposcrumenwebpedidoswebtransito.
 *
 * Obtención del teléfono (prioridad):
 *   1. JWT token (Authorization header) → decoded.alias  (más fiable)
 *   2. Body param telefono                               (fallback)
 */
export const enviarMensajePedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idpedidowebtransito, mensaje, telefono: rawTelefono } = req.body;

    // 1. Try to extract phone from JWT (soft auth)
    let telefono = extractPhoneFromJWT(req);

    // 2. Fallback to body param
    if (!telefono) {
      telefono = typeof rawTelefono === 'string' ? rawTelefono.trim() : '';
    }

    if (!telefono) {
      res.status(400).json({ success: false, message: 'Teléfono del cliente es obligatorio.' });
      return;
    }
    if (!idpedidowebtransito || typeof mensaje !== 'string') {
      res.status(400).json({ success: false, message: 'Datos incompletos' });
      return;
    }

    // Sanitize: trim and limit message length
    const mensajeLimpio = mensaje.trim().slice(0, 500);
    if (!mensajeLimpio) {
      res.status(400).json({ success: false, message: 'El mensaje no puede estar vacío' });
      return;
    }

    // Only allow the owning client to send messages, and only on active orders
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE tblposcrumenwebpedidoswebtransito 
       SET mensajeclientepedidostransito = ?, fecha_actualizacion = NOW()
       WHERE idpedidowebtransito = ? AND telefonocliente = ?
         AND estatuspedidotransito IN ('SOLICITADO', 'PREPARANDO', 'EN_CAMINO')`,
      [mensajeLimpio, idpedidowebtransito, telefono]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado o ya entregado' });
      return;
    }

    // Get idnegocio for websocket notification
    const [pedidoRows] = await pool.execute<RowDataPacket[]>(
      'SELECT idnegocio FROM tblposcrumenwebpedidoswebtransito WHERE idpedidowebtransito = ?',
      [idpedidowebtransito]
    );

    if (pedidoRows.length > 0) {
      const { websocketService } = await import('../services/websocket.service');
      websocketService.notifyMensajePedidoTransito(pedidoRows[0].idnegocio, idpedidowebtransito);
    }

    res.json({ success: true, message: 'Mensaje enviado' });
  } catch (error: unknown) {
    console.error('Error en enviarMensajePedido:', error);
    const sqlError = error as { code?: string; errno?: number };
    if (sqlError.code === 'ER_NO_SUCH_TABLE' || sqlError.errno === 1146) {
      console.warn('enviarMensajePedido: La tabla tblposcrumenwebpedidoswebtransito no existe. Ejecute el script create_pedidoswebtransito_table.sql');
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }
    res.status(500).json({ success: false, message: 'Error al enviar mensaje' });
  }
};

