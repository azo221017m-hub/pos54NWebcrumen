import React from 'react';
import { X, Printer, MessageCircle } from 'lucide-react';
import type { MotivoMovimiento } from '../../../types/movimientos.types';
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

const pad = (str: string, len: number, right = false) => {
  const s = str.substring(0, len);
  return right ? s.padStart(len) : s.padEnd(len);
};

const generarTexto = (
  motivomovimiento: MotivoMovimiento,
  observaciones: string,
  detalles: DetalleTicket[],
  nombreUsuario: string
): string => {
  const fecha = new Date().toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
  const sep  = '================================';
  const sep2 = '--------------------------------';

  let t = `${sep}\n`;
  t += `   CONFIRMACION DE MOVIMIENTO\n`;
  t += `${sep}\n`;
  t += `Fecha:  ${fecha}\n`;
  t += `Motivo: ${motivomovimiento}\n`;
  if (observaciones.trim()) {
    t += `Obs:    ${observaciones.trim()}\n`;
  }
  t += `${sep2}\n`;
  t += `INSUMO           CANT\n`;
  t += `${sep2}\n`;

  detalles.forEach((d) => {
    const cantNum = Number(d.cantidad) || 0;
    const nombre = pad(d.nombreinsumo || '', 17);
    const cant   = `${cantNum}`.padEnd(8);
    const um     = d.unidadmedida || '';
    t += `${nombre}${cant}${um}\n`;
  });

  t += `${sep2}\n`;
  t += `Nombre de quien recibe:\n`;
  t += `${nombreUsuario}\n`;
  t += `${sep}\n`;

  return t;
};

const TicketMovimiento: React.FC<TicketMovimientoProps> = ({
  motivomovimiento,
  observaciones,
  detalles,
  onClose,
}) => {
  const nombreUsuario = getNombreUsuario();
  const textoTicket = generarTexto(motivomovimiento, observaciones, detalles, nombreUsuario);

  const handleImprimir = () => {
    const ventana = window.open('', '_blank', 'width=400,height=700');
    if (!ventana) return;
    ventana.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket de Movimiento</title>
  <style>
    @media print { @page { margin: 2mm; size: 58mm auto; } }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10px;
      line-height: 1.3;
      white-space: pre;
      margin: 0;
      padding: 2mm;
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
