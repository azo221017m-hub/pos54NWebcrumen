/**
 * Script de prueba para verificar la funcionalidad de createSuperuser
 * 
 * Este script demuestra cómo ejecutar la creación del SUPERUSUARIO
 * tanto mediante el script directo como mediante el endpoint API.
 */

import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * Prueba del endpoint API para crear/actualizar SUPERUSUARIO
 */
async function testEnsureSuperuserEndpoint(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  TEST: Endpoint POST /api/auth/ensure-superuser              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  try {
    console.log(`🔄 Realizando petición a: ${BACKEND_URL}/api/auth/ensure-superuser`);
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/ensure-superuser`, {}, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ Respuesta exitosa del servidor:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('─────────────────────────────────────────────────────────────');
    
    if (response.data.success) {
      console.log('\n✅ SUPERUSUARIO procesado correctamente!');
      console.log(`   Acción realizada: ${response.data.data.action}`);
      console.log(`   ID del usuario: ${response.data.data.id}`);
      console.log(`   Alias: ${response.data.data.alias}`);
      
      // Verificar que se puede hacer login
      console.log('\n🔄 Verificando login con las credenciales del SUPERUSUARIO...');
      await testLogin();
    } else {
      console.error('\n❌ Error en la respuesta:', response.data.message);
    }
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.log('\n⚠️  Servidor no disponible en', BACKEND_URL);
        console.log('   Para ejecutar esta prueba:');
        console.log('   1. Iniciar el servidor backend: npm run dev');
        console.log('   2. Ejecutar este script nuevamente');
      } else if (error.response) {
        console.error('\n❌ Error en la respuesta del servidor:');
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      } else {
        console.error('\n❌ Error en la petición:', error.message);
      }
    } else {
      console.error('\n❌ Error desconocido:', error);
    }
  }
}

/**
 * Prueba del login con las credenciales del SUPERUSUARIO
 */
async function testLogin(): Promise<void> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'Crumen',  // El campo se llama 'email' pero acepta el alias
      password: 'Crumen.*'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.token) {
      console.log('\n✅ Login exitoso con credenciales del SUPERUSUARIO!');
      console.log('   Token JWT generado (primeros 50 caracteres):');
      console.log(`   ${response.data.token.substring(0, 50)}...`);
    } else {
      console.error('\n❌ Login falló - No se recibió token');
    }
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('\n❌ Error en login:');
        console.error('   Status:', error.response.status);
        console.error('   Message:', error.response.data?.message || 'Unknown error');
      } else {
        console.error('\n❌ Error en petición de login:', error.message);
      }
    }
  }
}

/**
 * Información de uso del script
 */
function printUsage(): void {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  INSTRUCCIONES DE USO                                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  console.log('Este script prueba el endpoint de creación del SUPERUSUARIO.\n');
  console.log('REQUISITOS:');
  console.log('  1. El servidor backend debe estar corriendo');
  console.log('  2. La base de datos debe estar configurada y accesible\n');
  console.log('EJECUCIÓN:');
  console.log('  npm run test:superuser\n');
  console.log('O directamente:');
  console.log('  ts-node src/scripts/testCreateSuperuser.ts\n');
  console.log('VARIABLES DE ENTORNO:');
  console.log('  BACKEND_URL - URL del servidor backend (default: http://localhost:3000)\n');
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║  TEST SCRIPT: createSuperuser Endpoint                       ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  // Verificar si se solicitó ayuda
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsage();
    return;
  }
  
  // Ejecutar prueba del endpoint
  await testEnsureSuperuserEndpoint();
  
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  FIN DE LA PRUEBA                                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

// Ejecutar el script
main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
