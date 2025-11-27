import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionClientes from '../../components/clientes/GestionClientes/GestionClientes';
import { ArrowLeft } from 'lucide-react';
import './ConfigClientes.css';

export const ConfigClientes: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const handleVolver = () => {
    navigate('/dashboard');
  };

  return (
    <div className="config-clientes-page">
      <button className="btn-volver" onClick={handleVolver}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      
      <div className="config-clientes-content">
        <GestionClientes idnegocio={idnegocio} />
      </div>
    </div>
  );
};

export default ConfigClientes;
