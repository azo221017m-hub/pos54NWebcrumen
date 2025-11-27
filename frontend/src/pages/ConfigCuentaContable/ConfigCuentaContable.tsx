import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionCuentasContables from '../../components/cuentasContables/GestionCuentasContables/GestionCuentasContables';
import { ArrowLeft } from 'lucide-react';
import './ConfigCuentaContable.css';

const ConfigCuentaContable: React.FC = () => {
  const navigate = useNavigate();
  const idnegocio = parseInt(localStorage.getItem('idnegocio') || '1');

  return (
    <div className="config-cuenta-contable-page">
      <button className="btn-volver" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      <GestionCuentasContables idnegocio={idnegocio} />
    </div>
  );
};

export default ConfigCuentaContable;
