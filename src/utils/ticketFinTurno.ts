/**
 * Generador de Texto para el Ticket de Fin de Turno (Corte de Caja)
 *
 * Fuente única de contenido: genera el mismo texto para impresión térmica y WhatsApp.
 * Impresoras 58 mm ~ 32 caracteres por línea.
 * Impresoras 80 mm ~ 48 caracteres por línea.
 */

import type { CorteFinTurnoData } from '../types/turno.types';

const ANCHO = 32; // caracteres por línea (58 mm)

const SEP = '='.repeat(ANCHO);
const SEP2 = '-'.repeat(ANCHO);

/** Centra un texto dentro de la anchura del ticket */
const centrar = (texto: string, ancho = ANCHO): string => {
  const len = texto.length;
  if (len >= ancho) return texto.slice(0, ancho);
  const pad = Math.floor((ancho - len) / 2);
  return ' '.repeat(pad) + texto;
};

/** Formatea moneda */
const moneda = (valor: number): string =>
  `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Línea de dos columnas: etiqueta izquierda, valor derecho */
const fila2col = (etiqueta: string, valor: string, ancho = ANCHO): string => {
  const espacio = ancho - etiqueta.length - valor.length;
  if (espacio <= 0) return `${etiqueta} ${valor}`;
  return etiqueta + ' '.repeat(espacio) + valor;
};

/** Formatea una fecha ISO a dd/mm/aaaa hh:mm */
const formatFecha = (iso: string | null): string => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const aaaa = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${aaaa} ${hh}:${min}`;
};

/** Calcula la duración entre dos fechas y la devuelve como hh:mm hrs */
const duracion = (inicio: string, fin: string | null): string => {
  if (!fin) return 'En curso';
  const ms = new Date(fin).getTime() - new Date(inicio).getTime();
  if (ms < 0) return 'N/A';
  const hh = Math.floor(ms / 3600000);
  const mm = Math.floor((ms % 3600000) / 60000);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} hrs`;
};

/**
 * Genera el texto completo del Ticket de Fin de Turno.
 * El mismo texto se usa tanto para impresión térmica como para WhatsApp.
 */
export const generarTextoTicket = (data: CorteFinTurnoData): string => {
  const lineas: string[] = [];
  const { turno, resumen, gastos, totalGastos, ventasPorFormaDePago, totalVentasPago,
    ventasPorTipoDeVenta, descuentosAplicados, conciliacion, productosVendidos,
    totalUnidades, totalVentaProductos, indicadores, auditoria } = data;

  // ── 1. ENCABEZADO ──────────────────────────────────────────
  lineas.push(SEP);
  const nombre = (turno.nombreNegocio || 'NEGOCIO').toUpperCase();
  lineas.push(centrar(nombre));
  lineas.push(SEP);
  lineas.push('');
  lineas.push(centrar('CORTE DE FIN DE TURNO'));
  lineas.push('');
  lineas.push(`Turno: T-${String(turno.numeroturno).padStart(6, '0')}`);
  lineas.push('');
  lineas.push(`Cajero: ${turno.usuarioturno}`);
  lineas.push('');
  lineas.push(`Apertura: ${formatFecha(turno.fechainicioturno)}`);
  lineas.push(`Cierre:   ${formatFecha(turno.fechafinturno)}`);
  lineas.push('');
  lineas.push(`Duración: ${duracion(turno.fechainicioturno, turno.fechafinturno)}`);

  // ── 2. RESUMEN GENERAL ────────────────────────────────────
  lineas.push('');
  lineas.push(SEP2);
  lineas.push('RESUMEN GENERAL');
  lineas.push(SEP2);
  lineas.push(fila2col('Fondo Inicial', moneda(resumen.fondoInicial)));
  if (resumen.ingresosCaja > 0) {
    lineas.push(fila2col('Ingresos Caja', moneda(resumen.ingresosCaja)));
  }
  if (resumen.retirosCaja > 0) {
    lineas.push(fila2col('Retiros Caja', moneda(resumen.retirosCaja)));
  }
  lineas.push('');
  lineas.push(fila2col('Ventas Brutas', moneda(resumen.ventasBrutas)));
  lineas.push(fila2col('Descuentos', moneda(resumen.totalDescuentos)));
  lineas.push(fila2col('Ventas Netas', moneda(resumen.ventasNetas)));
  lineas.push('');
  lineas.push(fila2col('Gastos', moneda(resumen.totalGastos)));

  // ── 3. VENTAS POR FORMA DE PAGO ───────────────────────────
  lineas.push('');
  lineas.push(SEP2);
  lineas.push('VENTAS POR FORMA DE PAGO');
  lineas.push(SEP2);
  for (const fp of ventasPorFormaDePago) {
    lineas.push(fila2col(fp.formadepago, moneda(fp.total)));
  }
  lineas.push('');
  lineas.push(fila2col('TOTAL', moneda(totalVentasPago)));

  // ── 4. VENTAS POR TIPO DE VENTA ───────────────────────────
  lineas.push('');
  lineas.push(SEP2);
  lineas.push('VENTAS POR TIPO');
  lineas.push(SEP2);
  for (const tv of ventasPorTipoDeVenta) {
    lineas.push(fila2col(tv.tipodeventa, moneda(tv.total)));
  }
  lineas.push('');
  lineas.push(fila2col('TOTAL', moneda(resumen.ventasNetas)));

  // ── 5. DESCUENTOS APLICADOS ───────────────────────────────
  if (descuentosAplicados.length > 0) {
    lineas.push('');
    lineas.push(SEP2);
    lineas.push('DESCUENTOS');
    lineas.push(SEP2);
    for (const d of descuentosAplicados) {
      const val = `${moneda(d.montoDescuento)}/${d.operaciones}`;
      lineas.push(fila2col(d.nombre.toUpperCase(), val));
    }
    lineas.push('');
    lineas.push(fila2col('TOTAL DESC.', moneda(resumen.totalDescuentos)));
  }

  // ── 6. GASTOS DEL TURNO (solo si existen) ─────────────────
  if (gastos.length > 0) {
    lineas.push('');
    lineas.push(SEP2);
    lineas.push('GASTOS');
    lineas.push(SEP2);
    for (const g of gastos) {
      lineas.push(fila2col(g.concepto, moneda(g.importe)));
    }
    lineas.push('');
    lineas.push(fila2col('TOTAL GASTOS', moneda(totalGastos)));
  }

  // ── 7. CONCILIACIÓN DE EFECTIVO ───────────────────────────
  lineas.push('');
  lineas.push(SEP2);
  lineas.push('CONCILIACION EFECTIVO');
  lineas.push(SEP2);
  lineas.push(fila2col('+Fondo Inicial', moneda(conciliacion.fondoInicial)));
  if (conciliacion.ingresosCaja > 0) {
    lineas.push(fila2col('+Ingresos Fondo', moneda(conciliacion.ingresosCaja)));
  }
  if (conciliacion.retirosCaja > 0) {
    lineas.push(fila2col('-Retiros Fondo', moneda(conciliacion.retirosCaja)));
  }
  if (conciliacion.retiroFondo > 0) {
    lineas.push(fila2col('-Retiro Cierre', moneda(conciliacion.retiroFondo)));
  }
  lineas.push('');
  lineas.push(fila2col('+Ventas Efectivo', moneda(conciliacion.ventasEfectivo)));
  if (conciliacion.totalGastos > 0) {
    lineas.push(fila2col('-Gastos', moneda(conciliacion.totalGastos)));
  }
  lineas.push('');
  lineas.push(fila2col('EFECTIVO ESPERADO', moneda(conciliacion.efectivoEsperado)));

  // Conciliación con efectivo contado (arqueo)
  const efectivoContado = data.efectivoContado ?? null;
  if (efectivoContado !== null && efectivoContado >= 0) {
    const diferencia = efectivoContado - conciliacion.efectivoEsperado;
    let estado: string;
    if (Math.abs(diferencia) < 0.01) {
      estado = 'CUADRADO';
    } else if (diferencia > 0) {
      estado = 'SOBRANTE';
    } else {
      estado = 'FALTANTE';
    }
    const diferenciaStr = diferencia >= 0 ? `+${moneda(diferencia)}` : `-${moneda(Math.abs(diferencia))}`;
    lineas.push('');
    lineas.push(fila2col('Efectivo Declarado', moneda(efectivoContado)));
    lineas.push('');
    lineas.push(fila2col('Diferencia', diferenciaStr));
    lineas.push('');
    lineas.push(`Estado: ${estado}`);
  }

  // ── 8. PRODUCTOS VENDIDOS ─────────────────────────────────
  if (productosVendidos.length > 0) {
    lineas.push('');
    lineas.push(SEP2);
    lineas.push('PRODUCTOS VENDIDOS');
    lineas.push(SEP2);
    for (const p of productosVendidos) {
      const cantStr = String(p.cantidad);
      const totStr = moneda(p.total);
      const espacio = ANCHO - cantStr.length - totStr.length - 2;
      const nombre2 = p.nombreproducto.slice(0, Math.max(1, espacio));
      lineas.push(`${nombre2} ${cantStr} ${totStr}`);
    }
    lineas.push('');
    lineas.push(fila2col('TOTAL UNIDADES', String(totalUnidades)));
    lineas.push(fila2col('TOTAL PRODUCTOS', moneda(totalVentaProductos)));
  }

  // ── 9. INDICADORES OPERATIVOS ─────────────────────────────
  lineas.push('');
  lineas.push(SEP2);
  lineas.push('INDICADORES');
  lineas.push(SEP2);
  lineas.push(fila2col('Tickets Emitidos:', String(indicadores.totalTickets)));
  lineas.push('');
  lineas.push(fila2col('Venta Promedio:', moneda(indicadores.ventaPromedio)));
  lineas.push('');
  lineas.push(fila2col('Artículos Vendidos:', String(indicadores.totalUnidades)));
  lineas.push('');
  lineas.push(fila2col('Promedio Artículos:', indicadores.promedioArticulos.toFixed(2)));

  // ── 10. AUDITORÍA DEL TURNO ───────────────────────────────
  lineas.push('');
  lineas.push(SEP2);
  lineas.push('AUDITORIA');
  lineas.push(SEP2);
  lineas.push('Fecha Generación:');
  lineas.push(formatFecha(auditoria.fechaGeneracion));
  lineas.push('');
  lineas.push('Usuario:');
  lineas.push(auditoria.usuarioGenerador);

  // ── 11. PIE DEL TICKET ────────────────────────────────────
  lineas.push('');
  lineas.push(SEP);
  lineas.push(centrar('FIN DE TURNO'));
  lineas.push(SEP);
  lineas.push('');

  return lineas.join('\n');
};
