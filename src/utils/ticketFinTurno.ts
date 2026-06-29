/**
 * Generador de Ticket de Cierre de Turno — impresora térmica 58mm (32 chars/línea).
 * Fuente única de contenido: mismo texto para impresión y WhatsApp.
 */

import type { CorteFinTurnoData } from '../types/turno.types';

const ANCHO = 32;
const SEP  = '='.repeat(ANCHO); // ================================
const SEP2 = '-'.repeat(ANCHO); // --------------------------------

// ── Utilidades de formato ────────────────────────────────────

const centrar = (texto: string): string => {
  if (texto.length >= ANCHO) return texto.slice(0, ANCHO);
  const pad = Math.floor((ANCHO - texto.length) / 2);
  return ' '.repeat(pad) + texto;
};

/** Dos columnas: etiqueta izquierda, valor derecho. */
const fila2col = (etiqueta: string, valor: string): string => {
  const espacio = ANCHO - etiqueta.length - valor.length;
  if (espacio <= 0) return `${etiqueta} ${valor}`;
  return etiqueta + ' '.repeat(espacio) + valor;
};

/**
 * Tres columnas a 32 chars: nombre (izq, 16), cantidad (der, 4), importe (der, 12).
 * Usar para: formas de pago, tipo de venta, descuentos, productos.
 */
const fila3col = (nombre: string, cant: string | number, importe: string): string => {
  const n   = String(nombre).slice(0, 16).padEnd(16);
  const c   = String(cant).padStart(4);
  const imp = importe.padStart(12);
  return n + c + imp;
};

/** Importe con signo $ (secciones narrativas). */
const moneda = (valor: number): string =>
  `$${Math.abs(valor).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Importe sin $ para columnas de tablas (puede incluir signo negativo). */
const numCol = (valor: number): string => {
  const abs = Math.abs(valor).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return valor < 0 ? `-${abs}` : abs;
};

const formatFecha = (iso: string | null): string => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('/');
};

const formatHora = (iso: string | null): string => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join(':');
};

const formatFechaHora = (iso: string | null): string =>
  iso ? `${formatFecha(iso)} ${formatHora(iso)}` : 'N/A';

/** Divide texto en líneas de ≤ maxLen chars por palabras. */
const wrapTexto = (texto: string, maxLen = ANCHO): string[] => {
  if (texto.length <= maxLen) return [texto];
  const palabras = texto.split(' ');
  const lineas: string[] = [];
  let linea = '';
  for (const p of palabras) {
    if ((linea ? linea + ' ' + p : p).length <= maxLen) {
      linea = linea ? linea + ' ' + p : p;
    } else {
      if (linea) lineas.push(linea);
      linea = p.slice(0, maxLen);
    }
  }
  if (linea) lineas.push(linea);
  return lineas;
};

// ── Generador principal ──────────────────────────────────────

export const generarTextoTicket = (data: CorteFinTurnoData): string => {
  const lineas: string[] = [];
  const {
    turno, resumen, gastos, totalGastos,
    ventasPorFormaDePago, totalVentasPago,
    totalVentasPagoCount, hasMixtoVentas,
    ventasPorTipoDeVenta, descuentosAplicados,
    conciliacion, productosVendidos,
    totalUnidades, totalVentaProductos,
    indicadores, comandasAbiertas,
  } = data;

  const ahora = new Date().toISOString();

  // ── 1. ENCABEZADO ──────────────────────────────────────────
  lineas.push(SEP);
  wrapTexto((turno.nombreNegocio || 'NEGOCIO').toUpperCase()).forEach(l =>
    lineas.push(centrar(l))
  );
  if (turno.direccionnegocio) {
    wrapTexto(turno.direccionnegocio.trim()).forEach(l => lineas.push(centrar(l)));
  }
  if (turno.rfcnegocio) {
    lineas.push(centrar(`RFC: ${turno.rfcnegocio}`));
  }
  lineas.push(SEP);
  lineas.push(centrar('CIERRE DE TURNO DE VENTA'));
  lineas.push(SEP2);

  // ── 2. DATOS DEL TURNO ─────────────────────────────────────
  lineas.push(fila2col('Fecha impr:', formatFecha(ahora)));
  lineas.push(fila2col('Hora impr:', formatHora(ahora)));
  lineas.push(fila2col('No. turno:', String(turno.numeroturno)));
  lineas.push('Cajero:');
  wrapTexto('  ' + (turno.usuarioturno || '-'), ANCHO).forEach(l => lineas.push(l));
  lineas.push(fila2col('Apertura:', formatFechaHora(turno.fechainicioturno)));
  lineas.push(fila2col('Cierre:', formatFechaHora(turno.fechafinturno)));

  // ── 3. MESAS / CUENTAS ABIERTAS (solo si las hay) ──────────
  if ((comandasAbiertas ?? 0) > 0) {
    lineas.push(SEP2);
    lineas.push(`** MESAS/CUENTAS ABIERTAS: ${comandasAbiertas}`);
    lineas.push('   (no incluidas en este corte)');
  }

  // ── 4. RESUMEN DE VENTA ────────────────────────────────────
  lineas.push(SEP2);
  lineas.push(centrar('RESUMEN DE VENTA'));
  lineas.push(SEP2);
  lineas.push(fila2col('Total tickets:', String(indicadores.totalTickets)));
  lineas.push(fila2col('TOTAL VENTA TURNO:', moneda(resumen.ventasNetas)));

  // ── 5. FORMAS DE PAGO ──────────────────────────────────────
  lineas.push(SEP2);
  lineas.push(centrar('FORMAS DE PAGO'));
  lineas.push(SEP2);
  lineas.push(fila3col('Concepto', 'Cant', '     Importe'));
  for (const fp of ventasPorFormaDePago) {
    const esFpEfectivo = fp.formadepago.toUpperCase() === 'EFECTIVO';
    const nombre = esFpEfectivo && hasMixtoVentas
      ? `${fp.formadepago}*`
      : fp.formadepago;
    lineas.push(fila3col(nombre, fp.count, numCol(fp.total)));
  }
  lineas.push(SEP2);
  const countTotal = totalVentasPagoCount ?? ventasPorFormaDePago.reduce((s, r) => s + r.count, 0);
  lineas.push(fila3col('TOTAL', countTotal, numCol(totalVentasPago)));
  if (hasMixtoVentas) {
    lineas.push('(*) Incluye desglose de');
    lineas.push('    ventas con pago MIXTO');
  }

  // ── 6. TIPO DE VENTA ───────────────────────────────────────
  if (ventasPorTipoDeVenta.length > 0) {
    lineas.push(SEP2);
    lineas.push(centrar('TIPO DE VENTA'));
    lineas.push(SEP2);
    lineas.push(fila3col('Concepto', 'Cant', '     Importe'));
    for (const tv of ventasPorTipoDeVenta) {
      lineas.push(fila3col(tv.tipodeventa, tv.count, numCol(tv.total)));
    }
    lineas.push(SEP2);
    lineas.push(fila3col('TOTAL', indicadores.totalTickets, numCol(resumen.ventasNetas)));
  }

  // ── 7. DESCUENTOS APLICADOS ────────────────────────────────
  if (descuentosAplicados.length > 0) {
    lineas.push(SEP2);
    lineas.push(centrar('DESCUENTOS APLICADOS'));
    lineas.push(SEP2);
    lineas.push(fila3col('Concepto', 'Cant', '     Importe'));
    for (const d of descuentosAplicados) {
      lineas.push(fila3col(d.nombre, d.operaciones, numCol(-d.montoDescuento)));
    }
    lineas.push(SEP2);
    const totalOpDesc = descuentosAplicados.reduce((s, d) => s + d.operaciones, 0);
    lineas.push(fila3col('TOTAL DESC.', totalOpDesc, numCol(-resumen.totalDescuentos)));
  }

  // ── 8. CORTE DE EFECTIVO ───────────────────────────────────
  lineas.push(SEP2);
  lineas.push(centrar('CORTE DE EFECTIVO'));
  lineas.push(SEP2);

  if (conciliacion.fondoInicial > 0) {
    lineas.push('Fondo caja ingresado:');
    lineas.push(moneda(conciliacion.fondoInicial).padStart(ANCHO));
  }
  if (conciliacion.ingresosCaja > 0) {
    lineas.push('Ingresos a caja:');
    lineas.push(moneda(conciliacion.ingresosCaja).padStart(ANCHO));
  }
  if (conciliacion.retirosCaja > 0) {
    lineas.push('Retiros de caja:');
    lineas.push(('-' + moneda(conciliacion.retirosCaja)).padStart(ANCHO));
  }
  if (conciliacion.retiroFondo > 0) {
    lineas.push('Fondo caja retirado:');
    lineas.push(('-' + moneda(conciliacion.retiroFondo)).padStart(ANCHO));
  }

  lineas.push('Venta en efectivo:');
  lineas.push(moneda(conciliacion.ventasEfectivo).padStart(ANCHO));

  if (totalGastos !== 0) {
    lineas.push('(-) Gastos:');
    lineas.push(('-' + moneda(totalGastos)).padStart(ANCHO));
    if (gastos.length > 0) {
      lineas.push('  Detalle de gastos:');
      for (const g of gastos) {
        const imp = numCol(Math.abs(g.importe)).padStart(8);
        const nom = ('  - ' + g.concepto).slice(0, ANCHO - 8);
        lineas.push(nom.padEnd(ANCHO - 8) + imp);
      }
    }
  }

  lineas.push(SEP2);
  const totalEntrega = conciliacion.ventasEfectivo - totalGastos;
  lineas.push('TOTAL EFECTIVO');
  lineas.push(fila2col('A ENTREGAR:', moneda(totalEntrega)));
  lineas.push('(Venta efectivo - Gastos)');

  // Conciliación con arqueo (efectivo contado), si fue capturado
  const efectivoContado = data.efectivoContado ?? null;
  if (efectivoContado !== null && efectivoContado >= 0) {
    lineas.push(SEP2);
    lineas.push(fila2col('Efectivo declarado:', moneda(efectivoContado)));
    const diff = efectivoContado - conciliacion.efectivoEsperado;
    const signo = diff >= 0 ? '+' : '-';
    lineas.push(fila2col('Diferencia:', `${signo}${moneda(Math.abs(diff))}`));
    const estado =
      Math.abs(diff) < 0.01 ? 'CUADRADO' : diff > 0 ? 'SOBRANTE' : 'FALTANTE';
    lineas.push(fila2col('Estado:', estado));
  }

  // ── 9. DETALLE DE PRODUCTOS ────────────────────────────────
  if (productosVendidos.length > 0) {
    lineas.push(SEP2);
    lineas.push(centrar('DETALLE DE PRODUCTOS'));
    lineas.push(SEP2);
    lineas.push(fila3col('Producto', 'Cant', '     Importe'));
    for (const p of productosVendidos) {
      lineas.push(fila3col(p.nombreproducto, Math.round(p.cantidad), numCol(p.total)));
    }
    lineas.push(SEP2);
    lineas.push(fila3col('TOTAL PROD.', Math.round(totalUnidades), numCol(totalVentaProductos)));
  }

  // ── 10. PIE ────────────────────────────────────────────────
  lineas.push(SEP);
  lineas.push(centrar('Documento de uso interno'));
  lineas.push(centrar('No valido como'));
  lineas.push(centrar('comprobante fiscal'));
  lineas.push(SEP);
  lineas.push('');

  return lineas.join('\n');
};
