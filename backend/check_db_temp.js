const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'crumenprod01.mysql.database.azure.com',
    user: 'azavala',
    password: 'Z4vaLA$Ant',
    database: 'bdcdttx',
    port: 3306
  });

  try {
    // Check productos table
    console.log('\n=== productos table ===');
    try {
      const [prodCols] = await connection.query(`DESCRIBE productos`);
      console.log('Columns:', prodCols.map(c => c.Field).join(', '));
      console.log('Has idnegocio:', prodCols.some(c => c.Field === 'idnegocio'));
    } catch (e) {
      console.log('Table does not exist');
    }
    
    // Check ventas table
    console.log('\n=== ventas table ===');
    try {
      const [ventasCols] = await connection.query(`DESCRIBE ventas`);
      console.log('Columns:', ventasCols.map(c => c.Field).join(', '));
      console.log('Has idnegocio:', ventasCols.some(c => c.Field === 'idnegocio'));
    } catch (e) {
      console.log('Table does not exist');
    }
    
    // Check inventario table
    console.log('\n=== inventario table ===');
    try {
      const [invCols] = await connection.query(`DESCRIBE inventario`);
      console.log('Columns:', invCols.map(c => c.Field).join(', '));
      console.log('Has idnegocio:', invCols.some(c => c.Field === 'idnegocio'));
    } catch (e) {
      console.log('Table does not exist');
    }
    
    // Check categorias table  
    console.log('\n=== categorias table ===');
    try {
      const [catCols] = await connection.query(`DESCRIBE categorias`);
      console.log('Columns:', catCols.map(c => c.Field).join(', '));
      console.log('Has idnegocio:', catCols.some(c => c.Field === 'idnegocio'));
    } catch (e) {
      console.log('Table does not exist');
    }
    
    // List all tables
    console.log('\n=== All tables in database ===');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(tables.map(t => Object.values(t)[0]).join(', '));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSchema();
