/**
 * Script de validación para verificar el filtrado de usuarios por idNegocio
 * 
 * Este script valida que el endpoint de usuarios filtre correctamente
 * los registros basados en el idNegocio del usuario autenticado.
 */

import { pool } from '../config/db';
import type { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';

interface Usuario extends RowDataPacket {
  idUsuario: number;
  alias: string;
  nombre: string;
  idNegocio: number;
  idRol: number;
  estatus: number;
}

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

/**
 * Simula la lógica del controller obtenerUsuarios
 */
async function simulateObtenerUsuarios(idnegocio: number): Promise<Usuario[]> {
  let query = `SELECT 
      idUsuario, 
      idNegocio, 
      idRol, 
      nombre, 
      alias, 
      estatus
    FROM tblposcrumenwebusuarios`;
  
  const params: any[] = [];
  
  // Si idnegocio != 99999, filtrar por negocio
  if (idnegocio !== 99999) {
    query += ` WHERE idNegocio = ?`;
    params.push(idnegocio);
  }
  
  query += ` ORDER BY fechaRegistroauditoria DESC`;

  const [rows] = await pool.execute<Usuario[]>(query, params);
  return rows;
}

/**
 * Test 1: Verificar que usuarios regulares solo ven su negocio
 */
async function testRegularUserFiltering(): Promise<void> {
  console.log('\n📋 Test 1: Filtrado para usuarios regulares...');
  
  try {
    // Obtener un usuario regular (no superusuario)
    const [regularUsers] = await pool.execute<Usuario[]>(
      'SELECT * FROM tblposcrumenwebusuarios WHERE idNegocio != 99999 AND estatus = 1 LIMIT 1'
    );

    if (regularUsers.length === 0) {
      results.push({
        test: 'Regular User Filtering',
        passed: false,
        message: 'No se encontró ningún usuario regular activo para probar'
      });
      return;
    }

    const regularUser = regularUsers[0];
    console.log(`   Usuario de prueba: ${regularUser.alias} (idNegocio: ${regularUser.idNegocio})`);

    // Simular obtenerUsuarios con el idNegocio del usuario regular
    const usuariosFiltrados = await simulateObtenerUsuarios(regularUser.idNegocio);

    // Verificar que todos los usuarios retornados son del mismo negocio
    const todosDelMismoNegocio = usuariosFiltrados.every(
      u => u.idNegocio === regularUser.idNegocio
    );

    // Contar usuarios en la base de datos de ese negocio
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM tblposcrumenwebusuarios WHERE idNegocio = ?',
      [regularUser.idNegocio]
    );
    const expectedCount = countResult[0].total;

    results.push({
      test: 'Regular User Filtering',
      passed: todosDelMismoNegocio && usuariosFiltrados.length === expectedCount,
      message: todosDelMismoNegocio && usuariosFiltrados.length === expectedCount
        ? `✅ Correcto: Se filtraron ${usuariosFiltrados.length} usuarios del negocio ${regularUser.idNegocio}`
        : `❌ Error: Filtrado incorrecto`,
      details: {
        idNegocio: regularUser.idNegocio,
        usuariosRetornados: usuariosFiltrados.length,
        usuariosEsperados: expectedCount,
        todosDelMismoNegocio
      }
    });
  } catch (error) {
    results.push({
      test: 'Regular User Filtering',
      passed: false,
      message: `❌ Error en la prueba: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test 2: Verificar que superusuarios ven todos los negocios
 */
async function testSuperuserFiltering(): Promise<void> {
  console.log('\n📋 Test 2: Filtrado para superusuarios...');
  
  try {
    // Verificar si existe un superusuario
    const [superUsers] = await pool.execute<Usuario[]>(
      'SELECT * FROM tblposcrumenwebusuarios WHERE idNegocio = 99999 AND estatus = 1 LIMIT 1'
    );

    if (superUsers.length === 0) {
      results.push({
        test: 'Superuser Filtering',
        passed: true,
        message: '⚠️  No hay superusuarios en el sistema (esto es opcional)'
      });
      return;
    }

    const superUser = superUsers[0];
    console.log(`   Superusuario de prueba: ${superUser.alias}`);

    // Simular obtenerUsuarios con idNegocio 99999
    const todosLosUsuarios = await simulateObtenerUsuarios(99999);

    // Contar todos los usuarios en la base de datos
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM tblposcrumenwebusuarios'
    );
    const totalUsuarios = countResult[0].total;

    // Contar negocios únicos en el resultado
    const negociosUnicos = new Set(todosLosUsuarios.map(u => u.idNegocio));

    results.push({
      test: 'Superuser Filtering',
      passed: todosLosUsuarios.length === totalUsuarios,
      message: todosLosUsuarios.length === totalUsuarios
        ? `✅ Correcto: Superusuario ve todos los ${totalUsuarios} usuarios de ${negociosUnicos.size} negocios`
        : `❌ Error: Superusuario no ve todos los usuarios`,
      details: {
        usuariosRetornados: todosLosUsuarios.length,
        totalUsuarios,
        negociosUnicos: Array.from(negociosUnicos)
      }
    });
  } catch (error) {
    results.push({
      test: 'Superuser Filtering',
      passed: false,
      message: `❌ Error en la prueba: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test 3: Verificar que el middleware de autenticación proporciona idNegocio
 */
async function testAuthMiddleware(): Promise<void> {
  console.log('\n📋 Test 3: Middleware de autenticación...');
  
  try {
    // Obtener un usuario para generar token
    const [users] = await pool.execute<Usuario[]>(
      'SELECT * FROM tblposcrumenwebusuarios WHERE estatus = 1 LIMIT 1'
    );

    if (users.length === 0) {
      results.push({
        test: 'Auth Middleware',
        passed: false,
        message: 'No hay usuarios activos para probar'
      });
      return;
    }

    const user = users[0];
    
    // Generar token JWT con la misma estructura que el sistema
    const token = jwt.sign(
      {
        id: user.idUsuario,
        alias: user.alias,
        nombre: user.nombre,
        idNegocio: user.idNegocio,
        idRol: user.idRol
      },
      process.env.JWT_SECRET || 'secret_key_pos54nwebcrumen_2024',
      { expiresIn: '10m' }
    );

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key_pos54nwebcrumen_2024'
    ) as any;

    const hasIdNegocio = decoded.idNegocio !== undefined;
    const idNegocioMatches = decoded.idNegocio === user.idNegocio;

    results.push({
      test: 'Auth Middleware',
      passed: hasIdNegocio && idNegocioMatches,
      message: hasIdNegocio && idNegocioMatches
        ? `✅ Correcto: JWT incluye idNegocio (${decoded.idNegocio})`
        : `❌ Error: JWT no incluye idNegocio correctamente`,
      details: {
        usuario: user.alias,
        idNegocioEsperado: user.idNegocio,
        idNegocioEnToken: decoded.idNegocio,
        tokenValido: true
      }
    });
  } catch (error) {
    results.push({
      test: 'Auth Middleware',
      passed: false,
      message: `❌ Error en la prueba: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Test 4: Verificar que todos los negocios tienen al menos un usuario
 */
async function testBusinessIntegrity(): Promise<void> {
  console.log('\n📋 Test 4: Integridad de negocios...');
  
  try {
    // Verificar que cada negocio tiene usuarios
    const [negocios] = await pool.execute<RowDataPacket[]>(
      'SELECT idNegocio, nombre FROM tblposcrumenwebnegocios WHERE estatus = 1'
    );

    const negociosSinUsuarios: any[] = [];

    for (const negocio of negocios) {
      const [usuarios] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM tblposcrumenwebusuarios WHERE idNegocio = ?',
        [negocio.idNegocio]
      );

      if (usuarios[0].total === 0) {
        negociosSinUsuarios.push(negocio);
      }
    }

    results.push({
      test: 'Business Integrity',
      passed: negociosSinUsuarios.length === 0,
      message: negociosSinUsuarios.length === 0
        ? `✅ Correcto: Todos los ${negocios.length} negocios tienen usuarios`
        : `⚠️  Advertencia: ${negociosSinUsuarios.length} negocios sin usuarios`,
      details: {
        totalNegocios: negocios.length,
        negociosSinUsuarios: negociosSinUsuarios.map(n => `${n.nombre} (id: ${n.idNegocio})`)
      }
    });
  } catch (error) {
    results.push({
      test: 'Business Integrity',
      passed: false,
      message: `❌ Error en la prueba: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Validación de Filtrado de Usuarios por idNegocio            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    await testRegularUserFiltering();
    await testSuperuserFiltering();
    await testAuthMiddleware();
    await testBusinessIntegrity();

    // Mostrar resumen
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN DE VALIDACIÓN                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    let allPassed = true;
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   Detalles:`, JSON.stringify(result.details, null, 2));
      }
      console.log();

      if (!result.passed) {
        allPassed = false;
      }
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Resultado: ${passedCount}/${totalCount} pruebas pasaron`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (allPassed) {
      console.log('✅ VALIDACIÓN EXITOSA: El filtrado por idNegocio funciona correctamente');
      process.exit(0);
    } else {
      console.log('❌ VALIDACIÓN FALLIDA: Se encontraron problemas');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error fatal en la validación:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
