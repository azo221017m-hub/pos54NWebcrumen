import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

interface Usuario extends RowDataPacket {
  idUsuario: number;
  alias: string;
  nombre: string;
  estatus: number;
  password: string;
}

/**
 * Script para crear/actualizar el SUPERUSUARIO del sistema
 * 
 * NOTA DE SEGURIDAD: Las credenciales están hardcodeadas según los requisitos
 * del sistema. Este es un usuario administrativo especial con credenciales
 * predefinidas para acceso de emergencia o configuración inicial.
 * 
 * Credenciales:
 * - alias: Crumen
 * - Password: Crumen.*
 */
const createSuperuser = async () => {
  try {
    // Credenciales predefinidas según requisitos del sistema
    const superuserAlias = 'Crumen';
    const superuserPassword = 'Crumen.*';
    
    console.log('🔄 Verificando usuario SUPERUSUARIO...\n');
    
    // Buscar si el usuario ya existe
    const [usuarios] = await pool.execute<Usuario[]>(
      'SELECT idUsuario, alias, nombre, estatus, password FROM tblposcrumenwebusuarios WHERE alias = ?',
      [superuserAlias]
    );
    
    const hashedPassword = await bcrypt.hash(superuserPassword, 10);
    
    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      console.log('✅ SUPERUSUARIO encontrado:');
      console.log(`   ID: ${usuario.idUsuario}`);
      console.log(`   Alias: ${usuario.alias}`);
      console.log(`   Nombre: ${usuario.nombre}`);
      console.log(`   Estatus: ${usuario.estatus}`);
      
      // Actualizar la contraseña y asegurar que esté activo
      await pool.execute<ResultSetHeader>(
        'UPDATE tblposcrumenwebusuarios SET password = ?, estatus = 1 WHERE alias = ?',
        [hashedPassword, superuserAlias]
      );
      
      console.log('\n✅ Contraseña del SUPERUSUARIO actualizada exitosamente!');
      
      // Limpiar intentos de login fallidos
      await pool.execute<ResultSetHeader>(
        'DELETE FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ?',
        [superuserAlias]
      );
      console.log('✅ Historial de intentos de login limpiado.');
      
    } else {
      console.log('⚠️  SUPERUSUARIO no encontrado. Creándolo...\n');
      
      // Crear el SUPERUSUARIO con rol de administrador
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebusuarios 
         (idNegocio, idRol, nombre, alias, password, telefono, estatus, fechaRegistroauditoria, usuarioauditoria) 
         VALUES (1, 1, 'SUPERUSUARIO', ?, ?, '', 1, NOW(), 'system')`,
        [superuserAlias, hashedPassword]
      );
      
      console.log('✅ SUPERUSUARIO creado exitosamente!');
      console.log(`   ID: ${result.insertId}`);
      console.log(`   Alias: ${superuserAlias}`);
      console.log('   Nombre: SUPERUSUARIO');
      console.log('   Rol: 1 (Administrador)');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Credenciales del SUPERUSUARIO:');
    console.log(`   Usuario: ${superuserAlias}`);
    console.log(`   Password: ${superuserPassword.replace(/./g, '*')}`);
    console.log('   (Consultar documentación para la contraseña completa)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error al crear/actualizar SUPERUSUARIO');
    if (error instanceof Error) {
      console.error('Detalles:', error.message);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
};

createSuperuser();
