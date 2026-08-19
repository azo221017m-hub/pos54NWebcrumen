import React from 'react';
import { X, Printer, MessageCircle } from 'lucide-react';
import type { MotivoMovimiento } from '../../../types/movimientos.types';
import { getPaperConfig, getMediaPrintCss } from '../../../utils/ticketLayout';
import { separador, wrapTexto } from '../../../utils/monospaceTicket';
import './TicketMovimiento.css';

interface DetalleTicket {
  nombreinsumo: string;
  cantidad: number;
  unidadmedida: string;
}

interface TicketMovimientoProps {
  motivomovimiento: MotivoMovimiento;
  observaciones: string;
  detalles: DetalleTicket[];
  onClose: () => void;
}

const getNombreUsuario = (): string => {
  try {
    const raw = localStorage.getItem('usuario');
    if (!raw) return '';
    const u = JSON.parse(raw);
    return u?.nombre || u?.alias || '';
  } catch {
    return '';
  }
};

// Genera el ticket de movimiento a `ancho` columnas (PrinterProfile.charactersPerLine).
// Los nombres de insumo/observaciones nunca se cortan: si no caben en la columna,
// se envuelven a línea(s) adicionales.
const generarTexto = (
  motivomovimiento: MotivoMovimiento,
  observaciones: string,
  detalles: DetalleTicket[],
  nombreUsuario: string,
  ancho: number
): string => {
  const fecha = new Date().toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
  const sep = separador(ancho, '=');
  const sep2 = separador(ancho, '-');
  const colCant = 8;
  const colNombre = ancho - colCant;

  let t = `${sep}\n`;
  t += `   CONFIRMACION DE MOVIMIENTO\n`;
  t += `${sep}\n`;
  wrapTexto(`Fecha:  ${fecha}`, ancho).forEach(l => { t += `${l}\n`; });
  wrapTexto(`Motivo: ${motivomovimiento}`, ancho).forEach(l => { t += `${l}\n`; });
  if (observaciones.trim()) {
    wrapTexto(`Obs:    ${observaciones.trim()}`, ancho).forEach(l => { t += `${l}\n`; });
  }
  t += `${sep2}\n`;
  t += `${'INSUMO'.padEnd(colNombre)}CANT\n`;
  t += `${sep2}\n`;

  detalles.forEach((d) => {
    const cantNum = Number(d.cantidad) || 0;
    const nombre = d.nombreinsumo || '';
    const cantUm = `${cantNum} ${d.unidadmedida || ''}`.trim();
    if (nombre.length <= colNombre) {
      t += `${nombre.padEnd(colNombre)}${cantUm}\n`;
    } else {
      wrapTexto(nombre, ancho).forEach(l => { t += `${l}\n`; });
      t += `  ${cantUm}\n`;
    }
  });

  t += `${sep2}\n`;
  t += `Nombre de quien recibe:\n`;
  wrapTexto(nombreUsuario, ancho).forEach(l => { t += `${l}\n`; });
  t += `${sep}\n`;

  return t;
};

const TicketMovimiento: React.FC<TicketMovimientoProps> = ({
  motivomovimiento,
  observaciones,
  detalles,
  onClose,
}) => {
  const cfg = getPaperConfig();
  const nombreUsuario = getNombreUsuario();
  const textoTicket = generarTexto(motivomovimiento, observaciones, detalles, nombreUsuario, cfg.charactersPerLine);

  const handleImprimir = () => {
    const ventana = window.open('', '_blank', `width=${cfg.popupWidth},height=700`);
    if (!ventana) return;
    ventana.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket de Movimiento</title>
  <style>
    ${getMediaPrintCss(cfg)}
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: ${cfg.fontSize}px;
      line-height: 1.3;
      /* pre-wrap (no 'pre'): generarTexto ya ajusta a charactersPerLine, esto evita que
         un cálculo mm↔carácter ligeramente desajustado trunque texto. */
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      padding: 2mm;
      width: ${cfg.cssWidth};
    }
  </style>
</head>
<body>${textoTicket.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(textoTicket);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="ticket-overlay">
      <div className="ticket-modal">
        <div className="ticket-modal-header">
          <h2 className="ticket-modal-title">Confirmación de Movimiento</h2>
          <button
            type="button"
            className="ticket-btn-cerrar"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="ticket-modal-body">
          <pre className="ticket-contenido">{textoTicket}</pre>
        </div>

        <div className="ticket-modal-footer">
          <button
            type="button"
            className="ticket-btn ticket-btn-imprimir"
            onClick={handleImprimir}
            title="Imprimir ticket"
          >
            <Printer size={18} />
            Imprimir
          </button>
          <button
            type="button"
            className="ticket-btn ticket-btn-whatsapp"
            onClick={handleWhatsApp}
            title="Enviar por WhatsApp"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketMovimiento;
