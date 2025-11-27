import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionMesas from '../../components/mesas/GestionMesas/GestionMesas';
import { ArrowLeft } from 'lucide-react';
import './ConfigMesas.css';

const ConfigMesas: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  return (
    <div className="config-mesas-page">
      <button className="btn-volver" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      <GestionMesas idnegocio={idnegocio} />
    </div>
  );
};

export default ConfigMesas;
