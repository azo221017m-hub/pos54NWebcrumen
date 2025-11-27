import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionModeradores from '../../components/moderadores/GestionModeradores/GestionModeradores';
import { ArrowLeft } from 'lucide-react';
import './ConfigModeradores.css';

const ConfigModeradores: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = parseInt(localStorage.getItem('idnegocio') || '1');

  return (
    <div className="config-moderadores-page">
      <button className="btn-volver" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      <GestionModeradores idnegocio={idnegocio} />
    </div>
  );
};

export default ConfigModeradores;
