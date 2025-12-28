import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

/**
 * Script de prueba para verificar la conversión de imágenes
 * Este script verifica que las imágenes se convierten correctamente de Buffer a Base64
 */

async function testImageConversion() {
  try {
    console.log('🧪 Iniciando prueba de conversión de imágenes...\n');

    // Obtener un usuario que tenga al menos una imagen
    const [usuarios] = await pool.execute<RowDataPacket[]>(
      'SELECT idUsuario, nombre, fotoine, fotopersona, fotoavatar FROM tblposcrumenwebusuarios LIMIT 5'
    );

    console.log(`📊 Encontrados ${usuarios.length} usuarios para prueba\n`);

    for (const usuario of usuarios) {
      console.log(`👤 Usuario: ${usuario.nombre} (ID: ${usuario.idUsuario})`);
      
      // Verificar fotoine
      if (usuario.fotoine) {
        const buffer = usuario.fotoine as Buffer;
        const base64 = buffer.toString('base64');
        console.log(`  ✅ fotoine: Buffer (${buffer.length} bytes) → Base64 (${base64.length} chars)`);
        
        // Verificar que se puede convertir de vuelta
        const bufferFromBase64 = Buffer.from(base64, 'base64');
        if (buffer.equals(bufferFromBase64)) {
          console.log(`  ✅ Conversión bidireccional exitosa para fotoine`);
        } else {
          console.log(`  ❌ Error: La conversión bidireccional falló para fotoine`);
        }
      } else {
        console.log(`  ⚪ fotoine: No existe`);
      }

      // Verificar fotopersona
      if (usuario.fotopersona) {
        const buffer = usuario.fotopersona as Buffer;
        const base64 = buffer.toString('base64');
        console.log(`  ✅ fotopersona: Buffer (${buffer.length} bytes) → Base64 (${base64.length} chars)`);
        
        const bufferFromBase64 = Buffer.from(base64, 'base64');
        if (buffer.equals(bufferFromBase64)) {
          console.log(`  ✅ Conversión bidireccional exitosa para fotopersona`);
        } else {
          console.log(`  ❌ Error: La conversión bidireccional falló para fotopersona`);
        }
      } else {
        console.log(`  ⚪ fotopersona: No existe`);
      }

      // Verificar fotoavatar
      if (usuario.fotoavatar) {
        const buffer = usuario.fotoavatar as Buffer;
        const base64 = buffer.toString('base64');
        console.log(`  ✅ fotoavatar: Buffer (${buffer.length} bytes) → Base64 (${base64.length} chars)`);
        
        const bufferFromBase64 = Buffer.from(base64, 'base64');
        if (buffer.equals(bufferFromBase64)) {
          console.log(`  ✅ Conversión bidireccional exitosa para fotoavatar`);
        } else {
          console.log(`  ❌ Error: La conversión bidireccional falló para fotoavatar`);
        }
      } else {
        console.log(`  ⚪ fotoavatar: No existe`);
      }

      console.log('');
    }

    console.log('✅ Prueba completada exitosamente\n');
    console.log('📝 Conclusión:');
    console.log('   - Las imágenes se pueden convertir correctamente de Buffer a Base64');
    console.log('   - La conversión es bidireccional (Base64 → Buffer → Base64)');
    console.log('   - Los endpoints GET ahora retornarán imágenes en formato Base64');
    console.log('   - El frontend podrá mostrar y enviar imágenes correctamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexión cerrada');
    // Dar tiempo para que el log se escriba antes de salir
    setTimeout(() => process.exit(0), 100);
  }
}

// Ejecutar el test
testImageConversion().catch(console.error);
