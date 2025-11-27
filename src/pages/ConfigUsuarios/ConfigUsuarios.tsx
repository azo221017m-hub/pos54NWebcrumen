import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GestionUsuarios } from '../../components/usuarios/GestionUsuarios/GestionUsuarios';
import './ConfigUsuarios.css';

export const ConfigUsuarios: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="config-usuarios-page">
      <div className="config-usuarios-header">
        <button 
          className="btn-back" 
          onClick={() => navigate('/dashboard')}
          title="Volver al Dashboard"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1>Configuración de Usuarios</h1>
      </div>

      <GestionUsuarios />
    </div>
  );
};
