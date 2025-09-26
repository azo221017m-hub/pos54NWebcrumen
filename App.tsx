// src/App.tsx
import React, { useState, useEffect } from 'react';
import FormularioDeAccesoCrumenPosWeb from './frontend/src/components/FormularioDeAccesoCrumenPosWeb';
import './App.css'; // Asegúrate de tener los estilos aquí
import LogoCrumen from '../assets/logocrumen.svg';






const App: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const frases = [
    "Punto de venta web ligero para negocios locales",
    "Vende más y administra fácil con CrumenPOS",
    "Tu negocio más ágil con nuestro POS digital"
  ];
  const [fraseActual, setFraseActual] = useState(frases[0]);

  useEffect(() => {
    // Elegir aleatoriamente una frase al cargar el componente
    const indice = Math.floor(Math.random() * frases.length);
    setFraseActual(frases[indice]);

    // Mostrar formulario tras 4 segundos
    const timer = setTimeout(() => setMostrarFormulario(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccesoExitoso = () => {
    console.log("¡Usuario ha iniciado sesión!");
    // Aquí podrías redirigir o mostrar la app principal
  };

 


  return (
    <div className="app-container">
      {!mostrarFormulario ? (
        <main className="splash">
          <img src={LogoCrumen} alt="Logo CRUMEN" className="logo" />
          <h1 className="brand">CrumenPOS</h1>
          <p className="tagline">{fraseActual}</p>
          <div className="loader" aria-hidden="true"></div>
        </main>
      ) : (
        <div className="formulario-container">
          <FormularioDeAccesoCrumenPosWeb onAccesoExitoso={handleAccesoExitoso} />
        </div>
      )}
    </div>
  );
};

export default App;
