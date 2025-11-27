import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GestionUMCompra } from '../../components/umcompra/GestionUMCompra/GestionUMCompra';
import './ConfigUMCompra.css';

export const ConfigUMCompra: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="config-umcompra-page">
      <div className="config-umcompra-header">
        <button 
          className="btn-back" 
          onClick={() => navigate('/dashboard')}
          title="Volver al Dashboard"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1>Configuración de Unidades de Medida</h1>
      </div>

      <GestionUMCompra />
    </div>
  );
};
