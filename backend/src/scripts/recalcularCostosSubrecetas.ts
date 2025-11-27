import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface Subreceta extends RowDataPacket {
  idSubReceta: number;
  nombreSubReceta: string;
  costoSubReceta: number;
}

interface DetalleSubreceta extends RowDataPacket {
  cantidadUsoSubr: number;
  costoInsumoSubr: number;
}

/**
 * Script para recalcular los costos de todas las subrecetas
 * basándose en la fórmula: suma(cantidadUsoSubr × costoInsumoSubr)
 */
async function recalcularCostosSubrecetas() {
  try {
    console.log('🔄 Iniciando recálculo de costos de subrecetas...\n');

    // Obtener todas las subrecetas
    const [subrecetas] = await pool.query<Subreceta[]>(
      'SELECT idSubReceta, nombreSubReceta, costoSubReceta FROM tblposcrumenwebsubrecetas'
    );

    console.log(`📊 Total de subrecetas encontradas: ${subrecetas.length}\n`);

    let actualizadas = 0;
    let sinCambios = 0;

    for (const subreceta of subrecetas) {
      // Obtener detalles de la subreceta
      const [detalles] = await pool.query<DetalleSubreceta[]>(
        'SELECT cantidadUsoSubr, costoInsumoSubr FROM tblposcrumenwebdetallesubrecetas WHERE dtlSubRecetaId = ?',
        [subreceta.idSubReceta]
      );

      // Calcular el costo correcto
      const costoCalculado = detalles.reduce((total, detalle) => {
        const cantidad = parseFloat(String(detalle.cantidadUsoSubr)) || 0;
        const costoUnitario = parseFloat(String(detalle.costoInsumoSubr)) || 0;
        return total + (cantidad * costoUnitario);
      }, 0);

      const costoActual = parseFloat(String(subreceta.costoSubReceta)) || 0;
      
      // Verificar si necesita actualización (tolerancia de 0.01 por redondeo)
      if (Math.abs(costoCalculado - costoActual) > 0.01) {
        // Actualizar el costo
        await pool.query(
          'UPDATE tblposcrumenwebsubrecetas SET costoSubReceta = ? WHERE idSubReceta = ?',
          [costoCalculado, subreceta.idSubReceta]
        );

        console.log(`✅ ${subreceta.nombreSubReceta}`);
        console.log(`   Costo anterior: $${costoActual.toFixed(2)}`);
        console.log(`   Costo calculado: $${costoCalculado.toFixed(2)}`);
        console.log(`   Diferencia: $${(costoCalculado - costoActual).toFixed(2)}\n`);
        
        actualizadas++;
      } else {
        console.log(`✓ ${subreceta.nombreSubReceta} - Costo correcto: $${costoActual.toFixed(2)}`);
        sinCambios++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Resumen:`);
    console.log(`   Total procesadas: ${subrecetas.length}`);
    console.log(`   Actualizadas: ${actualizadas}`);
    console.log(`   Sin cambios: ${sinCambios}`);
    console.log('='.repeat(60));
    console.log('\n✅ Recálculo completado exitosamente');

  } catch (error) {
    console.error('❌ Error al recalcular costos:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar el script
recalcularCostosSubrecetas();
