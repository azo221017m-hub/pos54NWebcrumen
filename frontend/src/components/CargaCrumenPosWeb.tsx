import React, { useEffect, useState } from 'react';
import './CargaCrumenPosWeb.css';
import FormularioDeAccesoCrumenPosWeb from './FormularioDeAccesoCrumenPosWeb';

interface Props {
  onTerminado?: () => void; // opcional, se ejecuta al terminar la carga
}

const CargaCrumenPosWeb: React.FC<Props> = ({ onTerminado }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMostrarFormulario(true); // después de 3s, mostrar el formulario
      if (onTerminado) onTerminado();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onTerminado]);

  return (
    <div className="carga-crumen-container">
      <header className="header-crumen">
        {'POS54N WEB'.split('').map((letra, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.2}s` }}>
            {letra}
          </span>
        ))}
      </header>

      <main className="formulario-acceso">
        {mostrarFormulario ? (
          <div className="acceso-contenedor">
            <h2>Acceso al Sistema</h2>
            <FormularioDeAccesoCrumenPosWeb
              onAccesoExitoso={() => alert('Acceso exitoso!')}
            />
          </div>
        ) : (
          <div className="placeholder-formulario"></div>
        )}
      </main>

      <footer className="footer-crumen">
        por CRUMEN, © Derechos reservados.
      </footer>
    </div>
  );
};

export default CargaCrumenPosWeb;
