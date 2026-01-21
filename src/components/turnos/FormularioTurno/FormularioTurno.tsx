import React, { useState } from 'react';
import type { Turno, TurnoUpdate } from '../../../types/turno.types';
import { EstatusTurno } from '../../../types/turno.types';
import { Clock, X, Save } from 'lucide-react';
import './FormularioTurno.css';

interface FormularioTurnoProps {
  turnoInicial?: Turno;
  onSubmit: (turno: TurnoUpdate) => void;
  onCancel: () => void;
}

const FormularioTurno: React.FC<FormularioTurnoProps> = ({ 
  turnoInicial, 
  onSubmit, 
  onCancel
}) => {
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnoInicial) return;

    setProcesando(true);
    
    try {
      // Solo permitir cerrar turnos
      const turnoUpdate: TurnoUpdate = {
        estatusturno: EstatusTurno.CERRADO
      };

      await onSubmit(turnoUpdate);
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (fecha: string | null): string => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <Clock size={28} className="modal-icon" />
            <div>
              <h2>Cerrar Turno</h2>
              <p>Confirma el cierre del turno actual</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="btn-cerrar-modal"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {turnoInicial && (
              <div className="turno-detalles">
                <div className="detalle-item">
                  <span className="detalle-label">Número de Turno:</span>
                  <span className="detalle-value">#{turnoInicial.numeroturno}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Clave:</span>
                  <span className="detalle-value detalle-mono">{turnoInicial.claveturno}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Usuario:</span>
                  <span className="detalle-value">{turnoInicial.usuarioturno}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Fecha de Inicio:</span>
                  <span className="detalle-value">{formatearFecha(turnoInicial.fechainicioturno)}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Estatus Actual:</span>
                  <span className={`badge ${turnoInicial.estatusturno === EstatusTurno.ABIERTO ? 'badge-abierto' : 'badge-cerrado'}`}>
                    {turnoInicial.estatusturno === EstatusTurno.ABIERTO ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>

                <div className="alerta-cierre">
                  <p>⚠️ Al cerrar este turno, se registrará la fecha y hora de cierre. Esta acción no se puede deshacer.</p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancelar"
              disabled={procesando}
            >
              <X size={20} />
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={procesando || turnoInicial?.estatusturno === EstatusTurno.CERRADO}
            >
              <Save size={20} />
              {procesando ? 'Cerrando...' : 'Cerrar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioTurno;
