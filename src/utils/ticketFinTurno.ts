/**
 * Generador de Ticket de Cierre de Turno.
 * Ancho de columnas parametrizable por PrinterProfile (charactersPerLine) para que el
 * corte salga completo sin truncar en cualquier tamaño de papel (48/58/76/80mm/A4).
 * Fuente única de contenido: mismo texto para impresión y WhatsApp.
 */

import type { CorteFinTurnoData } from '../types/turno.types';
import { centrar as centrarAncho, fila2col as fila2colAncho, wrapTexto, filaProducto, separador } from './monospaceTicket';

const ANCHO_DEFAULT = 32;

// ── Utilidades de formato (envuelven las genéricas de monospaceTicket con el ancho activo) ──

const centrar = (texto: string, ancho: number): string => centrarAncho(texto, ancho);
const fila2col = (etiqueta: string, valor: string, ancho: number): string => fila2colAncho(etiqueta, valor, ancho);
const headerRow = (ancho: number): string => filaProducto('Concepto', 'Cant', 'Importe', ancho)[0];

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

// ── Generador principal ──────────────────────────────────────

/**
 * @param charactersPerLine  Columnas disponibles según el PrinterProfile activo
 *                           (PaperConfig.charactersPerLine). Default 32 = 58mm.
 */
export const generarTextoTicket = (data: CorteFinTurnoData, charactersPerLine: number = ANCHO_DEFAULT): string => {
  const ancho = charactersPerLine;
  const SEP = separador(ancho, '=');
  const SEP2 = separador(ancho, '-');
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
  wrapTexto((turno.nombreNegocio || 'NEGOCIO').toUpperCase(), ancho).forEach(l =>
    lineas.push(centrar(l, ancho))
  );
  if (turno.direccionnegocio) {
    wrapTexto(turno.direccionnegocio.trim(), ancho).forEach(l => lineas.push(centrar(l, ancho)));
  }
  if (turno.rfcnegocio) {
    lineas.push(centrar(`RFC: ${turno.rfcnegocio}`, ancho));
  }
  lineas.push(SEP);
  lineas.push(centrar('CIERRE DE TURNO DE VENTA', ancho));
  lineas.push(SEP2);

  // ── 2. DATOS DEL TURNO ─────────────────────────────────────
  lineas.push(fila2col('Fecha impr:', formatFecha(ahora), ancho));
  lineas.push(fila2col('Hora impr:', formatHora(ahora), ancho));
  lineas.push(fila2col('No. turno:', String(turno.numeroturno), ancho));
  lineas.push('Cajero:');
  wrapTexto('  ' + (turno.usuarioturno || '-'), ancho).forEach(l => lineas.push(l));
  lineas.push(fila2col('Apertura:', formatFechaHora(turno.fechainicioturno), ancho));
  lineas.push(fila2col('Cierre:', formatFechaHora(turno.fechafinturno), ancho));

  // ── 3. MESAS / CUENTAS ABIERTAS (solo si las hay) ──────────
  if ((comandasAbiertas ?? 0) > 0) {
    lineas.push(SEP2);
    wrapTexto(`** MESAS/CUENTAS ABIERTAS: ${comandasAbiertas}`, ancho).forEach(l => lineas.push(l));
    wrapTexto('   (no incluidas en este corte)', ancho).forEach(l => lineas.push(l));
  }

  // ── 4. RESUMEN DE VENTA ────────────────────────────────────
  lineas.push(SEP2);
  lineas.push(centrar('RESUMEN DE VENTA', ancho));
  lineas.push(SEP2);
  lineas.push(fila2col('Total tickets:', String(indicadores.totalTickets), ancho));
  lineas.push(fila2col('TOTAL VENTA TURNO:', moneda(resumen.ventasNetas), ancho));

  // ── 5. FORMAS DE PAGO ──────────────────────────────────────
  lineas.push(SEP2);
  lineas.push(centrar('FORMAS DE PAGO', ancho));
  lineas.push(SEP2);
  lineas.push(headerRow(ancho));
  for (const fp of ventasPorFormaDePago) {
    const esFpEfectivo = fp.formadepago.toUpperCase() === 'EFECTIVO';
    const nombre = esFpEfectivo && hasMixtoVentas
      ? `${fp.formadepago}*`
      : fp.formadepago;
    lineas.push(...filaProducto(nombre, String(fp.count), numCol(fp.total), ancho));
  }
  lineas.push(SEP2);
  const countTotal = totalVentasPagoCount ?? ventasPorFormaDePago.reduce((s, r) => s + r.count, 0);
  lineas.push(...filaProducto('TOTAL', String(countTotal), numCol(totalVentasPago), ancho));
  if (hasMixtoVentas) {
    wrapTexto('(*) Incluye desglose de ventas con pago MIXTO', ancho).forEach(l => lineas.push(l));
  }

  // ── 6. TIPO DE VENTA ───────────────────────────────────────
  if (ventasPorTipoDeVenta.length > 0) {
    lineas.push(SEP2);
    lineas.push(centrar('TIPO DE VENTA', ancho));
    lineas.push(SEP2);
    lineas.push(headerRow(ancho));
    for (const tv of ventasPorTipoDeVenta) {
      lineas.push(...filaProducto(tv.tipodeventa, String(tv.count), numCol(tv.total), ancho));
    }
    lineas.push(SEP2);
    lineas.push(...filaProducto('TOTAL', String(indicadores.totalTickets), numCol(resumen.ventasNetas), ancho));
  }

  // ── 7. DESCUENTOS APLICADOS ────────────────────────────────
  if (descuentosAplicados.length > 0) {
    lineas.push(SEP2);
    lineas.push(centrar('DESCUENTOS APLICADOS', ancho));
    lineas.push(SEP2);
    lineas.push(headerRow(ancho));
    for (const d of descuentosAplicados) {
      lineas.push(...filaProducto(d.nombre, String(d.operaciones), numCol(-d.montoDescuento), ancho));
    }
    lineas.push(SEP2);
    const totalOpDesc = descuentosAplicados.reduce((s, d) => s + d.operaciones, 0);
    lineas.push(...filaProducto('TOTAL DESC.', String(totalOpDesc), numCol(-resumen.totalDescuentos), ancho));
  }

  // ── 8. CORTE DE EFECTIVO ───────────────────────────────────
  lineas.push(SEP2);
  lineas.push(centrar('CORTE DE EFECTIVO', ancho));
  lineas.push(SEP2);

  if (conciliacion.fondoInicial > 0) {
    lineas.push('Fondo caja ingresado:');
    lineas.push(moneda(conciliacion.fondoInicial).padStart(ancho));
  }
  if (conciliacion.ingresosCaja > 0) {
    lineas.push('Ingresos a caja:');
    lineas.push(moneda(conciliacion.ingresosCaja).padStart(ancho));
  }
  if (conciliacion.retirosCaja > 0) {
    lineas.push('Retiros de caja:');
    lineas.push(('-' + moneda(conciliacion.retirosCaja)).padStart(ancho));
  }
  if (conciliacion.retiroFondo > 0) {
    lineas.push('Fondo caja retirado:');
    lineas.push(('-' + moneda(conciliacion.retiroFondo)).padStart(ancho));
  }

  lineas.push('Venta en efectivo:');
  lineas.push(moneda(conciliacion.ventasEfectivo).padStart(ancho));

  if (totalGastos !== 0) {
    lineas.push('(-) Gastos:');
    lineas.push(('-' + moneda(totalGastos)).padStart(ancho));
    if (gastos.length > 0) {
      lineas.push('  Detalle de gastos:');
      for (const g of gastos) {
        // Nombre completo siempre (envuelve en vez de truncar); importe en línea propia.
        wrapTexto('  - ' + g.concepto, ancho).forEach(l => lineas.push(l));
        lineas.push(numCol(Math.abs(g.importe)).padStart(ancho));
      }
    }
  }

  lineas.push(SEP2);
  const totalEntrega = conciliacion.ventasEfectivo - totalGastos;
  lineas.push('TOTAL EFECTIVO');
  lineas.push(fila2col('A ENTREGAR:', moneda(totalEntrega), ancho));
  wrapTexto('(Venta efectivo - Gastos)', ancho).forEach(l => lineas.push(l));

  // Conciliación con arqueo (efectivo contado), si fue capturado
  const efectivoContado = data.efectivoContado ?? null;
  if (efectivoContado !== null && efectivoContado >= 0) {
    lineas.push(SEP2);
    lineas.push(fila2col('Efectivo declarado:', moneda(efectivoContado), ancho));
    const diff = efectivoContado - conciliacion.efectivoEsperado;
    const signo = diff >= 0 ? '+' : '-';
    lineas.push(fila2col('Diferencia:', `${signo}${moneda(Math.abs(diff))}`, ancho));
    const estado =
      Math.abs(diff) < 0.01 ? 'CUADRADO' : diff > 0 ? 'SOBRANTE' : 'FALTANTE';
    lineas.push(fila2col('Estado:', estado, ancho));
  }

  // ── 9. DETALLE DE PRODUCTOS ────────────────────────────────
  if (productosVendidos.length > 0) {
    lineas.push(SEP2);
    lineas.push(centrar('DETALLE DE PRODUCTOS', ancho));
    lineas.push(SEP2);
    lineas.push(headerRow(ancho));
    for (const p of productosVendidos) {
      lineas.push(...filaProducto(p.nombreproducto, String(Math.round(p.cantidad)), numCol(p.total), ancho));
    }
    lineas.push(SEP2);
    lineas.push(...filaProducto('TOTAL PROD.', String(Math.round(totalUnidades)), numCol(totalVentaProductos), ancho));
  }

  // ── 10. PIE ────────────────────────────────────────────────
  lineas.push(SEP);
  lineas.push(centrar('Documento de uso interno', ancho));
  lineas.push(centrar('No valido como', ancho));
  lineas.push(centrar('comprobante fiscal', ancho));
  lineas.push(SEP);
  lineas.push('');

  return lineas.join('\n');
};
