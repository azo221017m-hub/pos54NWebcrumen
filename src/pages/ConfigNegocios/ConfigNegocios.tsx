import { useState } from 'react';
import { GestionNegocios } from '../../components/negocios/GestionNegocios/GestionNegocios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './ConfigNegocios.css';

export const ConfigNegocios = () => {
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState<'lista' | 'formulario' | 'detalle'>('lista');

  return (
    <div className="config-negocios-page">
      <div className="config-container">
        <div className="config-header">
          {vistaActual === 'lista' && (
            <button 
              className="btn-volver"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
          )}
          <h1 className="config-title">Configuración de Negocios</h1>
        </div>
        
        <GestionNegocios onVistaChange={setVistaActual} />
      </div>
    </div>
  );
};
