import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionDescuentos from '../../components/descuentos/GestionDescuentos/GestionDescuentos';
import { ArrowLeft } from 'lucide-react';
import './ConfigDescuentos.css';

const ConfigDescuentos: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  return (
    <div className="config-descuentos-page">
      <button className="btn-volver" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      <GestionDescuentos idnegocio={idnegocio} />
    </div>
  );
};

export default ConfigDescuentos;
