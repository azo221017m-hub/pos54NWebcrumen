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
 * Script para inicializar el usuario crumensys cuando la tabla está vacía
 * 
 * Credenciales:
 * - alias: crumensys
 * - password: Crumen.
 * - idNegocio: 99999
 * - nombre: adminsistemas
 * - idRol: 1 (Administrador)
 */
const initializeCrumensys = async () => {
  try {
    console.log('🔄 Verificando tabla de usuarios...\n');
    
    // Verificar si la tabla está vacía
    const [countRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM tblposcrumenwebusuarios'
    );
    
    const userCount = countRows[0].count;
    console.log(`📊 Total de usuarios encontrados: ${userCount}\n`);
    
    if (userCount === 0) {
      console.log('⚠️  La tabla está vacía. Insertando usuario crumensys...\n');
      
      // Credenciales según requisitos
      const crumensysAlias = 'crumensys';
      const crumensysPassword = 'Crumen.';
      const hashedPassword = await bcrypt.hash(crumensysPassword, 10);
      
      // Insertar el usuario crumensys
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebusuarios 
         (idNegocio, idRol, nombre, alias, password, telefono, estatus, fechaRegistroauditoria, usuarioauditoria) 
         VALUES (?, ?, ?, ?, ?, '', 1, NOW(), 'system')`,
        [99999, 1, 'adminsistemas', crumensysAlias, hashedPassword]
      );
      
      console.log('✅ Usuario crumensys creado exitosamente!');
      console.log(`   ID: ${result.insertId}`);
      console.log(`   Alias: ${crumensysAlias}`);
      console.log('   Nombre: adminsistemas');
      console.log('   idNegocio: 99999');
      console.log('   idRol: 1 (Administrador)');
      console.log('   Password: ********\n');
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Credenciales del usuario crumensys:');
      console.log(`   Usuario: ${crumensysAlias}`);
      console.log('   Password: Crumen.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
    } else {
      console.log('ℹ️  La tabla ya contiene usuarios. No se requiere inicialización.');
      console.log('   El usuario crumensys solo se crea si la tabla está vacía.\n');
      
      // Mostrar usuarios existentes
      const [usuarios] = await pool.execute<Usuario[]>(
        'SELECT idUsuario, alias, nombre FROM tblposcrumenwebusuarios LIMIT 5'
      );
      
      console.log('✅ Usuarios existentes:');
      usuarios.forEach(user => {
        console.log(`   - ID: ${user.idUsuario} | Alias: ${user.alias} | Nombre: ${user.nombre}`);
      });
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar usuario crumensys');
    if (error instanceof Error) {
      console.error('Detalles:', error.message);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
};

initializeCrumensys();
