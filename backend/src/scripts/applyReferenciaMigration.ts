import { pool } from '../config/db';

/**
 * Apply database migration to add referencia column to tblposcrumenwebdetallepagos
 * This script fixes the error: Unknown column 'referencia' in 'field list'
 */
async function applyReferenciaMigration() {
  console.log('🔄 Starting referencia column migration...');
  
  try {
    // First, check if the column already exists
    console.log('\n🔍 Checking current schema...');
    const [columns] = await pool.execute(
      'DESCRIBE tblposcrumenwebdetallepagos'
    );
    
    const hasReferencia = (columns as any[]).some((col: any) => col.Field === 'referencia');
    
    if (hasReferencia) {
      console.log('✅ referencia column already exists - no migration needed');
      return;
    }
    
    console.log('⚠️  referencia column NOT FOUND - applying migration...');
    
    // SQL migration statements
    // Note: We don't use IF NOT EXISTS because it's not supported in older MySQL versions
    // and we already checked for column existence above
    const statements = [
      `ALTER TABLE tblposcrumenwebdetallepagos 
       ADD COLUMN referencia VARCHAR(255) NULL 
       AFTER formadepagodetalle`
    ];
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await pool.execute(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error: any) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    console.log('\n✅ Referencia column migration completed successfully!');
    
    // Verify the changes
    console.log('\n🔍 Verifying migration...');
    
    // Check if referencia column exists
    const [columnsAfter] = await pool.execute('DESCRIBE tblposcrumenwebdetallepagos');
    const hasReferenciaAfter = (columnsAfter as any[]).some((col: any) => col.Field === 'referencia');
    console.log(`✅ referencia column: ${hasReferenciaAfter ? 'EXISTS' : 'NOT FOUND'}`);
    
    if (hasReferenciaAfter) {
      console.log('\n🎉 Migration verified successfully!');
      
      // Display the column details
      console.log('\n📋 Column schema:');
      const referenciaCol = (columnsAfter as any[]).find((col: any) => col.Field === 'referencia');
      if (referenciaCol) {
        console.log(JSON.stringify(referenciaCol, null, 2));
      }
    } else {
      console.warn('\n⚠️  Warning: referencia column could not be verified');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
applyReferenciaMigration()
  .then(() => {
    console.log('\n✅ Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  });
