import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionGrupoMovimientos from '../../components/grupoMovimientos/GestionGrupoMovimientos/GestionGrupoMovimientos';
import { ArrowLeft } from 'lucide-react';
import './ConfigGrupoMovimientos.css';

const ConfigGrupoMovimientos: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = parseInt(localStorage.getItem('idnegocio') || '1');

  return (
    <div className="config-grupo-movimientos-page">
      <button className="btn-volver" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      <GestionGrupoMovimientos idnegocio={idnegocio} />
    </div>
  );
};

export default ConfigGrupoMovimientos;
