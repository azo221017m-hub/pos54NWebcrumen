import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionCategorias from '../../components/categorias/GestionCategorias/GestionCategorias';
import { ArrowLeft } from 'lucide-react';
import './ConfigCategorias.css';

const ConfigCategorias: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="config-categorias-page">
      <button className="btn-volver" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Volver al Dashboard
      </button>
      <GestionCategorias />
    </div>
  );
};

export default ConfigCategorias;
