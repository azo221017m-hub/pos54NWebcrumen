import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PantallaPresentacion.css';

const frases = [
  "Gestiona tus ventas de forma eficiente",
  "Controla tu inventario en tiempo real",
  "Optimiza la relación con tus clientes",
  "Genera reportes y análisis de tu negocio",
  "Tu punto de venta inteligente y seguro"
];

const PantallaPresentacion: React.FC = () => {
  const [fraseActual, setFraseActual] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseActual((prevFrase) => {
        if (prevFrase < frases.length - 1) {
          return prevFrase + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/tablero');
          }, 3000);
          return prevFrase;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="presentacion-container">
      <div className="logo-container">
        <img src="/logotipoSistema.png" alt="Logotipo del Sistema" className="logo" />
      </div>
      <div className="frases-container">
        <p className="frase">{frases[fraseActual]}</p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default PantallaPresentacion;
