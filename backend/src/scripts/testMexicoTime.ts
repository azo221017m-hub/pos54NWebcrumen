/**
 * Test script to verify Mexico timezone functionality
 * This demonstrates that server-side dates are used and cannot be manipulated by clients
 */

import { getMexicoTime, getMexicoTimeISO, formatMySQLDateTime, getMexicoTimestamp, MEXICO_TIMEZONE } from '../utils/dateTime';

console.log('='.repeat(60));
console.log('TESTING MEXICO TIMEZONE FUNCTIONALITY');
console.log('='.repeat(60));

// Test 1: Get Mexico time
console.log('\n1. Current Mexico Time:');
const mexicoTime = getMexicoTime();
console.log(`   Date object: ${mexicoTime}`);
console.log(`   Timezone: ${MEXICO_TIMEZONE}`);

// Test 2: Get ISO format
console.log('\n2. Mexico Time in ISO format:');
const isoTime = getMexicoTimeISO();
console.log(`   ISO String: ${isoTime}`);

// Test 3: MySQL datetime format
console.log('\n3. MySQL DATETIME format:');
const mysqlTime = formatMySQLDateTime();
console.log(`   MySQL format: ${mysqlTime}`);

// Test 4: Timestamp
console.log('\n4. Mexico Timestamp:');
const timestamp = getMexicoTimestamp();
console.log(`   Timestamp: ${timestamp}`);
console.log(`   Date from timestamp: ${new Date(timestamp)}`);

// Test 5: Comparison with local time
console.log('\n5. Comparison (Server vs Local):');
console.log(`   Server time (Mexico): ${getMexicoTime().toLocaleString('es-MX', { timeZone: MEXICO_TIMEZONE })}`);
console.log(`   Local system time: ${new Date().toLocaleString()}`);
console.log(`   NOTE: These may differ based on server's physical timezone`);

// Test 6: Multiple calls show progression
console.log('\n6. Time progression test (3 calls):');
for (let i = 1; i <= 3; i++) {
  const time = formatMySQLDateTime();
  console.log(`   Call ${i}: ${time}`);
  // Small delay to show time progression
  const start = Date.now();
  while (Date.now() - start < 100) {} // 100ms delay
}

console.log('\n' + '='.repeat(60));
console.log('KEY POINTS:');
console.log('- All dates are generated SERVER-SIDE');
console.log('- Client CANNOT manipulate these timestamps');
console.log('- Timezone is ALWAYS Mexico City (America/Mexico_City)');
console.log('- Used for audit trails, turnos, ventas, and all timestamps');
console.log('='.repeat(60) + '\n');
