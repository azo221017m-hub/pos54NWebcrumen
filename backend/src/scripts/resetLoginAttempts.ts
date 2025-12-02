import { pool } from '../config/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface IntentoLogin extends RowDataPacket {
  id: number;
  aliasusuario: string;
  intentos: number;
  fechabloqueado: Date | null;
  ultimologin: Date | null;
}

/**
 * Script para resetear los intentos de login del usuario poscrumen
 * Esto permite desbloquear la cuenta si ha sido bloqueada por intentos fallidos
 */
const resetLoginAttempts = async () => {
  try {
    console.log('🔄 Buscando intentos de login para poscrumen...\n');
    
    // Buscar registro de intentos
    const [intentos] = await pool.execute<IntentoLogin[]>(
      'SELECT * FROM tblposcrumenwebintentoslogin WHERE aliasusuario = ?',
      ['poscrumen']
    );
    
    if (intentos.length > 0) {
      const registro = intentos[0];
      console.log('📊 Estado actual del usuario poscrumen:');
      console.log(`   Intentos fallidos: ${registro.intentos}`);
      console.log(`   Fecha bloqueo: ${registro.fechabloqueado || 'No bloqueado'}`);
      console.log(`   Último login: ${registro.ultimologin || 'Nunca'}`);
      
      // Resetear intentos y desbloquear
      await pool.execute<ResultSetHeader>(
        `UPDATE tblposcrumenwebintentoslogin 
         SET intentos = 0, fechabloqueado = NULL 
         WHERE aliasusuario = ?`,
        ['poscrumen']
      );
      
      console.log('\n✅ Intentos de login reseteados!');
      console.log('   La cuenta ha sido desbloqueada.');
    } else {
      console.log('ℹ️  No hay registros de intentos de login para poscrumen');
      console.log('   La cuenta no está bloqueada.');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 El usuario poscrumen ahora puede intentar login nuevamente.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
};

resetLoginAttempts();
