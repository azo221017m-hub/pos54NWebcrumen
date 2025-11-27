import { pool } from '../config/db';
import type { RowDataPacket } from 'mysql2';

interface TableRow extends RowDataPacket {
  Tables_in_bdcdttx: string;
}

interface CountRow extends RowDataPacket {
  count: number;
}

/**
 * Script para verificar y preparar la base de datos
 */
const initDatabase = async () => {
  try {
    console.log('🔄 Verificando conexión a la base de datos...');
    
    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar tablas existentes
    const [tables] = await connection.query<TableRow[]>(
      'SHOW TABLES'
    );
    
    console.log('\n📊 Tablas disponibles:');
    tables.forEach((table: TableRow) => {
      console.log(`  - ${table.Tables_in_bdcdttx}`);
    });
    
    // Verificar si existe la tabla usuarios
    const tablesNames = tables.map((t: TableRow) => t.Tables_in_bdcdttx);
    
    if (tablesNames.includes('usuarios')) {
      console.log('\n✅ Tabla usuarios encontrada');
      
      // Contar usuarios
      const [usuariosCount] = await connection.query<CountRow[]>(
        'SELECT COUNT(*) as count FROM usuarios'
      );
      console.log(`   Total usuarios: ${usuariosCount[0].count}`);
    } else {
      console.log('\n⚠️  Advertencia: Tabla usuarios no encontrada');
      console.log('   Ejecuta el script schema.sql para crear las tablas');
    }
    
    if (tablesNames.includes('productos')) {
      const [productosCount] = await connection.query<CountRow[]>(
        'SELECT COUNT(*) as count FROM productos'
      );
      console.log(`   Total productos: ${productosCount[0].count}`);
    }
    
    if (tablesNames.includes('ventas')) {
      const [ventasCount] = await connection.query<CountRow[]>(
        'SELECT COUNT(*) as count FROM ventas'
      );
      console.log(`   Total ventas: ${ventasCount[0].count}`);
    }
    
    connection.release();
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('\n❌ Error al verificar la base de datos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Ejecutar verificación
initDatabase();
