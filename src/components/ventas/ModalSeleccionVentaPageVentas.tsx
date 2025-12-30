import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TipoServicio } from '../../types/mesa.types';
import './ModalSeleccionVentaPageVentas.css';

interface ModalSeleccionVentaPageVentasProps {
  isOpen: boolean;
  onTipoVentaSelect: (tipoVenta: TipoServicio) => void;
}

const ModalSeleccionVentaPageVentas: React.FC<ModalSeleccionVentaPageVentasProps> = ({ 
  isOpen, 
  onTipoVentaSelect 
}) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleTipoVentaSelect = (tipoVenta: TipoServicio) => {
    onTipoVentaSelect(tipoVenta);
    // Don't call onClose() here - the parent's onTipoVentaSelect already handles modal state
  };

  const handleOverlayClick = () => {
    // Navigate to Dashboard when clicking outside the modal
    navigate('/dashboard');
  };

  return (
    <div className="modal-seleccion-venta-pageventas-overlay" onClick={handleOverlayClick}>
      <div className="modal-seleccion-venta-pageventas-content floating" onClick={(e) => e.stopPropagation()}>
        <div className="modal-seleccion-venta-pageventas-header">
          <h2>SELECCIONE tipo de VENTA</h2>
        </div>
        
        <div className="modal-seleccion-venta-pageventas-body">
          <button 
            className="btn-tipo-venta-pv btn-domicilio-pv"
            onClick={() => handleTipoVentaSelect('Domicilio')}
          >
            <div className="tipo-venta-icon-pv">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="tipo-venta-label-pv">DOMICILIO</span>
          </button>

          <button 
            className="btn-tipo-venta-pv btn-llevar-pv"
            onClick={() => handleTipoVentaSelect('Llevar')}
          >
            <div className="tipo-venta-icon-pv">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span className="tipo-venta-label-pv">LLEVAR</span>
          </button>

          <button 
            className="btn-tipo-venta-pv btn-mesa-pv"
            onClick={() => handleTipoVentaSelect('Mesa')}
          >
            <div className="tipo-venta-icon-pv">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="12" rx="2"/>
                <line x1="8" y1="8" x2="8" y2="4"/>
                <line x1="16" y1="8" x2="16" y2="4"/>
              </svg>
            </div>
            <span className="tipo-venta-label-pv">MESA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionVentaPageVentas;
