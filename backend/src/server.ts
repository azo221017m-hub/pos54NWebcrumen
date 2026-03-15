import app from './app';
import { pool, testConnection } from './config/db';

const PORT = process.env.PORT || 3000;

// Ensure the anuncios table exists so that POST/PUT/DELETE operations work
// even on fresh deployments where the migration script has not been run yet.
const ensureAnunciosTable = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`tblposcrumenwebanuncios\` (
        \`idAnuncio\` INT(11) NOT NULL AUTO_INCREMENT,
        \`tituloDeAnuncio\` VARCHAR(250) NULL,
        \`detalleAnuncio\` TEXT NULL,
        \`imagen1Anuncio\` LONGBLOB NULL,
        \`imagen2Anuncio\` LONGBLOB NULL,
        \`imagen3Anuncio\` LONGBLOB NULL,
        \`imagen4Anuncio\` LONGBLOB NULL,
        \`imagen5Anuncio\` LONGBLOB NULL,
        \`fechaDeVigencia\` DATE NULL,
        \`usuarioauditoria\` VARCHAR(100) NULL,
        \`fechamodificacionauditoria\` DATETIME NULL,
        PRIMARY KEY (\`idAnuncio\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla de anuncios verificada/creada correctamente');
  } catch (error) {
    console.error('⚠️  No se pudo verificar/crear la tabla de anuncios:', error instanceof Error ? error.message : error);
    console.error('   El servidor continuará, pero las operaciones de anuncios pueden fallar si la tabla no existe.');
  }
};

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Asegurar que la tabla de anuncios existe antes de recibir peticiones
    await ensureAnunciosTable();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
