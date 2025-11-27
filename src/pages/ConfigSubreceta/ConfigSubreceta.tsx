import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GestionSubrecetas from '../../components/subrecetas/GestionSubrecetas/GestionSubrecetas';
import './ConfigSubreceta.css';

const ConfigSubreceta: React.FC = () => {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate('/dashboard');
  };

  return (
    <div className="config-subreceta-page">
      <button className="btn-volver" onClick={handleVolver}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      
      <GestionSubrecetas />
    </div>
  );
};

export default ConfigSubreceta;
