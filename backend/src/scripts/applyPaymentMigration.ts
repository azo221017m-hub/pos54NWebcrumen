import { pool } from '../config/db';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Apply database migration for payment functionality
 * This script:
 * 1. Adds importedepago field to tblposcrumenwebventas
 * 2. Creates tblposcrumenwebdetallepagos table
 */
async function applyPaymentMigration() {
  console.log('🔄 Starting payment functionality migration...');
  
  try {
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'add_payment_functionality.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon to execute statements separately
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await pool.execute(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error: any) {
        // Check if error is about field already existing
        if (error.code === 'ER_DUP_FIELDNAME' || error.message?.includes('Duplicate column name')) {
          console.log(`⚠️  Statement ${i + 1}: Field already exists, skipping...`);
        } else if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message?.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1}: Table already exists, skipping...`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('\n✅ Payment functionality migration completed successfully!');
    
    // Verify the changes
    console.log('\n🔍 Verifying migration...');
    
    // Check if importedepago field exists
    const [ventas] = await pool.execute('DESCRIBE tblposcrumenwebventas');
    const hasImportedepago = (ventas as any[]).some((col: any) => col.Field === 'importedepago');
    console.log(`✅ importedepago field: ${hasImportedepago ? 'EXISTS' : 'NOT FOUND'}`);
    
    // Check if tblposcrumenwebdetallepagos table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'tblposcrumenwebdetallepagos'"
    );
    const hasDetallepagos = (tables as any[]).length > 0;
    console.log(`✅ tblposcrumenwebdetallepagos table: ${hasDetallepagos ? 'EXISTS' : 'NOT FOUND'}`);
    
    if (hasImportedepago && hasDetallepagos) {
      console.log('\n🎉 All changes verified successfully!');
    } else {
      console.warn('\n⚠️  Warning: Some changes could not be verified');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
applyPaymentMigration()
  .then(() => {
    console.log('\n✅ Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  });
