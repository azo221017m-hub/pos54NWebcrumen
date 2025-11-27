import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionInsumos from '../../components/insumos/GestionInsumos/GestionInsumos';
import { ArrowLeft } from 'lucide-react';
import './ConfigInsumos.css';

export const ConfigInsumos: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const handleVolver = () => {
    navigate('/dashboard');
  };

  return (
    <div className="config-insumos-page">
      <button className="btn-volver" onClick={handleVolver}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      
      <div className="config-insumos-content">
        <GestionInsumos idnegocio={idnegocio} />
      </div>
    </div>
  );
};

export default ConfigInsumos;
