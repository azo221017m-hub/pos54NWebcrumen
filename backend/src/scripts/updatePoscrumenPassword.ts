import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Usuario extends RowDataPacket {
  idUsuario: number;
  alias: string;
  nombre: string;
  estatus: number;
  password: string;
}

/**
 * Script para actualizar/crear el usuario poscrumen con la contraseña poszaval4
 * Este usuario debe poder acceder al sistema.
 */
const updatePoscrumenPassword = async () => {
  try {
    console.log('🔄 Buscando usuario poscrumen...\n');
    
    // Buscar usuario poscrumen
    const [usuarios] = await pool.execute<Usuario[]>(
      'SELECT idUsuario, alias, nombre, estatus, password FROM tblposcrumenwebusuarios WHERE alias = ?',
      ['poscrumen']
    );
    
    const newPassword = 'poszaval4';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      console.log('✅ Usuario poscrumen encontrado:');
      console.log(`   ID: ${usuario.idUsuario}`);
      console.log(`   Nombre: ${usuario.nombre}`);
      console.log(`   Estatus: ${usuario.estatus}`);
      
      // Actualizar la contraseña
      await pool.execute<ResultSetHeader>(
        'UPDATE tblposcrumenwebusuarios SET password = ?, estatus = 1 WHERE alias = ?',
        [hashedPassword, 'poscrumen']
      );
      
      console.log('\n✅ Contraseña actualizada exitosamente!');
      console.log(`   Nueva contraseña: ${newPassword}`);
      
      // Limpiar intentos de login fallidos
      await pool.execute<ResultSetHeader>(
        'DELETE FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ?',
        ['poscrumen']
      );
      console.log('✅ Historial de intentos de login limpiado.');
      
    } else {
      console.log('⚠️  Usuario poscrumen no encontrado. Creándolo...\n');
      
      // Crear el usuario poscrumen
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebusuarios 
         (idNegocio, idRol, nombre, alias, password, telefono, estatus, fechaRegistroauditoria, usuarioauditoria) 
         VALUES (1, 1, 'POS Crumen Admin', 'poscrumen', ?, '', 1, NOW(), 'system')`,
        [hashedPassword]
      );
      
      console.log('✅ Usuario poscrumen creado exitosamente!');
      console.log(`   ID: ${result.insertId}`);
      console.log('   Alias: poscrumen');
      console.log(`   Password: ${newPassword}`);
      console.log('   Rol: 1 (Administrador)');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Credenciales de acceso:');
    console.log('   Usuario: poscrumen');
    console.log('   Contraseña: poszaval4');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
};

updatePoscrumenPassword();
