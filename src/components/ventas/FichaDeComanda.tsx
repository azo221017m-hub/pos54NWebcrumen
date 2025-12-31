import React from 'react';
import { Home, ShoppingBag, Users } from 'lucide-react';
import type { TipoServicio } from '../../types/mesa.types';
import type { MesaFormData, LlevarFormData, DomicilioFormData } from './ModalTipoServicio';
import './FichaDeComanda.css';

interface FichaDeComandaProps {
  tipoServicio: TipoServicio;
  mesaData?: MesaFormData | null;
  llevarData?: LlevarFormData | null;
  domicilioData?: DomicilioFormData | null;
  isServiceConfigured: boolean;
}

const FichaDeComanda: React.FC<FichaDeComandaProps> = ({
  tipoServicio,
  mesaData,
  llevarData,
  domicilioData,
  isServiceConfigured
}) => {
  if (!isServiceConfigured) {
    return (
      <div className="ficha-de-comanda empty">
        <span className="ficha-empty-text">Configurar Servicio</span>
      </div>
    );
  }

  const getIcon = () => {
    switch (tipoServicio) {
      case 'Domicilio':
        return <Home size={18} />;
      case 'Llevar':
        return <ShoppingBag size={18} />;
      case 'Mesa':
        return <Users size={18} />;
      default:
        return null;
    }
  };

  const getServiceInfo = () => {
    if (tipoServicio === 'Mesa' && mesaData) {
      return (
        <>
          <span className="ficha-label">Mesa:</span>
          <span className="ficha-value">{mesaData.nombremesa}</span>
        </>
      );
    } else if (tipoServicio === 'Llevar' && llevarData) {
      return (
        <>
          <span className="ficha-label">Cliente:</span>
          <span className="ficha-value">{llevarData.cliente}</span>
          {llevarData.fechaprogramadaventa && (
            <>
              <span className="ficha-separator">|</span>
              <span className="ficha-label">Entrega:</span>
              <span className="ficha-value">
                {(() => {
                  try {
                    const date = new Date(llevarData.fechaprogramadaventa);
                    if (isNaN(date.getTime())) return 'Fecha inválida';
                    return date.toLocaleString('es-MX', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  } catch {
                    return 'Fecha inválida';
                  }
                })()}
              </span>
            </>
          )}
        </>
      );
    } else if (tipoServicio === 'Domicilio' && domicilioData) {
      return (
        <>
          <span className="ficha-label">Cliente:</span>
          <span className="ficha-value">{domicilioData.cliente}</span>
          <span className="ficha-separator">|</span>
          <span className="ficha-label">Tel:</span>
          <span className="ficha-value">{domicilioData.telefonodeentrega}</span>
          {domicilioData.fechaprogramadaventa && (
            <>
              <span className="ficha-separator">|</span>
              <span className="ficha-label">Entrega:</span>
              <span className="ficha-value">
                {(() => {
                  try {
                    const date = new Date(domicilioData.fechaprogramadaventa);
                    if (isNaN(date.getTime())) return 'Fecha inválida';
                    return date.toLocaleString('es-MX', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  } catch {
                    return 'Fecha inválida';
                  }
                })()}
              </span>
            </>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div className="ficha-de-comanda">
      <div className="ficha-icon">
        {getIcon()}
      </div>
      <div className="ficha-tipo">
        <span className="ficha-tipo-text">{tipoServicio}</span>
      </div>
      <div className="ficha-info">
        {getServiceInfo()}
      </div>
    </div>
  );
};

export default FichaDeComanda;
