import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionProveedores from '../../components/proveedores/GestionProveedores/GestionProveedores';
import { ArrowLeft } from 'lucide-react';
import './ConfigProveedores.css';

export const ConfigProveedores: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = Number(localStorage.getItem('idnegocio')) || 1;

  const handleVolver = () => {
    navigate('/dashboard');
  };

  return (
    <div className="config-proveedores-page">
      <button className="btn-volver" onClick={handleVolver}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      
      <div className="config-proveedores-content">
        <GestionProveedores idnegocio={idnegocio} />
      </div>
    </div>
  );
};

export default ConfigProveedores;
