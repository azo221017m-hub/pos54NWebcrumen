import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Usuario extends RowDataPacket {
  idUsuario: number;
  alias: string;
  nombre: string;
  estatus: number;
}

const seedUsuario = async () => {
  try {
    console.log('🔄 Verificando usuarios en la base de datos...\n');
    
    // Verificar usuarios existentes
    const [usuarios] = await pool.execute<Usuario[]>(
      'SELECT idUsuario, alias, nombre, estatus FROM tblposcrumenwebusuarios LIMIT 5'
    );
    
    console.log(`📊 Total de usuarios encontrados: ${usuarios.length}\n`);
    
    if (usuarios.length > 0) {
      console.log('✅ Usuarios existentes:');
      usuarios.forEach(user => {
        console.log(`  - ID: ${user.idUsuario} | Alias: ${user.alias} | Nombre: ${user.nombre} | Estatus: ${user.estatus}`);
      });
      console.log('\n💡 Puedes usar cualquiera de estos alias para hacer login.');
      console.log('   Si las contraseñas están hasheadas, necesitarás crear un usuario de prueba.\n');
    } else {
      console.log('⚠️  No se encontraron usuarios. Creando usuario de prueba...\n');
      
      // Crear usuario de prueba
      const testPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebusuarios 
         (idNegocio, idRol, nombre, alias, password, telefono, estatus, fechaRegistroauditoria, usuarioauditoria) 
         VALUES (1, 1, 'Administrador', 'admin', ?, '', 1, NOW(), 'system')`,
        [hashedPassword]
      );
      
      console.log('✅ Usuario de prueba creado exitosamente!');
      console.log(`   ID: ${result.insertId}`);
      console.log('   Alias: admin');
      console.log('   Password: admin123');
      console.log('   Rol: 1 (Administrador)\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Para hacer login en la aplicación:');
    console.log('   Usuario: admin (o cualquier alias existente)');
    console.log('   Contraseña: admin123 (o la contraseña del usuario)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
};

seedUsuario();
