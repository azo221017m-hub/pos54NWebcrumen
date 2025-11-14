// backend/src/controllers/authController.ts
// Controlador para autenticación de usuarios en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { LoginData, Usuario, ApiResponse, IntentoLogin, CreateIntentoLoginData } from '../types'; // Importa tipos personalizados
import bcrypt from 'bcrypt'; // Importa bcrypt para hash de contraseñas

// Controlador para el login de usuarios
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 Iniciando proceso de login'); // Log de inicio
    const { usuario, password }: LoginData = req.body; // Extrae datos del cuerpo de la petición

    // Valida que se proporcionen usuario y contraseña
    if (!usuario || !password) {
      console.log('❌ Faltan datos de login'); // Log de error
      res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos',
        error: 'MISSING_CREDENTIALS'
      } as ApiResponse);
      return;
    }

    console.log(`🔍 Buscando usuario por alias: ${usuario}`); // Log de búsqueda

    // Busca el usuario en la base de datos por alias
    console.log(`🔍 Ejecutando consulta SQL: SELECT * FROM tblposcrumenwebusuarios WHERE alias = ?`);
    console.log(`📝 Parámetros: [ '${usuario}' ]`);
    const usuarios = await executeQuery(
      'SELECT * FROM tblposcrumenwebusuarios WHERE alias = ?',
      [usuario]
    );
    console.log('✅ Consulta ejecutada exitosamente');
    console.log(`📊 Usuarios encontrados: ${usuarios ? usuarios.length : 0}`); // Log de resultados

    // Si no existe el usuario - NO generar registro de login
    if (!usuarios || usuarios.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos'); // Log de error
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      } as ApiResponse);
      return;
    }

    const user: Usuario = usuarios[0]; // Obtiene el primer usuario encontrado

    console.log('👤 Datos del usuario encontrado:', {
      idUsuario: user.idUsuario,
      alias: user.alias,
      nombre: user.nombre,
      estatus: user.estatus,
      idNegocio: user.idNegocio,
      idRol: user.idRol,
      passwordHash: user.password ? '***EXISTE***' : '***VACIO***'
    }); // Log de datos del usuario (sin mostrar contraseña)

    // Verifica si el usuario está bloqueado
    console.log(`🔍 Verificando estatus del usuario: ${user.estatus}`); // Log de verificación de estatus
    console.log('🔍 Verificando estatus del usuario:', user.estatus);
    if (user.estatus === 9) {
      console.log('🚫 Usuario bloqueado por seguridad (estatus = 9)'); // Log de bloqueo
      res.status(403).json({
        success: false,
        message: 'Usuario bloqueado por seguridad. Contacte al administrador.',
        error: 'USER_BLOCKED'
      } as ApiResponse);
      return;
    }

    // Verifica si el usuario está activo
    if (user.estatus !== 1) {
      console.log(`⚠️ Usuario inactivo (estatus = ${user.estatus}, esperado = 1)`); // Log de estado
      res.status(403).json({
        success: false,
        message: 'Usuario inactivo',
        error: 'USER_INACTIVE'
      } as ApiResponse);
      return;
    }

    console.log('✅ Usuario activo, verificando contraseña...'); // Log de verificación
    console.log(`🔐 Comparando contraseñas - Input: ${password.length} caracteres, Hash: ${user.password?.length || 0} caracteres`);
    console.log('🔒 Contraseña hasheada detectada, usando bcrypt.compare');
    
    let isValidPassword = false;
    
    // Siempre usar bcrypt.compare para contraseñas hasheadas
    if (user.password && user.password.length === 60 && user.password.startsWith('$2b$')) {
      console.log('🔒 Contraseña hasheada detectada, usando bcrypt.compare'); // Log de hash detectado
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      console.log('📝 Contraseña en texto plano detectada, comparando directamente y actualizando'); // Log de texto plano
      isValidPassword = password === user.password;
      
      // Si la contraseña es correcta, actualiza a bcrypt para seguridad futura
      if (isValidPassword) {
        console.log('🔄 Actualizando contraseña a bcrypt para seguridad futura'); // Log de actualización
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '10'));
        await executeQuery(
          'UPDATE tblposcrumenwebusuarios SET password = ? WHERE idUsuario = ?',
          [hashedPassword, user.idUsuario]
        );
        console.log('✅ Contraseña actualizada exitosamente'); // Log de éxito
      }
    }
    
    console.log(`🔍 Resultado de comparación de contraseña: ${isValidPassword}`); // Log del resultado
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta - Registrando intento fallido'); // Log de error
      
      // Registra el intento fallido en tblposcrumenwebintentoslogin
      await registrarIntentoFallido(user.alias, user.idNegocio);
      
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      } as ApiResponse);
      return;
    }

    console.log('✅ Login exitoso - Limpiando intentos y registrando éxito'); // Log de éxito
    
    // Login exitoso - resetear intentos y registrar éxito
    await registrarLoginExitoso(user.alias, user.idNegocio);
    
    // Almacena idNegocio y aliasusuario en la sesión
    if (req.session) {
      req.session.idNegocio = user.idNegocio;
      req.session.usuarioAuditoria = user.alias;
      console.log('✅ idNegocio y usuarioAuditoria almacenados en la sesión:', {
        idNegocio: req.session.idNegocio,
        usuarioAuditoria: req.session.usuarioAuditoria,
      });
    }

    console.log('🔍 [authController] idNegocio del usuario antes de almacenar en sesión:', user.idNegocio);

    // Retorna datos del usuario sin la contraseña - incluyendo datos para autorización
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        authorization: {
          alias: user.alias,
          idNegocio: user.idNegocio,
          idRol: user.idRol
        }
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error en login:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Función para registrar intentos fallidos de login
const registrarIntentoFallido = async (aliasusuario: string, idnegocio: number): Promise<void> => {
  try {
    console.log(`📝 Registrando intento fallido para alias: ${aliasusuario}`); // Log de registro

    // Busca intentos previos del usuario
    const intentosExistentes = await executeQuery(
      'SELECT * FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ?',
      [aliasusuario]
    );

    if (intentosExistentes.length === 0) {
      // Primer intento fallido - crea nuevo registro
      await executeQuery(
        'INSERT INTO tblposcrumenwebintentoslogin (aliasusuario, intentos, idnegocio) VALUES (?, 1, ?)',
        [aliasusuario, idnegocio]
      );
      console.log('📝 Primer intento fallido registrado'); // Log de registro
    } else {
      // Incrementa intentos existentes
      const intento: IntentoLogin = intentosExistentes[0];
      const nuevosIntentos = intento.intentos + 1;
      
      if (nuevosIntentos >= 3) {
        // Al llegar a 3 intentos, bloquea el usuario
        await executeQuery(
          'UPDATE tblposcrumenwebintentoslogin SET intentos = ?, fechabloqueado = NOW() WHERE id = ?',
          [nuevosIntentos, intento.id]
        );
        
        // Cambia el estatus del usuario a bloqueado (9)
        await executeQuery(
          'UPDATE tblposcrumenwebusuarios SET estatus = 9 WHERE alias = ?',
          [aliasusuario]
        );
        
        console.log(`🚫 Usuario ${aliasusuario} bloqueado por ${nuevosIntentos} intentos fallidos`); // Log de bloqueo
      } else {
        // Solo incrementa los intentos
        await executeQuery(
          'UPDATE tblposcrumenwebintentoslogin SET intentos = ? WHERE id = ?',
          [nuevosIntentos, intento.id]
        );
        
        console.log(`📝 Intentos actualizados a: ${nuevosIntentos} para ${aliasusuario}`); // Log de actualización
      }
    }
  } catch (error) {
    console.error('❌ Error registrando intento fallido:', error); // Log de error
  }
};

// Función para registrar login exitoso y resetear intentos
const registrarLoginExitoso = async (aliasusuario: string, idnegocio: number): Promise<void> => {
  try {
    console.log(`🧹 Procesando login exitoso para alias: ${aliasusuario}`); // Log de procesamiento

    // Busca si existe registro de intentos para este usuario
    const intentosExistentes = await executeQuery(
      'SELECT * FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ?',
      [aliasusuario]
    );

    if (intentosExistentes.length === 0) {
      // No existe registro previo - crear uno con login exitoso
      await executeQuery(
        'INSERT INTO tblposcrumenwebintentoslogin (aliasusuario, intentos, ultimologin, idnegocio) VALUES (?, 0, NOW(), ?)',
        [aliasusuario, idnegocio]
      );
      console.log('✅ Nuevo registro de login exitoso creado'); // Log de creación
    } else {
      // Resetea intentos y actualiza fecha de último login exitoso
      await executeQuery(
        'UPDATE tblposcrumenwebintentoslogin SET intentos = 0, ultimologin = NOW(), fechabloqueado = NULL WHERE aliasusuario = ?',
        [aliasusuario]
      );
      console.log('✅ Intentos reseteados y login exitoso actualizado'); // Log de limpieza
    }
  } catch (error) {
    console.error('❌ Error procesando login exitoso:', error); // Log de error
  }
};

// console.log('🔄 [authController] Insertando moderador con payload:', req.body); // Removed due to undefined 'req'