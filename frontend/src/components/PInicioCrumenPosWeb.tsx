import React, { useEffect, useState } from 'react';
import './PInicioCrumenPosWeb.css';
import FormularioDeAccesoCrumenPosWeb from './FormularioDeAccesoCrumenPosWeb';

interface Props {
  onEntrarVenta: () => void;
}

const PInicioCrumenPosWeb: React.FC<Props> = ({ onEntrarVenta }) => {
  const [mostrarLogoIzq, setMostrarLogoIzq] = useState(true); // mostrar logo inmediatamente
  const [mostrarFantasma, setMostrarFantasma] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(true); // formulario visible inmediatamente

  useEffect(() => {
    // solo animar fantasma si quieres
    const t1 = setTimeout(() => setMostrarFantasma(true), 3000);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="pinicio-contenedor">
      <header className="pinicio-header">
        <img
          src="/assets/logocrumenposweb.svg"
          className={`logocrumenposweb ${mostrarLogoIzq ? 'entrando' : ''}`}
          alt="logo-izq"
        />
        {mostrarFantasma && (
          <img
            src="/assets/logoposcrumenposweb.svg"
            className="logopos-fantasma"
            alt="logo-centro"
          />
        )}
      </header>

      <main className="pinicio-main">
        <FormularioDeAccesoCrumenPosWeb onAccesoExitoso={onEntrarVenta} />
      </main>
    </div>
  );
};

export default PInicioCrumenPosWeb;
