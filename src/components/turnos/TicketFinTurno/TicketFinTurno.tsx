import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, MessageCircle, Loader, CheckCircle, ArrowLeft } from 'lucide-react';
import type { CorteFinTurnoData } from '../../../types/turno.types';
import { obtenerCorteFinTurno } from '../../../services/turnosService';
import { generarTextoTicket } from '../../../utils/ticketFinTurno';
import './TicketFinTurno.css';

interface TicketFinTurnoProps {
  claveturno: string;
  onClose: () => void;
  /** Valor del arqueo de caja a inyectar en el ticket (opcional) */
  efectivoContado?: number;
  /** Callback para confirmar el cierre del turno (opcional – muestra botón Confirmar) */
  onConfirm?: () => void;
  /** Callback para cancelar y regresar al modal anterior (opcional – muestra botón Cancelar) */
  onBack?: () => void;
  /** Indica que se está procesando la confirmación (deshabilita el botón Confirmar) */
  isConfirming?: boolean;
}

const TicketFinTurno: React.FC<TicketFinTurnoProps> = ({
  claveturno,
  onClose,
  efectivoContado,
  onConfirm,
  onBack,
  isConfirming = false,
}) => {
  const [data, setData] = useState<CorteFinTurnoData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const corte = await obtenerCorteFinTurno(claveturno);
        // Inject efectivoContado when provided (muestra conciliación en el ticket)
        if (typeof efectivoContado === 'number' && efectivoContado > 0) {
          corte.efectivoContado = efectivoContado;
        }
        setData(corte);
      } catch (err) {
        console.error('Error al cargar corte de fin de turno:', err);
        setError('Error al cargar el corte de fin de turno');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  // efectivoContado is intentionally excluded from deps: it is a one-time value
  // captured from the already-filled form when this modal opens. If claveturno
  // changes the data will be re-fetched and the new efectivoContado (if any)
  // should be passed by the parent again via re-mounting.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveturno]);

  const textoTicket = data ? generarTextoTicket(data) : '';

  const handleImprimir = () => {
    if (!ticketRef.current) return;
    const ventana = window.open('', '_blank', 'width=400,height=700');
    if (!ventana) return;
    ventana.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Corte de Fin de Turno</title>
  <style>
    @media print {
      @page { margin: 2mm; size: 58mm auto; }
    }
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
    if (!textoTicket) return;
    const encoded = encodeURIComponent(textoTicket);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="ticket-overlay">
      <div className="ticket-modal">
        {/* Encabezado del modal */}
        <div className="ticket-modal-header">
          <h2 className="ticket-modal-title">Corte de Fin de Turno</h2>
          <button
            type="button"
            className="ticket-btn-cerrar"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="ticket-modal-body">
          {cargando && (
            <div className="ticket-loading">
              <Loader size={32} className="ticket-spinner" />
              <p>Generando corte...</p>
            </div>
          )}

          {error && !cargando && (
            <div className="ticket-error">
              <p>{error}</p>
            </div>
          )}

          {!cargando && !error && data && (
            <pre ref={ticketRef} className="ticket-contenido">
              {textoTicket}
            </pre>
          )}
        </div>

        {/* Acciones */}
        {!cargando && !error && data && (
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
        )}

        {/* Fila de confirmación / cancelación (solo cuando se usan los callbacks) */}
        {(onConfirm || onBack) && (
          <div className="ticket-modal-footer ticket-modal-footer-confirm">
            {onBack && (
              <button
                type="button"
                className="ticket-btn ticket-btn-cancelar"
                onClick={onBack}
                disabled={isConfirming}
                title="Cancelar y regresar"
              >
                <ArrowLeft size={18} />
                Cancelar
              </button>
            )}
            {onConfirm && (
              <button
                type="button"
                className="ticket-btn ticket-btn-confirmar"
                onClick={onConfirm}
                disabled={isConfirming || cargando}
                title="Confirmar cierre de turno"
              >
                {isConfirming ? (
                  <Loader size={18} className="ticket-spinner" />
                ) : (
                  <CheckCircle size={18} />
                )}
                {isConfirming ? 'Cerrando...' : 'Confirmar Cierre'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketFinTurno;
