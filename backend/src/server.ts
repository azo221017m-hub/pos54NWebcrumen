import app from './app';
import { testConnection, pool } from './config/db';

const PORT = process.env.PORT || 3000;

const runMigrations = async () => {
  try {
    await pool.query(`ALTER TABLE tblposcrumenwebventas ADD COLUMN IF NOT EXISTS origenventa ENUM('SITIO','WEB') NULL DEFAULT NULL`);
    console.log('✅ Migración aplicada: columna origenventa en tblposcrumenwebventas');
  } catch (error) {
    console.error('⚠️  Error aplicando migración origenventa:', error);
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

    // Aplicar migraciones de base de datos
    await runMigrations();

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
