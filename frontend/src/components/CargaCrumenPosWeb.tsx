import React, { useEffect, useState } from 'react';
import './CargaCrumenPosWeb.css';
import './FormularioDeAccesoCrumenPosWeb.css';
import FormularioDeAccesoCrumenPosWeb from './FormularioDeAccesoCrumenPosWeb';

interface Props {
  onTerminado?: () => void; // opcional
}

const CargaCrumenPosWeb: React.FC<Props> = ({ onTerminado }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  
 useEffect(() => {
    const timeout = setTimeout(() => {
      setMostrarFormulario(true); // después de 3s, mostrar el formulario
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);



  return (
    <div className="carga-crumen-container">
      <header className="header-crumen">
        {'POS54N WEB'.split('').map((letra, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.2}s` }}>
            {letra}
          </span>
        ))}
      </header>

<div className="formulario-acceso">
      {!mostrarFormulario ? (
        <div></div>
      ) : (
        <div >
          Acceso al Sistema<FormularioDeAccesoCrumenPosWeb
            onAccesoExitoso={() => alert('Acceso exitoso!')}
          />
        </div>
      )}
    </div>
    

      <footer className="footer-crumen">
        por CRUMEN, © Derechos reservados.
      </footer>
    </div>
  );
};

export default CargaCrumenPosWeb;
