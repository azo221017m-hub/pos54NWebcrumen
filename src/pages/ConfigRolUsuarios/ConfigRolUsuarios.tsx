import { GestionRoles } from '../../components/roles/GestionRoles/GestionRoles';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import './ConfigRolUsuarios.css';

export const ConfigRolUsuarios = () => {
  const navigate = useNavigate();
  const [mostrarBotonVolver, setMostrarBotonVolver] = useState(true);

  const handleVistaChange = (vista: 'lista' | 'formulario') => {
    // Mostrar botón solo cuando está en vista de lista
    setMostrarBotonVolver(vista === 'lista');
  };

  return (
    <div className="config-roles-page">
      <div className="config-container">
        <div className="config-header">
          {mostrarBotonVolver && (
            <button 
              className="btn-volver"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
          )}
          <h1 className="config-title">Configuración de Roles de Usuarios</h1>
        </div>
        
        <GestionRoles onVistaChange={handleVistaChange} />
      </div>
    </div>
  );
};
