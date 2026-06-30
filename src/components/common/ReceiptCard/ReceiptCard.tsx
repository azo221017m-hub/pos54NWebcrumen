import React from 'react';
import './ReceiptCard.css';

export interface ReceiptLine {
  label: string;
  value?: string;
  indent?: boolean;
  dim?: boolean;
  bold?: boolean;
  separator?: boolean;
  fullRow?: boolean;
}

export interface ReceiptStatus {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info';
}

export interface ReceiptCardProps {
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  title: string;
  generatedAt?: string;
  period?: string;
  lines: ReceiptLine[];
  totals?: ReceiptLine[];
  status?: ReceiptStatus;
  subStatus?: string;
  footer?: string;
  onPrint?: () => void;
  onWhatsApp?: () => void;
  className?: string;
}

const fmt = (v: string) => v;

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  businessName,
  businessAddress,
  businessPhone,
  title,
  generatedAt,
  period,
  lines,
  totals,
  status,
  subStatus,
  footer,
  onPrint,
  onWhatsApp,
  className = '',
}) => {
  return (
    <div className={`receipt-card ${className}`}>
      {/* Encabezado */}
      <div className="receipt-header">
        <div className="receipt-business-name">{businessName}</div>
        {businessAddress && <div className="receipt-meta-line">{businessAddress}</div>}
        {businessPhone && <div className="receipt-meta-line">{businessPhone}</div>}
      </div>

      <div className="receipt-separator" />

      {/* Título del reporte */}
      <div className="receipt-title">{title}</div>

      {/* Metadatos */}
      {(generatedAt || period) && (
        <div className="receipt-period-block">
          {generatedAt && <div className="receipt-meta-line">Generado: {generatedAt}</div>}
          {period && <div className="receipt-meta-line">Periodo: {period}</div>}
        </div>
      )}

      <div className="receipt-separator" />

      {/* Cuerpo */}
      <div className="receipt-body">
        {lines.map((line, i) => {
          if (line.separator) return <div key={i} className="receipt-separator" />;
          if (line.fullRow) return (
            <div key={i} className={`receipt-full-row ${line.dim ? 'dim' : ''} ${line.indent ? 'indent' : ''}`}>
              {line.label}
            </div>
          );
          return (
            <div
              key={i}
              className={`receipt-line ${line.indent ? 'indent' : ''} ${line.dim ? 'dim' : ''} ${line.bold ? 'bold' : ''}`}
            >
              <span className="receipt-line-label">{fmt(line.label)}</span>
              {line.value !== undefined && (
                <span className="receipt-line-value">{fmt(line.value)}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Totales */}
      {totals && totals.length > 0 && (
        <>
          <div className="receipt-separator" />
          <div className="receipt-totals">
            {totals.map((line, i) => (
              <div key={i} className={`receipt-line bold ${line.dim ? 'dim' : ''}`}>
                <span className="receipt-line-label">{fmt(line.label)}</span>
                {line.value !== undefined && (
                  <span className="receipt-line-value">{fmt(line.value)}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Estado / Semáforo */}
      {status && (
        <>
          <div className="receipt-separator" />
          <div className={`receipt-status receipt-status-${status.variant}`}>
            {status.label}
          </div>
          {subStatus && <div className="receipt-sub-status">{subStatus}</div>}
        </>
      )}

      {/* Pie */}
      {footer && (
        <>
          <div className="receipt-separator" />
          <div className="receipt-footer">{footer}</div>
        </>
      )}

      <div className="receipt-end">* * *</div>

      {/* Acciones */}
      {(onPrint || onWhatsApp) && (
        <div className="receipt-actions">
          {onPrint && (
            <button type="button" className="receipt-action-btn" onClick={onPrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimir
            </button>
          )}
          {onWhatsApp && (
            <button type="button" className="receipt-action-btn receipt-action-whatsapp" onClick={onWhatsApp}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              WhatsApp
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptCard;
