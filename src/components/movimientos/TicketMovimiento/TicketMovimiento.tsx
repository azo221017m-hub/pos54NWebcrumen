import React from 'react';
import { X, Printer, MessageCircle } from 'lucide-react';
import type { MotivoMovimiento } from '../../../types/movimientos.types';
import './TicketMovimiento.css';

interface DetalleTicket {
  nombreinsumo: string;
  cantidad: number;
  unidadmedida: string;
  costo?: number;
  proveedor?: string;
}

interface TicketMovimientoProps {
  motivomovimiento: MotivoMovimiento;
  observaciones: string;
  detalles: DetalleTicket[];
  totalGeneral: number;
  subtotalesPorProveedor: Record<string, number>;
  onClose: () => void;
}

const pad = (str: string, len: number, right = false) => {
  const s = str.substring(0, len);
  return right ? s.padStart(len) : s.padEnd(len);
};

const generarTexto = (
  motivomovimiento: MotivoMovimiento,
  observaciones: string,
  detalles: DetalleTicket[],
  totalGeneral: number,
  subtotalesPorProveedor: Record<string, number>
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
  t += `INSUMO           CANT   COSTO     TOTAL\n`;
  t += `${sep2}\n`;

  detalles.forEach((d) => {
    const costoNum = Number(d.costo) || 0;
    const cantNum  = Number(d.cantidad) || 0;
    const nombre = pad(d.nombreinsumo || '', 16);
    const cant   = pad(String(cantNum), 6, true);
    const costo  = pad(`$${costoNum.toFixed(2)}`, 8, true);
    const subt   = pad(`$${(cantNum * costoNum).toFixed(2)}`, 9, true);
    t += `${nombre}${cant}${costo}${subt}\n`;
    if (d.proveedor) {
      t += `  Prov: ${d.proveedor}\n`;
    }
    if (d.unidadmedida) {
      t += `  U.M.: ${d.unidadmedida}\n`;
    }
  });

  t += `${sep2}\n`;
  const proveedores = Object.entries(subtotalesPorProveedor);
  if (proveedores.length > 1) {
    t += `SUBTOTALES:\n`;
    proveedores.forEach(([prov, sub]) => {
      t += `  ${pad(prov, 22)}${pad(`$${Number(sub).toFixed(2)}`, 8, true)}\n`;
    });
    t += `${sep2}\n`;
  }
  t += `TOTAL GENERAL: ${pad(`$${Number(totalGeneral).toFixed(2)}`, 15, true)}\n`;
  t += `${sep}\n`;

  return t;
};

const TicketMovimiento: React.FC<TicketMovimientoProps> = ({
  motivomovimiento,
  observaciones,
  detalles,
  totalGeneral,
  subtotalesPorProveedor,
  onClose,
}) => {
  const textoTicket = generarTexto(
    motivomovimiento,
    observaciones,
    detalles,
    totalGeneral,
    subtotalesPorProveedor
  );

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
