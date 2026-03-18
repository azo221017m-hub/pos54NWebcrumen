// Utilidades para generar el recibo de pago en formato 58mm

export interface ItemRecibo {
  nombreproducto: string;
  cantidad: number;
  preciounitario: number;
  subtotal: number;
  moderadores?: string | null;
}

export interface DatosRecibo {
  // Header
  logotipo?: string | null;
  nombredenegocio: string;
  rfc?: string;
  direccionfiscal?: string;
  encabezado?: string;
  // Ticket info
  folioventa?: string;
  fechadeventa?: string;
  // Detalle
  items: ItemRecibo[];
  // Totales
  subtotal?: number;
  descuentos?: number;
  impuestos?: number;
  total: number;
  // Pago
  formadepago: string;
  importedepago: number;
  referencia?: string | null;
  cambio?: number;
  // Footer
  telefonopedidos?: string;
  pie?: string;
}

/**
 * Genera el HTML del recibo de pago con estilos para papel de 58mm
 */
export function generarHtmlRecibo(datos: DatosRecibo): string {
  const {
    logotipo,
    nombredenegocio,
    rfc,
    direccionfiscal,
    encabezado,
    folioventa,
    fechadeventa,
    items,
    subtotal,
    descuentos,
    impuestos,
    total,
    formadepago,
    importedepago,
    referencia,
    cambio,
    telefonopedidos,
    pie,
  } = datos;

  const fmt = (n: number) => `$${Number(n).toFixed(2)}`;

  const itemsHtml = items
    .map((item) => {
      const modHtml = item.moderadores
        ? `<div class="mod">${escapeHtml(item.moderadores)}</div>`
        : '';
      return `
        <div class="item">
          <div class="item-nombre">${escapeHtml(item.nombreproducto)}</div>
          <div class="item-detalle">
            <span>${item.cantidad} x ${fmt(item.preciounitario)}</span>
            <span>${fmt(item.subtotal)}</span>
          </div>
          ${modHtml}
        </div>`;
    })
    .join('');

  const logoHtml = logotipo
    ? `<img src="${logotipo}" class="logo" alt="Logo" />`
    : '';

  const encabezadoHtml = encabezado
    ? `<div class="encabezado">${escapeHtml(encabezado)}</div>`
    : '';

  const foliodateHtml =
    folioventa || fechadeventa
      ? `<div class="folio">${folioventa ? `Ticket #${escapeHtml(folioventa)}` : ''}</div>
         <div class="fecha">${fechadeventa ? escapeHtml(fechadeventa) : ''}</div>`
      : '';

  const descuentosHtml =
    descuentos && descuentos > 0
      ? `<div class="total-row"><span>Descuentos</span><span>-${fmt(descuentos)}</span></div>`
      : '';

  const impuestosHtml =
    impuestos && impuestos > 0
      ? `<div class="total-row"><span>IVA</span><span>${fmt(impuestos)}</span></div>`
      : '';

  const subtotalHtml =
    subtotal !== undefined
      ? `<div class="total-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>`
      : '';

  // Referencia o cambio según forma de pago
  let pagoInfoHtml = `
    <div class="pago-row"><span>Pago:</span><span>${escapeHtml(formadepago)}</span></div>
    <div class="pago-row"><span>Importe:</span><span>${fmt(importedepago)}</span></div>`;

  if (formadepago.toUpperCase() === 'TRANSFERENCIA' && referencia) {
    pagoInfoHtml += `<div class="pago-row"><span>Referencia:</span><span>${escapeHtml(referencia)}</span></div>`;
  } else if (formadepago.toUpperCase() === 'EFECTIVO' && cambio !== undefined) {
    pagoInfoHtml += `<div class="pago-row"><span>Cambio:</span><span>${fmt(cambio)}</span></div>`;
  }

  const telefonoPedidosHtml = telefonopedidos
    ? `<div class="telefono-pedidos">Tel. Pedidos: ${escapeHtml(telefonopedidos)}</div>`
    : '';

  const pieHtml = pie
    ? `<div class="pie">${escapeHtml(pie)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Recibo de Pago</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      width: 58mm;
      max-width: 58mm;
      padding: 4mm 3mm;
      color: #000;
      background: #fff;
    }
    .center { text-align: center; }
    .logo {
      display: block;
      margin: 0 auto 4px;
      max-width: 40mm;
      max-height: 20mm;
      object-fit: contain;
    }
    .negocio {
      font-size: 13px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 2px;
    }
    .rfc, .direccion {
      font-size: 9px;
      text-align: center;
      margin-bottom: 2px;
    }
    .encabezado {
      font-size: 9px;
      text-align: center;
      margin: 4px 0;
      white-space: pre-wrap;
    }
    .folio {
      font-size: 10px;
      text-align: center;
      font-weight: bold;
      margin-top: 4px;
    }
    .fecha {
      font-size: 9px;
      text-align: center;
      margin-bottom: 4px;
    }
    .divider {
      border: none;
      border-top: 1px dashed #000;
      margin: 4px 0;
    }
    .item {
      margin: 3px 0;
    }
    .item-nombre {
      font-size: 11px;
      font-weight: bold;
    }
    .item-detalle {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      padding-left: 4px;
    }
    .mod {
      font-size: 9px;
      padding-left: 8px;
      color: #555;
      font-style: italic;
    }
    .totales {
      margin-top: 4px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      padding: 1px 0;
    }
    .total-final {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: bold;
      padding: 2px 0;
    }
    .pago-section {
      margin-top: 4px;
    }
    .pago-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      padding: 1px 0;
    }
    .pie {
      font-size: 9px;
      text-align: center;
      margin-top: 6px;
      white-space: pre-wrap;
    }
    .telefono-pedidos {
      font-size: 9px;
      text-align: center;
      margin-top: 4px;
    }
    @media print {
      html, body { width: 58mm; }
      @page {
        size: 58mm auto;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  ${logoHtml}
  <div class="negocio">${escapeHtml(nombredenegocio)}</div>
  ${rfc ? `<div class="rfc">${escapeHtml(rfc)}</div>` : ''}
  ${direccionfiscal ? `<div class="direccion">${escapeHtml(direccionfiscal)}</div>` : ''}
  ${encabezadoHtml}
  ${foliodateHtml}
  <hr class="divider" />
  ${itemsHtml}
  <hr class="divider" />
  <div class="totales">
    ${subtotalHtml}
    ${descuentosHtml}
    ${impuestosHtml}
    <hr class="divider" />
    <div class="total-final"><span>TOTAL</span><span>${fmt(total)}</span></div>
    <hr class="divider" />
  </div>
  <div class="pago-section">
    ${pagoInfoHtml}
  </div>
  ${telefonoPedidosHtml}
  ${pieHtml}
</body>
</html>`;
}

/**
 * Abre una ventana de impresión con el recibo
 */
export function imprimirRecibo(datos: DatosRecibo): void {
  const html = generarHtmlRecibo(datos);
  const ventana = window.open('', '_blank', 'width=300,height=600');
  if (!ventana) {
    alert('No se pudo abrir la ventana de impresión. Verifica que los pop-ups estén permitidos.');
    return;
  }
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => {
    ventana.print();
    ventana.close();
  }, 500);
}

/**
 * Genera el texto plano del recibo para enviar por WhatsApp
 */
export function generarTextoWhatsApp(datos: DatosRecibo): string {
  const {
    nombredenegocio,
    rfc,
    encabezado,
    folioventa,
    fechadeventa,
    items,
    subtotal,
    descuentos,
    impuestos,
    total,
    formadepago,
    importedepago,
    referencia,
    cambio,
    telefonopedidos,
    pie,
  } = datos;

  const fmt = (n: number) => `$${Number(n).toFixed(2)}`;
  const linea = '────────────────';
  const RECEIPT_WIDTH = 18; // character width matching divider length

  const padRow = (label: string, value: string): string => {
    const spaces = Math.max(1, RECEIPT_WIDTH - label.length - value.length);
    return `${label}${' '.repeat(spaces)}${value}`;
  };

  // Split fechadeventa into date and time parts
  let fechaParte = fechadeventa || '';
  let horaParte = '';
  if (fechadeventa) {
    const spaceIdx = fechadeventa.lastIndexOf(' ');
    if (spaceIdx > -1) {
      fechaParte = fechadeventa.substring(0, spaceIdx);
      horaParte = fechadeventa.substring(spaceIdx + 1);
    }
  }

  let texto = `${nombredenegocio}\n`;
  if (rfc) texto += `RFC: ${rfc}\n`;
  if (encabezado) texto += `${encabezado}\n`;
  if (folioventa) texto += `Ticket #${folioventa}\n`;
  if (fechadeventa) {
    if (horaParte) {
      texto += `${fechaParte}  ${horaParte}\n`;
    } else {
      texto += `${fechaParte}\n`;
    }
  }
  texto += `\n${linea}\n\n`;

  items.forEach((item) => {
    texto += `${item.nombreproducto}\n`;
    const detalle = `${item.cantidad} x ${fmt(item.preciounitario)}`;
    texto += `${padRow(detalle, fmt(item.subtotal))}\n`;
    if (item.moderadores) texto += `  _${item.moderadores}_\n`;
    texto += `\n`;
  });

  texto += `${linea}\n\n`;
  if (subtotal !== undefined) texto += `${padRow('Subtotal', fmt(subtotal))}\n`;
  if (descuentos && descuentos > 0) texto += `${padRow('Descuento', `-${fmt(descuentos)}`)}\n`;
  if (impuestos && impuestos > 0) texto += `${padRow('IVA', fmt(impuestos))}\n`;
  texto += `${padRow('TOTAL', fmt(total))}\n`;
  texto += `\n${linea}\n\n`;

  texto += `Pago: ${formadepago}  ${fmt(importedepago)}\n`;
  if (formadepago.toUpperCase() === 'TRANSFERENCIA' && referencia) {
    texto += `Referencia: ${referencia}\n`;
  } else if (formadepago.toUpperCase() === 'EFECTIVO' && cambio !== undefined) {
    texto += `Cambio: ${fmt(cambio)}\n`;
  }

  if (telefonopedidos) texto += `\nTel. Pedidos: ${telefonopedidos}\n`;
  if (pie) texto += `\n${pie}\n`;

  return texto;
}

/**
 * Abre la app de WhatsApp con el texto del recibo (sin abrir WhatsApp Web)
 */
export function enviarReciboWhatsApp(datos: DatosRecibo): void {
  const texto = generarTextoWhatsApp(datos);
  window.location.href = `whatsapp://send?text=${encodeURIComponent(texto)}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
